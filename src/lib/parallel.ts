import os from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { WorkerPool } from "./worker-pool"

export async function parallelSquare(
  numbers: number[],
  threads = Math.min(os.cpus().length, numbers.length),
): Promise<number[]> {
  if (numbers.length === 0) return []

  const actualThreads = Math.min(threads, numbers.length)
  const chunkSize = Math.ceil(numbers.length / actualThreads)
  const chunks = Array.from({ length: actualThreads }, (_, i) =>
    numbers.slice(i * chunkSize, (i + 1) * chunkSize),
  )

  const pool = new WorkerPool<number[], number[]>(
    path.join(fileURLToPath(new URL(".", import.meta.url)), "mapWorker.js"),
    actualThreads,
  )

  try {
    const promises = chunks.map(chunk => pool.run(chunk))
    const results = await Promise.all(promises)
    return results.flat()
  } finally {
    await pool.destroy()
  }
}
