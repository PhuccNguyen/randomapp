// C:\Users\Nguyen Phuc\Web\tingrandom\components\Wheel\GlassCylinder\FocusIndicator.tsx
'use client';

import React from 'react';
import styles from './FocusIndicator.module.css';

export const FocusIndicator: React.FC = () => {
  return (
    <div className={styles.focusIndicator}>
      <div className={styles.indicatorLine}>
        <div className={styles.lineGlow}></div>
        <div className={styles.lineInner}></div>
      </div>
      
      <div className={styles.indicatorArrowLeft}>
        <div className={styles.arrowIcon}>▶</div>
        <div className={styles.arrowGlow}></div>
      </div>
      
      <div className={styles.indicatorArrowRight}>
        <div className={styles.arrowIcon}>◀</div>
        <div className={styles.arrowGlow}></div>
      </div>
    </div>
  );
};
