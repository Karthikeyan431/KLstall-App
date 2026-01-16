// src/pages/Settings.jsx
import React, { useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../contexts/ThemeContext";
import { PreferencesContext } from "../contexts/PreferencesContext";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";

/* ---------------- HAPTIC ---------------- */
const haptic = (ms = 15) => {
  if (navigator.vibrate) navigator.vibrate(ms);
};

/* ---------------- CONSTANTS ---------------- */
const APP_VERSION = "1.0.0";
const PLAY_STORE_URL = "https://play.google.com/store";
const PRIVACY_URL = "https://example.com/privacy"; // replace later

export default function Settings() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { theme, toggle } = useContext(ThemeContext);
  const { prefs, updatePrefs, loading: prefsLoading } =
    useContext(PreferencesContext);

  const [view, setView] = useState("main");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({
    id: null,
    full_name: "",
    phone: "",
    address: "",
  });

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  /* ---------------- LOAD PROFILE ---------------- */
  useEffect(() => {
    const loadProfile = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, phone, address")
        .eq("id", user.id)
        .single();

      if (data) setProfile(data);
      setLoading(false);
    };
    loadProfile();
  }, []);

  /* ---------------- LANGUAGE FIX ---------------- */
  const changeLanguage = async (lang) => {
    haptic(20);
    await updatePrefs({ language: lang });
    await i18n.changeLanguage(lang);
    toast.success(lang === "ta" ? "மொழி மாற்றப்பட்டது" : "Language updated");
  };

  /* ---------------- SAVE PROFILE ---------------- */
  const saveProfile = async () => {
    haptic(30);
    if (!profile.full_name || !profile.phone || !profile.address)
      return toast.error(t("required"));

    setSaving(true);
    const { error } = await supabase.from("profiles").upsert(profile);
    setSaving(false);

    if (error) return toast.error(t("update_failed"));
    toast.success(t("profile_saved"));
    setView("main");
  };

  /* ---------------- SECURE PASSWORD CHANGE ---------------- */
  const secureChangePassword = async () => {
    haptic(40);

    if (!oldPassword || !newPassword)
      return toast.error(t("required"));

    if (newPassword.length < 6)
      return toast.error(t("password_short"));

    setSaving(true);

    const { data: userData } = await supabase.auth.getUser();
    const email = userData?.user?.email;

    const { error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password: oldPassword,
      });

    if (authError) {
      setSaving(false);
      return toast.error(t("invalid_password"));
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setSaving(false);

    if (error) return toast.error(t("update_failed"));

    toast.success(t("password_updated"));
    setOldPassword("");
    setNewPassword("");
    setView("main");
  };

  /* ---------------- FORGOT PASSWORD ---------------- */
  const forgotPassword = async () => {
    haptic(30);
    const { data: userData } = await supabase.auth.getUser();
    const email = userData?.user?.email;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) return toast.error(t("update_failed"));
    toast.success(t("reset_email_sent"));
  };

  /* ---------------- DELETE ACCOUNT ---------------- */
  const deleteAccount = async () => {
    haptic(60);
    const confirm = window.confirm(t("delete_confirm"));
    if (!confirm) return;

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    try {
      await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-account`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: user.id }),
        }
      );

      toast.success(t("account_deleted"));
      await supabase.auth.signOut();
      navigate("/signup");
    } catch {
      toast.error(t("update_failed"));
    }
  };

  if (loading || prefsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF5F9] dark:bg-[#121212]">
        <span className="animate-pulse text-[#FF66C4]">Loading…</span>
      </div>
    );
  }

  /* ---------------- STYLES ---------------- */
  const pageBg =
    theme === "dark"
      ? "bg-[#121212] text-white"
      : "bg-[#FFF5F9] text-[#1a1a1a]";

  const card =
    theme === "dark"
      ? "bg-[#1A1A1A] border border-white/10"
      : "bg-white border border-black/5";

  const row =
    "flex items-center justify-between px-4 py-4 cursor-pointer active:scale-[0.98] transition";

  const input =
    "w-full px-4 py-3 rounded-xl border border-[#FF66C4]/50 bg-transparent focus:ring-2 focus:ring-[#FF66C4] outline-none";

  const gradientBtn =
    "bg-gradient-to-r from-[#FF66C4] to-[#FFDE59] text-white";

  return (
    <>
      <Helmet>
        <title>Settings | KL Stall</title>
      </Helmet>

      <div className={`min-h-screen ${pageBg}`}>
        <div className="max-w-md mx-auto px-4 py-6">

          {/* HEADER */}
          <div className="flex items-center gap-3 mb-6">
            {view !== "main" && (
              <button onClick={() => setView("main")}>←</button>
            )}
            <h1 className="text-2xl font-bold">{t("settings")}</h1>
          </div>

          <AnimatePresence mode="wait">

            {/* ================= MAIN ================= */}
            {view === "main" && (
              <motion.div
                key="main"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className={`rounded-2xl overflow-hidden ${card}`}>
                  <div className={row} onClick={() => setView("profile")}>
                    👤 {t("profile")} <span>›</span>
                  </div>
                  <div className={row} onClick={() => setView("password")}>
                    🔒 {t("change_password")} <span>›</span>
                  </div>
                  <div className={row} onClick={toggle}>
                    🌗 {t("theme")}
                    <span className="opacity-60">
                      {theme === "dark" ? "Dark" : "Light"}
                    </span>
                  </div>
                  <div className={row}>
                    🌐 {t("language")}
                    <div className="flex gap-2">
                      <button onClick={() => changeLanguage("en")}>EN</button>
                      <button onClick={() => changeLanguage("ta")}>TA</button>
                    </div>
                  </div>
                  <div className={row} onClick={() => setView("about")}>ℹ️    {t("about")}</div>
                  <div
                    className={row}
                    onClick={() => window.open(PLAY_STORE_URL, "_blank")}
                  >
                    ⭐ {t("rate_app")}
                  </div>
                  <div className={row} onClick={() => setView("privacy")}>
                    🛡 {t("privacy_policy")}
                  </div>
                </div>

                <div className={`rounded-2xl overflow-hidden ${card}`}>
                  <div className={`${row} text-red-500`} onClick={() => setView("delete")}>
                    {t("delete_account")}
                  </div>
                  <div
                    className={`${row} text-red-500`}
                    onClick={async () => {
                      await supabase.auth.signOut();
                      navigate("/login");
                    }}
                  >
                    {t("logout")}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ================= PROFILE ================= */}
            {view === "profile" && (
              <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className={`rounded-2xl p-5 space-y-4 ${card}`}>
                <input className={input} placeholder={t("full_name")} value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} />
                <input className={input} placeholder={t("phone")} value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                <input className={input} placeholder={t("address")} value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} />
                <button onClick={saveProfile} className={`w-full py-3 rounded-xl font-semibold ${gradientBtn}`}>
                  {t("save_profile")}
                </button>
              </motion.div>
            )}

            {/* ================= PASSWORD ================= */}
            {view === "password" && (
              <motion.div key="password" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className={`rounded-2xl p-5 space-y-4 ${card}`}>
                <input type="password" className={input} placeholder={t("current_password")} value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
                <input type="password" className={input} placeholder={t("new_password")} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                <button onClick={secureChangePassword} className={`w-full py-3 rounded-xl font-semibold ${gradientBtn}`}>
                  {t("change_password")}
                </button>
                <button onClick={forgotPassword} className="text-sm text-[#FF66C4] font-semibold">
                  {t("forgot_password")}
                </button>
              </motion.div>
            )}

            {/* ================= ABOUT ================= */}
            {view === "about" && (
              <motion.div key="about" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className={`rounded-2xl p-5 space-y-3 ${card}`}>
                <h2 className="text-lg font-semibold">KL Stall</h2>
                <p className="text-sm opacity-70">
                  Premium ordering experience for events & stalls.
                </p>
                <p className="text-sm opacity-60">Version {APP_VERSION}</p>
              </motion.div>
            )}

            {/* ================= PRIVACY ================= */}
            {view === "privacy" && (
              <motion.div key="privacy" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className={`rounded-2xl p-5 space-y-3 ${card}`}>
                <h2 className="text-lg font-semibold">Privacy Policy</h2>
                <p className="text-sm opacity-70">
                  We respect your privacy and protect your data.
                </p>
                <button onClick={() => window.open(PRIVACY_URL, "_blank")} className="text-[#FF66C4] font-semibold">
                  View full policy
                </button>
              </motion.div>
            )}

            {/* ================= DELETE ================= */}
            {view === "delete" && (
              <motion.div key="delete" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className={`rounded-2xl p-5 space-y-4 ${card}`}>
                <p className="text-red-500 font-semibold">{t("delete_warning")}</p>
                <button onClick={deleteAccount} className="w-full py-3 rounded-xl border border-red-500 text-red-500 font-semibold">
                  {t("confirm_delete")}
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
