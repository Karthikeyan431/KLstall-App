// src/pages/Profile.jsx
import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({});
  const [stats, setStats] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [about, setAbout] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [oldFilePath, setOldFilePath] = useState(null);
  const fileRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error && error.code !== "PGRST116") console.error(error);

      if (mounted) {
        setProfile(data ?? {});
        setName(data?.full_name ?? "");
        setPhone(data?.phone ?? "");
        setAbout(data?.about ?? "");
        setAvatarPreview(data?.avatar_url ?? null);
        await loadStats();
        setLoading(false);
      }
    }
    loadProfile();
    return () => (mounted = false);
  }, [navigate]);

  async function loadStats() {
    try {
      const { data, error } = await supabase.from("orders").select("*");
      if (error) throw error;
      if (data) {
        const completed = data.filter((o) => o.status === "completed").length;
        const pending = data.filter((o) => o.status === "pending").length;
        const total = data.length;
        setStats({ total, completed, pending });
      }
    } catch (err) {
      console.error("Stats load failed:", err);
    }
  }

  async function uploadAvatar(file, userId) {
    if (!file) return null;
    const filePath = `${userId}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("Uploads")
      .upload(filePath, file, { upsert: true });
    if (uploadError) throw uploadError;

    if (oldFilePath) {
      try {
        await supabase.storage.from("Uploads").remove([oldFilePath]);
      } catch (e) {
        console.warn("Old file remove failed", e);
      }
    }

    setOldFilePath(filePath);
    const { data } = supabase.storage.from("Uploads").getPublicUrl(filePath);
    return data.publicUrl;
  }

  const handleFileChange = async (file) => {
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const publicUrl = await uploadAvatar(file, user.id);
      setProfile((p) => ({ ...p, avatar_url: publicUrl }));
      await supabase.from("profiles").upsert({
        id: user.id,
        avatar_url: publicUrl,
      });
      alert("Profile image updated ✅");
    } catch (err) {
      alert("Upload failed: " + (err.message || err));
    }
  };

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: name,
      phone,
      about,
      avatar_url: profile?.avatar_url ?? null,
    });

    if (error) alert(error.message);
    else alert("Profile Saved ✅");
    setSaving(false);
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF5F9] text-[#1a1a1a] text-lg">
        Loading your profile...
      </div>
    );

  const completion = Math.round(
    (["name", "phone", "avatar_url", "about"].filter(
      (f) =>
        f &&
        (profile[f] ||
          (f === "name" && name) ||
          (f === "phone" && phone) ||
          (f === "about" && about))
    ).length /
      4) *
      100
  );

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#FFF5F9] to-[#ffe8f0] flex flex-col items-center px-4 py-8 sm:px-6 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-lg sm:max-w-2xl bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl p-5 sm:p-8"
      >
        {/* Header */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-center bg-gradient-to-r from-pink-600 to-red-500 bg-clip-text text-transparent mb-6">
          Your Profile
        </h2>

        {/* Avatar Section */}
        <div className="flex flex-col sm:flex-row items-center gap-5 mb-8 text-center sm:text-left">
          <div className="relative group">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-pink-400 shadow-lg mx-auto sm:mx-0">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="avatar"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                  No Avatar
                </div>
              )}
            </div>
            <div
              onClick={() => fileRef.current?.click()}
              className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs cursor-pointer transition"
            >
              Change
            </div>
            <input
              type="file"
              ref={fileRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files[0])}
            />
          </div>

          <div className="flex-1 w-full">
            <p className="text-gray-700 font-medium mb-1 text-sm sm:text-base">
              Profile Completion
            </p>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-pink-500 to-red-500 h-full"
                style={{ width: `${completion}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">{completion}% complete</p>
          </div>
        </div>

        {/* Form Section */}
        <form onSubmit={save} className="grid gap-4">
          <input
            className="p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-400 focus:outline-none text-sm sm:text-base"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
          />
          <input
            className="p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-400 focus:outline-none text-sm sm:text-base"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone number"
          />
          <textarea
            className="p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-400 focus:outline-none text-sm sm:text-base"
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            placeholder="About you (optional)"
            rows={3}
          />

          <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-3">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="w-full sm:w-auto px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition text-sm sm:text-base"
            >
              ← Back
            </button>
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-6 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold hover:opacity-90 transition text-sm sm:text-base"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>

        {/* Stats Section */}
        <div className="mt-10">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 text-center">
            Dashboard Overview
          </h3>

          {!stats ? (
            <p className="text-center text-gray-500 text-sm">Loading stats...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Total Orders", value: stats.total, color: "from-pink-400 to-red-400" },
                { label: "Completed", value: stats.completed, color: "from-green-400 to-emerald-400" },
                { label: "Pending", value: stats.pending, color: "from-yellow-400 to-orange-400" },
              ].map((card, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  className={`p-4 rounded-2xl text-center text-white shadow-lg bg-gradient-to-br ${card.color}`}
                >
                  <p className="text-base font-semibold">{card.label}</p>
                  <p className="text-xl sm:text-2xl font-bold">{card.value}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full sm:w-auto px-6 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold shadow-md hover:opacity-90 transition text-sm sm:text-base"
          >
            Go to Dashboard
          </button>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              navigate("/login");
            }}
            className="w-full sm:w-auto px-6 py-2 rounded-xl border border-gray-400 text-gray-700 hover:bg-gray-100 transition text-sm sm:text-base"
          >
            Logout
          </button>
        </div>
      </motion.div>
    </div>
  );
}
