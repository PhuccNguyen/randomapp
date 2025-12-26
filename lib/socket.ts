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
  scriptInfo?: {
    step?: number;
    contestant?: string;
    question?: string;
  };
  history: Array<{
    step: number;
    result: string;
    timestamp: Date;
  }>;
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
    path: '/socket.io',  // ✅ Đổi thành /socket.io để khớp với client
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
      const session = sessions.get(campaignId) || { 
        currentStep: 1, 
        status: 'idle',
        history: []
      };
      socket.emit('state:sync', session);
    });

    // --- B. EVENT HANDLERS (CONTROL ACTIONS) ---

    // 1. TRIGGER SPIN
    socket.on('trigger:spin', ({ campaignId }: { campaignId: string }) => {
      console.log(`🔄 SPIN triggered for: ${campaignId}`);
      
      // Update Session
      const session = sessions.get(campaignId) || { 
        currentStep: 1, 
        status: 'idle',
        history: []
      };
      session.status = 'spinning';
      sessions.set(campaignId, session);

      // Broadcast to Room
      io?.to(`campaign:${campaignId}`).emit('state:update', {
        status: 'spinning',
        currentStep: session.currentStep,
        history: session.history
      });
    });

    // 2. TRIGGER STOP
    socket.on('trigger:stop', ({ campaignId, result }: { campaignId: string, result?: string }) => {
      console.log(`⏹️ STOP triggered for: ${campaignId}`);
      
      // Update Session
      const session = sessions.get(campaignId) || { 
        currentStep: 1, 
        status: 'idle',
        history: []
      };
      session.status = 'stopped';
      
      // Lưu vào history nếu có kết quả
      if (result || session.lastTargetId) {
        const historyItem = {
          step: session.currentStep,
          result: result || session.lastTargetId || 'Unknown',
          timestamp: new Date()
        };
        session.history.push(historyItem);
      }
      
      sessions.set(campaignId, session);

      // Broadcast Stop Command with targetId if exists
      io?.to(`campaign:${campaignId}`).emit('state:update', {
        status: 'stopped',
        currentStep: session.currentStep,
        targetId: session.lastTargetId,
        history: session.history
      });
    });

    // 3. TRIGGER NEXT STEP (Director Mode)
    socket.on('trigger:next', ({ campaignId }: { campaignId: string }) => {
      const session = sessions.get(campaignId) || { 
        currentStep: 0, 
        status: 'idle',
        history: []
      };
      session.currentStep += 1;
      session.status = 'idle';
      session.lastTargetId = undefined; // Reset target cho lượt mới
      sessions.set(campaignId, session);

      console.log(`⏭️ NEXT Step for ${campaignId}: ${session.currentStep}`);

      io?.to(`campaign:${campaignId}`).emit('state:update', {
        status: 'idle',
        currentStep: session.currentStep,
        history: session.history
      });
    });

    // 4. TRIGGER RESET
    socket.on('trigger:reset', ({ campaignId }: { campaignId: string }) => {
      console.log(`Start RESET for: ${campaignId}`);
      
      const newSession: CampaignSession = { 
        currentStep: 1, 
        status: 'idle',
        history: []
      };
      sessions.set(campaignId, newSession);

      io?.to(`campaign:${campaignId}`).emit('state:update', newSession);
    });

    // 5. OVERRIDE TARGET (Cheat/Admin Force)
    socket.on('override:target', ({ campaignId, targetId }: { campaignId: string, targetId: string }) => {
      console.log(`🎯 Override Target for ${campaignId}: ${targetId}`);
      
      // Lưu vào session nhưng không broadcast ra display
      const session = sessions.get(campaignId) || { 
        currentStep: 1, 
        status: 'idle',
        history: []
      };
      session.lastTargetId = targetId;
      sessions.set(campaignId, session);
      
      // Chỉ gửi confirm lại cho control panel
      socket.emit('override:confirmed', { targetId });
    });
    
    // 6. REPORT RESULT (Display gửi kết quả về khi wheel dừng)
    socket.on('report:result', ({ campaignId, result, targetId }: { campaignId: string, result: string, targetId: string }) => {
      console.log(`📊 Result reported for ${campaignId}: ${result}`);
      
      const session = sessions.get(campaignId) || { 
        currentStep: 1, 
        status: 'idle',
        history: []
      };
      
      // Lưu vào history
      const historyItem = {
        step: session.currentStep,
        result: result,
        timestamp: new Date()
      };
      session.history.push(historyItem);
      session.lastTargetId = targetId;
      sessions.set(campaignId, session);
      
      // Broadcast updated history to all clients
      io?.to(`campaign:${campaignId}`).emit('state:update', {
        status: session.status,
        currentStep: session.currentStep,
        history: session.history
      });
    });

    // --- NEW CONTROL PANEL EVENTS ---
    
    // 7. CONTROL:SPIN (Control Panel triggers spin)
    socket.on('control:spin', (data: any) => {
      const { campaignId, spinDuration, targetId, scriptInfo } = data;
      console.log(`🎮 Control:Spin for ${campaignId}`, { spinDuration, targetId, scriptInfo });
      
      const session = sessions.get(campaignId) || { 
        currentStep: 1, 
        status: 'idle',
        history: []
      };
      session.status = 'spinning';
      if (targetId) {
        session.lastTargetId = targetId;
      }
      if (scriptInfo) {
        session.scriptInfo = scriptInfo; // Lưu script info
      }
      sessions.set(campaignId, session);

      // Broadcast to display
      io?.to(`campaign:${campaignId}`).emit('state:update', {
        status: 'spinning',
        currentStep: session.currentStep,
        spinDuration: spinDuration || 5,
        scriptInfo
      });
    });

    // 8. CONTROL:STOP (Control Panel triggers stop)
    socket.on('control:stop', (data: any) => {
      const { campaignId, targetId, items, script, currentStep } = data;
      console.log(`🎮 Control:Stop for ${campaignId}`, { targetId, itemsCount: items?.length });
      console.log(`🎮 Items from Control Panel:`, items?.map((i: any, idx: number) => ({ idx, id: i.id, name: i.name })));
      
      const session = sessions.get(campaignId) || { 
        currentStep: 1, 
        status: 'idle',
        history: []
      };
      session.status = 'stopped';
      
      // ✅ CRITICAL FIX: Server random nếu targetId rỗng (chọn "Ngẫu nhiên")
      // LUÔN RANDOM mỗi lần để mỗi vòng quay có kết quả khác nhau
      let finalTargetId = targetId;
      
      // Nếu targetId rỗng hoặc undefined (chọn "🎲 Ngẫu nhiên"), server LUÔN random
      if (!targetId && items && items.length > 0) {
        const randomIndex = Math.floor(Math.random() * items.length);
        finalTargetId = items[randomIndex].id;
        console.log(`🎯 Server RANDOM target (empty override): index=${randomIndex}, id=${finalTargetId}, name=${items[randomIndex].name}`);
        console.log(`🎯 Server randomly picked item at index ${randomIndex}:`, items[randomIndex]);
      } else if (targetId) {
        // Nếu có targetId cụ thể (chọn 1 Judge), dùng nó
        console.log(`🎯 Server using OVERRIDE target: id=${targetId}`);
        const foundItem = items?.find((i: any) => i.id === targetId);
        console.log(`🎯 Found override item:`, foundItem);
      } else {
        // Fallback: không có items, random index
        console.warn('⚠️ No items provided for random selection');
        finalTargetId = null;
      }
      
      session.lastTargetId = finalTargetId;
      
      // ✅ NEW: Tìm contestant & question từ script nếu có
      let contestant: string | undefined;
      let question: string | undefined;
      if (script && script.length > 0 && currentStep !== undefined) {
        // ⚠️ IMPORTANT: currentStep từ Control Panel là từ 1 (step 1, 2, 3...)
        // nhưng array index từ 0, nên phải trừ 1
        const scriptIndex = currentStep - 1;
        if (scriptIndex >= 0 && scriptIndex < script.length) {
          const scriptStep = script[scriptIndex];
          if (scriptStep) {
            contestant = scriptStep.contestant;
            question = scriptStep.question_content;
            console.log(`📜 Found script info for step ${currentStep} (index ${scriptIndex}):`, { contestant, question });
          }
        } else {
          console.warn(`⚠️ Script index ${scriptIndex} out of bounds (script.length: ${script.length})`);
        }
      }
      
      session.scriptInfo = {
        step: currentStep,
        contestant,
        question
      };
      
      sessions.set(campaignId, session);

      console.log(`📤 Server broadcasting to campaign ${campaignId}:`, {
        status: 'stopped',
        targetId: finalTargetId,
        contestant,
        question
      });

      // Broadcast to display with SAME targetId to all guests
      io?.to(`campaign:${campaignId}`).emit('state:update', {
        status: 'stopped',
        currentStep: session.currentStep,
        targetId: finalTargetId, // ✅ Tất cả guests nhận CÙNG targetId
        scriptInfo: session.scriptInfo, // ✅ Gửi thông tin script
        contestant, // ✅ Thí sinh
        question    // ✅ Câu hỏi
      });
    });

    // 9. CONTROL:NEXT (Control Panel triggers next step)
    socket.on('control:next', (data: any) => {
      const { campaignId } = data;
      console.log(`🎮 Control:Next for ${campaignId}`);
      
      const session = sessions.get(campaignId) || { 
        currentStep: 0, 
        status: 'idle',
        history: []
      };
      session.currentStep += 1;
      session.status = 'idle';
      session.lastTargetId = undefined;
      sessions.set(campaignId, session);

      // Broadcast to display
      io?.to(`campaign:${campaignId}`).emit('state:update', {
        status: 'idle',
        currentStep: session.currentStep,
        targetId: null
      });
    });

    // 10. CONTROL:OVERRIDE (Control Panel sets target)
    socket.on('control:override', (data: any) => {
      const { campaignId, targetId } = data;
      console.log(`🎮 Control:Override for ${campaignId}`, { targetId });
      
      const session = sessions.get(campaignId) || { 
        currentStep: 1, 
        status: 'idle',
        history: []
      };
      session.lastTargetId = targetId;
      sessions.set(campaignId, session);

      // Confirm to control panel only
      socket.emit('override:confirmed', { targetId });
    });

    // --- C. DISCONNECT ---
    socket.on('disconnect', () => {
      // console.log('❌ Client disconnected:', socket.id);
    });
  });

  return io;
};

export const getIO = (): SocketIOServer | undefined => io;