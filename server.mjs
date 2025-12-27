// C:\Users\Nguyen Phuc\Web\tingrandom\server.mjs
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request:', err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  });

  // Socket.IO setup with production-ready CORS
  const io = new Server(server, {
    cors: {
      origin: [
        'http://localhost:3000',
        'https://random.tingnect.com',
        'http://random.tingnect.com',
        /^https?:\/\/.*\.tingnect\.com$/  // Allow all tingnect.com subdomains
      ],
      methods: ['GET', 'POST'],
      credentials: true
    },
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
    upgradeTimeout: 10000,
    maxHttpBufferSize: 1e6,
    allowEIO3: true
  });

  // Store campaign states
  const campaignStates = new Map();

  io.on('connection', (socket) => {
    console.log('✅ Socket connected:', socket.id);

    // Join campaign room
    socket.on('join', (campaignId) => {
      socket.join(`campaign:${campaignId}`);
      console.log(`📌 Socket ${socket.id} joined room: campaign:${campaignId}`);

      // Initialize campaign state if not exists
      if (!campaignStates.has(campaignId)) {
        campaignStates.set(campaignId, {
          status: 'idle',
          currentStep: 0,
          targetId: null,
          history: [],
          spinDuration: 5,
          script: [],
          currentScriptInfo: null
        });
      }

      // Send current state to new joiner
      const currentState = campaignStates.get(campaignId);
      socket.emit('state:update', currentState);
    });

    // Control: Spin
    socket.on('control:spin', (data) => {
      const { campaignId, spinDuration, targetId, scriptInfo } = data;
      console.log('🎲 Server: Spin command', { 
        campaignId, 
        spinDuration, 
        targetId, 
        scriptInfo 
      });

      const state = campaignStates.get(campaignId);
      if (state) {
        state.status = 'spinning';
        state.spinDuration = spinDuration || 5;
        
        if (targetId) {
          state.targetId = targetId;
        }
        
        if (scriptInfo) {
          state.currentScriptInfo = {
            step: scriptInfo.step,
            contestant: scriptInfo.contestant,
            question: scriptInfo.question
          };
          console.log('📋 Server: Saved scriptInfo:', state.currentScriptInfo);
        }

        campaignStates.set(campaignId, state);

        // ✅ Broadcast với đầy đủ thông tin
        io.to(`campaign:${campaignId}`).emit('state:update', {
          status: 'spinning',
          targetId: state.targetId,
          spinDuration: state.spinDuration,
          scriptInfo: state.currentScriptInfo
        });
        
        console.log('✅ Server: Broadcasted spinning state with scriptInfo');
      }
    });

    // Control: Stop
    socket.on('control:stop', (data) => {
      const { campaignId, targetId } = data;
      console.log('🛑 Server: Stop command', { campaignId, targetId });

      const state = campaignStates.get(campaignId);
      if (state) {
        state.status = 'stopped';
        
        // Use provided targetId or existing one
        const finalTargetId = targetId || state.targetId;
        
        console.log('🛑 Server: Final targetId:', finalTargetId);
        console.log('🛑 Server: Current scriptInfo:', state.currentScriptInfo);

        // Add to history
        const historyItem = {
          step: state.currentStep + 1,
          result: finalTargetId || 'Unknown',
          resultId: finalTargetId,
          timestamp: Date.now(),
          contestant: state.currentScriptInfo?.contestant || null,
          question: state.currentScriptInfo?.question || null,
          color: '#667eea'
        };

        state.history = [historyItem, ...state.history];
        campaignStates.set(campaignId, state);

        // ✅ Broadcast STOPPED với scriptInfo
        io.to(`campaign:${campaignId}`).emit('state:update', {
          status: 'stopped',
          targetId: finalTargetId,
          contestant: state.currentScriptInfo?.contestant,
          question: state.currentScriptInfo?.question,
          scriptInfo: state.currentScriptInfo
        });

        // Broadcast history update
        io.to(`campaign:${campaignId}`).emit('history:add', historyItem);

        console.log('✅ Server: Broadcasted stopped state:', {
          targetId: finalTargetId,
          contestant: state.currentScriptInfo?.contestant,
          question: state.currentScriptInfo?.question
        });
      }
    });

    // Control: Next
    socket.on('control:next', (data) => {
      const { campaignId } = data;
      console.log('⏭️ Server: Next command', { campaignId });

      const state = campaignStates.get(campaignId);
      if (state) {
        state.status = 'idle';
        state.currentStep += 1;
        state.targetId = null;
        state.currentScriptInfo = null;

        // Get next script item if exists
        if (state.script && state.script[state.currentStep]) {
          const nextScript = state.script[state.currentStep];
          state.targetId = nextScript.target_judge_id;
          state.currentScriptInfo = {
            step: nextScript.step,
            contestant: nextScript.contestant,
            question: nextScript.question_content
          };
          console.log('⏭️ Server: Next script loaded:', state.currentScriptInfo);
        }

        campaignStates.set(campaignId, state);

        io.to(`campaign:${campaignId}`).emit('state:update', {
          status: 'idle',
          currentStep: state.currentStep,
          targetId: state.targetId,
          scriptInfo: state.currentScriptInfo
        });
        
        console.log('✅ Server: Broadcasted next state');
      }
    });

    // Control: Set step
    socket.on('control:set-step', (data) => {
      const { campaignId, stepIndex, token } = data;
      console.log('📍 Server: Set step', { campaignId, stepIndex });

      const state = campaignStates.get(campaignId);
      if (state) {
        state.status = 'idle';
        state.currentStep = Math.max(0, stepIndex);
        state.targetId = null;
        state.currentScriptInfo = null;

        if (state.script && state.script[state.currentStep]) {
          const currentScript = state.script[state.currentStep];
          state.targetId = currentScript.target_judge_id;
          state.currentScriptInfo = {
            step: currentScript.step,
            contestant: currentScript.contestant,
            question: currentScript.question_content
          };
        }

        campaignStates.set(campaignId, state);

        io.to(`campaign:${campaignId}`).emit('state:update', {
          status: 'idle',
          currentStep: state.currentStep,
          targetId: state.targetId,
          scriptInfo: state.currentScriptInfo
        });

        // Save to database if token provided
        if (token) {
          fetch(`http://localhost:3000/api/campaigns/${campaignId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ currentStep: state.currentStep })
          })
            .then(res => res.json())
            .then(data => console.log('💾 Server: CurrentStep saved to DB'))
            .catch(err => console.error('❌ Server: Failed to save currentStep:', err));
        }

        console.log('✅ Server: Step updated to:', state.currentStep + 1);
      }
    });

    // Control: Override target
    socket.on('control:override', (data) => {
      const { campaignId, targetId } = data;
      console.log('🎯 Server: Override target', { campaignId, targetId });

      const state = campaignStates.get(campaignId);
      if (state) {
        state.targetId = targetId;
        campaignStates.set(campaignId, state);

        io.to(`campaign:${campaignId}`).emit('state:update', {
          targetId: targetId
        });
        
        console.log('✅ Server: Override target broadcasted');
      }
    });

    // Control: Update script
    socket.on('control:update-script', (data) => {
      const { campaignId, script } = data;
      console.log('📜 Server: Update script', { 
        campaignId, 
        scriptLength: script.length 
      });

      const state = campaignStates.get(campaignId);
      if (state) {
        state.script = script;
        
        // Update targetId and scriptInfo from current script step
        if (script[state.currentStep]) {
          const currentScript = script[state.currentStep];
          state.targetId = currentScript.target_judge_id;
          state.currentScriptInfo = {
            step: currentScript.step,
            contestant: currentScript.contestant,
            question: currentScript.question_content
          };
          console.log('📜 Server: Updated scriptInfo:', state.currentScriptInfo);
        }

        campaignStates.set(campaignId, state);

        io.to(`campaign:${campaignId}`).emit('state:update', {
          script: script,
          targetId: state.targetId,
          scriptInfo: state.currentScriptInfo
        });
        
        console.log('✅ Server: Script update broadcasted');
      }
    });

    // Control: Auto-spin
    socket.on('control:auto-spin', (data) => {
      const { campaignId, duration } = data;
      console.log('⏰ Server: Auto-spin started', { campaignId, duration });

      // Trigger spin
      socket.emit('control:spin', { campaignId, spinDuration: duration });

      // Auto-stop after duration
      setTimeout(() => {
        socket.emit('control:stop', { campaignId });
      }, duration * 1000);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected:', socket.id);
    });
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`✅ Server running on http://${hostname}:${port}`);
    console.log(`🔌 Socket.IO enabled`);
  });
});
