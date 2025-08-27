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
    // explicit rotating hosts (keeps you moving)
    '6000-firebase-studio-1756253661847.cluster-rhptpnrfenhe4qarq36djxjqmg.cloudworkstations.dev',
    '9000-firebase-studio-1756253661847.cluster-rhptpnrfenhe4qarq36djxjqmg.cloudworkstations.dev',

    // pattern that matches the Firebase Studio + cluster two-label shape
    '*-firebase-studio-*.cluster-*.cloudworkstations.dev',
  ],
};

export default nextConfig;
