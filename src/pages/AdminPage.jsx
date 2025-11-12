// src/pages/AdminPage.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { motion } from "framer-motion";
import toast from "react-hot-toast"; // ✅ New

export default function AdminPage() {
  const [packages, setPackages] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState("Stall");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch packages
  async function fetchPackages() {
    setLoadingPackages(true);
    try {
      const { data, error } = await supabase
        .from("packages")
        .select("*")
        .order("id", { ascending: false });

      if (error) throw error;
      setPackages(data || []);
    } catch (err) {
      toast.error("⚠️ Could not load packages");
      console.error("Failed to fetch packages:", err);
    } finally {
      setLoadingPackages(false);
    }
  }

  useEffect(() => {
    fetchPackages();
  }, []);

  // Save (create or update)
  async function handleSave(e) {
    e.preventDefault();
    if (!title || !price) {
      toast.error("❌ Title and price are required!");
      return;
    }

    setSaving(true);

    try {
      let imageUrl = null;

      // Upload image if selected
      if (file) {
        const fileName = `${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("package-images")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: publicData, error: urlError } = await supabase.storage
          .from("package-images")
          .getPublicUrl(fileName);

        if (urlError) throw urlError;
        imageUrl = publicData.publicUrl;
      }

      // Payload
      const payload = {
        title,
        description: desc,
        price: Number(price),
        category,
        is_active: isActive,
        ...(imageUrl ? { image_url: imageUrl } : {}),
      };

      if (editingId) {
        const { error } = await supabase.from("packages").update(payload).eq("id", editingId);
        if (error) throw error;
        toast.success("✅ Package updated successfully!");
      } else {
        const { error } = await supabase.from("packages").insert([payload]);
        if (error) throw error;
        toast.success("🎉 Package added successfully!");
      }

      // Reset form
      setEditingId(null);
      setTitle("");
      setDesc("");
      setPrice("");
      setFile(null);
      setCategory("Stall");
      setIsActive(true);
      await fetchPackages();
    } catch (err) {
      console.error("Error saving package:", err);
      toast.error("❌ Error saving package!");
    } finally {
      setSaving(false);
    }
  }

  // Delete package
  async function handleDelete(id, image_url) {
    if (!confirm("Are you sure you want to delete this package?")) return;
    try {
      const { error } = await supabase.from("packages").delete().eq("id", id);
      if (error) throw error;
      toast.success("🗑️ Package deleted successfully!");
      fetchPackages();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("❌ Could not delete package.");
    }
  }

  // Edit setup
  function handleEdit(pkg) {
    setEditingId(pkg.id);
    setTitle(pkg.title || "");
    setDesc(pkg.description || "");
    setPrice(pkg.price ?? "");
    setCategory(pkg.category || "Stall");
    setIsActive(typeof pkg.is_active === "boolean" ? pkg.is_active : true);
    setFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Search filter
  const filteredPackages = packages.filter(
    (pkg) =>
      pkg.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(pkg.price).includes(searchTerm)
  );

  return (
    <div className="w-full flex flex-col items-center py-10 px-4">
      {/* Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/90 backdrop-blur-xl border border-[#D6A354] shadow-2xl rounded-2xl p-8 w-full max-w-lg mb-10"
      >
        <h1 className="text-3xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-[#92400E] to-[#D97706] mb-6">
          {editingId ? "Edit Package" : "Admin — Add Package"}
        </h1>

        <form onSubmit={handleSave} className="space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Package Title"
            required
            className="w-full border border-[#D6A354] rounded-lg p-3 focus:ring-2 focus:ring-[#D97706] focus:outline-none"
          />

          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Description"
            rows={3}
            className="w-full border border-[#D6A354] rounded-lg p-3 focus:ring-2 focus:ring-[#92400E] focus:outline-none"
          />

          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Price"
            required
            className="w-full border border-[#D6A354] rounded-lg p-3 focus:ring-2 focus:ring-[#D97706] focus:outline-none"
          />

          <div className="flex gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex-1 border border-[#D6A354] rounded-lg p-3 focus:ring-2 focus:ring-[#92400E] focus:outline-none"
            >
              <option value="Stall">Stall</option>
              <option value="Decoration">Decoration</option>
              <option value="DJ">DJ</option>
              <option value="Venues">Venues</option>
            </select>

            <label className="flex items-center gap-2 px-3 border border-[#D6A354] rounded-lg bg-white">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Active</span>
            </label>
          </div>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full border border-[#D6A354] rounded-lg p-2 cursor-pointer bg-white hover:bg-[#FAF7F2] transition"
          />

          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={saving}
              className={`flex-1 py-3 rounded-lg text-white font-semibold transition ${
                saving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#92400E] to-[#D97706] hover:opacity-90"
              }`}
            >
              {saving
                ? editingId
                  ? "Updating..."
                  : "Adding..."
                : editingId
                ? "Update Package"
                : "Add Package"}
            </motion.button>

            {editingId ? (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setTitle("");
                  setDesc("");
                  setPrice("");
                  setFile(null);
                  setCategory("Stall");
                  setIsActive(true);
                }}
                className="px-4 py-3 rounded-lg border border-red-400 text-red-600"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </motion.div>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search packages by name, category, or price..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full max-w-md mb-8 p-3 rounded-lg border border-[#D6A354] bg-white/90 backdrop-blur-md placeholder-gray-500 focus:ring-2 focus:ring-[#92400E] focus:outline-none"
      />

      {/* Packages Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
        {loadingPackages ? (
          <div className="col-span-full text-center py-20 text-gray-600">
            Loading packages...
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="col-span-full text-center py-20 text-gray-600">
            No packages found.
          </div>
        ) : (
          filteredPackages.map((pkg) => (
            <motion.div
              key={pkg.id}
              whileHover={{ scale: 1.02 }}
              className="bg-white/80 backdrop-blur-lg border border-[#D6A354] rounded-xl shadow-lg p-4 flex flex-col items-center text-center"
            >
              <img
                src={
                  pkg.image_url ||
                  "https://via.placeholder.com/400x250?text=No+Image"
                }
                alt={pkg.title}
                className="w-full h-40 object-cover rounded-lg mb-3"
              />
              <h3 className="font-bold text-lg text-[#92400E]">
                {pkg.title}
              </h3>
              <p className="text-sm text-gray-600 mb-1">{pkg.description}</p>
              <p className="font-semibold text-[#D97706] mb-2">
                ₹{pkg.price}
              </p>
              <p className="text-xs bg-[#F9E6C5] px-3 py-1 rounded-full mb-3">
                {pkg.category}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => handleEdit(pkg)}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(pkg.id, pkg.image_url)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
