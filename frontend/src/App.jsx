import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

// ── Change this to your deployed URL when going live ──────────────────────
// Local dev:   "http://localhost:3001"
// Deployed:    "https://ghost-protocol-tpwp.onrender.com"
const BACKEND_URL = "https://ghost-protocol-tpwp.onrender.com";
const socket = io(BACKEND_URL);

// ── Floating particle component ───────────────────────────────────────────
function Particle({ style }) {
  return <div className="particle" style={style} />;
}

// Pre-generate 5 particles with stable props
const PARTICLES = Array.from({ length: 5 }, (_, i) => ({
  left:              `${12 + i * 18}%`,
  width:             `${3 + (i % 3)}px`,
  height:            `${3 + (i % 3)}px`,
  background:        i % 2 === 0 ? "#00ffff" : "#ff00ff",
  boxShadow:         i % 2 === 0 ? "0 0 6px #00ffff" : "0 0 6px #ff00ff",
  animationDuration: `${13 + i * 3}s`,
  animationDelay:    `${i * 2.5}s`,
}));

export default function App() {
  const [messages, setMessages]     = useState([]);
  const [input, setInput]           = useState("");
  const [username]                  = useState("Ghost_" + Math.floor(Math.random() * 1000));
  const [activeUsers, setActiveUsers] = useState(0);
  const [connected, setConnected]   = useState(false);
  const [, setTick]                 = useState(0);
  const bottomRef                   = useRef(null);

  // 1-second tick → live countdown timers + opacity fade
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    socket.on("connect",      ()      => setConnected(true));
    socket.on("disconnect",   ()      => setConnected(false));
    socket.on("all_messages", (msgs)  => setMessages(msgs));
    socket.on("active_users", (count) => setActiveUsers(count));
    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("all_messages");
      socket.off("active_users");
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

  // ── Helpers ──────────────────────────────────────────────────────────────
  const getSecsLeft  = (ts) => Math.max(0, Math.floor(120 - (Date.now() - ts) / 1000));
  const getOpacity   = (ts) => Math.max(0.08, 1 - (Date.now() - ts) / 120000).toFixed(2);
  const getBarColor  = (secs) => {
    if (secs > 60) return "#00ffff";
    if (secs > 30) return "#ffff00";
    return "#ff4444";
  };
  const getTimerText = (secs) => {
    const color = getBarColor(secs);
    const style = { color, fontFamily: "'Space Mono',monospace", fontSize: 10,
                    border: `1px solid ${color}`, padding: "2px 6px",
                    borderRadius: 4, boxShadow: `0 0 5px ${color}55` };
    return <span style={style}>⏱ {secs}s</span>;
  };

  return (
    <div style={{ height: "100vh", width: "100%", display: "flex",
                  alignItems: "center", justifyContent: "center", padding: 16,
                  overflow: "hidden", position: "relative" }}>

      {/* ── Background particles ── */}
      {PARTICLES.map((p, i) => <Particle key={i} style={p} />)}

      {/* ── Main card ── */}
      <div className="glass-card" style={{ width: "100%", maxWidth: 600,
           height: "85vh", display: "flex", flexDirection: "column",
           position: "relative", zIndex: 1, overflow: "hidden" }}>

        {/* ── Header ── */}
        <div style={{ padding: "18px 22px", borderBottom: "1px solid rgba(0,255,255,0.1)",
                      background: "rgba(0,0,0,0.3)",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      gap: 12 }}>
          <h1 className="neon-title" style={{ fontSize: 18, letterSpacing: "0.2em", fontWeight: 900 }}>
            GHOST_PROTOCOL
          </h1>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Active users */}
            <div style={{ display: "flex", alignItems: "center", gap: 6,
                          padding: "4px 12px", borderRadius: 20,
                          border: "1px solid rgba(0,255,0,0.3)",
                          background: "rgba(0,255,0,0.05)" }}>
              <div className="pulse-dot" />
              <span style={{ color: "#00ff00", fontSize: 10,
                             fontFamily: "'Space Mono',monospace", letterSpacing: 1 }}>
                {activeUsers} NODES_ACTIVE
              </span>
            </div>

            {/* Connection status */}
            <div style={{ width: 8, height: 8, borderRadius: "50%",
                          background: connected ? "#00ff00" : "#ff4444",
                          boxShadow: `0 0 8px ${connected ? "#00ff00" : "#ff4444"}` }}
                 title={connected ? "Connected" : "Disconnected"} />
          </div>
        </div>

        {/* ── Message list ── */}
        <div className="custom-scrollbar"
             style={{ flex: 1, overflowY: "auto", padding: 20,
                      display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Empty state */}
          {messages.length === 0 && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column",
                          alignItems: "center", justifyContent: "center",
                          gap: 16, padding: "40px 0" }}>
              <div className="ghost-float" style={{ fontSize: 56 }}>👻</div>
              <div className="void-text">ENTER THE VOID</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                <span className="chip">⚡ Real-time</span>
                <span className="chip">🔒 Anonymous</span>
                <span className="chip">⏱ Self-destruct</span>
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg) => {
            const isMe    = msg.user === username;
            const secs    = getSecsLeft(msg.timestamp);
            const barPct  = ((secs / 120) * 100).toFixed(1);
            const barColor = getBarColor(secs);

            return (
              <div
                key={msg.id}
                className={`msg-enter ${secs < 5 ? "message-fade-out" : ""}`}
                style={{ display: "flex", flexDirection: "column",
                         alignItems: isMe ? "flex-end" : "flex-start",
                         opacity: getOpacity(msg.timestamp) }}
              >
                {/* Bubble */}
                <div className={isMe ? "neon-msg-me" : "neon-msg-other"}
                     style={{ maxWidth: "78%", padding: "12px 16px", borderRadius: 16,
                              backdropFilter: "blur(12px)" }}>
                  {/* Username + timer */}
                  <div style={{ display: "flex", justifyContent: "space-between",
                                alignItems: "center", marginBottom: 6, gap: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1,
                                   color: isMe ? "#ff00ff" : "#00ffff",
                                   textShadow: isMe
                                     ? "0 0 6px rgba(255,0,255,0.5)"
                                     : "0 0 6px rgba(0,255,255,0.5)" }}>
                      {msg.user}
                    </span>
                    {getTimerText(secs)}
                  </div>

                  {/* Message text */}
                  <p style={{ fontSize: 13, lineHeight: 1.6,
                               color: "rgba(255,255,255,0.88)", margin: 0 }}>
                    {msg.text}
                  </p>

                  {/* Progress bar */}
                  <div className="time-bar-track">
                    <div className="time-bar"
                         style={{ width: `${barPct}%`, background: barColor,
                                  color: barColor }} />
                  </div>
                </div>

                {/* Reaction display */}
                {msg.reactions?.length > 0 && (
                  <div style={{ display: "flex", gap: 4, marginTop: 4,
                                flexDirection: isMe ? "row-reverse" : "row",
                                flexWrap: "wrap" }}>
                    {msg.reactions.map((r, i) => (
                      <span key={i}
                            style={{ fontSize: 10, background: "rgba(255,255,255,0.05)",
                                     border: "1px solid rgba(255,255,255,0.1)",
                                     padding: "2px 6px", borderRadius: 6, color: "#fff" }}>
                        {r}
                      </span>
                    ))}
                  </div>
                )}

                {/* Reaction buttons (visible on hover via parent group) */}
                <div className="reaction-row"
                     style={{ display: "flex", gap: 5, marginTop: 4,
                              opacity: 0, transition: "opacity 0.2s",
                              flexDirection: isMe ? "row-reverse" : "row" }}
                     onMouseEnter={e => e.currentTarget.style.opacity = 1}
                     onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                  {["❤️","🔥","😂","👻","⚡"].map(emoji => (
                    <button key={emoji} className="react-btn"
                            onClick={() => sendReaction(msg.id, emoji)}
                            title={emoji}>
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          <div ref={bottomRef} />
        </div>

        {/* ── Input area ── */}
        <div style={{ padding: "14px 20px", borderTop: "1px solid rgba(0,255,255,0.1)",
                      background: "rgba(0,0,0,0.4)",
                      display: "flex", gap: 10, alignItems: "center" }}>
          <input
            className="neon-input"
            placeholder="ENTER_DATA_STRING..."
            value={input}
            maxLength={280}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
          />
          <button
            className="neon-btn"
            onClick={sendMessage}
            disabled={!input.trim()}>
            SEND
          </button>
        </div>

      </div>

      {/* ── Footer ── */}
      <div style={{ position: "absolute", bottom: 10, left: 0, right: 0,
                    textAlign: "center", fontSize: 10, letterSpacing: 2,
                    color: "rgba(0,255,255,0.2)", fontFamily: "'Space Mono',monospace",
                    zIndex: 1 }}>
        NO LOGS · NO TRACE · MESSAGES VANISH IN 2 MIN
      </div>
    </div>
  );
}
