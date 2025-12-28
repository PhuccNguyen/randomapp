// C:\Users\Nguyen Phuc\Web\tingrandom\components\Wheel\CarouselSwiper\SwipeBackground.tsx
'use client';

import React from 'react';
import styles from './SwipeBackground.module.css';

interface Particle {
  id: number;
  x: number;
  y: number;
  delay: number;
  size: number;
}

interface SwipeBackgroundProps {
  particles: Particle[];
}

export const SwipeBackground: React.FC<SwipeBackgroundProps> = ({ particles }) => {
  return (
    <div className={styles.swipeBackground}>
      <div className={styles.gradientMesh}>
        <div className={styles.meshOrb} style={{ top: '12%', left: '8%' }}></div>
        <div className={styles.meshOrb} style={{ top: '58%', right: '10%' }}></div>
        <div className={styles.meshOrb} style={{ bottom: '18%', left: '25%' }}></div>
      </div>
      
      <div className={styles.particlesContainer}>
        {particles.map(particle => (
          <div
            key={particle.id}
            className={styles.particle}
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
      
      <div className={styles.scanlines}></div>
    </div>
  );
};
