// src/pages/Login.jsx
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ThemeContext } from "../contexts/ThemeContext";

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* LOGIN */
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) setError(error.message);
    else navigate("/profile");

    setLoading(false);
  };

  /* GUEST LOGIN */
  const handleGuestLogin = () => {
    localStorage.setItem("guest", "true");
    navigate("/");
  };

  /* SPARKLES */
  const [sparkles, setSparkles] = useState([]);
  useEffect(() => {
    const total = 18;
    const arr = Array.from({ length: total }).map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      delay: Math.random() * 3,
      duration: Math.random() * 3 + 3,
    }));
    setSparkles(arr);
  }, []);

  /* THEME BASED BACKGROUND */
  const pageBg =
    theme === "dark"
      ? "bg-[#0f0f0f]"
      : "bg-gradient-to-br from-[#FFF5F9] via-[#FFE3B3] to-[#FFDEE9]";

  const cardBg =
    theme === "dark"
      ? "bg-[#1A1A1A]/70 border-[#FF66C4]/30 text-white"
      : "bg-white/20 backdrop-blur-xl border-white/40 text-[#1a1a1a]";

  const inputBg = theme === "dark" ? "bg-[#2a2a2a] text-white" : "bg-white/80 text-gray-800";

  const primaryBtn =
    theme === "dark"
      ? "bg-gradient-to-r from-[#FF66C4] to-[#FFDE59] text-white"
      : "bg-gradient-to-r from-[#ff5858] via-[#ffc371] to-[#ffe3b3] text-[#3a0909]";

  const guestBtn =
    theme === "dark"
      ? "bg-[#333333] text-white border border-[#FF66C4]"
      : "bg-[#ffb84d] text-[#3a0909]";

  return (
    <div className={`relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden ${pageBg}`}>

      {/* GLOBAL CSS FIX */}
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body, #root { width: 100%; height: 100%; overflow-x: hidden; }
      `}</style>

      {/* ANIMATED BLOBS */}
      <motion.div
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        className="absolute w-[28rem] h-[28rem] bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 top-10 left-[-5rem]"
      />

      <motion.div
        animate={{ scale: [1.1, 0.9, 1.1] }}
        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
        className="absolute w-[28rem] h-[28rem] bg-red-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 bottom-10 right-[-5rem]"
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

      {/* LOGIN CARD */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className={`relative z-10 w-full max-w-md rounded-2xl shadow-2xl border p-8 mx-4 ${cardBg}`}
      >

        {/* LOGO */}
        <motion.img
          src="https://i.ibb.co/mVcdHGMP/IMG-20250917-214439-removebg-preview.png"
          alt="KL Stall Logo"
          className="w-28 h-28 mx-auto mb-4 drop-shadow-[0_0_25px_rgba(255,255,255,0.7)]"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 5 }}
        />

        <h1 className="text-3xl sm:text-4xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-[#FF66C4] to-[#FFDE59]">
          KL Stall & Decors
        </h1>

        <p className="text-base sm:text-lg text-center opacity-80 mt-2">
          ✨ {t("login_welcome_back")} ✨
        </p>

        {/* FORM */}
        <form onSubmit={handleLogin} className="mt-6 space-y-4 text-left">
          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("email_address")}
            className={`w-full p-3 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff9a76] ${inputBg}`}
            required
          />

          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("password")}
            className={`w-full p-3 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff9a76] ${inputBg}`}
            required
          />

          {error && (
            <p className="text-red-500 text-sm font-medium text-center">{error}</p>
          )}

          {/* LOGIN BUTTON */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
            type="submit"
            className={`w-full font-bold py-3 rounded-lg shadow-md transition ${primaryBtn}`}
          >
            {loading ? t("logging_in") : t("login_btn")}
          </motion.button>
        </form>

        {/* DIVIDER */}
        <div className="my-5 text-sm flex items-center justify-center gap-2 opacity-80">
          <span className="w-16 h-[1px] bg-current opacity-40"></span>
          {t("or")}
          <span className="w-16 h-[1px] bg-current opacity-40"></span>
        </div>

        {/* GUEST LOGIN */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          onClick={handleGuestLogin}
          className={`w-full font-semibold py-3 rounded-lg shadow-md transition ${guestBtn}`}
        >
          {t("continue_as_guest")}
        </motion.button>

        {/* LINKS */}
        <div className="flex justify-between items-center mt-6 text-sm opacity-90 flex-wrap gap-3">
          <button
            onClick={() => navigate("/signup")}
            className="hover:text-[#ff5858] transition"
          >
            {t("create_account")}
          </button>

          <button
            onClick={() => navigate("/reset-password")}
            className="hover:text-[#ff5858] transition"
          >
            {t("forgot_password")}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
