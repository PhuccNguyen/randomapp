import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  const robots = `# Robots.txt for TingRandom - tingrandom.com
# This file tells search engines how to crawl and index the site

User-agent: *
Allow: /
Disallow: /api/
Disallow: /auth/
Disallow: /_next/
Disallow: /admin/
Disallow: /.well-known/
Crawl-delay: 1

# Specific rules for Google
User-agent: Googlebot
Allow: /
Disallow: /api/
Disallow: /auth/
Crawl-delay: 0

# Specific rules for Bing
User-agent: Bingbot
Allow: /
Disallow: /api/
Disallow: /auth/
Crawl-delay: 1

# Sitemap location
Sitemap: https://tingrandom.com/sitemap.xml
Sitemap: https://tingrandom.com/sitemap-mobile.xml
`;

  return new NextResponse(robots, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=172800',
    },
  });
}
