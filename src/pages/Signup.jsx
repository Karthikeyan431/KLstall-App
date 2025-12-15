// src/pages/Signup.jsx
import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useTranslation } from "react-i18next";
import { ThemeContext } from "../contexts/ThemeContext";

export default function Signup() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    if (!email || !password) {
      setError(t("signup.error_fill_fields"));
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) setError(error.message);
    else {
      setMessage(t("signup.success_message"));
      setTimeout(() => navigate("/login"), 2500);
    }

    setLoading(false);
  };

  /* SPARKLES */
  const [sparkles, setSparkles] = useState([]);
  useEffect(() => {
    const total = 16;
    const arr = Array.from({ length: total }).map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      delay: Math.random() * 3,
      duration: Math.random() * 3 + 3,
    }));
    setSparkles(arr);
  }, []);

  /* THEME */
  const pageBg =
    theme === "dark"
      ? "bg-[#0f0f0f]"
      : "bg-gradient-to-br from-[#FFE7E0] via-[#FFF3C2] to-[#FFFFFF]";

  const cardBg =
    theme === "dark"
      ? "bg-[#1A1A1A]/70 border-[#FF66C4]/30 text-white"
      : "bg-white/40 backdrop-blur-xl border-white/20 text-[#1a1a1a]";

  const inputBg =
    theme === "dark"
      ? "bg-[#2a2a2a] text-white placeholder-gray-300"
      : "bg-white/80 text-gray-700 placeholder-gray-500";

  const primaryBtn =
    theme === "dark"
      ? "bg-gradient-to-r from-[#FF66C4] via-[#FFDE59] to-[#FFB6FF] text-black"
      : "bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-200 text-slate-900";

  return (
    <div
      className={`min-h-screen w-screen flex flex-col items-center justify-center relative overflow-hidden ${pageBg}`}
    >
      {/* FIX GLOBAL BODY */}
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body, #root { width: 100%; height: 100%; overflow-x: hidden; }
      `}</style>

      {/* ANIMATED BLOBS */}
      <motion.div
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ repeat: Infinity, duration: 6 }}
        className="absolute w-[26rem] h-[26rem] bg-amber-300 rounded-full mix-blend-multiply blur-3xl opacity-25 top-10 left-[-6rem]"
      />

      <motion.div
        animate={{ scale: [1.1, 0.9, 1.1] }}
        transition={{ repeat: Infinity, duration: 8 }}
        className="absolute w-[26rem] h-[26rem] bg-orange-500 rounded-full mix-blend-multiply blur-3xl opacity-25 bottom-10 right-[-6rem]"
      />

      {/* SPARKLES */}
      {sparkles.map((s, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full shadow-md"
          initial={{ x: s.x, y: s.y }}
          animate={{ y: [s.y, s.y - 50], opacity: [1, 0] }}
          transition={{
            duration: s.duration,
            repeat: Infinity,
            delay: s.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* CARD */}
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className={`relative z-10 w-[90%] sm:w-full max-w-md rounded-2xl shadow-xl p-8 border ${cardBg}`}
      >
        <h2 className="text-3xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-[#FF66C4] to-[#FFDE59] mb-2">
          {t("signup.create_account")}
        </h2>

        <p className="text-sm opacity-80 text-center mb-6">
          {t("signup.join")}{" "}
          <span className="font-semibold text-[#b9314f]">KL STALL</span>{" "}
          {t("signup.manage_stall")}
        </p>

        {/* FORM */}
        <form onSubmit={handleSignup} className="space-y-4">
          {/* Email */}
          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="email"
            placeholder={t("signup.placeholder_email")}
            className={`w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF66C4] ${inputBg}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Password */}
          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="password"
            placeholder={t("signup.placeholder_password")}
            className={`w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF66C4] ${inputBg}`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          {/* ERRORS */}
          {error && <div className="text-sm text-red-500 font-medium">{error}</div>}
          {message && <div className="text-sm text-green-600 font-medium">{message}</div>}

          {/* SUBMIT BUTTON */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className={`w-full font-bold p-3 rounded-lg shadow-md transition ${primaryBtn}`}
          >
            {loading ? t("signup.creating") : t("signup.signup_btn")}
          </motion.button>
        </form>

        {/* Link */}
        <div className="mt-5 text-sm text-center opacity-90">
          {t("signup.already_account")}{" "}
          <button
            onClick={() => navigate("/login")}
            className="underline font-semibold hover:text-[#FF66C4] transition"
          >
            {t("signup.login")}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
