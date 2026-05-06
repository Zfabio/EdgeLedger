import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Export as a fully static site for GitHub Pages
  output: "export",
  images: { unoptimized: true },
  basePath: "/EdgeLedger",
  assetPrefix: "/EdgeLedger",
};

export default nextConfig;
