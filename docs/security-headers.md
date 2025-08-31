# Security Headers

This project defines security headers in middleware for all routes. Any additional routes or middleware must continue to apply these headers.

## Required Headers

- **Content-Security-Policy**: `default-src 'self'; script-src 'self' 'nonce-<nonce>' 'strict-dynamic'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'`
- **X-Frame-Options**: `DENY`
- **X-Content-Type-Options**: `nosniff`
- **Referrer-Policy**: `strict-origin-when-cross-origin`
- **Strict-Transport-Security**: `max-age=63072000; includeSubDomains; preload`

### Using the CSP Nonce

The Content-Security-Policy includes a nonce. When adding inline scripts, apply this nonce to the `<script>` tag's `nonce` attribute or replace the inline script with an external file. Middleware that generates HTML should propagate the same nonce in the response headers.

Always verify headers locally when introducing new routes or middleware to ensure functionality remains intact.
