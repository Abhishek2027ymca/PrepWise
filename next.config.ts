import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  //  Removed ignoreDuringBuilds and ignoreBuildErrors
  // Now all TypeScript and ESLint errors are caught during build
  // This ensures code quality and catches bugs early
};

export default nextConfig;