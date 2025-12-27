import type { Metadata } from 'next';
import AuthProvider from '@/components/AuthProvider';
import './globals.css';

// Force dynamic rendering - no static generation
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Nền Tảng Quay Số Chuyên Nghiệp | TingRandom - TrustLabs',
  description: 'Hệ thống điều phối sự kiện thông minh với khả năng kiểm soát tuyệt đối. Từ quay vui cá nhân đến sự kiện lớn Hoa Hậu, Gameshow. Director Mode, Real-time Control, Tính Năng Upsell.',
  keywords: 'quay số, vòng quay, sự kiện, gameshow, hoa hậu, điều khiển sự kiện, platform sự kiện',
  authors: [{ name: 'TrustLabs', url: 'https://trustlabs.io' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  robots: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: 'https://tingrandom.com',
    siteName: 'TingRandom - The Stage Commander',
    title: 'Nền Tảng Quay Số Chuyên Nghiệp | TingRandom',
    description: 'Hệ thống điều phối sự kiện thông minh với khả năng kiểm soát tuyệt đối. Director Mode, Real-time Control, Customizable Wheels.',
    images: [
      {
        url: 'https://tingrandom.com/images/logo/tingnect-logo.png',
        width: 1200,
        height: 630,
        alt: 'TingRandom - The Stage Commander',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nền Tảng Quay Số Chuyên Nghiệp | TingRandom',
    description: 'Hệ thống điều phối sự kiện thông minh. Director Mode, Real-time Control, Customizable Wheels.',
    images: ['https://tingrandom.com/images/logo/tingnect-logo.png'],
  },
  alternates: {
    canonical: 'https://tingrandom.com',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // JSON-LD Structured Data for Organization
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'TingRandom',
    'url': 'https://tingrandom.com',
    'logo': 'https://tingrandom.com/images/logo/tingnect-logo.png',
    'description': 'Nền Tảng Quay Số Chuyên Nghiệp - Hệ thống điều phối sự kiện thông minh',
    'sameAs': [
      'https://facebook.com/tingrandom',
      'https://instagram.com/tingrandom',
    ],
    'contactPoint': {
      '@type': 'ContactPoint',
      'contactType': 'Sales',
      'email': 'sales@tingrandom.com',
    },
  };

  // JSON-LD Structured Data for WebApplication
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': 'TingRandom - The Stage Commander',
    'url': 'https://tingrandom.com',
    'description': 'Hệ thống điều phối sự kiện thông minh với khả năng kiểm soát tuyệt đối',
    'applicationCategory': 'Productivity',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'VND',
      'availability': 'https://schema.org/InStock',
    },
    'featureList': [
      'Personal Wheel',
      'Director Mode',
      'Real-time Control',
      'Event Management',
    ],
  };

  return (
    <html lang="vi">
      <head>
        {/* Preconnect to optimize font loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Google Fonts */}
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@700;800;900&display=swap" 
          rel="stylesheet" 
        />
        
        {/* Favicon and manifest */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* DNS Prefetch for performance */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
        />
        
        {/* Google Site Verification (nếu cần) */}
        <meta name="google-site-verification" content="YOUR_GOOGLE_VERIFICATION_CODE" />
        
        {/* Theme color for mobile */}
        <meta name="theme-color" content="#ffffff" />
        <meta name="msapplication-TileColor" content="#ffffff" />
      </head>
      <body>
        <AuthProvider session={null}>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
