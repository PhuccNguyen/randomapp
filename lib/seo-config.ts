// This file contains Next.js app-level configuration for SEO optimization
// Note: This is for reference. In App Router (Next.js 14+), metadata is handled in layout.tsx

// SEO Best Practices Checklist:
// ✅ 1. Meta description (layout.tsx)
// ✅ 2. Open Graph tags (layout.tsx)
// ✅ 3. Twitter Card tags (layout.tsx)
// ✅ 4. Canonical URLs (layout.tsx alternates)
// ✅ 5. JSON-LD Structured Data (layout.tsx)
// ✅ 6. robots.txt (public/robots.txt)
// ✅ 7. sitemap.xml (public/sitemap.xml)
// ✅ 8. Mobile-friendly viewport (layout.tsx)
// ✅ 9. Font optimization (Google Fonts with display=swap)
// ✅ 10. Image optimization (next/image with formats)
// ✅ 11. Security headers (next.config.mjs)
// ✅ 12. Preconnect to external domains (layout.tsx)
// ✅ 13. Manifest.json for PWA (public/manifest.json)
// ✅ 14. Alt text for images
// ✅ 15. H1 tags and semantic HTML

export const SEO_CONFIG = {
  siteUrl: 'https://tingrandom.com',
  siteName: 'TingRandom',
  title: 'Nền Tảng Quay Số Chuyên Nghiệp | TingRandom - TrustLabs',
  description: 'Hệ thống điều phối sự kiện thông minh với khả năng kiểm soát tuyệt đối. Từ quay vui cá nhân đến sự kiện lớn Hoa Hậu, Gameshow.',
  keywords: ['quay số', 'vòng quay', 'sự kiện', 'gameshow', 'hoa hậu', 'platform', 'event management'],
  locale: 'vi_VN',
  image: 'https://tingrandom.com/images/logo/tingnect-logo.png',
  twitterHandle: '@tingrandom',
};

// Recommended API Routes for SEO:
// GET /api/sitemap - Generate dynamic sitemap
// GET /api/robots - Generate robots.txt
// GET /api/seo-metadata/:page - Get page-specific metadata
