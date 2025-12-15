// src/components/ChatWidget.jsx
import React, { useState, useEffect, useRef, useContext } from "react";
import { ThemeContext } from "../contexts/ThemeContext";

export default function ChatWidget() {
  const { theme } = useContext(ThemeContext);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [typingDots, setTypingDots] = useState(".");
  const [input, setInput] = useState("");

  const containerRef = useRef(null);

  /* ===============================
     Initial message
  =============================== */
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Hi 👋 KL Stall & Decors ku welcome! Decoration / stalls pathi ketkalaam 😊",
    },
  ]);

  /* ===============================
     Typing animation
  =============================== */
  useEffect(() => {
    if (!loading) return;
    const t = setInterval(() => {
      setTypingDots((d) => (d.length >= 3 ? "." : d + "."));
    }, 450);
    return () => clearInterval(t);
  }, [loading]);

  /* ===============================
     Auto scroll
  =============================== */
  useEffect(() => {
    if (containerRef.current)
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [messages, loading]);

  /* ===============================
     Send message
  =============================== */
  const chatFunctionUrl =
    "https://alayipoqgverqdvjmskj.functions.supabase.co/chatbot";

  const sendMessage = async () => {
    if (!input.trim()) return;

    const text = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    setLoading(true);

    try {
      const res = await fetch(chatFunctionUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();
      setMessages((m) => [
        ...m,
        { role: "bot", text: data?.reply || "Konjam neram kalichu try pannunga 😔" },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "bot", text: "Network issue 😔 Please try again." },
      ]);
    }

    setLoading(false);
    setTypingDots(".");
  };

  /* ===============================
     Bubble styles
  =============================== */
  const userBubble =
    "bg-gradient-to-r from-[#FF66C4] to-[#FF9B3A] text-white";
  const botBubble =
    theme === "dark"
      ? "bg-white/10 text-white backdrop-blur-md"
      : "bg-white/70 text-black backdrop-blur-md";

  return (
    <>
      {/* CHAT WINDOW */}
      {open && (
        <div
          className="fixed bottom-24 right-4 w-[340px] h-[480px] rounded-3xl shadow-2xl border border-white/30 backdrop-blur-xl flex flex-col overflow-hidden animate-fadeIn"
          style={{
            background:
              theme === "dark"
                ? "linear-gradient(180deg,#0f0f0f,#1a1a1a)"
                : "linear-gradient(180deg,#FFF5F9,#FFE8D9)",
            zIndex: 9999,
          }}
        >
          {/* HEADER */}
          <div className="p-4 flex justify-between items-center bg-gradient-to-r from-[#FF66C4] to-[#FFDE59] font-bold text-black">
            <span>KL Stall AI 💬</span>
            <button onClick={() => setOpen(false)}>✕</button>
          </div>

          {/* MESSAGES */}
          <div
            ref={containerRef}
            className="flex-1 p-4 space-y-3 overflow-auto"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow ${
                    m.role === "user" ? userBubble : botBubble
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="text-xs italic text-gray-500">
                AI is typing{typingDots}
              </div>
            )}
          </div>

          {/* INPUT */}
          <div className="p-3 border-t border-white/30 flex gap-2">
            <input
              className="flex-1 px-4 py-2 rounded-full outline-none bg-white/80"
              placeholder="Type your message…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-[#FF66C4] to-[#FF9B3A] text-white font-semibold"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* FLOATING BUTTON */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-2xl text-2xl flex items-center justify-center animate-pulse-glow"
          style={{
            background: "linear-gradient(90deg,#FF66C4,#FFDE59)",
            zIndex: 9999,
          }}
        >
          💬
        </button>
      )}
    </>
  );
}
