// C:\Users\Nguyen Phuc\Web\tingrandom\components\Wheel\CarouselSwiper.tsx
'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import styles from './CarouselSwiper.module.css';
import { SwipeBackground } from './CarouselSwiper/SwipeBackground';
import { CarouselFrame } from './CarouselSwiper/CarouselFrame';
import { SelectionIndicator } from './CarouselSwiper/SelectionIndicator';
import { CarouselCard } from './CarouselSwiper/CarouselCard';

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
  const [offsetX, setOffsetX] = useState(0);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number; size: number }>>([]);
  const animationRef = useRef<number | null>(null);
  const velocityRef = useRef(0);
  const stopRequestedRef = useRef(false);
  const targetIndexRef = useRef<number | null>(null);
  const decelerationPhaseRef = useRef(false);

  const CARD_WIDTH = 420;
  const CARD_GAP = 60;
  const TOTAL_WIDTH = CARD_WIDTH + CARD_GAP;

  useEffect(() => {
    const particleArray = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 12,
      size: 1 + Math.random() * 3
    }));
    setParticles(particleArray);
  }, []);

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
    
    velocityRef.current = 12;
    let lastTime = performance.now();
    
    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 16.67;
      lastTime = currentTime;
      
      if (!decelerationPhaseRef.current) {
        if (velocityRef.current < 60) {
          velocityRef.current += 1.2 * deltaTime;
        }
        
        setOffsetX(prev => {
          const newOffset = prev + velocityRef.current * deltaTime;
          const normalizedOffset = Math.abs(newOffset) % (TOTAL_WIDTH * items.length);
          const index = Math.floor(normalizedOffset / TOTAL_WIDTH) % items.length;
          setCurrentIndex(index);
          return newOffset;
        });
        
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  }, [items.length]);

  const calculateStopPosition = useCallback((resolvedTargetId: string) => {
    console.log('🎯 CarouselSwiper: Calculating stop position for:', resolvedTargetId);
    
    let targetIndex = items.findIndex(item => item.id === resolvedTargetId);
    
    if (targetIndex === -1) {
      console.warn('⚠️ CarouselSwiper: Target not found, using random');
      targetIndex = Math.floor(Math.random() * items.length);
    }

    const targetItem = items[targetIndex];
    console.log('🎯 CarouselSwiper: Target item:', targetItem?.name, 'at index:', targetIndex);

    const naturalOffset = (Math.random() - 0.5) * TOTAL_WIDTH * 0.4;
    const extraCycles = 8 + Math.floor(Math.random() * 5);
    
    const currentCycles = Math.floor(Math.abs(offsetX) / (TOTAL_WIDTH * items.length));
    const targetOffset = (currentCycles + extraCycles) * (TOTAL_WIDTH * items.length) + 
                        (targetIndex * TOTAL_WIDTH) + naturalOffset;
    
    targetIndexRef.current = targetIndex;
    
    console.log('🎯 CarouselSwiper: Stop calculation:', {
      targetIndex,
      targetName: targetItem?.name,
      extraCycles,
      naturalOffset: naturalOffset.toFixed(2),
      finalOffset: targetOffset.toFixed(2),
      currentOffset: offsetX.toFixed(2)
    });

    decelerationPhaseRef.current = true;
    decelerateToTarget(targetOffset);
  }, [items, offsetX]);

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

  const decelerateToTarget = useCallback((targetOffset: number) => {
    const startOffset = offsetX;
    const startTime = performance.now();
    const decelerationDuration = 5000 + Math.random() * 2000;
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / decelerationDuration, 1);
      
      const easeOutQuint = 1 - Math.pow(1 - progress, 5);
      
      let currentOffset = startOffset + (targetOffset - startOffset) * easeOutQuint;
      
      if (progress > 0.9) {
        const wobbleIntensity = (1 - progress) * 5;
        const wobble = Math.sin(progress * 40) * wobbleIntensity;
        currentOffset += wobble;
      }
      
      setOffsetX(currentOffset);
      
      const normalizedOffset = Math.abs(currentOffset) % (TOTAL_WIDTH * items.length);
      const index = Math.floor(normalizedOffset / TOTAL_WIDTH) % items.length;
      setCurrentIndex(index);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        finalizeStop();
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  }, [offsetX, items.length, finalizeStop]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const renderCards = () => {
    const cards = [];
    const visibleRange = 7;
    
    for (let i = -visibleRange; i <= visibleRange; i++) {
      const index = (currentIndex + i + items.length) % items.length;
      const item = items[index];
      
      const cardOffset = i * TOTAL_WIDTH - (offsetX % TOTAL_WIDTH);
      const absOffset = Math.abs(cardOffset);
      
      const scale = Math.max(0.65, 1 - absOffset / 1200);
      const opacity = Math.max(0.2, 1 - absOffset / 800);
      const rotateY = cardOffset / 25;
      const translateZ = Math.cos((cardOffset / 600) * Math.PI) * 300;
      
      const isCentered = absOffset < CARD_WIDTH / 2;
      
      cards.push(
        <CarouselCard
          key={`${item.id}-${i}`}
          item={item}
          index={index}
          totalItems={items.length}
          isCentered={isCentered}
          isSpinning={spinning}
          transform={`translateX(${cardOffset}px) translateZ(${translateZ}px) scale(${scale}) rotateY(${rotateY}deg)`}
          opacity={opacity}
          zIndex={isCentered ? 100 : Math.floor(100 - absOffset / 10)}
        />
      );
    }
    
    return cards;
  };

  return (
    <div className={styles.container}>
      <SwipeBackground particles={particles} />
      <CarouselFrame />
      
      <div className={styles.carouselStage}>
        <div className={styles.carouselTrack}>
          {renderCards()}
        </div>
      </div>
      
      <SelectionIndicator />
    </div>
  );
};

export default CarouselSwiper;
