import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Director Mode | TingRandom - Kiểm Soát Tuyệt Đối Sự Kiện',
  description: 'Director Mode - Kiểm soát 100% kết quả vòng quay từ kịch bản. Phù hợp sự kiện Hoa Hậu, Gameshow, sự kiện lớn.',
  keywords: 'director mode, kiểm soát sự kiện, vòng quay gameshow, sự kiện hoa hậu, real-time control',
  openGraph: {
    title: 'Director Mode | TingRandom',
    description: 'Kiểm soát tuyệt đối sự kiện với Director Mode',
    type: 'website',
    url: 'https://tingrandom.com/wheel/enterprise',
    images: [{
      url: 'https://tingrandom.com/images/logo/trustlabs-logos.png',
      width: 1200,
      height: 630,
    }],
  },
};

export default function EnterpriseWheelLayout({ children }: { children: React.ReactNode }) {
  return children;
}
