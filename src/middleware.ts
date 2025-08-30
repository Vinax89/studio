import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { allowedOrigins } from '@/lib/allowed-origins';

export function middleware(request: NextRequest) {
  const cspNonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', cspNonce);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${cspNonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https: wss:",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  );

  const origin = request.headers.get('origin');
  if (
    origin &&
    allowedOrigins.some((allowed) =>
      typeof allowed === 'string' ? allowed === origin : allowed.test(origin)
    )
  ) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }

  return response;
}

export const config = {
  matcher: [
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
