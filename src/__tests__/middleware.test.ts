/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { middleware } from '@/middleware'

describe('middleware', () => {
  it('restricts connect-src to self', () => {
    const request = new NextRequest('http://localhost')
    const response = middleware(request)
    const csp = response.headers.get('Content-Security-Policy') ?? ''
    expect(csp).toContain("connect-src 'self'")
  })
})

