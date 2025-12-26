import { Metadata } from 'next';

// Dashboard Page Metadata - for SEO
export const metadata: Metadata = {
  title: 'Dashboard | TingRandom - Quản Lý Vòng Quay',
  description: 'Dashboard quản lý vòng quay, chiến dịch và sự kiện của bạn. Theo dõi kết quả, thống kê chi tiết và tối ưu hóa hiệu suất.',
  robots: 'noindex, nofollow', // Dashboard shouldn't be indexed
  openGraph: {
    title: 'Dashboard | TingRandom',
    description: 'Quản lý vòng quay và sự kiện của bạn',
    type: 'website',
    url: 'https://tingrandom.com/dashboard',
  },
};

// Placeholder content - actual component is in dashboard/page.tsx
export default function DashboardLayout() {
  return null;
}
