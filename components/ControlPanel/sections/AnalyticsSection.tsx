// components/ControlPanel/sections/AnalyticsSection.tsx
'use client';

import React from 'react';
import { BarChart3, Download } from 'lucide-react';
import { HistoryItem } from '../types';
import styles from '../ControlPanel.module.css';

interface AnalyticsSectionProps {
  history?: HistoryItem[]; // ✅ Make optional to handle undefined
}

const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({ history = [] }) => { // ✅ Default to empty array
  const exportHistory = () => {
    if (!history || history.length === 0) return; // ✅ Guard clause
    
    const csv = [
      'Bước,Kết quả,Thời gian',
      ...history.map(h => `${h.step},${h.result},${new Date(h.timestamp).toLocaleString('vi-VN')}`)
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `history_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url); // ✅ Cleanup
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <BarChart3 className={styles.sectionIcon} />
        <h2>Lịch Sử ({history?.length || 0})</h2>
        {history && history.length > 0 && (
          <button onClick={exportHistory} className={styles.exportButton}>
            <Download size={16} /> Xuất CSV
          </button>
        )}
      </div>

      {!history || history.length === 0 ? (
        <div className={styles.emptyState}>
          <BarChart3 size={48} />
          <p>Chưa có lịch sử quay</p>
        </div>
      ) : (
        <div className={styles.historyList}>
          {history.map((item, index) => (
            <div key={index} className={styles.historyItem}>
              <span className={styles.historyStep}>#{item.step}</span>
              <span className={styles.historyResult}>{item.result}</span>
              <span className={styles.historyTime}>
                {new Date(item.timestamp).toLocaleTimeString('vi-VN')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnalyticsSection;
