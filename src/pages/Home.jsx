// src/pages/Home.jsx
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

// small constants so it's easy to change later
const logoSrc = "https://i.ibb.co/FkYCyrW1/IMG-20250917-214439-removebg-preview.png";

const featureIcons = ["🎨", "💸", "🤝"];

const testimonials = [
  {
    quote:
      "The decorations were absolutely stunning! Our wedding looked magical and stress-free.",
    name: "Priya S.",
    location: "Chennai",
    rating: "⭐⭐⭐⭐⭐",
  },
  {
    quote:
      "Professional and very budget-friendly. They transformed our corporate event space perfectly.",
    name: "Ravi K.",
    location: "Event Organizer",
    rating: "⭐⭐⭐⭐⭐",
  },
  {
    quote:
      "Highly recommended! Their buffet stall design was a huge hit with all our guests.",
    name: "Arun M.",
    location: "Birthday Host",
    rating: "⭐⭐⭐⭐⭐",
  },
];

// simple framer-motion variants reused across the page
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
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#fff9f2] via-[#fff0e6] to-[#ffe8dd] text-gray-800 flex flex-col items-center">
      {/* HERO */}
      <section className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="flex flex-col items-center text-center">
          <motion.img
            src={logoSrc}
            alt="KL Stall & Decors"
            className="w-32 h-32 sm:w-40 sm:h-40 mb-3 drop-shadow-lg"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7 }}
          />

          <motion.p
            className="text-sm sm:text-base text-gray-600 mb-1 italic font-medium"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            Transforming events, inspiring memories
          </motion.p>

          <motion.h1
            className="text-4xl sm:text-5xl font-extrabold mb-3 bg-gradient-to-r from-[#D85A63] to-[#FF9B3A] bg-clip-text text-transparent"
            initial={{ y: -18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.7 }}
          >
            KL Stall & Decors
          </motion.h1>

          <motion.p
            className="max-w-3xl text-base sm:text-lg text-gray-700 leading-relaxed px-2"
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            Your one-stop solution for{" "}
            <span className="font-semibold text-[#D85A63]">event decorations</span>, buffet stalls, and complete event management.
            Bringing <span className="font-semibold text-[#FF8A3A]">style & creativity</span> to every celebration ✨
          </motion.p>

          <motion.div
            className="mt-6 flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <button
              onClick={() => navigate("/packages")}
              aria-label="View Packages"
              className="relative px-6 sm:px-8 py-3 rounded-full text-lg font-semibold text-white bg-gradient-to-r from-[#FF9B3A] to-[#E84E64] shadow-lg hover:shadow-2xl transition transform hover:-translate-y-0.5"
            >
              <span className="absolute -top-2 -right-3 text-xs bg-[#ff4b4b] text-white rounded-full px-2 py-0.5 shadow">
                New
              </span>
              View Packages
            </button>

            <button
              onClick={() => navigate("/contact")}
              aria-label="Get a Quote"
              className="px-6 sm:px-8 py-3 rounded-full text-lg font-semibold text-[#E84E64] border-2 border-[#E84E64] bg-white hover:bg-[#E84E64] hover:text-white transition"
            >
              Get a Quote
            </button>
          </motion.div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <motion.section
        className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-10 bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl mx-4"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.h2
          className="text-3xl sm:text-4xl font-extrabold mb-4 bg-gradient-to-r from-[#D85A63] to-[#FF9B3A] bg-clip-text text-transparent text-center"
          variants={itemVariants}
        >
          Why Choose Us?
        </motion.h2>

        <motion.p
          className="max-w-3xl mx-auto text-gray-700 text-base sm:text-lg mb-8 text-center"
          variants={itemVariants}
        >
          At <span className="font-semibold text-[#D85A63]">KL Stall & Decors</span>, we don’t just decorate — we create <span className="font-semibold text-[#FF8A3A]">immersive experiences</span>
          and ensure perfection in every detail.
        </motion.p>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={containerVariants}
        >
          {[
            {
              title: "Creative Designs",
              desc: "Unique, modern, and eye-catching decorations tailored to reflect your personal style and event theme.",
            },
            {
              title: "Affordable Packages",
              desc: "Flexible and transparent pricing with custom plans that perfectly fit your budget and event size without compromising on quality.",
            },
            {
              title: "Trusted Team",
              desc: "A team of experienced professionals dedicated to flawless execution, ensuring a smooth, memorable, and stress-free celebration.",
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              className="p-6 rounded-2xl bg-white shadow-md hover:shadow-2xl border border-transparent hover:border-pink-100 transition-all"
              variants={itemVariants}
              whileHover={{ scale: 1.03 }}
            >
              <div className="text-4xl mb-3">{featureIcons[idx]}</div>
              <h3 className="text-2xl font-bold text-[#D85A63] mb-2">{item.title}</h3>
              <p className="text-gray-700 text-sm leading-relaxed">{item.desc}</p>
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
            <div className="flex flex-col sm:flex-row items-center justify-between bg-gradient-to-r from-[#FFB84C] to-[#E85C6A] py-6 px-6 sm:px-8">
              <h3 className="text-white text-xl sm:text-2xl font-extrabold text-center sm:text-left">
                Ready to Plan Your Perfect Event?
              </h3>
              <button
                onClick={() => navigate("/contact")}
                className="mt-4 sm:mt-0 px-6 py-2 rounded-full bg-white text-[#E84E64] font-semibold shadow hover:shadow-xl transition"
              >
                Get a Free Consultation
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* TESTIMONIALS */}
      <motion.section
        className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-12 text-gray-800"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.h2
          className="text-3xl sm:text-4xl font-extrabold mb-8 text-center bg-gradient-to-r from-[#D85A63] to-[#FF9B3A] bg-clip-text text-transparent"
          variants={itemVariants}
        >
          What Our Clients Say
        </motion.h2>

        <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={containerVariants}>
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              className="p-6 bg-white rounded-2xl shadow-md border-l-4 border-[#FFB84C] flex flex-col justify-between"
              variants={itemVariants}
            >
              <blockquote className="italic text-gray-600 mb-4">"{t.quote}"</blockquote>
              <div>
                <p className="font-bold text-[#D85A63]">{t.name}</p>
                <p className="text-sm text-gray-500">{t.location}</p>
                <p className="text-yellow-500 mt-2">{t.rating}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* FOOTER */}
      <footer className="w-full py-6 mt-8 bg-white/50 text-gray-600 flex flex-col items-center text-sm border-t border-pink-50">
        <div className="flex flex-col sm:flex-row gap-2 items-center">
          <span>© {new Date().getFullYear()} KL Stall & Decors. All rights reserved.</span>
          <span className="hidden sm:inline">|</span>
          <span>Based in Chennai, India</span>
        </div>
        <span className="mt-1 text-[#D85A63] font-medium">Crafted with ♥</span>
      </footer>
    </div>
  );
}
