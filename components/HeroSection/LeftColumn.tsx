// components/HeroSection/LeftColumn.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { Zap, Users, Shield, Award } from 'lucide-react';
import styles from './HeroSection.module.css';

const LeftColumn: React.FC = () => {
  return (
    <div className={styles.leftColumn}>
      <div className={styles.brandBlock}>
        {/* Logo Section */}
        
        {/* Main Branding */}
        <div className={styles.brandingSection}>
          <h1 className={styles.mainTitle}>
            <span className={styles.titleGradient}>TINGRANDOM</span>
          </h1>
          <p className={styles.slogan}>Nền Tảng Quay Số Trực Tiếp Chuyên Nghiệp</p>
          <p className={styles.subSlogan}>The Digital Stage Director Platform</p>
        </div>
        
        {/* Key Features */}
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Shield size={24} />
            </div>
            <div className={styles.featureContent}>
              <h3 className={styles.featureTitle}>Minh Bạch</h3>
              <p className={styles.featureDesc}>100% công khai, không can thiệp</p>
            </div>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Zap size={24} />
            </div>
            <div className={styles.featureContent}>
              <h3 className={styles.featureTitle}>Chính Xác</h3>
              <p className={styles.featureDesc}>Thuật toán ngẫu nhiên chuẩn xác</p>
            </div>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Users size={24} />
            </div>
            <div className={styles.featureContent}>
              <h3 className={styles.featureTitle}>10K+ Người Dùng</h3>
              <p className={styles.featureDesc}>Tin tưởng và sử dụng</p>
            </div>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Award size={24} />
            </div>
            <div className={styles.featureContent}>
              <h3 className={styles.featureTitle}>Chuyên Nghiệp</h3>
              <p className={styles.featureDesc}>Giao diện hiện đại, dễ sử dụng</p>
            </div>
          </div>
        </div>

        {/* Powered By Section */}
        <div className={styles.poweredBySection}>
          <div className={styles.ecosystemBadge}>
            <Image 
              src="/images/logo/tingnect-logo.png" 
              alt="Tingnect" 
              width={80} 
              height={26}
              className={styles.ecosystemLogo}
            />
            <span className={styles.ecosystemText}>Ecosystem</span>
          </div>
          
          <div className={styles.divider}>
            <span className={styles.dividerIcon}>×</span>
          </div>
          
          <div className={styles.developedBy}>
            <span className={styles.developedLabel}>Phát triển bởi</span>
            <Image 
              src="/images/logo/trustlabs-logos.png" 
              alt="TrustLabs" 
              width={100} 
              height={32}
              className={styles.trustLabsLogo}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeftColumn;