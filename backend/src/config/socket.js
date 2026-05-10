const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    },
  });

  // Socket auth middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      socket.user = null;
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      return next();
    } catch (err) {
      socket.user = null;
      return next();
    }
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // Auto join user room from token
    if (socket.user?.id || socket.user?._id) {
      const userId = socket.user.id || socket.user._id;
      socket.join(`user:${userId}`);
      console.log(`User auto joined room: user:${userId}`);
    }

    // Manual user room join
    socket.on("join_user_room", (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`User joined room: user:${userId}`);
      }
    });

    // Designer room join
    socket.on("join_designers_room", () => {
      socket.join("designers");
      console.log(`Designer joined room: designers`);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });

  return io;
};

// Broadcast new verified lead to all designers
const emitNewLead = (lead) => {
  if (!io) return;

  io.to("designers").emit("lead:new", {
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

// Notify all designers that lead is locked
const emitLeadLocked = (leadId, lockExpiry) => {
  if (!io) return;

  io.to("designers").emit("lead:locked", {
    leadId,
    lockExpiry,
  });
};

// Notify all designers that lead is unlocked
const emitLeadUnlocked = (leadId) => {
  if (!io) return;

  io.to("designers").emit("lead:unlocked", {
    leadId,
  });
};

// Notify all designers that lead is sold
const emitLeadSold = (leadId) => {
  if (!io) return;

  io.to("designers").emit("lead:sold", {
    leadId,
  });
};

// Targeted user notification
const emitUserNotification = (userId, event, payload) => {
  if (!io || !userId) return;

  io.to(`user:${userId}`).emit(event, payload);
};

// Notification standard event
const emitNotification = (userId, notification) => {
  if (!io || !userId) return;

  io.to(`user:${userId}`).emit("new_notification", notification);
};

const getIO = () => io;

module.exports = {
  initSocket,
  getIO,
  emitNewLead,
  emitLeadLocked,
  emitLeadUnlocked,
  emitLeadSold,
  emitUserNotification,
  emitNotification,
};