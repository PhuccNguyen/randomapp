// components/CampaignSetup/sections/PreviewSection.tsx
'use client';

import React from 'react';
import { Eye } from 'lucide-react';
import SimpleWheel from '@/components/Wheel/SimpleWheel';
import { Prize, WheelDesign } from '../types';
import styles from '../CampaignSetup.module.css';

interface PreviewSectionProps {
  prizes: Prize[];
  design: WheelDesign;
}

const PreviewSection: React.FC<PreviewSectionProps> = ({ prizes, design }) => {
  // Convert Prize[] to format SimpleWheel expects
  const segments = prizes.map(p => ({
    id: p.id,
    label: p.name,
    color: p.color,
    image: p.image
  }));

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <Eye className={styles.sectionIcon} />
        <h2>Xem trước</h2>
      </div>

      <div className={styles.previewContainer}>
        <div 
          className={styles.wheelPreview}
          style={{
            backgroundColor: design.backgroundColor,
            borderColor: design.borderColor
          }}
        >
          <SimpleWheel
            segments={segments}
            onSpinComplete={() => {}}
            isSpinning={false}
            duration={design.spinDuration}
            shape={design.shape}
          />
        </div>

        <div className={styles.previewInfo}>
          <div className={styles.previewStat}>
            <span className={styles.previewLabel}>Giải thưởng:</span>
            <span className={styles.previewValue}>{prizes.length}</span>
          </div>
          <div className={styles.previewStat}>
            <span className={styles.previewLabel}>Thời gian quay:</span>
            <span className={styles.previewValue}>{design.spinDuration}s</span>
          </div>
          <div className={styles.previewStat}>
            <span className={styles.previewLabel}>Âm thanh:</span>
            <span className={styles.previewValue}>{design.soundEnabled ? 'Bật' : 'Tắt'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewSection;
