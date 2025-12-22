'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Sparkles, Zap, Palette, Play, Clock, Settings, Edit,
  Crown, ChevronRight, Lock, Check, Music, Wand2,
  Trash2, RotateCcw, Download
} from 'lucide-react';
import SimpleWheel from '@/components/Wheel/SimpleWheel';
import styles from './HeroSection.module.css';

interface UserData {
  id: string;
  name: string;
  email: string;
  tier: string;
}

interface HeroSectionProps {
  user: UserData | null;
}

type TabType = 'history' | 'segments' | 'settings';

interface HistoryEntry {
  id: string;
  result: string;
  time: string;
  timestamp: number;
}

interface HistoryTabProps {
  history: HistoryEntry[];
  selectedEntries: string[];
  onSelectEntry: (id: string) => void;
  onSelectAll: () => void;
  onDeleteSelected: () => void;
  onClearAll: () => void;
  onExport: () => void;
}

interface SettingsTabProps {
  segments: string[];
  onAddSegment: () => void;
  onRemoveSegment: (index: number) => void;
  onUpdateSegment: (index: number, value: string) => void;
  onTryPremium: () => void;
}

interface PremiumModalProps {
  onClose: () => void;
}

export default function HeroSection({ user }: HeroSectionProps) {
  return (
    <section className={styles.heroSection}>
      {user ? (
        <LoggedInHero user={user} />
      ) : (
        <GuestHero />
      )}
    </section>
  );
}

