'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2, User, Phone, MapPin, CheckCircle, Lock, Eye, EyeOff, Mail } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/Header/Header';
import styles from './complete.module.css';

interface ProfileData {
  name: string;
  username: string;
  password: string;
  confirmPassword: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}

export default function CompleteProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState<ProfileData>({
    name: '',
    username: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    city: '',
    country: 'Vietnam',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Redirect nếu chưa login hoặc profile đã complete
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && session?.user) {
      // Nếu profile đã complete và không phải Google user → redirect tới control
      if ((session.user as any).profileComplete === true && (session.user as any).provider !== 'google') {
        router.push('/control');
      }
      
      setFormData(prev => ({
        ...prev,
        name: session.user.name || '',
        username: (session.user as any).username || ''
      }));
    }
  }, [status, session, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error khi user bắt đầu nhập lại
    if (error) setError('');
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Vui lòng nhập họ và tên');
      return false;
    }
    if (!formData.username.trim()) {
      setError('Vui lòng nhập username');
      return false;
    }
    if (formData.username.length < 3) {
      setError('Username phải có ít nhất 3 ký tự');
      return false;
    }
    if (!formData.password) {
      setError('Vui lòng nhập mật khẩu');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Gửi profile update
      const response = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          username: formData.username,
          password: formData.password,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          profileComplete: true,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('✅ Hồ sơ đã được cập nhật!');
        setTimeout(() => {
          router.push('/control');
        }, 1500);
      } else {
        setError(data.error || 'Không thể cập nhật hồ sơ');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setError('Lỗi kết nối đến server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    // Mark as profile complete even if skipped (for Google users)
    try {
      await fetch('/api/auth/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          profileComplete: true,
        }),
      });
    } catch (err) {
      console.error('Skip error:', err);
    }
    router.push('/control');
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={48} className="text-blue-600 animate-spin" />
      </div>
    );
  }

  const isGoogleUser = (session?.user as any)?.provider === 'google';

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.header}>
            <CheckCircle size={40} className={styles.icon} />
            <h1 className={styles.title}>Hoàn Thiện Hồ Sơ</h1>
            <p className={styles.subtitle}>
              Vui lòng cập nhật thông tin để có trải nghiệm tốt nhất
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.errorMessage}>{error}</div>}
            {success && <div className={styles.successMessage}>{success}</div>}

            {/* Name */}
            <div className={styles.inputGroup}>
              <label htmlFor="name">Họ và Tên *</label>
              <div className={styles.inputWrapper}>
                <User size={20} />
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Nhập họ và tên"
                  required
                />
              </div>
            </div>

            {/* Username */}
            <div className={styles.inputGroup}>
              <label htmlFor="username">Username *</label>
              <div className={styles.inputWrapper}>
                <User size={20} />
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Nhập username (tối thiểu 3 ký tự)"
                  required
                  minLength={3}
                />
              </div>
            </div>

            {/* Password */}
            <div className={styles.inputGroup}>
              <label htmlFor="password">Mật Khẩu *</label>
              <div className={styles.inputWrapper}>
                <Lock size={20} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.togglePassword}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword">Xác Nhận Mật Khẩu *</label>
              <div className={styles.inputWrapper}>
                <Lock size={20} />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Nhập lại mật khẩu"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={styles.togglePassword}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Phone */}
            <div className={styles.inputGroup}>
              <label htmlFor="phone">Số Điện Thoại</label>
              <div className={styles.inputWrapper}>
                <Phone size={20} />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="0123456789"
                />
              </div>
            </div>

            {/* Address */}
            <div className={styles.inputGroup}>
              <label htmlFor="address">Địa Chỉ</label>
              <div className={styles.inputWrapper}>
                <MapPin size={20} />
                <input
                  id="address"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Số nhà, tên đường"
                />
              </div>
            </div>

            {/* City */}
            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <label htmlFor="city">Thành Phố</label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="TP HCM, Hà Nội..."
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="country">Quốc Gia</label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                >
                  <option value="Vietnam">Vietnam</option>
                  <option value="Thailand">Thailand</option>
                  <option value="Philippines">Philippines</option>
                  <option value="Singapore">Singapore</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className={styles.actions}>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Đang cập nhật...
                  </>
                ) : (
                  'Hoàn Thành'
                )}
              </button>

              {isGoogleUser && (
                <button
                  type="button"
                  onClick={handleSkip}
                  className={styles.skipButton}
                >
                  Bỏ Qua
                </button>
              )}
            </div>

            <p className={styles.helpText}>
              Bạn có thể cập nhật thông tin này sau trong phần <Link href="/profile">Hồ Sơ</Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
