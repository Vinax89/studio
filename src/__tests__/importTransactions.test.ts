import {
  importTransactions,
  __clearCategoryCache,
  __CATEGORY_CACHE_TTL_MS,
} from "../lib/transactions";
import { getDocs } from "firebase/firestore";

jest.mock("firebase/firestore", () => {
  const actual = jest.requireActual("firebase/firestore");
  return {
    ...actual,
    getDocs: jest.fn(),
  };
});

describe("importTransactions", () => {
  afterEach(() => {
    jest.useRealTimers();
    __clearCategoryCache();
    jest.clearAllMocks();
  });

  it("throws a descriptive error when fetching categories fails", async () => {
    (getDocs as jest.Mock).mockRejectedValue(new Error("network failure"));
    await expect(importTransactions([])).rejects.toThrow(
      /Failed to fetch categories: network failure/
    );
  });

  it("refetches categories after TTL expiry", async () => {
    jest.useFakeTimers();
    (getDocs as jest.Mock).mockResolvedValue({ docs: [{ id: "Misc" }] });

    await importTransactions([]);
    await importTransactions([]);
    expect(getDocs).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(__CATEGORY_CACHE_TTL_MS + 1);
    await importTransactions([]);
    expect(getDocs).toHaveBeenCalledTimes(2);
  });
});
