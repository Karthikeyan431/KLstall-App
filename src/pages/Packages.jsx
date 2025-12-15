import React, { useEffect, useState, useContext } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { useCart } from "../contexts/CartContext";
import { useTranslation } from "react-i18next";
import { ThemeContext } from "../contexts/ThemeContext";

export default function Packages() {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);

  const navigate = useNavigate();
  const { cartCount, addToCart, fetchCart } = useCart();

  const [packages, setPackages] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [category, setCategory] = useState("All");
  const [cartPulse, setCartPulse] = useState(false);

  const categories = ["All", "Stall", "Decoration", "Dj", "Venues"];

  /* Fetch Packages */
  useEffect(() => {
    const loadPackages = async () => {
      const { data } = await supabase.from("packages").select("*");

      const formatted = data.map((pkg) => {
        if (pkg.image_url && !pkg.image_url.startsWith("http")) {
          const { data: urlData } = supabase.storage
            .from("package-images")
            .getPublicUrl(pkg.image_url);
          return { ...pkg, image_url: urlData.publicUrl };
        }
        return pkg;
      });

      setPackages(formatted);
      setFilteredPackages(formatted);
    };

    loadPackages();
    fetchCart();
  }, []);

  /* Search + Sort + Category Filter */
  useEffect(() => {
    let result = [...packages];

    if (category !== "All")
      result = result.filter((p) => p.category === category);

    if (searchQuery)
      result = result.filter((p) =>
        (p.title || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );

    if (sortOption === "priceAsc") result.sort((a, b) => a.price - b.price);
    if (sortOption === "priceDesc") result.sort((a, b) => b.price - a.price);

    if (sortOption === "titleAsc")
      result.sort((a, b) => a.title.localeCompare(b.title));
    if (sortOption === "titleDesc")
      result.sort((a, b) => b.title.localeCompare(a.title));

    setFilteredPackages(result);
  }, [searchQuery, sortOption, category, packages]);

  const addToCartClick = async (pkg) => {
    try {
      await addToCart(pkg);
      setCartPulse(true);
      setTimeout(() => setCartPulse(false), 250);
      toast.success(t("added_to_cart"));
    } catch {
      toast.error(t("login_to_add"));
    }
  };

  /* Light/Dark Theme Classes */
  const pageBg =
    theme === "dark"
      ? "bg-[#0f0f0f] text-white"
      : "bg-gradient-to-b from-[#FFF5F9] to-[#FFE4EC] text-[#1a1a1a]";

  const cardClass =
    theme === "dark"
      ? "bg-[#1A1A1A] border border-[#FF66C4]/40 text-white"
      : "bg-white border border-[#FF66C4]/30 text-black";

  const buttonPrimary =
    theme === "dark"
      ? "bg-[#1A1A1A] border border-[#FF66C4] text-white hover:bg-[#2A2A2A]"
      : "bg-gradient-to-r from-[#FF66C4] to-[#FFDE59] text-white";

  const categoryButton = (active) =>
    active
      ? theme === "dark"
        ? "bg-[#FF66C4] text-white border border-[#FF66C4]"
        : "bg-gradient-to-r from-[#FF66C4] to-[#FFDE59] text-white"
      : theme === "dark"
      ? "bg-[#1A1A1A] border border-[#FF66C4] text-white"
      : "bg-white border border-[#FF66C4] text-[#1a1a1a]";

  return (
    <div className={`min-h-screen w-full px-4 py-10 flex flex-col items-center ${pageBg}`}>
      <Toaster />

      {/* Title */}
      <h1 className="text-3xl font-extrabold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-[#FF66C4] to-[#FFDE59]">
        {t("our_packages")}
      </h1>

      {/* Category Buttons */}
      <div className="flex flex-wrap justify-center gap-3 mb-6 max-w-screen-xl">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-full font-semibold transition ${categoryButton(
              category === cat
            )}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full max-w-screen-xl mb-6">
        <input
          type="text"
          placeholder={t("search_packages")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full sm:w-1/2 px-4 py-2 rounded-xl border focus:ring-2 ${
            theme === "dark"
              ? "bg-[#121212] border-[#FF66C4] text-white focus:ring-[#FF66C4]"
              : "bg-white border-[#FF66C4] text-black focus:ring-[#FF66C4]"
          }`}
        />

        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className={`w-full sm:w-1/3 px-4 py-2 rounded-xl border focus:ring-2 ${
            theme === "dark"
              ? "bg-[#121212] border-[#FF66C4] text-white focus:ring-[#FF66C4]"
              : "bg-white border-[#FF66C4] text-black focus:ring-[#FF66C4]"
          }`}
        >
          <option value="">{t("sort_by")}</option>
          <option value="priceAsc">{t("price_low_high")}</option>
          <option value="priceDesc">{t("price_high_low")}</option>
          <option value="titleAsc">{t("title_az")}</option>
          <option value="titleDesc">{t("title_za")}</option>
        </select>
      </div>

      {/* Package Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-screen-xl w-full">
        {filteredPackages.length === 0 ? (
          <p className="text-center w-full">{t("no_packages_found")}</p>
        ) : (
          filteredPackages.map((pkg) => (
            <motion.div
              key={pkg.id}
              whileHover={{ scale: 1.05 }}
              className={`rounded-xl shadow-lg p-4 flex flex-col justify-between transition ${cardClass}`}
            >
              <img
                src={pkg.image_url}
                alt={pkg.title}
                className="w-full h-40 object-cover rounded-lg mb-4"
              />

              <h2 className="text-xl font-bold mb-2">{pkg.title}</h2>

              <p className="text-sm mb-4 opacity-80">
                {pkg.desc || pkg.description}
              </p>

              <p className="text-lg font-bold text-[#ff5858] mb-4">
                ₹ {pkg.price}
              </p>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => addToCartClick(pkg)}
                className={`w-full py-2 rounded-full font-semibold shadow ${buttonPrimary}`}
              >
                {t("add_to_cart")}
              </motion.button>
            </motion.div>
          ))
        )}
      </div>

      {/* Floating Cart Button */}
      {cartCount > 0 && (
        <motion.button
          onClick={() => navigate("/cart")}
          animate={cartPulse ? { scale: [1, 1.18, 1] } : {}}
          whileTap={{ scale: 0.9 }}
          className={`fixed bottom-6 right-6 px-5 py-3 rounded-full shadow-lg font-bold flex items-center gap-2 ${
            buttonPrimary
          }`}
        >
          🛒 {t("cart_btn")}
          <span className="bg-black text-white text-sm px-2 py-1 rounded-full">
            {cartCount}
          </span>
        </motion.button>
      )}
    </div>
  );
}
