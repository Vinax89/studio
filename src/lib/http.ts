import type { FileHandle } from "fs/promises"

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
 * The body is normally buffered in memory. When the provided `content-length`
 * header approaches the `limit` (within 80%), the function attempts to reduce
 * memory usage by buffering to a temporary file on disk. Pass
 * `{ bufferToDisk: false }` to always buffer in memory. Alternatively, supply
 * an `onChunk` callback to incrementally parse the body as it streams in.
 *
 * If the incoming payload exceeds the limit, the request stream is cancelled,
 * any remaining data is drained, and the function rejects with a
 * {@link PayloadTooLargeError}. Callers can catch this error and return a 413
 * response immediately.
 */
export async function readBodyWithLimit(
  req: Request,
  limit: number,
  opts: { bufferToDisk?: boolean; onChunk?: (chunk: string) => void } = {},
) {
  const contentLengthHeader = req.headers.get("content-length")
  const contentLength = contentLengthHeader ? Number(contentLengthHeader) : null
  if (contentLength !== null && contentLength > limit) {
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

  const nearLimit = contentLength !== null && contentLength > limit * 0.8
  let fileHandle: FileHandle | undefined
  let filePath: string | undefined
  let tmpDir: string | undefined
  if (nearLimit && opts.onChunk === undefined && opts.bufferToDisk !== false) {
    try {
      const fs = await import("fs/promises")
      const path = await import("path")
      const os = await import("os")
      tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "body-"))
      filePath = path.join(tmpDir, "payload")
      fileHandle = await fs.open(filePath, "w")
    } catch {
      // ignore if fs is unavailable (e.g. edge runtime)
    }
  }

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
        if (fileHandle) {
          try {
            await fileHandle.close()
          } catch {
            // ignore close errors
          }
          try {
            const fs = await import("fs/promises")
            if (tmpDir) {
              await fs.rm(tmpDir, { recursive: true, force: true })
            }
          } catch {
            // ignore cleanup errors
          }
        }
        throw new PayloadTooLargeError()
      }
      if (fileHandle) {
        await fileHandle.write(read.value)
      } else {
        const textChunk = decoder.decode(read.value, { stream: true })
        if (opts.onChunk) {
          opts.onChunk(textChunk)
        } else {
          result += textChunk
        }
      }
    }
  }

  if (fileHandle) {
    try {
      await fileHandle.close()
      const fs = await import("fs/promises")
      const buffer = await fs.readFile(filePath!)
      if (tmpDir) {
        await fs.rm(tmpDir, { recursive: true, force: true })
      }
      result = decoder.decode(buffer)
    } catch {
      // fall back to empty string if reading fails
      result = ""
    }
  } else if (!opts.onChunk) {
    result += decoder.decode()
  }

  return result
}
