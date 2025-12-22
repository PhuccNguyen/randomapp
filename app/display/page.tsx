// app/display/page.tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2, Search, Eye, Calendar, Users, Sparkles } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import Link from 'next/link';
import Wheel from '@/components/Wheel/Wheel';
import Reel from '@/components/Reel/Reel';
import styles from './page.module.css';
import type { JudgeItem } from '@/lib/types';

interface Campaign {
  _id: string;
  name: string;
  mode: string;
  items: JudgeItem[];
  createdAt?: string;
}

interface ControlState {
  status: 'idle' | 'spinning' | 'stopped' | 'completed';
  currentStep: number;
  targetId?: string;
}

function DisplayContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const campaignIdFromUrl = searchParams.get('id');
  
  const [campaignId, setCampaignId] = useState(campaignIdFromUrl || '');
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(!!campaignIdFromUrl);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [error, setError] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [controlState, setControlState] = useState<ControlState>({
    status: 'idle',
    currentStep: 0
  });
  const [isViewing, setIsViewing] = useState(!!campaignIdFromUrl);

  // Wait for session to load
  const isSessionLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated' && !!session?.user;
  const isUserApproved = isAuthenticated && session?.user?.isActive === true; // Kiểm tra user có được approve không

  // Debug: Log session info
  console.log('🔍 Display Page Debug:', {
    status,
    isAuthenticated,
    isUserApproved,
    sessionUser: session?.user,
    isActive: session?.user?.isActive,
    campaignIdFromUrl
  });

  // Fetch user's campaigns if logged in, approved, and no ID in URL
  useEffect(() => {
    if (isUserApproved && !campaignIdFromUrl) {
      setLoadingCampaigns(true);
      fetch('/api/campaigns')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setCampaigns(data.campaigns || []);
          }
          setLoadingCampaigns(false);
        })
        .catch(err => {
          console.error('Error fetching campaigns:', err);
          setLoadingCampaigns(false);
        });
    }
  }, [isUserApproved, campaignIdFromUrl]);

  // Handle search form submit (for guests or manual search)
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!campaignId.trim()) {
      setError('Vui lòng nhập ID chiến dịch');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/campaigns/${campaignId}`);
      const data = await res.json();

      if (data.success && data.campaign) {
        setCampaign(data.campaign);
        setIsViewing(true);
        // Update URL without page reload
        router.push(`/display?id=${campaignId}`);
      } else {
        setError('Không tìm thấy chiến dịch. Vui lòng kiểm tra lại ID.');
        setCampaign(null);
      }
    } catch (err) {
      console.error('Error fetching campaign:', err);
      setError('Có lỗi xảy ra khi tải chiến dịch. Vui lòng thử lại.');
      setCampaign(null);
    } finally {
      setLoading(false);
    }
  };
  
  // ✅ Fetch campaign data when ID is in URL
  useEffect(() => {
    if (!campaignIdFromUrl) {
      setLoading(false);
      return;
    }
    
    fetch(`/api/campaigns/${campaignIdFromUrl}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.campaign) {
          setCampaign(data.campaign);
          setIsViewing(true);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching campaign:', err);
        setLoading(false);
      });
  }, [campaignIdFromUrl]);

  // ✅ Setup Socket.IO connection
  useEffect(() => {
    if (!isViewing || !campaignIdFromUrl) return;

    const socketInstance = io('http://localhost:3000', {
      transports: ['websocket', 'polling']
    });

    socketInstance.on('connect', () => {
      console.log('✅ Display socket connected');
      socketInstance.emit('join', campaignIdFromUrl);
    });

    socketInstance.on('state:update', (newState: Partial<ControlState>) => {
      console.log('📡 Display received state update:', newState);
      setControlState(prev => ({ ...prev, ...newState }));
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Display socket disconnected');
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [isViewing, campaignIdFromUrl]);

  // Reset to search form or campaigns list
  const handleBackToSearch = () => {
    setIsViewing(false);
    setCampaign(null);
    setCampaignId('');
    setError('');
    router.push('/display');
    if (socket) {
      socket.disconnect();
    }
  };

  // Show loading while checking session (chỉ khi không có campaignId trong URL)
  if (isSessionLoading && !campaignIdFromUrl) {
    return (
      <div className={styles.loading}>
        <Loader2 size={48} className={styles.spinner} />
        <p>Đang kiểm tra đăng nhập...</p>
      </div>
    );
  }

  // ===== LOGIC MỚI: Ưu tiên kiểm tra authentication trước =====
  
  // Nếu đang xem campaign (có ID trong URL) → Hiển thị wheel/reel (phần cuối file)
  // Nếu KHÔNG có ID trong URL:
  //   - Đã login → Hiển thị dashboard
  //   - Chưa login → Hiển thị form tìm kiếm
  
  // Show campaigns dashboard cho USER ĐÃ ĐƯỢC APPROVE (không có ID trong URL)
  if (!campaignIdFromUrl && isUserApproved) {
    // Phân loại campaigns
    const activeCampaigns = campaigns.filter(c => c.items && c.items.length > 0);
    const draftCampaigns = campaigns.filter(c => !c.items || c.items.length === 0);
    
    return (
      <div className={styles.userContainer}>
        {/* Header Section */}
        <div className={styles.dashboardHeader}>
          <div className={styles.dashboardHeaderContent}>
            <div className={styles.headerLeft}>
              <h1 className={styles.dashboardTitle}>📺 Display Manager</h1>
              <p className={styles.dashboardSubtitle}>Quản lý và xem trực tiếp các chiến dịch của bạn</p>
            </div>
            <div className={styles.headerActions}>
              <Link href="/campaign" className={styles.createNewButton}>
                <Sparkles size={20} />
                Tạo Chiến Dịch Mới
              </Link>
            </div>
          </div>
        </div>

        <div className={styles.dashboardContent}>
          {loadingCampaigns ? (
            <div className={styles.loadingState}>
              <Loader2 size={48} className={styles.spinner} />
              <p>Đang tải chiến dịch của bạn...</p>
            </div>
          ) : campaigns.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📺</div>
              <h2 className={styles.emptyTitle}>Chưa có chiến dịch nào</h2>
              <p className={styles.emptyDescription}>
                Tạo chiến dịch đầu tiên để bắt đầu sử dụng tính năng display
              </p>
              <Link href="/campaign" className={styles.emptyButton}>
                <Sparkles size={20} />
                Tạo Chiến Dịch Ngay
              </Link>
            </div>
          ) : (
            <>
              {/* Active Campaigns Section */}
              {activeCampaigns.length > 0 && (
                <div className={styles.campaignSection}>
                  <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>
                      <span className={styles.sectionIcon}>🔴</span>
                      Sẵn Sàng Trực Tiếp
                      <span className={styles.sectionCount}>{activeCampaigns.length}</span>
                    </h2>
                    <p className={styles.sectionDesc}>Các chiến dịch có thể xem ngay</p>
                  </div>
                  
                  <div className={styles.campaignsGrid}>
                    {activeCampaigns.map((camp) => (
                      <div key={camp._id} className={styles.campaignCard}>
                        <div className={styles.cardHeader}>
                          <div className={styles.cardBadge}>
                            {camp.mode === 'wheel' ? '🎯 Vòng Tròn' : '🎰 Reel'}
                          </div>
                          <div className={styles.cardActions}>
                            <button
                              className={styles.iconButton}
                              title="Điều khiển"
                              onClick={() => router.push(`/control?id=${camp._id}`)}
                            >
                              🎮
                            </button>
                          </div>
                        </div>

                        <h3 className={styles.cardTitle}>{camp.name}</h3>

                        <div className={styles.cardStats}>
                          <div className={styles.stat}>
                            <Users size={16} />
                            <span>{camp.items?.length || 0} phần tử</span>
                          </div>
                          {camp.createdAt && (
                            <div className={styles.stat}>
                              <Calendar size={16} />
                              <span>{new Date(camp.createdAt).toLocaleDateString('vi-VN')}</span>
                            </div>
                          )}
                        </div>

                        <div className={styles.cardFooter}>
                          <button
                            onClick={() => {
                              setCampaignId(camp._id);
                              setCampaign(camp);
                              setIsViewing(true);
                              router.push(`/display?id=${camp._id}`);
                            }}
                            className={styles.primaryButton}
                          >
                            <Eye size={18} />
                            Xem Trực Tiếp
                          </button>
                          
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/display?id=${camp._id}`);
                              alert('Đã copy link!');
                            }}
                            className={styles.secondaryButton}
                            title="Copy link"
                          >
                            🔗
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Draft Campaigns Section */}
              {draftCampaigns.length > 0 && (
                <div className={styles.campaignSection}>
                  <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>
                      <span className={styles.sectionIcon}>📝</span>
                      Nháp
                      <span className={styles.sectionCount}>{draftCampaigns.length}</span>
                    </h2>
                    <p className={styles.sectionDesc}>Các chiến dịch chưa hoàn thành</p>
                  </div>
                  
                  <div className={styles.campaignsGrid}>
                    {draftCampaigns.map((camp) => (
                      <div key={camp._id} className={`${styles.campaignCard} ${styles.draftCard}`}>
                        <div className={styles.cardHeader}>
                          <div className={styles.cardBadge}>
                            {camp.mode === 'wheel' ? '🎯 Vòng Tròn' : '🎰 Reel'}
                          </div>
                        </div>

                        <h3 className={styles.cardTitle}>{camp.name}</h3>

                        <div className={styles.draftNotice}>
                          <span>⚠️ Chưa có phần tử</span>
                        </div>

                        <div className={styles.cardFooter}>
                          <Link
                            href={`/campaign?edit=${camp._id}`}
                            className={styles.editButton}
                          >
                            ✏️ Chỉnh sửa
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Search Section */}
              <div className={styles.quickSearchSection}>
                <div className={styles.quickSearchCard}>
                  <div className={styles.quickSearchHeader}>
                    <Search size={24} />
                    <h3 className={styles.quickSearchTitle}>Tìm Kiếm Nhanh</h3>
                  </div>
                  <p className={styles.quickSearchDesc}>
                    Nhập ID chiến dịch của bạn hoặc chiến dịch khác để xem trực tiếp
                  </p>
                  
                  <form onSubmit={handleSearch} className={styles.quickSearchForm}>
                    <div className={styles.quickSearchInput}>
                      <Search size={20} className={styles.searchInputIcon} />
                      <input
                        type="text"
                        value={campaignId}
                        onChange={(e) => setCampaignId(e.target.value)}
                        placeholder="Nhập ID chiến dịch (ví dụ: 678777a6e4c3b2a1d0f9e8d7)"
                        className={styles.quickInput}
                        disabled={loading}
                      />
                    </div>

                    {error && (
                      <div className={styles.quickSearchError}>
                        ❌ {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      className={styles.quickSearchButton}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 size={20} className={styles.spinner} />
                          Đang tìm...
                        </>
                      ) : (
                        <>
                          <Search size={20} />
                          Xem Trực Tiếp
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className={styles.dashboardFooter}>
          <div className={styles.footerLogos}>
            <img src="/images/logo/tingnect-logo.png" alt="Tingnect" className={styles.footerLogo} />
            <span className={styles.footerSeparator}>×</span>
            <img src="/images/logo/trustlabs-logos.png" alt="TrustLabs" className={styles.footerLogo} />
          </div>
          <p className={styles.footerText}>Vòng Quay (Tingrandom) - Hệ Sinh Thái Của TINGNECT</p>
          <p className={styles.footerSubtext}>Phát Triển Bởi TRUSTLABS</p>
        </div>
      </div>
    );
  }

  // Show thông báo chờ approve cho USER ĐÃ LOGIN NHƯNG CHƯA ĐƯỢC APPROVE
  if (!campaignIdFromUrl && isAuthenticated && !isUserApproved) {
    return (
      <div className={styles.container}>
        <div className={styles.searchWrapper}>
          <div className={styles.searchCard}>
            <div className={styles.header}>
              <h1 className={styles.title}>⏳ Tài Khoản Chờ Duyệt</h1>
              <p className={styles.subtitle}>
                Tài khoản của bạn đang chờ được kích hoạt
              </p>
            </div>

            <div className={styles.info}>
              <h3>💡 Thông báo</h3>
              <ul>
                <li>Tài khoản của bạn đã được tạo thành công</li>
                <li>Vui lòng chờ quản trị viên kích hoạt tài khoản</li>
                <li>Sau khi được kích hoạt, bạn có thể sử dụng đầy đủ tính năng</li>
                <li>Liên hệ support nếu cần hỗ trợ nhanh hơn</li>
              </ul>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'center' }}>
              <Link href="/" className={styles.searchButton} style={{ textAlign: 'center' }}>
                🏠 Về Trang Chủ
              </Link>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.footerLogos}>
            <img src="/images/logo/tingnect-logo.png" alt="Tingnect" className={styles.footerLogo} />
            <span className={styles.footerSeparator}>×</span>
            <img src="/images/logo/trustlabs-logos.png" alt="TrustLabs" className={styles.footerLogo} />
          </div>
          <p className={styles.footerText}>Vòng Quay (Tingrandom) - Hệ Sinh Thái Của TINGNECT</p>
          <p className={styles.footerSubtext}>Phát Triển Bởi TRUSTLABS</p>
        </div>
      </div>
    );
  }

  // Show search form cho GUEST (chưa login, không có ID trong URL)
  if (!campaignIdFromUrl && !isAuthenticated) {
    return (
      <div className={styles.container}>
        <div className={styles.searchWrapper}>
          <div className={styles.searchCard}>
            <div className={styles.header}>
              <h1 className={styles.title}>🎯 Tìm Kiếm Sự Kiện</h1>
              <p className={styles.subtitle}>
                Nhập ID chiến dịch để xem quay số trực tiếp
              </p>
            </div>

            <form onSubmit={handleSearch} className={styles.searchForm}>
              <div className={styles.inputGroup}>
                <Search size={20} className={styles.searchIcon} />
                <input
                  type="text"
                  value={campaignId}
                  onChange={(e) => setCampaignId(e.target.value)}
                  placeholder="Nhập ID chiến dịch (ví dụ: 678777a6e4c3b2a1d0f9e8d7)"
                  className={styles.input}
                  disabled={loading}
                />
              </div>

              {error && (
                <div className={styles.errorMessage}>
                  ❌ {error}
                </div>
              )}

              <button
                type="submit"
                className={styles.searchButton}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className={styles.spinner} />
                    Đang tìm...
                  </>
                ) : (
                  <>
                    <Search size={20} />
                    Xem trực tiếp
                  </>
                )}
              </button>
            </form>

            <div className={styles.info}>
              <h3>💡 Hướng dẫn</h3>
              <ul>
                <li>Nhập ID chiến dịch mà bạn nhận được từ người tổ chức</li>
                <li>Nhấn "Xem trực tiếp" để theo dõi sự kiện</li>
                <li>Bạn có thể xem vòng quay hoặc reel quay số trực tiếp</li>
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.footerLogos}>
            <img src="/images/logo/tingnect-logo.png" alt="Tingnect" className={styles.footerLogo} />
            <span className={styles.footerSeparator}>×</span>
            <img src="/images/logo/trustlabs-logos.png" alt="TrustLabs" className={styles.footerLogo} />
          </div>
          <p className={styles.footerText}>Vòng Quay (Tingrandom) - Hệ Sinh Thái Của TINGNECT</p>
          <p className={styles.footerSubtext}>Phát Triển Bởi TRUSTLABS</p>
        </div>
      </div>
    );
  }

  // ===== BẮT BUỘC ĐĂNG NHẬP VÀ ĐƯỢC APPROVE ĐỂ XEM CHI TIẾT CAMPAIGN =====
  // Nếu có campaignId trong URL nhưng chưa login hoặc chưa được approve → Yêu cầu đăng nhập/approve
  if (campaignIdFromUrl && !isUserApproved) {
    // Kiểm tra: đã login nhưng chưa approve
    if (isAuthenticated) {
      return (
        <div className={styles.container}>
          <div className={styles.searchWrapper}>
            <div className={styles.searchCard}>
              <div className={styles.header}>
                <h1 className={styles.title}>⏳ Tài Khoản Chờ Duyệt</h1>
                <p className={styles.subtitle}>
                  Tài khoản của bạn đang chờ được kích hoạt để xem chi tiết chiến dịch
                </p>
              </div>

              <div className={styles.info}>
                <h3>💡 Thông báo</h3>
                <ul>
                  <li>Tài khoản của bạn đã được tạo thành công</li>
                  <li>Vui lòng chờ quản trị viên kích hoạt tài khoản</li>
                  <li>Sau khi được kích hoạt, bạn có thể xem chi tiết chiến dịch</li>
                  <li>Liên hệ support nếu cần hỗ trợ nhanh hơn</li>
                </ul>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'center' }}>
                <Link href="/" className={styles.searchButton} style={{ textAlign: 'center' }}>
                  🏠 Về Trang Chủ
                </Link>
              </div>
            </div>
          </div>

          <div className={styles.footer}>
            <div className={styles.footerLogos}>
              <img src="/images/logo/tingnect-logo.png" alt="Tingnect" className={styles.footerLogo} />
              <span className={styles.footerSeparator}>×</span>
              <img src="/images/logo/trustlabs-logos.png" alt="TrustLabs" className={styles.footerLogo} />
            </div>
            <p className={styles.footerText}>Vòng Quay (Tingrandom) - Hệ Sinh Thái Của TINGNECT</p>
            <p className={styles.footerSubtext}>Phát Triển Bởi TRUSTLABS</p>
          </div>
        </div>
      );
    }

    // Chưa login → Yêu cầu đăng nhập
    return (
      <div className={styles.container}>
        <div className={styles.searchWrapper}>
          <div className={styles.searchCard}>
            <div className={styles.header}>
              <h1 className={styles.title}>🔒 Yêu Cầu Đăng Nhập</h1>
              <p className={styles.subtitle}>
                Bạn cần đăng nhập để xem chi tiết chiến dịch
              </p>
            </div>

            <div className={styles.info}>
              <h3>💡 Thông báo</h3>
              <ul>
                <li>Tính năng xem chi tiết chiến dịch yêu cầu đăng nhập</li>
                <li>Vui lòng đăng nhập để tiếp tục</li>
                <li>Nếu chưa có tài khoản, hãy đăng ký miễn phí</li>
              </ul>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <Link href="/auth/login" className={styles.searchButton} style={{ flex: 1, textAlign: 'center' }}>
                🔑 Đăng Nhập
              </Link>
              <Link href="/auth/register" className={styles.searchButton} style={{ flex: 1, textAlign: 'center', background: '#10b981' }}>
                ✨ Đăng Ký
              </Link>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.footerLogos}>
            <img src="/images/logo/tingnect-logo.png" alt="Tingnect" className={styles.footerLogo} />
            <span className={styles.footerSeparator}>×</span>
            <img src="/images/logo/trustlabs-logos.png" alt="TrustLabs" className={styles.footerLogo} />
          </div>
          <p className={styles.footerText}>Vòng Quay (Tingrandom) - Hệ Sinh Thái Của TINGNECT</p>
          <p className={styles.footerSubtext}>Phát Triển Bởi TRUSTLABS</p>
        </div>
      </div>
    );
  }
  
  // ===== CHỈ USER ĐÃ LOGIN MỚI XEM ĐƯỢC CAMPAIGN =====
  if (loading) {
    return (
      <div className={styles.loading}>
        <Loader2 size={48} className={styles.spinner} />
        <p>Đang tải chiến dịch...</p>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className={styles.error}>
        <h2>❌ Không tìm thấy chiến dịch</h2>
        <p>Vui lòng kiểm tra lại ID</p>
        <button onClick={handleBackToSearch} className={styles.backButton}>
          ← Quay lại tìm kiếm
        </button>
      </div>
    );
  }
  
  const ComponentToRender = campaign.mode === 'reel' ? Reel : Wheel;
  
  return (
    <div className={styles.container}>
      <div className={styles.displayHeader}>
        <button onClick={handleBackToSearch} className={styles.backButton}>
          ← Quay lại
        </button>
        <h1 className={styles.campaignTitle}>{campaign.name}</h1>
        <div className={styles.badges}>
          <div className={styles.badge}>
            {campaign.mode === 'wheel' ? '🎯 Vòng Tròn' : '🎰 Trục Ngang'}
          </div>
          <div className={`${styles.statusBadge} ${styles[controlState.status]}`}>
            {controlState.status === 'idle' && '⏸️ Chờ'}
            {controlState.status === 'spinning' && '🔄 Đang quay'}
            {controlState.status === 'stopped' && '✅ Đã dừng'}
            {controlState.status === 'completed' && '🏁 Hoàn thành'}
          </div>
        </div>
      </div>
      
      <div className={styles.displayArea}>
        <ComponentToRender
          items={campaign.items}
          campaignId={campaignIdFromUrl!}
          isSpinning={controlState.status === 'spinning'}
          targetId={controlState.targetId}
        />
      </div>
      
      <div className={styles.footer}>
        <div className={styles.footerLogos}>
          <img src="/images/logo/tingnect-logo.png" alt="Tingnect" className={styles.footerLogo} />
          <span className={styles.footerSeparator}>×</span>
          <img src="/images/logo/trustlabs-logos.png" alt="TrustLabs" className={styles.footerLogo} />
        </div>
        <p className={styles.footerText}>Vòng Quay (Tingrandom) - Hệ Sinh Thái Của TINGNECT</p>
        <p className={styles.footerSubtext}>Phát Triển Bởi TRUSTLABS</p>
      </div>
    </div>
  );
}

export default function DisplayPage() {
  return (
    <Suspense fallback={
      <div className={styles.loading}>
        <Loader2 size={48} className={styles.spinner} />
      </div>
    }>
      <DisplayContent />
    </Suspense>
  );
}
