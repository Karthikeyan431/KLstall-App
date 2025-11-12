// src/pages/AdminPackages.jsx
import React, { useState } from "react";
import { supabase } from "../lib/supabase";

export default function AdminPackages() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleAdd(e) {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl = null;

      if (file) {
        const fileName = `${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("package-images")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: publicData } = supabase.storage
          .from("package-images")
          .getPublicUrl(fileName);

        imageUrl = publicData.publicUrl;
      }

      const { error: insertError } = await supabase
        .from("packages")
        .insert([{ title, description: desc, price, image_url: imageUrl }]);

      if (insertError) throw insertError;

      alert("✅ Package added successfully!");
      setTitle("");
      setDesc("");
      setPrice("");
      setFile(null);
    } catch (err) {
      console.error("Error adding package:", err);
      alert("Error: " + (err.message || JSON.stringify(err)));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#FFF5F9] text-[#1a1a1a] overflow-hidden">
      {/* Removed border and kept soft shadow only */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-8 w-full max-w-lg animate-fadeIn">
        <h2 className="text-3xl font-extrabold text-center mb-6 text-orange-800">
          Admin — Add Package
        </h2>

        <form onSubmit={handleAdd} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Package Title"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Description
            </label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Description"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Price (₹)
            </label>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter price"
              type="number"
              step="0.01"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Upload Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-orange-700 file:text-white hover:file:bg-orange-600 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-bold text-lg text-white transition-all duration-300 shadow-lg ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-orange-700 to-amber-500 hover:scale-105 hover:shadow-lg"
            }`}
          >
            {loading ? "Adding..." : "Add Package"}
          </button>
        </form>
      </div>
    </div>
  );
}
