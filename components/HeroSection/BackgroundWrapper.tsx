// components/HeroSection/BackgroundWrapper.tsx
'use client';

import React from 'react';
import styles from './HeroSection.module.css';

interface BackgroundWrapperProps {
  children: React.ReactNode;
}

const BackgroundWrapper: React.FC<BackgroundWrapperProps> = ({ children }) => {
  return (
    <section className={styles.heroSection}>
      {children}
    </section>
  );
};

export default BackgroundWrapper;