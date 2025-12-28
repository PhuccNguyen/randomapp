import React from 'react';
import styles from './CarouselCard.module.css';

interface JudgeItem {
  id: string;
  name: string;
  color?: string;
  imageUrl?: string;
  hasQuestion: boolean;
}

interface CarouselCardProps {
  item: JudgeItem;
  position: number; // -2, -1, 0, 1, 2 (0 = center/focused)
  isFocused: boolean;
  isSpinning: boolean;
}

export const CarouselCard: React.FC<CarouselCardProps> = ({
  item,
  position,
  isFocused,
  isSpinning,
}) => {
  // Calculate 3D transforms based on position
  const getTransform = () => {
    const rotateY = position * 25; // Degrees
    const translateZ = isFocused ? 150 : 50 - Math.abs(position) * 30;
    const translateX = position * 350; // Horizontal spacing
    const scale = isFocused ? 1.15 : 1 - Math.abs(position) * 0.15;
    
    return {
      transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
      opacity: isFocused ? 1 : Math.max(0.3, 1 - Math.abs(position) * 0.25),
      zIndex: isFocused ? 100 : 50 - Math.abs(position) * 10,
    };
  };

  const cardColor = item.color || '#64C8FF';

  return (
    <div
      className={`${styles.card} ${isFocused ? styles.focused : ''} ${isSpinning ? styles.spinning : ''}`}
      style={getTransform()}
    >
      {/* Background Gradient */}
      <div 
        className={styles.cardBackground}
        style={{
          background: `linear-gradient(135deg, ${cardColor}15, ${cardColor}30)`,
        }}
      ></div>

      {/* Image Container */}
      {item.imageUrl && (
        <div className={styles.imageContainer}>
          <div className={styles.imageGlow} style={{ background: `radial-gradient(circle, ${cardColor}40, transparent)` }}></div>
          <img 
            src={item.imageUrl} 
            alt={item.name}
            className={styles.image}
            loading="lazy"
          />
          <div className={styles.imageOverlay}></div>
        </div>
      )}

      {/* Content Section */}
      <div className={styles.content}>
        <h3 className={styles.name}>{item.name}</h3>
        
        {item.hasQuestion && (
          <div className={styles.badge}>
            <svg viewBox="0 0 20 20" className={styles.badgeIcon}>
              <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2"/>
              <text x="10" y="15" fontSize="12" textAnchor="middle" fill="currentColor">?</text>
            </svg>
            <span>Câu hỏi</span>
          </div>
        )}
      </div>

      {/* Border Glow */}
      <div 
        className={styles.borderGlow}
        style={{ borderColor: cardColor }}
      ></div>

      {/* Focus Ring (visible only when focused) */}
      {isFocused && (
        <>
          <div className={styles.focusRing} style={{ borderColor: cardColor }}></div>
          <div className={styles.focusGlow} style={{ boxShadow: `0 0 80px ${cardColor}80` }}></div>
          <div className={styles.spotlight} style={{ background: `radial-gradient(circle, ${cardColor}20, transparent)` }}></div>
        </>
      )}

      {/* Corner Accents */}
      <div className={styles.cornerAccent} data-corner="top-left" style={{ borderColor: cardColor }}></div>
      <div className={styles.cornerAccent} data-corner="top-right" style={{ borderColor: cardColor }}></div>
      <div className={styles.cornerAccent} data-corner="bottom-left" style={{ borderColor: cardColor }}></div>
      <div className={styles.cornerAccent} data-corner="bottom-right" style={{ borderColor: cardColor }}></div>

      {/* Holographic Overlay */}
      <div className={styles.holographic}></div>
    </div>
  );
};
