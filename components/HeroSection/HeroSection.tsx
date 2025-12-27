// components/HeroSection/HeroSection.tsx
'use client';

import React, { useState, useEffect } from 'react';
import BackgroundWrapper from './BackgroundWrapper';
import LeftColumn from './LeftColumn';
import MiddleColumn from './MiddleColumn';
import RightColumn from './RightColumn';
import Modals from './Modals';

interface HeroSectionProps {
  user?: any;
}

interface Segment {
  id: string;
  label: string;
  color: string;
  image?: string;
}

interface SpinHistoryItem {
  id: string;
  result: string;
  timestamp: number;
}

type TierType = 'personal' | 'business' | 'enterprise';
type ActiveTab = 'history' | 'settings' | 'customize';

const HeroSection: React.FC<HeroSectionProps> = ({ user }) => {
  // State Management
  const [currentTier, setCurrentTier] = useState<TierType>('personal');
  const [activeTab, setActiveTab] = useState<ActiveTab>('settings');
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinCount, setSpinCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  // Wheel Configuration
  const [segments, setSegments] = useState<Segment[]>([
    { id: '1', label: 'Giải nhất', color: '#FFD700' },
    { id: '2', label: 'Giải nhì', color: '#C0C0C0' },
    { id: '3', label: 'Giải ba', color: '#CD7F32' },
    { id: '4', label: 'Khuyến khích', color: '#4ECDC4' },
    { id: '5', label: 'May mắn', color: '#FF6B6B' },
    { id: '6', label: 'Tham gia', color: '#95E1D3' },
  ]);
  
  const [spinHistory, setSpinHistory] = useState<SpinHistoryItem[]>([]);
  const [wheelShape, setWheelShape] = useState<'circle' | 'fan' | 'clock'>('circle');
  const [spinDuration, setSpinDuration] = useState(5);
  const [enableSound, setEnableSound] = useState(true);

  // LocalStorage Management
  useEffect(() => {
    const savedSegments = localStorage.getItem('tingrandom_segments');
    const savedHistory = localStorage.getItem('tingrandom_history');
    const savedSpinCount = localStorage.getItem('tingrandom_spincount');
    const savedConfig = localStorage.getItem('tingrandom_config');
    
    if (savedSegments) setSegments(JSON.parse(savedSegments));
    if (savedHistory) setSpinHistory(JSON.parse(savedHistory));
    if (savedSpinCount) setSpinCount(parseInt(savedSpinCount));
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      setWheelShape(config.wheelShape || 'circle');
      setSpinDuration(config.spinDuration || 5);
      setEnableSound(config.enableSound !== false);
    }
  }, []);

  // Save to localStorage whenever config changes
  useEffect(() => {
    localStorage.setItem('tingrandom_segments', JSON.stringify(segments));
  }, [segments]);

  useEffect(() => {
    localStorage.setItem('tingrandom_history', JSON.stringify(spinHistory));
  }, [spinHistory]);

  useEffect(() => {
    localStorage.setItem('tingrandom_spincount', spinCount.toString());
  }, [spinCount]);

  useEffect(() => {
    localStorage.setItem('tingrandom_config', JSON.stringify({
      wheelShape,
      spinDuration,
      enableSound
    }));
  }, [wheelShape, spinDuration, enableSound]);

  // Tier Limitations Check - Updated Logic
  const canSpin = (): boolean => {
    // TIER 1: Personal - Hoàn toàn miễn phí, không giới hạn
    if (currentTier === 'personal') return true;
    
    // TIER 2: Business - Chỉnh sửa thoải mái, nhưng quay cần login sau 5 lần
    if (currentTier === 'business' && !isLoggedIn && spinCount >= 5) {
      setShowLoginModal(true);
      return false;
    }
    
    // TIER 3: Enterprise - Không giới hạn + Director Mode
    if (currentTier === 'enterprise') return true;
    
    return true;
  };

  const canAccessFeature = (feature: string): boolean => {
    // TIER 1: Personal - Chỉ tính năng cơ bản (quay + lưu segments)
    if (currentTier === 'personal') {
      return ['basic_spin', 'save_segments'].includes(feature);
    }
    
    // TIER 2: Business - Tất cả tùy chỉnh, nhưng cần login để quay (sau 5 lần)
    if (currentTier === 'business') {
      if (feature === 'director_mode') return false;
      return true; // image_upload, export, customize, etc.
    }
    
    // TIER 3: Enterprise - Full access + Director Mode
    if (currentTier === 'enterprise') return true;
    
    return false;
  };

  // Wheel Actions
  const handleSpin = () => {
    if (!canSpin()) return;
    setIsSpinning(true);
    setSpinCount(prev => prev + 1);
  };

  const handleSpinComplete = (result: string) => {
    setIsSpinning(false);
    const newHistoryItem: SpinHistoryItem = {
      id: Date.now().toString(),
      result,
      timestamp: Date.now()
    };
    setSpinHistory(prev => [newHistoryItem, ...prev].slice(0, 50));
  };

  // Segment Management
  const addSegment = () => {
    const newSegment: Segment = {
      id: Date.now().toString(),
      label: `Tùy chọn ${segments.length + 1}`,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`
    };
    setSegments([...segments, newSegment]);
  };

  const updateSegment = (id: string, updates: Partial<Segment>) => {
    setSegments(segments.map(seg => 
      seg.id === id ? { ...seg, ...updates } : seg
    ));
  };

  const deleteSegment = (id: string) => {
    if (segments.length > 2) {
      setSegments(segments.filter(seg => seg.id !== id));
    }
  };

  const handleImageUpload = (id: string, file: File) => {
    if (!canAccessFeature('image_upload')) {
      setShowUpgradeModal(true);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      updateSegment(id, { image: e.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  // Export/Import
  const exportToExcel = () => {
    if (!canAccessFeature('export')) {
      setShowUpgradeModal(true);
      return;
    }
    const csvContent = segments.map(s => `${s.label},${s.color}`).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tingrandom_segments.csv';
    a.click();
  };

  const handleLogin = () => {
    // Mock login - in real app, implement authentication
    setIsLoggedIn(true);
    setShowLoginModal(false);
    setCurrentTier('business');
  };

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter') {
        handleSpin();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [spinCount, isLoggedIn, currentTier]);

  return (
    <BackgroundWrapper>
      <LeftColumn />
      
      <MiddleColumn 
        segments={segments}
        onSpinComplete={handleSpinComplete}
        isSpinning={isSpinning}
        currentTier={currentTier}
        spinCount={spinCount}
        isLoggedIn={isLoggedIn}
        spinDuration={spinDuration}
        wheelShape={wheelShape}
        onSpin={handleSpin}
      />
      
      <RightColumn 
        currentTier={currentTier}
        activeTab={activeTab}
        segments={segments}
        spinHistory={spinHistory}
        spinDuration={spinDuration}
        enableSound={enableSound}
        wheelShape={wheelShape}
        onTierChange={setCurrentTier}
        onTabChange={setActiveTab}
        onAddSegment={addSegment}
        onUpdateSegment={updateSegment}
        onDeleteSegment={deleteSegment}
        onImageUpload={handleImageUpload}
        onSpinDurationChange={setSpinDuration}
        onSoundToggle={setEnableSound}
        onWheelShapeChange={setWheelShape}
        onExportToExcel={exportToExcel}
        onClearHistory={() => setSpinHistory([])}
        canAccessFeature={canAccessFeature}
      />
      
      <Modals 
        showLoginModal={showLoginModal}
        showUpgradeModal={showUpgradeModal}
        onCloseLoginModal={() => setShowLoginModal(false)}
        onCloseUpgradeModal={() => setShowUpgradeModal(false)}
        onLogin={handleLogin}
        onUpgrade={setCurrentTier}
      />
    </BackgroundWrapper>
  );
};

export default HeroSection;
