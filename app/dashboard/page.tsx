'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { 
  Settings, 
  Users, 
  BarChart3, 
  Zap, 
  Sparkles,
  LayoutDashboard,
  Monitor,
  TrendingUp,
  Calendar,
  Award
} from 'lucide-react';
import Header from '@/components/Header/Header';
import styles from './page.module.css';

interface UserData {
  id: string;
  username?: string;
  name: string;
  email: string;
  tier: string;
  avatar?: string;
  createdAt?: string;
}

interface DashboardStats {
  totalSpins: number;
  totalWheels: number;
  totalEvents: number;
  weeklyActivity: number;
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    // Check authentication
    const checkAuth = () => {
      // Check NextAuth session
      if (session?.user) {
        setUser({
          id: session.user.id || '',
          name: session.user.name || '',
          email: session.user.email || '',
          tier: (session.user as any)?.tier || 'PERSONAL',
          avatar: session.user.image
        });
        return;
      }

      // Check localStorage
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (storedUser && token) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        } catch (error) {
          console.error('Error parsing stored user:', error);
          router.push('/auth/login');
        }
      } else {
        router.push('/auth/login');
      }
    };

    if (status !== 'loading') {
      checkAuth();
    }
  }, [session, status, router]);

  useEffect(() => {
    // Load dashboard stats
    if (user) {
      // Mock stats for now - replace with API call
      setStats({
        totalSpins: 42,
        totalWheels: 8,
        totalEvents: 3,
        weeklyActivity: 15
      });
      setLoading(false);
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Đang tải dashboard...</p>
        </div>
      </div>
    );
  }

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
    <div className={styles.container}>
      <Header />
      
      <main className={styles.main}>
        <div className={styles.welcomeSection}>
          <div className={styles.welcomeContent}>
            <h1 className={styles.welcomeTitle}>
              Chào mừng, {user.name}! 👋
            </h1>
            <p className={styles.welcomeSubtitle}>
              Quản lý các hoạt động quay số của bạn
            </p>
            <div 
              className={styles.tierBadge}
              style={{ backgroundColor: getTierColor(user.tier) }}
            >
              <Award size={16} />
              Gói {getTierName(user.tier)}
            </div>
          </div>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Zap size={24} />
            </div>
            <div className={styles.statContent}>
              <h3>{stats?.totalSpins || 0}</h3>
              <p>Lượt quay</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <LayoutDashboard size={24} />
            </div>
            <div className={styles.statContent}>
              <h3>{stats?.totalWheels || 0}</h3>
              <p>Vòng quay</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Calendar size={24} />
            </div>
            <div className={styles.statContent}>
              <h3>{stats?.totalEvents || 0}</h3>
              <p>Sự kiện</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <TrendingUp size={24} />
            </div>
            <div className={styles.statContent}>
              <h3>{stats?.weeklyActivity || 0}</h3>
              <p>Hoạt động tuần</p>
            </div>
          </div>
        </div>

        <div className={styles.quickActions}>
          <h2 className={styles.sectionTitle}>Hành động nhanh</h2>
          <div className={styles.actionsGrid}>
            <Link href="/wheel/personal" className={styles.actionCard}>
              <Sparkles size={32} />
              <h3>Quay vui cá nhân</h3>
              <p>Tạo vòng quay cho giải trí</p>
            </Link>

            {(user.tier === 'BUSINESS' || user.tier === 'ENTERPRISE') && (
              <Link href="/wheel/business" className={styles.actionCard}>
                <LayoutDashboard size={32} />
                <h3>Quay thưởng doanh nghiệp</h3>
                <p>Tổ chức sự kiện cho khách hàng</p>
              </Link>
            )}

            {user.tier === 'ENTERPRISE' && (
              <Link href="/wheel/enterprise" className={styles.actionCard}>
                <Monitor size={32} />
                <h3>Sự kiện lớn</h3>
                <p>Gameshow, Hoa hậu chuyên nghiệp</p>
              </Link>
            )}

            <Link href="/campaign" className={styles.actionCard}>
              <Settings size={32} />
              <h3>Quản lý chiến dịch</h3>
              <p>Xem và chỉnh sửa các chiến dịch</p>
            </Link>

            <Link href="/profile" className={styles.actionCard}>
              <Users size={32} />
              <h3>Hồ sơ cá nhân</h3>
              <p>Cập nhật thông tin tài khoản</p>
            </Link>

            <Link href="/pricing" className={styles.actionCard}>
              <Award size={32} />
              <h3>Nâng cấp gói</h3>
              <p>Mở khóa thêm tính năng</p>
            </Link>
          </div>
        </div>

        <div className={styles.recentActivity}>
          <h2 className={styles.sectionTitle}>Hoạt động gần đây</h2>
          <div className={styles.activityList}>
            <div className={styles.activityItem}>
              <div className={styles.activityIcon}>
                <Sparkles size={20} />
              </div>
              <div className={styles.activityContent}>
                <h4>Tạo vòng quay mới</h4>
                <p>2 giờ trước</p>
              </div>
            </div>

            <div className={styles.activityItem}>
              <div className={styles.activityIcon}>
                <Zap size={20} />
              </div>
              <div className={styles.activityContent}>
                <h4>Quay số thành công</h4>
                <p>1 ngày trước</p>
              </div>
            </div>

            <div className={styles.activityItem}>
              <div className={styles.activityIcon}>
                <Settings size={20} />
              </div>
              <div className={styles.activityContent}>
                <h4>Cập nhật hồ sơ</h4>
                <p>3 ngày trước</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}