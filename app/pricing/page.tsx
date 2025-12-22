'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check, Crown, Star, Zap, ArrowLeft } from 'lucide-react';
import { UserTier, TIER_LIMITS } from '@/lib/user-types';
import styles from './pricing.module.css';

export default function PricingPage() {
  const [selectedTier, setSelectedTier] = useState<UserTier | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isWelcome, setIsWelcome] = useState(false);
  const router = useRouter();

  // Check if this is a welcome page
  useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setIsWelcome(urlParams.get('welcome') === 'true');
  });

  const tiers = [
    {
      tier: UserTier.PERSONAL,
      name: 'Cá nhân',
      icon: <Star size={32} />,
      price: 'Miễn phí',
      priceDetail: 'Sử dụng miễn phí',
      color: '#4CAF50',
      popular: false,
      features: TIER_LIMITS[UserTier.PERSONAL].features,
      limits: {
        campaigns: TIER_LIMITS[UserTier.PERSONAL].maxCampaigns,
        participants: TIER_LIMITS[UserTier.PERSONAL].maxParticipants,
        items: TIER_LIMITS[UserTier.PERSONAL].maxItems
      }
    },
    {
      tier: UserTier.BUSINESS,
      name: 'Doanh nghiệp',
      icon: <Crown size={32} />,
      price: '99.000đ',
      priceDetail: '/tháng',
      color: '#FF9800',
      popular: true,
      features: TIER_LIMITS[UserTier.BUSINESS].features,
      limits: {
        campaigns: TIER_LIMITS[UserTier.BUSINESS].maxCampaigns,
        participants: TIER_LIMITS[UserTier.BUSINESS].maxParticipants,
        items: TIER_LIMITS[UserTier.BUSINESS].maxItems
      }
    },
    {
      tier: UserTier.ENTERPRISE,
      name: 'Sự kiện lớn',
      icon: <Zap size={32} />,
      price: '499.000đ',
      priceDetail: '/tháng',
      color: '#9C27B0',
      popular: false,
      features: TIER_LIMITS[UserTier.ENTERPRISE].features,
      limits: {
        campaigns: TIER_LIMITS[UserTier.ENTERPRISE].maxCampaigns === -1 ? 'Không giới hạn' : TIER_LIMITS[UserTier.ENTERPRISE].maxCampaigns,
        participants: TIER_LIMITS[UserTier.ENTERPRISE].maxParticipants === -1 ? 'Không giới hạn' : TIER_LIMITS[UserTier.ENTERPRISE].maxParticipants,
        items: TIER_LIMITS[UserTier.ENTERPRISE].maxItems === -1 ? 'Không giới hạn' : TIER_LIMITS[UserTier.ENTERPRISE].maxItems
      }
    }
  ];

  const handleSelectTier = async (tier: UserTier) => {
    if (tier === UserTier.PERSONAL) {
      // Personal tier là miễn phí, có thể chọn ngay
      router.push('/');
      return;
    }

    setSelectedTier(tier);
    setIsLoading(true);

    try {
      // TODO: Implement payment integration
      // For now, just simulate upgrade
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirect to success page or dashboard
      router.push('/?upgraded=true');
    } catch (error) {
      console.error('Upgrade failed:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/" className={styles.backButton}>
          <ArrowLeft size={20} />
          Về trang chủ
        </Link>
        
        <div className={styles.headerContent}>
          {isWelcome && (
            <div className={styles.welcomeMessage}>
              🎉 Chào mừng bạn đến với TingRandom!
            </div>
          )}
          <h1 className={styles.title}>
            {isWelcome ? 'Chọn gói dịch vụ để bắt đầu' : 'Chọn gói dịch vụ phù hợp'}
          </h1>
          <p className={styles.subtitle}>
            Bắt đầu với gói miễn phí, nâng cấp bất cứ lúc nào
          </p>
        </div>
      </div>

      <div className={styles.tiersGrid}>
        {tiers.map((tierData) => (
          <div
            key={tierData.tier}
            className={`${styles.tierCard} ${tierData.popular ? styles.popular : ''}`}
            style={{ '--tier-color': tierData.color } as React.CSSProperties}
          >
            {tierData.popular && (
              <div className={styles.popularBadge}>Phổ biến nhất</div>
            )}
            
            <div className={styles.tierHeader}>
              <div className={styles.tierIcon} style={{ color: tierData.color }}>
                {tierData.icon}
              </div>
              <h3 className={styles.tierName}>{tierData.name}</h3>
              <div className={styles.tierPrice}>
                <span className={styles.price}>{tierData.price}</span>
                <span className={styles.priceDetail}>{tierData.priceDetail}</span>
              </div>
            </div>

            <div className={styles.tierLimits}>
              <div className={styles.limitItem}>
                <span className={styles.limitValue}>{tierData.limits.campaigns}</span>
                <span className={styles.limitLabel}>Campaigns</span>
              </div>
              <div className={styles.limitItem}>
                <span className={styles.limitValue}>{tierData.limits.participants}</span>
                <span className={styles.limitLabel}>Người tham gia</span>
              </div>
              <div className={styles.limitItem}>
                <span className={styles.limitValue}>{tierData.limits.items}</span>
                <span className={styles.limitLabel}>Items/vòng quay</span>
              </div>
            </div>

            <div className={styles.tierFeatures}>
              {tierData.features.map((feature, index) => (
                <div key={index} className={styles.feature}>
                  <Check size={16} className={styles.checkIcon} />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <button
              className={`${styles.selectButton} ${tierData.popular ? styles.primary : styles.secondary}`}
              onClick={() => handleSelectTier(tierData.tier)}
              disabled={isLoading && selectedTier === tierData.tier}
            >
              {isLoading && selectedTier === tierData.tier ? (
                <div className={styles.spinner}></div>
              ) : tierData.tier === UserTier.PERSONAL ? (
                'Sử dụng miễn phí'
              ) : (
                'Chọn gói này'
              )}
            </button>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <p className={styles.footerText}>
          Tất cả gói đều bao gồm hỗ trợ kỹ thuật và cập nhật miễn phí
        </p>
        <p className={styles.footerSubtext}>
          Có thể hủy bất cứ lúc nào • Thanh toán an toàn 100%
        </p>
      </div>
    </div>
  );
}