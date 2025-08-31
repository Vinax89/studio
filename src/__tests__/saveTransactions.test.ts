import { saveTransactions } from "../lib/transactions";

vi.mock("../lib/firebase", () => ({ db: {}, initFirebase: vi.fn() }));
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

const mockSet = vi.fn();
const mockCommit = vi.fn();
const mockWriteBatch = vi.fn(() => ({ set: mockSet, commit: mockCommit }));
const mockDoc = vi.fn(() => ({}));
const mockCollection = vi.fn(() => ({}));

vi.mock("firebase/firestore", () => ({
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
    vi.clearAllMocks();
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
      "Failed to save transactions batch: commit failed"
    );
  });
});

