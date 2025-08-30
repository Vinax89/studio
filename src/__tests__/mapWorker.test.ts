/**
 * @jest-environment node
 */
import { Worker } from "node:worker_threads"
import fs from "node:fs"
import path from "node:path"
import ts from "typescript"
import type { MapWorkerMessage } from "../lib/mapWorker"

function createWorker() {
  const filePath = path.resolve(__dirname, "../lib/mapWorker.ts")
  const source = fs.readFileSync(filePath, "utf8")
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  })
  return new Worker(outputText, { eval: true })
}

describe("mapWorker", () => {
  it("squares numbers", async () => {
    const worker = createWorker()
    const result = await new Promise((resolve, reject) => {
      worker.once("message", resolve)
      worker.once("error", reject)
      worker.postMessage({
        type: "square",
        payload: [2, 3],
      } as MapWorkerMessage)
    })
    await worker.terminate()
    expect(result).toEqual({ type: "square", payload: [4, 9] })
  })

  it("rejects invalid inputs", async () => {
    const worker = createWorker()
    const result = await new Promise(resolve => {
      worker.once("message", resolve)
      worker.postMessage({
        type: "square",
        payload: [1, "a"] as unknown as number[],
      } as MapWorkerMessage)
    })
    await worker.terminate()
    expect(result).toEqual({
      type: "error",
      error: "Input must be an array of numbers",
    })
  })

  it("propagates worker errors", async () => {
    const worker = createWorker()
    const result = await new Promise(resolve => {
      worker.once("message", resolve)
      worker.postMessage({
        type: "boom",
        payload: [],
      } as MapWorkerMessage)
    })
    await worker.terminate()
    expect(result).toEqual({
      type: "error",
      error: expect.stringContaining("Unknown message type"),
    })
  })
})
