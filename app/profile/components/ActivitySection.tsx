// app/profile/components/ActivitySection.tsx
'use client';

import React from 'react';
import { Activity, Calendar, Award, TrendingUp } from 'lucide-react';
import styles from '../page.module.css';

interface ActivitySectionProps {
  user: {
    createdAt?: string;
    lastLoginAt?: string;
    campaignsCount?: number;
  };
}

const ActivitySection: React.FC<ActivitySectionProps> = ({ user }) => {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitle}>
          <Activity size={24} />
          <h2>Hoạt động</h2>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <Calendar size={32} color="#4CAF50" />
          <div>
            <h4>Ngày tham gia</h4>
            <p>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'Không rõ'}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <Activity size={32} color="#2196F3" />
          <div>
            <h4>Đăng nhập gần nhất</h4>
            <p>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('vi-VN') : 'Chưa rõ'}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <Award size={32} color="#FF9800" />
          <div>
            <h4>Chiến dịch đã tạo</h4>
            <p>{user.campaignsCount || 0} chiến dịch</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <TrendingUp size={32} color="#9C27B0" />
          <div>
            <h4>Điểm hoạt động</h4>
            <p>{((user.campaignsCount || 0) * 10)} điểm</p>
          </div>
        </div>
      </div>

      <div className={styles.recentActivity}>
        <h3>Hoạt động gần đây</h3>
        <div className={styles.activityList}>
          <div className={styles.activityItem}>
            <div className={styles.activityIcon}>🎯</div>
            <div>
              <p>Đăng nhập hệ thống</p>
              <span>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('vi-VN') : 'Vừa xong'}</span>
            </div>
          </div>
          
          {/* Add more activities as needed */}
        </div>
      </div>
    </div>
  );
};

export default ActivitySection;
