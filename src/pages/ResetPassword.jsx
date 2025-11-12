// src/pages/ResetPassword.jsx
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    if (!email) {
      setError("Please enter your email.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) setError(error.message);
    else setMessage("If the email exists, you will receive a reset link shortly.");

    setLoading(false);
  };

  return (
    <div
      className="min-h-screen w-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #FFE7E0 0%, #FFF3C2 50%, #FFFFFF 100%)",
        margin: "0",
        padding: "0",
        border: "none",
        boxSizing: "border-box",
      }}
    >
      {/* Fix: Reset all default margins & borders globally */}
      <style>{`
        * {
          margin: 0;
          padding: 0;
          border: none;
          box-sizing: border-box;
        }
        html, body, #root {
          width: 100%;
          height: 100%;
          overflow-x: hidden;
          background: transparent;
        }
      `}</style>

      {/* Animated gradient blobs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 6 }}
        className="absolute w-[25rem] h-[25rem] bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 top-10 left-[-5rem]"
      />
      <motion.div
        animate={{ scale: [1.1, 0.9, 1.1] }}
        transition={{ repeat: Infinity, duration: 8 }}
        className="absolute w-[25rem] h-[25rem] bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 bottom-10 right-[-5rem]"
      />

      {/* Floating sparkles */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full shadow-md"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{ y: [null, -20], opacity: [1, 0] }}
          transition={{
            duration: Math.random() * 5 + 4,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
        />
      ))}

      {/* Reset Password Box */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-[90%] sm:w-full max-w-md bg-white/40 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-xl"
      >
        <h2 className="text-2xl font-bold text-slate-800 mb-3 text-center">
          Reset Your Password
        </h2>
        <p className="text-sm text-slate-600 text-center mb-6">
          We’ll send a password reset link to your registered email.
        </p>

        <form onSubmit={handleReset} className="space-y-4">
          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="email"
            placeholder="Enter your email address"
            className="w-full p-3 rounded-lg bg-white/70 text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {error && (
            <div className="text-sm text-red-600 font-medium">{error}</div>
          )}
          {message && (
            <div className="text-sm text-green-600 font-medium">{message}</div>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-200 text-slate-900 shadow-md hover:opacity-90 transition-all"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </motion.button>
        </form>

        <div className="mt-4 text-sm text-center">
          <Link
            to="/login"
            className="text-amber-700 font-semibold hover:underline hover:text-orange-600 transition"
          >
            ⬅ Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
