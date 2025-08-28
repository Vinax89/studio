process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test';
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test';
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test';
process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'test';
process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 'test';
process.env.NEXT_PUBLIC_FIREBASE_APP_ID = 'test';

const dataStore: Record<string, Map<string, any>> = {
  transactions: new Map(),
  transactions_archive: new Map(),
  debts: new Map(),
  goals: new Map(),
  backups: new Map(),
};

jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({})),
  getApps: jest.fn(() => []),
  getApp: jest.fn(() => ({})),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  collection: (_db: any, name: string) => ({ name }),
  doc: (_db: any, name: string, id: string) => ({ name, id }),
  getDocs: jest.fn(async (colRef: any) => ({
    docs: Array.from(dataStore[colRef.name].entries()).map(([id, data]) => ({
      id,
      data: () => data,
    })),
  })),
  setDoc: jest.fn(async (docRef: any, data: any) => {
    dataStore[docRef.name].set(docRef.id, data);
  }),
  deleteDoc: jest.fn(async (docRef: any) => {
    dataStore[docRef.name].delete(docRef.id);
  }),
  addDoc: jest.fn(async (colRef: any, data: any) => {
    const id = Math.random().toString(36).slice(2);
    dataStore[colRef.name].set(id, data);
    return { id };
  }),
  __dataStore: dataStore,
}));

const { archiveOldTransactions, cleanupDebts, backupData, runWithRetry } = require('../services/housekeeping');
const firestore = require('firebase/firestore');
const store = firestore.__dataStore as typeof dataStore;

beforeEach(() => {
  for (const col of Object.values(store)) {
    col.clear();
  }
});

describe('housekeeping services', () => {
  test('archiveOldTransactions moves old records', async () => {
    store.transactions.set('t1', {
      id: 't1',
      date: '2020-01-01',
      description: 'old',
      amount: 1,
      type: 'Income',
      category: 'Salary',
    });
    store.transactions.set('t2', {
      id: 't2',
      date: '2024-01-01',
      description: 'new',
      amount: 2,
      type: 'Expense',
      category: 'Food',
    });

    await archiveOldTransactions('2021-01-01');

    expect(store.transactions.has('t1')).toBe(false);
    expect(store.transactions.has('t2')).toBe(true);
    expect(store.transactions_archive.has('t1')).toBe(true);
  });

  test('cleanupDebts removes settled debts', async () => {
    store.debts.set('d1', {
      id: 'd1',
      name: 'Paid',
      initialAmount: 100,
      currentAmount: 0,
      interestRate: 0,
      minimumPayment: 0,
      dueDate: '2024-01-01',
      recurrence: 'none',
      autopay: false,
    });
    store.debts.set('d2', {
      id: 'd2',
      name: 'Active',
      initialAmount: 100,
      currentAmount: 50,
      interestRate: 0,
      minimumPayment: 0,
      dueDate: '2024-01-01',
      recurrence: 'none',
      autopay: false,
    });

    await cleanupDebts();

    expect(store.debts.has('d1')).toBe(false);
    expect(store.debts.has('d2')).toBe(true);
  });

  test('backupData stores snapshot', async () => {
    store.transactions.set('t1', {
      id: 't1',
      date: '2024-01-01',
      description: 'test',
      amount: 1,
      type: 'Income',
      category: 'Salary',
    });
    store.debts.set('d1', {
      id: 'd1',
      name: 'Debt',
      initialAmount: 100,
      currentAmount: 50,
      interestRate: 0,
      minimumPayment: 0,
      dueDate: '2024-01-01',
      recurrence: 'none',
      autopay: false,
    });
    store.goals.set('g1', {
      id: 'g1',
      name: 'Goal',
      targetAmount: 100,
      currentAmount: 10,
      deadline: '2024-12-31',
      importance: 3,
    });

    const backup = await backupData();

    expect(backup.transactions).toHaveLength(1);
    expect(backup.debts).toHaveLength(1);
    expect(backup.goals).toHaveLength(1);
    expect(store.backups.size).toBe(1);
  });
});

describe('runWithRetry', () => {
  test('retries with exponential backoff and logs errors', async () => {
    jest.useFakeTimers();
    const setTimeoutSpy = jest.spyOn(global, 'setTimeout');

    const op = jest
      .fn()
      .mockRejectedValueOnce(new Error('fail1'))
      .mockRejectedValueOnce(new Error('fail2'))
      .mockResolvedValue('ok');

    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const promise = runWithRetry(op, 2, 1000);

    // allow first rejection to be processed
    await Promise.resolve();

    expect(setTimeoutSpy).toHaveBeenNthCalledWith(1, expect.any(Function), 1000);
    expect(consoleSpy).toHaveBeenNthCalledWith(
      1,
      'Attempt 1 failed:',
      expect.any(Error)
    );

    await jest.advanceTimersByTimeAsync(1000);
    await Promise.resolve();

    expect(setTimeoutSpy).toHaveBeenNthCalledWith(2, expect.any(Function), 2000);
    expect(consoleSpy).toHaveBeenNthCalledWith(
      2,
      'Attempt 2 failed:',
      expect.any(Error)
    );

    await jest.advanceTimersByTimeAsync(2000);

    await expect(promise).resolves.toBe('ok');
    expect(op).toHaveBeenCalledTimes(3);
    expect(consoleSpy).toHaveBeenCalledTimes(2);

    setTimeoutSpy.mockRestore();
    consoleSpy.mockRestore();
    jest.useRealTimers();
  });
});

