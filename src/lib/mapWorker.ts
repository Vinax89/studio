import { parentPort } from "node:worker_threads"

export function square(numbers: number[]): number[] {
  return numbers.map(n => n * n)
}

parentPort?.on("message", (numbers: number[]) => {
  try {
    const result = square(numbers)
    parentPort?.postMessage(result)
  } catch (err) {
    parentPort?.postMessage({
      error: {
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      },
    })
  }
})
