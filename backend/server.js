const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
 
const app = express();
app.use(cors());
 
const server = http.createServer(app);
 
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
 
let messages = [];
 
io.on("connection", (socket) => {
  // Broadcast updated active user count to everyone
  io.emit("active_users", io.engine.clientsCount);
 
  // Send full message history to newly joined user
  socket.emit("all_messages", messages);
 
  // New message
  socket.on("chat_message", (msg) => {
    const newMessage = {
      ...msg,
      id: Date.now() + Math.random(),
      timestamp: Date.now(),
      reactions: []
    };
    messages.push(newMessage);
 
    // Cap at 100 to prevent memory bloat
    if (messages.length > 100) messages.shift();
 
    io.emit("all_messages", messages);
  });
 
  // Synced reactions — all users see the same reaction counts
  socket.on("add_reaction", ({ msgId, emoji }) => {
    const msg = messages.find(m => m.id === msgId);
    if (msg) {
      msg.reactions.push(emoji);
      io.emit("all_messages", messages);
    }
  });
 
  socket.on("disconnect", () => {
    io.emit("active_users", io.engine.clientsCount);
  });
});
 
// Ghost cleanup: remove messages older than 120s
// Only emit if something was actually deleted (avoids unnecessary re-renders)
setInterval(() => {
  const now = Date.now();
  const before = messages.length;
  messages = messages.filter(msg => now - msg.timestamp < 120000);
  if (messages.length !== before) {
    io.emit("all_messages", messages);
  }
}, 5000);
 
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Ghost Protocol server running on port ${PORT}`);
});