import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',
  sassOptions: {
    silenceDeprecations: ['legacy-js-api'],
  },
  eslint: {
    ignoreDuringBuilds: true
  }
};

export default nextConfig;
