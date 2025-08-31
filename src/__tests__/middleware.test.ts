/**
 * @vitest-environment node
 */
import { NextRequest } from 'next/server'
import { middleware } from '@/middleware'

describe('middleware', () => {
  it('includes wss scheme in connect-src CSP directive', () => {
    const request = new NextRequest('http://localhost')
    const response = middleware(request)
    const csp = response.headers.get('Content-Security-Policy') ?? ''
    expect(csp).toContain("connect-src 'self' https: wss:")
  })
})

