import React from 'react';
import styles from './SelectionIndicator.module.css';

interface SelectionIndicatorProps {
  isSpinning: boolean;
}

export const SelectionIndicator: React.FC<SelectionIndicatorProps> = ({ isSpinning }) => {
  return (
    <div className={`${styles.indicator} ${isSpinning ? styles.spinning : ''}`}>
      {/* Top Arrow */}
      <div className={styles.arrow} data-position="top">
        <svg viewBox="0 0 60 30" className={styles.arrowSvg}>
          <defs>
            <linearGradient id="arrowGradientTop" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(100, 200, 255, 0.9)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0.7)" />
            </linearGradient>
          </defs>
          <polygon 
            points="30,5 50,25 10,25" 
            fill="url(#arrowGradientTop)"
            stroke="rgba(100, 200, 255, 1)"
            strokeWidth="2"
          />
        </svg>
      </div>

      {/* Bottom Arrow */}
      <div className={styles.arrow} data-position="bottom">
        <svg viewBox="0 0 60 30" className={styles.arrowSvg}>
          <defs>
            <linearGradient id="arrowGradientBottom" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.7)" />
              <stop offset="100%" stopColor="rgba(100, 200, 255, 0.9)" />
            </linearGradient>
          </defs>
          <polygon 
            points="30,25 50,5 10,5" 
            fill="url(#arrowGradientBottom)"
            stroke="rgba(100, 200, 255, 1)"
            strokeWidth="2"
          />
        </svg>
      </div>

      {/* Selection Box */}
      <div className={styles.selectionBox}>
        <div className={styles.glowRing}></div>
        <div className={styles.pulseRing}></div>
        <div className={styles.scanLines}></div>
      </div>

      {/* Side Accent Lines */}
      <div className={styles.sideLine} data-side="left">
        <div className={styles.sideGlow}></div>
      </div>
      <div className={styles.sideLine} data-side="right">
        <div className={styles.sideGlow}></div>
      </div>

      {/* Center Crosshair */}
      <div className={styles.crosshair}>
        <div className={styles.crosshairH}></div>
        <div className={styles.crosshairV}></div>
      </div>
    </div>
  );
};
