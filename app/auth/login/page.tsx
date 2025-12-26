'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, LogIn, Loader2 } from 'lucide-react';
import { signIn, useSession } from 'next-auth/react';
import styles from './login.module.css';

interface LoginForm {
  identifier: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState<LoginForm>({
    identifier: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasRedirected, setHasRedirected] = useState(false);

  // Redirect nếu đã login
  useEffect(() => {
    if (status === 'authenticated' && session?.user && !hasRedirected) {
      setHasRedirected(true);
      const redirect = searchParams.get('redirect') || '/control';
      // Use replace để tránh back button
      router.replace(redirect);
    }
  }, [status, session, router, searchParams, hasRedirected]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('✅ Đăng nhập thành công!');
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        
        window.dispatchEvent(new Event('userChanged'));
        
        const redirect = searchParams.get('redirect') || '/control';
        setTimeout(() => {
          router.push(redirect);
        }, 500);
      } else {
        setError(data.error || 'Đăng nhập thất bại');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Không thể kết nối đến server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError('');
    try {
      const redirectPath = searchParams.get('redirect') || '/control';
      console.log('🚀 Starting Google login, will redirect to:', redirectPath);
      
      // Sử dụng signIn với redirect: false
      const result = await signIn('google', {
        redirect: false,
      });
      
      console.log('📊 Google sign in result:', result);
      console.log('📊 Result keys:', result ? Object.keys(result) : 'null');
      
      if (result?.error) {
        console.error('❌ Google sign in error:', result.error);
        setError(result.error === 'AccessDenied' ? 'Bạn đã từ chối quyền truy cập' : `Lỗi: ${result.error}`);
        setIsGoogleLoading(false);
      } else {
        // Với OAuth, NextAuth không trả về ok: true ngay
        // Thay vào đó, hãy kiểm tra xem session đã được tạo hay không
        console.log('⏳ OAuth flow complete, checking session...');
        
        // Poll cho session được tạo
        let attempts = 0;
        const maxAttempts = 10;
        
        const checkSession = async () => {
          try {
            const response = await fetch('/api/auth/check');
            const data = await response.json();
            
            if (data.authenticated) {
              console.log('✅ Session authenticated! Redirecting to:', redirectPath);
              window.location.href = redirectPath;
              return true;
            } else if (attempts < maxAttempts) {
              attempts++;
              console.log(`⏳ Session not ready (attempt ${attempts}/${maxAttempts}), retrying...`);
              setTimeout(checkSession, 500);
            } else {
              console.error('❌ Session not authenticated after', maxAttempts, 'attempts');
              setError('Không thể xác thực phiên. Vui lòng thử lại.');
              setIsGoogleLoading(false);
            }
          } catch (err) {
            console.error('❌ Error checking session:', err);
            setError('Lỗi khi kiểm tra phiên');
            setIsGoogleLoading(false);
          }
        };
        
        // Bắt đầu kiểm tra
        setTimeout(checkSession, 500);
      }
    } catch (error) {
      console.error('❌ Google login error:', error);
      setError('Không thể kết nối đến Google. Vui lòng kiểm tra kết nối internet.');
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <LogIn size={32} />
          </div>
          <h1 className={styles.title}>Đăng Nhập</h1>
          <p className={styles.subtitle}>Chào mừng trở lại với TingRandom</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div className={styles.errorMessage}>
              ⚠️ {error}
            </div>
          )}
          
          {success && (
            <div className={styles.successMessage}>
              {success}
            </div>
          )}
          
          {/* Google Login - Only show if enabled */}
          {process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED === 'true' && (
            <>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading}
                className={styles.googleButton}
              >
                {isGoogleLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Đang kết nối...
                  </>
                ) : (
                  <>
                    <svg className={styles.googleIcon} viewBox="0 0 24 24" width="20" height="20">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Đăng nhập bằng Google
                  </>
                )}
              </button>
              
              <div className={styles.divider}>
                <span>Hoặc</span>
              </div>
            </>
          )}

          <div className={styles.inputGroup}>
            <label htmlFor="identifier" className={styles.label}>
              Email / Tên đăng nhập / SĐT
            </label>
            <div className={styles.inputWrapper}>
              <Mail className={styles.inputIcon} size={20} />
              <input
                id="identifier"
                name="identifier"
                type="text"
                value={formData.identifier}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Email, tên đăng nhập hoặc số điện thoại"
                required
                autoComplete="username"
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              Mật khẩu
            </label>
            <div className={styles.inputWrapper}>
              <Lock className={styles.inputIcon} size={20} />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Nhập mật khẩu"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className={styles.formFooter}>
            <Link href="/auth/forgot-password" className={styles.forgotLink}>
              Quên mật khẩu?
            </Link>
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className={styles.spinner}></div>
            ) : (
              'Đăng Nhập'
            )}
          </button>
        </form>

        <div className={styles.registerPrompt}>
          <span>Chưa có tài khoản? </span>
          <Link href="/auth/register" className={styles.registerLink}>
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
}