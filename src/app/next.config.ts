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

  // optional; remove if unused
  experimental: {},

  // ✅ Development cross-origin whitelist
  // 1) wildcard for any Cloud Workstations subdomain
  // 2) the exact hosts from the logs to ensure stability
  allowedDevOrigins: [
    '*.cloudworkstations.dev',
    '6000-firebase-studio-1756253661847.cluster-rhptpnrfenhe4qarq36djxjqmg.cloudworkstations.dev',
    '9000-firebase-studio-1756253661847.cluster-rhptpnrfenhe4qarq36djxjqmg.cloudworkstations.dev',
  ],
};

export default nextConfig;
