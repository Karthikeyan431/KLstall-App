import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Supabase setup
const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ✅ Gemini setup (official Google SDK)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// ✅ In-memory conversation history
let conversationHistory = [];

/* ---------------------------------------------------
   CONTACT FORM EMAIL ROUTE
--------------------------------------------------- */
app.post("/api/send-email", async (req, res) => {
  const { name, email, message } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: email,
      to: process.env.EMAIL_USER,
      subject: `New Contact Form Submission from ${name}`,
      text: message,
    });

    res.status(200).json({ success: true, message: "✅ Email sent successfully!" });
  } catch (err) {
    console.error("❌ Error sending email:", err);
    res.status(500).json({ success: false, error: "Failed to send email." });
  }
});

/* ---------------------------------------------------
   STALL BOOKING ROUTE (Save to Supabase)
--------------------------------------------------- */
app.post("/api/book-stall", async (req, res) => {
  const { name, stallType, event, phone, message } = req.body;
  console.log("🧾 Booking received:", req.body);

  try {
    const { error } = await supabase.from("orders").insert([
      {
        customer_name: name,
        stall_type: stallType,
        event_type: event,
        phone,
        message,
        status: "pending",
      },
    ]);

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: "✅ Booking saved to Supabase successfully!",
    });
  } catch (error) {
    console.error("❌ Error saving booking:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to save booking.",
    });
  }
});

/* ---------------------------------------------------
   CHATBOT ROUTE (Gemini AI)
--------------------------------------------------- */
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  try {
    if (!message) return res.status(400).json({ error: "No message provided" });

    // 🔹 Quick replies
    const quickReplies = {
      hello: "👋 Hi there! How can I help you today?",
      "book stall": "Sure! Please share your name, event type, and stall type.",
      price:
        "💰 Our pricing depends on your event and stall size. Would you like our package details?",
      contact:
        "📞 You can reach us at +91 95660 61075 or email klstall.decors@gmail.com.",
      location: "📍 We're based in Thirukkazhukundram, Tamil Nadu.",
    };

    const lowerMsg = message.toLowerCase();
    const predefined = Object.entries(quickReplies).find(([key]) =>
      lowerMsg.includes(key)
    );

    if (predefined) {
      conversationHistory.push({ role: "assistant", text: predefined[1] });
      return res.json({ reply: predefined[1] });
    }

    // ✅ Add user message to history
    conversationHistory.push({ role: "user", text: message });

    // Format conversation for Gemini
    const contents = conversationHistory.map((entry) => ({
      role: entry.role,
      parts: [{ text: entry.text }],
    }));

    // Generate AI response
    const result = await model.generateContent({ contents });

    const reply = result.output_text?.trim() || "Sorry, I couldn’t understand that.";

    // Save assistant response to history
    conversationHistory.push({ role: "assistant", text: reply });

    res.json({ reply });
  } catch (error) {
    console.error("❌ Gemini chatbot error:", error);
    res.status(500).json({ error: "Chatbot failed to respond.", details: error.message });
  }
});

/* ---------------------------------------------------
   START SERVER
--------------------------------------------------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
