import type { NextConfig } from "next";
import path from "path";

const projectRoot = typeof __dirname !== "undefined" ? __dirname : process.cwd();

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  webpack: (config) => {
    // Pin resolution to this project's node_modules (avoids using parent/home package.json)
    config.resolve.modules = [
      path.join(projectRoot, "node_modules"),
      "node_modules",
    ];
    config.resolveLoader = config.resolveLoader || {};
    config.resolveLoader.modules = [
      path.join(projectRoot, "node_modules"),
      "node_modules",
    ];
    return config;
  },
};

export default nextConfig;
