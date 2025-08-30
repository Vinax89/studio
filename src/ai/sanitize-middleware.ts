import crypto from 'crypto'
import sanitizeHtml from 'sanitize-html'

const emailRegex = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/
const phoneRegex = /(?:\+?\d{1,2}\s?)?(?:\(?\d{3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}/
const accountRegex = /\b\d{6,}\b/

function hashPlaceholder(value: string) {
  return `[hash:${crypto.createHash('sha256').update(value).digest('hex').slice(0, 8)}]`
}

function sanitizeString(value: string): string {
  const cleaned = sanitizeHtml(value, {
    allowedTags: [],
    allowedAttributes: {},
  })
  if (emailRegex.test(cleaned) || phoneRegex.test(cleaned) || accountRegex.test(cleaned)) {
    return hashPlaceholder(cleaned)
  }
  return cleaned
}

function sanitizeValue<T>(value: T): T {
  if (typeof value === 'string') {
    return sanitizeString(value) as unknown as T
  }
  if (Array.isArray(value)) {
    return (value as unknown[]).map((v) => sanitizeValue(v)) as unknown as T
  }
  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = {}
    for (const key of Object.keys(value as Record<string, unknown>)) {
      result[key] = sanitizeValue((value as Record<string, unknown>)[key])
    }
    return result as unknown as T
  }
  return value
}

export function sanitizeMiddleware<T>(input: T): T {
  return sanitizeValue(input)
}

export default sanitizeMiddleware

