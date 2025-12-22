'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Header from '@/components/Header/Header';
import Wheel from '@/components/Wheel/Wheel';
import { Building2, Plus, Minus, RotateCw, History, Settings, Gift, Users } from 'lucide-react';
import styles from './page.module.css';

export default function BusinessWheelPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [segments, setSegments] = useState([
    'Voucher 100K', 'Discount 50%', 'Free Ship', 'Combo Deal', 'VIP Member', 'Lucky Draw'
  ]);
  const [wheelName, setWheelName] = useState('Vòng quay khuyến mãi');
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [spinHistory, setSpinHistory] = useState<{result: string, time: string, customer?: string}[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [customerName, setCustomerName] = useState('');

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
        router.push('/auth/login?returnTo=/wheel/business');
        return;
      }
      
      try {
        const userData = JSON.parse(storedUser);
        userTier = userData.tier;
      } catch {
        router.push('/auth/login?returnTo=/wheel/business');
        return;
      }
    }
    
    if (userTier !== 'BUSINESS' && userTier !== 'ENTERPRISE') {
      router.push('/pricing?upgrade=business');
      return;
    }
  }, [session, status, router]);

  // Load saved data from localStorage
  useEffect(() => {
    const savedWheel = localStorage.getItem('businessWheel');
    const savedHistory = localStorage.getItem('businessSpinHistory');
    
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
    localStorage.setItem('businessWheel', JSON.stringify(wheelData));
  }, [wheelName, segments]);

  const addSegment = () => {
    if (segments.length < 24) { // Business tier limit
      setSegments([...segments, `Khuyến mãi ${segments.length + 1}`]);
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
      
      // Add to history with customer info
      const newHistory = [{
        result: selectedResult,
        time: new Date().toLocaleString('vi-VN'),
        customer: customerName || 'Khách hàng'
      }, ...spinHistory.slice(0, 99)]; // Keep last 100 results
      
      setSpinHistory(newHistory);
      localStorage.setItem('businessSpinHistory', JSON.stringify(newHistory));
      
      // Clear customer name for next spin
      setCustomerName('');
    }, 3000);
  };

  const resetWheel = () => {
    setSegments(['Voucher 100K', 'Discount 50%', 'Free Ship', 'Combo Deal', 'VIP Member', 'Lucky Draw']);
    setWheelName('Vòng quay khuyến mãi');
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
  if (userTier !== 'BUSINESS' && userTier !== 'ENTERPRISE') {
    return null; // Will redirect
  }

  return (
    <div className={styles.container}>
      <Header />
      
      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <div className={styles.titleSection}>
            <Building2 className={styles.titleIcon} size={32} />
            <div>
              <h1 className={styles.title}>Vòng Quay Doanh Nghiệp</h1>
              <p className={styles.subtitle}>Quay thưởng khuyến mãi cho khách hàng</p>
            </div>
          </div>
          <div className={styles.tierBadge}>
            <span className={styles.tierLabel}>Gói Doanh Nghiệp</span>
            <span className={styles.tierLimit}>Tối đa 24 phần</span>
            <div className={styles.features}>
              <span><Gift size={14} /> Quản lý khuyến mãi</span>
              <span><Users size={14} /> Theo dõi khách hàng</span>
            </div>
          </div>
        </div>

        <div className={styles.content}>
          {/* Wheel Section */}
          <div className={styles.wheelSection}>
            {/* Customer Input */}
            <div className={styles.customerSection}>
              <label htmlFor="customerName">Tên khách hàng (tùy chọn):</label>
              <input
                id="customerName"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nhập tên khách hàng..."
                className={styles.customerInput}
              />
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
                  <div className={styles.resultIcon}>🎁</div>
                  <h3>Chúc mừng khách hàng!</h3>
                  <p>Phần thưởng: <strong>{result}</strong></p>
                  {customerName && <p className={styles.customerResult}>Dành cho: <strong>{customerName}</strong></p>}
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
                {isSpinning ? 'Đang quay...' : 'Quay thưởng!'}
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
              <h3>Cài đặt chương trình</h3>
              
              <div className={styles.inputGroup}>
                <label>Tên chương trình:</label>
                <input 
                  type="text"
                  value={wheelName}
                  onChange={(e) => setWheelName(e.target.value)}
                  className={styles.wheelNameInput}
                  placeholder="Nhập tên chương trình khuyến mãi"
                />
              </div>

              <div className={styles.segmentsSection}>
                <div className={styles.segmentsHeader}>
                  <h4>Các phần thưởng ({segments.length}/24)</h4>
                  <button 
                    onClick={addSegment}
                    disabled={segments.length >= 24}
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
                        placeholder={`Phần thưởng ${index + 1}`}
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
                <h3>Lịch sử quay thưởng</h3>
                <div className={styles.historyList}>
                  {spinHistory.length === 0 ? (
                    <p className={styles.emptyHistory}>Chưa có lịch sử quay thưởng nào</p>
                  ) : (
                    spinHistory.map((item, index) => (
                      <div key={index} className={styles.historyItem}>
                        <div className={styles.historyMain}>
                          <span className={styles.historyResult}>{item.result}</span>
                          <span className={styles.historyCustomer}>{item.customer}</span>
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