// C:\Users\Nguyen Phuc\Web\tingrandom\app\display\guest\page.tsx
'use client';

import React, { useState, useEffect, Suspense, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { Tv, Wifi, WifiOff, Loader2, AlertCircle, Trophy, Users, Crown, Play, CheckCircle, Award } from 'lucide-react';
import Wheel from '@/components/Wheel/Wheel';
import styles from './page.module.css';

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
  const confettiRef = useRef<HTMLDivElement>(null);

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
        setCampaign(campaignData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [campaignId, campaignCode]);

  // Socket.IO connection
  useEffect(() => {
    const socketCampaignId = campaignId || campaign?._id;
    
    if (!socketCampaignId) return;

    const newSocket = io('http://localhost:3000', {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
      timeout: 10000
    });

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
        if (data.scriptInfo) {
          console.log('🎰 Display: Received scriptInfo during SPIN:', data.scriptInfo);
          console.log('🎰 ScriptInfo question:', data.scriptInfo.question);
          setScriptInfo(data.scriptInfo);
        } else {
          console.log('🎰 Display: NO scriptInfo in SPIN status');
          setScriptInfo(null);
        }
        setSpinCount(prev => prev + 1);
      } else if (data.status === 'stopped') {
        console.log('⏹️ Status: STOPPED - Data:', data);
        setStopping(true);
        setSpinning(false);
        if (data.targetId) {
          setTargetId(data.targetId);
        }
        // Lưu script info nếu có
        if (data.scriptInfo) {
          console.log('🎰 Display: Received scriptInfo during STOPPED:', data.scriptInfo);
          console.log('🎰 ScriptInfo question:', data.scriptInfo.question);
          setScriptInfo(data.scriptInfo);
        } else {
          console.log('🎰 Display: NO scriptInfo in STOPPED status');
        }
      } else if (data.status === 'idle') {
        console.log('⏸️ Status: IDLE');
        setSpinning(false);
        setStopping(false);
        setTargetId(null);
      }
    });
    
    // Lắng nghe event override riêng nhưng không hiển thị ngay
    newSocket.on('override:target', (data: any) => {
      console.log('🎯 Override target set (hidden):', data.targetId);
      // Không set state ở đây, chỉ backend giữ thông tin
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [campaignId, campaign?._id]);

  // Handle spin complete
  const handleSpinComplete = useCallback((result: any) => {
    console.log('🎉 Winner:', result.name);
    console.log('🎉 ScriptInfo state:', scriptInfo);
    console.log('🎉 Result data:', result);
    console.log('🎉 Result contestant:', result.contestant);
    console.log('🎉 Result question:', result.question);
    
    const newWinner: Winner = {
      id: result.id,
      name: result.name,
      color: result.color || '#667eea',
      timestamp: Date.now(),
      contestant: scriptInfo?.contestant || result.contestant,
      question: scriptInfo?.question || result.question,
      imageUrl: result.imageUrl
    };
    
    console.log('🎉 Final winner object:', newWinner);
    console.log('🎉 Winner question value:', newWinner.question);
    console.log('🎉 Winner question boolean check:', !!newWinner.question);
    
    setWinner(newWinner);
    setHistory(prev => [newWinner, ...prev].slice(0, 10));
    
    // Set fullyStoppedId sau khi vòng quay đã dừng hoàn toàn
    setFullyStoppedId(result.id);
    
    // Gửi kết quả về server để lưu vào history
    if (socket && campaignId) {
      socket.emit('report:result', {
        campaignId: campaignId,
        result: result.name,
        targetId: result.id
      });
    }
    
    // Show winner animation
    setTimeout(() => {
      setShowWinner(true);
      triggerConfetti();
      playWinnerSound();
    }, 500);
  }, [socket, campaignId, scriptInfo]);

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
              <Users size={18} />
              <span>{campaign.items.length}</span>
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
        <main className={styles.wheelSection}>
          <div className={styles.wheelWrapper}>
            {/* Decorative Elements */}
            <div className={styles.wheelDecor}>
              <div className={styles.wheelRing}></div>
              <div className={styles.wheelGlow}></div>
            </div>

            {/* Wheel Component */}
            <Wheel
              items={campaign.items}
              isSpinning={spinning}
              isStopping={stopping}
              targetId={targetId || undefined}
              onSpinComplete={handleSpinComplete}
            />

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
      
      {/* Contestant Info from Script */}
      {winner.contestant && (
        <div className={styles.winnerContestant}>
          <span className={styles.winnerLabel}>Thí sinh</span>
          <span className={styles.winnerContestantName}>{winner.contestant}</span>
        </div>
      )}
      
      {/* Winner Image */}
      {winner.imageUrl && (
        <div className={styles.winnerImageContainer}>
          <img 
            src={winner.imageUrl} 
            alt={winner.name}
            className={styles.winnerImage}
          />
        </div>
      )}
      
      {/* Winner Name */}
      <div 
        className={styles.winnerName}
        style={{ color: winner.color }}
      >
        {winner.name}
      </div>
      
      <p className={styles.winnerSubtext}>đã được chọn!</p>
      
      {/* Question from Script */}
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
