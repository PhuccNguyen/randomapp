// lib/socket-client.ts - Socket.IO Client Configuration
'use client';

/**
 * Get the correct Socket.IO server URL based on environment
 * - Production: Use window.location.origin
 * - Development: Use localhost:3000
 */
export function getSocketUrl(): string {
  // If browser environment
  if (typeof window !== 'undefined') {
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
    
    if (isLocalhost) {
      return 'http://localhost:3000';
    }
    
    // Production: Use current domain with protocol
    const protocol = window.location.protocol; // http: or https:
    const host = window.location.host; // includes port if any
    return `${protocol}//${host}`;
  }
  
  // Fallback for SSR (should not happen as this is client-only)
  return 'http://localhost:3000';
}

/**
 * Standard Socket.IO client options
 */
export const socketOptions = {
  path: '/socket.io',
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 10,
  timeout: 10000,
  autoConnect: true
};
