import { parentPort } from "node:worker_threads"

export function square(numbers: number[]): number[] {
  return numbers.map(n => n * n)
}

parentPort?.on("message", (numbers: number[]) => {
  parentPort?.postMessage(square(numbers))
})
