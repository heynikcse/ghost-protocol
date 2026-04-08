const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

let messages = [];

io.on("connection", (socket) => {
  // 1. Update active users for everyone
  io.emit("active_users", io.engine.clientsCount);

  socket.emit("all_messages", messages);

  socket.on("chat_message", (msg) => {
    // Give each message a unique ID based on time
    const newMessage = { 
      ...msg, 
      id: Date.now() + Math.random(), 
      timestamp: Date.now(),
      reactions: [] 
    };
    messages.push(newMessage);
    if (messages.length > 100) messages.shift();
    io.emit("all_messages", messages);
  });

  // 2. Handle Synced Reactions
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

setInterval(() => {
  const now = Date.now();
  messages = messages.filter((msg) => now - msg.timestamp < 120000);
  io.emit("all_messages", messages);
}, 5000);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log("Server running"));