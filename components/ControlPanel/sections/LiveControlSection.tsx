// components/ControlPanel/sections/LiveControlSection.tsx
'use client';

import React from 'react';
import { Play, Square, SkipForward, Target, Wifi, WifiOff } from 'lucide-react';
import { ControlState, JudgeItem } from '../types';
import styles from '../ControlPanel.module.css';

interface LiveControlSectionProps {
  state: ControlState;
  connected: boolean;
  judges: JudgeItem[];
  onSpin: () => void;
  onStop: () => void;
  onNext: () => void;
  onOverride: (targetId: string) => void;
}

const LiveControlSection: React.FC<LiveControlSectionProps> = ({
  state,
  connected,
  judges,
  onSpin,
  onStop,
  onNext,
  onOverride
}) => {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        {connected ? <Wifi className={styles.sectionIcon} color="#10b981" /> : <WifiOff className={styles.sectionIcon} color="#ef4444" />}
        <h2>Điều Khiển Trực Tiếp</h2>
        <div className={`${styles.statusBadge} ${connected ? styles.connected : styles.disconnected}`}>
          {connected ? '🟢 Kết nối' : '🔴 Mất kết nối'}
        </div>
      </div>

      {/* Main Controls */}
      <div className={styles.controlGrid}>
        <button
          onClick={onSpin}
          disabled={state.status === 'spinning' || !connected}
          className={`${styles.controlButton} ${styles.spinButton}`}
        >
          <Play size={24} />
          <span>Quay</span>
        </button>

        <button
          onClick={onStop}
          disabled={state.status !== 'spinning' || !connected}
          className={`${styles.controlButton} ${styles.stopButton}`}
        >
          <Square size={24} />
          <span>Dừng</span>
        </button>

        <button
          onClick={onNext}
          disabled={state.status === 'spinning' || !connected}
          className={`${styles.controlButton} ${styles.nextButton}`}
        >
          <SkipForward size={24} />
          <span>Tiếp theo</span>
        </button>
      </div>

      {/* Current State */}
      <div className={styles.stateInfo}>
        <div className={styles.stateRow}>
          <span className={styles.stateLabel}>Trạng thái:</span>
          <span className={`${styles.stateValue} ${styles[state.status]}`}>
            {state.status === 'idle' && '⏸️ Chờ'}
            {state.status === 'spinning' && '🔄 Đang quay'}
            {state.status === 'stopped' && '✅ Đã dừng'}
            {state.status === 'completed' && '🏁 Hoàn thành'}
          </span>
        </div>

        <div className={styles.stateRow}>
          <span className={styles.stateLabel}>Bước hiện tại:</span>
          <span className={styles.stateValue}>{state.currentStep}</span>
        </div>

        {state.targetId && (
          <div className={styles.stateRow}>
            <span className={styles.stateLabel}>Mục tiêu:</span>
            <span className={styles.stateValue}>
              {judges.find(j => j.id === state.targetId)?.name || state.targetId}
            </span>
          </div>
        )}
      </div>

      {/* Override Target */}
      <div className={styles.overrideSection}>
        <label className={styles.overrideLabel}>
          <Target size={16} />
          <span>Ép kết quả (Director Mode):</span>
        </label>
        <select
          onChange={(e) => e.target.value && onOverride(e.target.value)}
          className={styles.select}
          disabled={!connected || state.status === 'spinning'}
          defaultValue=""
        >
          <option value="">-- Chọn giám khảo --</option>
          {judges.map(judge => (
            <option key={judge.id} value={judge.id}>
              {judge.name}
            </option>
          ))}
        </select>
        <p className={styles.overrideHint}>
          💡 Vòng quay sẽ dừng ở giám khảo này khi bạn nhấn "Dừng"
        </p>
      </div>
    </div>
  );
};

export default LiveControlSection;
