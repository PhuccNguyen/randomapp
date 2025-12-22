'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header/Header';
import { Settings as WheelIcon } from 'lucide-react';
import styles from './page.module.css';

export default function CreateWheelPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isGuestMode = searchParams.get('mode') === 'guest';
  
  const [segments, setSegments] = useState([
    'Giải nhất', 'Giải nhì', 'Giải ba', 'May mắn lần sau'
  ]);
  const [wheelName, setWheelName] = useState('Vòng quay may mắn');
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinHistory, setSpinHistory] = useState<{result: string, time: string}[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load saved data from localStorage
  useEffect(() => {
    const savedWheel = localStorage.getItem('currentWheel');
    const savedHistory = localStorage.getItem('spinHistory');
    
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
    localStorage.setItem('currentWheel', JSON.stringify(wheelData));
  }, [wheelName, segments]);

  const addSegment = () => {
    if (segments.length < (isGuestMode ? 12 : 50)) {
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

  const handleSpinWheel = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setTimeout(() => {
      setIsSpinning(false);
      const winner = segments[Math.floor(Math.random() * segments.length)];
      const newResult = {
        result: winner,
        time: new Date().toLocaleString('vi-VN')
      };
      
      // Add to history
      const updatedHistory = [newResult, ...spinHistory].slice(0, 20); // Keep last 20 results
      setSpinHistory(updatedHistory);
      localStorage.setItem('spinHistory', JSON.stringify(updatedHistory));
      
      alert(`🎉 Chúc mừng! Kết quả: ${winner}`);
    }, 3000);
  };

  const handleSaveWheel = () => {
    // Luôn lưu được vào localStorage
    const wheelData = { name: wheelName, segments, createdAt: new Date().toISOString() };
    const savedWheels = JSON.parse(localStorage.getItem('savedWheels') || '[]');
    const updatedWheels = [wheelData, ...savedWheels].slice(0, 5); // Keep 5 latest wheels
    localStorage.setItem('savedWheels', JSON.stringify(updatedWheels));
    
    if (isGuestMode) {
      alert('✅ Đã lưu vòng quay! Đăng ký để sync trên nhiều thiết bị và không giới hạn số lượng.');
      const shouldRegister = confirm('Muốn đăng ký để có thêm tính năng không?');
      if (shouldRegister) {
        router.push('/auth/register');
      }
    } else {
      // TODO: Implement save to database
      alert('Đã lưu vòng quay thành công!');
    }
  };

  return (
    <div className={styles.container}>
      <Header />
      
      <main className={styles.main}>
        <div className={styles.content}>
          {/* Guest Mode Banner */}
          {isGuestMode && (
            <div className={styles.guestBanner}>
              <div className={styles.guestIcon}>🎯</div>
              <div className={styles.guestText}>
                <strong>Chế độ khách - Quay vui miễn phí!</strong>
                <p>Đăng ký để lưu vòng quay và mở khóa thêm tính năng</p>
              </div>
              <button 
                onClick={() => router.push('/auth/register')}
                className={styles.guestUpgrade}
              >
                Nâng cấp ngay
              </button>
            </div>
          )}

          <div className={styles.wheelEditor}>
            {/* Left Panel - Settings */}
            <div className={styles.editorPanel}>
              <div className={styles.panelHeader}>
                <WheelIcon size={24} />
                <h2>Thiết lập vòng quay</h2>
              </div>

              <div className={styles.inputGroup}>
                <label>Tên vòng quay:</label>
                <input 
                  type="text"
                  value={wheelName}
                  onChange={(e) => setWheelName(e.target.value)}
                  className={styles.wheelNameInput}
                />
              </div>

              <div className={styles.segmentsSection}>
                <div className={styles.segmentsHeader}>
                  <h3>Danh sách phần thưởng ({segments.length}/{isGuestMode ? 12 : 50})</h3>
                  <button 
                    onClick={addSegment}
                    disabled={segments.length >= (isGuestMode ? 12 : 50)}
                    className={styles.addButton}
                  >
                    + Thêm
                  </button>
                </div>

                <div className={styles.segmentsList}>
                  {segments.map((segment, index) => (
                    <div key={index} className={styles.segmentItem}>
                      <input 
                        type="text"
                        value={segment}
                        onChange={(e) => updateSegment(index, e.target.value)}
                        className={styles.segmentInput}
                      />
                      <button 
                        onClick={() => removeSegment(index)}
                        disabled={segments.length <= 2}
                        className={styles.removeButton}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.actionButtons}>
                <button 
                  onClick={handleSpinWheel}
                  disabled={isSpinning}
                  className={styles.spinButton}
                >
                  {isSpinning ? '🎲 Đang quay...' : '🎲 Quay ngay!'}
                </button>
                <button 
                  onClick={handleSaveWheel}
                  className={styles.saveButton}
                >
                  💾 Lưu vòng quay
                </button>
              </div>

              {/* Spin History Section */}
              <div className={styles.historySection}>
                <div className={styles.historyHeader}>
                  <h3>📊 Lịch sử quay ({spinHistory.length})</h3>
                  <button 
                    onClick={() => setShowHistory(!showHistory)}
                    className={styles.toggleButton}
                  >
                    {showHistory ? '🔼' : '🔽'}
                  </button>
                </div>
                {showHistory && (
                  <div className={styles.historyList}>
                    {spinHistory.length === 0 ? (
                      <p className={styles.emptyHistory}>Chưa có lần quay nào</p>
                    ) : (
                      spinHistory.map((item, index) => (
                        <div key={index} className={styles.historyItem}>
                          <span className={styles.historyResult}>{item.result}</span>
                          <span className={styles.historyTime}>{item.time}</span>
                        </div>
                      ))
                    )}
                    {spinHistory.length > 0 && (
                      <button 
                        onClick={() => {
                          setSpinHistory([]);
                          localStorage.removeItem('spinHistory');
                        }}
                        className={styles.clearButton}
                      >
                        🗑️ Xóa lịch sử
                      </button>
                    )}
                  </div>
                )}
              </div>

              {isGuestMode && (
                <div className={styles.guestLimitations}>
                  <h4>🚀 Nâng cấp để có thêm:</h4>
                  <ul>
                    <li>✨ Lưu không giới hạn vòng quay</li>
                    <li>🎨 Tùy chỉnh màu sắc & hình ảnh</li>
                    <li>📊 Thống kê chi tiết & export</li>
                    <li>🔄 Chia sẻ & embed vòng quay</li>
                    <li>☁️ Sync đa thiết bị</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Right Panel - Wheel Preview */}
            <div className={styles.wheelPreview}>
              <div className={styles.previewHeader}>
                <h3>{wheelName}</h3>
              </div>
              
              <div className={`${styles.wheelContainer} ${isSpinning ? styles.spinning : ''}`}>
                <div className={styles.wheel}>
                  {segments.map((segment, index) => (
                    <div 
                      key={index}
                      className={styles.segment}
                      style={{
                        '--segment-color': `hsl(${(index * 360) / segments.length}, 70%, 60%)`,
                        transform: `rotate(${(index * 360) / segments.length}deg)`
                      } as React.CSSProperties}
                    >
                      <span className={styles.segmentText}>
                        {segment}
                      </span>
                    </div>
                  ))}
                </div>
                <div className={styles.wheelPointer}></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}