// app/display/guest/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Search } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import Wheel from '@/components/Wheel/Wheel';
import Reel from '@/components/Reel/Reel';
import styles from './page.module.css';
import type { JudgeItem } from '@/lib/types';

interface Campaign {
  _id: string;
  name: string;
  mode: string;
  items: JudgeItem[];
}

interface ControlState {
  status: 'idle' | 'spinning' | 'stopped' | 'completed';
  currentStep: number;
  targetId?: string;
}

export default function GuestDisplayPage() {
  const router = useRouter();
  const [campaignId, setCampaignId] = useState('');
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [controlState, setControlState] = useState<ControlState>({
    status: 'idle',
    currentStep: 0
  });
  const [isViewing, setIsViewing] = useState(false);

  // Fetch campaign data
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

  // Setup Socket.IO connection when viewing campaign
  useEffect(() => {
    if (!isViewing || !campaignId) return;

    const socketInstance = io('http://localhost:3000', {
      transports: ['websocket', 'polling']
    });

    socketInstance.on('connect', () => {
      console.log('✅ Guest display socket connected');
      socketInstance.emit('join', campaignId);
    });

    socketInstance.on('state:update', (newState: Partial<ControlState>) => {
      console.log('📡 Guest display received state update:', newState);
      setControlState(prev => ({ ...prev, ...newState }));
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Guest display socket disconnected');
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [isViewing, campaignId]);

  // Reset to search form
  const handleBackToSearch = () => {
    setIsViewing(false);
    setCampaign(null);
    setCampaignId('');
    setError('');
    if (socket) {
      socket.disconnect();
    }
  };

  // Show search form
  if (!isViewing) {
    return (
      <div className={styles.container}>
        <div className={styles.searchWrapper}>
          <div className={styles.searchCard}>
            <div className={styles.header}>
              <h1 className={styles.title}>🎯 Xem Sự Kiện Trực Tiếp</h1>
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

  // Show loading state
  if (loading) {
    return (
      <div className={styles.loading}>
        <Loader2 size={48} className={styles.spinner} />
        <p>Đang tải chiến dịch...</p>
      </div>
    );
  }

  // Show campaign display
  if (campaign) {
    const ComponentToRender = campaign.mode === 'reel' ? Reel : Wheel;

    return (
      <div className={styles.container}>
        <div className={styles.displayHeader}>
          <button onClick={handleBackToSearch} className={styles.backButton}>
            ← Quay lại
          </button>
          <h1 className={styles.campaignTitle}>{campaign.name}</h1>
          <div className={styles.badges}>
            <div className={styles.modeBadge}>
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
            campaignId={campaignId}
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

  return null;
}
