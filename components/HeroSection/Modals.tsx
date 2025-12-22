// components/HeroSection/Modals.tsx
'use client';

import React from 'react';
import { Crown } from 'lucide-react';
import styles from './HeroSection.module.css';

type TierType = 'personal' | 'business' | 'enterprise';

interface ModalsProps {
  showLoginModal: boolean;
  showUpgradeModal: boolean;
  onCloseLoginModal: () => void;
  onCloseUpgradeModal: () => void;
  onLogin: () => void;
  onUpgrade: (tier: TierType) => void;
}

const Modals: React.FC<ModalsProps> = ({
  showLoginModal,
  showUpgradeModal,
  onCloseLoginModal,
  onCloseUpgradeModal,
  onLogin,
  onUpgrade
}) => {
  return (
    <>
      {/* Login Modal */}
      {showLoginModal && (
        <div className={styles.modalOverlay} onClick={onCloseLoginModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>Đăng nhập để tiếp tục</h2>
            <p>Bạn đã hết lượt quay miễn phí. Đăng nhập để tiếp tục sử dụng.</p>
            <div className={styles.modalActions}>
              <button onClick={onLogin} className={styles.primaryBtn}>
                Đăng nhập
              </button>
              <button onClick={onCloseLoginModal} className={styles.secondaryBtn}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className={styles.modalOverlay} onClick={onCloseUpgradeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <Crown className={styles.crownIcon} />
            <h2>Nâng cấp để mở khóa</h2>
            <p>Tính năng này chỉ dành cho gói Business và Enterprise.</p>
            <div className={styles.modalActions}>
              <button onClick={() => onUpgrade('business')} className={styles.primaryBtn}>
                Nâng cấp ngay
              </button>
              <button onClick={onCloseUpgradeModal} className={styles.secondaryBtn}>
                Để sau
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Modals;