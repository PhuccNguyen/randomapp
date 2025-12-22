import { Server as NetServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { NextApiResponse } from 'next';

// --- 1. TYPE DEFINITIONS ---

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io?: SocketIOServer;
    };
  };
};

// Interface lưu trạng thái phiên làm việc của từng Campaign
interface CampaignSession {
  currentStep: number;
  status: 'idle' | 'spinning' | 'stopped';
  lastTargetId?: string;
}

// --- 2. SINGLETON STATE MANAGEMENT ---

let io: SocketIOServer | undefined;

// Lưu trữ trạng thái tạm thời trong RAM (Deep Tech: Sau này scale lên sẽ dùng Redis)
const sessions = new Map<string, CampaignSession>();

// --- 3. SOCKET INITIALIZATION ---

export const initSocket = (server: NetServer): SocketIOServer => {
  if (io) {
    console.log('⚡ Socket.io already running');
    return io;
  }

  console.log('🔌 Initializing Socket.io Server...');
  io = new SocketIOServer(server, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: '*', // Allow all origins (Development) - Production nên set cụ thể domain
      methods: ['GET', 'POST']
    },
    // Performance Tuning
    pingTimeout: 60000,
    transports: ['websocket', 'polling']
  });

  io.on('connection', (socket: Socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // --- A. ROOM MANAGEMENT ---
    socket.on('join', (campaignId: string) => {
      if (!campaignId) return;
      
      socket.join(`campaign:${campaignId}`);
      console.log(`📌 Socket ${socket.id} joined room: campaign:${campaignId}`);

      // Gửi ngay trạng thái hiện tại cho người mới vào (Sync State)
      const session = sessions.get(campaignId) || { currentStep: 1, status: 'idle' };
      socket.emit('state:sync', session);
    });

    // --- B. EVENT HANDLERS (CONTROL ACTIONS) ---

    // 1. TRIGGER SPIN
    socket.on('trigger:spin', ({ campaignId }: { campaignId: string }) => {
      console.log(`🔄 SPIN triggered for: ${campaignId}`);
      
      // Update Session
      const session = sessions.get(campaignId) || { currentStep: 1, status: 'idle' };
      session.status = 'spinning';
      sessions.set(campaignId, session);

      // Broadcast to Room
      io?.to(`campaign:${campaignId}`).emit('state:update', {
        status: 'spinning',
        currentStep: session.currentStep
      });
    });

    // 2. TRIGGER STOP
    socket.on('trigger:stop', ({ campaignId, targetId }: { campaignId: string, targetId: string }) => {
      console.log(`⏹️ STOP triggered for: ${campaignId} -> Target: ${targetId}`);
      
      // Update Session
      const session = sessions.get(campaignId) || { currentStep: 1, status: 'idle' };
      session.status = 'stopped';
      session.lastTargetId = targetId;
      sessions.set(campaignId, session);

      // Broadcast Target & Stop Command
      io?.to(`campaign:${campaignId}`).emit('trigger:stop', { targetId });
      io?.to(`campaign:${campaignId}`).emit('state:update', {
        status: 'stopped',
        currentStep: session.currentStep,
        lastTargetId: targetId
      });
    });

    // 3. TRIGGER NEXT STEP (Director Mode)
    socket.on('trigger:next', ({ campaignId }: { campaignId: string }) => {
      const session = sessions.get(campaignId) || { currentStep: 0, status: 'idle' };
      session.currentStep += 1;
      session.status = 'idle';
      sessions.set(campaignId, session);

      console.log(`⏭️ NEXT Step for ${campaignId}: ${session.currentStep}`);

      io?.to(`campaign:${campaignId}`).emit('state:update', {
        status: 'idle',
        currentStep: session.currentStep
      });
    });

    // 4. TRIGGER RESET
    socket.on('trigger:reset', ({ campaignId }: { campaignId: string }) => {
      console.log(`Start RESET for: ${campaignId}`);
      
      const newSession: CampaignSession = { currentStep: 1, status: 'idle' };
      sessions.set(campaignId, newSession);

      io?.to(`campaign:${campaignId}`).emit('state:update', newSession);
    });

    // 5. OVERRIDE TARGET (Cheat/Admin Force)
    socket.on('override:target', ({ campaignId, targetId }: { campaignId: string, targetId: string }) => {
      console.log(`🎯 Override Target for ${campaignId}: ${targetId}`);
      io?.to(`campaign:${campaignId}`).emit('override:target', { targetId });
    });

    // --- C. DISCONNECT ---
    socket.on('disconnect', () => {
      // console.log('❌ Client disconnected:', socket.id);
    });
  });

  return io;
};

export const getIO = (): SocketIOServer | undefined => io;