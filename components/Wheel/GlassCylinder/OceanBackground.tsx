// C:\Users\Nguyen Phuc\Web\tingrandom\components\Wheel\GlassCylinder\OceanBackground.tsx
'use client';

import React from 'react';
import styles from './OceanBackground.module.css';

interface Particle {
  id: number;
  x: number;
  y: number;
  delay: number;
  size: number;
}

interface OceanBackgroundProps {
  particles: Particle[];
}

export const OceanBackground: React.FC<OceanBackgroundProps> = ({ particles }) => {
  return (
    <div className={styles.oceanBackground}>
      <div className={styles.waveMesh}>
        <div className={styles.wave} style={{ top: '10%', left: '5%' }}></div>
        <div className={styles.wave} style={{ top: '55%', right: '8%' }}></div>
        <div className={styles.wave} style={{ bottom: '15%', left: '20%' }}></div>
      </div>
      
      <div className={styles.bubblesContainer}>
        {particles.map(particle => (
          <div
            key={particle.id}
            className={styles.bubble}
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDelay: `${particle.delay}s`
            }}
          ></div>
        ))}
      </div>
      
      <div className={styles.lightRays}>
        <div className={styles.ray}></div>
        <div className={styles.ray}></div>
        <div className={styles.ray}></div>
      </div>
    </div>
  );
};
