// app/profile/components/ProfileHeader.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { User, Camera } from 'lucide-react';
import styles from '../page.module.css';

interface ProfileHeaderProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
    tier: string;
  };
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {
  const [imageError, setImageError] = useState(false);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'BUSINESS': return '#2196F3';
      case 'ENTERPRISE': return '#FF9800';
      default: return '#4CAF50';
    }
  };

  const getTierName = (tier: string) => {
    switch (tier) {
      case 'BUSINESS': return 'Doanh nghiệp';
      case 'ENTERPRISE': return 'Sự kiện lớn';
      default: return 'Cá nhân';
    }
  };

  return (
    <div className={styles.profileHeaderCard}>
      <div className={styles.avatarContainer}>
        {user.avatar && !imageError ? (
          <Image 
            src={user.avatar} 
            alt={user.name}
            width={120}
            height={120}
            className={styles.avatar}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className={styles.avatarPlaceholder}>
            <User size={48} />
          </div>
        )}
        <button className={styles.changeAvatarButton}>
          <Camera size={16} />
        </button>
      </div>

      <div className={styles.userInfo}>
        <h2 className={styles.userName}>{user.name}</h2>
        <p className={styles.userEmail}>{user.email}</p>
        <div 
          className={styles.tierBadge}
          style={{ backgroundColor: getTierColor(user.tier) }}
        >
          {getTierName(user.tier)}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
