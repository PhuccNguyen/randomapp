'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Zap, Music, Volume2, VolumeX } from 'lucide-react';
import styles from './SimpleWheel.module.css';

// --- 1. TYPE DEFINITIONS ---
export interface Segment {
  id: string;
  label: string;
  color: string;
  image?: string;
}

interface SimpleWheelProps {
  segments: Segment[];
  isSpinning: boolean;
  winningIndex?: number | null; // Deep Tech: Index đích do Server/Socket quyết định
  onSpinComplete?: (result: string) => void;
  duration?: number; // seconds
  campaignId?: string; // Dùng để định danh nếu cần log
}

// --- 2. COMPONENT ---
const SimpleWheel: React.FC<SimpleWheelProps> = ({ 
  segments,
  isSpinning,
  winningIndex = null,
  onSpinComplete,
  duration = 5,
  campaignId
}) => {
  const [rotation, setRotation] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);
  const spinAudioRef = useRef<HTMLAudioElement | null>(null);
  const winAudioRef = useRef<HTMLAudioElement | null>(null);

  // --- 3. SOUND EFFECTS SETUP (UX High-End) ---
  useEffect(() => {
    // Khởi tạo Audio (Lazy load)
    spinAudioRef.current = new Audio('/sounds/spin-tick.mp3');
    winAudioRef.current = new Audio('/sounds/win.mp3');
    
    // Cleanup
    return () => {
      spinAudioRef.current?.pause();
      winAudioRef.current?.pause();
    };
  }, []);

  // --- 4. SPIN LOGIC (CORE) ---
  useEffect(() => {
    if (isSpinning && segments.length > 0) {
      // A. Tính toán góc quay
      const segmentAngle = 360 / segments.length;
      
      // Số vòng quay tối thiểu (để tạo cảm giác hồi hộp)
      const minSpins = 5; 
      
      let targetAngle = 0;

      if (winningIndex !== null && winningIndex >= 0 && winningIndex < segments.length) {
        // [DIRECTOR MODE]: Server chỉ định người thắng
        // Logic: Để kim chỉ vào segment i, ta phải quay wheel sao cho segment đó nằm ở góc của kim (thường là 0 hoặc 90 độ)
        // Công thức này giả định kim chỉ ở góc 12 giờ (0 độ trong CSS)
        // Đảo ngược góc vì wheel quay theo chiều kim đồng hồ
        const stopAngle = 360 - (winningIndex * segmentAngle) - (segmentAngle / 2); // Center của segment
        
        // Thêm chút ngẫu nhiên nhỏ +/- vào giữa segment để trông tự nhiên hơn (Realism)
        const randomOffset = (Math.random() * segmentAngle * 0.6) - (segmentAngle * 0.3);
        
        targetAngle = stopAngle + randomOffset;
      } else {
        // [RANDOM MODE]: Client tự random (Fallback)
        targetAngle = Math.random() * 360;
      }

      // Tính tổng độ xoay (cộng dồn vào rotation hiện tại để quay tiếp, không bị giật ngược)
      // Làm tròn rotation hiện tại về 360 để tính toán sạch hơn
      const currentRotationMod = rotation % 360;
      const totalRotation = rotation + (360 - currentRotationMod) + (minSpins * 360) + targetAngle;
      
      // B. Thực hiện quay
      setRotation(totalRotation);
      
      // C. Hiệu ứng âm thanh (Tick tick...)
      if (!isMuted && spinAudioRef.current) {
        spinAudioRef.current.currentTime = 0;
        spinAudioRef.current.loop = true;
        spinAudioRef.current.play().catch(() => {}); // Catch lỗi nếu chưa interact
      }

      // D. Xử lý khi dừng quay
      const timer = setTimeout(() => {
        // Tắt âm thanh quay
        if (spinAudioRef.current) {
          spinAudioRef.current.pause();
        }
        
        // Bật âm thanh chiến thắng
        if (!isMuted && winAudioRef.current) {
          winAudioRef.current.currentTime = 0;
          winAudioRef.current.play().catch(() => {});
        }

        // Tính kết quả cuối cùng để trả về
        if (onSpinComplete) {
          // Nếu có winningIndex thì tin tưởng nó tuyệt đối
          if (winningIndex !== null) {
            onSpinComplete(segments[winningIndex].label);
          } else {
            // Tính toán lại dựa trên góc thực tế (Fallback)
            const normalizedAngle = (360 - (totalRotation % 360)) % 360;
            const winningSegmentIndex = Math.floor(normalizedAngle / segmentAngle);
            onSpinComplete(segments[winningSegmentIndex % segments.length].label);
          }
        }
      }, duration * 1000);

      return () => clearTimeout(timer);
    }
  }, [isSpinning, winningIndex]); // Dependency quan trọng: winningIndex

  // --- 5. RENDER ---
  const segmentAngle = 360 / segments.length;

  if (segments.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.emptyState}>
          <p>Đang chờ dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wheelWrapper}>
      {/* Sound Toggle (UX) */}
      <button 
        className={styles.muteButton}
        onClick={() => setIsMuted(!isMuted)}
        title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>

      <div className={styles.wheelContainer}>
        {/* Pointer (Kim chỉ) */}
        <div className={styles.pointer}></div>

        {/* The Wheel */}
        <div 
          ref={wheelRef}
          className={styles.wheel}
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning 
              ? `transform ${duration}s cubic-bezier(0.15, 0.85, 0.35, 1.0)` // Easing function xịn (nhanh lúc đầu, chậm dần đều)
              : 'none'
          }}
        >
          {segments.map((segment, index) => {
            const angle = index * segmentAngle;
            return (
              <div
                key={segment.id || index}
                className={styles.segment}
                style={{
                  transform: `rotate(${angle}deg) skewY(-${90 - segmentAngle}deg)`, // CSS Hack cho hình rẻ quạt
                  backgroundColor: segment.color,
                }}
              >
                <div 
                  className={styles.segmentContent}
                  style={{
                    transform: `skewY(${90 - segmentAngle}deg) rotate(${segmentAngle / 2}deg)` // Counter transform text
                  }}
                >
                  <span className={styles.segmentText} style={{ 
                    fontSize: segments.length > 12 ? '12px' : '16px' // Responsive font size
                  }}>
                    {segment.label}
                  </span>
                  {segment.image && (
                    <img 
                      src={segment.image} 
                      alt={segment.label} 
                      className={styles.segmentImage}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Center Hub */}
        <div className={styles.centerCircle}>
          <div className={`${styles.centerDot} ${isSpinning ? styles.spinning : ''}`}>
            <Zap size={24} color="#FFD700" fill="#FFD700" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleWheel;