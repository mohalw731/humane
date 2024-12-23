import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,  // Ignore ESLint errors during the build
  },
  typescript: {
    ignoreBuildErrors: true,  // Ignore TypeScript errors during the build
  }
};

export default nextConfig;
