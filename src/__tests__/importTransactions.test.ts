import { importTransactions } from "../lib/transactions";
import { getDocs } from "firebase/firestore";

jest.mock("firebase/firestore", () => {
  const actual = jest.requireActual("firebase/firestore");
  return {
    ...actual,
    getDocs: jest.fn(),
  };
});

describe("importTransactions", () => {
  it("throws a descriptive error when fetching categories fails", async () => {
    (getDocs as jest.Mock).mockRejectedValue(new Error("network failure"));
    await expect(importTransactions([], "u1")).rejects.toThrow(
      /Failed to fetch categories: network failure/
    );
  });
});
