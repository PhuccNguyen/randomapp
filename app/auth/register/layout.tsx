import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Đăng Ký | TingRandom',
  description: 'Tạo tài khoản TingRandom miễn phí. Lưu vòng quay của bạn và truy cập thêm nhiều tính năng.',
  robots: 'noindex, nofollow',
  openGraph: {
    title: 'Đăng Ký | TingRandom',
    description: 'Tạo tài khoản TingRandom',
    type: 'website',
    url: 'https://tingrandom.com/auth/register',
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
