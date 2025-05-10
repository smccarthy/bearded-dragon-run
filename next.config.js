/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    // In development mode, proxy WebSocket connections to the server
    return process.env.NODE_ENV === 'development'
      ? [
          {
            source: '/api/ws',
            destination: 'ws://localhost:3001',
          },
        ]
      : [];
  },
};

export default nextConfig;
