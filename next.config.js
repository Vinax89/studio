/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co', pathname: '/**' },
      { protocol: 'https', hostname: 'picsum.photos', pathname: '/**' },
    ],
  },

  experimental: {
    // Keep your experimental features here
  },
  
  // Keep your CORS whitelist
  allowedDevOrigins: [
    // explicit hosts you've seen + a broad pattern
    '6000-firebase-studio-1756253661847.cluster-rhptpnrfenhe4qarq36djxjqmg.cloudworkstations.dev',
    '9000-firebase-studio-1756253661847.cluster-rhptpnrfenhe4qarq36djxjqmg.cloudworkstations.dev',
    '*-firebase-studio-*.cluster-*.cloudworkstations.dev',
  ],


  // Dev-only watcher trims (Webpack dev server only; ignored by Turbopack)
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = config.watchOptions || {};
      config.watchOptions.ignored = [
        '**/.git/**',
        '**/.next/**',
        '**/node_modules/**',
        '**/dist/**',
        '**/coverage/**',
        '**/*.log',
      ];
    }
    return config;
  },
};

module.exports = nextConfig;
