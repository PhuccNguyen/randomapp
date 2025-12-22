// app/profile/components/TierSection.tsx
'use client';

import React from 'react';
import { Crown, Sparkles, Building2, Monitor, Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import styles from '../page.module.css';

interface TierSectionProps {
  user: {
    tier: string;
  };
}

const TierSection: React.FC<TierSectionProps> = ({ user }) => {
  const router = useRouter();

  const tiers = [
    {
      id: 'PERSONAL',
      name: 'Cá nhân',
      icon: <Sparkles size={24} />,
      color: '#4CAF50',
      price: 'Miễn phí',
      features: [
        { text: 'Quay vui cá nhân (12 phần tử)', available: true },
        { text: 'Lưu cài đặt cơ bản', available: true },
        { text: 'Quay thưởng doanh nghiệp', available: false },
        { text: 'Sự kiện lớn', available: false },
        { text: 'Director Mode', available: false }
      ]
    },
    {
      id: 'BUSINESS',
      name: 'Doanh nghiệp',
      icon: <Building2 size={24} />,
      color: '#2196F3',
      price: '99.000đ/tháng',
      features: [
        { text: 'Tất cả tính năng Cá nhân', available: true },
        { text: 'Quay thưởng doanh nghiệp (24 phần tử)', available: true },
        { text: 'Tùy chỉnh màu sắc & logo', available: true },
        { text: 'Xuất báo cáo Excel', available: true },
        { text: 'Sự kiện lớn', available: false }
      ]
    },
    {
      id: 'ENTERPRISE',
      name: 'Sự kiện lớn',
      icon: <Monitor size={24} />,
      color: '#FF9800',
      price: '499.000đ/tháng',
      features: [
        { text: 'Tất cả tính năng Doanh nghiệp', available: true },
        { text: 'Sự kiện lớn (50 phần tử)', available: true },
        { text: 'Director Mode (kiểm soát kết quả)', available: true },
        { text: 'Control Panel & Display View', available: true },
        { text: 'Hỗ trợ 24/7', available: true }
      ]
    }
  ];

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitle}>
          <Crown size={24} />
          <h2>Gói dịch vụ</h2>
        </div>
      </div>

      <div className={styles.currentTierCard}>
        <div className={styles.currentTierHeader}>
          <h3>Gói hiện tại của bạn</h3>
          <div 
            className={styles.currentTierBadge}
            style={{ 
              backgroundColor: tiers.find(t => t.id === user.tier)?.color 
            }}
          >
            {tiers.find(t => t.id === user.tier)?.icon}
            {tiers.find(t => t.id === user.tier)?.name}
          </div>
        </div>
      </div>

      <div className={styles.tiersGrid}>
        {tiers.map(tier => (
          <div 
            key={tier.id}
            className={`${styles.tierCard} ${tier.id === user.tier ? styles.currentTier : ''}`}
          >
            <div 
              className={styles.tierHeader}
              style={{ backgroundColor: tier.color }}
            >
              {tier.icon}
              <h3>{tier.name}</h3>
              <p className={styles.tierPrice}>{tier.price}</p>
            </div>

            <div className={styles.tierFeatures}>
              {tier.features.map((feature, index) => (
                <div key={index} className={styles.tierFeature}>
                  {feature.available ? (
                    <Check size={18} color="#4CAF50" />
                  ) : (
                    <X size={18} color="#9E9E9E" />
                  )}
                  <span className={feature.available ? '' : styles.unavailable}>
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>

            {tier.id !== user.tier && (
              <button
                className={styles.upgradeTierButton}
                onClick={() => router.push('/pricing')}
              >
                {parseInt(tier.id.charCodeAt(0)) > parseInt(user.tier.charCodeAt(0))
                  ? 'Nâng cấp'
                  : 'Chuyển xuống'}
              </button>
            )}

            {tier.id === user.tier && (
              <div className={styles.currentTierLabel}>
                ✅ Đang sử dụng
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TierSection;