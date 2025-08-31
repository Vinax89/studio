import { importTransactions } from "../lib/transactions";
import { getDocs } from "firebase/firestore";
import { vi, type Mock } from "vitest";

vi.mock("firebase/firestore", async () => {
  const actual = await vi.importActual<typeof import("firebase/firestore")>(
    "firebase/firestore",
  );
  return {
    ...actual,
    getDocs: vi.fn(),
  };
});

describe("importTransactions", () => {
  it("throws a descriptive error when fetching categories fails", async () => {
    (getDocs as Mock).mockRejectedValue(new Error("network failure"));
    await expect(importTransactions([])).rejects.toThrow(
      /Failed to fetch categories: network failure/
    );
  });
});
