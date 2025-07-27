require('dotenv').config();
const connectDB = require('./config/db');
const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');

// Connect to MongoDB
connectDB();

// Create HTTP server from Express app
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // your Vite frontend
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Handle WebSocket connections
io.on("connection", (socket) => {
  console.log("✅ WebSocket connected:", socket.id);

  // Authenticate socket connection using token
  const token = socket.handshake.auth.token;
  if (!token) {
    console.log("Socket connection rejected: no token");
    socket.disconnect(true);
    return;
  }

  // Here you should verify the token and extract userId
  const jwt = require('jsonwebtoken');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    socket.join(userId); // join room for this user
    console.log(`Socket ${socket.id} joined room ${userId}`);
  } catch (err) {
    console.log("Socket connection rejected: invalid token");
    socket.disconnect(true);
    return;
  }

  socket.on("disconnect", () => {
    console.log("❌ WebSocket disconnected:", socket.id);
  });

  // Example: receive and broadcast expense updates
  socket.on("new-expense", (data) => {
    console.log("📥 New expense via socket:", data);
    io.emit("expense-update", data); // broadcast to all
  });
});

// Attach io instance to app for use in controllers

app.set('io', io);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
