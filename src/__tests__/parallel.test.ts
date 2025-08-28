import { parallelSquare } from "../lib/parallel"
import { WorkerPool } from "../lib/worker-pool"
import path from "node:path"
import fs from "node:fs"

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

  it("recovers from worker failure", async () => {
    const file = path.join(__dirname, "crash-worker.js")
    const flag = path.join(__dirname, "crash-flag")
    fs.writeFileSync(flag, "")

    const pool = new WorkerPool<number[], number[]>(file, 1)
    const result = await pool.run([1, 2])
    expect(result.sort((a, b) => a - b)).toEqual([1, 4])
    await pool.destroy()
  })
})
