import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { motion } from "framer-motion";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  const handleGuestLogin = () => {
    localStorage.setItem("guest", "true");
    navigate("/");
  };

  // Prevent window access crash (SSR-safe sparkles)
  const [sparkles, setSparkles] = useState([]);
  useEffect(() => {
    const total = 12;
    const arr = Array.from({ length: total }).map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      delay: Math.random() * 3,
      duration: Math.random() * 4 + 4,
    }));
    setSparkles(arr);
  }, []);

  return (
    <div
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #FFF5F9 0%, #FFE3B3 50%, #FFDEE9 100%)",
      }}
    >
      {/* Global Reset */}
      <style>{`
        * { margin: 0; padding: 0; border: none; box-sizing: border-box; }
        html, body, #root { width: 100%; height: 100%; overflow-x: hidden; background: transparent; }
      `}</style>

      {/* Animated Gradient Blobs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 6 }}
        className="absolute w-[28rem] h-[28rem] bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 top-10 left-[-5rem]"
      />
      <motion.div
        animate={{ scale: [1.1, 0.9, 1.1] }}
        transition={{ repeat: Infinity, duration: 8 }}
        className="absolute w-[28rem] h-[28rem] bg-red-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 bottom-10 right-[-5rem]"
      />

      {/* Floating Sparkles */}
      {sparkles.map((s, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full shadow-md"
          initial={{ x: s.x, y: s.y }}
          animate={{ y: [s.y, s.y - 40], opacity: [1, 0] }}
          transition={{
            duration: s.duration,
            repeat: Infinity,
            delay: s.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-md bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl p-8 mx-4 text-center"
      >
        {/* Logo */}
        <motion.img
          src="https://i.ibb.co/mVcdHGMP/IMG-20250917-214439-removebg-preview.png"
          alt="KL Stall Logo"
          className="w-28 h-28 mx-auto mb-4 drop-shadow-[0_0_25px_rgba(255,255,255,0.7)]"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 5 }}
        />
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#b9314f] drop-shadow-lg">
          KL Stall & Decors
        </h1>
        <p className="text-base sm:text-lg text-[#7a3b3b] mt-2">✨ Welcome Back! ✨</p>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="mt-6 space-y-4 text-left">
          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            className="w-full p-3 rounded-lg bg-white/80 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff9a76]"
            required
          />
          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-3 rounded-lg bg-white/80 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff9a76]"
            required
          />
          {error && (
            <p className="text-red-600 text-sm font-medium text-center mt-1">
              {error}
            </p>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
            type="submit"
            className="w-full bg-gradient-to-r from-[#ff5858] via-[#ffc371] to-[#ffe3b3] text-[#3a0909] font-bold py-3 rounded-lg shadow-lg transition"
          >
            {loading ? "Logging in..." : "Login 🎉"}
          </motion.button>
        </form>

        {/* Divider */}
        <div className="my-5 text-sm text-[#5e2b2b] flex items-center justify-center gap-2">
          <span className="w-16 h-[1px] bg-[#5e2b2b]/30"></span>
          or
          <span className="w-16 h-[1px] bg-[#5e2b2b]/30"></span>
        </div>

        {/* Guest Login */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate("/")}
          className="w-full mt-3 bg-[#ffb84d] text-[#3a0909] font-semibold py-3 rounded-lg shadow-md hover:bg-[#ffc671] transition"
        >
          Continue as Guest 🚀
        </motion.button>

        {/* Links */}
        <div className="flex justify-between items-center mt-6 text-sm text-[#5e2b2b] flex-wrap gap-2">
          <button
            onClick={() => navigate("/signup")}
            className="hover:text-[#ff5858] transition"
          >
            Create an account
          </button>
          <button
            onClick={() => navigate("/reset-password")}
            className="hover:text-[#ff5858] transition"
          >
            Forgot password?
          </button>
        </div>
      </motion.div>
    </div>
  );
}
