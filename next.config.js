/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export', // Enable static HTML export
  distDir: 'out', // Direct export to 'out' directory
  // Removed rewrites as they don't work with static exports
  env: {
    // Add environment variable for WebSocket URL instead of using rewrites
    WS_URL: 'ws://localhost:3001',
  },
};

export default nextConfig;
