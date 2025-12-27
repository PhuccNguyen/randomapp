import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip static generation - app cần dynamic rendering
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Loại trừ các Node.js modules khỏi client bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        async_hooks: false,
      };
    }
    return config;
  },
  serverExternalPackages: ['mongoose']
};

export default nextConfig;
