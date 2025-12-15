// src/pages/Contact.jsx
import React, { useState, useContext } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import { ThemeContext } from "../contexts/ThemeContext";
import { useTranslation } from "react-i18next";

export default function Contact() {
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Theme UI Classes
  const pageBg =
    theme === "dark"
      ? "bg-[#0f0f0f] text-white"
      : "bg-gradient-to-b from-[#FFF5F9] via-[#FFE4EC] to-[#FFF5F9] text-[#1a1a1a]";

  const cardBg =
    theme === "dark"
      ? "bg-[#1A1A1A] border border-[#FF66C4]/40"
      : "bg-white border border-[#FF66C4]/20";

  const inputBg =
    theme === "dark"
      ? "bg-[#2A2A2A] text-white border border-[#FF66C4]/30"
      : "bg-white text-black border border-[#FF66C4]/30";

  const buttonPrimary =
    theme === "dark"
      ? "bg-[#FF66C4] hover:bg-[#ff4aad] text-white"
      : "bg-gradient-to-r from-[#FF66C4] to-[#FFDE59] text-white";

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");

    const { error } = await supabase.from("contact_form").insert([
      {
        name,
        phone,
        message,
      },
    ]);

    if (error) {
      setSuccessMsg(t("contact_error"));
    } else {
      setSuccessMsg(t("contact_success"));
      setName("");
      setPhone("");
      setMessage("");
    }
    setLoading(false);
  };

  return (
    <div className={`min-h-screen w-full px-4 py-10 flex flex-col items-center ${pageBg}`}>
      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-extrabold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#FF66C4] to-[#FFDE59]">
        {t("contact_us")}
      </h1>

      <p className="text-center max-w-2xl opacity-80 mb-10">
        {t("contact_subtitle") ||
          "We’re here to help! Reach us anytime for bookings, decorations, events or stall services."}
      </p>

      {/* Contact Form + Info */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Contact Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-6 shadow-xl ${cardBg}`}
        >
          <h2 className="text-2xl font-bold mb-4 text-[#b9314f]">
            {t("send_message") || "Send us a message"}
          </h2>

          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder={t("your_name") || "Your Name"}
              className={`w-full p-3 rounded-lg ${inputBg}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <input
              type="number"
              placeholder={t("your_phone") || "Your Phone Number"}
              className={`w-full p-3 rounded-lg ${inputBg}`}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />

            <textarea
              rows={4}
              placeholder={t("your_message") || "Write your message"}
              className={`w-full p-3 rounded-lg resize-none ${inputBg}`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />

            {successMsg && (
              <p className="text-green-500 font-semibold text-sm">{successMsg}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-full font-semibold shadow-md ${buttonPrimary}`}
            >
              {loading
                ? t("sending") || "Sending..."
                : t("send_now") || "Send Message"}
            </button>
          </div>
        </motion.form>

        {/* Right Side Info */}
        <motion.div
          initial={{ opacity: 0, x: 25 }}
          whileInView={{ opacity: 1, x: 0 }}
          className={`rounded-2xl p-6 shadow-xl ${cardBg}`}
        >
          <h2 className="text-2xl font-bold text-[#b9314f] mb-4">
            {t("contact_details") || "Contact Details"}
          </h2>

          <div className="space-y-4 text-sm">
            <div>
              <p className="font-semibold">📍 {t("office_location")}</p>
              <p className="opacity-80">Thirukkazhukundram, Chengalpattu</p>
            </div>

            <div>
              <p className="font-semibold">📞 {t("phone")}</p>
              <p className="opacity-80">+91 95660 61075</p>
              <p className="opacity-80">+91 82205 84194</p>
            </div>

            <div>
              <p className="font-semibold">📧 {t("email")}</p>
              <p className="opacity-80">klstall.decors@gmail.com</p>
            </div>

            <div>
              <p className="font-semibold">🌐 {t("social_links")}</p>
              <a
                href="https://wa.me/919566061075"
                target="_blank"
                className="block text-green-500 underline"
              >
                WhatsApp Chat
              </a>
            </div>

            <div>
              <p className="font-semibold mb-2">📌 {t("view_on_maps")}</p>
              <a
                href="https://maps.app.goo.gl/UE13u5D3xxU7y7iL6"
                target="_blank"
                className="text-blue-500 underline"
              >
                Open in Google Maps
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
