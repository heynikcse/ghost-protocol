const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

//  FIX: Allow all origins (important for deployed frontend)
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let messages = [];

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Send existing messages
  socket.emit("all_messages", messages);

  socket.on("chat_message", (msg) => {
    msg.timestamp = Date.now();
    messages.push(msg);

    // Limit messages (performance)
    if (messages.length > 100) messages.shift();

    io.emit("all_messages", messages);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Auto-delete old messages
setInterval(() => {
  const now = Date.now();
  const before = messages.length;

  messages = messages.filter(
    (msg) => now - msg.timestamp < 120000
  );

  if (messages.length !== before) {
    io.emit("all_messages", messages);
  }
}, 5000);

//  VERY IMPORTANT: Use dynamic port for deployment
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});