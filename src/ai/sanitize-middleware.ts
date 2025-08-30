import crypto from 'crypto'

const emailRegex = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/
const phoneRegex = /(?:\+?\d{1,2}\s?)?(?:\(?\d{3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}/
const accountRegex = /\b\d{6,}\b/

function hashPlaceholder(value: string) {
  return `[hash:${crypto.createHash('sha256').update(value).digest('hex').slice(0, 8)}]`
}

function sanitizeValue(value: any): any {
  if (typeof value === 'string') {
    if (emailRegex.test(value) || phoneRegex.test(value) || accountRegex.test(value)) {
      return hashPlaceholder(value)
    }
    return value
  }
  if (Array.isArray(value)) {
    return value.map((v) => sanitizeValue(v))
  }
  if (value && typeof value === 'object') {
    const result: any = {}
    for (const key of Object.keys(value)) {
      result[key] = sanitizeValue((value as any)[key])
    }
    return result
  }
  return value
}

export function sanitizeMiddleware<T>(input: T): T {
  return sanitizeValue(input)
}

export default sanitizeMiddleware

