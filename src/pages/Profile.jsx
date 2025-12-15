// src/pages/Profile.jsx
import React, { useEffect, useState, useRef, useContext } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { ThemeContext } from "../contexts/ThemeContext";

export default function Profile() {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({});

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [about, setAbout] = useState("");
  const [address, setAddress] = useState("");

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [oldFilePath, setOldFilePath] = useState(null);

  const fileRef = useRef(null);
  const navigate = useNavigate();

  /* LOAD PROFILE */
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error(t("login_required"));
        navigate("/login");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(data || {});
      setName(data?.full_name || "");
      setPhone(data?.phone || "");
      setAbout(data?.about || "");
      setAddress(data?.address || "");
      setAvatarPreview(data?.avatar_url || null);
      setOldFilePath(data?.avatar_url || null);
      setLoading(false);
    }

    load();
  }, [navigate]);

  /* AVATAR UPLOAD */
  const handleFileChange = async (file) => {
    if (!file) return;

    setAvatarPreview(URL.createObjectURL(file));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const filePath = `${user.id}/${Date.now()}-${file.name}`;

      const { error } = await supabase.storage
        .from("Uploads")
        .upload(filePath, file, { upsert: true });

      if (error) throw error;

      if (oldFilePath) {
        await supabase.storage.from("Uploads").remove([oldFilePath]);
      }

      setOldFilePath(filePath);

      const { data } = supabase.storage.from("Uploads").getPublicUrl(filePath);

      await supabase.from("profiles").upsert({
        id: user.id,
        avatar_url: data.publicUrl,
      });

      toast.success(t("profile_image_updated"));
    } catch {
      toast.error(t("upload_failed"));
    }
  };

  /* SAVE PROFILE */
  const save = async (e) => {
    e.preventDefault();

    if (!name.trim()) return toast.error(t("name_required"));
    if (!phone.trim()) return toast.error(t("phone_required"));
    if (!address.trim()) return toast.error(t("address_required"));

    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: name,
      phone,
      about,
      address,
      avatar_url: avatarPreview,
    });

    setSaving(false);
    if (error) return toast.error(error.message);

    toast.success(t("profile_saved"));
  };

  /* THEME CLASSES */
  const pageBg =
    theme === "dark"
      ? "bg-[#0e0e0e]"
      : "bg-gradient-to-b from-[#FFF5F9] to-[#FFE4EC]";

  const cardClass =
    theme === "dark"
      ? "bg-[#1b1b1b] border border-[#FF66C4]/40 text-white shadow-xl rounded-3xl p-8"
      : "bg-white border border-[#FF66C4]/20 text-black shadow-xl rounded-3xl p-8";

  const inputClass =
    "p-3 rounded-xl border focus:ring-2 w-full transition-all " +
    (theme === "dark"
      ? "bg-[#121212] border-[#FF66C4] text-white focus:ring-[#FF66C4]"
      : "bg-white border-[#FF66C4] focus:ring-[#FF66C4] text-black");

  const buttonPrimary =
    "w-full py-3 rounded-xl font-semibold transition shadow-md text-white bg-gradient-to-r from-[#FF66C4] to-[#FFDE59]";

  const buttonSecondary =
    "block w-full py-3 rounded-xl mt-4 border text-center transition font-medium " +
    (theme === "dark"
      ? "border-gray-600 text-gray-300 hover:bg-[#1A1A1A]"
      : "border-gray-300 text-gray-700 hover:bg-gray-100");

  /* LOADING */
  if (loading)
    return (
      <div className={`min-h-screen flex items-center justify-center text-lg ${pageBg}`}>
        {t("loading_profile")}
      </div>
    );

  /* MAIN UI */
  return (
    <div className={`min-h-screen px-4 py-16 flex justify-center items-start ${pageBg}`}>
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full max-w-xl ${cardClass}`}
      >
        {/* TITLE */}
        <h2 className="text-3xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-[#FF66C4] to-[#FFDE59]">
          {t("your_profile")}
        </h2>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden shadow-lg border-4 border-[#FF66C4]">
              {avatarPreview ? (
                <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  {t("no_avatar")}
                </div>
              )}
            </div>

            <div
              onClick={() => fileRef.current.click()}
              className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 cursor-pointer text-white rounded-full"
            >
              {t("change")}
            </div>

            <input
              type="file"
              ref={fileRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => handleFileChange(e.target.files[0])}
            />
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={save} className="grid gap-6 mb-6">
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder={t("full_name")} />
          <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t("phone")} />
          <input className={inputClass} value={address} onChange={(e) => setAddress(e.target.value)} placeholder={t("address")} />
          <textarea className={inputClass} rows="3" value={about} onChange={(e) => setAbout(e.target.value)} placeholder={t("about_optional")} />

          <button type="submit" disabled={saving} className={buttonPrimary}>
            {saving ? t("saving") : t("save_profile")}
          </button>
        </form>

        {/* Navigations */}
        <Link to="/settings" className={buttonSecondary}>
          {t("settings")}
        </Link>

        <button
          onClick={async () => {
            await supabase.auth.signOut();
            navigate("/login");
          }}
          className={buttonSecondary}
        >
          {t("logout")}
        </button>
      </motion.div>
    </div>
  );
}
