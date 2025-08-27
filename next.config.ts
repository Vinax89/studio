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
  // @ts-expect-error field may not be in your TS type
  allowedDevOrigins: ['https://*.cloudworkstations.dev'],

  experimental: {},
};

export default nextConfig;
