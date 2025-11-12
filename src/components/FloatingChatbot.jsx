import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { MessageCircle, X } from "lucide-react";
import { motion } from "framer-motion";

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "👋 Hi! I'm KL Stall Assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [position, setPosition] = useState(
    () =>
      JSON.parse(localStorage.getItem("chatbotPosition")) || {
        x: window.innerWidth - 100,
        y: window.innerHeight - 100,
      }
  );

  const chatRef = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);

  useEffect(() => {
    localStorage.setItem("chatbotPosition", JSON.stringify(position));
  }, [position]);

  // ✅ Start dragging only when clicking header (or bubble)
  const startDrag = (clientX, clientY) => {
    isDragging.current = true;
    dragOffset.current = {
      x: clientX - position.x,
      y: clientY - position.y,
    };
  };

  const handleMouseDown = (e) => startDrag(e.clientX, e.clientY);
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    startDrag(touch.clientX, touch.clientY);
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    const newX = e.clientX - dragOffset.current.x;
    const newY = e.clientY - dragOffset.current.y;
    setPosition({
      x: Math.max(0, Math.min(window.innerWidth - 100, newX)),
      y: Math.max(0, Math.min(window.innerHeight - 100, newY)),
    });
  };

  const handleTouchMove = (e) => {
    if (!isDragging.current) return;
    const touch = e.touches[0];
    const newX = touch.clientX - dragOffset.current.x;
    const newY = touch.clientY - dragOffset.current.y;
    setPosition({
      x: Math.max(0, Math.min(window.innerWidth - 100, newX)),
      y: Math.max(0, Math.min(window.innerHeight - 100, newY)),
    });
  };

  const stopDrag = () => {
    if (isDragging.current) {
      isDragging.current = false;
      localStorage.setItem("chatbotPosition", JSON.stringify(position));
    }
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopDrag);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", stopDrag);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopDrag);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", stopDrag);
    };
  }, [position]);

  // ✅ Send message to backend
  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages((prev) => [...prev, { from: "user", text: userMsg }]);
    setInput("");

    try {
      const res = await axios.post("http://localhost:5000/api/chat", {
        message: userMsg,
      });
      const reply = res.data.reply || "Sorry, I didn't understand that.";
      setMessages((prev) => [...prev, { from: "bot", text: reply }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "⚠️ Server error. Please try again later!" },
      ]);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        zIndex: 1000,
        touchAction: "none",
      }}
    >
      {/* Bubble (when closed) */}
      {!isOpen && (
        <motion.button
          onClick={() => setIsOpen(true)}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className="bg-pink-500 text-white p-4 rounded-full shadow-lg hover:bg-pink-600 transition cursor-grab"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <MessageCircle size={26} />
        </motion.button>
      )}

      {/* Chat Window (when open) */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="w-80 bg-white shadow-2xl rounded-2xl border border-gray-200 flex flex-col overflow-hidden"
          style={{ height: "400px" }}
        >
          {/* ✅ Header is draggable area */}
          <div
            className="bg-pink-500 text-white flex justify-between items-center px-4 py-3 cursor-grab select-none"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <h2 className="font-semibold">KL Stall Assistant</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-pink-600 p-1 rounded-full"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-3 overflow-y-auto bg-gray-50 space-y-2">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.from === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`p-2 px-3 rounded-lg max-w-[75%] text-sm shadow ${
                    msg.from === "user"
                      ? "bg-pink-500 text-white"
                      : "bg-white text-gray-800 border border-gray-200"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* ✅ Input area — now clickable and typeable */}
          <div className="flex items-center border-t border-gray-200">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 px-3 py-2 text-sm outline-none"
            />
            <button
              onClick={sendMessage}
              className="bg-pink-500 text-white px-4 py-2 hover:bg-pink-600 transition"
            >
              Send
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
