// C:\Users\Nguyen Phuc\Web\tingrandom\components\Wheel\GlassCylinder.tsx
'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import styles from './GlassCylinder.module.css';
import { OceanBackground } from './GlassCylinder/OceanBackground';
import { GlassFrame } from './GlassCylinder/GlassFrame';
import { FocusIndicator } from './GlassCylinder/FocusIndicator';
import { CylinderItem } from './GlassCylinder/CylinderItem';

interface JudgeItem {
  id: string;
  name: string;
  color?: string;
  imageUrl?: string;
  contestant?: string;
  question?: string;
}

interface GlassCylinderProps {
  items?: JudgeItem[];
  campaignId?: string;
  isSpinning?: boolean;
  isStopping?: boolean;
  targetId?: string;
  onSpinComplete?: (result: JudgeItem) => void;
}

const GlassCylinder: React.FC<GlassCylinderProps> = ({
  items = [],
  campaignId,
  isSpinning = false,
  isStopping = false,
  targetId,
  onSpinComplete
}) => {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number; size: number }>>([]);
  const animationRef = useRef<number | null>(null);
  const velocityRef = useRef(0);
  const stopRequestedRef = useRef(false);
  const targetRotationRef = useRef<number | null>(null);
  const decelerationPhaseRef = useRef(false);

  const ITEM_HEIGHT = 150;
  const VISIBLE_ITEMS = 5;

  useEffect(() => {
    const particleArray = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 10,
      size: 2 + Math.random() * 4
    }));
    setParticles(particleArray);
  }, []);

  useEffect(() => {
    if (isSpinning && !spinning) {
      console.log('🎰 GlassCylinder: Start infinite spin');
      startInfiniteSpin();
    }
  }, [isSpinning]);

  useEffect(() => {
    if (isStopping && spinning && !stopRequestedRef.current) {
      if (!targetId) {
        console.warn('⚠️ GlassCylinder: Stopping requested but targetId missing');
        return;
      }
      console.log('🛑 GlassCylinder: Stop requested for target:', targetId);
      stopRequestedRef.current = true;
      calculateStopPosition(targetId);
    }
  }, [isStopping, spinning, targetId]);

  useEffect(() => {
    if (!spinning) {
      stopRequestedRef.current = false;
      decelerationPhaseRef.current = false;
      targetRotationRef.current = null;
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
          velocityRef.current += 0.7 * deltaTime;
        }
        
        setRotation(prev => {
          const newRotation = prev + velocityRef.current * deltaTime;
          const currentIndex = Math.floor(Math.abs(newRotation / ITEM_HEIGHT)) % items.length;
          setFocusedIndex(currentIndex);
          return newRotation;
        });
        
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  }, [items.length]);

  const calculateStopPosition = useCallback((resolvedTargetId: string) => {
    console.log('🎯 GlassCylinder: Calculating stop position for:', resolvedTargetId);
    
    let targetIndex = items.findIndex(item => item.id === resolvedTargetId);
    
    if (targetIndex === -1) {
      console.warn('⚠️ GlassCylinder: Target not found, using random');
      targetIndex = Math.floor(Math.random() * items.length);
    }

    const targetItem = items[targetIndex];
    console.log('🎯 GlassCylinder: Target item:', targetItem?.name, 'at index:', targetIndex);

    const naturalOffset = (Math.random() - 0.5) * ITEM_HEIGHT * 0.5;
    const extraCycles = 9 + Math.floor(Math.random() * 4);
    
    const currentCycles = Math.floor(Math.abs(rotation) / (ITEM_HEIGHT * items.length));
    const targetRotation = (currentCycles + extraCycles) * (ITEM_HEIGHT * items.length) + 
                          (targetIndex * ITEM_HEIGHT) + naturalOffset;
    
    targetRotationRef.current = targetRotation;
    
    console.log('🎯 GlassCylinder: Stop calculation:', {
      targetIndex,
      targetName: targetItem?.name,
      extraCycles,
      naturalOffset: naturalOffset.toFixed(2),
      finalRotation: targetRotation.toFixed(2),
      currentRotation: rotation.toFixed(2)
    });

    decelerationPhaseRef.current = true;
    decelerateToTarget();
  }, [items, rotation]);

  const finalizeStop = useCallback(() => {
    setSpinning(false);
    velocityRef.current = 0;
    
    if (targetId && onSpinComplete) {
      const targetItem = items.find(item => item.id === targetId);
      if (targetItem) {
        console.log('✅ GlassCylinder: Spin complete - Winner:', targetItem.name);
        setTimeout(() => {
          onSpinComplete(targetItem);
        }, 600);
      }
    }
  }, [items, targetId, onSpinComplete]);

  const decelerateToTarget = useCallback(() => {
    if (targetRotationRef.current === null) return;

    const targetRotation = targetRotationRef.current;
    const startRotation = rotation;
    const startTime = performance.now();
    const decelerationDuration = 4500 + Math.random() * 1500;
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / decelerationDuration, 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      let currentRotation = startRotation + (targetRotation - startRotation) * easeOutQuart;
      
      if (progress > 0.88) {
        const wobbleIntensity = (1 - progress) * 6;
        const wobble = Math.sin(progress * 35) * wobbleIntensity;
        currentRotation += wobble;
      }
      
      setRotation(currentRotation);
      
      const currentIndex = Math.floor(Math.abs(currentRotation / ITEM_HEIGHT)) % items.length;
      setFocusedIndex(currentIndex);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        finalizeStop();
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  }, [rotation, items.length, finalizeStop]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const renderItems = () => {
    return items.map((item, index) => {
      const offset = (index * ITEM_HEIGHT - rotation) % (ITEM_HEIGHT * items.length);
      const normalizedOffset = offset < 0 ? offset + (ITEM_HEIGHT * items.length) : offset;
      const relativePosition = normalizedOffset - (ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2));
      
      const rotateX = (relativePosition / ITEM_HEIGHT) * 30;
      const translateZ = Math.cos((rotateX * Math.PI) / 180) * 350 - 350;
      const opacity = 1 - Math.abs(rotateX) / 85;
      const scale = 1 - Math.abs(rotateX) / 120;
      
      const isFocused = index === focusedIndex;
      
      return (
        <CylinderItem
          key={item.id}
          item={item}
          index={index}
          rotation={rotation}
          totalItems={items.length}
          isFocused={isFocused}
          isSpinning={spinning}
          transform={`rotateX(${rotateX}deg) translateZ(${translateZ}px) scale(${scale})`}
          opacity={opacity}
          zIndex={isFocused ? 100 : Math.floor(100 - Math.abs(rotateX))}
        />
      );
    });
  };

  return (
    <div className={styles.container}>
      <OceanBackground particles={particles} />
      <GlassFrame />
      
      <div className={styles.stage}>
        <div className={styles.cylinder}>
          <div className={styles.cylinderInner}>
            {renderItems()}
          </div>
        </div>
      </div>
      
      <FocusIndicator />
    </div>
  );
};

export default GlassCylinder;
