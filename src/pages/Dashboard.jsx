// src/pages/Dashboard.jsx
import React, { useEffect, useState, useContext } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ThemeContext } from "../contexts/ThemeContext";
import { Helmet } from "react-helmet-async";

export default function Dashboard() {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();

  // AUTH
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // DATA
  const [fullName, setFullName] = useState("Customer");
  const [currentOrder, setCurrentOrder] = useState(null);

  /* ---------------- THEME ---------------- */
  const pageBg =
    theme === "dark"
      ? "bg-[#0f0f0f] text-white"
      : "bg-gradient-to-b from-[#FFF5F9] to-[#FFE4EC] text-[#1a1a1a]";

  const surface =
    theme === "dark"
      ? "bg-[#1A1A1A] border border-[#FF66C4]/40"
      : "bg-white border border-[#FF66C4]/20";

  /* ---------------- AUTH SESSION ---------------- */
  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setUser(data?.session?.user ?? null);
      setAuthChecked(true);
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      setAuthChecked(true);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /* ---------------- REDIRECT ---------------- */
  useEffect(() => {
    if (authChecked && user === null) {
      navigate("/login");
    }
  }, [authChecked, user, navigate]);

  /* ---------------- LOAD PROFILE ---------------- */
  useEffect(() => {
    if (!user) return;
    let mounted = true;

    const loadProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

      if (!mounted) return;
      setFullName(data?.full_name || "Customer");
    };

    loadProfile();
    return () => (mounted = false);
  }, [user]);

  /* ---------------- LOAD CURRENT ORDER ---------------- */
  useEffect(() => {
    if (!user) return;
    let mounted = true;

    const loadOrder = async () => {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!mounted) return;
      if (data && data.status !== "delivered") setCurrentOrder(data);
      else setCurrentOrder(null);
    };

    loadOrder();
    return () => (mounted = false);
  }, [user]);

  /* ---------------- LOADING ---------------- */
  if (!authChecked) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${pageBg}`}>
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.4 }}
          className="text-[#FF66C4] text-lg"
        >
          Loading your dashboard…
        </motion.div>
      </div>
    );
  }

  /* ---------------- UI ---------------- */
  return (
    <>
      <Helmet>
        <title>Dashboard | KL Stall</title>
      </Helmet>

      <div className={`min-h-screen px-4 py-8 ${pageBg}`}>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="max-w-md mx-auto"
        >
          {/* GREETING */}
          <h1 className="text-xl font-semibold mb-1">
            {t("welcome_back")},{" "}
            <span className="text-[#FF66C4]">{fullName}</span> 👋
          </h1>
          <p className="opacity-70 mb-6">Ready for popcorn?</p>

          {/* HERO CTA */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.01 }}
            onClick={() => navigate("/packages")}
            className="
              w-full py-4 mb-6
              rounded-2xl font-semibold text-white text-lg
              bg-gradient-to-r from-[#FF66C4] to-[#FFDE59]
              shadow-xl
            "
          >
            🍿 Order Now
          </motion.button>

          {/* CURRENT ORDER */}
          <AnimatePresence>
            {currentOrder && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  boxShadow: [
                    "0 0 0 rgba(255,102,196,0)",
                    "0 0 12px rgba(255,102,196,0.35)",
                    "0 0 0 rgba(255,102,196,0)",
                  ],
                }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
                className={`mb-6 p-4 rounded-2xl ${surface}`}
              >
                <p className="text-sm opacity-70 mb-1">Your Current Order</p>
                <div className="flex justify-between items-center">
                  <span className="font-medium">
                    Order #{String(currentOrder.id).slice(0, 6)}
                  </span>
                  <span className="text-[#FF66C4] font-semibold capitalize">
                    {currentOrder.status}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* QUICK ACTIONS */}
          <div className="grid grid-cols-2 gap-4">
            <ActionCard label="My Orders" icon="📦" onClick={() => navigate("/orders")} surface={surface} />
            <ActionCard label="Cart" icon="🛒" onClick={() => navigate("/cart")} surface={surface} />
            <ActionCard label="Offers" icon="🎁" onClick={() => navigate("/packages")} surface={surface} />
            <ActionCard label="Profile" icon="👤" onClick={() => navigate("/profile")} surface={surface} />
          </div>
        </motion.div>
      </div>
    </>
  );
}

/* ---------------- ACTION CARD ---------------- */
function ActionCard({ label, icon, onClick, surface }) {
  return (
    <motion.button
      whileHover={{ y: -4, boxShadow: "0 12px 20px rgba(0,0,0,0.12)" }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`
        ${surface}
        p-5 rounded-2xl
        flex flex-col items-center justify-center
        transition
      `}
    >
      <span className="text-2xl mb-2">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </motion.button>
  );
}
