import { parallelSquare } from "../lib/parallel"

describe("parallelSquare", () => {
  it("computes squares in parallel", async () => {
    const result = await parallelSquare([1, 2, 3, 4])
    expect(result.sort((a, b) => a - b)).toEqual([1, 4, 9, 16])
  })

  it("limits thread count to numbers length", async () => {
    const result = await parallelSquare([1, 2], 10)
    expect(result.sort((a, b) => a - b)).toEqual([1, 4])
  })

  it("handles empty input", async () => {
    const result = await parallelSquare([])
    expect(result).toEqual([])
  })
})
