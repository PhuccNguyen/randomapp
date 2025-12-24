// components/ControlPanel/ControlPanel.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Monitor, AlertCircle, CheckCircle2 } from 'lucide-react';
import DirectorScriptSection from './sections/DirectorScriptSection';
import LiveControlSection from './sections/LiveControlSection';
import AnalyticsSection from './sections/AnalyticsSection';
import { useSocket } from './hooks/useSocket';
import { JudgeItem, DirectorScript } from './types';
import styles from './ControlPanel.module.css';

interface ControlPanelProps {
  campaignId: string;
  items: JudgeItem[];
  script: DirectorScript[];
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  campaignId,
  items,
  script: initialScript
}) => {
  const router = useRouter();
  const { connected, state, triggerSpin, triggerStop, triggerNext, overrideTarget } = useSocket(campaignId);
  
  const [script, setScript] = useState<DirectorScript[]>(initialScript);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const saveScript = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ director_script: script })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save script');
      }

      setMessage({ type: 'success', text: 'Lưu kịch bản thành công!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Monitor size={32} />
        <div>
          <h1 className={styles.title}>Control Panel - Điều Khiển Hậu Trường</h1>
          <p className={styles.subtitle}>Campaign ID: {campaignId}</p>
        </div>
        <button
          onClick={() => window.open(`/display/guest?id=${campaignId}`, '_blank')}
          className={styles.displayButton}
        >
          📺 Xem màn hình
        </button>
      </div>

      {/* Messages */}
      {message && (
        <div className={`${styles.alert} ${styles[message.type]}`}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      <div className={styles.layout}>
        {/* Left Column - Script & Analytics */}
        <div className={styles.leftColumn}>
          <DirectorScriptSection
            script={script}
            judges={items}
            onScriptChange={setScript}
            onSave={saveScript}
          />

          <AnalyticsSection history={state.history} />
        </div>

        {/* Right Column - Live Control */}
        <div className={styles.rightColumn}>
          <div className={styles.stickyContainer}>
            <LiveControlSection
              state={state}
              connected={connected}
              judges={items}
              onSpin={triggerSpin}
              onStop={triggerStop}
              onNext={triggerNext}
              onOverride={overrideTarget}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
