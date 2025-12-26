import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Đăng Nhập | TingRandom',
  description: 'Đăng nhập vào tài khoản TingRandom để lưu vòng quay của bạn.',
  robots: 'noindex, nofollow',
  openGraph: {
    title: 'Đăng Nhập | TingRandom',
    description: 'Đăng nhập vào TingRandom',
    type: 'website',
    url: 'https://tingrandom.com/auth/login',
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
