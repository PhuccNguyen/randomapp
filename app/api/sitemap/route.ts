import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const BASE_URL = 'https://tingrandom.com';

const pages = [
  { url: '/', priority: 1.0, changefreq: 'daily' },
  { url: '/dashboard', priority: 0.9, changefreq: 'weekly' },
  { url: '/campaign', priority: 0.8, changefreq: 'weekly' },
  { url: '/wheel/personal', priority: 0.8, changefreq: 'weekly' },
  { url: '/wheel/business', priority: 0.8, changefreq: 'weekly' },
  { url: '/wheel/enterprise', priority: 0.8, changefreq: 'weekly' },
  { url: '/pricing', priority: 0.9, changefreq: 'weekly' },
  { url: '/auth/login', priority: 0.7, changefreq: 'monthly' },
  { url: '/auth/register', priority: 0.7, changefreq: 'monthly' },
  { url: '/profile', priority: 0.6, changefreq: 'monthly' },
];

export async function GET() {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0">
  ${pages.map(page => `
  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <mobile:mobile/>
  </url>
  `).join('')}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=172800',
    },
  });
}
