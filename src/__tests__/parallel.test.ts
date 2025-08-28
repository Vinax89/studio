/**
 * @jest-environment node
 */

import ts from "typescript"
import { promises as fs } from "node:fs"
import os from "node:os"
import path from "node:path"

async function loadParallelSquare() {
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "parallel-"))

  const transpile = (source: string) =>
    ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2017,
        esModuleInterop: true,
      },
    }).outputText

  let parallelTs = await fs.readFile(path.join(__dirname, "../lib/parallel.ts"), "utf8")
  parallelTs = parallelTs.replace(
    /fileURLToPath\(new URL\("\.", import\.meta\.url\)\)/,
    "__dirname",
  )
  const workerTs = await fs.readFile(path.join(__dirname, "../lib/mapWorker.ts"), "utf8")
  const workerPoolTs = await fs.readFile(
    path.join(__dirname, "../lib/worker-pool.ts"),
    "utf8",
  )

  await fs.writeFile(path.join(tmp, "parallel.js"), transpile(parallelTs))
  await fs.writeFile(path.join(tmp, "mapWorker.js"), transpile(workerTs))
  await fs.writeFile(path.join(tmp, "worker-pool.js"), transpile(workerPoolTs))

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require(path.join(tmp, "parallel.js"))
  return mod.parallelSquare as (numbers: number[], threads?: number) => Promise<number[]>
}

describe("parallelSquare", () => {
  it("computes squares in parallel", async () => {
    const parallelSquare = await loadParallelSquare()
    const result = await parallelSquare([1, 2, 3, 4])
    expect(result.sort((a, b) => a - b)).toEqual([1, 4, 9, 16])
  })

  it("limits thread count to numbers length", async () => {
    const parallelSquare = await loadParallelSquare()
    const result = await parallelSquare([1, 2], 10)
    expect(result.sort((a, b) => a - b)).toEqual([1, 4])
  })

  it("handles empty input", async () => {
    const parallelSquare = await loadParallelSquare()
    const result = await parallelSquare([])
    expect(result).toEqual([])
  })
})
