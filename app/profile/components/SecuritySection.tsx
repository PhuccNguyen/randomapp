// app/profile/components/SecuritySection.tsx
'use client';

import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Shield, AlertTriangle } from 'lucide-react';
import styles from '../page.module.css';

interface SecuritySectionProps {
  user: {
    email: string;
  };
  onUpdate: (updates: any) => Promise<void>;
}

const SecuritySection: React.FC<SecuritySectionProps> = ({ user, onUpdate }) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');

  const handleChangePassword = async () => {
    setError('');

    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      // Clear form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      alert('Đổi mật khẩu thành công!');
    } catch (error: any) {
      setError(error.message || 'Đổi mật khẩu thất bại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitle}>
          <Shield size={24} />
          <h2>Bảo mật</h2>
        </div>
      </div>

      {/* Change Password Form */}
      <div className={styles.securityCard}>
        <h3 className={styles.cardTitle}>
          <Lock size={20} />
          Đổi mật khẩu
        </h3>

        {error && (
          <div className={styles.errorMessage}>
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        <div className={styles.passwordFields}>
          {/* Current Password */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Mật khẩu hiện tại</label>
            <div className={styles.passwordInputWrapper}>
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                className={styles.fieldInput}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                placeholder="Nhập mật khẩu hiện tại"
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Mật khẩu mới</label>
            <div className={styles.passwordInputWrapper}>
              <input
                type={showNewPassword ? 'text' : 'password'}
                className={styles.fieldInput}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Xác nhận mật khẩu mới</label>
            <div className={styles.passwordInputWrapper}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                className={styles.fieldInput}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder="Nhập lại mật khẩu mới"
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        <button
          className={styles.changePasswordButton}
          onClick={handleChangePassword}
          disabled={saving}
        >
          <Lock size={16} />
          {saving ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu'}
        </button>
      </div>

      {/* Security Tips */}
      <div className={styles.securityTips}>
        <h4>💡 Mẹo bảo mật</h4>
        <ul>
          <li>✅ Sử dụng mật khẩu mạnh (ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt)</li>
          <li>✅ Không sử dụng lại mật khẩu từ các tài khoản khác</li>
          <li>✅ Đổi mật khẩu định kỳ (3-6 tháng/lần)</li>
          <li>✅ Không chia sẻ mật khẩu với bất kỳ ai</li>
        </ul>
      </div>
    </div>
  );
};

export default SecuritySection;
