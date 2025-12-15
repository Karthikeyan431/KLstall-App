// src/pages/Dashboard.jsx
import React, { useEffect, useState, useContext } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ThemeContext } from "../contexts/ThemeContext";

export default function Dashboard() {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const [user, setUser] = useState(undefined);
  const [coins, setCoins] = useState(0);
  const [fullName, setFullName] = useState("");
  const navigate = useNavigate();

  /* THEME CLASSES */
  const pageBg =
    theme === "dark"
      ? "bg-[#0f0f0f] text-white"
      : "bg-gradient-to-b from-[#FFF5F9] to-[#FFE4EC] text-[#1a1a1a]";

  const cardClass =
    theme === "dark"
      ? "bg-[#1A1A1A] text-white border border-[#FF66C4]/40 shadow-xl"
      : "bg-white text-[#1a1a1a] border border-[#FF66C4]/20 shadow-lg";

  const subCardClass =
    theme === "dark"
      ? "bg-[#111111] border border-[#FF66C4]/30 shadow-lg"
      : "bg-white border border-[#FF66C4]/30 shadow-md";

  /* LOAD USER SESSION */
  useEffect(() => {
    let active = true;

    const loadUser = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!error && active) setUser(data?.session?.user ?? null);
    };

    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (active) setUser(session?.user ?? null);
      }
    );

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  /* REDIRECT IF NOT LOGGED IN */
  useEffect(() => {
    if (user === null) navigate("/login");
  }, [user]);

  /* FETCH PROFILE DATA */
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("coins, full_name")
        .eq("id", user.id)
        .single();

      setCoins(data?.coins || 0);
      setFullName(data?.full_name || "User");
    };

    fetchProfile();
  }, [user]);

  /* SIGN OUT */
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  /* LOADING SCREEN */
  if (user === undefined) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${pageBg}`}>
        <p className="text-lg text-[#b9314f] animate-pulse">{t("loading_user")}</p>
      </div>
    );
  }

  /* MAIN UI */
  return (
    <div className={`min-h-screen w-full flex flex-col items-center px-4 py-10 ${pageBg}`}>
      
      {/* TITLE */}
      <h1 className="text-3xl md:text-4xl font-extrabold text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r from-[#FF66C4] to-[#FFDE59]">
        KL STALL & DECORS
      </h1>

      <p className="text-lg opacity-90 mb-8 font-medium text-center">
        {t("welcome_back")}, <span className="font-bold">{fullName}</span> 👋
      </p>

      {/* DASHBOARD CARD */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full max-w-4xl rounded-3xl p-6 ${cardClass}`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#b9314f]">
            {t("your_overview")}
          </h2>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSignOut}
            className="px-4 py-2 text-white rounded-lg bg-gradient-to-r from-[#FF66C4] to-[#FFDE59] font-semibold shadow-md hover:opacity-90"
          >
            {t("sign_out")}
          </motion.button>
        </div>

        {/* USER INFO CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className={`p-4 rounded-xl ${subCardClass}`}>
            <h3 className="font-semibold text-[#b9314f] mb-1">📧 {t("email")}</h3>
            <p>{user?.email ?? "—"}</p>
          </div>

          <div className={`p-4 rounded-xl ${subCardClass}`}>
            <h3 className="font-semibold text-[#b9314f] mb-1">🆔 {t("user_id")}</h3>
            <p className="text-sm break-all">{user?.id ?? "—"}</p>
          </div>
        </div>

        {/* FEATURE CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

          {/* COINS */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className={`p-6 rounded-xl text-center ${subCardClass}`}
          >
            <h3 className="font-semibold text-[#b9314f] mb-2">
              💰 {t("coins")}
            </h3>
            <p className="text-3xl font-bold text-[#ff5858]">{coins}</p>
          </motion.div>

          {/* SERVICES */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className={`p-6 rounded-xl ${subCardClass}`}
          >
            <h3 className="font-semibold text-[#b9314f] mb-2">🏵 {t("our_services")}</h3>
            <p className="text-sm mb-3 opacity-90">{t("services_desc")}</p>
            <button
              onClick={() => navigate("/admin")}
              className="w-full py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-[#FF66C4] to-[#FFDE59] hover:opacity-90"
            >
              {t("go")}
            </button>
          </motion.div>

          {/* BOOKINGS / ORDERS */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className={`p-6 rounded-xl ${subCardClass}`}
          >
            <h3 className="font-semibold text-[#b9314f] mb-2">📘 {t("bookings")}</h3>
            <p className="text-sm mb-3 opacity-90">{t("bookings_desc")}</p>
            <button
              onClick={() => navigate("/orders")}
              className="w-full py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-[#FF66C4] to-[#FFDE59] hover:opacity-90"
            >
              {t("go")}
            </button>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
}
