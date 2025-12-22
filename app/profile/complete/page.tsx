'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { User, Building, Phone, Save, ArrowLeft } from 'lucide-react';
import styles from './profile.module.css';

interface ProfileForm {
  name: string;
  username: string;
  phone: string;
  companyName: string;
  companySize: string;
  industry: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState<ProfileForm>({
    name: '',
    username: '',
    phone: '',
    companyName: '',
    companySize: '',
    industry: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        name: session.user?.name || '',
        username: (session.user as any)?.username || '',
        // Populate other fields from session if available
      }));
    }
  }, [session]);

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
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Cập nhật profile thất bại');
      }

      setSuccess('Profile đã được cập nhật thành công!');
      setTimeout(() => {
        // Redirect to appropriate wheel page based on user tier
        const userTier = data.user?.tier || 'PERSONAL';
        switch (userTier) {
          case 'ENTERPRISE':
            router.push('/wheel/enterprise');
            break;
          case 'BUSINESS':
            router.push('/wheel/business');
            break;
          default:
            router.push('/wheel/personal');
        }
      }, 1500);

    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const companySizeOptions = [
    { value: '', label: 'Chọn quy mô công ty' },
    { value: '1-10', label: '1-10 nhân viên' },
    { value: '11-50', label: '11-50 nhân viên' },
    { value: '51-200', label: '51-200 nhân viên' },
    { value: '201-500', label: '201-500 nhân viên' },
    { value: '500+', label: 'Trên 500 nhân viên' }
  ];

  const industryOptions = [
    { value: '', label: 'Chọn lĩnh vực' },
    { value: 'technology', label: 'Công nghệ' },
    { value: 'finance', label: 'Tài chính' },
    { value: 'healthcare', label: 'Y tế' },
    { value: 'education', label: 'Giáo dục' },
    { value: 'retail', label: 'Bán lẻ' },
    { value: 'manufacturing', label: 'Sản xuất' },
    { value: 'entertainment', label: 'Giải trí' },
    { value: 'other', label: 'Khác' }
  ];

  if (status === 'loading') {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Đang tải...</p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/auth/login');
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <button 
            onClick={() => router.back()}
            className={styles.backButton}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className={styles.title}>
              <User size={24} />
              Hoàn thành hồ sơ
            </h1>
            <p className={styles.subtitle}>
              Vui lòng cập nhật thông tin để có trải nghiệm tốt nhất
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          {success && (
            <div className={styles.successMessage}>
              {success}
            </div>
          )}

          {/* Personal Info */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Thông tin cá nhân</h2>
            
            <div className={styles.inputGroup}>
              <label htmlFor="name" className={styles.label}>Họ và tên *</label>
              <div className={styles.inputWrapper}>
                <User className={styles.inputIcon} size={20} />
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Nhập họ và tên đầy đủ"
                  required
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="username" className={styles.label}>Tên đăng nhập *</label>
              <div className={styles.inputWrapper}>
                <User className={styles.inputIcon} size={20} />
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Nhập tên đăng nhập"
                  required
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="phone" className={styles.label}>Số điện thoại</label>
              <div className={styles.inputWrapper}>
                <Phone className={styles.inputIcon} size={20} />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Nhập số điện thoại"
                />
              </div>
            </div>
          </div>

          {/* Company Info */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <Building size={20} />
              Thông tin công ty (tùy chọn)
            </h2>
            
            <div className={styles.inputGroup}>
              <label htmlFor="companyName" className={styles.label}>Tên công ty</label>
              <input
                id="companyName"
                name="companyName"
                type="text"
                value={formData.companyName}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Nhập tên công ty"
              />
            </div>

            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <label htmlFor="companySize" className={styles.label}>Quy mô</label>
                <select
                  id="companySize"
                  name="companySize"
                  value={formData.companySize}
                  onChange={handleInputChange}
                  className={styles.select}
                >
                  {companySizeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="industry" className={styles.label}>Lĩnh vực</label>
                <select
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  className={styles.select}
                >
                  {industryOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className={styles.submitGroup}>
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={isLoading}
            >
              <Save size={20} />
              {isLoading ? 'Đang lưu...' : 'Lưu hồ sơ'}
            </button>
            
            <button 
              type="button" 
              onClick={() => router.push('/')}
              className={styles.skipButton}
            >
              Bỏ qua (hoàn thành sau)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}