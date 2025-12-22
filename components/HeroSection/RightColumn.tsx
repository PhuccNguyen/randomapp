// components/HeroSection/RightColumn.tsx
'use client';

import React from 'react';
import { Plus, Trash2, Download, Upload, Settings, Monitor, Zap, Crown } from 'lucide-react';
import styles from './HeroSection.module.css';

interface Segment {
  id: string;
  label: string;
  color: string;
  image?: string;
}

interface SpinHistoryItem {
  id: string;
  result: string;
  timestamp: number;
}

type TierType = 'personal' | 'business' | 'enterprise';
type ActiveTab = 'history' | 'settings' | 'customize';

interface RightColumnProps {
  currentTier: TierType;
  activeTab: ActiveTab;
  segments: Segment[];
  spinHistory: SpinHistoryItem[];
  spinDuration: number;
  enableSound: boolean;
  wheelShape: 'circle' | 'fan' | 'clock';
  onTierChange: (tier: TierType) => void;
  onTabChange: (tab: ActiveTab) => void;
  onAddSegment: () => void;
  onUpdateSegment: (id: string, updates: Partial<Segment>) => void;
  onDeleteSegment: (id: string) => void;
  onImageUpload: (id: string, file: File) => void;
  onSpinDurationChange: (duration: number) => void;
  onSoundToggle: (enabled: boolean) => void;
  onWheelShapeChange: (shape: 'circle' | 'fan' | 'clock') => void;
  onExportToExcel: () => void;
  onClearHistory: () => void;
  canAccessFeature: (feature: string) => boolean;
}

