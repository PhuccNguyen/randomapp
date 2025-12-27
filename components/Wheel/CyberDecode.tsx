// C:\Users\Nguyen Phuc\Web\tingrandom\components\Wheel\CyberDecode.tsx
'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import styles from './CyberDecode.module.css';

interface JudgeItem {
  id: string;
  name: string;
  color?: string;
  imageUrl?: string;
  contestant?: string;
  question?: string;
}

interface CyberDecodeProps {
  items?: JudgeItem[];
  campaignId?: string;
  isSpinning?: boolean;
  isStopping?: boolean;
  targetId?: string;
  onSpinComplete?: (result: JudgeItem) => void;
}

const CyberDecode: React.FC<CyberDecodeProps> = ({
  items = [],
  campaignId,
  isSpinning = false,
  isStopping = false,
  targetId,
  onSpinComplete
}) => {
  const [displayText, setDisplayText] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [decoding, setDecoding] = useState(false);
  const [scanlines, setScanlines] = useState<number[]>([]);
  const animationRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const stopRequestedRef = useRef(false);
  const targetItemRef = useRef<JudgeItem | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*';

  // Start spinning
  useEffect(() => {
    if (isSpinning && !spinning) {
      console.log('🎰 CyberDecode: Start scramble');
      startScramble();
    }
  }, [isSpinning]);

  // Stop spinning
  useEffect(() => {
    if (isStopping && spinning && !stopRequestedRef.current) {
      if (!targetId) {
        console.warn('⚠️ CyberDecode: Stopping requested but targetId missing');
        return;
      }

      console.log('🛑 CyberDecode: Decode requested for target:', targetId);
      stopRequestedRef.current = true;
      startDecode(targetId);
    }
  }, [isStopping, spinning, targetId]);

  // Reset stop flag when not spinning
  useEffect(() => {
    if (!spinning && !decoding) {
      stopRequestedRef.current = false;
      targetItemRef.current = null;
    }
  }, [spinning, decoding]);

  // Audio context for typing sound
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, []);

  const playTypingSound = useCallback(() => {
    if (!audioContextRef.current) return;
    
    try {
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      oscillator.frequency.value = 800 + Math.random() * 200;
      oscillator.type = 'square';
      
      gainNode.gain.setValueAtTime(0.05, audioContextRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + 0.05);
      
      oscillator.start(audioContextRef.current.currentTime);
      oscillator.stop(audioContextRef.current.currentTime + 0.05);
    } catch (err) {
      console.warn('Audio playback failed:', err);
    }
  }, []);

  const generateRandomText = useCallback((length: number) => {
    return Array.from({ length }, () => 
      CHARS[Math.floor(Math.random() * CHARS.length)]
    ).join('');
  }, []);

  const startScramble = useCallback(() => {
    setSpinning(true);
    setDecoding(false);
    setScanlines(Array.from({ length: 5 }, (_, i) => i * 20));
    
    // Scramble text rapidly
    intervalRef.current = setInterval(() => {
      const randomItem = items[Math.floor(Math.random() * items.length)];
      const scrambled = generateRandomText(randomItem.name.length);
      setDisplayText(scrambled);
      playTypingSound();
    }, 50);
  }, [items, generateRandomText, playTypingSound]);

  const startDecode = useCallback((resolvedTargetId: string) => {
    console.log('🎯 CyberDecode: Decoding target:', resolvedTargetId);
    
    let targetItem = items.find(item => item.id === resolvedTargetId);
    
    if (!targetItem) {
      console.warn('⚠️ CyberDecode: Target not found, using random');
      targetItem = items[Math.floor(Math.random() * items.length)];
    }

    targetItemRef.current = targetItem;
    console.log('🎯 CyberDecode: Target item:', targetItem.name);

    // Stop scrambling
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    setSpinning(false);
    setDecoding(true);
    
    // ✅ DECODE LETTER BY LETTER with variable speed
    const targetText = targetItem.name.toUpperCase();
    let currentIndex = 0;
    let decoded = '';
    
    // ✅ Progressive decode speed: Start fast, slow down at end
    const getDecodeDelay = (index: number, total: number) => {
      const progress = index / total;
      return 80 + (progress * 150); // 80ms -> 230ms (slows down)
    };
    
    const decodeNextChar = () => {
      if (currentIndex >= targetText.length) {
        setTimeout(() => {
          finalizeStop();
        }, 1000);
        return;
      }
      
      // Scramble remaining characters (fewer as we decode)
      const scrambleLength = Math.max(0, targetText.length - currentIndex - 1);
      const scrambled = scrambleLength > 0 ? generateRandomText(scrambleLength) : '';
      
      // Add next decoded character
      decoded += targetText[currentIndex];
      setDisplayText(decoded + scrambled);
      playTypingSound();
      
      currentIndex++;
      
      // Variable delay for dramatic effect
      const delay = getDecodeDelay(currentIndex, targetText.length);
      setTimeout(decodeNextChar, delay);
    };
    
    decodeNextChar();
    
  }, [items, generateRandomText, playTypingSound]); // ✅ Remove finalizeStop from deps

  const finalizeStop = useCallback(() => {
    setDecoding(false);
    
    if (targetId && onSpinComplete && targetItemRef.current) {
      console.log('✅ CyberDecode: Decode complete - Winner:', targetItemRef.current.name);
      setTimeout(() => {
        onSpinComplete(targetItemRef.current!);
      }, 500);
    }
  }, [targetId, onSpinComplete]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Animated scanlines
  useEffect(() => {
    if (spinning || decoding) {
      const scanlineInterval = setInterval(() => {
        setScanlines(prev => 
          prev.map(pos => (pos + 2) % 100)
        );
      }, 50);
      
      return () => clearInterval(scanlineInterval);
    }
  }, [spinning, decoding]);

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {Array.from({ length: 100 }).map((_, i) => (
          <div key={i} className={styles.gridCell}></div>
        ))}
      </div>
      
      {scanlines.map((pos, i) => (
        <div 
          key={i}
          className={styles.scanline}
          style={{ top: `${pos}%` }}
        ></div>
      ))}
      
      <div className={styles.codeDisplay}>
        <div className={styles.terminal}>
          <div className={styles.terminalHeader}>
            <span className={styles.terminalTitle}>◉ DECODING SEQUENCE</span>
            <span className={styles.terminalStatus}>
              {spinning && '⟳ SCRAMBLING'}
              {decoding && '⚡ DECODING'}
              {!spinning && !decoding && '● STANDBY'}
            </span>
          </div>
          
          <div className={styles.terminalBody}>
            <div className={styles.codeText}>
              {displayText}
              <span className={styles.cursor}>█</span>
            </div>
            
            {targetItemRef.current && decoding && (
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill}
                  style={{
                    width: `${(displayText.replace(/[^A-Z0-9]/g, '').length / targetItemRef.current.name.length) * 100}%`
                  }}
                ></div>
              </div>
            )}
          </div>
        </div>
        
        <div className={styles.dataStream}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div 
              key={i}
              className={styles.streamLine}
              style={{
                animationDelay: `${i * 0.1}s`,
                left: `${(i * 5) % 100}%`
              }}
            >
              {generateRandomText(40)}
            </div>
          ))}
        </div>
      </div>
      
      <div className={styles.glitchOverlay}>
        {(spinning || decoding) && (
          <>
            <div className={styles.glitchBar} style={{ top: '20%' }}></div>
            <div className={styles.glitchBar} style={{ top: '50%' }}></div>
            <div className={styles.glitchBar} style={{ top: '80%' }}></div>
          </>
        )}
      </div>
    </div>
  );
};

export default CyberDecode;
