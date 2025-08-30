/**
 * @jest-environment node
 */
import { NextResponse } from 'next/server'
import { getAllowedOrigins } from '@/lib/allowed-origins'
import { handleCors, withCors } from '@/lib/cors'

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

describe('cors middleware', () => {
  const allowed = getAllowedOrigins(
    ['http://allowed.com', String.raw`/^https:\/\/sub\.example\.com$/`].join(',')
  )

  it('rejects disallowed origins', () => {
    const req = new Request('http://localhost', { headers: { Origin: 'http://evil.com' } })
    const res = handleCors(req, allowed)
    expect(res?.status).toBe(403)
  })

  it('adds headers for allowed origins', () => {
    const req = new Request('http://localhost', { headers: { Origin: 'http://allowed.com' } })
    const early = handleCors(req, allowed)
    expect(early).toBeUndefined()
    const res = withCors(req, NextResponse.json({ ok: true }), allowed)
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('http://allowed.com')
  })
})
