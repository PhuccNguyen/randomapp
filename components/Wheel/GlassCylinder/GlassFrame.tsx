// C:\Users\Nguyen Phuc\Web\tingrandom\components\Wheel\GlassCylinder\GlassFrame.tsx
'use client';

import React from 'react';
import styles from './GlassFrame.module.css';

export const GlassFrame: React.FC = () => {
  return (
    <div className={styles.glassFrame}>
      <div className={styles.frameTop}>
        <div className={styles.frameBorder}></div>
        <div className={styles.frameLight}></div>
        <div className={styles.frameShadow}></div>
      </div>
      <div className={styles.frameBottom}>
        <div className={styles.frameBorder}></div>
        <div className={styles.frameLight}></div>
        <div className={styles.frameShadow}></div>
      </div>
    </div>
  );
};
