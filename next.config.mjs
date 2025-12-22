/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Tắt Strict Mode (Performance & Socket Optimization)
  reactStrictMode: false,

  // 2. Cấu hình Image (Growth Hacking: Load ảnh từ mọi nguồn)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // 3. Cấu hình Mongoose cho Next.js 14 (FIX LỖI CẢNH BÁO TẠI ĐÂY)
  experimental: {
    serverComponentsExternalPackages: ['mongoose'], 
  },

  // 4. Webpack Deep Tech Config (Giữ nguyên để fix lỗi thư viện Node ở Client)
  webpack: (config, { isServer }) => {
    if (!isServer) {
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
        'utf-8-validate': false,
        'bufferutil': false,
      };
    }
    return config;
  },
};

export default nextConfig;