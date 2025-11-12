// src/pages/UpdatePassword.jsx
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react"; // 👁️ for show/hide icons

export default function UpdatePassword() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) setSessionReady(true);
    };
    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionReady(!!session);
    });

    return () => {
      authListener?.subscription?.unsubscribe?.();
    };
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
    } else {
      setMessage("✅ Password updated successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    }

    setLoading(false);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-[#FFF5F9] text-[#1a1a1a] overflow-hidden">
      {/* Background animation */}
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 6 }}
        className="absolute w-[25rem] h-[25rem] bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 top-10 left-0"
      />
      <motion.div
        animate={{ scale: [1.1, 0.9, 1.1] }}
        transition={{ repeat: Infinity, duration: 8 }}
        className="absolute w-[28rem] h-[28rem] bg-red-400 rounded-full mix-blend-multiply filter blur-3xl opacity-40 bottom-10 right-0"
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-md w-full bg-white/95 p-8 rounded-2xl shadow-xl"
      >
        <h2 className="text-2xl font-semibold text-red-900 mb-2">Set a New Password</h2>
        <p className="text-sm text-red-800 mb-6">
          Create a new password for your account.
        </p>

        {!sessionReady ? (
          <div className="text-sm text-red-700 mb-4">
            Waiting for Supabase session... Please open this page from the password reset email.
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="relative">
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                className="w-full p-3 pr-10 rounded-lg border border-red-400 focus:ring-2 focus:ring-red-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-600 hover:text-red-800 transition"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}
            {message && <div className="text-sm text-green-600">{message}</div>}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition"
            >
              {loading ? "Updating..." : "Update Password"}
            </motion.button>
          </form>
        )}

        <div className="mt-4 text-sm text-red-800 text-center">
          <Link to="/login" className="hover:underline text-yellow-600">
            Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
