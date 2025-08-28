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

  it("adds all transactions in a single batch and commits once", async () => {
    await saveTransactions(transactions);
    expect(mockSet).toHaveBeenCalledTimes(transactions.length);
    expect(mockCommit).toHaveBeenCalledTimes(1);
  });

  it("throws detailed error when commit fails", async () => {
    mockCommit.mockRejectedValueOnce(new Error("commit failed"));
    await expect(saveTransactions(transactions)).rejects.toThrow(
      "Failed to save transactions batch: commit failed",
    );
  });
});
