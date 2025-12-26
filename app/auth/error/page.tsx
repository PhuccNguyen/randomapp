'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, Home, LogIn } from 'lucide-react';
import Header from '@/components/Header/Header';
import styles from './error.module.css';

const ERROR_MESSAGES: Record<string, string> = {
  'OAuthCreateAccount': 'Không thể tạo tài khoản từ Google. Vui lòng thử lại hoặc đăng ký bằng email.',
  'OAuthSignin': 'Lỗi khi kết nối với Google. Vui lòng kiểm tra kết nối internet.',
  'OAuthCallback': 'Có lỗi xảy ra khi xử lý OAuth callback. Vui lòng thử lại.',
  'EmailCreateAccount': 'Không thể tạo tài khoản. Email này có thể đã được sử dụng.',
  'Callback': 'Có lỗi xảy ra trong quá trình xác thực. Vui lòng thử lại.',
  'OAuthAccountNotLinked': 'Email này đã được liên kết với tài khoản khác.',
  'EmailSignInError': 'Không thể đăng nhập. Vui lòng kiểm tra email và mật khẩu.',
  'AccessDenied': 'Bạn đã từ chối quyền truy cập. Vui lòng thử lại.',
  'Default': 'Có lỗi xảy ra. Vui lòng thử lại sau.'
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get('error') || 'Default';
  const message = ERROR_MESSAGES[error] || ERROR_MESSAGES['Default'];

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <div className={styles.errorCard}>
          <div className={styles.iconWrapper}>
            <AlertCircle size={64} className={styles.icon} />
          </div>

          <h1 className={styles.title}>Lỗi Xác Thực</h1>
          
          <div className={styles.errorBox}>
            <p className={styles.errorCode}>Mã lỗi: {error}</p>
            <p className={styles.errorMessage}>{message}</p>
          </div>

          <div className={styles.suggestions}>
            <h2 className={styles.suggestionsTitle}>Bạn có thể:</h2>
            <ul className={styles.suggestionsList}>
              <li>✓ Thử lại quá trình đăng nhập</li>
              <li>✓ Kiểm tra kết nối internet</li>
              <li>✓ Xóa cache trình duyệt</li>
              <li>✓ Sử dụng email/password để đăng nhập</li>
            </ul>
          </div>

          <div className={styles.actions}>
            <button
              onClick={() => router.back()}
              className={styles.secondaryButton}
            >
              ← Quay Lại
            </button>
            
            <Link href="/auth/login" className={styles.primaryButton}>
              <LogIn size={20} />
              Thử Lại Đăng Nhập
            </Link>

            <Link href="/" className={styles.tertiaryButton}>
              <Home size={20} />
              Trang Chủ
            </Link>
          </div>

          <p className={styles.support}>
            Nếu lỗi tiếp tục, vui lòng liên hệ{' '}
            <a href="mailto:support@tingrandom.com" className={styles.link}>
              support@tingrandom.com
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
