import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bảng Giá | TingRandom - Gói Dịch Vụ',
  description: 'Khám phá các gói dịch vụ TingRandom. Từ Personal (miễn phí) đến Enterprise với Director Mode, Real-time Control, và hỗ trợ 24/7.',
  keywords: 'giá tingrandom, bảng giá vòng quay, gói personal, gói business, gói enterprise',
  openGraph: {
    title: 'Bảng Giá | TingRandom',
    description: 'Gói dịch vụ TingRandom từ miễn phí đến Enterprise',
    type: 'website',
    url: 'https://tingrandom.com/pricing',
    images: [{
      url: 'https://tingrandom.com/images/logo/tingnect-logo.png',
      width: 1200,
      height: 630,
    }],
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
