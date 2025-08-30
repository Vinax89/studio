import type { NextConfig } from 'next';
import crypto from 'crypto';

const nextConfig: NextConfig = {
  // Enforce type checking and linting during builds
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: false },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co', pathname: '/**' },
      { protocol: 'https', hostname: 'picsum.photos', pathname: '/**' },
    ],
  },
  async headers() {
    const cspNonce = crypto.randomBytes(16).toString('base64');
    const securityHeaders = [
      {
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          `script-src 'self' 'nonce-${cspNonce}'`,
          "style-src 'self' 'unsafe-inline' 'https://fonts.googleapis.com'",
          "img-src 'self' data: https:",
          "font-src 'self' https://fonts.gstatic.com",
          "connect-src 'self' https:",
          "base-uri 'self'",
          "form-action 'self'",
          "frame-ancestors 'none'",
        ].join('; '),
      },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
      },
    ];

    if (process.env.NODE_ENV === 'development') {
      securityHeaders.push({
        key: 'Access-Control-Allow-Origin',
        value:
          'https://*-firebase-studio-*.cloudworkstations.dev, http://localhost:6006',
      });
    }

    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  experimental: {},
  webpack: (config, { isServer, webpack }) => {
    if (isServer) {
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /handlebars/,
          (resource: { request: string }) => {
            if (resource.request === 'handlebars') {
              resource.request = 'handlebars/dist/cjs/handlebars.js';
            }
          }
        )
      );
    }
    return config;
  },
};

export default nextConfig;
