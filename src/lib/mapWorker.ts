import { parentPort } from "node:worker_threads"

export interface SquareMessage {
  type: "square"
  payload: number[]
}

export interface ErrorMessage {
  type: "error"
  error: string
}

type IncomingMessage = SquareMessage & { [key: string]: unknown }
type OutgoingMessage = SquareMessage | ErrorMessage

export function square(numbers: number[]): number[] {
  return numbers.map(n => n * n)
}

parentPort?.on("error", err => {
  parentPort?.postMessage({
    type: "error",
    error: err instanceof Error ? err.message : String(err),
  })
})

parentPort?.on("message", (message: IncomingMessage) => {
  if (message?.type !== "square") {
    parentPort?.emit(
      "error",
      new Error(`Unknown message type: ${String(message?.type)}`)
    )
    return
  }

  const numbers = message.payload

  if (!Array.isArray(numbers) || numbers.some(n => typeof n !== "number")) {
    parentPort?.postMessage({
      type: "error",
      error: "Input must be an array of numbers",
    } satisfies ErrorMessage)
    return
  }

  parentPort?.postMessage({
    type: "square",
    payload: square(numbers),
  } satisfies OutgoingMessage)
})
