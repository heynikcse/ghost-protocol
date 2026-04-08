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
    <div className="h-screen flex items-center justify-center p-4 bg-black">
    
    {/* This is the new "Floating" Card */}
    <div className="glass-card w-full max-w-2xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">
      
      {/* HEADER */}
      <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
        <h1 className="neon-title text-xl font-bold tracking-[0.2em] font-mono">GHOST_PROTOCOL</h1>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/30">
          <div className="pulse-dot"></div>
          <span className="text-green-400 text-[10px] font-mono tracking-tighter">{activeUsers} NODES_ACTIVE</span>
        </div>
      </div>

      {/* CHAT MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-20">
            <span className="text-4xl mb-4">👻</span>
            <p className="font-mono text-xs uppercase tracking-widest">Waiting for transmission...</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.user === username;
            const timeLeft = Math.max(0, 120 - (Date.now() - msg.timestamp) / 1000);
            
            return (
              <div key={msg.id || msg.timestamp} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl ${isMe ? "neon-msg-me bg-magenta-500/10" : "neon-msg-other bg-cyan-500/10"} backdrop-blur-md`}>
                  <p className="text-sm font-light text-white/90">{msg.text}</p>
                  
                  {/* Visual Timer Bar - The shrinking line */}
                  <div className="w-full bg-white/5 h-[2px] mt-3 rounded-full overflow-hidden">
                    <div className="time-bar" style={{ width: `${(timeLeft / 120) * 100}%` }}></div>
                  </div>
                </div>

                {/* Reaction Row */}
                <div className="flex gap-2 mt-2 px-1">
                  {msg.reactions?.map((r, i) => (
                    <span key={i} className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded border border-white/5">{r}</span>
                  ))}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef}></div>
      </div>

      {/* INPUT BOX AREA */}
      <div className="p-6 bg-black/40 border-t border-white/10">
        <div className="flex gap-3 items-center">
          <input 
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50 transition-all"
            placeholder="TYPE_MESSAGE_HERE..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button 
            onClick={sendMessage} 
            className="neon-btn h-full px-8 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest text-white shadow-lg"
          >
            Send
          </button>
        </div>
      </div>

    </div>
  </div>
  );
}
