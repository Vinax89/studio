/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { getAllowedOrigins } from '@/lib/allowed-origins'

describe('getAllowedOrigins', () => {
  it('parses strings and regex and ignores malformed entries', () => {
    const input = [
      'http://localhost:6006',
      String.raw`/^https:\/\/.*\.example\.com$/`,
      'not-a-url',
      '/foo(',
    ].join(',');
    const origins = getAllowedOrigins(input);
    expect(origins).toHaveLength(2);
    expect(origins[0]).toBe('http://localhost:6006');
    expect(origins[1]).toBeInstanceOf(RegExp);
  });
});

describe('middleware allowed origins', () => {
  afterEach(() => {
    delete process.env.ALLOWED_ORIGINS
    jest.resetModules()
  })

  it('sets Vary header when allowing origins', async () => {
    process.env.ALLOWED_ORIGINS = 'https://allowed.example'
    jest.resetModules()
    const { middleware } = await import('@/middleware')
    const request = new NextRequest('http://localhost', {
      headers: { origin: 'https://allowed.example' },
    })
    const response = middleware(request)
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(
      'https://allowed.example'
    )
    expect(response.headers.get('Vary')).toContain('Origin')
  })
})
