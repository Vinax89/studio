import { saveTransactions } from "../lib/transactions";

jest.mock("../lib/firebase", () => ({ db: {}, initFirebase: jest.fn() }));
import { initFirebase } from "../lib/firebase";

beforeAll(() => {
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "test";
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = "test";
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "test";
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = "test";
  process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = "test";
  process.env.NEXT_PUBLIC_FIREBASE_APP_ID = "test";
  initFirebase();
});

const mockSet = jest.fn();
const mockDelete = jest.fn();
const mockCommit = jest.fn();
const mockWriteBatch = jest.fn(() => ({
  set: mockSet,
  delete: mockDelete,
  commit: mockCommit,
}));
const mockDoc = jest.fn(() => ({}));
const mockCollection = jest.fn(() => ({}));

jest.mock("firebase/firestore", () => ({
  writeBatch: (...args: unknown[]) => mockWriteBatch(...args),
  doc: (...args: unknown[]) => mockDoc(...args),
  collection: (...args: unknown[]) => mockCollection(...args),
}));

const transactions = [
  {
    id: "1",
    date: "2024-01-01",
    description: "Test1",
    amount: 100,
    type: "Income" as const,
    category: "Misc",
    currency: "USD",
    isRecurring: false,
  },
  {
    id: "2",
    date: "2024-01-02",
    description: "Test2",
    amount: 200,
    type: "Expense" as const,
    category: "Misc",
    currency: "USD",
    isRecurring: false,
  },
];

describe("saveTransactions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCommit.mockResolvedValue(undefined);
  });

  it("adds all transactions in a single batch and commits once when within limit", async () => {
    await saveTransactions(transactions);
    expect(mockSet).toHaveBeenCalledTimes(transactions.length);
    expect(mockWriteBatch).toHaveBeenCalledTimes(1);
    expect(mockCommit).toHaveBeenCalledTimes(1);
    expect(mockDoc).toHaveBeenNthCalledWith(1, expect.anything(), "1");
    expect(mockDoc).toHaveBeenNthCalledWith(2, expect.anything(), "2");
  });

  it("splits transactions into multiple batches when over 500", async () => {
    const manyTransactions = Array.from({ length: 501 }, (_, i) => ({
      id: String(i),
      date: "2024-01-01",
      description: `Test${i}`,
      amount: i,
      type: "Income" as const,
      category: "Misc",
      currency: "USD",
      isRecurring: false,
    }));

    await saveTransactions(manyTransactions);
    expect(mockSet).toHaveBeenCalledTimes(manyTransactions.length);
    // Should create and commit two batches for 501 items
    expect(mockWriteBatch).toHaveBeenCalledTimes(2);
    expect(mockCommit).toHaveBeenCalledTimes(2);
  });

  it("throws detailed error when commit fails", async () => {
    mockCommit.mockRejectedValueOnce(new Error("commit failed"));
    await expect(saveTransactions(transactions)).rejects.toThrow(
      "Failed to save transactions batch(es) 1: commit failed"
    );
  });

  it("rolls back successfully written batches when a later commit fails", async () => {
    const manyTransactions = Array.from({ length: 501 }, (_, i) => ({
      id: String(i),
      date: "2024-01-01",
      description: `Test${i}`,
      amount: i,
      type: "Income" as const,
      category: "Misc",
      currency: "USD",
      isRecurring: false,
    }));

    mockCommit
      .mockResolvedValueOnce(undefined) // first chunk commit
      .mockRejectedValueOnce(new Error("commit failed")) // second chunk commit
      .mockResolvedValueOnce(undefined); // rollback delete commit

    await expect(saveTransactions(manyTransactions)).rejects.toThrow(
      "Failed to save transactions batch(es) 2: commit failed"
    );

    // initial two write batches + one rollback batch
    expect(mockWriteBatch).toHaveBeenCalledTimes(3);
    // delete called for every transaction in successful chunk
    expect(mockDelete).toHaveBeenCalledTimes(500);
    // total commits: 2 for writes + 1 for rollback
    expect(mockCommit).toHaveBeenCalledTimes(3);
  });
});

