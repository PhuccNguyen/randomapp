import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tạo Chiến Dịch | TingRandom - Quản Lý Sự Kiện',
  description: 'Tạo và quản lý chiến dịch vòng quay của bạn. Cấu hình chi tiết, sắp xếp kịch bản và kiểm soát 100% kết quả.',
  robots: 'noindex, nofollow',
  openGraph: {
    title: 'Tạo Chiến Dịch | TingRandom',
    description: 'Quản lý chiến dịch vòng quay với Director Mode',
    type: 'website',
    url: 'https://tingrandom.com/campaign',
  },
};

export default function CampaignLayout({ children }: { children: React.ReactNode }) {
  return children;
}
