/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep this file minimal. No experimental flags unless needed.
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co', pathname: '/**' },
      { protocol: 'https', hostname: 'picsum.photos', pathname: '/**' },
    ],
  },
};

module.exports = nextConfig;
