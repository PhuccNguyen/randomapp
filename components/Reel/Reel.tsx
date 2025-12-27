'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { io, Socket } from 'socket.io-client';
import { getSocketUrl, socketOptions } from '@/lib/socket-client';
import { Sparkles, Crown, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import styles from './Reel.module.css';
import type { JudgeItem } from '@/lib/types';

interface ReelProps {
  items: JudgeItem[];
  campaignId: string;
}

export default function Reel({ items, campaignId }: ReelProps) {
  const reelRef = useRef<HTMLDivElement>(null);
  const [, setSocket] = useState<Socket | null>(null);
  const [selectedItem, setSelectedItem] = useState<JudgeItem | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [targetId, setTargetId] = useState<string | null>(null);
  
  const CARD_WIDTH = 180; // Width of each card + gap
  const VISIBLE_CARDS = 7; // Number of visible cards
  
  // Duplicate items để tạo loop effect
  const loopedItems = [...items, ...items, ...items];
  
  // Socket.io Connection
  useEffect(() => {
    const socketUrl = getSocketUrl();
    console.log('🔌 Reel connecting to:', socketUrl);
    
    const socketInstance = io(socketUrl, socketOptions);
    
    socketInstance.on('connect', () => {
      console.log('🎰 Reel connected to Socket.io');
    });
    
    socketInstance.on('trigger:spin', (data) => {
      console.log('🚀 Reel received spin trigger:', data);
      if (data.campaignId === campaignId) {
        setIsSpinning(true);
        setShowResult(false);
        setSelectedItem(null);
      }
    });
    
    socketInstance.on('trigger:stop', (data) => {
      console.log('🎯 Reel received stop trigger:', data);
      if (data.campaignId === campaignId) {
        setTargetId(data.targetId);
      }
    });
    
    return () => {
      setSocket(socketInstance);
      socketInstance.disconnect();
    };
  }, [campaignId]);
  
  // Tính toán position để center item
  const calculateTargetPosition = useCallback((targetIndex: number) => {
    const centerOffset = (VISIBLE_CARDS / 2) * CARD_WIDTH;
    const itemPosition = targetIndex * CARD_WIDTH;
    return centerOffset - itemPosition;
  }, []);
  
  // Animation logic
  useEffect(() => {
    if (!isSpinning || !targetId || !reelRef.current) return;
    
    const targetIndex = items.findIndex(item => item.id === targetId);
    if (targetIndex === -1) {
      console.error('Target not found:', targetId);
      return;
    }
    
    // Tính vị trí target trong middle array
    const middleArrayStartIndex = items.length;
    const finalTargetIndex = middleArrayStartIndex + targetIndex;
    const targetPosition = calculateTargetPosition(finalTargetIndex);
    
    // Animation với GSAP
    gsap.to(reelRef.current, {
      x: targetPosition,
      duration: 5 + Math.random() * 2,
      ease: 'power3.out',
      onComplete: () => {
        // Position updated via GSAP animation
        setSelectedItem(items[targetIndex]);
        setShowResult(true);
        setIsSpinning(false);
        
        // Confetti effect
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.5 },
          colors: ['#D4AF37', '#F5E6B8', '#B8941F']
        });
      }
    });
  }, [isSpinning, targetId, items, calculateTargetPosition]);
  
  const closeResult = () => {
    setShowResult(false);
    setSelectedItem(null);
  };
  
  return (
    <div className={styles.container}>
      {/* Center Indicator */}
      <div className={styles.centerIndicator}>
        <div className={styles.indicatorLine}></div>
        <div className={styles.indicatorIcon}>
          <Zap size={24} />
        </div>
        <div className={styles.indicatorLine}></div>
      </div>
      
      {/* Reel Track */}
      <div className={styles.reelTrack}>
        <div ref={reelRef} className={styles.reelContainer}>
          {loopedItems.map((item, index) => {
            const distanceFromCenter = Math.abs(index - VISIBLE_CARDS / 2);
            const scale = Math.max(0.7, 1 - distanceFromCenter * 0.1);
            const opacity = Math.max(0.3, 1 - distanceFromCenter * 0.15);
            
            return (
              <div
                key={`${item.id}-${index}`}
                className={styles.reelCard}
                style={{
                  transform: `scale(${scale})`,
                  opacity: opacity,
                }}
              >
                <div className={styles.cardInner}>
                  {item.imageUrl ? (
                    <div className={styles.cardImage}>
                      <Image 
                        src={item.imageUrl || '/images/placeholder.svg'} 
                        alt={item.name} 
                        width={50}
                        height={50}
                      />
                    </div>
                  ) : (
                    <div className={styles.cardIcon}>
                      <Crown size={32} />
                    </div>
                  )}
                  
                  <div className={styles.cardContent}>
                    <h4 className={styles.cardName}>{item.name}</h4>
                    {item.hasQuestion && (
                      <div className={styles.cardBadge}>
                        <Sparkles size={12} />
                        <span>Có câu hỏi</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Decorative Edges */}
      <div className={styles.edgeGradient} style={{ left: 0 }}></div>
      <div className={styles.edgeGradient} style={{ right: 0 }}></div>
      
      {/* Result Popup */}
      {showResult && selectedItem && (
        <div className={styles.resultOverlay} onClick={closeResult}>
          <div className={styles.resultModal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={closeResult}>×</button>
            
            <div className={styles.resultContent}>
              <div className={styles.resultIcon}>
                <Crown size={48} />
              </div>
              
              <h2 className={styles.resultTitle}>🎉 Kết Quả</h2>
              
              {selectedItem.imageUrl ? (
                <div className={styles.resultImage}>
                  <Image 
                    src={selectedItem.imageUrl || '/images/placeholder.svg'} 
                    alt={selectedItem.name} 
                    width={80}
                    height={80}
                  />
                </div>
              ) : (
                <div className={styles.resultPlaceholder}>
                  <Crown size={64} />
                </div>
              )}
              
              <h3 className={styles.resultName}>{selectedItem.name}</h3>
              
              {selectedItem.hasQuestion && (
                <div className={styles.resultBadge}>
                  <Sparkles size={16} />
                  <span>Có câu hỏi</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
