'use client';

import { useState } from 'react';
import { UserTier } from '@/lib/user-types';
import { 
  getTierDisplayName, 
  getTierLimitsInfo, 
  canCreateCampaign, 
  validateCampaignLimits,
  getUpgradeRecommendation 
} from '@/lib/tier-utils';
import TierStatus from '@/components/TierStatus/TierStatus';
import styles from './test.module.css';

export default function TestTierLogic() {
  const [selectedTier, setSelectedTier] = useState<UserTier>(UserTier.PERSONAL);
  const [currentUsage, setCurrentUsage] = useState({ campaigns: 0 });
  const [testCampaign, setTestCampaign] = useState({ 
    participantCount: 10, 
    itemCount: 5 
  });

  const mockUser = {
    tier: selectedTier,
    campaignsCount: currentUsage.campaigns,
    subscriptionStatus: 'ACTIVE'
  };

  const tierInfo = getTierLimitsInfo(selectedTier);
  const canCreate = canCreateCampaign(mockUser);
  const campaignValidation = validateCampaignLimits(mockUser, testCampaign);
  const upgradeRecommendation = getUpgradeRecommendation(selectedTier);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🧪 Test Tier Logic</h1>
        <p>Kiểm tra logic hoạt động của 3 gói dịch vụ</p>
      </div>

      <div className={styles.grid}>
        {/* Controls */}
        <div className={styles.card}>
          <h2>⚙️ Cấu hình test</h2>
          
          <div className={styles.field}>
            <label>Chọn tier:</label>
            <select 
              value={selectedTier} 
              onChange={(e) => setSelectedTier(e.target.value as UserTier)}
              className={styles.select}
            >
              <option value={UserTier.PERSONAL}>Cá nhân (quay vui)</option>
              <option value={UserTier.BUSINESS}>Doanh nghiệp (quay thưởng)</option>
              <option value={UserTier.ENTERPRISE}>Sự kiện lớn (Hoa Hậu/Gameshow)</option>
            </select>
          </div>

          <div className={styles.field}>
            <label>Số campaigns hiện tại:</label>
            <input 
              type="number" 
              value={currentUsage.campaigns}
              onChange={(e) => setCurrentUsage({ campaigns: parseInt(e.target.value) || 0 })}
              className={styles.input}
              min="0"
            />
          </div>

          <div className={styles.field}>
            <label>Test campaign - Số người tham gia:</label>
            <input 
              type="number" 
              value={testCampaign.participantCount}
              onChange={(e) => setTestCampaign({ 
                ...testCampaign, 
                participantCount: parseInt(e.target.value) || 0 
              })}
              className={styles.input}
              min="1"
            />
          </div>

          <div className={styles.field}>
            <label>Test campaign - Số items:</label>
            <input 
              type="number" 
              value={testCampaign.itemCount}
              onChange={(e) => setTestCampaign({ 
                ...testCampaign, 
                itemCount: parseInt(e.target.value) || 0 
              })}
              className={styles.input}
              min="1"
            />
          </div>
        </div>

        {/* Tier Status Component */}
        <div className={styles.card}>
          <h2>📊 Tier Status</h2>
          <TierStatus 
            userTier={selectedTier}
            currentUsage={currentUsage}
            showUpgradeButton={true}
          />
        </div>

        {/* Test Results */}
        <div className={styles.card}>
          <h2>🧪 Kết quả test</h2>
          
          <div className={styles.result}>
            <h3>Có thể tạo campaign mới?</h3>
            <div className={canCreate.allowed ? styles.success : styles.error}>
              {canCreate.allowed ? '✅ Có thể tạo' : `❌ ${canCreate.reason}`}
            </div>
          </div>

          <div className={styles.result}>
            <h3>Campaign test có hợp lệ?</h3>
            <div className={campaignValidation.valid ? styles.success : styles.error}>
              {campaignValidation.valid ? '✅ Hợp lệ' : `❌ ${campaignValidation.reason}`}
            </div>
          </div>

          {upgradeRecommendation && (
            <div className={styles.result}>
              <h3>Gợi ý nâng cấp:</h3>
              <div className={styles.info}>
                📈 {getTierDisplayName(upgradeRecommendation)}
              </div>
            </div>
          )}
        </div>

        {/* Tier Details */}
        <div className={styles.card}>
          <h2>📝 Chi tiết tier</h2>
          
          <div className={styles.tierDetails}>
            <h3>{tierInfo.displayName}</h3>
            <ul>
              <li><strong>Max campaigns:</strong> {tierInfo.maxCampaigns}</li>
              <li><strong>Max participants:</strong> {tierInfo.maxParticipants}</li>
              <li><strong>Max items:</strong> {tierInfo.maxItems}</li>
              <li><strong>Giá/tháng:</strong> {tierInfo.priceMonthly.toLocaleString()}đ</li>
            </ul>
            
            <h4>Tính năng:</h4>
            <ul>
              {tierInfo.features.map((feature, index) => (
                <li key={index}>✓ {feature}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}