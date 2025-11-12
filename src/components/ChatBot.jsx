// src/components/ChatBot.jsx
import React, { useState } from "react";

export default function ChatBot() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "👋 Hi! I’m KL Stall Assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      if (data.reply) {
        setMessages([...newMessages, { sender: "bot", text: data.reply }]);
      } else {
        setMessages([
          ...newMessages,
          { sender: "bot", text: "❌ Sorry, something went wrong. Try again later!" },
        ]);
      }
    } catch (err) {
      console.error("ChatBot error:", err);
      setMessages([
        ...newMessages,
        { sender: "bot", text: "⚠️ Server error. Please check your backend connection." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border rounded-2xl shadow-xl w-80 flex flex-col overflow-hidden">
      <div className="bg-blue-600 text-white p-3 font-semibold">
        KL Stall Assistant 💬
      </div>
      <div className="flex-1 p-3 overflow-y-auto max-h-80">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`my-2 ${
              msg.sender === "user" ? "text-right" : "text-left"
            }`}
          >
            <span
              className={`inline-block px-3 py-2 rounded-xl ${
                msg.sender === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {msg.text}
            </span>
          </div>
        ))}
        {loading && <div className="text-sm text-gray-500">Typing...</div>}
      </div>
      <div className="p-2 border-t flex">
        <input
          className="flex-1 border rounded-lg px-2 py-1 focus:outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          className="ml-2 bg-blue-600 text-white px-3 py-1 rounded-lg"
          onClick={handleSend}
          disabled={loading}
        >
          Send
        </button>
      </div>
    </div>
  );
}
