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
    const chunk = await reader.read()
    done = chunk.done ?? false
    if (!done && chunk.value) {
      total += chunk.value.length
      if (total > limit) {
        return null
      }
      result += decoder.decode(chunk.value, { stream: true })
    }
  }
  result += decoder.decode()
  return result
}
