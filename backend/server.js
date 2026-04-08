const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] }
});

let messages = [];

io.on("connection", (socket) => {
  // FIX 1: Send existing messages immediately when someone joins
  // Without this, new users see a blank screen even if 10 messages exist
  socket.emit("all_messages", messages);

  socket.on("chat_message", (msg) => {
    msg.timestamp = Date.now();
    messages.push(msg);

    // IMPROVEMENT 1: Cap at 100 messages — prevents memory bloat
    // and keeps the React list rendering fast
    if (messages.length > 100) messages.shift();

    io.emit("all_messages", messages);
  });
});

// FIX 2: Only broadcast when something actually changed
// The original plan emitted every 5s regardless — causes UI flicker
// and wastes bandwidth
setInterval(() => {
  const now = Date.now();
  const before = messages.length;
  messages = messages.filter(msg => now - msg.timestamp < 120000);

  if (messages.length !== before) {
    io.emit("all_messages", messages);
  }
}, 5000);

server.listen(3001, () => console.log("Server running on port 3001"));