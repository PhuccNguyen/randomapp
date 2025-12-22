// components/Wheel/Wheel.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
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
  targetId?: string;
}

const Wheel: React.FC<WheelProps> = ({
  items,
  campaignId,
  isSpinning = false,
  targetId
}) => {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    drawWheel();
  }, [items]);

  useEffect(() => {
    if (isSpinning && !spinning) {
      spin();
    }
  }, [isSpinning]);

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const anglePerSegment = (2 * Math.PI) / items.length;

    items.forEach((item, index) => {
      const startAngle = index * anglePerSegment - Math.PI / 2;
      const endAngle = startAngle + anglePerSegment;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = item.color || `hsl(${(index * 360) / items.length}, 70%, 60%)`;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + anglePerSegment / 2);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Arial';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 4;
      ctx.fillText(item.name, radius / 2, 0);
      ctx.restore();
    });

    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#333';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();
  };

  const spin = () => {
    setSpinning(true);
    
    let targetIndex = Math.floor(Math.random() * items.length);
    
    // ✅ If targetId is specified, find that item
    if (targetId) {
      const foundIndex = items.findIndex(item => item.id === targetId);
      if (foundIndex !== -1) {
        targetIndex = foundIndex;
      }
    }
    
    const anglePerSegment = 360 / items.length;
    const targetAngle = targetIndex * anglePerSegment;
    const spins = 5;
    const finalRotation = rotation + (spins * 360) + (360 - targetAngle);

    setRotation(finalRotation);

    setTimeout(() => {
      setSpinning(false);
    }, 3000);
  };

  return (
    <div className={styles.wheelWrapper}>
      <div 
        className={styles.wheelContainer}
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: spinning ? 'transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none'
        }}
      >
        <canvas
          ref={canvasRef}
          width={600}
          height={600}
          className={styles.canvas}
        />
      </div>
      <div className={styles.pointer}>▼</div>
    </div>
  );
};

export default Wheel;
