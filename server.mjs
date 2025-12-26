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

  // Socket.IO setup
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    },
    path: '/socket.io'
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
          script: []
        });
      }

      // Send current state to new joiner
      const currentState = campaignStates.get(campaignId);
      socket.emit('state:update', currentState);
    });

    // Control: Spin
    socket.on('control:spin', (data) => {
      const { campaignId, spinDuration, targetId, scriptInfo } = data;
      console.log('🎲 Control: Spin command received', { campaignId, spinDuration, targetId, scriptInfo });

      const state = campaignStates.get(campaignId);
      if (state) {
        state.status = 'spinning';
        state.spinDuration = spinDuration || 5;
        if (targetId) {
          state.targetId = targetId;
        }
        if (scriptInfo) {
          state.currentScriptInfo = scriptInfo;
        }

        campaignStates.set(campaignId, state);

        // Broadcast to all clients in room
        io.to(`campaign:${campaignId}`).emit('state:update', {
          status: 'spinning',
          targetId: state.targetId,
          spinDuration: state.spinDuration,
          scriptInfo: state.currentScriptInfo
        });
      }
    });

    // Control: Stop
    socket.on('control:stop', (data) => {
      const { campaignId, targetId } = data;
      console.log('🛑 Control: Stop command received', { campaignId, targetId });

      const state = campaignStates.get(campaignId);
      if (state) {
        state.status = 'stopped';
        
        // Use provided targetId or existing one
        const finalTargetId = targetId || state.targetId;

        // Add to history
        const historyItem = {
          step: state.currentStep + 1,
          result: finalTargetId || 'Unknown',
          resultId: finalTargetId,
          timestamp: Date.now(),
          contestant: state.currentScriptInfo?.contestant,
          question: state.currentScriptInfo?.question,
          color: '#667eea'
        };

        state.history = [historyItem, ...state.history];
        campaignStates.set(campaignId, state);

        // Broadcast stop with target
        io.to(`campaign:${campaignId}`).emit('state:update', {
          status: 'stopped',
          targetId: finalTargetId,
          scriptInfo: state.currentScriptInfo
        });

        // Broadcast history update
        io.to(`campaign:${campaignId}`).emit('history:add', historyItem);

        console.log('✅ History updated:', historyItem);
      }
    });

    // Control: Next
    socket.on('control:next', (data) => {
      const { campaignId } = data;
      console.log('⏭️ Control: Next command received', { campaignId });

      const state = campaignStates.get(campaignId);
      if (state) {
        state.status = 'idle';
        state.currentStep += 1;
        state.targetId = null;
        state.currentScriptInfo = null;

        // Get next script item if exists
        if (state.script && state.script[state.currentStep]) {
          state.targetId = state.script[state.currentStep].target_judge_id;
        }

        campaignStates.set(campaignId, state);

        io.to(`campaign:${campaignId}`).emit('state:update', {
          status: 'idle',
          currentStep: state.currentStep,
          targetId: state.targetId
        });
      }
    });

    // Control: Set step (jump to specific step)
    socket.on('control:set-step', (data) => {
      const { campaignId, stepIndex, token } = data;
      console.log('📍 Control: Set step', { campaignId, stepIndex });

      const state = campaignStates.get(campaignId);
      if (state) {
        state.status = 'idle';
        state.currentStep = Math.max(0, stepIndex);
        state.targetId = null;
        state.currentScriptInfo = null;

        if (state.script && state.script[state.currentStep]) {
          state.targetId = state.script[state.currentStep].target_judge_id;
        }

        campaignStates.set(campaignId, state);

        io.to(`campaign:${campaignId}`).emit('state:update', {
          status: 'idle',
          currentStep: state.currentStep,
          targetId: state.targetId
        });

        // 💾 Save currentStep to database
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
            .then(data => console.log('💾 CurrentStep saved to DB:', { campaignId, stepIndex }))
            .catch(err => console.error('❌ Failed to save currentStep:', err));
        }

        console.log('✅ Step updated to:', state.currentStep + 1);
      }
    });

    // Control: Override target
    socket.on('control:override', (data) => {
      const { campaignId, targetId } = data;
      console.log('🎯 Control: Override target', { campaignId, targetId });

      const state = campaignStates.get(campaignId);
      if (state) {
        state.targetId = targetId;
        campaignStates.set(campaignId, state);

        io.to(`campaign:${campaignId}`).emit('state:update', {
          targetId: targetId
        });
      }
    });

    // Control: Update script
    socket.on('control:update-script', (data) => {
      const { campaignId, script } = data;
      console.log('📜 Control: Update script', { campaignId, scriptLength: script.length, currentStep: campaignStates.get(campaignId)?.currentStep });

      const state = campaignStates.get(campaignId);
      if (state) {
        state.script = script;
        
        // Update targetId from current script step
        if (script[state.currentStep]) {
          state.targetId = script[state.currentStep].target_judge_id;
        }

        campaignStates.set(campaignId, state);

        // Prepare scriptInfo from current step
        const currentScript = script[state.currentStep];
        const scriptInfo = currentScript ? {
          step: currentScript.step,
          contestant: currentScript.contestant,
          question: currentScript.question_content
        } : null;

        io.to(`campaign:${campaignId}`).emit('state:update', {
          script: script,
          targetId: state.targetId,
          scriptInfo: scriptInfo
        });
      }
    });

    // Control: Auto-spin
    socket.on('control:auto-spin', (data) => {
      const { campaignId, duration } = data;
      console.log('⏰ Control: Auto-spin started', { campaignId, duration });

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
