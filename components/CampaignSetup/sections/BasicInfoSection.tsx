// components/CampaignSetup/sections/BasicInfoSection.tsx
'use client';

import React from 'react';
import { Info } from 'lucide-react';
import styles from '../CampaignSetup.module.css';

interface BasicInfoSectionProps {
  name: string;
  description: string;
  mode: 'wheel' | 'reel' | 'battle' | 'mystery' | 'glass-cylinder' | 'infinite-horizon' | 'cyber-decode' | 'carousel-swiper';
  displayMode: 'random' | 'director';
  isPublic: boolean;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onModeChange: (value: 'wheel' | 'reel' | 'battle' | 'mystery' | 'glass-cylinder' | 'infinite-horizon' | 'cyber-decode' | 'carousel-swiper') => void;
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
          <label className={styles.label}>
            Hình dạng vòng quay <span className={styles.required}>*</span>
          </label>
          <select
            value={mode}
            onChange={(e) => onModeChange(e.target.value as any)}
            className={styles.select}
          >
            <optgroup label="🎯 Vòng Quay Cơ Bản">
              <option value="wheel">🎡 Vòng tròn (Classic Wheel)</option>
            </optgroup>
            <optgroup label="✨ Vòng Quay Nâng Cao">
              <option value="glass-cylinder">🔮 Trụ kính 3D (Glass Cylinder)</option>
              <option value="infinite-horizon">🌊 Dải ngang panorama (Infinite Horizon)</option>
              <option value="cyber-decode">💻 Giải mã Matrix (Cyber Decode)</option>
              <option value="carousel-swiper">🎠 Băng chuyền xoay (Carousel Swiper)</option>
            </optgroup>
            <optgroup label="🎮 Đang Phát Triển">
              <option value="reel" disabled>🎰 Trục ngang (Reel) - Coming Soon</option>
              <option value="battle" disabled>⚔️ Đối đầu (Battle) - Coming Soon</option>
              <option value="mystery" disabled>🎁 Bí mật (Mystery) - Coming Soon</option>
            </optgroup>
          </select>
          <span className={styles.hint}>
            💡 Chọn kiểu hiển thị vòng quay cho khán giả
          </span>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            Chế độ random <span className={styles.required}>*</span>
          </label>
          <select
            value={displayMode}
            onChange={(e) => onDisplayModeChange(e.target.value as any)}
            className={styles.select}
          >
            <option value="random">🎲 Ngẫu nhiên (Random)</option>
            <option value="director">🎬 Đạo diễn (Director Script)</option>
          </select>
          {displayMode === 'director' && (
            <span className={styles.hint}>
              💡 Kiểm soát kết quả theo kịch bản từ Control Panel
            </span>
          )}
          {displayMode === 'random' && (
            <span className={styles.hint}>
              💡 Hệ thống tự động random kết quả công bằng
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
