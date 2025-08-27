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

  // Allow Firebase Studio / Cloud Workstations preview host to fetch /_next/*
  // @ts-expect-error - not typed in NextConfig yet
  allowedDevOrigins: [
    'https://*.cloudworkstations.dev',
    // Exact origins from your logs:
    "https://6000-firebase-studio-1756253661847.cluster-rhptpnrfenhe4qarq36djxjqmg.cloudworkstations.dev",
    "https://9000-firebase-studio-1756253661847.cluster-rhptpnrfenhe4qarq36djxjqmg.cloudworkstations.dev",
    // (optional) common Firebase preview domains if you use them:
    "https://*.web.app",
    "https://*.firebaseapp.com",
    // local access
    "http://localhost:9002",
    "http://0.0.0.0:9002",
  ],

  experimental: {},
};

export default nextConfig;
