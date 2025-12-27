// C:\Users\Nguyen Phuc\Web\tingrandom\components\Wheel\GlassCylinder\CylinderItem.tsx
'use client';

import React from 'react';
import styles from './CylinderItem.module.css';

interface JudgeItem {
  id: string;
  name: string;
  color?: string;
  imageUrl?: string;
}

interface CylinderItemProps {
  item: JudgeItem;
  index: number;
  rotation: number;
  totalItems: number;
  isFocused: boolean;
  isSpinning: boolean;
  transform: string;
  opacity: number;
  zIndex: number;
}

export const CylinderItem: React.FC<CylinderItemProps> = ({
  item,
  index,
  rotation,
  totalItems,
  isFocused,
  isSpinning,
  transform,
  opacity,
  zIndex
}) => {
  return (
    <div
      className={`${styles.cylinderItem} ${isFocused ? styles.focused : ''} ${isSpinning ? styles.spinning : ''}`}
      style={{
        transform,
        opacity: Math.max(0.25, opacity),
        zIndex
      }}
    >
      <div className={styles.itemContent}>
        <div className={styles.itemBackground}></div>
        
        {item.imageUrl && (
          <div className={styles.itemImageWrapper}>
            <div className={styles.itemImage}>
              <img src={item.imageUrl} alt={item.name} />
              <div className={styles.imageRing}></div>
            </div>
          </div>
        )}
        
        <div className={styles.itemNameWrapper}>
          <div 
            className={styles.itemName}
            style={{ color: item.color || '#0ea5e9' }}
          >
            {item.name}
          </div>
          {isFocused && (
            <div className={styles.itemBadge}>SELECTED</div>
          )}
        </div>
        
        {isFocused && (
          <>
            <div 
              className={styles.focusGlow}
              style={{
                backgroundColor: item.color || '#0ea5e9',
                boxShadow: `0 0 60px ${item.color || '#0ea5e9'}, 0 0 90px ${item.color || '#0ea5e9'}66`
              }}
            ></div>
            <div className={styles.focusRings}>
              <div className={styles.ring} style={{ borderColor: item.color || '#0ea5e9' }}></div>
              <div className={styles.ring} style={{ borderColor: item.color || '#0ea5e9' }}></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
