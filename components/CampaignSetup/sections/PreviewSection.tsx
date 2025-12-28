// components/CampaignSetup/sections/PreviewSection.tsx
'use client';

import React from 'react';
import { Eye } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Prize, WheelDesign } from '../types';
import styles from '../CampaignSetup.module.css';

// Dynamic imports
const SimpleWheel = dynamic(() => import('@/components/Wheel/SimpleWheel'), { ssr: false });
const Wheel = dynamic(() => import('@/components/Wheel/Wheel'), { ssr: false });
const GlassCylinder = dynamic(() => import('@/components/Wheel/GlassCylinder'), { ssr: false });
const InfiniteHorizon = dynamic(() => import('@/components/Wheel/InfiniteHorizon'), { ssr: false });
const CyberDecode = dynamic(() => import('@/components/Wheel/CyberDecode'), { ssr: false });
const CarouselSwiper = dynamic(() => import('@/components/Wheel/CarouselSwiper'), { ssr: false });

interface PreviewSectionProps {
  prizes: Prize[];
  design: WheelDesign;
  mode: 'wheel' | 'reel' | 'battle' | 'mystery' | 'glass-cylinder' | 'infinite-horizon' | 'cyber-decode' | 'carousel-swiper';
}

const PreviewSection: React.FC<PreviewSectionProps> = ({ prizes, design, mode }) => {
  // Convert Prize[] to items format
  const items = prizes.map(p => ({
    id: p.id,
    name: p.name,
    color: p.color,
    imageUrl: p.image,
    hasQuestion: p.hasQuestion
  }));

  // For SimpleWheel (legacy)
  const segments = prizes.map(p => ({
    id: p.id,
    label: p.name,
    color: p.color,
    image: p.image
  }));

  // Get mode display name
  const getModeLabel = () => {
    switch(mode) {
      case 'wheel': return '🎡 Vòng tròn Classic';
      case 'glass-cylinder': return '🔮 Trụ kính 3D';
      case 'infinite-horizon': return '🌊 Dải ngang Panorama';
      case 'cyber-decode': return '💻 Giải mã Matrix';
      case 'reel': return '🎰 Trục ngang';
      case 'battle': return '⚔️ Đối đầu';
      case 'mystery': return '🎁 Bí mật';
      default: return mode;
    }
  };

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
            borderColor: design.borderColor,
            minHeight: '500px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {mode === 'wheel' && (
            <SimpleWheel
              segments={segments}
              onSpinComplete={() => {}}
              isSpinning={false}
              duration={design.spinDuration}
              shape={design.shape}
            />
          )}
          
          {mode === 'glass-cylinder' && items.length > 0 && (
            <div style={{ transform: 'scale(0.7)', width: '100%' }}>
              <GlassCylinder
                items={items}
                isSpinning={false}
                isStopping={false}
              />
            </div>
          )}
          
          {mode === 'infinite-horizon' && items.length > 0 && (
            <div style={{ transform: 'scale(0.7)', width: '100%' }}>
              <InfiniteHorizon
                items={items}
                isSpinning={false}
                isStopping={false}
              />
            </div>
          )}
          
          {mode === 'cyber-decode' && items.length > 0 && (
            <div style={{ transform: 'scale(0.7)', width: '100%' }}>
              <CyberDecode
                items={items}
                isSpinning={false}
                isStopping={false}
              />
            </div>
          )}
          
          {mode === 'carousel-swiper' && items.length > 0 && (
            <div style={{ transform: 'scale(0.7)', width: '100%' }}>
              <CarouselSwiper
                items={items}
                isSpinning={false}
                isStopping={false}
              />
            </div>
          )}
          
          {(mode === 'reel' || mode === 'battle' || mode === 'mystery') && (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>🚧</div>
              <h3 style={{ color: '#666', marginBottom: '10px' }}>Coming Soon</h3>
              <p style={{ color: '#999' }}>Tính năng đang được phát triển</p>
            </div>
          )}
        </div>

        <div className={styles.previewInfo}>
          <div className={styles.previewStat}>
            <span className={styles.previewLabel}>Hình dạng:</span>
            <span className={styles.previewValue}>{getModeLabel()}</span>
          </div>
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
