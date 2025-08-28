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

jest.mock('firebase/firestore', () => {
  const where = (field: string, op: string, value: any) => ({
    type: 'where',
    field,
    op,
    value,
  });
  const orderBy = (field: string) => ({ type: 'orderBy', field });
  const limit = (n: number) => ({ type: 'limit', n });
  const startAfter = (doc: any) => ({ type: 'startAfter', doc });
  const query = (colRef: any, ...constraints: any[]) => ({ ...colRef, constraints });

  const getDocs = jest.fn(async (q: any) => {
    const colName = q.name;
    if (!dataStore[colName]) dataStore[colName] = new Map();
    let docs = Array.from(dataStore[colName].entries()).map(([id, data]) => ({
      id,
      data: () => data,
    }));

    const constraints = q.constraints || [];
    for (const c of constraints) {
      if (c.type === 'where') {
        docs = docs.filter((d) => {
          const val = d.data()[c.field];
          switch (c.op) {
            case '<':
              return val < c.value;
            case '<=':
              return val <= c.value;
            default:
              return true;
          }
        });
      }
    }

    const order = constraints.find((c: any) => c.type === 'orderBy');
    if (order) {
      docs.sort((a, b) => {
        const av = a.data()[order.field];
        const bv = b.data()[order.field];
        if (av > bv) return 1;
        if (av < bv) return -1;
        return 0;
      });
    }

    const start = constraints.find((c: any) => c.type === 'startAfter');
    if (start && order) {
      const startVal = start.doc.data()[order.field];
      docs = docs.filter((d) => d.data()[order.field] > startVal);
    }

    const lim = constraints.find((c: any) => c.type === 'limit');
    if (lim) {
      docs = docs.slice(0, lim.n);
    }

    return { docs, size: docs.length, empty: docs.length === 0 };
  });

  const writeBatch = jest.fn(() => {
    const ops: any[] = [];
    const batch = {
      set: (docRef: any, data: any) => {
        ops.push({ type: 'set', docRef, data });
      },
      delete: (docRef: any) => {
        ops.push({ type: 'delete', docRef });
      },
      commit: jest.fn(async () => {
        for (const op of ops) {
          if (!dataStore[op.docRef.name]) {
            dataStore[op.docRef.name] = new Map();
          }
          if (op.type === 'set') {
            dataStore[op.docRef.name].set(op.docRef.id, op.data);
          } else if (op.type === 'delete') {
            dataStore[op.docRef.name].delete(op.docRef.id);
          }
        }
        ops.length = 0;
      }),
    };
    return batch;
  });

  const addDoc = jest.fn(async (colRef: any, data: any) => {
    const id = Math.random().toString(36).slice(2);
    if (!dataStore[colRef.name]) dataStore[colRef.name] = new Map();
    dataStore[colRef.name].set(id, data);
    return { id };
  });

  return {
    getFirestore: jest.fn(() => ({})),
    collection: (_db: any, ...segments: string[]) => ({ name: segments.join('/') }),
    doc: (_db: any, ...segments: string[]) => ({
      name: segments.slice(0, -1).join('/'),
      id: segments[segments.length - 1],
    }),
    getDocs,
    addDoc,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    writeBatch,
    __dataStore: dataStore,
  };
});

const { archiveOldTransactions, cleanupDebts, backupData, runWithRetry } = require('../services/housekeeping');
const firestore = require('firebase/firestore');
const store = firestore.__dataStore as typeof dataStore;

beforeEach(() => {
  for (const col of Object.values(store)) {
    col.clear();
  }
  jest.clearAllMocks();
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
    const backupId = Array.from(store.backups.keys())[0];
    expect(store[`backups/${backupId}/transactions`].size).toBe(1);
    expect(store[`backups/${backupId}/debts`].size).toBe(1);
    expect(store[`backups/${backupId}/goals`].size).toBe(1);
    expect(firestore.writeBatch).toHaveBeenCalledTimes(3);
  });

  test('archiveOldTransactions handles large datasets efficiently', async () => {
    for (let i = 0; i < 250; i++) {
      const date = new Date(2020, 0, i + 1).toISOString().slice(0, 10);
      store.transactions.set(`o${i}`, {
        id: `o${i}`,
        date,
        description: 'old',
        amount: i,
        type: 'Income',
        category: 'Salary',
      });
    }
    for (let i = 0; i < 50; i++) {
      store.transactions.set(`n${i}`, {
        id: `n${i}`,
        date: '2024-01-01',
        description: 'new',
        amount: i,
        type: 'Expense',
        category: 'Food',
      });
    }

    await archiveOldTransactions('2021-01-01');

    expect(store.transactions.size).toBe(50);
    expect(store.transactions_archive.size).toBe(250);
    expect(firestore.writeBatch).toHaveBeenCalledTimes(3);
    expect(firestore.getDocs.mock.calls.length).toBe(3);
  });

  test('cleanupDebts handles large datasets efficiently', async () => {
    for (let i = 0; i < 250; i++) {
      store.debts.set(`z${i}`, {
        id: `z${i}`,
        name: 'Paid',
        initialAmount: 100,
        currentAmount: -i,
        interestRate: 0,
        minimumPayment: 0,
        dueDate: '2024-01-01',
        recurrence: 'none',
        autopay: false,
      });
    }
    for (let i = 0; i < 50; i++) {
      store.debts.set(`p${i}`, {
        id: `p${i}`,
        name: 'Active',
        initialAmount: 100,
        currentAmount: 50,
        interestRate: 0,
        minimumPayment: 0,
        dueDate: '2024-01-01',
        recurrence: 'none',
        autopay: false,
      });
    }

    await cleanupDebts();

    expect(store.debts.size).toBe(50);
    expect(firestore.writeBatch).toHaveBeenCalledTimes(3);
    expect(firestore.getDocs.mock.calls.length).toBe(3);
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

  test('logs final failure before throwing', async () => {
    jest.useFakeTimers();

    const op = jest.fn().mockImplementation(async () => {
      throw new Error('fail');
    });
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const promise = runWithRetry(op, 1, 1000);

    // allow first rejection to be processed
    await Promise.resolve();
    expect(consoleSpy).toHaveBeenNthCalledWith(
      1,
      'Attempt 1 failed:',
      expect.any(Error)
    );

    const expectation = expect(promise).rejects.toThrow('fail');
    await jest.advanceTimersByTimeAsync(1000);
    await expectation;
    expect(consoleSpy).toHaveBeenNthCalledWith(
      2,
      'Attempt 2 failed:',
      expect.any(Error)
    );
    expect(consoleSpy).toHaveBeenCalledTimes(2);

    consoleSpy.mockRestore();
    jest.useRealTimers();
  });
});

