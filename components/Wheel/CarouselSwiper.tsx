// C:\Users\Nguyen Phuc\Web\tingrandom\components\Wheel\CarouselSwiper.tsx
'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import styles from './CarouselSwiper.module.css';

interface JudgeItem {
  id: string;
  name: string;
  color?: string;
  imageUrl?: string;
  contestant?: string;
  question?: string;
}

interface CarouselSwiperProps {
  items?: JudgeItem[];
  campaignId?: string;
  isSpinning?: boolean;
  isStopping?: boolean;
  targetId?: string;
  onSpinComplete?: (result: JudgeItem) => void;
}

// 🎯 Easing Functions - Siêu mượt
const easeOutQuint = (t: number): number => 1 - Math.pow(1 - t, 5);
const easeInOutCubic = (t: number): number => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOutElastic = (t: number): number => {
  const c4 = (2 * Math.PI) / 3;
  return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
};

const CarouselSwiper: React.FC<CarouselSwiperProps> = ({
  items = [],
  campaignId,
  isSpinning = false,
  isStopping = false,
  targetId,
  onSpinComplete
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [isWinning, setIsWinning] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);
  const [cameraShake, setCameraShake] = useState(0);
  
  const animationRef = useRef<number | null>(null);
  const velocityRef = useRef(0);
  const stopRequestedRef = useRef(false);
  const targetIndexRef = useRef<number | null>(null);
  const decelerationPhaseRef = useRef(false);
  const confettiTimerRef = useRef<number | null>(null);

  const ANGLE_PER_ITEM = 360 / (items.length || 1);
  const RADIUS = 650; // Giảm từ 820 xuống 650 để thẻ gần trung tâm hơn
  const MAX_VELOCITY = 50; // Tăng tốc độ tối đa
  const ACCELERATION = 2; // Tăng gia tốc

  // 🎬 Start Infinite Spin với acceleration mượt mà
  const startInfiniteSpin = useCallback(() => {
    setSpinning(true);
    setIsWinning(false);
    setConfettiActive(false);
    decelerationPhaseRef.current = false;
    
    velocityRef.current = 10; // Start velocity
    let lastTime = performance.now();
    
    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 16.67; // Normalize to 60fps
      lastTime = currentTime;
      
      if (!decelerationPhaseRef.current) {
        // Smooth acceleration
        if (velocityRef.current < MAX_VELOCITY) {
          velocityRef.current += ACCELERATION * deltaTime;
        }
        
        setRotation(prev => {
          const newRotation = prev + velocityRef.current * deltaTime;
          const normalizedRotation = ((newRotation % 360) + 360) % 360;
          const index = Math.floor((360 - normalizedRotation) / ANGLE_PER_ITEM) % items.length;
          setCurrentIndex(index);
          return newRotation;
        });
        
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  }, [items.length, ANGLE_PER_ITEM, MAX_VELOCITY, ACCELERATION]);

  // 🎯 Calculate Stop Position
  const calculateStopPosition = useCallback((resolvedTargetId: string) => {
    console.log('🎯 Calculating stop for:', resolvedTargetId);
    
    let targetIndex = items.findIndex(item => item.id === resolvedTargetId);
    
    if (targetIndex === -1) {
      console.warn('⚠️ Target not found, using random');
      targetIndex = Math.floor(Math.random() * items.length);
    }

    const targetItem = items[targetIndex];
    console.log('✅ Target:', targetItem?.name, 'at index:', targetIndex);

    const targetAngle = targetIndex * ANGLE_PER_ITEM;
    const naturalOffset = (Math.random() - 0.5) * ANGLE_PER_ITEM * 0.25; // Reduced offset
    const extraRotations = 6 + Math.floor(Math.random() * 3); // 6-8 rotations
    
    const currentNormalized = rotation % 360;
    const angleDiff = (targetAngle - currentNormalized + 360) % 360;
    const targetRotation = rotation + angleDiff + (extraRotations * 360) + naturalOffset;
    
    targetIndexRef.current = targetIndex;
    
    console.log('🎯 Stop calculation:', {
      targetIndex,
      targetName: targetItem?.name,
      extraRotations,
      naturalOffset: naturalOffset.toFixed(2),
      finalRotation: targetRotation.toFixed(2),
      currentRotation: rotation.toFixed(2)
    });

    decelerationPhaseRef.current = true;
    decelerateToTarget(targetRotation, targetIndex);
  }, [items, rotation, ANGLE_PER_ITEM]);

  // 🛑 Decelerate to Target - Siêu mượt với wobble
  const decelerateToTarget = useCallback((targetRotation: number, targetIndex: number) => {
    const startRotation = rotation;
    const startTime = performance.now();
    const decelerationDuration = 5500 + Math.random() * 1000; // 5.5-6.5s
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / decelerationDuration, 1);
      
      // Use quintic easing for smooth deceleration
      const eased = easeOutQuint(progress);
      
      let currentRotation = startRotation + (targetRotation - startRotation) * eased;
      
      // Add wobble effect near the end (last 15%)
      if (progress > 0.85) {
        const wobbleProgress = (progress - 0.85) / 0.15;
        const wobbleIntensity = (1 - wobbleProgress) * 10;
        const wobble = Math.sin(wobbleProgress * 30) * wobbleIntensity;
        currentRotation += wobble;
        
        // Camera shake during wobble
        setCameraShake(wobbleIntensity * 0.5);
      } else {
        setCameraShake(0);
      }
      
      setRotation(currentRotation);
      
      const normalizedRotation = ((currentRotation % 360) + 360) % 360;
      const index = Math.floor((360 - normalizedRotation) / ANGLE_PER_ITEM) % items.length;
      setCurrentIndex(index);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Victory sequence
        setCameraShake(0);
        triggerVictorySequence(targetIndex);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  }, [rotation, items.length, ANGLE_PER_ITEM]);

  // 🎊 Victory Sequence - Pháo bông + Hiệu ứng
  const triggerVictorySequence = useCallback((targetIndex: number) => {
    console.log('🎉 Victory sequence started!');
    
    // Stop spinning
    setSpinning(false);
    velocityRef.current = 0;
    
    // Trigger winning animation
    setIsWinning(true);
    
    // Trigger confetti
    setTimeout(() => {
      setConfettiActive(true);
      
      // Stop confetti after 4 seconds
      confettiTimerRef.current = window.setTimeout(() => {
        setConfettiActive(false);
      }, 4000);
    }, 300);
    
    // Complete callback
    if (targetId && onSpinComplete) {
      const targetItem = items.find(item => item.id === targetId);
      if (targetItem) {
        console.log('✅ Spin complete - Winner:', targetItem.name);
        setTimeout(() => {
          onSpinComplete(targetItem);
        }, 800);
      }
    }
    
    // Reset winning state after animation
    setTimeout(() => {
      setIsWinning(false);
    }, 3000);
  }, [items, targetId, onSpinComplete]);

  // 🎬 Effect: Start Spinning
  useEffect(() => {
    if (isSpinning && !spinning) {
      console.log('🎴 Start infinite spin');
      startInfiniteSpin();
    }
  }, [isSpinning, spinning, startInfiniteSpin]);

  // 🛑 Effect: Stop Spinning
  useEffect(() => {
    if (isStopping && spinning && !stopRequestedRef.current) {
      if (!targetId) {
        console.warn('⚠️ Stopping requested but targetId missing');
        return;
      }
      console.log('🛑 Stop requested for:', targetId);
      stopRequestedRef.current = true;
      calculateStopPosition(targetId);
    }
  }, [isStopping, spinning, targetId, calculateStopPosition]);

  // 🧹 Cleanup
  useEffect(() => {
    if (!spinning) {
      stopRequestedRef.current = false;
      decelerationPhaseRef.current = false;
      targetIndexRef.current = null;
    }
  }, [spinning]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (confettiTimerRef.current) {
        clearTimeout(confettiTimerRef.current);
      }
    };
  }, []);

  // 🎨 Render Cards - Enhanced 3D với perspective depth
  const renderCards = () => {
    return items.map((item, index) => {
      const angle = (index * ANGLE_PER_ITEM - rotation) * (Math.PI / 180);
      
      const x = Math.sin(angle) * RADIUS;
      const z = Math.cos(angle) * RADIUS;
      
      const distanceFromFront = Math.abs(angle % (2 * Math.PI));
      const isFront = distanceFromFront < Math.PI / 6 || distanceFromFront > (11 * Math.PI) / 6;
      
      // 🎯 Tính toán depth scale dựa trên góc (giá trị từ -1 đến 1)
      const cosAngle = Math.cos(angle);
      const isBack = cosAngle < -0.3; // Thẻ ở phía sau sâu (z << 0)
      
      // 🎯 Tính góc chuẩn hóa để tìm thẻ chính giữa
      const normalizedAngle = ((angle % 360) + 360) % 360;
      const isCenterCard = normalizedAngle < 15 || normalizedAngle > 345; // Thẻ chính giữa (±15°)
      
      // 🎯 Scale động theo góc nhìn perspective: 
      // - Center card (0°): 1.15 (to nhất - gần nhất)
      // - Side cards (±30-60°): 0.85-1.0 (nhỏ hơn một chút)
      // - Edge cards (±90°): 0.5-0.7 (nhỏ hơn nữa)
      // - Back cards (180°): 0.15-0.25 (rất nhỏ - xa nhất)
      let perspectiveScale;
      
      if (isCenterCard) {
        // Thẻ chính giữa: to nhất vì gần camera nhất
        perspectiveScale = 1.15;
      } else if (isFront) {
        // Thẻ 2 bên gần center: giảm dần theo khoảng cách
        const frontDepth = Math.max(0, cosAngle);
        perspectiveScale = 0.7 + (0.35 * frontDepth); // 0.7-1.05
      } else if (isBack) {
        // Mặt sau: rất nhỏ để thể hiện xa
        const backDepth = Math.abs(cosAngle + 0.3) / 0.7;
        perspectiveScale = 0.15 + (0.1 * (1 - backDepth)); // 0.15-0.25
      } else {
        // Vùng chuyển tiếp side → back
        const sideDepth = Math.max(0, cosAngle);
        perspectiveScale = 0.4 + (0.4 * sideDepth); // 0.4-0.8
      }
      
      const scale = perspectiveScale;
      
      // 🎯 Tính depthScale cho blur effect (0 = xa, 1 = gần)
      const depthScale = Math.max(0, cosAngle);
      
      // Opacity: Mặt sau mờ hơn để thể hiện xa
      let opacity;
      if (isFront) {
        opacity = 1;
      } else if (isBack) {
        opacity = 0.3 + (0.2 * (1 - Math.abs(cosAngle))); // 0.3-0.5 opacity
      } else {
        opacity = 0.2 + (0.8 * Math.max(0, cosAngle));
      }
      
      const rotateY = (index * ANGLE_PER_ITEM - rotation);
      
      // 🎯 Y offset: Mặt sau đẩy xuống sâu hơn
      const dipEffect = isBack 
        ? -Math.abs(Math.sin(angle)) * 180 - 50 // Mặt sau cong sâu + đẩy xuống
        : -Math.abs(Math.sin(angle)) * 120; // Mặt trước/2 bên
      
      // Smooth floating animation
      const floatY = Math.sin(rotation * 0.03 + index * 2.5) * 15 + dipEffect;
      const floatX = Math.cos(rotation * 0.025 + index * 3) * 8;
      const tiltX = Math.sin(rotation * 0.02 + index * 2) * 5;
      const tiltZ = Math.cos(rotation * 0.015 + index * 2.8) * 3;
      
      // Winning card effect
      const isWinningCard = isWinning && isFront;
      const winScale = isWinningCard ? 1.15 : 1;
      const winGlow = isWinningCard ? 1 : 0;
      
      return (
        <div
          key={item.id}
          className={`${styles.floatingCard} ${isFront ? styles.frontCard : ''} ${isWinningCard ? styles.winningCard : ''}`}
          style={{
            transform: `
              translate3d(${x + floatX}px, ${floatY}px, ${z}px) 
              rotateY(${rotateY}deg) 
              rotateX(${tiltX}deg)
              rotateZ(${tiltZ}deg)
              scale(${scale * winScale})
            `,
            opacity,
            filter: isFront ? 'none' : `blur(${(1 - depthScale) * 2}px)`,
            zIndex: isFront ? 300 : Math.floor(100 + z),
            '--win-glow': winGlow,
          } as React.CSSProperties}
        >
          <div className={styles.cardInner}>
            {/* Dynamic Glow */}
            <div 
              className={styles.cardGlow}
              style={{ 
                background: item.color || '#3b82f6',
                boxShadow: isFront 
                  ? `0 0 80px ${item.color || '#3b82f6'}, 0 0 120px ${item.color || '#3b82f6'}50` 
                  : 'none',
                opacity: isFront ? 1 : 0.3
              }}
            />
            
            {/* Light Rays for winning card */}
            {isWinningCard && (
              <div className={styles.lightRays}>
                {[...Array(12)].map((_, i) => (
                  <div 
                    key={i} 
                    className={styles.lightRay}
                    style={{
                      transform: `rotate(${i * 30}deg)`,
                      animationDelay: `${i * 0.05}s`
                    }}
                  />
                ))}
              </div>
            )}
            
            <div className={styles.cardContent}>
              {item.imageUrl && (
                <div className={styles.cardImage}>
                  <img src={item.imageUrl} alt={item.name} />
                  {isWinningCard && <div className={styles.imageVictoryGlow} />}
                </div>
              )}
              <div className={styles.cardText}>
                <h3>{item.name}</h3>
                {item.contestant && <p className={styles.contestant}>{item.contestant}</p>}
                {item.question && <p className={styles.question}>{item.question}</p>}
              </div>
            </div>
            
            {/* Shine effect */}
            {isFront && <div className={styles.cardShine} />}
          </div>
        </div>
      );
    });
  };

  // 🎊 Confetti Particles
  const renderConfetti = () => {
    if (!confettiActive) return null;
    
    const confettiColors = [
      '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', 
      '#6c5ce7', '#a29bfe', '#fd79a8', '#fdcb6e',
      '#00b894', '#e17055', '#74b9ff', '#a29bfe'
    ];
    
    return (
      <div className={styles.confettiContainer}>
        {[...Array(150)].map((_, i) => {
          const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
          const delay = Math.random() * 0.5;
          const duration = 2 + Math.random() * 2;
          const startX = Math.random() * 100;
          const rotation = Math.random() * 720;
          const size = 8 + Math.random() * 8;
          
          return (
            <div
              key={i}
              className={styles.confettiPiece}
              style={{
                backgroundColor: color,
                left: `${startX}%`,
                width: `${size}px`,
                height: `${size}px`,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
                '--rotation': `${rotation}deg`,
              } as React.CSSProperties}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div 
      className={styles.container}
      style={{
        transform: cameraShake > 0 
          ? `translate(${Math.sin(Date.now() * 0.1) * cameraShake}px, ${Math.cos(Date.now() * 0.1) * cameraShake}px)`
          : 'none'
      }}
    >
      {/* Ambient Particles */}
      <div className={styles.ambientParticles}>
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className={styles.ambientParticle}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${8 + Math.random() * 6}s`,
            }}
          />
        ))}
      </div>
      
      {/* Carousel Stage */}
      <div className={`${styles.carouselStage} ${spinning ? styles.spinning : ''}`}>
        {renderCards()}
      </div>
      
      {/* Confetti */}
      {renderConfetti()}
      
      {/* Center Focus Indicator */}
      <div className={`${styles.focusIndicator} ${isWinning ? styles.focusVictory : ''}`}>
        <div className={styles.focusRing} />
        <div className={styles.focusArrowTop}>▼</div>
        <div className={styles.focusArrowBottom}>▲</div>
      </div>
    </div>
  );
};

export default CarouselSwiper;
