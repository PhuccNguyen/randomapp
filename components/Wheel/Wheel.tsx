// C:\Users\Nguyen Phuc\Web\tingrandom\components\Wheel\Wheel.tsx
'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import styles from './Wheel.module.css';

interface JudgeItem {
  id: string;
  name: string;
  color?: string;
  imageUrl?: string;
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const spinSpeedRef = useRef(0);

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
    if (isStopping && spinning) {
      console.log('🛑 Wheel: Stopping spin with target:', targetId);
      stopSpin();
    }
  }, [isStopping, targetId]);

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

      // Segment
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = item.color || `hsl(${(index * 360) / items.length}, 75%, 55%)`;
      ctx.fill();

      // Border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Inner glow
      const gradient = ctx.createRadialGradient(centerX, centerY, radius * 0.7, centerX, centerY, radius);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
      ctx.fillStyle = gradient;
      ctx.fill();

      // Text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + anglePerSegment / 2);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Text shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px "Segoe UI", Arial, sans-serif';
      ctx.fillText(item.name, radius * 0.6, 0);
      ctx.restore();
    });

    // Center circle with gradient
    const centerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 50);
    centerGradient.addColorStop(0, '#667eea');
    centerGradient.addColorStop(1, '#764ba2');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, 50, 0, 2 * Math.PI);
    ctx.fillStyle = centerGradient;
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Center logo/text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 4;
    ctx.fillText('SPIN', centerX, centerY);
  }, [items]);

  const startInfiniteSpin = useCallback(() => {
    setSpinning(true);
    
    let currentRotation = rotation;
    spinSpeedRef.current = 20; // Initial speed
    
    const animate = () => {
      // Accelerate to max speed
      if (spinSpeedRef.current < 30) {
        spinSpeedRef.current += 0.5;
      }
      
      currentRotation += spinSpeedRef.current;
      setRotation(currentRotation % 360);
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
  }, [rotation]);

const stopSpin = useCallback(() => {
  // Cancel animation
  if (animationRef.current) {
    cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
  }
  
  let targetIndex = Math.floor(Math.random() * items.length);
  
  // Find target item if specified
  if (targetId) {
    const foundIndex = items.findIndex(item => item.id === targetId);
    if (foundIndex !== -1) {
      targetIndex = foundIndex;
      console.log('🎯 Wheel: Target found at index:', targetIndex, '- Name:', items[targetIndex].name);
    }
  }
  
  // CRITICAL FIX: Calculate angle correctly for pointer at top
  const anglePerSegment = 360 / items.length;
  
  // The pointer is at top (12 o'clock position)
  // When drawing, we start at -90° (top), so segment 0 is from -90° to -90° + anglePerSegment
  // To make segment land at pointer (top), we need the CENTER of that segment to be at top
  
  // Current rotation normalized to 0-360
  const currentNormalized = rotation % 360;
  
  // Calculate the angle where the CENTER of target segment should be
  // Segments are drawn starting from -90° (top), going clockwise
  // Segment 0 center is at: -90° + anglePerSegment/2 = -90° + anglePerSegment/2
  // But we need to convert this to positive rotation and invert direction
  
  // Since wheel rotates clockwise but we want to land at pointer (top = 0° or 360°)
  // Target segment center should align with 90° (pointer position after rotation correction)
  const segmentCenterOffset = anglePerSegment / 2;
  
  // The angle we need to rotate TO (in our rotation coordinate system)
  // Invert the index because wheel spins opposite direction
  const targetAngle = 360 - (targetIndex * anglePerSegment + segmentCenterOffset);
  
  // Calculate rotation needed from current position
  let rotationNeeded = targetAngle - currentNormalized;
  
  // Normalize to positive rotation
  while (rotationNeeded < 0) {
    rotationNeeded += 360;
  }
  
  // Add extra spins for effect (at least 5 full rotations)
  const extraSpins = 5;
  const finalRotation = rotation + rotationNeeded + (extraSpins * 360);

  console.log('🎯 Wheel Stop Calculation:', {
    targetIndex,
    targetName: items[targetIndex].name,
    anglePerSegment,
    currentNormalized: currentNormalized.toFixed(2),
    targetAngle: targetAngle.toFixed(2),
    rotationNeeded: rotationNeeded.toFixed(2),
    finalRotation: finalRotation.toFixed(2),
    willLandAt: (finalRotation % 360).toFixed(2)
  });

  setRotation(finalRotation);

  // Call onSpinComplete after animation
  setTimeout(() => {
    setSpinning(false);
    if (onSpinComplete) {
      onSpinComplete(items[targetIndex]);
    }
    console.log('✅ Wheel: Spin complete - Winner:', items[targetIndex].name);
  }, 5000); // 5s for deceleration animation
}, [rotation, items, targetId, onSpinComplete]);

  // Cleanup on unmount
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
      <div 
        className={`${styles.wheelContainer} ${spinning ? styles.spinning : ''}`}
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: isStopping 
            ? 'transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)' 
            : 'none'
        }}
      >
        <canvas
          ref={canvasRef}
          width={700}
          height={700}
          className={styles.canvas}
        />
      </div>
      
      {/* Pointer with glow effect */}
      <div className={styles.pointerContainer}>
        <div className={styles.pointerGlow}></div>
        <div className={styles.pointer}>▼</div>
      </div>
    </div>
  );
};

export default Wheel;
