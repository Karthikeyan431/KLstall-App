// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [user, setUser] = useState(undefined);
  const [coins, setCoins] = useState(0);
  const [fullName, setFullName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    const loadUser = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) console.error("Error getting session:", error.message);
      if (active) setUser(data?.session?.user ?? null);
    };
    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setUser(session?.user ?? null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user === null) {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("coins, full_name")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error.message);
      } else {
        setCoins(data?.coins || 0);
        setFullName(data?.full_name || "User");
      }
    };
    fetchProfile();
  }, [user]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Sign-out error:", error.message);
    navigate("/login");
  };

  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF5F9] text-[#1a1a1a]">
        <p className="text-lg text-red-900 animate-pulse">Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-yellow-100 via-pink-50 to-yellow-200 text-[#1a1a1a] overflow-hidden">
      {/* Animated Background Blobs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 6 }}
        className="absolute w-[28rem] h-[28rem] bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 top-10 left-10"
      />
      <motion.div
        animate={{ scale: [1.1, 0.9, 1.1] }}
        transition={{ repeat: Infinity, duration: 8 }}
        className="absolute w-[26rem] h-[26rem] bg-red-400 rounded-full mix-blend-multiply filter blur-3xl opacity-40 bottom-10 right-10"
      />

      {/* 🧭 Logo with soft animated glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="z-10 flex flex-col items-center mb-6"
      >
        <motion.div
          animate={{
            boxShadow: [
              "0 0 15px 3px rgba(255, 200, 100, 0.4)",
              "0 0 30px 8px rgba(255, 150, 150, 0.6)",
              "0 0 15px 3px rgba(255, 200, 100, 0.4)",
            ],
          }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="w-28 h-28 rounded-full overflow-hidden border-4 border-white/70 bg-white flex items-center justify-center"
        >
          <img
            src="/logo.png"
            alt="KL Stall & Decors Logo"
            className="w-full h-full object-contain p-1"
          />
        </motion.div>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center mb-10"
      >
        <h1 className="text-4xl font-extrabold text-red-900 drop-shadow-md">
          KL STALL & DECORS
        </h1>
        <p className="text-lg text-yellow-900/90 mt-2 font-medium">
          Event Management Dashboard
        </p>
        <p className="text-base text-red-700 mt-1">
          Welcome back, <span className="font-semibold">{fullName}</span> 👋
        </p>
      </motion.div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-4xl bg-white/30 backdrop-blur-xl border border-white/40 rounded-2xl shadow-2xl p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-red-900">Your Overview</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium shadow-md"
          >
            Sign out
          </motion.button>
        </div>

        {/* Account Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="p-4 bg-yellow-100/50 rounded-xl shadow-inner border border-yellow-200">
            <h3 className="text-red-900 font-semibold mb-2">📧 Email</h3>
            <p className="text-red-800">{user?.email ?? "—"}</p>
          </div>

          <div className="p-4 bg-yellow-100/50 rounded-xl shadow-inner border border-yellow-200">
            <h3 className="text-red-900 font-semibold mb-2">🆔 User ID</h3>
            <p className="text-red-800 text-sm break-all">{user?.id ?? "—"}</p>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Coins */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-6 bg-gradient-to-br from-yellow-200 to-yellow-100 rounded-2xl shadow-lg flex flex-col items-center justify-center border border-yellow-300"
          >
            <h3 className="text-red-900 font-semibold mb-2">💰 Coins</h3>
            <p className="text-3xl font-bold text-red-800">{coins}</p>
          </motion.div>

          {/* Manage Packages */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-6 bg-gradient-to-br from-yellow-200 to-pink-100 rounded-2xl shadow-lg border border-yellow-300"
          >
            <h3 className="text-red-900 font-semibold mb-2">🏵 Our Services</h3>
            <p className="text-red-800 text-sm mb-3">
              Add, edit, or manage your event packages easily.
            </p>
            <button
              onClick={() => navigate("/admin")}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Go
            </button>
          </motion.div>

          {/* View Orders */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-6 bg-gradient-to-br from-yellow-200 to-pink-100 rounded-2xl shadow-lg border border-yellow-300"
          >
            <h3 className="text-red-900 font-semibold mb-2">🪩 Bookings</h3>
            <p className="text-red-800 text-sm mb-3">
              Check and manage all customer bookings.
            </p>
            <button
              onClick={() => navigate("/orders")}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Go
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