function GuestHero() {
  // State Management
  const [segments, setSegments] = useState(['Mẫu 1', 'Mẫu 2', 'Mẫu 3', 'Mẫu 4', 'Mẫu 5', 'Mẫu 6']);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('history');
  const [spinHistory, setSpinHistory] = useState<HistoryEntry[]>([]);
  const [guestSpinCount, setGuestSpinCount] = useState(0);
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showMobilePanel, setShowMobilePanel] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);
  
  // Initialize state from localStorage
  const [initialLoaded, setInitialLoaded] = useState(false);
  
  useEffect(() => {
    if (!initialLoaded) {
      const saved = localStorage.getItem('guestSpinCount');
      const savedHistory = localStorage.getItem('guestHistory');
      
      if (saved) setGuestSpinCount(parseInt(saved));
      if (savedHistory) setSpinHistory(JSON.parse(savedHistory));
      
      setInitialLoaded(true);
    }
  }, [initialLoaded]);
  
  // Handlers
  const handleSpin = (result: string) => {
    if (guestSpinCount >= 5) {
      setShowPremiumModal(true);
      setIsSpinning(false);
      return;
    }
    
    setSpinResult(result);
    setIsSpinning(false);
    
    const newCount = guestSpinCount + 1;
    setGuestSpinCount(newCount);
    localStorage.setItem('guestSpinCount', newCount.toString());
    
    const newEntry: HistoryEntry = {
      id: Date.now().toString(),
      result,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now()
    };
    
    const newHistory = [newEntry, ...spinHistory].slice(0, 10);
    setSpinHistory(newHistory);
    localStorage.setItem('guestHistory', JSON.stringify(newHistory));
  };
  
  const startSpin = () => {
    setIsSpinning(true);
    setSpinResult(null);
  };
  
  const addSegment = () => {
    if (segments.length >= 12) return;
    setSegments([...segments, `Mẫu ${segments.length + 1}`]);
  };
  
  const removeSegment = (index: number) => {
    if (segments.length <= 2) return;
    setSegments(segments.filter((_, i) => i !== index));
  };
  
  const updateSegment = (index: number, value: string) => {
    const newSegments = [...segments];
    newSegments[index] = value;
    setSegments(newSegments);
  };
  
  const clearHistory = () => {
    setSpinHistory([]);
    setSelectedEntries([]);
    localStorage.removeItem('guestHistory');
  };
  
  const deleteSelected = () => {
    const newHistory = spinHistory.filter(e => !selectedEntries.includes(e.id));
    setSpinHistory(newHistory);
    setSelectedEntries([]);
    localStorage.setItem('guestHistory', JSON.stringify(newHistory));
  };
  
  const exportHistory = () => {
    const csv = 'Kết quả,Thời gian\n' + spinHistory.map(e => `${e.result},${e.time}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lich-su-quay-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className={styles.guestContainer}>
      {/* LEFT COLUMN - BRANDING */}
      <aside className={styles.leftColumn}>
        <div className={styles.brandBlock}>
          <div className={styles.logoStack}>
            <Image 
              src="/images/logo/tingnect-logo.png"
              alt="TingNect"
              width={100}
              height={25}
              className={styles.brandLogo}
            />
            <div className={styles.logoDivider}>×</div>
            <Image 
              src="/images/logo/trustlabs-logos.png"
              alt="TrustLabs"
              width={100}
              height={25}
              className={styles.brandLogo}
            />
          </div>
          
          <h1 className={styles.heroTitle}>
            Vòng Quay
            <span className={styles.titleHighlight}> Chuyên Nghiệp</span>
          </h1>
          
          <p className={styles.heroTagline}>
            Nền tảng thuộc hệ sinh thái TingNect phát triển bởi TrustLabs
          </p>
        </div>
        
        <div className={styles.featureStack}>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>
              <Zap size={18} />
            </div>
            <span>Real-time {'<'}0.1s</span>
          </div>
          
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>
              <Sparkles size={18} />
            </div>
            <span>Director Mode</span>
          </div>
          
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>
              <Palette size={18} />
            </div>
            <span>Tùy biến 100%</span>
          </div>
        </div>
        
        <div className={styles.ctaStack}>
          <button 
            className={styles.spinBtn}
            onClick={startSpin}
            disabled={isSpinning || guestSpinCount >= 5}
          >
            {isSpinning ? (
              <>
                <RotateCcw size={18} className={styles.spinning} />
                Đang quay...
              </>
            ) : guestSpinCount >= 5 ? (
              <>
                <Lock size={18} />
                Hết lượt
              </>
            ) : (
              <>
                <Play size={18} />
                Quay Ngay
              </>
            )}
          </button>
          
          <Link href="/auth/register" className={styles.signupBtn}>
            Đăng ký miễn phí
            <ChevronRight size={18} />
          </Link>
        </div>
        
        <div className={styles.quotaInfo}>
          <div className={styles.quotaBar}>
            <div 
              className={styles.quotaFill}
              style={{ width: `${(guestSpinCount / 5) * 100}%` }}
            />
          </div>
          <p className={styles.quotaText}>
            🎲 {guestSpinCount}/5 lượt miễn phí
          </p>
        </div>
        
        {spinResult && (
          <div className={styles.resultCard}>
            <div className={styles.resultIcon}>🎉</div>
            <div className={styles.resultContent}>
              <strong>{spinResult}</strong>
              <Link href="/auth/login" className={styles.resultLink}>
                Đăng nhập để lưu →
              </Link>
            </div>
          </div>
        )}
      </aside>
      
      {/* CENTER COLUMN - WHEEL */}
      <main className={styles.centerColumn}>
        <div className={styles.wheelWrapper}>
          <SimpleWheel
            segments={segments}
            onSegmentsChange={setSegments}
            onSpin={handleSpin}
            isSpinning={isSpinning}
            size={450}
            theme="personal"
            showControls={false}
          />
          
          <div className={styles.wheelHint}>
            <Play size={14} />
            <span>Chỉnh sửa phần tử bên phải</span>
          </div>
        </div>
      </main>
      
      {/* RIGHT COLUMN - TAB PANEL */}
      <aside className={styles.rightColumn}>
        <div className={styles.tabPanel}>
          {/* Tab Navigation */}
          <div className={styles.tabNav}>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'history' ? styles.active : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <Clock size={16} />
              Lịch sử
            </button>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'settings' ? styles.active : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings size={16} />
              Cài đặt
            </button>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'premium' ? styles.active : ''}`}
              onClick={() => setActiveTab('premium')}
            >
              <Crown size={16} />
              Premium
            </button>
          </div>
          
          {/* Tab Content */}
          <div className={styles.tabContent}>
            {activeTab === 'history' && (
              <HistoryTab
                history={spinHistory}
                selectedEntries={selectedEntries}
                onSelectEntry={(id) => setSelectedEntries(prev => 
                  prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
                )}
                onSelectAll={() => setSelectedEntries(
                  selectedEntries.length === spinHistory.length ? [] : spinHistory.map(e => e.id)
                )}
                onDeleteSelected={deleteSelected}
                onClearAll={clearHistory}
                onExport={exportHistory}
              />
            )}
            
            {activeTab === 'settings' && (
              <SettingsTab
                segments={segments}
                onAddSegment={addSegment}
                onRemoveSegment={removeSegment}
                onUpdateSegment={updateSegment}
                onTryPremium={() => setShowPremiumModal(true)}
              />
            )}
            
            {activeTab === 'premium' && (
              <PremiumTab onUpgrade={() => setShowPremiumModal(true)} />
            )}
          </div>
        </div>
      </aside>
      
      {/* Mobile Toggle Button */}
      <button 
        className={styles.mobileToggle}
        onClick={() => setShowMobilePanel(true)}
        title="Mở bảng điều khiển"
      >
        📊
      </button>
      
      {/* Mobile Right Panel Overlay */}
      {showMobilePanel && (
        <>
          <div 
            className={`${styles.mobileOverlay} ${showMobilePanel ? styles.show : ''}`}
            onClick={() => setShowMobilePanel(false)}
          />
          <aside className={`${styles.rightColumnMobile} ${showMobilePanel ? styles.open : ''}`}>
            <div className={styles.mobileHeader}>
              <h3>📊 Bảng điều khiển</h3>
              <button 
                className={styles.closeBtn}
                onClick={() => setShowMobilePanel(false)}
              >
                ✕
              </button>
            </div>
            
            <div className={styles.tabPanel}>
              {/* Tab Navigation */}
              <div className={styles.tabNav}>
                <button 
                  className={`${styles.tabBtn} ${activeTab === 'history' ? styles.active : ''}`}
                  onClick={() => setActiveTab('history')}
                >
                  <Clock size={16} />
                  Lịch sử
                </button>
                <button 
                  className={`${styles.tabBtn} ${activeTab === 'segments' ? styles.active : ''}`}
                  onClick={() => setActiveTab('segments')}
                >
                  <Edit size={16} />
                  Chỉnh sửa
                </button>
                <button 
                  className={`${styles.tabBtn} ${activeTab === 'settings' ? styles.active : ''}`}
                  onClick={() => setActiveTab('settings')}
                >
                  <Settings size={16} />
                  Cài đặt
                </button>
              </div>
              
              {/* Tab Content */}
              <div className={styles.tabContent}>
                {activeTab === 'history' && (
                  <HistoryTab 
                    history={spinHistory}
                    selectedEntries={selectedEntries}
                    onSelectEntry={(id: string) => setSelectedEntries(prev => 
                      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
                    )}
                    onSelectAll={() => setSelectedEntries(
                      selectedEntries.length === spinHistory.length ? [] : spinHistory.map(e => e.id)
                    )}
                    onDeleteSelected={deleteSelected}
                    onClearAll={clearHistory}
                    onExport={exportHistory}
                  />
                )}
                
                {activeTab === 'segments' && (
                  <div className={styles.segmentsTab}>
                    <h4>Chỉnh sửa phần tử</h4>
                    {segments.map((segment, index) => (
                      <div key={index} className={styles.segmentRow}>
                        <input 
                          type="text"
                          value={segment}
                          onChange={(e) => updateSegment(index, e.target.value)}
                          className={styles.segmentInput}
                        />
                        {segments.length > 2 && (
                          <button 
                            onClick={() => removeSegment(index)}
                            className={styles.removeBtn}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    <button 
                      onClick={addSegment}
                      className={styles.addBtn}
                      disabled={segments.length >= 12}
                    >
                      + Thêm phần tử
                    </button>
                  </div>
                )}
                
                {activeTab === 'settings' && (
                  <SettingsTab />
                )}
              </div>
            </div>
          </aside>
        </>
      )}
      
      {/* Premium Modal */}
      {showPremiumModal && (
        <PremiumModal onClose={() => setShowPremiumModal(false)} />
      )}
    </div>
  );
}

// ========== TAB COMPONENTS ==========

function HistoryTab({ 
  history, 
  selectedEntries, 
  onSelectEntry, 
  onSelectAll, 
  onDeleteSelected, 
  onClearAll,
  onExport 
}: HistoryTabProps) {
  return (
    <div className={styles.historyTab}>
      <div className={styles.historyHeader}>
        <h4>📊 Lịch sử ({history.length})</h4>
        <div className={styles.historyActions}>
          <button 
            className={styles.iconBtn}
            onClick={onSelectAll}
            title="Chọn tất cả"
          >
            <Check size={16} />
          </button>
          <button 
            className={styles.iconBtn}
            onClick={onDeleteSelected}
            disabled={selectedEntries.length === 0}
            title="Xóa đã chọn"
          >
            <Trash2 size={16} />
          </button>
          <button 
            className={styles.iconBtn}
            onClick={onExport}
            disabled={history.length === 0}
            title="Xuất CSV"
          >
            <Download size={16} />
          </button>
          <button 
            className={styles.iconBtn}
            onClick={onClearAll}
            disabled={history.length === 0}
            title="Xóa tất cả"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>
      
      {history.length === 0 ? (
        <div className={styles.emptyState}>
          <Clock size={32} />
          <p>Chưa có lịch sử</p>
        </div>
      ) : (
        <div className={styles.historyList}>
          {history.map((entry: HistoryEntry) => (
            <div 
              key={entry.id} 
              className={`${styles.historyItem} ${selectedEntries.includes(entry.id) ? styles.selected : ''}`}
            >
              <input 
                type="checkbox"
                checked={selectedEntries.includes(entry.id)}
                onChange={() => onSelectEntry(entry.id)}
                className={styles.historyCheckbox}
              />
              <div className={styles.historyInfo}>
                <strong>{entry.result}</strong>
                <small>{entry.time}</small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SettingsTab(): JSX.Element {
  return (
    <div className={styles.settingsTab}>
      <div className={styles.settingSection}>
        <div className={styles.sectionHeader}>
          <h4>📝 Phần tử ({segments.length}/12)</h4>
          <button 
            className={styles.addBtn}
            onClick={onAddSegment}
            disabled={segments.length >= 12}
          >
            + Thêm
          </button>
        </div>
        
        <div className={styles.segmentList}>
          {segments.map((seg: string, i: number) => (
            <div key={i} className={styles.segmentRow}>
              <input 
                type="text"
                value={seg}
                onChange={(e) => onUpdateSegment(i, e.target.value)}
                className={styles.segmentInput}
                maxLength={20}
              />
              {segments.length > 2 && (
                <button 
                  className={styles.removeBtn}
                  onClick={() => onRemoveSegment(i)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className={styles.settingSection}>
        <h4>⚙️ Tuỳ chọn</h4>
        
        <label className={styles.settingItem}>
          <span>Thời gian quay</span>
          <select className={styles.select}>
            <option>3 giây</option>
            <option>4 giây</option>
            <option>5 giây</option>
          </select>
        </label>
        
        <label className={styles.settingItem}>
          <span>Âm thanh</span>
          <input type="checkbox" defaultChecked className={styles.checkbox} />
        </label>
      </div>
      
      <div className={`${styles.settingSection} ${styles.locked}`}>
        <h4>🔒 Premium</h4>
        
        <button className={styles.premiumBtn} onClick={onTryPremium}>
          <ImageIcon size={16} />
          <span>Thêm hình ảnh</span>
          <Lock size={14} />
        </button>
        
        <button className={styles.premiumBtn} onClick={onTryPremium}>
          <Music size={16} />
          <span>Âm thanh tùy chỉnh</span>
          <Lock size={14} />
        </button>
        
        <button className={styles.premiumBtn} onClick={onTryPremium}>
          <Wand2 size={16} />
          <span>Hiệu ứng đặc biệt</span>
          <Lock size={14} />
        </button>
      </div>
    </div>
  );
}

function PremiumTab(): JSX.Element {
  return (
    <div className={styles.premiumTab}>
      <div className={styles.premiumHeader}>
        <Crown size={32} />
        <h4>Nâng cấp Premium</h4>
        <p>Mở khóa toàn bộ tính năng chuyên nghiệp</p>
      </div>
      
      <div className={styles.premiumFeatures}>
        <div className={styles.premiumFeature}>
          <Check size={16} />
          <span>Quay không giới hạn</span>
        </div>
        <div className={styles.premiumFeature}>
          <Check size={16} />
          <span>Lưu lịch sử vĩnh viễn</span>
        </div>
        <div className={styles.premiumFeature}>
          <Check size={16} />
          <span>Tùy chỉnh hình dạng</span>
        </div>
        <div className={styles.premiumFeature}>
          <Check size={16} />
          <span>Thêm hình ảnh & logo</span>
        </div>
        <div className={styles.premiumFeature}>
          <Check size={16} />
          <span>Âm thanh riêng</span>
        </div>
        <div className={styles.premiumFeature}>
          <Check size={16} />
          <span>Thống kê chi tiết</span>
        </div>
      </div>
      
      <div className={styles.pricingGrid}>
        <div className={styles.priceCard}>
          <h5>Cá nhân</h5>
          <div className={styles.price}>99k<span>/tháng</span></div>
          <button className={styles.selectBtn} onClick={onUpgrade}>Chọn</button>
        </div>
        
        <div className={`${styles.priceCard} ${styles.popular}`}>
          <div className={styles.popularBadge}>Phổ biến</div>
          <h5>Doanh nghiệp</h5>
          <div className={styles.price}>299k<span>/tháng</span></div>
          <button className={styles.selectBtn} onClick={onUpgrade}>Chọn</button>
        </div>
        
        <div className={styles.priceCard}>
          <h5>Enterprise</h5>
          <div className={styles.price}>899k<span>/tháng</span></div>
          <button className={styles.selectBtn} onClick={onUpgrade}>Liên hệ</button>
        </div>
      </div>
    </div>
  );
}

function PremiumModal({ onClose }: PremiumModalProps) {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose}>×</button>
        
        <div className={styles.modalHeader}>
          <Crown size={48} />
          <h3>Nâng cấp Premium</h3>
          <p>Đã hết lượt miễn phí! Đăng ký để tiếp tục</p>
        </div>
        
        <div className={styles.modalActions}>
          <Link href="/auth/register" className={styles.modalPrimaryBtn}>
            🚀 Đăng ký ngay
          </Link>
          <Link href="/auth/login" className={styles.modalSecondaryBtn}>
            Đã có tài khoản?
          </Link>
        </div>
      </div>
    </div>
  );
}

function LoggedInHero({ user }: { user: UserData }) {
  return (
    <div className={styles.loggedInHero}>
      <div className={styles.welcomeCard}>
        <h2>Chào {user.name}! 👋</h2>
        <p>Đi tới dashboard để sử dụng đầy đủ</p>
        <Link href="/dashboard" className={styles.dashboardBtn}>
          🎯 Mở Dashboard
        </Link>
      </div>
    </div>
  );
}
