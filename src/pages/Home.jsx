// src/pages/Home.jsx
import React, { useEffect, useState, useContext } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "../lib/supabase";
import { ThemeContext } from "../contexts/ThemeContext";
import { Helmet } from "react-helmet-async";

const logoSrc =
  "https://i.ibb.co/FkYCyrW1/IMG-20250917-214439-removebg-preview.png";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.48 } },
};

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);

  const [profileName, setProfileName] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData?.user;
        if (!user) return;

        const { data } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();

        setProfileName(data?.full_name || "");
      } catch (err) {
        // silent fail (not critical)
        console.warn("Profile load error:", err);
      }
    };
    loadProfile();
  }, []);

  const featureIcons = ["🎨", "💸", "🤝"];

  const testimonials = [
    {
      quote: t("t1_quote"),
      name: t("t1_name"),
      location: t("t1_location"),
      rating: t("t1_rating"),
    },
    {
      quote: t("t2_quote"),
      name: t("t2_name"),
      location: t("t2_location"),
      rating: t("t2_rating"),
    },
    {
      quote: t("t3_quote"),
      name: t("t3_name"),
      location: t("t3_location"),
      rating: t("t3_rating"),
    },
  ];

  const features = [
    { title: t("feature_1_title"), desc: t("feature_1_desc") },
    { title: t("feature_2_title"), desc: t("feature_2_desc") },
    { title: t("feature_3_title"), desc: t("feature_3_desc") },
  ];

  // Theme-aware classes
  const pageBg =
    theme === "dark"
      ? "bg-[#121212] text-white"
      : "bg-gradient-to-br from-[#fff9f2] via-[#fff0e6] to-[#ffe8dd] text-gray-800";

  const heroCardBg = theme === "dark" ? "bg-[#1A1A1A]/60" : "bg-transparent";

  // Gradient button is kept even in dark mode to match KL Stall brand
  const primaryButton =
    "relative px-6 sm:px-8 py-3 rounded-full text-lg font-semibold text-white bg-gradient-to-r from-[#FF9B3A] to-[#E84E64] shadow-md hover:opacity-95 transition";

  const outlineButton =
    theme === "dark"
      ? "px-6 sm:px-8 py-3 rounded-full text-lg font-semibold border-2 border-[#E84E64] text-[#E84E64] bg-transparent hover:bg-[#ffffff0a] transition"
      : "px-6 sm:px-8 py-3 rounded-full text-lg font-semibold text-[#E84E64] border-2 border-[#E84E64] bg-white hover:bg-[#E84E64] hover:text-white transition";

  return (
    <>
      <Helmet>
        <title>KL Stall | Smart Stall Management App</title>
        <meta
          name="description"
          content="KL Stall is a smart web application for managing stalls, packages, orders, and customer interactions efficiently."
        />
      </Helmet>

    <div className={`min-h-screen w-full flex flex-col items-center ${pageBg}`}>
      {/* HERO */}
      <section className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 pt-20 pb-8">
        <div className="flex flex-col items-center text-center">
          <motion.img
            src={logoSrc}
            alt={t("brand")}
            className="w-32 h-32 sm:w-40 sm:h-40 mb-3 drop-shadow-lg"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7 }}
          />

          <motion.p
            className={`text-sm sm:text-base mb-1 italic font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            {t("hero_tagline")}
          </motion.p>

          <motion.h1
            className="text-4xl sm:text-5xl font-extrabold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-[#D85A63] to-[#FF9B3A]"
            initial={{ y: -18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.7 }}
          >
            {t("brand")}
          </motion.h1>

          <motion.p
            className={`max-w-3xl text-base sm:text-lg leading-relaxed px-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            {t("hero_description_part1")}{" "}
            <span className="font-semibold text-[#D85A63]">
              {t("hero_event_decor")}
            </span>
            , {t("hero_event_tail")}{" "}
            <span className="font-semibold text-[#FF8A3A]">
              {t("hero_event_tail_bold")}
            </span>{" "}
            {t("hero_event_tail_after")}
          </motion.p>

          {/* BUTTONS */}
          <motion.div
            className="mt-6 flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <button
              onClick={() => navigate("/packages")}
              className={primaryButton}
              aria-label={t("view_packages")}
            >
              <span className="absolute -top-2 -right-3 text-xs bg-[#ff4b4b] text-white rounded-full px-2 py-0.5 shadow">
                New
              </span>
              {t("view_packages")}
            </button>

            <button
              onClick={() => navigate("/contact")}
              className={outlineButton}
              aria-label={t("get_a_quote")}
            >
              {t("get_a_quote")}
            </button>
          </motion.div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <motion.section
        className={`w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-10 rounded-3xl shadow-xl mx-4 ${theme === "dark" ? "bg-[#0f0f0f]/60" : "bg-white/70 backdrop-blur-sm"}`}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.h2
          className="text-3xl sm:text-4xl font-extrabold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-[#D85A63] to-[#FF9B3A]"
          variants={itemVariants}
        >
          {t("why_title")}
        </motion.h2>

        <motion.p
          className={`max-w-3xl mx-auto text-base sm:text-lg mb-8 text-center ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
          variants={itemVariants}
        >
          {t("why_desc")}
        </motion.p>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={containerVariants}
        >
          {features.map((item, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ scale: 1.03 }}
              className={`p-6 rounded-2xl transition-shadow ${theme === "dark" ? "bg-[#1A1A1A] border border-[#FF66C4]/20 shadow-lg" : "bg-white shadow-md hover:shadow-2xl"}`}
            >
              <div className="text-4xl mb-3">{featureIcons[idx]}</div>
              <h3 className={`text-2xl font-bold mb-2 ${theme === "dark" ? "text-[#FF9B3A]" : "text-[#D85A63]"}`}>
                {item.title}
              </h3>
              <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-700"} text-sm leading-relaxed`}>
                {item.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* CTA */}
      <motion.div
        className="w-full mt-10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="w-full rounded-xl overflow-hidden shadow-lg">
            <div className="flex flex-col sm:flex-row items-center justify-between py-6 px-6 sm:px-8 rounded-xl" style={{ background: theme === "dark" ? "linear-gradient(90deg,#2b2b2b,#1a1a1a)" : undefined }}>
              <h3 className={`text-[#E84E64] text-xl sm:text-2xl font-extrabold text-center sm:text-left ${theme === "dark" ? "" : ""}`}>
                {t("cta_title")}
              </h3>

              <button
                onClick={() => navigate("/contact")}
                className="mt-4 sm:mt-0 px-6 py-2 rounded-full bg-[#ff4b4b] text-white font-semibold shadow hover:bg-gray-100 transition"
              >
                {t("cta_button")}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* TESTIMONIALS */}
      <motion.section
        className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-12"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
      >
        <motion.h2
          className="text-3xl sm:text-4xl font-extrabold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-[#D85A63] to-[#FF9B3A]"
          variants={itemVariants}
        >
          {t("testimonials_title")}
        </motion.h2>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={containerVariants}
        >
          {testimonials.map((tst, i) => (
            <motion.div
              key={i}
              className={`p-6 rounded-2xl flex flex-col justify-between ${theme === "dark" ? "bg-[#1A1A1A] border border-[#FF66C4]/12 text-gray-200" : "bg-white rounded-2xl border-l-4 border-[#FFB84C]"}`}
              variants={itemVariants}
            >
              <blockquote className={`italic mb-4 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                "{tst.quote}"
              </blockquote>
              <div>
                <p className={`font-bold ${theme === "dark" ? "text-[#FF9B3A]" : "text-[#D85A63]"}`}>{tst.name}</p>
                <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>{tst.location}</p>
                <p className="text-yellow-500 mt-2">{tst.rating}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* FOOTER */}
      <footer className={`w-full py-6 mt-8 flex flex-col items-center text-sm ${theme === "dark" ? "bg-[#0f0f0f] text-gray-300 border-t border-gray-800" : "bg-white/50 text-gray-600 border-t border-pink-50"}`}>
        <div className="flex flex-col sm:flex-row gap-2 items-center">
          <span>
            {t("footer_copyright", {
              year: new Date().getFullYear(),
            })}
          </span>
          <span className="hidden sm:inline">|</span>
          <span>{t("footer_based")}</span>
        </div>

        <span className="mt-1 text-[#D85A63] font-medium">
          {t("footer_crafted")}
        </span>
      </footer>
    </div>
   </>
  );
}
