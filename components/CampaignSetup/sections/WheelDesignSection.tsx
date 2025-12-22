// components/CampaignSetup/sections/WheelDesignSection.tsx
'use client';

import React from 'react';
import { Palette, Clock, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { WheelDesign } from '../types';
import styles from '../CampaignSetup.module.css';

interface WheelDesignSectionProps {
  design: WheelDesign;
  onDesignChange: (updates: Partial<WheelDesign>) => void;
}

const WheelDesignSection: React.FC<WheelDesignSectionProps> = ({
  design,
  onDesignChange
}) => {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <Palette className={styles.sectionIcon} />
        <h2>Thiết kế vòng quay</h2>
      </div>

      {/* Wheel Shape */}
      <div className={styles.formGroup}>
        <label className={styles.label}>Hình dạng vòng quay</label>
        <div className={styles.shapeGrid}>
          {(['circle', 'fan', 'clock'] as const).map(shape => (
            <button
              key={shape}
              type="button"
              className={`${styles.shapeButton} ${design.shape === shape ? styles.active : ''}`}
              onClick={() => onDesignChange({ shape })}
            >
              <div className={styles.shapePreview}>
                {shape === 'circle' && '⭕'}
                {shape === 'fan' && '🎪'}
                {shape === 'clock' && '🕐'}
              </div>
              <span>
                {shape === 'circle' && 'Tròn'}
                {shape === 'fan' && 'Quạt'}
                {shape === 'clock' && 'Đồng hồ'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Color Scheme */}
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Màu nền</label>
          <div className={styles.colorPickerGroup}>
            <input
              type="color"
              value={design.backgroundColor}
              onChange={(e) => onDesignChange({ backgroundColor: e.target.value })}
              className={styles.colorInput}
            />
            <input
              type="text"
              value={design.backgroundColor}
              onChange={(e) => onDesignChange({ backgroundColor: e.target.value })}
              className={styles.colorTextInput}
              placeholder="#FFFFFF"
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Màu chữ</label>
          <div className={styles.colorPickerGroup}>
            <input
              type="color"
              value={design.textColor}
              onChange={(e) => onDesignChange({ textColor: e.target.value })}
              className={styles.colorInput}
            />
            <input
              type="text"
              value={design.textColor}
              onChange={(e) => onDesignChange({ textColor: e.target.value })}
              className={styles.colorTextInput}
              placeholder="#000000"
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Màu viền</label>
          <div className={styles.colorPickerGroup}>
            <input
              type="color"
              value={design.borderColor}
              onChange={(e) => onDesignChange({ borderColor: e.target.value })}
              className={styles.colorInput}
            />
            <input
              type="text"
              value={design.borderColor}
              onChange={(e) => onDesignChange({ borderColor: e.target.value })}
              className={styles.colorTextInput}
              placeholder="#D4AF37"
            />
          </div>
        </div>
      </div>

      {/* Spin Duration */}
      <div className={styles.formGroup}>
        <label className={styles.label}>
          <Clock size={16} /> Thời gian quay: {design.spinDuration}s
        </label>
        <input
          type="range"
          min="1"
          max="10"
          step="0.5"
          value={design.spinDuration}
          onChange={(e) => onDesignChange({ spinDuration: parseFloat(e.target.value) })}
          className={styles.rangeInput}
        />
        <div className={styles.rangeLabels}>
          <span>1s (Nhanh)</span>
          <span>10s (Chậm)</span>
        </div>
      </div>

      {/* Effects */}
      <div className={styles.formGroup}>
        <label className={styles.label}>Hiệu ứng</label>
        <div className={styles.toggleGroup}>
          <button
            type="button"
            className={`${styles.toggleButton} ${design.soundEnabled ? styles.active : ''}`}
            onClick={() => onDesignChange({ soundEnabled: !design.soundEnabled })}
          >
            {design.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            <span>Âm thanh</span>
          </button>

          <button
            type="button"
            className={`${styles.toggleButton} ${design.confettiEnabled ? styles.active : ''}`}
            onClick={() => onDesignChange({ confettiEnabled: !design.confettiEnabled })}
          >
            <Sparkles size={18} />
            <span>Pháo giấy</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WheelDesignSection;
