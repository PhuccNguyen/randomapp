// server.mjs
import { createServer } from 'node:http';
import next from 'next';
import { Server } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      await handler(req, res);
    } catch (err) {
      console.error('Error handling request:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  // ✅ Socket.IO configuration
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling'],
    path: '/socket.io'
  });

  console.log('🚀 Socket.IO server configured on path: /socket.io');

  // ✅ Socket.IO event handlers
  io.on('connection', (socket) => {
    console.log('✅ Client connected:', socket.id);

    socket.on('join', (campaignId) => {
      const room = `campaign:${campaignId}`;
      socket.join(room);
      console.log(`📌 Socket ${socket.id} joined ${room}`);
      
      // Send initial state
      socket.emit('state:update', {
        status: 'idle',
        currentStep: 0,
        history: []
      });
    });

    socket.on('trigger:spin', (campaignId) => {
      const room = `campaign:${campaignId}`;
      console.log(`🔄 Spin triggered for ${room}`);
      console.log(`📊 Clients in room:`, io.sockets.adapter.rooms.get(room)?.size || 0);
      
      // Emit to all clients in the room including sender
      io.to(room).emit('state:update', {
        status: 'spinning',
        currentStep: 1
      });
      console.log(`✅ Emitted state:update to ${room}`);
    });

    socket.on('trigger:stop', (campaignId) => {
      const room = `campaign:${campaignId}`;
      console.log(`⏹️ Stop triggered for ${room}`);
      console.log(`📊 Clients in room:`, io.sockets.adapter.rooms.get(room)?.size || 0);
      
      // Emit to all clients in the room including sender
      io.to(room).emit('state:update', {
        status: 'stopped'
      });
      console.log(`✅ Emitted state:update to ${room}`);
    });

    socket.on('trigger:next', (campaignId) => {
      const room = `campaign:${campaignId}`;
      console.log(`⏭️ Next triggered for ${room}`);
      
      io.to(room).emit('state:update', {
        status: 'idle'
      });
    });

    socket.on('override:target', ({ campaignId, targetId }) => {
      const room = `campaign:${campaignId}`;
      console.log(`🎯 Override target for ${room} -> ${targetId}`);
      
      // Emit to all clients in the room with targetId
      io.to(room).emit('state:update', {
        targetId,
        status: 'spinning' // Keep spinning status when override
      });
    });

    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id);
    });
  });

  httpServer
    .once('error', (err) => {
      console.error('Server error:', err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log('> Socket.IO server running');
    });
});
