/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

describe('middleware', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  afterEach(() => {
    delete process.env.ALLOWED_ORIGINS
  })

  it('includes wss scheme in connect-src CSP directive', async () => {
    const { middleware } = await import('@/middleware')
    const request = new NextRequest('http://localhost')
    const response = middleware(request)
    const csp = response.headers.get('Content-Security-Policy') ?? ''
    expect(csp).toContain("connect-src 'self' https: wss:")
  })

  it('sets Access-Control-Allow-Origin for allowed origin', async () => {
    process.env.ALLOWED_ORIGINS = 'http://allowed.com'
    const { middleware } = await import('@/middleware')
    const request = new NextRequest('http://localhost', {
      headers: { origin: 'http://allowed.com' },
    })
    const response = middleware(request)
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(
      'http://allowed.com'
    )
  })

  it('does not set Access-Control-Allow-Origin for disallowed origin', async () => {
    process.env.ALLOWED_ORIGINS = 'http://allowed.com'
    const { middleware } = await import('@/middleware')
    const request = new NextRequest('http://localhost', {
      headers: { origin: 'http://not-allowed.com' },
    })
    const response = middleware(request)
    expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull()
  })
})

