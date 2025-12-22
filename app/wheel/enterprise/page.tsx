'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Header from '@/components/Header/Header';
import Wheel from '@/components/Wheel/Wheel';
import { Crown, Plus, Minus, RotateCw, History, Settings, Trophy, Star, Users, Camera } from 'lucide-react';
import styles from './page.module.css';

export default function EnterpriseWheelPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [segments, setSegments] = useState([
    'Giải Đặc Biệt 1 tỷ', 'Giải Nhất 500 triệu', 'Giải Nhì 100 triệu', 'Giải Ba 50 triệu',
    'Giải Khuyến Khích', 'Vé tham gia tiếp', 'Quà lưu niệm', 'Chụp ảnh với MC'
  ]);
  const [wheelName, setWheelName] = useState('Vòng quay siêu khủng');
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [spinHistory, setSpinHistory] = useState<{result: string, time: string, contestant?: string, notes?: string}[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [contestantInfo, setContestantInfo] = useState({
    name: '',
    number: '',
    notes: ''
  });

  // Redirect if not authenticated or wrong tier
  useEffect(() => {
    if (status === 'loading') return;
    
    let userTier = '';
    
    // Check NextAuth session first
    if (session) {
      userTier = (session.user as any)?.tier;
    } else {
      // Check localStorage as fallback
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (!storedUser || !token) {
        router.push('/auth/login?returnTo=/wheel/enterprise');
        return;
      }
      
      try {
        const userData = JSON.parse(storedUser);
        userTier = userData.tier;
      } catch {
        router.push('/auth/login?returnTo=/wheel/enterprise');
        return;
      }
    }
    
    if (userTier !== 'ENTERPRISE') {
      router.push('/pricing?upgrade=enterprise');
      return;
    }
  }, [session, status, router]);

  // Load saved data from localStorage
  useEffect(() => {
    const savedWheel = localStorage.getItem('enterpriseWheel');
    const savedHistory = localStorage.getItem('enterpriseSpinHistory');
    
    if (savedWheel) {
      const { name, segments: savedSegments } = JSON.parse(savedWheel);
      setWheelName(name);
      setSegments(savedSegments);
    }
    
    if (savedHistory) {
      setSpinHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save wheel data whenever it changes
  useEffect(() => {
    const wheelData = { name: wheelName, segments };
    localStorage.setItem('enterpriseWheel', JSON.stringify(wheelData));
  }, [wheelName, segments]);

  const addSegment = () => {
    if (segments.length < 50) { // Enterprise tier limit - unlimited practically
      setSegments([...segments, `Giải thưởng ${segments.length + 1}`]);
    }
  };

  const removeSegment = (index: number) => {
    if (segments.length > 2) {
      setSegments(segments.filter((_, i) => i !== index));
    }
  };

  const updateSegment = (index: number, value: string) => {
    const newSegments = [...segments];
    newSegments[index] = value;
    setSegments(newSegments);
  };

  const handleSpin = () => {
    if (isSpinning || segments.length < 2) return;
    
    setIsSpinning(true);
    setResult(null);
    
    // Simulate spinning time (longer for dramatic effect)
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * segments.length);
      const selectedResult = segments[randomIndex];
      setResult(selectedResult);
      setIsSpinning(false);
      
      // Add to history with contestant info
      const newHistory = [{
        result: selectedResult,
        time: new Date().toLocaleString('vi-VN'),
        contestant: contestantInfo.name || 'Thí sinh',
        notes: contestantInfo.notes
      }, ...spinHistory.slice(0, 199)]; // Keep last 200 results
      
      setSpinHistory(newHistory);
      localStorage.setItem('enterpriseSpinHistory', JSON.stringify(newHistory));
      
      // Clear contestant info for next spin
      setContestantInfo({ name: '', number: '', notes: '' });
    }, 4000); // Longer spin for enterprise
  };

  const resetWheel = () => {
    setSegments([
      'Giải Đặc Biệt 1 tỷ', 'Giải Nhất 500 triệu', 'Giải Nhì 100 triệu', 'Giải Ba 50 triệu',
      'Giải Khuyến Khích', 'Vé tham gia tiếp', 'Quà lưu niệm', 'Chụp ảnh với MC'
    ]);
    setWheelName('Vòng quay siêu khủng');
    setResult(null);
  };

  if (status === 'loading') {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Đang tải...</p>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect
  }

  const userTier = (session.user as any)?.tier;
  if (userTier !== 'ENTERPRISE') {
    return null; // Will redirect
  }

  return (
    <div className={styles.container}>
      <Header />
      
      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <div className={styles.titleSection}>
            <Crown className={styles.titleIcon} size={32} />
            <div>
              <h1 className={styles.title}>Sự Kiện Lớn - Vòng Quay Đặc Biệt</h1>
              <p className={styles.subtitle}>Hoa Hậu, Gameshow, Sự kiện truyền hình</p>
            </div>
          </div>
          <div className={styles.tierBadge}>
            <span className={styles.tierLabel}>Gói Enterprise</span>
            <span className={styles.tierLimit}>Không giới hạn</span>
            <div className={styles.features}>
              <span><Trophy size={14} /> Giải thưởng lớn</span>
              <span><Camera size={14} /> Phát sóng trực tiếp</span>
              <span><Star size={14} /> Hiệu ứng đặc biệt</span>
            </div>
          </div>
        </div>

        <div className={styles.content}>
          {/* Wheel Section */}
          <div className={styles.wheelSection}>
            {/* Contestant Input */}
            <div className={styles.contestantSection}>
              <h4><Users size={18} /> Thông tin thí sinh</h4>
              <div className={styles.contestantForm}>
                <div className={styles.inputRow}>
                  <div className={styles.inputGroup}>
                    <label>Tên thí sinh:</label>
                    <input
                      type="text"
                      value={contestantInfo.name}
                      onChange={(e) => setContestantInfo({...contestantInfo, name: e.target.value})}
                      placeholder="Nguyễn Thị A"
                      className={styles.contestantInput}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Số báo danh:</label>
                    <input
                      type="text"
                      value={contestantInfo.number}
                      onChange={(e) => setContestantInfo({...contestantInfo, number: e.target.value})}
                      placeholder="SBD 001"
                      className={styles.contestantInput}
                    />
                  </div>
                </div>
                <div className={styles.inputGroup}>
                  <label>Ghi chú:</label>
                  <input
                    type="text"
                    value={contestantInfo.notes}
                    onChange={(e) => setContestantInfo({...contestantInfo, notes: e.target.value})}
                    placeholder="Vòng chung kết, Phần thi tài năng..."
                    className={styles.contestantInput}
                  />
                </div>
              </div>
            </div>

            <div className={styles.wheelContainer}>
              <Wheel 
                segments={segments}
                isSpinning={isSpinning}
                result={result}
                onSpin={handleSpin}
              />
              
              {result && (
                <div className={styles.resultDisplay}>
                  <div className={styles.resultIcon}>👑</div>
                  <h3>Xin chúc mừng!</h3>
                  <p className={styles.mainResult}>Giải thưởng: <strong>{result}</strong></p>
                  {contestantInfo.name && (
                    <div className={styles.contestantResult}>
                      <p>Thí sinh: <strong>{contestantInfo.name}</strong></p>
                      {contestantInfo.number && <p>SBD: <strong>{contestantInfo.number}</strong></p>}
                    </div>
                  )}
                  {contestantInfo.notes && (
                    <p className={styles.resultNotes}>{contestantInfo.notes}</p>
                  )}
                </div>
              )}
            </div>

            <div className={styles.wheelControls}>
              <button 
                onClick={handleSpin}
                disabled={isSpinning || segments.length < 2}
                className={styles.spinButton}
              >
                <RotateCw size={20} />
                {isSpinning ? 'Đang quay siêu khủng...' : 'Quay đặc biệt!'}
              </button>
              
              <button 
                onClick={() => setShowHistory(!showHistory)}
                className={styles.historyButton}
              >
                <History size={18} />
                Lịch sử ({spinHistory.length})
              </button>
              
              <button 
                onClick={resetWheel}
                className={styles.resetButton}
              >
                <Settings size={18} />
                Đặt lại
              </button>
            </div>
          </div>

          {/* Settings Section */}
          <div className={styles.settingsSection}>
            <div className={styles.wheelSettings}>
              <h3><Trophy size={20} /> Cài đặt sự kiện</h3>
              
              <div className={styles.inputGroup}>
                <label>Tên sự kiện:</label>
                <input 
                  type="text"
                  value={wheelName}
                  onChange={(e) => setWheelName(e.target.value)}
                  className={styles.wheelNameInput}
                  placeholder="Chung kết Hoa Hậu Việt Nam 2025"
                />
              </div>

              <div className={styles.segmentsSection}>
                <div className={styles.segmentsHeader}>
                  <h4>Các giải thưởng ({segments.length}/50)</h4>
                  <button 
                    onClick={addSegment}
                    disabled={segments.length >= 50}
                    className={styles.addButton}
                  >
                    <Plus size={16} />
                    Thêm giải
                  </button>
                </div>

                <div className={styles.segmentsList}>
                  {segments.map((segment, index) => (
                    <div key={index} className={styles.segmentItem}>
                      <span className={styles.segmentNumber}>{index + 1}</span>
                      <input 
                        type="text"
                        value={segment}
                        onChange={(e) => updateSegment(index, e.target.value)}
                        className={styles.segmentInput}
                        placeholder={`Giải thưởng ${index + 1}`}
                      />
                      <button 
                        onClick={() => removeSegment(index)}
                        disabled={segments.length <= 2}
                        className={styles.removeButton}
                      >
                        <Minus size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* History Section */}
            {showHistory && (
              <div className={styles.historySection}>
                <h3><History size={20} /> Lịch sử sự kiện</h3>
                <div className={styles.historyList}>
                  {spinHistory.length === 0 ? (
                    <p className={styles.emptyHistory}>Chưa có lịch sử quay nào</p>
                  ) : (
                    spinHistory.map((item, index) => (
                      <div key={index} className={styles.historyItem}>
                        <div className={styles.historyMain}>
                          <span className={styles.historyResult}>{item.result}</span>
                          <div className={styles.historyDetails}>
                            <span className={styles.historyContestant}>{item.contestant}</span>
                            {item.notes && <span className={styles.historyNotes}>{item.notes}</span>}
                          </div>
                        </div>
                        <span className={styles.historyTime}>{item.time}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}