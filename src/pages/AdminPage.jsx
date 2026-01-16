// src/pages/AdminPage.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function AdminPage() {
  /* ================= TAB ================= */
  const [activeTab, setActiveTab] = useState("PACKAGES");

  /* ================= PACKAGES (UNCHANGED LOGIC) ================= */
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

  /* ================= ORDERS ================= */
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orderSearch, setOrderSearch] = useState("");

  /* ================= FETCH PACKAGES ================= */
  async function fetchPackages() {
    setLoadingPackages(true);
    try {
      const { data, error } = await supabase
        .from("packages")
        .select("*")
        .order("id", { ascending: false });
      if (error) throw error;
      setPackages(data || []);
    } catch {
      toast.error("Could not load packages");
    } finally {
      setLoadingPackages(false);
    }
  }

  /* ================= FETCH ORDERS ================= */
  async function fetchOrders() {
    setLoadingOrders(true);
    try {
      const { data: ordersData, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!ordersData?.length) return setOrders([]);

      const userIds = [
        ...new Set(ordersData.map(o => o.user_id).filter(Boolean)),
      ];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, phone")
        .in("id", userIds);

      const merged = ordersData.map(o => {
        const p = profiles?.find(x => x.id === o.user_id);
        return {
          ...o,
          customer_name: p?.full_name || "Customer",
          customer_phone: p?.phone || "-",
        };
      });

      setOrders(merged);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoadingOrders(false);
    }
  }

  useEffect(() => {
    fetchPackages();
    fetchOrders();
  }, []);

  /* ================= PACKAGE SAVE (UNCHANGED) ================= */
  async function handleSave(e) {
    e.preventDefault();
    if (!title || !price) return toast.error("Title & price required");

    setSaving(true);
    try {
      let imageUrl = null;

      if (file) {
        const fileName = `${Date.now()}_${file.name}`;
        await supabase.storage.from("package-images").upload(fileName, file);
        imageUrl =
          supabase.storage.from("package-images").getPublicUrl(fileName).data
            .publicUrl;
      }

      const payload = {
        title,
        description: desc,
        price: Number(price),
        category,
        is_active: isActive,
        ...(imageUrl ? { image_url: imageUrl } : {}),
      };

      if (editingId) {
        await supabase.from("packages").update(payload).eq("id", editingId);
        toast.success("Package updated");
      } else {
        await supabase.from("packages").insert([payload]);
        toast.success("Package added");
      }

      setEditingId(null);
      setTitle("");
      setDesc("");
      setPrice("");
      setFile(null);
      setCategory("Stall");
      setIsActive(true);
      fetchPackages();
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this package?")) return;
    await supabase.from("packages").delete().eq("id", id);
    toast.success("Package deleted");
    fetchPackages();
  }

  function handleEdit(pkg) {
    setEditingId(pkg.id);
    setTitle(pkg.title || "");
    setDesc(pkg.description || "");
    setPrice(pkg.price ?? "");
    setCategory(pkg.category || "Stall");
    setIsActive(pkg.is_active ?? true);
    setFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ================= ORDER ACTIONS ================= */
  async function markPaid(id) {
    await supabase.from("orders").update({ payment_status: "paid" }).eq("id", id);
    toast.success("Marked as paid");
    fetchOrders();
  }

  async function cancelOrder(id) {
    if (!confirm("Cancel this order?")) return;
    await supabase
      .from("orders")
      .update({ status: "cancelled", cancelled: true })
      .eq("id", id);
    toast.success("Order cancelled");
    fetchOrders();
  }

  /* ================= FILTER ================= */
  const filteredPackages = packages.filter(
    (p) =>
      p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrders = orders.filter(o => {
    const q = orderSearch.toLowerCase();
    return (
      o.customer_name?.toLowerCase().includes(q) ||
      o.customer_phone?.toLowerCase().includes(q) ||
      o.payment_status?.toLowerCase().includes(q) ||
      o.payment_method?.toLowerCase().includes(q)
    );
  });

  /* ================= UI HELPERS ================= */
  const statusColor = (s) =>
    ({
      paid: "bg-green-100 text-green-700",
      unpaid: "bg-yellow-100 text-yellow-700",
      pending: "bg-orange-100 text-orange-700",
      refunded: "bg-blue-100 text-blue-700",
      cancelled: "bg-red-100 text-red-700",
    }[s] || "bg-gray-100 text-gray-600");
   const orderStatusColor = (s) =>
    ({
      pending: "bg-orange-100 text-orange-700",
      confirmed: "bg-blue-100 text-blue-700",
      success: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
      completed: "bg-emerald-100 text-emerald-700",
    }[s] || "bg-gray-100 text-gray-600");

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      {/* TABS */}
      <div className="flex gap-4 mb-8">
        {["PACKAGES", "ORDERS"].map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-6 py-2 rounded-full font-semibold transition ${
              activeTab === t
                ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow"
                : "bg-gray-200"
            }`}
          >
            {t === "PACKAGES" ? "Packages Management" : "Orders Management"}
          </button>
        ))}
      </div>
      {/* ================= PACKAGES TAB (UNCHANGED UI) ================= */}
      {activeTab === "PACKAGES" && (
        <>
          {/* 🔴 YOUR EXISTING PACKAGES UI – SAME AS BEFORE */}
          {/* Form, search, grid (intentionally not altered visually) */}
          {/* (Logic already above, UI same as your old file) */}
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
        </>
      )}


      {/* ================= ORDERS TAB (PREMIUM UI) ================= */}
{activeTab === "ORDERS" && (
  <>
    <input
      value={orderSearch}
      onChange={(e) => setOrderSearch(e.target.value)}
      placeholder="Search by name / phone / payment"
      className="mb-6 w-full max-w-md p-3 rounded-xl border shadow-sm"
    />

    {loadingOrders ? (
      <p>Loading orders...</p>
    ) : filteredOrders.length === 0 ? (
      <p>No orders found</p>
    ) : (
      <div className="space-y-4">
        {filteredOrders.map((o) => {
          const isCancelled = (o.status || "").toLowerCase() === "cancelled";

          return (
            <motion.div
              key={o.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-md p-5 flex justify-between gap-4"
            >
              <div className="space-y-1">
                <h3 className="font-bold text-lg">{o.customer_name}</h3>
                <p className="text-sm text-gray-600">{o.customer_phone}</p>

                <div className="flex gap-2 flex-wrap mt-2">
                  <span className="px-3 py-1 text-xs rounded-full bg-indigo-100 text-indigo-700">
                    {o.payment_method}
                  </span>

                  <span className="px-3 py-1 text-xs rounded-full bg-purple-100 text-purple-700">
                    {o.payment_type}
                  </span>

                  <span
                    className={`px-3 py-1 text-xs rounded-full ${statusColor(
                      o.payment_status
                    )}`}
                  >
                    {o.payment_status}
                  </span>

                  {/* ✅ ORDER STATUS */}
                  <span
                    className={`px-3 py-1 text-xs rounded-full ${orderStatusColor(
                      (o.status || "").toLowerCase()
                    )}`}
                  >
                    Order: {o.status || "-"}
                  </span>
                </div>

                <p className="mt-3 font-semibold text-xl">₹{o.total}</p>
                <p className="text-xs text-gray-500">Order ID: {o.id}</p>
              </div>

              <div className="flex flex-col gap-2 min-w-[140px]">
                {/* If cancelled disable actions */}
                {!isCancelled && o.payment_status !== "paid" && (
                  <button
                    onClick={() => markPaid(o.id)}
                    className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 transition"
                  >
                    Mark Paid
                  </button>
                )}

                <button
                  onClick={() => cancelOrder(o.id)}
                  className={`px-4 py-2 rounded-xl text-white transition ${
                    isCancelled
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-500 hover:bg-red-600"
                  }`}
                  disabled={isCancelled}
                >
                  {isCancelled ? "Cancelled" : "Cancel"}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    )}
   </>  
)}
</div>
  );
}
