// src/pages/Packages.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { useCart } from "../contexts/CartContext"; // ✅ import global cart context

export default function Packages() {
  const [packages, setPackages] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [category, setCategory] = useState("All");
  const [cartPulse, setCartPulse] = useState(false);
  const navigate = useNavigate();

  // ✅ get global cart functions
  const { cartCount, addToCart, fetchCart } = useCart();

  const categories = ["All", "Stall", "Decoration", "DJ", "Venues"];

  // ✅ fetch all packages
  useEffect(() => {
    const fetchPackages = async () => {
      const { data, error } = await supabase.from("packages").select("*");
      if (error) {
        console.error("Error fetching packages:", error);
        return;
      }

      const withUrls = data.map((pkg) => {
        if (pkg.image_url && !pkg.image_url.startsWith("http")) {
          const { data: urlData } = supabase.storage
            .from("package-images")
            .getPublicUrl(pkg.image_url);
          return { ...pkg, image_url: urlData?.publicUrl || pkg.image_url };
        }
        return pkg;
      });

      setPackages(withUrls);
      setFilteredPackages(withUrls);
    };

    fetchPackages();
    fetchCart(); // ✅ make sure we sync the global cart
  }, [fetchCart]);

  // ✅ filtering, searching, sorting
  useEffect(() => {
    let result = [...packages];
    if (category !== "All") result = result.filter((pkg) => pkg.category === category);
    if (searchQuery)
      result = result.filter((pkg) =>
        (pkg.title || "").toLowerCase().includes(searchQuery.toLowerCase())
      );

    if (sortOption === "priceAsc") result.sort((a, b) => a.price - b.price);
    else if (sortOption === "priceDesc") result.sort((a, b) => b.price - a.price);
    else if (sortOption === "titleAsc") result.sort((a, b) => a.title.localeCompare(b.title));
    else if (sortOption === "titleDesc") result.sort((a, b) => b.title.localeCompare(a.title));

    setFilteredPackages(result);
  }, [searchQuery, sortOption, category, packages]);

  // ✅ add item to cart (global)
  const handleAddToCart = async (pkg) => {
    try {
      await addToCart(pkg);
      setCartPulse(true);
      setTimeout(() => setCartPulse(false), 300);
      toast.success("Added to cart 🛒");
    } catch (err) {
      console.error("Error adding to cart:", err);
      toast.error("Failed to add item!");
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#FFF5F9] text-[#1a1a1a] overflow-hidden">
      <Toaster position="bottom-center" reverseOrder={false} />
      <h1 className="text-3xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-[#FF66C4] to-[#FFDE59]">
        Our Packages
      </h1>

      {/* Categories */}
      <div className="flex justify-center flex-wrap gap-3 mb-6 max-w-screen-xl mx-auto">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-full font-semibold transition ${
              category === cat
                ? "bg-gradient-to-r from-[#FF66C4] to-[#FFDE59] text-white shadow-lg"
                : "bg-white text-[#1a1a1a] border border-[#FF66C4] hover:bg-[#FF66C4]/20"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search & Sort */}
      <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-4 mb-6 max-w-screen-xl mx-auto w-full px-4">
        <input
          type="text"
          placeholder="Search packages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-1/2 px-4 py-2 rounded-lg border border-[#FF66C4] focus:outline-none focus:ring-2 focus:ring-[#FF66C4]"
        />
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="w-full sm:w-1/3 px-4 py-2 rounded-lg border border-[#FF66C4] focus:outline-none focus:ring-2 focus:ring-[#FF66C4]"
        >
          <option value="">Sort By</option>
          <option value="priceAsc">Price: Low → High</option>
          <option value="priceDesc">Price: High → Low</option>
          <option value="titleAsc">Title: A → Z</option>
          <option value="titleDesc">Title: Z → A</option>
        </select>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-screen-xl mx-auto px-4 w-full">
        {filteredPackages.length === 0 ? (
          <p className="text-center col-span-full text-[#1a1a1a]">No packages found.</p>
        ) : (
          filteredPackages.map((pkg) => (
            <motion.div
              key={pkg.id}
              whileHover={{ scale: 1.05 }}
              className="rounded-xl shadow-md p-4 flex flex-col justify-between bg-white border border-[#FF66C4]/30 hover:shadow-lg"
            >
              <img
                src={pkg.image_url || "https://via.placeholder.com/400x250?text=No+Image"}
                alt={pkg.title}
                className="w-full h-40 object-cover rounded-lg mb-4"
              />
              <h2 className="text-xl font-semibold mb-2 break-words text-[#b9314f]">
                {pkg.title}
              </h2>
              <p className="mb-4 text-sm text-gray-700 break-words">
                {pkg.desc || pkg.description || ""}
              </p>
              <p className="text-lg font-bold mb-4 text-[#ff5858]">₹ {pkg.price}</p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAddToCart(pkg)}
                className="w-full px-4 py-2 rounded-full text-white font-semibold bg-gradient-to-r from-[#FF66C4] to-[#FFDE59] shadow-md hover:opacity-90"
              >
                Add to Cart 🛒
              </motion.button>
            </motion.div>
          ))
        )}
      </div>

      {/* Floating Cart Button */}
      {cartCount > 0 && (
        <motion.button
          onClick={() => navigate("/cart")}
          whileTap={{ scale: 0.95 }}
          animate={cartPulse ? { scale: [1, 1.12, 1] } : {}}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-[#FF66C4] to-[#FFDE59] text-[#1a1a1a] flex items-center justify-center gap-2 px-4 py-2 rounded-full shadow-lg"
        >
          🛒 Cart
          <span className="bg-[#1a1a1a] text-white text-sm px-2 py-1 rounded-full ml-2">
            {cartCount}
          </span>
        </motion.button>
      )}
    </div>
  );
}
