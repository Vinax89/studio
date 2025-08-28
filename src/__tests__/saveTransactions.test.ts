import { saveTransactions } from "../lib/transactions";

jest.mock("../lib/firebase", () => ({ db: {} }));

const mockSet = jest.fn();
const mockCommit = jest.fn();
const mockWriteBatch = jest.fn(() => ({ set: mockSet, commit: mockCommit }));
const mockDoc = jest.fn(() => ({}));
const mockCollection = jest.fn();

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
      "Failed to save transactions batch: commit failed"
    );
  });
});

