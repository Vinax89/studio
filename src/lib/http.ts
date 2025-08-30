export class PayloadTooLargeError extends Error {
  status = 413
  constructor(message = "Payload too large") {
    super(message)
    this.name = "PayloadTooLargeError"
  }
}

/**
 * Reads the request body up to a specified limit.
 *
 * If the incoming payload exceeds the limit, the request stream is cancelled,
 * any remaining data is drained, and the function rejects with a
 * {@link PayloadTooLargeError}. Callers can catch this error and return a 413
 * response immediately.
 */
export async function readBodyWithLimit(req: Request, limit: number) {
  const contentLength = req.headers.get("content-length")
  if (contentLength && Number(contentLength) > limit) {
    throw new PayloadTooLargeError()
  }

  const reader = req.body?.getReader()
  if (!reader) {
    return ""
  }
  const decoder = new TextDecoder()
  let total = 0
  let result = ""
  let done = false
  while (!done) {
    const read = await reader.read()
    done = read.done === true
    if (read.value) {
      total += read.value.length
      if (total > limit) {
        await reader.cancel()
        try {
          while (!(await reader.read()).done) {
            // drain remaining data
          }
        } catch {
          // ignore errors during draining
        }
        throw new PayloadTooLargeError()
      }
      result += decoder.decode(read.value, { stream: true })
    }
  }
  result += decoder.decode()
  return result
}
