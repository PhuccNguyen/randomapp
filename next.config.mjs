/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Tắt Strict Mode (Performance & Socket Optimization)
  reactStrictMode: false,

  // 2. Cấu hình Image (Growth Hacking: Load ảnh từ mọi nguồn + SEO Optimization)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
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

  // 5. Headers for SEO & Security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
        ],
      },
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/xml'
          }
        ]
      },
      {
        source: '/robots.txt',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/plain'
          }
        ]
      }
    ];
  },

  // 6. Redirects for SEO
  async redirects() {
    return [
      {
        source: '/index',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // 7. Rewrites for clean URLs
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/sitemap.xml',
          destination: '/api/sitemap',
        },
        {
          source: '/robots.txt',
          destination: '/api/robots',
        },
      ],
    };
  },

  // 8. Compression and Performance
  compress: true,
  poweredByHeader: false,
};

export default nextConfig;