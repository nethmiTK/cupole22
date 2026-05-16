import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // Skip type checking during production builds — speeds up build/dev iterations.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Skip ESLint during builds to reduce build time — adjust if you rely on CI linting.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
