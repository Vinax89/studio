import { chunkTransactions } from "../lib/transactions";

describe("chunkTransactions", () => {
  it.each([0, -1])("throws for non-positive chunkSize %i", (size) => {
    expect(() => chunkTransactions([1, 2], size)).toThrow(
      /chunkSize must be a positive integer/
    );
  });

  it("throws for non-integer chunkSize", () => {
    expect(() => chunkTransactions([1, 2], 2.5)).toThrow(
      /chunkSize must be a positive integer/
    );
  });
});
