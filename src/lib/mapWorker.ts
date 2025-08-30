import { parentPort } from "node:worker_threads"

/**
 * Messages that can be sent to or from the map worker.
 *
 * In normal operation only the `square` message type is supported but tests
 * sometimes send other message types (like `boom`) to ensure the worker rejects
 * unknown operations. Keeping those message types in the union allows the
 * tests to construct messages without resorting to awkward casts.
 */
export type MapWorkerMessage =
  | { type: "square"; payload: number[] }
  | { type: "boom"; payload: number[] }

export interface ErrorMessage {
  type: "error"
  error: string
}

type IncomingMessage = MapWorkerMessage & { [key: string]: unknown }
type OutgoingMessage = MapWorkerMessage | ErrorMessage

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
