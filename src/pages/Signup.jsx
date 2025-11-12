// src/pages/Signup.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    if (!email || !password) {
      setError("Please enter email and password.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) setError(error.message);
    else {
      setMessage("Signup successful! Check your email to confirm.");
      setTimeout(() => navigate("/login"), 2500);
    }
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
      {/* Fix for unwanted borders or space */}
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

      {/* Animated background blobs */}
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

      {/* Signup Form */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-[90%] sm:w-full max-w-md bg-white/40 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-xl"
      >
        <h2 className="text-2xl font-bold text-slate-800 mb-2 text-center">
          Create your account
        </h2>
        <p className="text-sm text-slate-600 mb-6 text-center">
          Join{" "}
          <span className="font-semibold text-amber-700">KL STALL</span> — manage your stall effortlessly.
        </p>

        <form onSubmit={handleSignup} className="space-y-4">
          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="email"
            placeholder="Email"
            className="w-full p-3 rounded-lg bg-white/70 text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="password"
            placeholder="Password (min 6 characters)"
            className="w-full p-3 rounded-lg bg-white/70 text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          {error && <div className="text-sm text-red-600 font-medium">{error}</div>}
          {message && <div className="text-sm text-green-600 font-medium">{message}</div>}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-200 text-slate-900 font-bold p-3 rounded-lg shadow-md hover:opacity-90 transition-all"
          >
            {loading ? "Creating account..." : "Sign up"}
          </motion.button>
        </form>

        <div className="mt-4 text-sm text-slate-700 text-center">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="underline font-semibold hover:text-amber-600 transition-all"
          >
            Login
          </button>
        </div>
      </motion.div>
    </div>
  );
}
