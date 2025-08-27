/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co', pathname: '/**' },
      { protocol: 'https', hostname: 'picsum.photos', pathname: '/**' },
    ],
  },

  // Keep this: it’s the reason /_next/* stops being blocked in dev
  allowedDevOrigins: [
    // explicit hosts you've actually seen
    '6000-firebase-studio-1756253661847.cluster-rhptpnrfenhe4qarq36djxjqmg.cloudworkstations.dev',
    '9000-firebase-studio-1756253661847.cluster-rhptpnrfenhe4qarq36djxjqmg.cloudworkstations.dev',

    // broader patterns (single * generally matches one label)
    '*-firebase-studio-*.cluster-*.cloudworkstations.dev',
    '*.cluster-*.cloudworkstations.dev',
    '*.cloudworkstations.dev',
  ],
};

module.exports = nextConfig;
