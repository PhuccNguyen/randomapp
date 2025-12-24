// components/ControlPanel/hooks/useSocket.ts
import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { ControlState } from '../types';

export const useSocket = (campaignId: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [state, setState] = useState<ControlState>({
    status: 'idle',
    currentStep: 0,
    history: []
  });

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    console.log('🔧 Control Panel: Initializing socket for campaign:', campaignId);
    
    // ✅ Connect to custom server with Socket.IO
    const socketInstance = io('http://localhost:3000', {
      path: '/socket.io', // ✅ Standard Socket.IO path
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socketInstance.on('connect', () => {
      console.log('✅ Control Panel: Socket connected:', socketInstance.id);
      setConnected(true);
      
      // Join campaign room
      console.log('📌 Control Panel: Joining room:', campaignId);
      socketInstance.emit('join', campaignId);
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('🔴 Socket connection error:', error);
      setConnected(false);
    });

    socketInstance.on('state:update', (newState: Partial<ControlState>) => {
      console.log('📡 State update received:', newState);
      setState(prev => ({
        ...prev,
        ...newState,
        history: newState.history || prev.history
      }));
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [campaignId]);

  const triggerSpin = useCallback(() => {
    if (!socketRef.current?.connected) {
      console.warn('⚠️ Control Panel: Socket not connected, cannot spin');
      return;
    }
    
    console.log('🔄 Control Panel: Triggering spin for campaign:', campaignId);
    socketRef.current.emit('trigger:spin', campaignId);
    console.log('✅ Control Panel: Spin event emitted');
  }, [campaignId]);

  const triggerStop = useCallback(() => {
    if (!socketRef.current?.connected) {
      console.warn('⚠️ Control Panel: Socket not connected, cannot stop');
      return;
    }
    
    console.log('⏹️ Control Panel: Triggering stop for campaign:', campaignId);
    socketRef.current.emit('trigger:stop', campaignId);
    console.log('✅ Control Panel: Stop event emitted');
  }, [campaignId]);

  const triggerNext = useCallback(() => {
    if (!socketRef.current?.connected) {
      console.warn('⚠️ Socket not connected');
      return;
    }
    
    console.log('⏭️ Triggering next for campaign:', campaignId);
    socketRef.current.emit('trigger:next', campaignId);
  }, [campaignId]);

  const overrideTarget = useCallback((targetId: string) => {
    if (!socketRef.current?.connected) {
      console.warn('⚠️ Socket not connected');
      return;
    }
    
    console.log('🎯 Overriding target for campaign:', campaignId, '-> Judge:', targetId);
    socketRef.current.emit('override:target', { campaignId, targetId });
  }, [campaignId]);

  return {
    connected,
    state,
    triggerSpin,
    triggerStop,
    triggerNext,
    overrideTarget
  };
};
