const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['https://peer-room-lite.vercel.app', 'http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST']
  }
});

const rooms = {};
const usernames = {}; // ✅ socket.id → username

io.on("connection", (socket) => {
  console.log("🔌 New client connected:", socket.id);

  socket.on("join-room", ({ roomId, username }) => {
    usernames[socket.id] = username; // ✅ Store username

    const isInitiator = !rooms[roomId];
    socket.join(roomId);

    if (!rooms[roomId]) {
      rooms[roomId] = [];
    }
    rooms[roomId].push(socket.id);

    console.log(`✅ ${username} (${socket.id}) joined room ${roomId} | Initiator: ${isInitiator}`);
    
    socket.emit("joined-room", { isInitiator });

    // ✅ Emit username from stored map
    socket.to(roomId).emit("user-joined", {
      id: socket.id,
      username: usernames[socket.id] || "Anonymous", // 🔥 FIXED LINE
    });
  });

  socket.on("signal", ({ roomId, signalData }) => {
    console.log(`🔁 Signal from ${socket.id} to room ${roomId}`);
    socket.to(roomId).emit("signal", { signalData });
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);

    const username = usernames[socket.id];
    delete usernames[socket.id];

    for (const roomId in rooms) {
      if (rooms[roomId].includes(socket.id)) {
        socket.to(roomId).emit("user-left", {
          id: socket.id,
          username: username || "Anonymous" // ✅ Optional fallback
        });
      }

      rooms[roomId] = rooms[roomId].filter(id => id !== socket.id);
      if (rooms[roomId].length === 0) {
        delete rooms[roomId];
        console.log(`🧹 Deleted empty room: ${roomId}`);
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Signaling server running on port ${PORT}`);
});


