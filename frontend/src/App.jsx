import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

// 🔗 Connect to backend (IMPORTANT: replace with your deployed URL)
const socket = io("https://ghost-protocol-tpwp.onrender.com");

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [username] = useState("Ghost_" + Math.floor(Math.random() * 1000));
  const [reactions, setReactions] = useState({});
  const [activeUsers, setActiveUsers] = useState(0);

  const bottomRef = useRef();

  // 📡 Socket listeners
  useEffect(() => {
    socket.on("all_messages", (msgs) => setMessages(msgs));
    socket.on("active_users", (count) => setActiveUsers(count));

    return () => {
      socket.off("all_messages");
      socket.off("active_users");
    };
  }, []);

  // ⏬ Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ⏳ Re-render for timer
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // ✉️ Send message
  const sendMessage = () => {
    if (!input.trim()) return;
    socket.emit("chat_message", { user: username, text: input });
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  // ⏱ Timer
  const getSecondsLeft = (timestamp) => {
    return Math.max(0, Math.floor(120 - (Date.now() - timestamp) / 1000));
  };

  // ❤️ Add reaction
  const addReaction = (index, emoji) => {
    setReactions(prev => {
      const current = prev[index] || [];
      return {
        ...prev,
        [index]: [...current, emoji]
      };
    });
  };

  return (
    <div className="h-screen flex flex-col text-white">

      {/* 🔥 HEADER */}
      <div className="flex justify-between items-center p-4 border-b border-gray-800">

        <h1 className="neon-title text-2xl font-bold">
          👻 GHOST PROTOCOL
        </h1>

        <div className="flex items-center gap-2 text-sm">
          <div className="pulse-dot"></div>
          <span className="text-green-400 font-semibold">
            {activeUsers} ONLINE
          </span>
        </div>

      </div>

      {/* 👻 EMPTY STATE */}
      {messages.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="text-6xl animate-bounce">👻</div>
          <h2 className="neon-title text-3xl">ENTER THE VOID</h2>
        </div>
      )}

      {/* 💬 MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {messages.map((msg, i) => {
          const isMe = msg.user === username;
          const secondsLeft = getSecondsLeft(msg.timestamp);

          return (
            <div key={i}>

              {/* Message */}
              <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div
                  className={`px-4 py-3 rounded-xl max-w-[70%] text-sm
                  ${isMe ? "neon-msg-me" : "neon-msg-other"}`}
                >
                  <div>{msg.text}</div>

                  <div className="text-xs mt-1 text-gray-400">
                    ⏱ {secondsLeft}s
                  </div>
                </div>
              </div>

              {/* ❤️ Reactions */}
              <div className={`flex ${isMe ? "justify-end" : "justify-start"} gap-2 mt-1`}>
                {(reactions[i] || []).map((r, idx) => (
                  <span key={idx}>{r}</span>
                ))}
              </div>

              {/* 🔥 Reaction Buttons */}
              <div className={`flex ${isMe ? "justify-end" : "justify-start"} gap-2 mt-1`}>
                {["❤️","🔥","😂","👻","⚡"].map((emoji, idx) => (
                  <button
                    key={idx}
                    onClick={() => addReaction(i, emoji)}
                    className="hover:scale-125 transition"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

            </div>
          );
        })}

        <div ref={bottomRef}></div>
      </div>

      {/* ✍️ INPUT */}
      <div className="p-4 flex gap-2 border-t border-gray-800">

        <input
          className="flex-1 px-4 py-2 rounded-full neon-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message into the void..."
        />

        <button
          onClick={sendMessage}
          className="neon-btn px-5 rounded-full font-bold"
        >
          Send
        </button>

      </div>

    </div>
  );
}
