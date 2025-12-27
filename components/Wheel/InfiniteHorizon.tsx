// C:\Users\Nguyen Phuc\Web\tingrandom\components\Wheel\InfiniteHorizon.tsx
'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import styles from './InfiniteHorizon.module.css';

interface JudgeItem {
  id: string;
  name: string;
  color?: string;
  imageUrl?: string;
  contestant?: string;
  question?: string;
}

interface InfiniteHorizonProps {
  items?: JudgeItem[];
  campaignId?: string;
  isSpinning?: boolean;
  isStopping?: boolean;
  targetId?: string;
  onSpinComplete?: (result: JudgeItem) => void;
}

const InfiniteHorizon: React.FC<InfiniteHorizonProps> = ({
  items = [],
  campaignId,
  isSpinning = false,
  isStopping = false,
  targetId,
  onSpinComplete
}) => {
  const [offset, setOffset] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [flipping, setFlipping] = useState(false);
  const animationRef = useRef<number | null>(null);
  const velocityRef = useRef(0);
  const stopRequestedRef = useRef(false);
  const targetOffsetRef = useRef<number | null>(null);
  const decelerationPhaseRef = useRef(false);

  const CARD_WIDTH = 280; // Width of each card
  const CARD_GAP = 40; // Gap between cards

  // Start spinning
  useEffect(() => {
    if (isSpinning && !spinning) {
      console.log('🎰 InfiniteHorizon: Start infinite spin');
      startInfiniteSpin();
    }
  }, [isSpinning]);

  // Stop spinning
  useEffect(() => {
    if (isStopping && spinning && !stopRequestedRef.current) {
      if (!targetId) {
        console.warn('⚠️ InfiniteHorizon: Stopping requested but targetId missing');
        return;
      }

      console.log('🛑 InfiniteHorizon: Stop requested for target:', targetId);
      stopRequestedRef.current = true;
      calculateStopPosition(targetId);
    }
  }, [isStopping, spinning, targetId]);

  // Reset stop flag when not spinning
  useEffect(() => {
    if (!spinning) {
      stopRequestedRef.current = false;
      decelerationPhaseRef.current = false;
      targetOffsetRef.current = null;
    }
  }, [spinning]);

  const startInfiniteSpin = useCallback(() => {
    setSpinning(true);
    setFlipping(false);
    decelerationPhaseRef.current = false;
    
    velocityRef.current = 10; // Start velocity
    let lastTime = performance.now();
    
    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 16.67;
      lastTime = currentTime;
      
      if (!decelerationPhaseRef.current) {
        // ACCELERATION PHASE
        if (velocityRef.current < 50) {
          velocityRef.current += 0.8 * deltaTime;
        }
        
        setOffset(prev => prev + velocityRef.current * deltaTime);
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  }, [spinning]);

  const calculateStopPosition = useCallback((resolvedTargetId: string) => {
    console.log('🎯 InfiniteHorizon: Calculating stop position for:', resolvedTargetId);
    
    let targetIndex = items.findIndex(item => item.id === resolvedTargetId);
    
    if (targetIndex === -1) {
      console.warn('⚠️ InfiniteHorizon: Target not found, using random');
      targetIndex = Math.floor(Math.random() * items.length);
    }

    const targetItem = items[targetIndex];
    console.log('🎯 InfiniteHorizon: Target item:', targetItem?.name, 'at index:', targetIndex);

    // Natural offset within card
    const naturalOffset = (Math.random() - 0.5) * (CARD_WIDTH * 0.4);
    
    // Extra cycles: 6-10 full rounds
    const extraCycles = 6 + Math.floor(Math.random() * 5);
    const totalItemWidth = CARD_WIDTH + CARD_GAP;
    
    // Calculate final offset (center the target card)
    const currentCycles = Math.floor(offset / (totalItemWidth * items.length));
    const targetOffset = (currentCycles + extraCycles) * (totalItemWidth * items.length) + 
                        (targetIndex * totalItemWidth) + naturalOffset;
    
    targetOffsetRef.current = targetOffset;
    
    console.log('🎯 InfiniteHorizon: Stop calculation:', {
      targetIndex,
      targetName: targetItem?.name,
      extraCycles,
      naturalOffset: naturalOffset.toFixed(2),
      finalOffset: targetOffset.toFixed(2),
      currentOffset: offset.toFixed(2)
    });

    decelerationPhaseRef.current = true;
    decelerateToTarget();
  }, [items, offset]); // ✅ Remove decelerateToTarget from deps

  const finalizeStop = useCallback(() => {
    setSpinning(false);
    velocityRef.current = 0;
    
    if (targetId && onSpinComplete) {
      const targetItem = items.find(item => item.id === targetId);
      if (targetItem) {
        console.log('✅ InfiniteHorizon: Spin complete - Winner:', targetItem.name);
        setTimeout(() => {
          onSpinComplete(targetItem);
        }, 500);
      }
    }
  }, [items, targetId, onSpinComplete]);

  const decelerateToTarget = useCallback(() => {
    if (targetOffsetRef.current === null) return;

    const targetOffset = targetOffsetRef.current;
    const startOffset = offset;
    const startTime = performance.now();
    const decelerationDuration = 4500 + Math.random() * 1500; // 4.5-6 seconds
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / decelerationDuration, 1);
      
      // ✅ PHYSICS-BASED EASING: Same as Wheel.tsx
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      let currentOffset = startOffset + (targetOffset - startOffset) * easeOutQuart;
      
      // ✅ WOBBLE EFFECT: Near end, add slight oscillation
      if (progress > 0.85) {
        const wobbleIntensity = (1 - progress) * 15; // Stronger wobble for horizontal
        const wobble = Math.sin(progress * 25) * wobbleIntensity;
        currentOffset += wobble;
      }
      
      setOffset(currentOffset);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Trigger flip animation
        setFlipping(true);
        setTimeout(() => {
          setFlipping(false);
          finalizeStop();
        }, 800);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  }, [offset]); // ✅ Remove finalizeStop from deps

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Render cards with infinite loop
  const renderCards = () => {
    const totalItemWidth = CARD_WIDTH + CARD_GAP;
    const containerWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
    const numCardsToRender = Math.ceil(containerWidth / totalItemWidth) + items.length + 5;
    
    const cards = [];
    for (let i = 0; i < numCardsToRender; i++) {
      const item = items[i % items.length];
      const cardOffset = (i * totalItemWidth) - offset;
      const normalizedOffset = cardOffset % (totalItemWidth * items.length);
      
      // Calculate distance from center
      const centerX = containerWidth / 2;
      const cardCenterX = cardOffset + (CARD_WIDTH / 2);
      const distanceFromCenter = Math.abs(cardCenterX - centerX);
      const maxDistance = containerWidth / 2;
      
      // Scale and opacity based on distance from center
      const scale = Math.max(0.6, 1 - (distanceFromCenter / maxDistance) * 0.4);
      const opacity = Math.max(0.3, 1 - (distanceFromCenter / maxDistance) * 0.7);
      const rotateY = (cardCenterX - centerX) / 20; // Perspective rotation
      
      const isCentered = distanceFromCenter < CARD_WIDTH / 2;
      
      cards.push(
        <div
          key={`${item.id}-${i}`}
          className={`${styles.card} ${isCentered ? styles.centered : ''} ${flipping && isCentered ? styles.flipping : ''}`}
          style={{
            transform: `translateX(${cardOffset}px) scale(${scale}) rotateY(${rotateY}deg)`,
            opacity: opacity,
            zIndex: isCentered ? 100 : Math.floor(100 - distanceFromCenter)
          }}
        >
          <div className={styles.cardInner}>
            <div className={styles.cardFront}>
              {item.imageUrl && (
                <div className={styles.cardImage}>
                  <img src={item.imageUrl} alt={item.name} />
                </div>
              )}
              <div 
                className={styles.cardName}
                style={{ color: item.color || '#ffffff' }}
              >
                {item.name}
              </div>
              <div 
                className={styles.cardGlow}
                style={{ backgroundColor: item.color }}
              ></div>
            </div>
          </div>
        </div>
      );
    }
    
    return cards;
  };

  return (
    <div className={styles.container}>
      <div className={styles.track}>
        {renderCards()}
      </div>
      
      <div className={styles.centerMarker}>
        <div className={styles.markerLine}></div>
        <div className={styles.markerArrow}>▼</div>
      </div>
      
      {spinning && (
        <div className={styles.motionBlur}>
          <div className={styles.blurLine}></div>
          <div className={styles.blurLine}></div>
          <div className={styles.blurLine}></div>
        </div>
      )}
      
      <div className={styles.horizon}></div>
    </div>
  );
};

export default InfiniteHorizon;
