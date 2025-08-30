/**
 * @jest-environment node
 */
import { sanitizeMiddleware } from '../sanitize-middleware'

describe('sanitizeMiddleware', () => {
  it('hashes emails, phone numbers, and nested account numbers', () => {
    const input = {
      email: 'alice@example.com',
      phone: '555-123-4567',
      nested: {
        account: { number: '9876543210' },
      },
    }

    const result = sanitizeMiddleware(input)
    const stringified = JSON.stringify(result)

    expect(result.email).toMatch(/^\[hash:[0-9a-f]{8}\]$/)
    expect(result.phone).toMatch(/^\[hash:[0-9a-f]{8}\]$/)
    expect(result.nested.account.number).toMatch(/^\[hash:[0-9a-f]{8}\]$/)

    expect(stringified).not.toContain('alice@example.com')
    expect(stringified).not.toContain('555-123-4567')
    expect(stringified).not.toContain('9876543210')
  })

  it('strips HTML tags and script injections', () => {
    const input = {
      text: '<div>Hello<script>alert(1)</script><img src="x" onerror="alert(2)" /></div>',
    }

    const result = sanitizeMiddleware(input)

    expect(result.text).toBe('Hello')
    expect(result.text).not.toMatch(/[<>]/)
  })
})

