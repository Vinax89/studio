import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co', pathname: '/**' },
      { protocol: 'https', hostname: 'picsum.photos', pathname: '/**' },
    ],
  },

  // ✅ top-level, not inside `experimental`
  // Wildcards for Firebase Studio / Cloud Workstations preview host
  // If TS complains about the field, you can keep it — your build ignores type errors.
  // @ts-expect-error new in this Next version
  allowedDevOrigins: ['https://*.cloudworkstations.dev'],

  experimental: {},
};

export default nextConfig;
