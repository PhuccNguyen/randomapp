// components/CampaignSetup/sections/BasicInfoSection.tsx
'use client';

import React from 'react';
import { Info } from 'lucide-react';
import styles from '../CampaignSetup.module.css';

interface BasicInfoSectionProps {
  name: string;
  description: string;
  mode: 'wheel' | 'reel' | 'battle' | 'mystery';
  displayMode: 'random' | 'director';
  isPublic: boolean;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onModeChange: (value: 'wheel' | 'reel' | 'battle' | 'mystery') => void;
  onDisplayModeChange: (value: 'random' | 'director') => void;
  onPublicChange: (value: boolean) => void;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  name,
  description,
  mode,
  displayMode,
  isPublic,
  onNameChange,
  onDescriptionChange,
  onModeChange,
  onDisplayModeChange,
  onPublicChange
}) => {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <Info className={styles.sectionIcon} />
        <h2>Thông tin cơ bản</h2>
      </div>
      
      <div className={styles.formGroup}>
        <label className={styles.label}>
          Tên chiến dịch <span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="VD: Chung kết Hoa Hậu Việt Nam 2025"
          className={styles.input}
          maxLength={100}
        />
        <span className={styles.charCount}>{name.length}/100</span>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Mô tả</label>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Mô tả ngắn về chiến dịch..."
          className={styles.textarea}
          rows={3}
          maxLength={500}
        />
        <span className={styles.charCount}>{description.length}/500</span>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Chế độ hiển thị</label>
          <select
            value={mode}
            onChange={(e) => onModeChange(e.target.value as any)}
            className={styles.select}
          >
            <option value="wheel">Vòng tròn (Wheel)</option>
            <option value="reel">Trục ngang (Reel)</option>
            <option value="battle">Đối đầu (Battle)</option>
            <option value="mystery">Bí mật (Mystery)</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Kiểu quay</label>
          <select
            value={displayMode}
            onChange={(e) => onDisplayModeChange(e.target.value as any)}
            className={styles.select}
          >
            <option value="random">Ngẫu nhiên (Random)</option>
            <option value="director">Đạo diễn (Director)</option>
          </select>
          {displayMode === 'director' && (
            <span className={styles.hint}>
              💡 Chế độ này cho phép kiểm soát kết quả từ Control Panel
            </span>
          )}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => onPublicChange(e.target.checked)}
            className={styles.checkbox}
          />
          <span>Công khai (Mọi người có thể xem)</span>
        </label>
      </div>
    </div>
  );
};

export default BasicInfoSection;
