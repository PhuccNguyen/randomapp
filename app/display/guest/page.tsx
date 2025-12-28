// C:\Users\Nguyen Phuc\Web\tingrandom\app\display\guest\page.tsx
'use client';

import React, { useState, useEffect, Suspense, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { getSocketUrl, socketOptions } from '@/lib/socket-client';
import { Tv, Wifi, WifiOff, Loader2, AlertCircle, Trophy, Users, Crown, Play, CheckCircle, Award } from 'lucide-react';
// import Wheel from '@/components/Wheel/Wheel';
import styles from './page.module.css';
// Thêm vào đầu file sau các import hiện tại:
import dynamic from 'next/dynamic';

// Dynamic imports cho các component
const Wheel = dynamic(() => import('@/components/Wheel/Wheel'), { ssr: false });
const GlassCylinder = dynamic(() => import('@/components/Wheel/GlassCylinder'), { ssr: false });
const InfiniteHorizon = dynamic(() => import('@/components/Wheel/InfiniteHorizon'), { ssr: false });
const CyberDecode = dynamic(() => import('@/components/Wheel/CyberDecode'), { ssr: false });
const CarouselSwiper = dynamic(() => import('@/components/Wheel/CarouselSwiper'), { ssr: false });

interface WheelItem {
  id: string;
  name: string;
  color: string;
  probability?: number;
  imageUrl?: string;
  contestant?: string;
  question?: string;
}

interface Campaign {
  _id: string;
  name: string;
  description?: string;
  items: WheelItem[];
  mode?: 'wheel' | 'glass-cylinder' | 'infinite-horizon' | 'cyber-decode' | 'carousel-swiper';
  settings: {
    spinDuration?: number;
    spinSound?: boolean;
    confetti?: boolean;
    theme?: string;
  };
}

interface Winner {
  id: string;
  name: string;
  color: string;
  timestamp: number;
  contestant?: string;
  question?: string;
  imageUrl?: string;
}

function GuestDisplayContent() {
  const searchParams = useSearchParams();
  const campaignId = searchParams.get('id');
  const campaignCode = searchParams.get('code');

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [winner, setWinner] = useState<Winner | null>(null);
  const [showWinner, setShowWinner] = useState(false);
  const [history, setHistory] = useState<Winner[]>([]);
  const [spinCount, setSpinCount] = useState(0);
  const [fullyStoppedId, setFullyStoppedId] = useState<string | null>(null); // BGK đã dừng hoàn toàn
  const [scriptInfo, setScriptInfo] = useState<{ contestant?: string; question?: string } | null>(null);
  const [serverContestant, setServerContestant] = useState<string | undefined>(); // ✅ Từ server
  const [serverQuestion, setServerQuestion] = useState<string | undefined>(); // ✅ Từ server
  const confettiRef = useRef<HTMLDivElement>(null);
  const campaignRef = useRef<Campaign | null>(null); // ✅ Keep campaign reference updated

  // Fetch campaign data
  useEffect(() => {
    const fetchCampaign = async () => {
      if (!campaignId && !campaignCode) {
        setError('Thiếu thông tin chiến dịch (id hoặc code)');
        setLoading(false);
        return;
      }

      try {
        let url = '/api/campaigns';
        if (campaignId) {
          url += `/${campaignId}`;
        } else if (campaignCode) {
          url += `?code=${campaignCode}`;
        }

        const token = localStorage.getItem('token');
        const headers: HeadersInit = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, { headers });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Không thể tải thông tin chiến dịch');
        }

        const campaignData = data.campaign || data;
        console.log('✅ Campaign loaded:', campaignData.name);
        console.log('📋 Campaign items:', campaignData.items?.map((i: any, idx: number) => ({ idx, id: i.id, name: i.name })));
        setCampaign(campaignData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [campaignId, campaignCode]);

  // ✅ Keep campaignRef updated whenever campaign changes
  useEffect(() => {
    campaignRef.current = campaign;
  }, [campaign]);

  // Socket.IO connection
  useEffect(() => {
    const socketCampaignId = campaignId || campaign?._id;
    
    if (!socketCampaignId) return;

    const socketUrl = getSocketUrl();
    console.log('🔌 Display Guest connecting to:', socketUrl);
    
    const newSocket = io(socketUrl, socketOptions);

    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id);
      setConnected(true);
      newSocket.emit('join', socketCampaignId);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      setConnected(false);
    });

    newSocket.on('state:update', (data: any) => {
      console.log('📡 State update:', data);
      
      if (data.status === 'spinning') {
        console.log('🔄 Status: SPINNING - Data:', data);
        setSpinning(true);
        setStopping(false);
        setShowWinner(false);
        setWinner(null);
        setFullyStoppedId(null);
        // Lưu script info nếu có trong spinning state
      // ✅ Lưu scriptInfo từ server
        if (data.scriptInfo) {
          console.log('📋 Guest: ScriptInfo received during SPIN:', data.scriptInfo);
          setScriptInfo(data.scriptInfo);
          setServerContestant(data.scriptInfo.contestant);
          setServerQuestion(data.scriptInfo.question);
        }
        
        // Lưu targetId nếu có
        if (data.targetId) {
          setTargetId(data.targetId);
        }
        
        setSpinCount(prev => prev + 1);
        
      } else if (data.status === 'stopped') {
        console.log('⏹️ Guest: STOPPED status');
        console.log('⏹️ Guest: Received data:', {
          targetId: data.targetId,
          contestant: data.contestant,
          question: data.question,
          scriptInfo: data.scriptInfo
        });
        
        const incomingTargetId = data.targetId ?? null;
        setTargetId(incomingTargetId);
        if (incomingTargetId) {
          console.log('✅ Guest: Setting targetId:', incomingTargetId);
        }

        setStopping(true);
        setSpinning(false);
        
        // ✅ Lưu contestant & question từ nhiều nguồn
        const finalContestant = data.contestant || data.scriptInfo?.contestant;
        const finalQuestion = data.question || data.scriptInfo?.question;
        
        if (finalContestant) {
          setServerContestant(finalContestant);
          console.log('👤 Guest: Contestant saved:', finalContestant);
        }
        
        if (finalQuestion) {
          setServerQuestion(finalQuestion);
          console.log('❓ Guest: Question saved:', finalQuestion);
        }
        
        // Lưu scriptInfo
        if (data.scriptInfo) {
          setScriptInfo(data.scriptInfo);
        }
        
      } else if (data.status === 'idle') {
        console.log('⏸️ Guest: IDLE status');
        setSpinning(false);
        setStopping(false);
        setTargetId(null);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [campaignId, campaign?._id]);

  // Handle spin complete
  const handleSpinComplete = useCallback((result: any) => {
    console.log('🎉 Guest: Spin complete - Result:', result);
    console.log('🎉 Guest: ServerContestant:', serverContestant);
    console.log('🎉 Guest: ServerQuestion:', serverQuestion);
    
    // ✅ Tạo winner object với dữ liệu từ server
    const newWinner: Winner = {
      id: result.id,
      name: result.name, // Tên giám khảo
      color: result.color || '#667eea',
      timestamp: Date.now(),
      contestant: serverContestant, // ✅ Tên thí sinh từ server
      question: serverQuestion,     // ✅ Câu hỏi từ server
      imageUrl: result.imageUrl
    };
    
    console.log('🎉 Guest: Final winner object:', newWinner);
    
    setWinner(newWinner);
    setHistory(prev => [newWinner, ...prev].slice(0, 10));
    setFullyStoppedId(result.id);
    
    // Show winner modal
    setTimeout(() => {
      setShowWinner(true);
      triggerConfetti();
      playWinnerSound();
    }, 500);
  }, [serverContestant, serverQuestion]);

  // Confetti effect
  const triggerConfetti = () => {
    if (!confettiRef.current) return;
    
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#a29bfe'];
    
    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement('div');
      confetti.className = styles.confetti;
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = Math.random() * 0.5 + 's';
      confetti.style.animationDuration = Math.random() * 2 + 3 + 's';
      confettiRef.current.appendChild(confetti);
      
      setTimeout(() => confetti.remove(), 5000);
    }
  };

  // Winner sound
  const playWinnerSound = () => {
    if (campaign?.settings?.spinSound) {
      const audio = new Audio('/sounds/winner.mp3');
      audio.volume = 0.5;
      audio.play().catch(err => console.log('Sound play failed:', err));
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner}>
            <Loader2 className={styles.spinner} />
            <div className={styles.loadingPulse}></div>
          </div>
          <h2 className={styles.loadingTitle}>Đang tải chương trình</h2>
          <p className={styles.loadingText}>Vui lòng chờ trong giây lát...</p>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>
            <AlertCircle size={80} />
          </div>
          <h2 className={styles.errorTitle}>Không thể tải chương trình</h2>
          <p className={styles.errorText}>{error || 'Chiến dịch không tồn tại hoặc đã bị xóa'}</p>
          <button onClick={() => window.location.href = '/display'} className={styles.backButton}>
            <span>←</span> Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Animated Background */}
      <div className={styles.animatedBackground}>
        <div className={styles.gradientOrb} style={{ top: '10%', left: '20%' }}></div>
        <div className={styles.gradientOrb} style={{ top: '60%', right: '15%' }}></div>
        <div className={styles.gradientOrb} style={{ bottom: '15%', left: '30%' }}></div>
      </div>

      {/* Confetti Container */}
      <div ref={confettiRef} className={styles.confettiContainer}></div>

      {/* Brand Header */}
      <div className={styles.brandHeader}>
        <div className={styles.brandLogos}>
          <img src="/images/logo/tingnect-logo.png" alt="Tingnect" className={styles.brandLogo} />
          <span className={styles.brandDivider}>×</span>
          <img src="/images/logo/trustlabs-logos.png" alt="TrustLabs" className={styles.brandLogo} />
        </div>
        <div className={styles.brandText}>
          <strong>tingrandom</strong> Hệ Sinh Thái Của <strong>TINGNECT</strong> Phát Triển Bởi <strong>TRUSTLABS</strong>
        </div>
      </div>

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <div className={styles.logoIcon}>
              <Trophy className={styles.logoIconSvg} />
              <div className={styles.logoGlow}></div>
            </div>
            <div className={styles.headerInfo}>
              <h1 className={styles.headerTitle}>
                {campaign.name}
              </h1>
              {campaign.description && (
                <p className={styles.headerSubtitle}>{campaign.description}</p>
              )}
            </div>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.participantsBadge}>
              <Users size={20} strokeWidth={2.5} />
              <span>{campaign.items.length} Giám khảo</span>
            </div>
            <div className={`${styles.liveBadge} ${connected ? styles.liveActive : styles.liveInactive}`}>
              <span className={styles.liveDot}></span>
              <span className={styles.liveText}>
                {connected ? 'TRỰC TIẾP' : 'MẤT KẾT NỐI'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Left Sidebar - History */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <Crown size={20} />
            <h3>Lịch Sử Quay</h3>
          </div>
          
          {history.length === 0 ? (
            <div className={styles.sidebarEmpty}>
              <Trophy size={48} className={styles.emptyIcon} />
              <p>Chưa có kết quả</p>
            </div>
          ) : (
            <div className={styles.historyList}>
              {history.map((item, index) => (
                <div key={item.timestamp} className={styles.historyItem}>
                  <div className={styles.historyRank}>#{index + 1}</div>
                  <div 
                    className={styles.historyColor}
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <div className={styles.historyInfo}>
                    <div className={styles.historyName}>{item.name}</div>
                    <div className={styles.historyTime}>
                      {new Date(item.timestamp).toLocaleTimeString('vi-VN')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* Center - Wheel */}
{/* Center - Dynamic Component based on mode */}
<main className={styles.wheelSection}>
  <div className={styles.wheelWrapper}>
    {/* Decorative Elements */}
    <div className={styles.wheelDecor}>
      <div className={styles.wheelRing}></div>
      <div className={styles.wheelGlow}></div>
    </div>

    {/* Dynamic Component */}
    {campaign.mode === 'glass-cylinder' && (
      <GlassCylinder
        items={campaign.items}
        campaignId={campaign._id}
        isSpinning={spinning}
        isStopping={stopping}
        targetId={targetId || undefined}
        onSpinComplete={handleSpinComplete}
      />
    )}
    
    {campaign.mode === 'infinite-horizon' && (
      <InfiniteHorizon
        items={campaign.items}
        campaignId={campaign._id}
        isSpinning={spinning}
        isStopping={stopping}
        targetId={targetId || undefined}
        onSpinComplete={handleSpinComplete}
      />
    )}
    
    {campaign.mode === 'cyber-decode' && (
      <CyberDecode
        items={campaign.items}
        campaignId={campaign._id}
        isSpinning={spinning}
        isStopping={stopping}
        targetId={targetId || undefined}
        onSpinComplete={handleSpinComplete}
      />
    )}

    {campaign.mode === 'carousel-swiper' && (
      <CarouselSwiper
        items={campaign.items}
        campaignId={campaign._id}
        isSpinning={spinning}
        isStopping={stopping}
        targetId={targetId || undefined}
        onSpinComplete={handleSpinComplete}
      />
    )}
    
    {(!campaign.mode || campaign.mode === 'wheel') && (
      <Wheel
        items={campaign.items}
        campaignId={campaign._id}
        isSpinning={spinning}
        isStopping={stopping}
        targetId={targetId || undefined}
        onSpinComplete={handleSpinComplete}
      />
    )}

    {/* Spin Counter */}
    {spinCount > 0 && (
      <div className={styles.spinCounter}>
        <Play size={16} />
        <span>Lượt {spinCount}</span>
      </div>
    )}
  </div>

          {/* Status Message */}
          <div className={styles.statusMessage}>
            {spinning && (
              <div className={styles.statusSpinning}>
                <div className={styles.statusDots}>
                  <span></span><span></span><span></span>
                </div>
                <p>Đang quay số...</p>
              </div>
            )}
            {!spinning && !showWinner && (
              <div className={styles.statusIdle}>
                <Trophy size={24} />
                <p>Chờ ban tổ chức bắt đầu</p>
              </div>
            )}
          </div>
        </main>

        {/* Right Sidebar - Participants */}
        <aside className={styles.sidebarRight}>
          <div className={styles.sidebarHeader}>
            <Users size={20} />
            <h3>Danh Sách Tham Gia</h3>
          </div>
          
          <div className={styles.participantsList}>
            {campaign.items.map((item, index) => (
              <div 
                key={item.id} 
                className={`${styles.participantItem} ${fullyStoppedId === item.id ? styles.participantHighlight : ''}`}
              >
                <div 
                  className={styles.participantColor}
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className={styles.participantName}>{item.name}</span>
                {fullyStoppedId === item.id && (
                  <span className={styles.participantBadge}>🎯</span>
                )}
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* Winner Modal */}
      {showWinner && winner && (
        <div className={styles.winnerModal}>
          <div className={styles.winnerOverlay} onClick={() => setShowWinner(false)}></div>
          <div className={styles.winnerContent}>
            <div className={styles.winnerIcon}>
              <Crown size={80} />
              <div className={styles.winnerGlow}></div>
            </div>
            
            <h2 className={styles.winnerTitle}>Chúc Mừng!</h2>
            
            {/* ✅ Hiển thị Thí sinh */}
            {winner.contestant && (
              <div className={styles.winnerContestant}>
                <span className={styles.winnerLabel}>Thí sinh</span>
                <span className={styles.winnerContestantName}>{winner.contestant}</span>
              </div>
            )}
            
            {/* ✅ Hiển thị Giám khảo được chọn */}
            <div className={styles.winnerJudgeSection}>
              {winner.imageUrl && (
                <div className={styles.winnerImageContainer}>
                  <img 
                    src={winner.imageUrl} 
                    alt={winner.name}
                    className={styles.winnerImage}
                  />
                </div>
              )}
              
              <div className={styles.winnerJudgeLabel}>Giám khảo được chọn</div>
              <div 
                className={styles.winnerName}
                style={{ color: winner.color }}
              >
                {winner.name}
              </div>
            </div>
            
            <p className={styles.winnerSubtext}>sẽ đặt câu hỏi!</p>
            
            {/* ✅ Hiển thị Câu hỏi */}
            {winner.question && (
              <div className={styles.winnerQuestion}>
                <div className={styles.questionIcon}>❓</div>
                <div className={styles.questionContent}>
                  <span className={styles.questionLabel}>Câu hỏi:</span>
                  <p className={styles.questionText}>{winner.question}</p>
                </div>
              </div>
            )}
            
            <button 
              className={styles.winnerCloseButton}
              onClick={() => setShowWinner(false)}
            >
              Tiếp tục
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLeft}>
            <Award size={20} />
            <span>Vòng quay may mắn - Chúc bạn thành công!</span>
          </div>
          <div className={styles.footerRight}>
            <span className={styles.footerBadge}>
              Powered by Trustlabs
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function GuestDisplayPage() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <Loader2 className={styles.spinner} />
          <p>Đang tải...</p>
        </div>
      </div>
    }>
      <GuestDisplayContent />
    </Suspense>
  );
}
