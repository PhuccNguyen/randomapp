// app/profile/components/PersonalInfoSection.tsx
'use client';

import React, { useState } from 'react';
import { Edit2, Save, X, User, Mail, Phone, Building2, Globe } from 'lucide-react';
import styles from '../page.module.css';

interface PersonalInfoSectionProps {
  user: {
    name: string;
    email: string;
    username?: string;
    phone?: string;
    companyName?: string;
    companySize?: string;
    industry?: string;
  };
  onUpdate: (updates: any) => Promise<void>;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({ user, onUpdate }) => {
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    username: user.username || '',
    phone: user.phone || '',
    companyName: user.companyName || '',
    companySize: user.companySize || '',
    industry: user.industry || ''
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate(formData);
      setEditMode(false);
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name,
      username: user.username || '',
      phone: user.phone || '',
      companyName: user.companyName || '',
      companySize: user.companySize || '',
      industry: user.industry || ''
    });
    setEditMode(false);
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitle}>
          <User size={24} />
          <h2>Thông tin cá nhân</h2>
        </div>
        {!editMode ? (
          <button className={styles.editButton} onClick={() => setEditMode(true)}>
            <Edit2 size={16} />
            Chỉnh sửa
          </button>
        ) : (
          <div className={styles.editActions}>
            <button 
              className={styles.saveButton} 
              onClick={handleSave}
              disabled={saving}
            >
              <Save size={16} />
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
            <button 
              className={styles.cancelButton} 
              onClick={handleCancel}
              disabled={saving}
            >
              <X size={16} />
              Hủy
            </button>
          </div>
        )}
      </div>

      <div className={styles.fieldsGrid}>
        {/* Full Name */}
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>
            <User size={16} />
            Tên đầy đủ
          </label>
          {editMode ? (
            <input
              type="text"
              className={styles.fieldInput}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nhập tên đầy đủ"
            />
          ) : (
            <div className={styles.fieldValue}>{user.name}</div>
          )}
        </div>

        {/* Username */}
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>
            <User size={16} />
            Tên đăng nhập
          </label>
          {editMode ? (
            <input
              type="text"
              className={styles.fieldInput}
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="Nhập tên đăng nhập"
            />
          ) : (
            <div className={styles.fieldValue}>{user.username || '(Chưa có)'}</div>
          )}
        </div>

        {/* Email */}
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>
            <Mail size={16} />
            Email
          </label>
          <div className={styles.fieldValue}>{user.email}</div>
          <small className={styles.fieldNote}>Email không thể thay đổi</small>
        </div>

        {/* Phone */}
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>
            <Phone size={16} />
            Số điện thoại
          </label>
          {editMode ? (
            <input
              type="tel"
              className={styles.fieldInput}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+84 xxx xxx xxx"
            />
          ) : (
            <div className={styles.fieldValue}>{user.phone || '(Chưa có)'}</div>
          )}
        </div>

        {/* Company Name */}
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>
            <Building2 size={16} />
            Công ty
          </label>
          {editMode ? (
            <input
              type="text"
              className={styles.fieldInput}
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              placeholder="Tên công ty"
            />
          ) : (
            <div className={styles.fieldValue}>{user.companyName || '(Chưa có)'}</div>
          )}
        </div>

        {/* Company Size */}
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>
            <Building2 size={16} />
            Quy mô công ty
          </label>
          {editMode ? (
            <select
              className={styles.fieldInput}
              value={formData.companySize}
              onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
            >
              <option value="">Chọn quy mô</option>
              <option value="1-10">1-10 nhân viên</option>
              <option value="11-50">11-50 nhân viên</option>
              <option value="51-200">51-200 nhân viên</option>
              <option value="201-500">201-500 nhân viên</option>
              <option value="500+">500+ nhân viên</option>
            </select>
          ) : (
            <div className={styles.fieldValue}>{user.companySize || '(Chưa có)'}</div>
          )}
        </div>

        {/* Industry */}
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>
            <Globe size={16} />
            Ngành nghề
          </label>
          {editMode ? (
            <input
              type="text"
              className={styles.fieldInput}
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              placeholder="VD: Công nghệ, Giáo dục..."
            />
          ) : (
            <div className={styles.fieldValue}>{user.industry || '(Chưa có)'}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoSection;
