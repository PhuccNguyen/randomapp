'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2, User, Phone, MapPin, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/Header/Header';
import styles from './complete.module.css';

interface ProfileData {
  name: string;
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
    phone: '',
    address: '',
    city: '',
    country: 'Vietnam',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Redirect nếu chưa login
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && session?.user) {
      setFormData(prev => ({
        ...prev,
        name: session.user.name || ''
      }));
    }
  }, [status, session, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(formData),
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

  const handleSkip = () => {
    router.push('/control');
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={48} className="text-blue-600 animate-spin" />
      </div>
    );
  }

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

              <button
                type="button"
                onClick={handleSkip}
                className={styles.skipButton}
              >
                Bỏ Qua
              </button>
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
