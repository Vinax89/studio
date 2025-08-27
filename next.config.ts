/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep this file minimal. No experimental flags unless needed.
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co', pathname: '/**' },
      { protocol: 'https', hostname: 'picsum.photos', pathname: '/**' },
    ],
  },

  // IMPORTANT: allowedDevOrigins must be hostnames (no scheme/port).
  // 1) Put the exact current workstations hosts
  // 2) Add a stable wildcard that matches the multi-level pattern
  //    used by Cloud Workstations (two labels before the root).
  allowedDevOrigins: [
    // Explicit rotating hosts you’ve actually seen:
    '6000-firebase-studio-1756253661847.cluster-rhptpnrfenhe4qarq36djxjqmg.cloudworkstations.dev',
    '9000-firebase-studio-1756253661847.cluster-rhptpnrfenhe4qarq36djxjqmg.cloudworkstations.dev',

    // Broad patterns (ordered from specific to general):
    '*-firebase-studio-*.cloudworkstations.dev',
    '*.cluster-*.cloudworkstations.dev',
    '*.cloudworkstations.dev',
  ],
};

module.exports = nextConfig;
