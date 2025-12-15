// src/pages/ResetPassword.jsx
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

export default function ResetPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email.trim()) {
      toast.error(t("enter_email_error"));
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) toast.error(t("reset_error"));
    else toast.success(t("reset_success"));

    setLoading(false);
  };

  return (
    <div
      className="min-h-screen w-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #FFE7E0 0%, #FFF3C2 50%, #FFFFFF 100%)",
      }}
    >
      {/* Reset Password Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-[90%] sm:w-full max-w-md bg-white/40 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-xl"
      >
        <h2 className="text-2xl font-bold text-slate-800 mb-3 text-center">
          {t("reset_title")}
        </h2>

        <p className="text-sm text-slate-600 text-center mb-6">
          {t("reset_subtitle")}
        </p>

        <form onSubmit={handleReset} className="space-y-4">
          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="email"
            placeholder={t("email_placeholder")}
            className="w-full p-3 rounded-lg bg-white/70 text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-200 text-slate-900 shadow-md hover:shadow-lg transition"
          >
            {loading ? t("sending") : t("send_reset_link")}
          </motion.button>
        </form>

        <div className="mt-4 text-sm text-center">
          <Link
            to="/login"
            className="text-amber-700 font-semibold hover:underline hover:text-orange-600 transition"
          >
            ⬅ {t("back_to_login")}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
