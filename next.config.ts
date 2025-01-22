import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      loaders: {
        // Add specific loader configurations here if needed
      },
    },
  },
  /* config options here */
};

export default nextConfig;
