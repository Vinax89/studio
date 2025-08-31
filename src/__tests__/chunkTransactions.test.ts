import { chunkTransactions } from "../lib/transactions";

describe("chunkTransactions", () => {
  it.each([0, -1])("throws for non-positive chunkSize %i", (size) => {
    expect(() => chunkTransactions([1, 2], size)).toThrow(
      /chunkSize must be greater than 0/
    );
  });

  it("splits large arrays into default-size chunks", () => {
    const arr = Array.from({ length: 1500 }, (_, i) => i);
    const chunks = chunkTransactions(arr);
    expect(chunks).toHaveLength(3);
    chunks.forEach((chunk) => expect(chunk).toHaveLength(500));
    expect(chunks.flat()).toEqual(arr);
  });
});
