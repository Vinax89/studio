import { Worker } from "node:worker_threads"
import os from "node:os"

export async function parallelSquare(numbers: number[], threads = os.cpus().length): Promise<number[]> {
  const chunkSize = Math.ceil(numbers.length / threads)
  const chunks = Array.from({ length: threads }, (_, i) => numbers.slice(i * chunkSize, (i + 1) * chunkSize))

  return new Promise((resolve, reject) => {
    const results: number[] = []
    let completed = 0

    chunks.forEach(chunk => {
      if (chunk.length === 0) {
        completed++
        if (completed === chunks.length) {
          resolve(results)
        }
        return
      }

      const worker = new Worker(new URL("./mapWorker.js", import.meta.url), {
        workerData: chunk,
      })

      worker.on(
        "message",
        (data: number[] | { error: { message: string } }) => {
          if (Array.isArray(data)) {
            results.push(...data)
            completed++
            if (completed === chunks.length) {
              resolve(results)
            }
          } else if (data && "error" in data) {
            reject(new Error(data.error.message))
          }
        },
      )

      worker.on("error", reject)
    })
  })
}
