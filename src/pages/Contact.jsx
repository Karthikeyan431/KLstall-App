// src/pages/Contact.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { FaInstagram, FaFacebook, FaWhatsapp, FaCheckCircle } from "react-icons/fa";

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const res = await fetch("http://localhost:5000/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("✅ Message sent successfully!");
        setFormData({ name: "", email: "", message: "" });
        setSuccess(true);
      } else {
        toast.error("❌ Failed to send message. Try again!");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("⚠️ Something went wrong. Try again!");
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative min-h-screen flex flex-col items-center justify-center
                 bg-gradient-to-br from-yellow-50 via-pink-50 to-yellow-100 px-6 py-10"
    >
      <Toaster position="top-center" />

      {/* Background Glow Animation */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute w-96 h-96 bg-yellow-300 opacity-20 rounded-full blur-3xl"
      />

      {/* Contact Card */}
      <div className="relative z-10 bg-white/70 backdrop-blur-xl shadow-2xl
                      rounded-3xl border border-yellow-100 max-w-md w-full p-8">
        <h2 className="text-3xl font-bold text-center text-gray-700 mb-6">
          Contact Us
        </h2>

        {/* Success Check Animation */}
        {success && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="flex justify-center mb-4"
          >
            <FaCheckCircle className="text-green-500 text-5xl" />
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2
                       focus:ring-yellow-400 outline-none"
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2
                       focus:ring-yellow-400 outline-none"
          />
          <textarea
            name="message"
            placeholder="Your Message"
            value={formData.message}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-200 rounded-xl h-32 resize-none
                       focus:ring-2 focus:ring-yellow-400 outline-none"
          ></textarea>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl text-white font-bold transition
                        ${loading ? "bg-yellow-300 cursor-wait" : "bg-yellow-400 hover:bg-yellow-500"}`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="w-5 h-5 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
                Sending...
              </span>
            ) : (
              "Send Message"
            )}
          </button>
        </form>

        {/* Contact Info */}
        <div className="mt-8 text-center text-gray-600 text-sm space-y-1">
          <p>📧 klstall.decors@gmail.com</p>
          <p>📞 +91 95660 61075</p>
          <p>📍 Thirukkazhukundram, India</p>
        </div>

        {/* Social Links with Animation */}
        <div className="flex justify-center gap-6 mt-5 text-2xl text-yellow-500">
          <motion.a
            href="https://www.instagram.com/kl_stall.decors?igsh=eTNnOTRlMWk0MWRr"
            whileHover={{ scale: 1.3, rotate: 5, color: "#eab308" }}
            transition={{ type: "spring", stiffness: 300 }}
            className="hover:drop-shadow-md"
          >
            <FaInstagram />
          </motion.a>
          <motion.a
            href="https://www.facebook.com/share/1J2tTsSBn9/"
            whileHover={{ scale: 1.3, rotate: -5, color: "#1877F2" }}
            transition={{ type: "spring", stiffness: 300 }}
            className="hover:drop-shadow-md"
          >
            <FaFacebook />
          </motion.a>
          <motion.a
            href="https://wa.me/919566061075?text=Hi%2C%20I%27m%20interested%20in%20your%20service."
            whileHover={{ scale: 1.3, rotate: 3, color: "#25D366" }}
            transition={{ type: "spring", stiffness: 300 }}
            className="hover:drop-shadow-md"
          >
            <FaWhatsapp />
          </motion.a>
        </div>
      </div>
    </motion.div>
  );
}
