/**
 * @vitest-environment node
 */
import { sanitizeMiddleware } from '../sanitize-middleware'
import { DATA_URI_REGEX } from '@/lib/data-uri'

describe('redaction', () => {
  it('redacts arrays of strings element-wise', () => {
    const input = ['alice@example.com', 'bob@example.com']
    const result = sanitizeMiddleware(input)

    expect(result).toHaveLength(2)
    result.forEach((value) => {
      expect(value).toMatch(/^\[hash:[0-9a-f]{8}\]$/)
    })

    const stringified = JSON.stringify(result)
    expect(stringified).not.toContain('alice@example.com')
    expect(stringified).not.toContain('bob@example.com')
  })

  it('leaves data URIs matching DATA_URI_REGEX unmodified', () => {
    const dataUri = 'data:image/png;base64,iVBORw0KGgo='
    expect(DATA_URI_REGEX.test(dataUri)).toBe(true)

    const result = sanitizeMiddleware(dataUri)
    expect(result).toBe(dataUri)
  })
})
