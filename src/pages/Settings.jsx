// src/pages/Settings.jsx
import React, { useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../contexts/ThemeContext";
import { PreferencesContext } from "../contexts/PreferencesContext";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

export default function Settings() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const { theme, toggle } = useContext(ThemeContext);
  const { prefs, updatePrefs, loading: prefsLoading } =
    useContext(PreferencesContext);

  const [profile, setProfile] = useState({
    id: null,
    full_name: "",
    phone: "",
    address: "",
  });

  const [loading, setLoading] = useState(true);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [changePassLoading, setChangePassLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, phone, address")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile({
          id: data.id,
          full_name: data.full_name || "",
          phone: data.phone || "",
          address: data.address || "",
        });
      }

      setLoading(false);
    };

    fetchProfile();
  }, []);

  const updateProfile = async () => {
    if (!profile.full_name.trim())
      return toast.error(`${t("full_name")} ${t("required")}`);

    if (!/^[0-9]{10}$/.test(profile.phone))
      return toast.error(`${t("phone")} ${t("invalid_phone")}`);

    if (!profile.address.trim())
      return toast.error(`${t("address")} ${t("required")}`);

    setUpdatingProfile(true);

    const { error } = await supabase.from("profiles").upsert(profile);

    if (error) toast.error(t("update_failed"));
    else toast.success(t("save_profile"));

    setUpdatingProfile(false);
  };

  const changePassword = async () => {
    if (newPassword.length < 6) return toast.error(t("password_short"));

    setChangePassLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (!error) {
      toast.success(t("password_updated"));
      await supabase.auth.signOut();
      navigate("/login");
    } else toast.error(t("update_failed"));

    setChangePassLoading(false);
  };

  const deleteAccount = async () => {
    const confirmDel = window.confirm(`${t("delete_account")} ?`);
    if (!confirmDel) return;

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) return toast.error(t("user_not_found"));

    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-account`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: user.id }),
        }
      );

      const data = await res.json();
      if (!res.ok) return toast.error(data?.error || t("update_failed"));

      toast.success(t("account_deleted"));
      await supabase.auth.signOut();
      navigate("/signup");
    } catch (err) {
      toast.error(t("update_failed"));
    }
  };

  if (loading || prefsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF5F9] dark:bg-[#121212] text-pink-600 dark:text-white text-lg">
        {t("loading")}...
      </div>
    );
  }

  const currentLanguage = prefs.language || "en";

  // ========= UPDATED THEME-MATCHED CLASSES =========

  const cardClass = `
    rounded-2xl shadow-md p-6 border transition
    ${theme === "dark"
      ? "bg-[#1A1A1A] border-[#FF66C4]/40 text-white"
      : "bg-white border-[#FF66C4]/30 text-[#1a1a1a]"}
  `;

  const inputClass = `
    w-full px-4 py-2 rounded-xl border focus:ring-2 transition
    ${theme === "dark"
      ? "border-[#FF66C4] bg-[#121212] text-white focus:ring-[#FF66C4]"
      : "border-[#FF66C4] bg-white text-[#1a1a1a] focus:ring-[#FF66C4]"}
  `;

  const buttonPrimary = `
    w-full py-3 rounded-xl font-semibold transition
    bg-gradient-to-r from-[#FF66C4] to-[#FFDE59] text-white shadow
  `;

  const buttonOutlineRed = `
    w-full py-3 rounded-xl border font-semibold transition
    ${theme === "dark"
      ? "border-red-400 text-red-400"
      : "border-red-600 text-red-700"}
  `;

  return (
    <div
      className={`
        min-h-screen w-full px-4 py-10 flex flex-col items-center transition
        ${theme === "dark"
          ? "bg-[#121212]"
          : "bg-gradient-to-b from-[#FFF5F9] to-[#FFE4EC]"}
      `}
    >
      <h1 className="text-3xl font-extrabold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#FF66C4] to-[#FFDE59]">
        ⚙️ {t("settings")}
      </h1>

      <div className="w-full max-w-2xl space-y-6">

        {/* PROFILE */}
        <div className={cardClass}>
          <h2 className="text-xl font-bold mb-4 text-[#b9314f] dark:text-white">
            {t("profile_info")}
          </h2>

          <div className="space-y-3">
            <input
              className={inputClass}
              placeholder={t("full_name")}
              value={profile.full_name}
              onChange={(e) =>
                setProfile({ ...profile, full_name: e.target.value })
              }
            />

            <input
              className={inputClass}
              placeholder={t("phone")}
              value={profile.phone}
              onChange={(e) =>
                setProfile({ ...profile, phone: e.target.value })
              }
            />

            <input
              className={inputClass}
              placeholder={t("address")}
              value={profile.address}
              onChange={(e) =>
                setProfile({ ...profile, address: e.target.value })
              }
            />
          </div>

          <button
            onClick={updateProfile}
            disabled={updatingProfile}
            className={`${buttonPrimary} mt-4`}
          >
            {updatingProfile ? t("saving") : t("save_profile")}
          </button>
        </div>

        {/* APP PREFERENCES */}
        <div className={cardClass}>
          <h2 className="text-xl font-bold mb-4 text-[#b9314f] dark:text-white">
            {t("app_prefs")}
          </h2>

          {/* THEME */}
          <div className="flex justify-between mb-4">
            <h3 className="font-bold">{t("theme")}</h3>
            <button
              onClick={toggle}
              className={`
                px-4 py-2 rounded-full font-semibold border transition
                ${theme === "dark"
                  ? "border-[#FF66C4] text-white hover:bg-[#333]"
                  : "border-[#FF66C4] text-[#1a1a1a] hover:bg-[#FF66C4]/20"}
              `}
            >
              {theme === "light" ? "🌙 Dark Mode" : "🌞 Light Mode"}
            </button>
          </div>

          {/* LANGUAGE */}
          <div className="flex justify-between mb-4">
            <h3 className="font-bold">{t("language")}</h3>

            <div className="flex gap-2">
              <button
                className={`px-4 py-2 rounded-full font-semibold ${
                  currentLanguage === "en"
                    ? "bg-gradient-to-r from-[#FF66C4] to-[#FFDE59] text-white"
                    : "border border-[#FF66C4]"
                }`}
                onClick={() => {
                  updatePrefs({ language: "en" });
                  i18n.changeLanguage("en");
                  toast.success("Language Updated");
                }}
              >
                EN
              </button>

              <button
                className={`px-4 py-2 rounded-full font-semibold ${
                  currentLanguage === "ta"
                    ? "bg-gradient-to-r from-[#FF66C4] to-[#FFDE59] text-white"
                    : "border border-[#FF66C4]"
                }`}
                onClick={() => {
                  updatePrefs({ language: "ta" });
                  i18n.changeLanguage("ta");
                  toast.success("மொழி மாற்றப்பட்டது");
                }}
              >
                தமிழ்
              </button>
            </div>
          </div>

          {/* NOTIFICATIONS */}
          <div className="flex justify-between mb-4">
            <h3 className="font-bold">{t("notifications")}</h3>
            <input
              type="checkbox"
              className="w-5 h-5"
              checked={!!prefs.notifications}
              onChange={(e) => updatePrefs({ notifications: e.target.checked })}
            />
          </div>

          {/* CHATBOT */}
          <div className="flex justify-between">
            <h3 className="font-bold">{t("chatbot")}</h3>
            <input
              type="checkbox"
              className="w-5 h-5"
              checked={!!prefs.chatbot_enabled}
              onChange={(e) =>
                updatePrefs({ chatbot_enabled: e.target.checked })
              }
            />
          </div>
        </div>

        {/* PASSWORD */}
        <div className={cardClass}>
          <h2 className="text-xl font-bold mb-4 text-[#b9314f] dark:text-white">
            {t("change_password")}
          </h2>

          <input
            type="password"
            className={inputClass}
            placeholder={t("new_password")}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <button
            onClick={changePassword}
            disabled={changePassLoading}
            className={`${buttonPrimary} mt-3`}
          >
            {changePassLoading ? t("changing") : t("change_pass_btn")}
          </button>
        </div>

        {/* ACCOUNT */}
        <div className={cardClass}>
          <h2 className="text-xl font-bold mb-4 text-[#b9314f] dark:text-white">
            {t("account")}
          </h2>

          <div className="flex gap-3">
            <button
              className={buttonOutlineRed}
              onClick={async () => {
                await supabase.auth.signOut();
                navigate("/login");
              }}
            >
              {t("logout")}
            </button>

            <button className={buttonOutlineRed} onClick={deleteAccount}>
              {t("delete_account")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
