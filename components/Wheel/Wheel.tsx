// C:\Users\Nguyen Phuc\Web\tingrandom\components\Wheel\Wheel.tsx
'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import styles from './Wheel.module.css';

interface JudgeItem {
  id: string;
  name: string;
  color?: string;
  imageUrl?: string;
  contestant?: string;
  question?: string;
}

interface WheelProps {
  items: JudgeItem[];
  campaignId?: string;
  isSpinning?: boolean;
  isStopping?: boolean;
  targetId?: string;
  onSpinComplete?: (result: JudgeItem) => void;
}

const Wheel: React.FC<WheelProps> = ({
  items,
  campaignId,
  isSpinning = false,
  isStopping = false,
  targetId,
  onSpinComplete
}) => {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [wobbleOffset, setWobbleOffset] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const spinSpeedRef = useRef(0);
  const velocityRef = useRef(0);
  const stopRequestedRef = useRef(false);
  const targetRotationRef = useRef<number | null>(null);
  const decelerationPhaseRef = useRef(false);

  useEffect(() => {
    drawWheel();
  }, [items]);

  // Start spinning
  useEffect(() => {
    if (isSpinning && !spinning) {
      console.log('🎰 Wheel: Start infinite spin');
      startInfiniteSpin();
    }
  }, [isSpinning]);

  // Stop spinning
  useEffect(() => {
    if (isStopping && spinning && !stopRequestedRef.current) {
      if (!targetId) {
        console.warn('⚠️ Wheel: Stopping requested but targetId missing');
        return;
      }

      console.log('🛑 Wheel: Stop requested for target:', targetId);
      stopRequestedRef.current = true;
      calculateStopPosition(targetId);
    }
  }, [isStopping, spinning, targetId]);

  // Reset stop flag when not spinning
  useEffect(() => {
    if (!spinning) {
      stopRequestedRef.current = false;
      decelerationPhaseRef.current = false;
      targetRotationRef.current = null;
    }
  }, [spinning]);

  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const anglePerSegment = (2 * Math.PI) / items.length;

    // Draw segments
    items.forEach((item, index) => {
      const startAngle = index * anglePerSegment - Math.PI / 2;
      const endAngle = startAngle + anglePerSegment;

      // Segment background
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = item.color || `hsl(${(index * 360) / items.length}, 75%, 55%)`;
      ctx.fill();

      // Segment border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Inner gradient for depth
      const gradient = ctx.createRadialGradient(centerX, centerY, radius * 0.5, centerX, centerY, radius);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
      ctx.fillStyle = gradient;
      ctx.fill();

      // Text with better shadow
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + anglePerSegment / 2);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px "Segoe UI", Arial, sans-serif';
      ctx.fillText(item.name, radius * 0.65, 0);
      ctx.restore();
    });

    // Center hub with 3D effect
    const centerGradient = ctx.createRadialGradient(centerX, centerY - 5, 0, centerX, centerY, 60);
    centerGradient.addColorStop(0, '#7c3aed');
    centerGradient.addColorStop(0.5, '#6366f1');
    centerGradient.addColorStop(1, '#4f46e5');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, 60, 0, 2 * Math.PI);
    ctx.fillStyle = centerGradient;
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 5;
    ctx.stroke();

    // Center text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 6;
    ctx.fillText('SPIN', centerX, centerY);
  }, [items]);

  const startInfiniteSpin = useCallback(() => {
    setSpinning(true);
    decelerationPhaseRef.current = false;
    
    velocityRef.current = 5; // Start velocity
    let lastTime = performance.now();
    
    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 16.67;
      lastTime = currentTime;
      
      // ✅ ACCELERATION PHASE: Smooth ease-in
      if (!decelerationPhaseRef.current) {
        if (velocityRef.current < 25) {
          velocityRef.current += 0.4 * deltaTime; // Gradual acceleration
        }
        
        setRotation(prev => prev + velocityRef.current * deltaTime);
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // ✅ DECELERATION PHASE: Handled by decelerateToTarget
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  }, []);

  const calculateStopPosition = useCallback((resolvedTargetId: string) => {
    console.log('🎯 Wheel: Calculating stop position for:', resolvedTargetId);
    
    // Find target item
    let targetIndex = items.findIndex(item => item.id === resolvedTargetId);
    
    if (targetIndex === -1) {
      console.warn('⚠️ Wheel: Target not found, using random');
      targetIndex = Math.floor(Math.random() * items.length);
    }

    const targetItem = items[targetIndex];
    console.log('🎯 Wheel: Target item:', targetItem?.name, 'at index:', targetIndex);

    const anglePerSegment = 360 / items.length;
    
    // ✅ NATURAL OFFSET: Random position within segment (not perfectly centered)
    // Range: -40% to +40% of segment (more natural than exact center)
    const naturalOffset = (Math.random() - 0.5) * anglePerSegment * 0.8;
    
    // ✅ EXTRA SPINS: Random 5-8 full rotations for dramatic effect
    const extraSpins = 5 + Math.floor(Math.random() * 4);
    
    // Calculate target angle (pointer at top = 0°)
    const normalizedRotation = ((rotation % 360) + 360) % 360;
    const segmentCenterAngle = (targetIndex * anglePerSegment) + (anglePerSegment / 2);
    const targetAngle = 360 - segmentCenterAngle + naturalOffset;
    const targetAngleNormalized = ((targetAngle % 360) + 360) % 360;
    
    // Calculate final rotation
    const baseRotation = rotation - normalizedRotation;
    const finalRotation = baseRotation + (extraSpins * 360) + targetAngleNormalized;
    
    targetRotationRef.current = finalRotation;
    
    console.log('🎯 Wheel: Stop calculation:', {
      targetIndex,
      targetName: targetItem?.name,
      extraSpins,
      naturalOffset: naturalOffset.toFixed(2),
      finalRotation: finalRotation.toFixed(2),
      currentRotation: rotation.toFixed(2)
    });

    // Start deceleration
    decelerationPhaseRef.current = true;
    decelerateToTarget();
  }, [items, rotation]);

  const decelerateToTarget = useCallback(() => {
    if (targetRotationRef.current === null) return;

    const targetRotation = targetRotationRef.current;
    const startRotation = rotation;
    const startVelocity = velocityRef.current;
    const startTime = performance.now();
    
    // ✅ DECELERATION DURATION: 4-6 seconds for realistic feel
    const decelerationDuration = 4000 + Math.random() * 2000;
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / decelerationDuration, 1);
      
      // ✅ PHYSICS-BASED EASING: Custom cubic-bezier for realistic deceleration
      // Simulates friction: fast at first, very slow at end
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      const currentRotation = startRotation + (targetRotation - startRotation) * easeOutQuart;
      setRotation(currentRotation);
      
      // ✅ WOBBLE EFFECT: Near the end, add slight oscillation (like real wheel)
      if (progress > 0.85) {
        const wobbleIntensity = (1 - progress) * 5; // Decrease as we approach stop
        const wobble = Math.sin(progress * 30) * wobbleIntensity;
        setWobbleOffset(wobble);
      }
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // ✅ COMPLETE: Finalize stop
        setWobbleOffset(0);
        finalizeStop();
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  }, [rotation]);

  const finalizeStop = useCallback(() => {
    setSpinning(false);
    velocityRef.current = 0;
    
    if (targetId && onSpinComplete) {
      const targetItem = items.find(item => item.id === targetId);
      if (targetItem) {
        console.log('✅ Wheel: Spin complete - Winner:', targetItem.name, 'ID:', targetItem.id);
        
        // Delay callback for dramatic effect
        setTimeout(() => {
          onSpinComplete(targetItem);
        }, 500);
      }
    }
  }, [items, targetId, onSpinComplete]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className={styles.wheelWrapper}>
      <div className={styles.wheelShadow}></div>
      
      {/* Wheel container with physics-based rotation */}
      <div 
        className={`${styles.wheelContainer} ${spinning ? styles.spinning : ''}`}
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: 'none' // All animations handled by JS for smooth physics
        }}
      >
        <canvas
          ref={canvasRef}
          width={700}
          height={700}
          className={styles.canvas}
        />
      </div>
      
      {/* Pointer with wobble effect */}
      <div 
        className={styles.pointerContainer}
        style={{
          transform: `translateX(-50%) rotate(${wobbleOffset}deg)`,
          transition: wobbleOffset !== 0 ? 'transform 0.1s ease-out' : 'none'
        }}
      >
        <div className={styles.pointerGlow}></div>
        <div className={styles.pointer}>▼</div>
      </div>
    </div>
  );
};

export default Wheel;
