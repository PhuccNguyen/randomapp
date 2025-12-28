import React from 'react';
import styles from './CarouselFrame.module.css';

export const CarouselFrame: React.FC = () => {
  return (
    <div className={styles.frame}>
      {/* Top Glass Border */}
      <div className={styles.glassBorder} data-position="top">
        <div className={styles.glowLine}></div>
        <div className={styles.shimmer}></div>
      </div>

      {/* Right Glass Border */}
      <div className={styles.glassBorder} data-position="right">
        <div className={styles.glowLine}></div>
        <div className={styles.shimmer}></div>
      </div>

      {/* Bottom Glass Border */}
      <div className={styles.glassBorder} data-position="bottom">
        <div className={styles.glowLine}></div>
        <div className={styles.shimmer}></div>
      </div>

      {/* Left Glass Border */}
      <div className={styles.glassBorder} data-position="left">
        <div className={styles.glowLine}></div>
        <div className={styles.shimmer}></div>
      </div>

      {/* Corner Ornaments */}
      <div className={styles.corner} data-corner="top-left">
        <svg viewBox="0 0 40 40" className={styles.cornerSvg}>
          <path d="M 0,40 L 0,10 Q 0,0 10,0 L 40,0" fill="none" stroke="url(#cornerGradient)" strokeWidth="2"/>
        </svg>
      </div>

      <div className={styles.corner} data-corner="top-right">
        <svg viewBox="0 0 40 40" className={styles.cornerSvg}>
          <path d="M 40,40 L 40,10 Q 40,0 30,0 L 0,0" fill="none" stroke="url(#cornerGradient)" strokeWidth="2"/>
        </svg>
      </div>

      <div className={styles.corner} data-corner="bottom-left">
        <svg viewBox="0 0 40 40" className={styles.cornerSvg}>
          <path d="M 0,0 L 0,30 Q 0,40 10,40 L 40,40" fill="none" stroke="url(#cornerGradient)" strokeWidth="2"/>
        </svg>
      </div>

      <div className={styles.corner} data-corner="bottom-right">
        <svg viewBox="0 0 40 40" className={styles.cornerSvg}>
          <path d="M 40,0 L 40,30 Q 40,40 30,40 L 0,40" fill="none" stroke="url(#cornerGradient)" strokeWidth="2"/>
        </svg>
      </div>

      {/* SVG Definitions */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="cornerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(100, 200, 255, 0.8)" />
            <stop offset="50%" stopColor="rgba(255, 255, 255, 0.9)" />
            <stop offset="100%" stopColor="rgba(100, 200, 255, 0.8)" />
          </linearGradient>
        </defs>
      </svg>

      {/* Center Focus Lines */}
      <div className={styles.centerLines}>
        <div className={styles.horizontalLine}></div>
        <div className={styles.verticalLine}></div>
      </div>
    </div>
  );
};
