import os from "node:os"
import path from "node:path"
import { WorkerPool } from "./worker-pool"

export async function parallelSquare(numbers: number[], threads = os.cpus().length): Promise<number[]> {
  const chunkSize = Math.ceil(numbers.length / threads)
  const chunks = Array.from({ length: threads }, (_, i) => numbers.slice(i * chunkSize, (i + 1) * chunkSize))
    .filter(chunk => chunk.length > 0)

  const pool = new WorkerPool<number[], number[]>(path.join(__dirname, "mapWorker.js"), threads)

  const promises = chunks.map(chunk => pool.run(chunk))
  const results = await Promise.all(promises)
  await pool.destroy()
  return results.flat()
}
