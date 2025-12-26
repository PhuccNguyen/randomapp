import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hồ Sơ | TingRandom - Thông Tin Cá Nhân',
  description: 'Quản lý hồ sơ, thông tin tài khoản, nâng cấp gói dịch vụ.',
  robots: 'noindex, nofollow',
  openGraph: {
    title: 'Hồ Sơ | TingRandom',
    description: 'Quản lý hồ sơ cá nhân',
    type: 'website',
    url: 'https://tingrandom.com/profile',
  },
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
