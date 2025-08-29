import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const cspNonce = btoa(crypto.randomUUID())

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', cspNonce)

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${cspNonce}'`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https:",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ')

  response.headers.set('Content-Security-Policy', csp)
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  )

  if (process.env.NODE_ENV === 'development') {
    response.headers.set(
      'Access-Control-Allow-Origin',
      'https://*-firebase-studio-*.cloudworkstations.dev, http://localhost:6006'
    )
  }

  return response
}

export const config = {
  matcher: '/:path*',
}

