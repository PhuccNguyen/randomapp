// components/HeroSection/MiddleColumn.tsx
'use client';

import React from 'react';
import { Play } from 'lucide-react';
import SimpleWheel from '@/components/Wheel/SimpleWheel';
import styles from './HeroSection.module.css';

interface Segment {
  id: string;
  label: string;
  color: string;
  image?: string;
}

type TierType = 'personal' | 'business' | 'enterprise';

interface MiddleColumnProps {
  segments: Segment[];
  onSpinComplete: (result: string) => void;
  isSpinning: boolean;
  currentTier: TierType;
  spinCount: number;
  isLoggedIn: boolean;
  spinDuration: number;
  wheelShape: 'circle' | 'fan' | 'clock';
  onSpin: () => void;
}

const MiddleColumn: React.FC<MiddleColumnProps> = ({
  segments,
  onSpinComplete,
  isSpinning,
  currentTier,
  spinCount,
  isLoggedIn,
  spinDuration,
  wheelShape,
  onSpin
}) => {
  return (
    <div className={styles.middleColumn}>
      <div className={styles.wheelContainer}>
        <SimpleWheel 
          segments={segments}
          onSpinComplete={onSpinComplete}
          isSpinning={isSpinning}
          duration={spinDuration}
          shape={wheelShape}
        />
        
        <button 
          className={`${styles.spinButton} ${isSpinning ? styles.spinning : ''}`}
          onClick={onSpin}
          disabled={isSpinning}
        >
          <Play className={styles.spinIcon} />
          <span>QUAY</span>
          <span className={styles.shortcut}>Ctrl+Enter</span>
        </button>

        <div className={styles.spinCounter}>
          {currentTier === 'personal' && (
            <span className={styles.unlimited}>∞ Miễn phí không giới hạn</span>
          )}
          {currentTier === 'business' && !isLoggedIn && (
            <span className={styles.spinLimit}>
              {Math.max(0, 5 - spinCount)} lượt quay miễn phí còn lại
            </span>
          )}
          {currentTier === 'business' && isLoggedIn && (
            <span className={styles.unlimited}>∞ Đã đăng nhập - Không giới hạn</span>
          )}
          {currentTier === 'enterprise' && (
            <span className={styles.unlimited}>∞ Enterprise - Full Features</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MiddleColumn;