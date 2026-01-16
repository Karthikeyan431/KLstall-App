// src/pages/Profile.jsx
import React, { useEffect, useState, useRef, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { ThemeContext } from "../contexts/ThemeContext";

export default function Profile() {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const [ordersCount, setOrdersCount] = useState(0);
  const [joinedAt, setJoinedAt] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [about, setAbout] = useState("");
  const [address, setAddress] = useState("");

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [oldFilePath, setOldFilePath] = useState(null);

  const fileRef = useRef(null);

  /* ---------------- LOAD PROFILE ---------------- */
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate("/login");

      const [{ data: profile }, { data: orders }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("orders").select("id").eq("user_id", user.id)
      ]);

      if (profile) {
        setName(profile.full_name || "");
        setPhone(profile.phone || "");
        setAbout(profile.about || "");
        setAddress(profile.address || "");
        setAvatarPreview(profile.avatar_url || null);
        setAvatarUrl(profile.avatar_url || null);
        setOldFilePath(profile.avatar_url || null);
        if (profile.created_at) {
          setJoinedAt(new Date(profile.created_at).toLocaleDateString());
        }
      }

      setOrdersCount(orders?.length || 0);
      setLoading(false);
    }
    load();
  }, [navigate]);

  /* ---------------- AVATAR UPLOAD ---------------- */
  const handleFileChange = async (file) => {
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));

    const { data: { user } } = await supabase.auth.getUser();
    const filePath = `${user.id}/${Date.now()}-${file.name}`;

    await supabase.storage.from("Uploads").upload(filePath, file, { upsert: true });
    if (oldFilePath) await supabase.storage.from("Uploads").remove([oldFilePath]);

    const { data } = supabase.storage.from("Uploads").getPublicUrl(filePath);
    setAvatarUrl(data.publicUrl);
    setOldFilePath(filePath);

    await supabase.from("profiles").upsert({
      id: user.id,
      avatar_url: data.publicUrl
    });

    toast.success(t("profile_image_updated"));
  };

  /* ---------------- SAVE PROFILE ---------------- */
  const save = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from("profiles").upsert({
      id: user.id,
      full_name: name,
      phone,
      about,
      address,
      avatar_url: avatarUrl
    });

    setSaving(false);
    setEditOpen(false);
    toast.success(t("profile_saved"));
  };

  const pageBg =
    theme === "dark"
      ? "bg-[#0e0e0e] text-white"
      : "bg-gradient-to-b from-[#FFF5F9] to-[#FFE4EC] text-black";

  if (loading) return <div className={`min-h-screen ${pageBg}`} />;

  return (
    <div className={`min-h-screen ${pageBg}`}>
      {/* HEADER */}
      {/* ===== PROFILE HEADER ===== */}
      <div className="relative">
        <div
          className="h-44 rounded-b-[48px] overflow-hidden"
          style={{
            backgroundImage: `
              linear-gradient(
                to bottom right,
                rgba(255,102,196,0.85),
                rgba(255,159,159,0.85),
                rgba(255,222,89,0.85)
              ),
              url("https://i.ibb.co/93h2gF87/downloaded-Image-7.png")
            `,
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        />

  {/* Floating Avatar */}
  <div className="absolute left-1/2 -bottom-12 transform -translate-x-1/2">
    <div className="relative">
      <div className="w-28 h-28 rounded-full bg-white p-1 shadow-xl">
        <div className="w-full h-full rounded-full overflow-hidden border-4 border-white">
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              {t("no_avatar")}
            </div>
          )}
        </div>
      </div>

      {/* Change Avatar Overlay */}
      <button
        onClick={() => fileRef.current.click()}
        className="
          absolute inset-0
          rounded-full
          bg-black/40
          text-white
          text-sm
          opacity-0
          hover:opacity-100
          transition
        "
      >
        {t("change")}
      </button>

      <input
        type="file"
        ref={fileRef}
        hidden
        accept="image/*"
        onChange={(e) => handleFileChange(e.target.files[0])}
      />
    </div>
  </div>
</div>

{/* Spacer for avatar overlap */}
<div className="h-16" />

{/* Name & Role */}
<div className="flex flex-col items-center mt-2">
  <h2
    className="
      text-xl font-semibold
      bg-clip-text text-transparent
      bg-gradient-to-r
      from-[#FF66C4]
      to-[#FFDE59]
    "
  >
    {name}
  </h2>

  <p className="text-sm opacity-70 mt-1">
    Member · KL Stall
  </p>

  {/* Inline Premium Edit Button */}
  <button
    onClick={() => setEditOpen(true)}
    className="
      mt-4 px-6 py-2
      rounded-full
      text-sm font-medium
      border border-[#FF66C4]/40
      text-[#FF66C4]
      bg-white/70 dark:bg-white/5
      backdrop-blur-md
      shadow-sm
      hover:shadow-md
      transition
    "
  >
    {t("edit_profile")}
  </button>
</div>

      {/* STATS */}
      <div className="px-6 grid grid-cols-2 gap-4">
        <Stat label={t("orders")} value={ordersCount} />
        <Stat label={t("joined")} value={joinedAt} />
      </div>

      {/* INFO */}
      <div className="mt-8 px-6 space-y-5 text-sm">
        <Row label={t("full_name")} value={name} />
        <Row label={t("phone")} value={phone} />
        <Row label={t("address")} value={address} />
        <Row label={t("about_optional")} value={about || "—"} />
      </div>

      {/* ACTIONS */}
      <div className="mt-10 px-6 space-y-3">
        <Link
          to="/settings"
          className="
            block py-3 text-center rounded-xl
            border border-[#FF66C4]/30
            bg-white/50 dark:bg-white/5
            backdrop-blur-md
            hover:shadow-md
            transition
          "
        >
          {t("settings")}
        </Link>
        <Link
          to="/dashboard"
          className="
            block py-3 text-center rounded-xl
            border border-[#FF66C4]/30
            bg-white/50 dark:bg-white/5
            backdrop-blur-md
            hover:shadow-md
            transition
          "
        >
          {t("dashboard")}
        </Link>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            navigate("/login");
          }}
          className="
            w-full py-3 rounded-xl
            border border-red-400/40
            text-red-500
            bg-white/40 dark:bg-white/5
            backdrop-blur-md
            hover:shadow-md
            transition
          "
        >
          {t("logout")}
        </button>
      </div>

      {/* BOTTOM SHEET */}
      <AnimatePresence>
        {editOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setEditOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50
                         rounded-t-3xl
                         bg-white dark:bg-[#1b1b1b]
                         p-6"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
            >
              <h3 className="text-lg font-semibold mb-4">{t("edit_profile")}</h3>

              <div className="space-y-3">
                <input className="w-full p-3 rounded-xl border" value={name} onChange={(e) => setName(e.target.value)} />
                <input className="w-full p-3 rounded-xl border" value={phone} onChange={(e) => setPhone(e.target.value)} />
                <input className="w-full p-3 rounded-xl border" value={address} onChange={(e) => setAddress(e.target.value)} />
                <textarea className="w-full p-3 rounded-xl border" rows="3" value={about} onChange={(e) => setAbout(e.target.value)} />
              </div>

              <button
                disabled={saving}
                onClick={save}
                className="
                  w-full mt-5 py-3 rounded-xl
                  text-white font-semibold
                  bg-gradient-to-r from-[#FF66C4] to-[#FFDE59]
                  shadow-md
                  hover:shadow-lg
                  transition
                "
              >
                {saving ? t("saving") : t("save_profile")}
              </button>

              <button
                onClick={() => setEditOpen(false)}
                className="
                  w-full mt-2 py-3 rounded-xl
                  border border-gray-300
                  bg-white/60
                  hover:shadow
                  transition
                "
              >
                {t("cancel")}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- SMALL COMPONENTS ---------------- */

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="opacity-60">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-[#FF66C4]/30 p-4 text-center bg-white/40 dark:bg-white/5 backdrop-blur-md">
      <p className="text-xs opacity-60">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
