import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'picsum.photos', port: '', pathname: '/**' },
    ],
  },
  // Dev cross-origin whitelist (multi-level host support)
  allowedDevOrigins: [
    // pattern that matches the Firebase Studio + cluster two-label shape
    '*-firebase-studio-*.cluster-*.cloudworkstations.dev',
  ],
};

export default nextConfig;
