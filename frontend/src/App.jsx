import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [username] = useState("Ghost_" + Math.floor(Math.random() * 1000));
  const [reactions, setReactions] = useState({});

  const bottomRef = useRef();

  // Auto scroll
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Live countdown refresh
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Socket listener
  useEffect(() => {
    socket.on("all_messages", (msgs) => setMessages(msgs));
    return () => socket.off("all_messages");
  }, []);

  // Send message
  const sendMessage = () => {
    if (!input.trim()) return;
    socket.emit("chat_message", { user: username, text: input });
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  // Timer
  const getSecondsLeft = (timestamp) => {
    return Math.max(0, Math.floor(120 - (Date.now() - timestamp) / 1000));
  };

  // Add reaction safely
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
    <div className="min-h-screen bg-black text-white flex flex-col">

    {/* Top Bar */}
    <div className="flex items-center justify-between p-4 border-b border-gray-800">
      <h1
        className="text-2xl md:text-3xl font-bold tracking-wider 
        bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 
        bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(255,0,150,0.5)]"
        style={{ fontFamily: "Orbitron, sans-serif" }}
      >
        GHOST PROTOCOL
      </h1>
      <span
        className="text-xs px-3 py-1 rounded-full 
        bg-gray-800 text-gray-300 border border-gray-700 
        tracking-wide"
        style={{ fontFamily: "Orbitron, sans-serif" }}
      >
        Anonymous Mode
      </span>
    </div>

    {/* Empty State */}
    {messages.length === 0 && (
      <div className="flex-1 flex items-center justify-center text-3xl text-gray-500 font-light">
        Start something anonymous 👀
      </div>
    )}

    {/* Messages */}
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
      {messages.map((msg, i) => {
        const isMe = msg.user === username;
        const secondsLeft = getSecondsLeft(msg.timestamp);

        return (
          <div key={i}>

            {/* Chat Row */}
            <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm shadow-lg
                ${isMe
                  ? "bg-gradient-to-r from-pink-500 to-yellow-500 text-black"
                  : "bg-gray-900 border border-gray-700 text-white"}`}
              >
                {msg.text}

                <div className="text-xs mt-1 opacity-70">
                  {secondsLeft}s
                </div>
              </div>
            </div>

            {/* Reactions OUTSIDE */}
            <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} mt-1`}>

              {/* Emoji display */}
              <div className="flex gap-2 text-sm">
                {(reactions[i] || []).map((r, idx) => (
                  <span key={idx}>{r}</span>
                ))}
              </div>

              {/* Reaction buttons */}
              <div className="flex gap-2 text-sm mt-1 opacity-60 hover:opacity-100 transition">
                <button onClick={() => addReaction(i, "❤️")}>❤️</button>
                <button onClick={() => addReaction(i, "🔥")}>🔥</button>
                <button onClick={() => addReaction(i, "😂")}>😂</button>
              </div>

            </div>
          </div>
        );
      })}

      <div ref={bottomRef}></div>
    </div>

    {/* Input */}
    <div className="p-4 border-t border-gray-800">
      <div className="flex items-center gap-2 bg-gray-900 rounded-full px-4 py-2">

        <input
          className="flex-1 bg-transparent outline-none text-white placeholder-gray-400"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message..."
        />

        <button
          onClick={sendMessage}
          className="bg-gradient-to-r from-pink-500 to-yellow-500 text-black px-4 py-1 rounded-full font-semibold hover:scale-105 transition"
        >
          Send
        </button>

      </div>
    </div>

  </div>
  );
}
