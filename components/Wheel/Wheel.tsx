// C:\Users\Nguyen Phuc\Web\tingrandom\components\Wheel\Wheel.tsx
'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import styles from './Wheel.module.css';

interface JudgeItem {
  id: string;
  name: string;
  color?: string;
  imageUrl?: string;
  contestant?: string;  // ✅ Added: Thí sinh
  question?: string;    // ✅ Added: Câu hỏi
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

  const stopRequestedRef = useRef(false);

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

  const stopSpin = useCallback((targetIdOverride?: string) => {
    // Cancel animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    const resolvedTargetId = targetIdOverride || targetId;
    console.log('🛑 Wheel stopSpin called with:', { targetId: resolvedTargetId, itemsLength: items.length });
    console.log('🛑 Wheel: Items array:', items.map((i, idx) => ({ idx, id: i.id, name: i.name })));

    // ✅ CRITICAL: Lấy target từ ID, không phải index!
    // Vì items array có thể có thứ tự khác nhau ở khác nơi
    let targetIndex = -1;
    let targetItem: JudgeItem | undefined;

    if (resolvedTargetId) {
      targetItem = items.find(item => item.id === resolvedTargetId);
      if (targetItem) {
        targetIndex = items.indexOf(targetItem);
      } else {
        console.warn('⚠️ Wheel: Target ID not found:', resolvedTargetId);
      }
    }

    if (targetIndex === -1) {
      console.warn('⚠️ Wheel: Falling back to random target');
      targetIndex = Math.floor(Math.random() * items.length);
      targetItem = items[targetIndex];
    }

    // ✅ CALCULATE ANGLE: Dùng targetIndex để tính angle
    const anglePerSegment = 360 / items.length;

    const extraSpins = 4;
    const normalizedRotation = ((rotation % 360) + 360) % 360;
    const stopAngleBase = 360 - (targetIndex * anglePerSegment) - (anglePerSegment / 2);
    const targetStopAngle = ((stopAngleBase % 360) + 360) % 360;
    const baseRotation = rotation + (360 - normalizedRotation);
    const finalRotation = baseRotation + (extraSpins * 360) + targetStopAngle;

    console.log('🎯 Wheel Stop:', {
      targetId: resolvedTargetId,
      targetIndex,
      targetName: items[targetIndex]?.name,
      targetStopAngle: targetStopAngle.toFixed(2),
      finalRotation: finalRotation.toFixed(2)
    });

    setRotation(finalRotation);

    // Call onSpinComplete after animation finishes
    setTimeout(() => {
      setSpinning(false);
      if (onSpinComplete && targetItem) {
        console.log('✅ Wheel: Spin complete - Winner:', targetItem.name, 'ID:', targetItem.id);
        onSpinComplete(targetItem); // Gửi item chính xác (từ targetId)
      }
    }, 5000);
  }, [rotation, items, targetId, onSpinComplete]);

  useEffect(() => {
    if (isStopping && spinning && !stopRequestedRef.current) {
      if (!targetId) {
        console.warn('⚠️ Wheel: Stopping requested but targetId missing, waiting for server payload...');
        return;
      }

      stopRequestedRef.current = true;
      stopSpin(targetId);
    }
  }, [isStopping, spinning, targetId, stopSpin]);

  useEffect(() => {
    if (!spinning) {
      stopRequestedRef.current = false;
    }
  }, [spinning]);

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
