// C:\Users\Nguyen Phuc\Web\tingrandom\app\display\page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Tv, Search, Plus, Play, Edit, Trash2, Eye, EyeOff, Loader2, Home } from 'lucide-react';
import styles from './page.module.css';

interface Campaign {
  _id: string;
  name: string;
  description?: string;
  mode: 'personal' | 'business' | 'enterprise';
  isPublic: boolean;
  createdAt: string;
  items?: { name: string }[];
}

const DisplayPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  
  const [searchCode, setSearchCode] = useState('');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [localUser, setLocalUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check localStorage for user (custom auth)
  useEffect(() => {
    const checkLocalUser = () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      console.log('🔍 Display: Checking localStorage', { hasUser: !!storedUser, hasToken: !!token });
      if (storedUser && token) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log('✅ Display: User found in localStorage', parsedUser);
          setLocalUser(parsedUser);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('❌ Display: Error parsing stored user:', error);
          setLocalUser(null);
          setIsAuthenticated(false);
        }
      } else {
        console.log('❌ Display: No user or token in localStorage');
        setLocalUser(null);
        setIsAuthenticated(false);
      }
    };

    checkLocalUser();

    // Listen for storage changes and custom events
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === 'token') {
        checkLocalUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    const handleUserChange = () => checkLocalUser();
    window.addEventListener('userChanged', handleUserChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userChanged', handleUserChange);
    };
  }, []);

  // Update authentication status based on NextAuth or localStorage
  useEffect(() => {
    console.log('🔍 Display: Auth status', { nextAuthStatus: status, hasLocalUser: !!localUser });
    if (status === 'authenticated' || localUser) {
      console.log('✅ Display: User is authenticated');
      setIsAuthenticated(true);
    } else if (status === 'unauthenticated' && !localUser) {
      console.log('❌ Display: User is NOT authenticated');
      setIsAuthenticated(false);
    }
  }, [status, localUser]);

  // Fetch user campaigns if authenticated
  useEffect(() => {
    console.log('🔍 Display: isAuthenticated changed to:', isAuthenticated);
    if (isAuthenticated) {
      console.log('🚀 Display: Fetching campaigns...');
      fetchCampaigns();
    }
  }, [isAuthenticated]);

  const fetchCampaigns = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      console.log('🔍 Display: Fetching campaigns with token:', token ? 'EXISTS' : 'MISSING');
      
      const response = await fetch('/api/campaigns', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log('📦 Display: API response:', { ok: response.ok, status: response.status, data });

      if (!response.ok) {
        throw new Error(data.error || 'Không thể tải danh sách chiến dịch');
      }

      console.log('✅ Display: Campaigns loaded:', data.campaigns?.length || 0);
      setCampaigns(data.campaigns || []);
    } catch (err: any) {
      console.error('❌ Display: Error fetching campaigns:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim()) {
      setError('Vui lòng nhập mã chương trình');
      return;
    }

    // Navigate to guest display with code
    router.push(`/display/guest?code=${searchCode}`);
  };

  const handleViewCampaign = (campaignId: string) => {
    router.push(`/display/guest?id=${campaignId}`);
  };

  const handleEditCampaign = (campaignId: string) => {
    router.push(`/campaign?id=${campaignId}`);
  };

  const handleControlCampaign = (campaignId: string) => {
    window.open(`/control?id=${campaignId}`, '_blank');
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm('Bạn có chắc muốn xóa chiến dịch này?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Không thể xóa chiến dịch');
      }

      setSuccess('Xóa chiến dịch thành công!');
      fetchCampaigns();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const togglePublic = async (campaignId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isPublic: !currentStatus })
      });

      if (!response.ok) {
        throw new Error('Không thể cập nhật trạng thái');
      }

      setSuccess('Cập nhật trạng thái thành công!');
      fetchCampaigns();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <Tv className={styles.headerIcon} />
            <div>
              <h1 className={styles.headerTitle}>Màn Hình Hiển Thị</h1>
              <p className={styles.headerSubtitle}>Quản lý và xem các chương trình trực tiếp</p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <button
              onClick={() => router.push('/')}
              className={styles.homeButton}
              title="Về trang chủ"
            >
              <Home size={20} />
              Trang chủ
            </button>
            {isAuthenticated && (
              <button
                onClick={() => router.push('/campaign')}
                className={styles.createButton}
              >
                <Plus size={20} />
                Tạo chiến dịch mới
              </button>
            )}
          </div>
        </div>
      </header>

      <div className={styles.content}>
        {/* Messages */}
        {error && (
          <div className={styles.alertError}>
            {error}
            <button onClick={() => setError('')}>✕</button>
          </div>
        )}
        {success && (
          <div className={styles.alertSuccess}>
            {success}
            <button onClick={() => setSuccess('')}>✕</button>
          </div>
        )}

        {/* Search Section - Always visible */}
        <section className={styles.searchSection}>
          <div className={styles.sectionHeader}>
            <Search className={styles.sectionIcon} />
            <h2>Tham Gia Chương Trình Trực Tiếp</h2>
          </div>

          <form onSubmit={handleSearch} className={styles.searchForm}>
            <div className={styles.searchInputGroup}>
              <Search className={styles.searchIcon} />
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="Nhập mã chương trình (VD: ABC123)"
                className={styles.searchInput}
              />
            </div>
            <button type="submit" className={styles.searchButton}>
              <Play size={20} />
              Tham gia
            </button>
          </form>

          <p className={styles.searchHint}>
            💡 Nhập mã chương trình mà bạn nhận được từ ban tổ chức để xem trực tiếp
          </p>
        </section>

        {/* Display Manager - Only for authenticated users */}
        {isAuthenticated && (
          <section className={styles.managerSection}>
            <div className={styles.sectionHeader}>
              <Tv className={styles.sectionIcon} />
              <h2>Quản Lý Màn Hình Hiển Thị</h2>
            </div>

            {loading ? (
              <div className={styles.loadingState}>
                <Loader2 className={styles.spinner} />
                <p>Đang tải danh sách chiến dịch...</p>
              </div>
            ) : campaigns.length === 0 ? (
              <div className={styles.emptyState}>
                <Tv size={64} className={styles.emptyIcon} />
                <h3>Chưa có chiến dịch nào</h3>
                <p>Chiến dịch bạn tạo sẽ xuất hiện ở đây - chỉ bạn mới có thể thấy</p>
                <button
                  onClick={() => router.push('/campaign')}
                  className={styles.emptyButton}
                >
                  <Plus size={20} />
                  Tạo chiến dịch ngay
                </button>
              </div>
            ) : (
              <div className={styles.campaignGrid}>
                {campaigns.map((campaign) => (
                  <div key={campaign._id} className={styles.campaignCard}>
                    <div className={styles.cardHeader}>
                      <h3 className={styles.cardTitle}>{campaign.name}</h3>
                      <span className={`${styles.modeBadge} ${styles[campaign.mode]}`}>
                        {campaign.mode === 'personal' && '👤 Cá nhân'}
                        {campaign.mode === 'business' && '🏢 Doanh nghiệp'}
                        {campaign.mode === 'enterprise' && '🏛️ Tập đoàn'}
                      </span>
                    </div>

                    {campaign.description && (
                      <p className={styles.cardDescription}>{campaign.description}</p>
                    )}

                    <div className={styles.cardInfo}>
                      <span className={styles.infoItem}>
                        📊 {campaign.items?.length || 0} mục
                      </span>
                      <span className={styles.infoItem}>
                        📅 {new Date(campaign.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>

                    <div className={styles.cardActions}>
                      <button
                        onClick={() => handleViewCampaign(campaign._id)}
                        className={styles.actionButton}
                        title="Xem màn hình"
                      >
                        <Play size={18} />
                        <span>Xem</span>
                      </button>

                      <button
                        onClick={() => handleControlCampaign(campaign._id)}
                        className={styles.actionButton}
                        title="Điều khiển"
                      >
                        <Tv size={18} />
                        <span>Điều khiển</span>
                      </button>

                      <button
                        onClick={() => handleEditCampaign(campaign._id)}
                        className={styles.actionButton}
                        title="Chỉnh sửa"
                      >
                        <Edit size={18} />
                      </button>

                      <button
                        onClick={() => togglePublic(campaign._id, campaign.isPublic)}
                        className={`${styles.actionButton} ${campaign.isPublic ? styles.public : styles.private}`}
                        title={campaign.isPublic ? 'Đang công khai' : 'Đang riêng tư'}
                      >
                        {campaign.isPublic ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>

                      <button
                        onClick={() => handleDeleteCampaign(campaign._id)}
                        className={`${styles.actionButton} ${styles.danger}`}
                        title="Xóa"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Guest message */}
        {!isAuthenticated && (
          <div className={styles.guestMessage}>
            <p>
              👋 Bạn chưa đăng nhập. Hãy đăng nhập để quản lý chiến dịch của riêng bạn!
            </p>
            <div className={styles.guestCta}>
              <a href="/auth/login" className={`${styles.guestButton} ${styles.guestButtonPrimary}`}>
                🔑 Đăng Nhập Ngay
              </a>
              <a href="/auth/register" className={`${styles.guestButton} ${styles.guestButtonSecondary}`}>
                📝 Tạo Tài Khoản
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DisplayPage;
