// C:\Users\Nguyen Phuc\Web\tingrandom\components\ControlPanel\hooks\useSocket.ts
'use client';

import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { getSocketUrl, socketOptions } from '@/lib/socket-client';
import { ControlState, HistoryItem, DirectorScript, JudgeItem } from '../types';

interface UseSocketReturn {
  connected: boolean;
  state: ControlState;
  triggerSpin: (spinDuration?: number) => void;
  triggerStop: () => void;
  triggerNext: () => void;
  overrideTarget: (targetId: string) => void;
  updateScript: (script: DirectorScript[]) => void;
  startAutoSpin: (duration: number) => void;
  stopAutoSpin: () => void;
  setStep: (stepIndex: number) => void;
}

export const useSocket = (campaignId: string, items?: JudgeItem[]): UseSocketReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [state, setState] = useState<ControlState>({
    status: 'idle',
    currentStep: 0,
    targetId: undefined,
    history: [],
    spinDuration: 5,
    script: [],
    items: items || [] // ✅ Initialize items
  });

  useEffect(() => {
    const socketUrl = getSocketUrl();
    console.log('🔌 Control Panel connecting to:', socketUrl);
    
    const newSocket = io(socketUrl, socketOptions);

    newSocket.on('connect', () => {
      console.log('✅ Control: Socket connected:', newSocket.id);
      setConnected(true);
      newSocket.emit('join', campaignId);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Control: Socket disconnected');
      setConnected(false);
    });

    newSocket.on('state:update', (data: Partial<ControlState>) => {
      console.log('📡 Control: State update:', data);
      setState(prev => ({ ...prev, ...data }));
    });

    newSocket.on('history:add', (item: HistoryItem) => {
      console.log('📝 Control: History item added:', item);
      setState(prev => ({
        ...prev,
        history: [item, ...prev.history]
      }));
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [campaignId, items]); // ✅ Thêm items vào dependency

  const triggerSpin = useCallback((spinDuration?: number) => {
    if (!socket) return;
    
    console.log('🎲 Control: Triggering spin with duration:', spinDuration || state.spinDuration);
    
    const currentScript = state.script?.[state.currentStep];
    
    socket.emit('control:spin', {
      campaignId,
      spinDuration: spinDuration || state.spinDuration,
      targetId: state.targetId,
      scriptInfo: currentScript ? {
        step: currentScript.step,
        contestant: currentScript.contestant,
        question: currentScript.question_content
      } : null
    });

    setState(prev => ({ ...prev, status: 'spinning' }));
  }, [socket, campaignId, state.targetId, state.spinDuration, state.currentStep, state.script]);

  const triggerStop = useCallback(() => {
    if (!socket) return;
    
    console.log('🛑 Control: Triggering stop');
    socket.emit('control:stop', { 
      campaignId,
      targetId: state.targetId,
      items: state.items, // ✅ Gửi danh sách items để server random nếu cần
      script: state.script, // ✅ Gửi script để server tìm contestant/question
      currentStep: state.currentStep // ✅ Current step trong script
    });

    setState(prev => ({ ...prev, status: 'stopped' }));
  }, [socket, campaignId, state.targetId, state.items, state.script, state.currentStep]);

  const triggerNext = useCallback(() => {
    if (!socket) return;
    
    console.log('⏭️ Control: Next step');
    
    const nextStep = state.currentStep + 1;
    const nextScript = state.script?.[nextStep];
    
    socket.emit('control:next', { campaignId });
    
    setState(prev => ({
      ...prev,
      status: 'idle',
      currentStep: nextStep,
      targetId: nextScript?.target_judge_id || undefined
    }));
  }, [socket, campaignId, state.currentStep, state.script]);

  const overrideTarget = useCallback((targetId: string) => {
    if (!socket) return;
    
    console.log('🎯 Control: Override target:', targetId);
    socket.emit('control:override', { campaignId, targetId });
    
    setState(prev => ({ ...prev, targetId }));
  }, [socket, campaignId]);

  const updateScript = useCallback((script: DirectorScript[]) => {
    if (!socket) return;
    
    console.log('📜 Control: Update script');
    socket.emit('control:update-script', { campaignId, script });
    
    setState(prev => ({ ...prev, script }));
  }, [socket, campaignId]);

  const startAutoSpin = useCallback((duration: number) => {
    if (!socket) return;
    
    console.log('⏰ Control: Start auto-spin with duration:', duration);
    socket.emit('control:auto-spin', { campaignId, duration });
  }, [socket, campaignId]);

  const stopAutoSpin = useCallback(() => {
    if (!socket) return;
    
    console.log('⏹️ Control: Stop auto-spin');
    socket.emit('control:stop-auto-spin', { campaignId });
  }, [socket, campaignId]);

  const setStep = useCallback((stepIndex: number) => {
    if (!socket) return;
    
    console.log('📍 Control: Set step:', stepIndex);
    socket.emit('control:set-step', { campaignId, stepIndex });
    setState(prev => ({ ...prev, currentStep: stepIndex }));
  }, [socket, campaignId]);

  return {
    connected,
    state,
    triggerSpin,
    triggerStop,
    triggerNext,
    overrideTarget,
    updateScript,
    startAutoSpin,
    stopAutoSpin,
    setStep
  };
};
