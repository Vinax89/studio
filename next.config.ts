/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co', pathname: '/**' },
      { protocol: 'https', hostname: 'picsum.photos', pathname: '/**' },
    ],
  },

  // Allow your dev server to be requested from Firebase Studio’s origin(s)
  // Hostnames only (no scheme/ports). Wildcards are supported.
  // Keep explicit hosts you’ve seen + a broad pattern for the cluster shape.
  allowedDevOrigins: [
    '6000-firebase-studio-1756253661847.cluster-rhptpnrfenhe4qarq36djxjqmg.cloudworkstations.dev',
    '9000-firebase-studio-1756253661847.cluster-rhptpnrfenhe4qarq36djxjqmg.cloudworkstations.dev',
    '*-firebase-studio-*.cluster-*.cloudworkstations.dev'
  ],
};

module.exports = nextConfig;
