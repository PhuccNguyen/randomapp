import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vòng Quay Cá Nhân | TingRandom - Quay Vui Miễn Phí',
  description: 'Vòng quay cá nhân miễn phí với tính năng tùy biến. Tạo vòng quay của riêng bạn, thêm các mục và quay ngay lập tức.',
  keywords: 'vòng quay cá nhân, quay vui, vòng quay miễn phí, vòng quay tùy chỉnh',
  openGraph: {
    title: 'Vòng Quay Cá Nhân | TingRandom',
    description: 'Tạo và quay vòng quay cá nhân của bạn',
    type: 'website',
    url: 'https://tingrandom.com/wheel/personal',
  },
};

export default function PersonalWheelLayout({ children }: { children: React.ReactNode }) {
  return children;
}
