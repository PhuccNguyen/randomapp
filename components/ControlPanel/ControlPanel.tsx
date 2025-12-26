// C:\Users\Nguyen Phuc\Web\tingrandom\components\ControlPanel\ControlPanel.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Monitor, AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react';
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
  const { 
    connected, 
    state, 
    triggerSpin, 
    triggerStop, 
    triggerNext, 
    overrideTarget,
    updateScript,
    startAutoSpin,
    stopAutoSpin,
    setStep
  } = useSocket(campaignId);
  
  const [script, setScript] = useState<DirectorScript[]>(initialScript);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const autoSaveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const saveScript = useCallback(async () => {
    console.log('💾 ControlPanel: saveScript called');
    console.log('💾 ControlPanel: Current script:', script);
    setSaving(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('token');
      const payload = { director_script: script };
      console.log('💾 ControlPanel: Sending payload to API:', payload);
      
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log('💾 ControlPanel: API response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save script');
      }

      console.log('💾 ControlPanel: Script saved successfully');
      setMessage({ type: 'success', text: '✅ Lưu kịch bản thành công!' });
      
      // Auto-hide success message
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      console.error('💾 ControlPanel: Save error:', err);
      setMessage({ type: 'error', text: `❌ ${err.message}` });
    } finally {
      setSaving(false);
    }
  }, [campaignId, script]);

  // Sync script to socket when changed
  useEffect(() => {
    console.log('🔵 ControlPanel: Script state changed, length:', script.length);
    console.log('🔵 ControlPanel: Script data:', script);
    if (script.length > 0) {
      console.log('🔵 ControlPanel: Syncing script to socket via updateScript');
      updateScript(script);
      
      // Auto-save to database after 1 second of inactivity
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      autoSaveTimeoutRef.current = setTimeout(() => {
        console.log('💾 ControlPanel: Auto-saving script to database');
        saveScript();
      }, 1000);
    }
    
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [script, updateScript, saveScript]);

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <Monitor size={40} />
          </div>
          <div className={styles.headerInfo}>
            <h1 className={styles.title}>Control Panel</h1>
            <p className={styles.subtitle}>Điều khiển hậu trường - Campaign ID: {campaignId.slice(0, 8)}...</p>
          </div>
        </div>
        
        <div className={styles.headerRight}>
          <button
            onClick={() => window.open(`/display/guest?id=${campaignId}`, '_blank')}
            className={styles.displayButton}
          >
            <ExternalLink size={20} />
            <span>Xem màn hình</span>
          </button>
        </div>
      </header>

      {/* Messages */}
      {message && (
        <div className={`${styles.alert} ${styles[message.type]}`}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className={styles.alertClose}>✕</button>
        </div>
      )}

      {/* Main Layout */}
      <div className={styles.layout}>
        {/* Left Column - Script & Analytics */}
        <div className={styles.leftColumn}>
          <DirectorScriptSection
            script={script}
            judges={items}
            currentStep={state.currentStep}
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
              onAutoSpin={startAutoSpin}
              onStopAutoSpin={stopAutoSpin}
              onSetStep={setStep}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
