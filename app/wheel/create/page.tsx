'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header/Header';
import { CircleDot } from 'lucide-react';
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

  const addSegment = () => {
    if (segments.length < (isGuestMode ? 8 : 20)) {
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
      alert(`🎉 Chúc mừng! Kết quả: ${winner}`);
    }, 3000);
  };

  const handleSaveWheel = () => {
    if (isGuestMode) {
      // Guest mode - khuyến khích đăng ký để lưu
      const shouldRegister = confirm(
        'Bạn đang ở chế độ khách! Đăng ký miễn phí để lưu vòng quay và sử dụng nhiều tính năng hơn?'
      );
      if (shouldRegister) {
        router.push('/auth/register');
      }
    } else {
      // User đã đăng nhập - lưu vào database
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
                <CircleDot size={24} />
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
                  <h3>Danh sách phần thưởng ({segments.length}/{isGuestMode ? 8 : 20})</h3>
                  <button 
                    onClick={addSegment}
                    disabled={segments.length >= (isGuestMode ? 8 : 20)}
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

              {isGuestMode && (
                <div className={styles.guestLimitations}>
                  <h4>🚀 Nâng cấp để có thêm:</h4>
                  <ul>
                    <li>✨ Lưu nhiều vòng quay</li>
                    <li>🎨 Tùy chỉnh màu sắc</li>
                    <li>📊 Thống kê kết quả</li>
                    <li>🔄 Chia sẻ vòng quay</li>
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