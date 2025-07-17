/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  output: 'standalone',

  images: {
    domains: [
      'via.placeholder.com',
      'placeholder.com',
      'upload.wikimedia.org',
      'en.wikipedia.org',
      'commons.wikimedia.org',
    ],
  },
  async rewrites() {
    // Service URLs for development
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

    console.log(`API requests will be proxied to: ${backendUrl}`);

    return [
      // Main API (games, cards, auth, etc.)
      {
        source: '/api/v1/:path*',
        destination: `${backendUrl}/v1/:path*`,
      },
      // Legacy API support
      {
        source: '/api/:path*',
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
