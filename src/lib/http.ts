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
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    if (value) {
      total += value.length
      if (total > limit) {
        return null
      }
      result += decoder.decode(value, { stream: true })
    }
  }
  result += decoder.decode()
  return result
}
