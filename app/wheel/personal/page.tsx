'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Header from '@/components/Header/Header';
import Wheel from '@/components/Wheel/Wheel';
import { Sparkles, Plus, Minus, RotateCw, History, Settings } from 'lucide-react';
import styles from './page.module.css';

export default function PersonalWheelPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [segments, setSegments] = useState([
    'Giải nhất', 'Giải nhì', 'Giải ba', 'May mắn lần sau'
  ]);
  const [wheelName, setWheelName] = useState('Vòng quay cá nhân');
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [spinHistory, setSpinHistory] = useState<{result: string, time: string}[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return; // Still loading
    
    // Check NextAuth session first
    if (session) return;
    
    // Check localStorage as fallback
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!storedUser || !token) {
      router.push('/auth/login?returnTo=/wheel/personal');
      return;
    }
  }, [session, status, router]);

  // Load saved data from localStorage
  useEffect(() => {
    const savedWheel = localStorage.getItem('personalWheel');
    const savedHistory = localStorage.getItem('personalSpinHistory');
    
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
    localStorage.setItem('personalWheel', JSON.stringify(wheelData));
  }, [wheelName, segments]);

  const addSegment = () => {
    if (segments.length < 12) { // Personal tier limit
      setSegments([...segments, `Phần thưởng ${segments.length + 1}`]);
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
    
    // Simulate spinning time
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * segments.length);
      const selectedResult = segments[randomIndex];
      setResult(selectedResult);
      setIsSpinning(false);
      
      // Add to history
      const newHistory = [{
        result: selectedResult,
        time: new Date().toLocaleString('vi-VN')
      }, ...spinHistory.slice(0, 49)]; // Keep last 50 results
      
      setSpinHistory(newHistory);
      localStorage.setItem('personalSpinHistory', JSON.stringify(newHistory));
    }, 3000);
  };

  const resetWheel = () => {
    setSegments(['Giải nhất', 'Giải nhì', 'Giải ba', 'May mắn lần sau']);
    setWheelName('Vòng quay cá nhân');
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

  return (
    <div className={styles.container}>
      <Header />
      
      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <div className={styles.titleSection}>
            <Sparkles className={styles.titleIcon} size={32} />
            <div>
              <h1 className={styles.title}>Vòng Quay Cá Nhân</h1>
              <p className={styles.subtitle}>Quay vui, giải trí cùng bạn bè</p>
            </div>
          </div>
          <div className={styles.tierBadge}>
            <span className={styles.tierLabel}>Gói Cá Nhân</span>
            <span className={styles.tierLimit}>Tối đa 12 phần</span>
          </div>
        </div>

        <div className={styles.content}>
          {/* Wheel Section */}
          <div className={styles.wheelSection}>
            <div className={styles.wheelContainer}>
              <Wheel 
                segments={segments}
                isSpinning={isSpinning}
                result={result}
                onSpin={handleSpin}
              />
              
              {result && (
                <div className={styles.resultDisplay}>
                  <div className={styles.resultIcon}>🎉</div>
                  <h3>Chúc mừng!</h3>
                  <p>Bạn đã quay được: <strong>{result}</strong></p>
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
                {isSpinning ? 'Đang quay...' : 'Quay ngay!'}
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
              <h3>Cài đặt vòng quay</h3>
              
              <div className={styles.inputGroup}>
                <label>Tên vòng quay:</label>
                <input 
                  type="text"
                  value={wheelName}
                  onChange={(e) => setWheelName(e.target.value)}
                  className={styles.wheelNameInput}
                  placeholder="Nhập tên vòng quay"
                />
              </div>

              <div className={styles.segmentsSection}>
                <div className={styles.segmentsHeader}>
                  <h4>Các phần quay ({segments.length}/12)</h4>
                  <button 
                    onClick={addSegment}
                    disabled={segments.length >= 12}
                    className={styles.addButton}
                  >
                    <Plus size={16} />
                    Thêm
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
                        placeholder={`Phần ${index + 1}`}
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
                <h3>Lịch sử quay</h3>
                <div className={styles.historyList}>
                  {spinHistory.length === 0 ? (
                    <p className={styles.emptyHistory}>Chưa có lịch sử quay nào</p>
                  ) : (
                    spinHistory.map((item, index) => (
                      <div key={index} className={styles.historyItem}>
                        <span className={styles.historyResult}>{item.result}</span>
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