import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable React strict mode for development
  reactStrictMode: true,

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    NEXT_PUBLIC_DOCUSAURUS_URL: process.env.NEXT_PUBLIC_DOCUSAURUS_URL || 'http://localhost:3000',
  },

  // Redirect root to dashboard
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
