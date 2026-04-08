import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("https://ghost-protocol-tpwp.onrender.com");

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [username] = useState("Ghost_" + Math.floor(Math.random() * 1000));
  const [activeUsers, setActiveUsers] = useState(0);
  const bottomRef = useRef();
  const [, setTick] = useState(0);

  useEffect(() => {
    socket.on("all_messages", (msgs) => setMessages(msgs));
    socket.on("active_users", (count) => setActiveUsers(count));
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => {
      socket.off("all_messages");
      socket.off("active_users");
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    socket.emit("chat_message", { user: username, text: input });
    setInput("");
  };

  const sendReaction = (msgId, emoji) => {
    socket.emit("add_reaction", { msgId, emoji });
  };

  return (
    <div className="h-screen w-full flex items-center justify-center p-4 bg-black overflow-hidden">
    
    {/* THE MAIN FLOATING GLASS CARD */}
    <div className="glass-card w-full max-w-2xl h-[85vh] flex flex-col relative shadow-2xl">
      
      {/* 1. HEADER */}
      <div className="p-5 border-b border-white/10 flex justify-between items-center bg-black/20">
        <h1 className="neon-title text-xl font-bold tracking-[0.2em]">GHOST_PROTOCOL</h1>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/30">
          <div className="pulse-dot"></div>
          <span className="text-green-400 text-[10px] font-mono">{activeUsers} NODES_ACTIVE</span>
        </div>
      </div>

      {/* 2. CHAT MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-30">
            <span className="text-5xl mb-4 animate-pulse">👻</span>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em]">Waiting for transmission...</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.user === username;
            const timeLeft = Math.max(0, 120 - (Date.now() - msg.timestamp) / 1000);
            
            return (
              <div key={msg.id || msg.timestamp} 
                   className={`flex flex-col ${isMe ? "items-end" : "items-start"} ${timeLeft < 5 ? 'message-fade-out' : ''}`}>
                
                {/* Message Bubble */}
                <div className={`max-w-[85%] p-4 rounded-2xl backdrop-blur-md ${isMe ? "neon-msg-me" : "neon-msg-other"}`}>
                  <p className="text-sm font-light text-white/90">{msg.text}</p>
                  
                  {/* The Shrinking Time Bar */}
                  <div className="w-full bg-white/10 h-[2px] mt-3 rounded-full overflow-hidden">
                    <div className="time-bar" style={{ width: `${(timeLeft / 120) * 100}%` }}></div>
                  </div>
                </div>

                {/* Synced Reactions */}
                <div className="flex gap-1.5 mt-2 px-1">
                  {msg.reactions?.map((r, i) => (
                    <span key={i} className="text-[10px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">{r}</span>
                  ))}
                </div>

                {/* Reaction Picker (Visible on Hover) */}
                <div className="flex gap-3 mt-1 opacity-0 hover:opacity-100 transition-opacity duration-300">
                  {["❤️","🔥","😂","👻","⚡"].map(emoji => (
                    <button key={emoji} onClick={() => sendReaction(msg.id, emoji)} className="text-xs hover:scale-125 transition">
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef}></div>
      </div>

      {/* 3. INPUT AREA */}
      <div className="p-6 bg-black/40 border-t border-white/10">
        <div className="flex gap-3">
          <input 
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-white/20"
            placeholder="ENTER_DATA_STRING..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage} className="neon-btn px-8 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg">
            Send
          </button>
        </div>
      </div>

    </div>
  </div>
  );
}
