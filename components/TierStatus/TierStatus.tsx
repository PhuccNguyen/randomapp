'use client';

import { useState, useEffect } from 'react';
import { Crown, Users, Settings, Zap, AlertCircle } from 'lucide-react';
import { UserTier } from '@/lib/user-types';
import { getTierLimitsInfo, getTierDisplayName } from '@/lib/tier-utils';
import styles from './TierStatus.module.css';

interface TierStatusProps {
  userTier: UserTier;
  currentUsage?: {
    campaigns: number;
    participants?: number;
  };
  showUpgradeButton?: boolean;
}

export default function TierStatus({ 
  userTier, 
  currentUsage = { campaigns: 0 },
  showUpgradeButton = true 
}: TierStatusProps) {
  const [tierInfo, setTierInfo] = useState<any>(null);

  useEffect(() => {
    setTierInfo(getTierLimitsInfo(userTier));
  }, [userTier]);

  if (!tierInfo) return null;

  const isNearLimit = (current: number, max: number | string) => {
    if (max === 'Không giới hạn') return false;
    return current / (max as number) >= 0.8;
  };

  const getProgressPercent = (current: number, max: number | string) => {
    if (max === 'Không giới hạn') return 0;
    return Math.min((current / (max as number)) * 100, 100);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.tierBadge}>
          <Crown size={16} />
          <span>{tierInfo.displayName}</span>
        </div>
        
        {showUpgradeButton && userTier !== UserTier.ENTERPRISE && (
          <button className={styles.upgradeBtn}>
            <Zap size={14} />
            Nâng cấp
          </button>
        )}
      </div>

      <div className={styles.limits}>
        {/* Campaigns Usage */}
        <div className={styles.limitItem}>
          <div className={styles.limitHeader}>
            <Settings size={16} />
            <span>Campaigns</span>
            <span className={styles.usage}>
              {currentUsage.campaigns} / {tierInfo.maxCampaigns}
            </span>
          </div>
          
          {tierInfo.maxCampaigns !== 'Không giới hạn' && (
            <div className={styles.progressBar}>
              <div 
                className={`${styles.progress} ${
                  isNearLimit(currentUsage.campaigns, tierInfo.maxCampaigns) 
                    ? styles.warning 
                    : ''
                }`}
                style={{ 
                  width: `${getProgressPercent(currentUsage.campaigns, tierInfo.maxCampaigns)}%` 
                }}
              />
            </div>
          )}
        </div>

        {/* Participants Limit */}
        <div className={styles.limitItem}>
          <div className={styles.limitHeader}>
            <Users size={16} />
            <span>Người tham gia tối đa</span>
            <span className={styles.usage}>
              {tierInfo.maxParticipants}
            </span>
          </div>
        </div>

        {/* Items Limit */}
        <div className={styles.limitItem}>
          <div className={styles.limitHeader}>
            <Crown size={16} />
            <span>Items/vòng quay</span>
            <span className={styles.usage}>
              {tierInfo.maxItems}
            </span>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className={styles.features}>
        <h4 className={styles.featuresTitle}>Tính năng</h4>
        <ul className={styles.featuresList}>
          {tierInfo.features.map((feature: string, index: number) => (
            <li key={index} className={styles.feature}>
              ✓ {feature}
            </li>
          ))}
        </ul>
      </div>

      {/* Warning if near limits */}
      {isNearLimit(currentUsage.campaigns, tierInfo.maxCampaigns) && (
        <div className={styles.warningBox}>
          <AlertCircle size={16} />
          <span>
            Bạn đang sắp đạt giới hạn campaigns. Hãy nâng cấp để tiếp tục sử dụng.
          </span>
        </div>
      )}
    </div>
  );
}