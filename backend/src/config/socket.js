const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // ── Auth middleware for socket connections ──────────────────────────────
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      // Allow unauthenticated connections (for public lead feed)
      socket.user = null;
      return next();
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      socket.user = null;
      next(); // still allow, but no user context
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} | user: ${socket.user?.id || 'guest'}`);

    // Designer joins their personal room + the designers broadcast room
    if (socket.user?.role === 'designer') {
      socket.join('designers');
      socket.join(`user:${socket.user.id}`);
    }

    if (socket.user?.role === 'admin') {
      socket.join('admins');
    }

    // Client joins their own room for status updates
    if (socket.user?.role === 'client') {
      socket.join(`user:${socket.user.id}`);
    }

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  console.log('🔌 Socket.io initialized');
  return io;
};

// ── Emit helpers (call from controllers) ────────────────────────────────────

/**
 * Broadcast a new verified lead to all connected designers
 */
const emitNewLead = (lead) => {
  if (!io) return;
  io.to('designers').emit('lead:new', {
    id: lead._id,
    service: lead.service,
    budget: lead.budget,
    location: lead.location,
    tags: lead.tags,
    intentScore: lead.intentScore,
    quality: lead.quality,
    cost: lead.creditCost,
    createdAt: lead.createdAt,
  });
};

/**
 * Notify all designers that a lead is now locked
 */
const emitLeadLocked = (leadId, lockExpiry) => {
  if (!io) return;
  io.to('designers').emit('lead:locked', { leadId, lockExpiry });
};

/**
 * Notify all designers that a lead has been unlocked
 */
const emitLeadUnlocked = (leadId) => {
  if (!io) return;
  io.to('designers').emit('lead:unlocked', { leadId });
};

/**
 * Notify all designers that a lead has been sold
 */
const emitLeadSold = (leadId) => {
  if (!io) return;
  io.to('designers').emit('lead:sold', { leadId });
};

/**
 * Send a targeted notification to a specific user
 */
const emitUserNotification = (userId, event, payload) => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
};

module.exports = {
  initSocket,
  emitNewLead,
  emitLeadLocked,
  emitLeadUnlocked,
  emitLeadSold,
  emitUserNotification,
  getIO: () => io,
};
