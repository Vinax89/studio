export async function readBodyWithLimit(req: Request, limit: number) {
  const contentLength = req.headers.get("content-length")
  if (contentLength && Number(contentLength) > limit) {
    return null
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
        return null
      }
      result += decoder.decode(read.value, { stream: true })
    }
  }
  result += decoder.decode()
  return result
}
