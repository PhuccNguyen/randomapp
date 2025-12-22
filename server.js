const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

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
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });
  
  // Socket.io setup
  const io = new Server(server, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });
  
  const sessions = new Map();
  
  io.on('connection', (socket) => {
    console.log('✅ Client connected:', socket.id);
    
    socket.on('trigger:spin', ({ campaignId }) => {
      console.log('🎯 SPIN:', campaignId);
      io.emit('state:update', {
        status: 'spinning',
        currentStep: sessions.get(campaignId)?.currentStep || 1,
      });
    });
    
    socket.on('trigger:stop', ({ campaignId, targetId }) => {
      console.log('🛑 STOP:', targetId);
      io.emit('trigger:stop', { targetId });
      setTimeout(() => {
        io.emit('state:update', {
          status: 'stopped',
          currentStep: sessions.get(campaignId)?.currentStep || 1,
        });
      }, 100);
    });
    
    socket.on('trigger:next', ({ campaignId }) => {
      const session = sessions.get(campaignId) || { currentStep: 1 };
      session.currentStep += 1;
      sessions.set(campaignId, session);
      io.emit('state:update', {
        status: 'idle',
        currentStep: session.currentStep,
      });
    });
    
    socket.on('trigger:reset', ({ campaignId }) => {
      sessions.set(campaignId, { currentStep: 1 });
      io.emit('state:update', {
        status: 'idle',
        currentStep: 1,
      });
    });
    
    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id);
    });
  });
  
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`🚀 Ready on http://${hostname}:${port}`);
  });
});
