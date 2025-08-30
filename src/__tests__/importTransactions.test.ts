import { importTransactions, invalidateCategoriesCache } from "../lib/transactions";
import { getDocs } from "firebase/firestore";

jest.mock("firebase/firestore", () => {
  const actual = jest.requireActual("firebase/firestore");
  return {
    ...actual,
    getDocs: jest.fn(),
  };
});

describe("importTransactions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    invalidateCategoriesCache();
  });

  it("throws a descriptive error when fetching categories fails", async () => {
    (getDocs as jest.Mock).mockRejectedValue(new Error("network failure"));
    await expect(importTransactions([])).rejects.toThrow(
      /Failed to fetch categories: network failure/
    );
  });

  it("uses cached categories to avoid extra Firestore reads", async () => {
    (getDocs as jest.Mock).mockResolvedValue({
      docs: [{ id: "food" }, { id: "rent" }],
    });

    await importTransactions([]);
    await importTransactions([]);

    expect(getDocs).toHaveBeenCalledTimes(1);
  });
});
