import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vòng Quay Doanh Nghiệp | TingRandom - Tùy Biến Logo & Thương Hiệu',
  description: 'Vòng quay doanh nghiệp chuyên nghiệp với logo, thương hiệu riêng. Phù hợp cho khuyến mãi, sự kiện, và marketing.',
  keywords: 'vòng quay doanh nghiệp, vòng quay logo, vòng quay thương hiệu, vòng quay marketing',
  openGraph: {
    title: 'Vòng Quay Doanh Nghiệp | TingRandom',
    description: 'Tạo vòng quay chuyên nghiệp với logo và thương hiệu của bạn',
    type: 'website',
    url: 'https://tingrandom.com/wheel/business',
  },
};

export default function BusinessWheelLayout({ children }: { children: React.ReactNode }) {
  return children;
}
