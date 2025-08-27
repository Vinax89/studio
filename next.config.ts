import type { NextConfig } from 'next'

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
  allowedDevOrigins: ['*.cloudworkstations.dev'],

  experimental: {},
};

export default nextConfig;
