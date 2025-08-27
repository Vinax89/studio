import { parallelSquare } from "../lib/parallel"

describe("parallelSquare", () => {
  it("computes squares in parallel", async () => {
    const result = await parallelSquare([1, 2, 3, 4])
    expect(result.sort((a, b) => a - b)).toEqual([1, 4, 9, 16])
  })
})