const RightColumn: React.FC<RightColumnProps> = ({
  currentTier,
  activeTab,
  segments,
  spinHistory,
  spinDuration,
  enableSound,
  wheelShape,
  onTierChange,
  onTabChange,
  onAddSegment,
  onUpdateSegment,
  onDeleteSegment,
  onImageUpload,
  onSpinDurationChange,
  onSoundToggle,
  onWheelShapeChange,
  onExportToExcel,
  onClearHistory,
  canAccessFeature
}) => {
  return (
    <div className={styles.rightColumn}>
      {/* Tier Selector */}
      <div className={styles.tierSelector}>
        <button 
          className={`${styles.tierButton} ${currentTier === 'personal' ? styles.active : ''}`}
          onClick={() => onTierChange('personal')}
        >
          Cá nhân
        </button>
        <button 
          className={`${styles.tierButton} ${currentTier === 'business' ? styles.active : ''}`}
          onClick={() => onTierChange('business')}
        >
          Doanh nghiệp
        </button>
        <button 
          className={`${styles.tierButton} ${currentTier === 'enterprise' ? styles.active : ''}`}
          onClick={() => onTierChange('enterprise')}
        >
          Sự kiện lớn
        </button>
      </div>

      {/* Tab Navigation */}
      <div className={styles.tabNav}>
        <button 
          className={`${styles.tabButton} ${activeTab === 'history' ? styles.active : ''}`}
          onClick={() => onTabChange('history')}
        >
          Lịch sử
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'settings' ? styles.active : ''}`}
          onClick={() => onTabChange('settings')}
        >
          Cài đặt
        </button>
        {currentTier !== 'personal' && (
          <button 
            className={`${styles.tabButton} ${activeTab === 'customize' ? styles.active : ''}`}
            onClick={() => onTabChange('customize')}
          >
            Tùy chỉnh
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === 'history' && (
          <div className={styles.historyTab}>
            <div className={styles.historyHeader}>
              <h3>Kết quả gần đây</h3>
              <button onClick={onClearHistory} className={styles.clearBtn}>
                Xóa tất cả
              </button>
            </div>
            <div className={styles.historyList}>
              {spinHistory.length === 0 ? (
                <p className={styles.emptyState}>Chưa có kết quả</p>
              ) : (
                spinHistory.map(item => (
                  <div key={item.id} className={styles.historyItem}>
                    <span className={styles.historyResult}>{String(item.result)}</span>
                    <span className={styles.historyTime}>
                      {new Date(item.timestamp).toLocaleTimeString('vi-VN')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className={styles.settingsTab}>
            <div className={styles.segmentsList}>
              <div className={styles.segmentsHeader}>
                <h3>Các tùy chọn ({segments.length})</h3>
                <button onClick={onAddSegment} className={styles.addBtn}>
                  <Plus size={16} /> Thêm
                </button>
              </div>
              {segments.map(segment => (
                <div key={segment.id} className={styles.segmentItem}>
                  <input
                    type="color"
                    value={segment.color}
                    onChange={(e) => onUpdateSegment(segment.id, { color: e.target.value })}
                    className={styles.colorPicker}
                  />
                  <input
                    type="text"
                    value={segment.label}
                    onChange={(e) => onUpdateSegment(segment.id, { label: e.target.value })}
                    className={styles.labelInput}
                  />
                  {currentTier !== 'personal' && (
                    <label className={styles.imageUpload}>
                      <Upload size={16} />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files && onImageUpload(segment.id, e.target.files[0])}
                      />
                    </label>
                  )}
                  <button 
                    onClick={() => onDeleteSegment(segment.id)}
                    className={styles.deleteBtn}
                    disabled={segments.length <= 2}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className={styles.generalSettings}>
              <h3>Cài đặt chung</h3>
              <div className={styles.settingRow}>
                <label>Thời gian quay (giây)</label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={spinDuration}
                  onChange={(e) => onSpinDurationChange(parseInt(e.target.value))}
                  className={styles.numberInput}
                />
              </div>
              <div className={styles.settingRow}>
                <label>Âm thanh</label>
                <input
                  type="checkbox"
                  checked={enableSound}
                  onChange={(e) => onSoundToggle(e.target.checked)}
                  className={styles.checkbox}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'customize' && currentTier !== 'personal' && (
          <div className={styles.customizeTab}>
            <div className={styles.customizeSection}>
              <h3>Hình dạng vòng quay</h3>
              <div className={styles.shapeSelector}>
                <button 
                  className={`${styles.shapeBtn} ${wheelShape === 'circle' ? styles.active : ''}`}
                  onClick={() => onWheelShapeChange('circle')}
                >
                  Tròn
                </button>
                <button 
                  className={`${styles.shapeBtn} ${wheelShape === 'fan' ? styles.active : ''}`}
                  onClick={() => onWheelShapeChange('fan')}
                >
                  Quạt
                </button>
                <button 
                  className={`${styles.shapeBtn} ${wheelShape === 'clock' ? styles.active : ''}`}
                  onClick={() => onWheelShapeChange('clock')}
                >
                  Đồng hồ
                </button>
              </div>
            </div>

            <div className={styles.customizeSection}>
              <h3>Xuất dữ liệu</h3>
              <button onClick={onExportToExcel} className={styles.exportBtn}>
                <Download size={16} /> Xuất Excel
              </button>
            </div>

            {currentTier === 'enterprise' && (
              <div className={styles.customizeSection}>
                <h3>Chế độ đạo diễn</h3>
                <p className={styles.description}>
                  Điều khiển vòng quay từ xa cho sự kiện lớn
                </p>
                <div className={styles.directorLinks}>
                  <a href="/control" className={styles.linkBtn}>
                    <Settings size={16} /> Bảng điều khiển
                  </a>
                  <a href="/display" className={styles.linkBtn}>
                    <Monitor size={16} /> Màn hình LED
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tier Info Footer */}
      <div className={styles.tierInfo}>
        {currentTier === 'personal' && (
          <div className={styles.tierDescription}>
            <Zap size={14} /> 
            <div>
              <strong>Personal - Miễn phí</strong>
              <br />∞ Quay không giới hạn • Lưu cài đặt • Tính năng cơ bản
            </div>
          </div>
        )}
        {currentTier === 'business' && (
          <div className={styles.tierDescription}>
            <Crown size={14} /> 
            <div>
              <strong>Business - $19/tháng</strong>
              <br />Tùy chỉnh đầy đủ • 5 lần quay miễn phí → Đăng ký để tiếp tục
            </div>
          </div>
        )}
        {currentTier === 'enterprise' && (
          <div className={styles.tierDescription}>
            <Monitor size={14} /> 
            <div>
              <strong>Enterprise - Liên hệ</strong>
              <br />Director Mode • Control Panel • Display View • No Limits
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RightColumn;