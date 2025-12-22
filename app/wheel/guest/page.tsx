'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import Header from '@/components/Header/Header';
import Wheel from '@/components/Wheel/Wheel';
import { 
  Sparkles, Plus, Minus, RotateCw, History, Settings, Lock, 
  Building2, Crown, Save, PlayCircle, Upload, Palette, Users,
  ArrowRight, Star, Gift, Zap
} from 'lucide-react';
import styles from './page.module.css';

export default function GuestWheelPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [segments, setSegments] = useState([
    'Giải nhất', 'Giải nhì', 'Giải ba', 'May mắn lần sau'
  ]);
  const [wheelName, setWheelName] = useState('Vòng quay may mắn');
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState('');
  const [showDemoVideo, setShowDemoVideo] = useState(false);

  // Auto redirect authenticated users to their tier wheel
  useEffect(() => {
    if (session) {
      const userTier = (session.user as any)?.tier || 'PERSONAL';
      switch (userTier) {
        case 'ENTERPRISE':
          router.push('/wheel/enterprise');
          break;
        case 'BUSINESS':
          router.push('/wheel/business');
          break;
        default:
          router.push('/wheel/personal');
      }
    }
  }, [session, router]);

  const addSegment = () => {
    if (segments.length < 8) { // Guest limit
      setSegments([...segments, `Phần thưởng ${segments.length + 1}`]);
    } else {
      triggerUpgrade('Thêm nhiều phần hơn (tối đa 50)', 'unlimited_segments');
    }
  };

  const removeSegment = (index: number) => {
    if (segments.length > 2) {
      setSegments(segments.filter((_, i) => i !== index));
    }
  };

  const updateSegment = (index: number, value: string) => {
    const newSegments = [...segments];
    newSegments[index] = value;
    setSegments(newSegments);
  };

  const handleSpin = () => {
    if (isSpinning || segments.length < 2) return;
    
    setIsSpinning(true);
    setResult(null);
    
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * segments.length);
      const selectedResult = segments[randomIndex];
      setResult(selectedResult);
      setIsSpinning(false);
    }, 3000);
  };

  const triggerUpgrade = (feature: string, type: string) => {
    setUpgradeFeature(feature);
    setShowUpgradeModal(true);
  };

  const handleGoogleSignIn = async () => {
    try {
      await signIn('google', {
        callbackUrl: '/wheel/personal'
      });
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const showEventModeDemo = () => {
    setShowDemoVideo(true);
  };

  if (session) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Đang chuyển hướng...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Header />
      
      <main className={styles.main}>
        {/* Growth Hacking Header */}
        <div className={styles.heroSection}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              <Sparkles className={styles.heroIcon} />
              Thử ngay - Không cần đăng ký
            </h1>
            <p className={styles.heroSubtitle}>
              Quay vui ngay bây giờ! Đăng nhập để mở khóa thêm nhiều tính năng pro 🚀
            </p>
          </div>
          
          {/* Upgrade Triggers - Visible but Locked */}
          <div className={styles.triggerZone}>
            <button 
              onClick={() => triggerUpgrade('Chèn Logo Doanh Nghiệp', 'brand_logo')}
              className={styles.triggerButton}
            >
              <Building2 size={20} />
              <span>Chèn Logo Doanh Nghiệp</span>
              <Lock size={16} className={styles.lockIcon} />
            </button>
            
            <button 
              onClick={showEventModeDemo}
              className={styles.triggerButton}
            >
              <Crown size={20} />
              <span>Chế độ MC Sự kiện</span>
              <PlayCircle size={16} className={styles.demoIcon} />
            </button>
            
            <button 
              onClick={() => triggerUpgrade('Tùy chỉnh màu sắc & âm thanh', 'customization')}
              className={styles.triggerButton}
            >
              <Palette size={20} />
              <span>Tùy chỉnh Theme</span>
              <Lock size={16} className={styles.lockIcon} />
            </button>
          </div>
        </div>

        <div className={styles.content}>
          {/* Core Wheel Section - Always Available */}
          <div className={styles.wheelSection}>
            <div className={styles.wheelHeader}>
              <input 
                type="text"
                value={wheelName}
                onChange={(e) => setWheelName(e.target.value)}
                className={styles.wheelNameInput}
                placeholder="Đặt tên vòng quay của bạn"
              />
              <button 
                onClick={() => triggerUpgrade('Lưu vào kho của tôi', 'save_wheel')}
                className={styles.saveButton}
              >
                <Save size={18} />
                <Lock size={14} className={styles.lockIcon} />
              </button>
            </div>

            <div className={styles.wheelContainer}>
              <Wheel 
                segments={segments}
                isSpinning={isSpinning}
                result={result}
                onSpin={handleSpin}
              />
              
              {result && (
                <div className={styles.resultDisplay}>
                  <div className={styles.resultIcon}>🎉</div>
                  <h3>Chúc mừng!</h3>
                  <p>Bạn đã quay được: <strong>{result}</strong></p>
                  <button 
                    onClick={() => triggerUpgrade('Xuất kết quả ra Excel', 'export_results')}
                    className={styles.exportButton}
                  >
                    <Gift size={16} />
                    Xuất Excel <Lock size={12} />
                  </button>
                </div>
              )}
            </div>

            <div className={styles.wheelControls}>
              <button 
                onClick={handleSpin}
                disabled={isSpinning || segments.length < 2}
                className={styles.spinButton}
              >
                <RotateCw size={20} />
                {isSpinning ? 'Đang quay...' : 'Quay ngay!'}
              </button>
              
              <button 
                onClick={() => triggerUpgrade('Xem lịch sử quay', 'history')}
                className={styles.lockedButton}
              >
                <History size={18} />
                Lịch sử <Lock size={14} />
              </button>
            </div>
          </div>

          {/* Settings Section */}
          <div className={styles.settingsSection}>
            <div className={styles.segmentsCard}>
              <div className={styles.segmentsHeader}>
                <h4>Các phần quay ({segments.length}/8)</h4>
                <div className={styles.limitInfo}>
                  <span className={styles.guestLimit}>Khách: 8 phần</span>
                  <button 
                    onClick={() => triggerUpgrade('Tối đa 50 phần', 'unlimited_segments')}
                    className={styles.upgradeHint}
                  >
                    Pro: 50+ <ArrowRight size={12} />
                  </button>
                </div>
              </div>

              <div className={styles.segmentsList}>
                {segments.map((segment, index) => (
                  <div key={index} className={styles.segmentItem}>
                    <span className={styles.segmentNumber}>{index + 1}</span>
                    <input 
                      type="text"
                      value={segment}
                      onChange={(e) => updateSegment(index, e.target.value)}
                      className={styles.segmentInput}
                      placeholder={`Phần ${index + 1}`}
                    />
                    <button 
                      onClick={() => removeSegment(index)}
                      disabled={segments.length <= 2}
                      className={styles.removeButton}
                    >
                      <Minus size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <button 
                onClick={addSegment}
                className={segments.length >= 8 ? styles.addButtonLocked : styles.addButton}
              >
                <Plus size={16} />
                {segments.length >= 8 ? 'Cần nâng cấp để thêm' : 'Thêm phần'}
                {segments.length >= 8 && <Lock size={14} />}
              </button>
            </div>

            {/* Bottom CTA - Kích thích lưu dữ liệu */}
            <div className={styles.savePrompt}>
              <div className={styles.savePromptContent}>
                <Users size={24} />
                <div>
                  <h4>Bạn muốn lưu lại danh sách này cho lần sau?</h4>
                  <p>Đăng nhập để lưu vào kho cá nhân và không bao giờ mất dữ liệu</p>
                </div>
              </div>
              <button 
                onClick={handleGoogleSignIn}
                className={styles.saveCtaButton}
              >
                <Save size={18} />
                Lưu vào kho
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.upgradeModal}>
            <div className={styles.modalHeader}>
              <Zap className={styles.modalIcon} />
              <h3>Tính năng Premium</h3>
            </div>
            
            <div className={styles.modalContent}>
              <p><strong>{upgradeFeature}</strong> là tính năng dành cho người dùng đã đăng nhập.</p>
              
              <div className={styles.benefits}>
                <div className={styles.benefit}>
                  <Star size={16} />
                  <span>Lưu trữ không giới hạn</span>
                </div>
                <div className={styles.benefit}>
                  <Star size={16} />
                  <span>Tùy chỉnh logo & màu sắc</span>
                </div>
                <div className={styles.benefit}>
                  <Star size={16} />
                  <span>Xuất báo cáo Excel</span>
                </div>
                <div className={styles.benefit}>
                  <Star size={16} />
                  <span>Chế độ điều khiển từ xa</span>
                </div>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button 
                onClick={handleGoogleSignIn}
                className={styles.googleSignInBtn}
              >
                <svg className={styles.googleIcon} viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Đăng nhập bằng Google - Dùng thử miễn phí
              </button>
              
              <button 
                onClick={() => setShowUpgradeModal(false)}
                className={styles.modalCloseBtn}
              >
                Để sau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Demo Video Modal */}
      {showDemoVideo && (
        <div className={styles.modalOverlay}>
          <div className={styles.demoModal}>
            <div className={styles.modalHeader}>
              <Crown className={styles.modalIcon} />
              <h3>Chế độ MC Sự kiện</h3>
            </div>
            
            <div className={styles.demoContent}>
              <div className={styles.demoVideo}>
                <div className={styles.videoPlaceholder}>
                  <PlayCircle size={64} />
                  <p>Demo: Điều khiển vòng quay bằng iPad</p>
                  <span>Phù hợp cho Hoa Hậu, Gameshow, Sự kiện lớn</span>
                </div>
              </div>
              
              <div className={styles.demoFeatures}>
                <h4>Tính năng chuyên nghiệp:</h4>
                <ul>
                  <li>🎮 Điều khiển từ xa bằng điện thoại/tablet</li>
                  <li>🎯 Kiểm soát 100% kết quả theo kịch bản</li>
                  <li>📺 Đồng bộ với màn hình LED lớn</li>
                  <li>🎵 Âm thanh sống động</li>
                  <li>📊 Báo cáo chi tiết sau sự kiện</li>
                </ul>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button 
                onClick={handleGoogleSignIn}
                className={styles.tryEventModeBtn}
              >
                <Crown size={18} />
                Dùng thử chế độ MC
              </button>
              
              <button 
                onClick={() => setShowDemoVideo(false)}
                className={styles.modalCloseBtn}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}