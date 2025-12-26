// C:\Users\Nguyen Phuc\Web\tingrandom\components\ControlPanel\sections\AnalyticsSection.tsx
'use client';

import React, { useMemo } from 'react';
import { BarChart3, Download, TrendingUp, Award } from 'lucide-react';
import { HistoryItem } from '../types';
import styles from '../ControlPanel.module.css';

interface AnalyticsSectionProps {
  history: HistoryItem[];
}

const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({ history = [] }) => {
  const stats = useMemo(() => {
    if (!history || history.length === 0) {
      return { total: 0, unique: 0, topWinner: null };
    }

    const winCounts: Record<string, number> = {};
    history.forEach(item => {
      winCounts[item.result] = (winCounts[item.result] || 0) + 1;
    });

    const topWinner = Object.entries(winCounts).sort((a, b) => b[1] - a[1])[0];

    return {
      total: history.length,
      unique: Object.keys(winCounts).length,
      topWinner: topWinner ? { name: topWinner[0], count: topWinner[1] } : null
    };
  }, [history]);

  const exportHistory = () => {
    if (!history || history.length === 0) {
      alert('Không có dữ liệu để xuất!');
      return;
    }

    const csv = [
      'Bước,Kết quả,Thí sinh,Câu hỏi,Thời gian',
      ...history.map(h => 
        `${h.step},"${h.result}","${h.contestant || 'N/A'}","${h.question || 'N/A'}","${new Date(h.timestamp).toLocaleString('vi-VN')}"`
      )
    ].join('\n');

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `history_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <BarChart3 className={styles.sectionIcon} />
        <h2>Lịch Sử & Thống Kê</h2>
        {history && history.length > 0 && (
          <button onClick={exportHistory} className={styles.exportButton} title="Xuất CSV">
            <Download size={16} />
          </button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <TrendingUp size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Tổng lượt</span>
            <span className={styles.statValue}>{stats.total}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <BarChart3 size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Người trúng</span>
            <span className={styles.statValue}>{stats.unique}</span>
          </div>
        </div>

        {stats.topWinner && (
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Award size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Nhiều nhất</span>
              <span className={styles.statValue}>{stats.topWinner.name}</span>
              <span className={styles.statBadge}>{stats.topWinner.count} lần</span>
            </div>
          </div>
        )}
      </div>

      {/* History List */}
      {!history || history.length === 0 ? (
        <div className={styles.emptyState}>
          <BarChart3 size={64} className={styles.emptyIcon} />
          <h3>Chưa có lịch sử</h3>
          <p>Lịch sử quay sẽ được hiển thị ở đây</p>
        </div>
      ) : (
        <div className={styles.historyList}>
          {history.map((item, index) => (
            <div key={index} className={styles.historyItem}>
              <div className={styles.historyRank}>
                <span className={styles.rankNumber}>#{item.step}</span>
              </div>
              
              <div 
                className={styles.historyColor}
                style={{ backgroundColor: item.color || '#667eea' }}
              ></div>
              
              <div className={styles.historyInfo}>
                <div className={styles.historyResult}>{item.result}</div>
                {item.contestant && (
                  <div className={styles.historyContestant}>👤 {item.contestant}</div>
                )}
                {item.question && (
                  <div className={styles.historyQuestion}>❓ {item.question}</div>
                )}
                <div className={styles.historyTime}>
                  🕐 {new Date(item.timestamp).toLocaleTimeString('vi-VN')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnalyticsSection;
