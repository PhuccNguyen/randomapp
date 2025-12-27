'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { getSocketUrl, socketOptions } from '@/lib/socket-client';

export default function TestSocketPage() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    console.log(message);
  };

  useEffect(() => {
    addLog('🔧 Starting socket connection test...');

    const socketUrl = getSocketUrl();
    addLog(`🔌 Connecting to: ${socketUrl}`);
    
    const newSocket = io(socketUrl, socketOptions);

    newSocket.on('connect', () => {
      addLog(`✅ Socket connected! ID: ${newSocket.id}`);
      setConnected(true);
      
      // Test join room
      newSocket.emit('join', 'test-campaign-123');
      addLog('📌 Sent join event for test-campaign-123');
    });

    newSocket.on('disconnect', (reason) => {
      addLog(`❌ Socket disconnected. Reason: ${reason}`);
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      addLog(`🔴 Connection error: ${error.message}`);
      setConnected(false);
    });

    newSocket.on('reconnect_attempt', (attempt) => {
      addLog(`🔄 Reconnection attempt #${attempt}`);
    });

    newSocket.on('reconnect', () => {
      addLog('✅ Reconnected!');
      setConnected(true);
    });

    newSocket.on('state:update', (data) => {
      addLog(`📡 Received state:update: ${JSON.stringify(data)}`);
    });

    setSocket(newSocket);

    return () => {
      addLog('🛑 Cleaning up socket connection');
      newSocket.disconnect();
    };
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>Socket.IO Connection Test</h1>
      
      <div style={{ 
        padding: '1rem', 
        marginBottom: '1rem',
        background: connected ? '#d4edda' : '#f8d7da',
        color: connected ? '#155724' : '#721c24',
        borderRadius: '4px'
      }}>
        Status: {connected ? '✅ CONNECTED' : '❌ DISCONNECTED'}
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <button 
          onClick={() => socket?.emit('trigger:spin', 'test-campaign-123')}
          disabled={!connected}
          style={{ padding: '0.5rem 1rem', marginRight: '0.5rem' }}
        >
          Test Spin
        </button>
        <button 
          onClick={() => socket?.emit('trigger:stop', 'test-campaign-123')}
          disabled={!connected}
          style={{ padding: '0.5rem 1rem' }}
        >
          Test Stop
        </button>
      </div>

      <h2>Logs:</h2>
      <div style={{ 
        background: '#000', 
        color: '#0f0', 
        padding: '1rem', 
        borderRadius: '4px',
        maxHeight: '400px',
        overflowY: 'auto',
        fontSize: '12px'
      }}>
        {logs.map((log, i) => (
          <div key={i}>{log}</div>
        ))}
      </div>
    </div>
  );
}
