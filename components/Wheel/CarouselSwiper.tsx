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
  const animationRef = useRef<number | null>(null);
  const velocityRef = useRef(0);
  const stopRequestedRef = useRef(false);
  const targetIndexRef = useRef<number | null>(null);
  const decelerationPhaseRef = useRef(false);

  const ANGLE_PER_ITEM = 360 / (items.length || 1);

  useEffect(() => {
    if (isSpinning && !spinning) {
      console.log('🎴 CarouselSwiper: Start infinite spin');
      startInfiniteSpin();
    }
  }, [isSpinning]);

  useEffect(() => {
    if (isStopping && spinning && !stopRequestedRef.current) {
      if (!targetId) {
        console.warn('⚠️ CarouselSwiper: Stopping requested but targetId missing');
        return;
      }
      console.log('🛑 CarouselSwiper: Stop requested for target:', targetId);
      stopRequestedRef.current = true;
      calculateStopPosition(targetId);
    }
  }, [isStopping, spinning, targetId]);

  useEffect(() => {
    if (!spinning) {
      stopRequestedRef.current = false;
      decelerationPhaseRef.current = false;
      targetIndexRef.current = null;
    }
  }, [spinning]);

  const startInfiniteSpin = useCallback(() => {
    setSpinning(true);
    decelerationPhaseRef.current = false;
    
    velocityRef.current = 8;
    let lastTime = performance.now();
    
    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 16.67;
      lastTime = currentTime;
      
      if (!decelerationPhaseRef.current) {
        if (velocityRef.current < 45) {
          velocityRef.current += 1.5 * deltaTime;
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
  }, [items.length, ANGLE_PER_ITEM]);

  const calculateStopPosition = useCallback((resolvedTargetId: string) => {
    console.log('🎯 CarouselSwiper: Calculating stop position for:', resolvedTargetId);
    
    let targetIndex = items.findIndex(item => item.id === resolvedTargetId);
    
    if (targetIndex === -1) {
      console.warn('⚠️ CarouselSwiper: Target not found, using random');
      targetIndex = Math.floor(Math.random() * items.length);
    }

    const targetItem = items[targetIndex];
    console.log('🎯 CarouselSwiper: Target item:', targetItem?.name, 'at index:', targetIndex);

    const targetAngle = targetIndex * ANGLE_PER_ITEM;
    const naturalOffset = (Math.random() - 0.5) * ANGLE_PER_ITEM * 0.3;
    const extraRotations = 5 + Math.floor(Math.random() * 3);
    
    const targetRotation = rotation + (extraRotations * 360) + (360 - (rotation % 360)) + targetAngle + naturalOffset;
    
    targetIndexRef.current = targetIndex;
    
    console.log('🎯 CarouselSwiper: Stop calculation:', {
      targetIndex,
      targetName: targetItem?.name,
      extraRotations,
      naturalOffset: naturalOffset.toFixed(2),
      finalRotation: targetRotation.toFixed(2),
      currentRotation: rotation.toFixed(2)
    });

    decelerationPhaseRef.current = true;
    decelerateToTarget(targetRotation);
  }, [items, rotation, ANGLE_PER_ITEM]);

  const finalizeStop = useCallback(() => {
    setSpinning(false);
    velocityRef.current = 0;
    
    if (targetId && onSpinComplete) {
      const targetItem = items.find(item => item.id === targetId);
      if (targetItem) {
        console.log('✅ CarouselSwiper: Spin complete - Winner:', targetItem.name);
        setTimeout(() => {
          onSpinComplete(targetItem);
        }, 700);
      }
    }
  }, [items, targetId, onSpinComplete]);

  const decelerateToTarget = useCallback((targetRotation: number) => {
    const startRotation = rotation;
    const startTime = performance.now();
    const decelerationDuration = 4500 + Math.random() * 1500;
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / decelerationDuration, 1);
      
      const easeOutQuint = 1 - Math.pow(1 - progress, 5);
      
      let currentRotation = startRotation + (targetRotation - startRotation) * easeOutQuint;
      
      if (progress > 0.88) {
        const wobbleIntensity = (1 - progress) * 8;
        const wobble = Math.sin(progress * 35) * wobbleIntensity;
        currentRotation += wobble;
      }
      
      setRotation(currentRotation);
      
      const normalizedRotation = ((currentRotation % 360) + 360) % 360;
      const index = Math.floor((360 - normalizedRotation) / ANGLE_PER_ITEM) % items.length;
      setCurrentIndex(index);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        finalizeStop();
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  }, [rotation, items.length, ANGLE_PER_ITEM, finalizeStop]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const renderCards = () => {
    return items.map((item, index) => {
      const angle = (index * ANGLE_PER_ITEM - rotation) * (Math.PI / 180);
      const radius = 820;
      
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;
      
      const distanceFromFront = Math.abs(angle % (2 * Math.PI));
      const isFront = distanceFromFront < Math.PI / 8 || distanceFromFront > (15 * Math.PI) / 8;
      
      const scale = isFront ? 1 : 0.68 + (0.32 * Math.max(0, Math.cos(angle)));
      const opacity = 0.35 + (0.65 * Math.max(0, Math.cos(angle)));
      
      const rotateY = (index * ANGLE_PER_ITEM - rotation);
      const randomFloat = Math.sin(rotation * 0.04 + index * 2.5) * 12;
      const randomTilt = Math.cos(rotation * 0.025 + index * 3) * 6;
      
      return (
        <div
          key={item.id}
          className={`${styles.floatingCard} ${isFront ? styles.frontCard : ''}`}
          style={{
            transform: `
              translate3d(${x}px, ${randomFloat}px, ${z}px) 
              rotateY(${rotateY}deg) 
              rotateX(${randomTilt}deg)
              scale(${scale})
            `,
            opacity,
            filter: isFront ? 'none' : `blur(${(1 - Math.cos(angle)) * 1.5}px)`,
            zIndex: isFront ? 300 : Math.floor(100 + z)
          }}
        >
          <div className={styles.cardInner}>
            <div 
              className={styles.cardGlow}
              style={{ 
                background: item.color || '#3b82f6',
                boxShadow: isFront ? `0 0 60px ${item.color || '#3b82f6'}` : 'none'
              }}
            />
            <div className={styles.cardContent}>
              {item.imageUrl && (
                <div className={styles.cardImage}>
                  <img src={item.imageUrl} alt={item.name} />
                </div>
              )}
              <div className={styles.cardText}>
                <h3>{item.name}</h3>
                {item.contestant && <p className={styles.contestant}>{item.contestant}</p>}
                {item.question && <p className={styles.question}>{item.question}</p>}
              </div>
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.carouselStage}>
        {renderCards()}
      </div>
    </div>
  );
};

export default CarouselSwiper;
