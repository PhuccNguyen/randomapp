// C:\Users\Nguyen Phuc\Web\tingrandom\components\ControlPanel\sections\LiveControlSection.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, SkipForward, Target, Wifi, WifiOff, Clock, Zap, Pause, PlayCircle } from 'lucide-react';
import { ControlState, JudgeItem } from '../types';
import styles from '../ControlPanel.module.css';

interface LiveControlSectionProps {
  state: ControlState;
  connected: boolean;
  judges: JudgeItem[];
  onSpin: (duration?: number) => void;
  onStop: () => void;
  onNext: () => void;
  onOverride: (targetId: string) => void;
  onAutoSpin?: (duration: number) => void;
  onStopAutoSpin?: () => void;
  onSetStep?: (stepIndex: number) => void;
}

const LiveControlSection: React.FC<LiveControlSectionProps> = ({
  state,
  connected,
  judges,
  onSpin,
  onStop,
  onNext,
  onOverride,
  onAutoSpin,
  onStopAutoSpin,
  onSetStep
}) => {
  const [spinDuration, setSpinDuration] = useState(5);
  const [autoMode, setAutoMode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [overrideTarget, setOverrideTarget] = useState<string>('');
  const [autoStopTimer, setAutoStopTimer] = useState<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Sync override với state.targetId từ script (chỉ khi có script)
  useEffect(() => {
    if (state.targetId && !overrideTarget) {
      // Chỉ sync nếu user chưa chọn override thủ công
      // setOverrideTarget(state.targetId); // Không auto-fill để user tự quyết định
    }
  }, [state.targetId]);

  // Countdown timer for display only
  useEffect(() => {
    if (countdown > 0) {
      countdownRef.current = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    }

    return () => {
      if (countdownRef.current) {
        clearTimeout(countdownRef.current);
      }
    };
  }, [countdown]);

  // Cleanup auto-stop timer
  useEffect(() => {
    return () => {
      if (autoStopTimer) {
        clearTimeout(autoStopTimer);
      }
    };
  }, [autoStopTimer]);

  // ==================== HANDLER FUNCTIONS ====================

  // 🎮 MANUAL SPIN: Quay thủ công, không giới hạn thời gian
  const handleManualSpin = () => {
    console.log('🎮 Manual Spin - No time limit');
    
    // Set override nếu có
    if (overrideTarget) {
      onOverride(overrideTarget);
    }
    
    // Quay không có duration (hoặc duration rất lớn)
    onSpin(999); // Quay "vô hạn"
  };

  // ⏹️ MANUAL STOP: Dừng thủ công
  const handleManualStop = () => {
    console.log('⏹️ Manual Stop');
    onStop();
    setCountdown(0);
    
    // Clear timer nếu có
    if (autoStopTimer) {
      clearTimeout(autoStopTimer);
      setAutoStopTimer(null);
    }
  };

  // 📜 SCRIPT NEXT: Tự động theo kịch bản
  const handleScriptNext = () => {
    console.log('📜 Script Next - Running CURRENT script step:', state.currentStep);
    
    // Lấy script bước HIỆN TẠI (không phải next)
    const currentScriptStep = state.script?.[state.currentStep];
    
    if (!currentScriptStep) {
      console.error('❌ No script found for step', state.currentStep);
      return;
    }
    
    console.log('📋 Current script:', currentScriptStep);
    
    // Set override target từ script TRƯỚC KHI quay
    const scriptTargetId = currentScriptStep.target_judge_id;
    if (scriptTargetId) {
      console.log('🎯 Setting target from script:', scriptTargetId, '-', judges.find(j => j.id === scriptTargetId)?.name);
      onOverride(scriptTargetId);
    }
    
    // Đợi 50ms để override apply xong
    setTimeout(() => {
      // Bắt đầu quay với thời gian đã set
      onSpin(spinDuration);
      setCountdown(spinDuration);
      
      // Tự động dừng sau spinDuration giây
      const timer = setTimeout(() => {
        console.log('⏱️ Auto-stop after', spinDuration, 'seconds');
        onStop();
        setCountdown(0);
        
        // SAU KHI DỪNG, tự động chuyển sang bước tiếp theo
        setTimeout(() => {
          console.log('⏭️ Moving to next step after completion');
          onNext();
        }, 1000); // Đợi 1s sau khi dừng để hiển thị kết quả
      }, spinDuration * 1000);
      
      setAutoStopTimer(timer);
    }, 50);
  };

  // 🔄 AUTO MODE: Bật/tắt chế độ tự động liên tục
  const handleToggleAutoMode = () => {
    if (!autoMode) {
      console.log('🔄 Auto Mode: ON');
      setAutoMode(true);
      startAutoSpinCycle();
    } else {
      console.log('⏸️ Auto Mode: OFF');
      setAutoMode(false);
      handleManualStop();
    }
  };

  // Vòng lặp tự động
  const startAutoSpinCycle = () => {
    // Set override nếu có
    if (overrideTarget) {
      onOverride(overrideTarget);
    }
    
    // Quay
    onSpin(spinDuration);
    setCountdown(spinDuration);
    
    // Tự động dừng và quay lại
    const timer = setTimeout(() => {
      onStop();
      
      // Đợi 2s rồi quay lại
      setTimeout(() => {
        if (autoMode) {
          startAutoSpinCycle();
        }
      }, 2000);
    }, spinDuration * 1000);
    
    setAutoStopTimer(timer);
  };

  // 🎯 Override target change
  const handleOverrideChange = (targetId: string) => {
    setOverrideTarget(targetId);
    if (targetId) {
      onOverride(targetId);
    }
  };

  return (
    <div className={styles.section}>
      {/* ==================== HEADER ==================== */}
      <div className={styles.sectionHeader}>
        {connected ? (
          <Wifi className={styles.sectionIcon} style={{ color: '#10b981' }} />
        ) : (
          <WifiOff className={styles.sectionIcon} style={{ color: '#ef4444' }} />
        )}
        <h2>Điều Khiển Trực Tiếp</h2>
        <div className={`${styles.statusBadge} ${connected ? styles.connected : styles.disconnected}`}>
          <span className={styles.statusDot}></span>
          {connected ? 'Kết nối' : 'Mất kết nối'}
        </div>
      </div>

      {/* ==================== STATUS DISPLAY ==================== */}
      <div className={styles.stateDisplay}>
        <div className={styles.stateCard}>
          <span className={styles.stateLabel}>Trạng thái</span>
          <span className={`${styles.stateBadge} ${styles[state.status]}`}>
            {state.status === 'idle' && '⏸️ Chờ'}
            {state.status === 'spinning' && '🔄 Đang quay'}
            {state.status === 'stopped' && '✅ Đã dừng'}
            {state.status === 'completed' && '🏁 Hoàn thành'}
          </span>
        </div>

        <div className={styles.stateCard}>
          <span className={styles.stateLabel}>Bước</span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="number"
              min="0"
              max={state.script ? state.script.length - 1 : 0}
              value={state.currentStep}
              onChange={(e) => {
                const stepIndex = Math.max(0, Math.min(parseInt(e.target.value) || 0, state.script ? state.script.length - 1 : 0));
                onSetStep?.(stepIndex);
              }}
              disabled={!connected || state.status === 'spinning'}
              style={{
                width: '60px',
                padding: '6px 8px',
                fontSize: '16px',
                fontWeight: 'bold',
                textAlign: 'center',
                border: '2px solid #3b82f6',
                borderRadius: '6px',
                backgroundColor: '#f0f9ff',
                cursor: !connected || state.status === 'spinning' ? 'not-allowed' : 'pointer'
              }}
            />
            <span style={{ fontSize: '14px', color: '#666' }}>/ {state.script ? state.script.length : 0}</span>
            <button
              onClick={() => onSetStep?.(0)}
              disabled={!connected || state.status === 'spinning' || state.currentStep === 0}
              style={{
                padding: '6px 10px',
                fontSize: '12px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: !connected || state.status === 'spinning' || state.currentStep === 0 ? 'not-allowed' : 'pointer',
                opacity: !connected || state.status === 'spinning' || state.currentStep === 0 ? 0.5 : 1
              }}
              title="Reset về bước 0"
            >
              🔄
            </button>
          </div>
        </div>

        {countdown > 0 && (
          <div className={styles.stateCard}>
            <span className={styles.stateLabel}>Đếm ngược</span>
            <span className={styles.countdownValue}>{countdown}s</span>
          </div>
        )}

        {autoMode && (
          <div className={styles.stateCard}>
            <span className={styles.stateLabel}>Chế độ</span>
            <span className={styles.autoModeBadge}>🔄 Tự động</span>
          </div>
        )}
      </div>



      {/* ==================== ZONE 1: ĐIỀU KHIỂN CHÍNH ==================== */}
      <div className={styles.controlZone}>
        <h3 className={styles.zoneTitle}>
          <PlayCircle size={20} />
          <span>Điều Khiển Chính</span>
        </h3>

        <div className={styles.controlGrid}>
          {/* MANUAL SPIN */}
          <button
            onClick={handleManualSpin}
            disabled={state.status === 'spinning' || !connected || autoMode}
            className={`${styles.controlButton} ${styles.spinButton}`}
            title="Quay thủ công - Dừng khi bạn muốn"
          >
            <Play size={24} />
            <div className={styles.buttonContent}>
              <span className={styles.buttonLabel}>Quay</span>
              <span className={styles.buttonHint}>Thủ công</span>
            </div>
          </button>

          {/* MANUAL STOP */}
          <button
            onClick={handleManualStop}
            disabled={state.status !== 'spinning' || !connected}
            className={`${styles.controlButton} ${styles.stopButton}`}
            title="Dừng ngay lập tức"
          >
            <Square size={24} />
            <div className={styles.buttonContent}>
              <span className={styles.buttonLabel}>Dừng</span>
              <span className={styles.buttonHint}>Lập tức</span>
            </div>
          </button>

          {/* SCRIPT NEXT */}
          <button
            onClick={handleScriptNext}
            disabled={state.status === 'spinning' || !connected || autoMode || !state.script || state.script.length === 0}
            className={`${styles.controlButton} ${styles.nextButton}`}
            title="Tự động theo kịch bản tiếp theo"
          >
            <SkipForward size={24} />
            <div className={styles.buttonContent}>
              <span className={styles.buttonLabel}>Tiếp Theo</span>
              <span className={styles.buttonHint}>Kịch bản ({spinDuration}s)</span>
            </div>
          </button>
        </div>

        <div className={styles.controlHints}>
          <div className={styles.hint}>
            <strong>Quay + Dừng:</strong> Điều khiển hoàn toàn thủ công, không giới hạn thời gian
          </div>
          <div className={styles.hint}>
            <strong>Tiếp Theo:</strong> Tự động chạy kịch bản, quay {spinDuration}s và dừng theo BGK đã soạn
          </div>
        </div>
      </div>

      {/* ==================== ZONE 2: CÀI ĐẶT ==================== */}
      <div className={styles.controlZone}>
        <h3 className={styles.zoneTitle}>
          <Clock size={20} />
          <span>Cài Đặt</span>
        </h3>

        {/* Spin Duration */}
        <div className={styles.settingGroup}>
          <label className={styles.settingLabel}>
            Thời gian quay: <strong>{spinDuration}s</strong>
          </label>
          <p className={styles.settingDesc}>
            Áp dụng cho: <strong>Tiếp Theo</strong> và <strong>Tự Động</strong>
          </p>
          
          <div className={styles.sliderContainer}>
            <input
              type="range"
              min="3"
              max="15"
              step="0.5"
              value={spinDuration}
              onChange={(e) => setSpinDuration(parseFloat(e.target.value))}
              className={styles.rangeInput}
              disabled={!connected || state.status === 'spinning'}
            />
            <div className={styles.sliderLabels}>
              <span>3s</span>
              <span>9s</span>
              <span>15s</span>
            </div>
          </div>
          
          <div className={styles.quickDurations}>
            {[3, 5, 7, 10].map(duration => (
              <button
                key={duration}
                onClick={() => setSpinDuration(duration)}
                className={`${styles.quickDurationBtn} ${spinDuration === duration ? styles.active : ''}`}
                disabled={!connected || state.status === 'spinning'}
              >
                {duration}s
              </button>
            ))}
          </div>
        </div>

        {/* Override Target */}
        <div className={styles.settingGroup}>
          <label className={styles.settingLabel}>
            <Target size={18} />
            <span>Ép kết quả (Director Mode)</span>
          </label>
          <p className={styles.settingDesc}>
            Áp dụng cho: <strong>Quay</strong> và <strong>Tự Động</strong>
          </p>
          
          <select
            value={overrideTarget}
            onChange={(e) => handleOverrideChange(e.target.value)}
            className={styles.select}
            disabled={!connected}
          >
            <option value="">🎲 Ngẫu nhiên</option>
            {judges.map(judge => (
              <option key={judge.id} value={judge.id}>
                {judge.name}
              </option>
            ))}
          </select>
          
          {overrideTarget && (
            <div className={styles.overridePreview}>
              <span className={styles.overrideIcon}>🎯</span>
              <span>Sẽ dừng tại: <strong>{judges.find(j => j.id === overrideTarget)?.name}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* ==================== ZONE 3: KỊCH BẢN HIỆN TẠI ==================== */}
      {state.targetId && state.script && state.script[state.currentStep] && (
        <div className={styles.controlZone}>
          <h3 className={styles.zoneTitle}>
            <span className={styles.scriptIcon}>📜</span>
            <span>Kịch Bản Bước {state.currentStep + 1}</span>
          </h3>

          <div className={styles.scriptDisplay}>
            <div className={styles.scriptRow}>
              <span className={styles.scriptLabel}>🎯 Giám khảo:</span>
              <span className={styles.scriptValue}>
                <strong>{judges.find(j => j.id === state.targetId)?.name}</strong>
              </span>
            </div>

            {state.script[state.currentStep].contestant && (
              <div className={styles.scriptRow}>
                <span className={styles.scriptLabel}>👤 Thí sinh:</span>
                <span className={styles.scriptValue}>
                  <strong>{state.script[state.currentStep].contestant}</strong>
                </span>
              </div>
            )}

            {state.script[state.currentStep].question_content && (
              <div className={styles.scriptQuestionBox}>
                <span className={styles.scriptLabel}>❓ Câu hỏi:</span>
                <p className={styles.scriptQuestionText}>
                  {state.script[state.currentStep].question_content}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== ZONE 4: CHẾ ĐỘ TỰ ĐỘNG ==================== */}
      <div className={styles.controlZone}>
        <h3 className={styles.zoneTitle}>
          <Zap size={20} />
          <span>Chế Độ Tự Động</span>
        </h3>

        <div className={styles.autoModeSection}>
          <p className={styles.autoModeDesc}>
            Vòng quay sẽ tự động quay liên tục, mỗi lượt <strong>{spinDuration}s</strong>
            {overrideTarget && (
              <span> và dừng tại <strong>{judges.find(j => j.id === overrideTarget)?.name}</strong></span>
            )}
          </p>

          <button
            onClick={handleToggleAutoMode}
            disabled={!connected}
            className={autoMode ? styles.autoModeButtonStop : styles.autoModeButton}
          >
            {autoMode ? (
              <>
                <Pause size={20} />
                <span>Dừng Tự Động</span>
              </>
            ) : (
              <>
                <Zap size={20} />
                <span>Bắt Đầu Tự Động</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveControlSection;
