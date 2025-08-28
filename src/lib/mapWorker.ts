import { parentPort, workerData } from "node:worker_threads"

function square(numbers: number[]): number[] {
  return numbers.map(n => n * n)
}

try {
  const result = square(workerData as number[])
  parentPort?.postMessage(result)
} catch (err) {
  parentPort?.postMessage({
    error: {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    },
  })
}

