// src/components/ChatWidget.jsx
import React, { useState, useEffect, useRef, useContext } from "react";
import { ThemeContext } from "../contexts/ThemeContext";

const ICON_SIZE = 56;
const MARGIN = 16;
const LOGO_URL =
  "https://i.ibb.co/mVcdHGMP/IMG-20250917-214439-removebg-preview.png";

export default function ChatWidget() {
  const { theme } = useContext(ThemeContext);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [typingDots, setTypingDots] = useState(".");
  const [input, setInput] = useState("");

  /* ===============================
     RESPONSIVE CHAT SIZE
  =============================== */
  const getChatSize = () => {
    const w = window.innerWidth;
    if (w < 640) {
      return { w: window.innerWidth * 1.02, h: window.innerHeight * 0.6 };
    }
    if (w < 1024) return { w: 380, h: 520 };
    return { w: 420, h: 580 };
  };

  const [chatSize, setChatSize] = useState(getChatSize());

  /* ===============================
     INITIAL BOTTOM-RIGHT POSITION
  =============================== */
  const getBottomRightIcon = () => ({
    x: window.innerWidth - ICON_SIZE - MARGIN,
    y: window.innerHeight - ICON_SIZE - MARGIN,
  });

  const getBottomRightChat = (size) => ({
    x: window.innerWidth - size.w - MARGIN,
    y: window.innerHeight - size.h - ICON_SIZE - MARGIN * 2,
  });

  const [iconPos, setIconPos] = useState(getBottomRightIcon());
  const [chatPos, setChatPos] = useState(getBottomRightChat(chatSize));

  useEffect(() => {
    const resize = () => {
      const size = getChatSize();
      setChatSize(size);
      setIconPos(getBottomRightIcon());
      setChatPos(getBottomRightChat(size));
    };
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  /* ===============================
     DRAG STATE
  =============================== */
  const dragType = useRef(null);
  const offset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e) => {
      if (!dragType.current) return;
      const p = e.touches ? e.touches[0] : e;

      let x = p.clientX - offset.current.x;
      let y = p.clientY - offset.current.y;

      if (dragType.current === "icon") {
        setIconPos({
          x: Math.max(0, Math.min(x, window.innerWidth - ICON_SIZE)),
          y: Math.max(0, Math.min(y, window.innerHeight - ICON_SIZE)),
        });
      }

      if (dragType.current === "chat") {
        setChatPos({
          x: Math.max(0, Math.min(x, window.innerWidth - chatSize.w)),
          y: Math.max(0, Math.min(y, window.innerHeight - chatSize.h)),
        });
      }
    };

    const stop = () => (dragType.current = null);

    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", stop);
    document.addEventListener("touchmove", move, { passive: false });
    document.addEventListener("touchend", stop);

    return () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", stop);
      document.removeEventListener("touchmove", move);
      document.removeEventListener("touchend", stop);
    };
  }, [chatSize]);

  const startDrag = (e, type) => {
    const p = e.touches ? e.touches[0] : e;
    dragType.current = type;
    const base = type === "icon" ? iconPos : chatPos;
    offset.current = { x: p.clientX - base.x, y: p.clientY - base.y };
  };

  /* ===============================
     CHAT DATA
  =============================== */
  const containerRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Hi 👋 KL Stall & Decors ku welcome! Decoration / stalls pathi ketkalaam 😊",
    },
  ]);

  useEffect(() => {
    if (!loading) return;
    const t = setInterval(() => {
      setTypingDots((d) => (d.length >= 3 ? "." : d + "."));
    }, 400);
    return () => clearInterval(t);
  }, [loading]);

  useEffect(() => {
    containerRef.current?.scrollTo(0, containerRef.current.scrollHeight);
  }, [messages, loading]);

  /* ===============================
     SEND MESSAGE (REAL API)
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
          className="fixed rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{
            left: chatPos.x,
            top: chatPos.y,
            width: chatSize.w,
            height: chatSize.h,
            background:
              theme === "dark"
                ? "linear-gradient(180deg,#0f0f0f,#1a1a1a)"
                : "linear-gradient(180deg,#FFF5F9,#FFE8D9)",
            zIndex: 9999,
          }}
        >
          {/* HEADER (DRAG HANDLE) */}
          <div
            onMouseDown={(e) => startDrag(e, "chat")}
            onTouchStart={(e) => startDrag(e, "chat")}
            className="p-3 flex justify-between items-center bg-gradient-to-r from-[#FF66C4] to-[#FFDE59] font-bold text-black cursor-move"
          >
            <span>KL Stall AI</span>
            <button onClick={() => setOpen(false)}>✕</button>
          </div>

          {/* MESSAGES */}
          <div ref={containerRef} className="flex-1 p-3 space-y-3 overflow-auto">
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
          <div className="p-2 flex gap-2 border-t border-white/30">
            <input
              className="flex-1 px-4 py-2 rounded-full bg-white/80 text-sm outline-none"
              placeholder="Type your message…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-[#FF66C4] to-[#FF9B3A] text-white text-sm font-semibold"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* FLOATING LOGO BUTTON */}
      {!open && (
        <div
          onMouseDown={(e) => startDrag(e, "icon")}
          onTouchStart={(e) => startDrag(e, "icon")}
          onClick={() => setOpen(true)}
          className="fixed flex items-center justify-center rounded-full shadow-xl cursor-pointer bg-white"
          style={{
            left: iconPos.x,
            top: iconPos.y,
            width: ICON_SIZE,
            height: ICON_SIZE,
            zIndex: 9999,
          }}
        >
          <img
            src={LOGO_URL}
            alt="KL Stall AI"
            style={{
              width: "70%",
              height: "70%",
              objectFit: "contain",
            }}
          />
        </div>
      )}
    </>
  );
}
