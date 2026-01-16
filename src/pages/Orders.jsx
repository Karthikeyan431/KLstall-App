// src/pages/Orders.jsx
import React, { useEffect, useState, useContext, useMemo } from "react";
import { supabase } from "../lib/supabase";
import toast, { Toaster } from "react-hot-toast";
import { ThemeContext } from "../contexts/ThemeContext";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";

/* ---------------- CONSTANTS ---------------- */
const LOGO_URL =
  "https://i.ibb.co/qMw20Rfy/IMG-20250917-214439-removebg-preview.png";
const CONTACT_PHONE = "9566061075 / 8220584194";
const CONTACT_EMAIL = "klstall.decors@gmail.com";

export default function Orders() {
  const { theme } = useContext(ThemeContext);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pdfId, setPdfId] = useState(null);
  const [actionId, setActionId] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  /* ---------------- THEME ---------------- */
  const pageBg =
    theme === "dark"
      ? "bg-[#0f0f0f] text-white"
      : "bg-gradient-to-b from-[#FFF5F9] to-[#FFE4EC] text-[#1a1a1a]";

  const card =
    theme === "dark"
      ? "bg-[#1A1A1A] border border-[#FF66C4]/30"
      : "bg-white border border-[#FF66C4]/20";

  /* ---------------- LOAD DATA ---------------- */
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) return;

      setUser(data.user);

      const { data: prof } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", data.user.id)
        .single();

      setProfile(prof);
      await refreshOrders(data.user.id);
      setLoading(false);
    };

    load();
  }, []);

  const refreshOrders = async (uid) => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      toast.error("Failed to load orders");
      return;
    }
    setOrders(data || []);
  };

  /* ---------------- HELPERS ---------------- */
  const money = (v) => `₹ ${Number(v || 0).toLocaleString("en-IN")}`;

  const statusBadge = (status) => {
    const map = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      completed: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
      refunded: "bg-purple-100 text-purple-800 border-purple-200",
    };
    return map[String(status || "").toLowerCase()] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const paymentBadge = (status) => {
    const s = String(status || "").toLowerCase();
    if (s === "paid" || s === "success") return "bg-green-100 text-green-800 border-green-200";
    if (s === "unpaid" || s === "pending") return "bg-yellow-100 text-yellow-800 border-yellow-200";
    if (s === "refunded") return "bg-purple-100 text-purple-800 border-purple-200";
    return "bg-gray-100 text-gray-700 border-gray-200";
  };

  const canCancel = (order) => {
    const st = String(order?.status || "").toLowerCase();
    // Allow cancel only if not already cancelled
    return st !== "cancelled";
  };

  const isOnlinePaid = (order) => {
    const method = String(order?.payment_method || "").toLowerCase();
    const payStatus = String(order?.payment_status || "").toLowerCase();
    // online + paid => refund
    return method !== "cod" && (payStatus === "paid" || payStatus === "success");
  };

  /* ---------------- CANCEL / REFUND (FIXED) ---------------- */
  const cancelOrder = async (order) => {
  const confirmMsg =
    order.payment_method === "COD"
      ? "Cancel this Cash on Delivery order?"
      : "Cancel this order and refund the amount?";

  if (!window.confirm(confirmMsg)) return;

  setActionId(order.id);

  try {
    // ✅ Get session safely
    const { data: sessionData, error: sessionErr } =
      await supabase.auth.getSession();

    if (sessionErr) throw sessionErr;

    const accessToken = sessionData?.session?.access_token;

    if (!accessToken) {
      toast.error("Session expired. Please login again.");
      return;
    }

    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cancelOrderAndRefund`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          order_id: order.id,
          user_id: user.id,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error("Cancel API Error:", data);
      throw new Error(data?.error || "Cancel failed");
    }

    toast.success(
      order.payment_method === "COD"
        ? "Order cancelled successfully"
        : "Order cancelled & refund initiated"
    );

    await refreshOrders(user.id);
  } catch (err) {
    console.error(err);
    toast.error(err.message || "Unable to cancel order");
  } finally {
    setActionId(null);
  }
};
  /* ---------------- PDF INVOICE ---------------- */
  const generatePDF = async (order) => {
    setPdfId(order.id);

    try {
      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;
      const doc = new jsPDF({ unit: "pt", format: "a4" });

      const pageWidth = doc.internal.pageSize.getWidth();
      const marginLeft = 40;
      let y = 40;

      /* LOGO */
      try {
        const res = await fetch(LOGO_URL);
        const blob = await res.blob();
        const reader = new FileReader();
        const base64 = await new Promise((r) => {
          reader.onloadend = () => r(reader.result);
          reader.readAsDataURL(blob);
        });
        doc.addImage(base64, "PNG", pageWidth / 2 - 35, y, 70, 70);
      } catch {}

      y += 95;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(185, 49, 79);
      doc.text("KL Stall & Decors", pageWidth / 2, y, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(90, 90, 90);
      doc.text("INVOICE", pageWidth / 2, y + 18, { align: "center" });

      y += 45;

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);

      doc.text(`Customer: ${profile?.full_name || order?.name || "Customer"}`, marginLeft, y);
      doc.text(`Email: ${user?.email || "-"}`, marginLeft, y + 16);

      y += 45;

      doc.text(`Order ID: ${order.id}`, marginLeft, y);
      doc.text(`Date: ${new Date(order.created_at).toLocaleString()}`, marginLeft, y + 16);
      doc.text(`Payment: ${order.payment_method}`, marginLeft, y + 32);
      doc.text(`Payment Status: ${order.payment_status}`, marginLeft, y + 48);

      y += 70;

      const items =
        typeof order.items === "string"
          ? JSON.parse(order.items)
          : order.items || [];

      autoTable(doc, {
        startY: y,
        head: [["Item", "Qty", "Price", "Total"]],
        body: items.map((i) => [
          i.title || i.name || "Item",
          i.qty || 1,
          money(i.price),
          money((i.price || 0) * (i.qty || 1)),
        ]),
        margin: { left: marginLeft, right: marginLeft },
        styles: { fontSize: 10 },
        headStyles: { fillColor: [185, 49, 79] },
      });

      y = doc.lastAutoTable.finalY + 20;

      doc.setFont("helvetica", "bold");
      doc.setTextColor(185, 49, 79);
      doc.text(`Subtotal: ${money(order.total)}`, marginLeft, y);

      if (order.discount_applied) {
        y += 16;
        doc.text(`Discount: -${money(order.discount_amount)}`, marginLeft, y);
      }

      y += 22;
      doc.setFontSize(13);
      doc.text(
        `Final Total: ${money(order.final_total || order.total)}`,
        marginLeft,
        y
      );

      y += 40;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(10);
      doc.text(`Contact: ${CONTACT_PHONE}`, marginLeft, y);
      doc.text(`Email: ${CONTACT_EMAIL}`, marginLeft, y + 14);

      doc.save(`KL_Invoice_${order.id}.pdf`);
      toast.success("Invoice downloaded");
    } catch {
      toast.error("Invoice generation failed");
    }

    setPdfId(null);
  };

  /* ---------------- UI DATA ---------------- */
  const sortedOrders = useMemo(() => {
    return [...orders].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
  }, [orders]);

  /* ---------------- UI ---------------- */
  return (
    <>
      <Helmet>
        <title>My Orders | KL Stall</title>
      </Helmet>

      <Toaster position="top-center" />

      <div className={`min-h-screen px-4 py-10 ${pageBg}`}>
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-extrabold text-center mb-10 bg-clip-text text-transparent bg-gradient-to-r from-[#FF66C4] to-[#FFDE59]">
            📦 My Orders
          </h1>

          {loading ? (
            <p className="text-center animate-pulse">Loading…</p>
          ) : sortedOrders.length === 0 ? (
            <p className="text-center opacity-70">No orders yet</p>
          ) : (
            <div className="space-y-6">
              {sortedOrders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-3xl p-6 shadow-xl ${card}`}
                >
                  {/* Header */}
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-extrabold text-[#b9314f]">
                        Order #{order.id}
                      </h2>

                      <p className="text-sm opacity-75 mt-1">
                        {new Date(order.created_at).toLocaleString()}
                      </p>

                      <div className="flex flex-wrap gap-2 mt-3">
                        <span
                          className={`px-3 py-1 text-xs rounded-full border ${statusBadge(
                            order.status
                          )}`}
                        >
                          Order: {String(order.status || "pending").toUpperCase()}
                        </span>

                        <span
                          className={`px-3 py-1 text-xs rounded-full border ${paymentBadge(
                            order.payment_status
                          )}`}
                        >
                          Payment:{" "}
                          {String(order.payment_status || "pending").toUpperCase()}
                        </span>

                        {order.refunded && (
                          <span className="px-3 py-1 text-xs rounded-full border bg-purple-100 text-purple-800 border-purple-200">
                            Refund: {String(order.refund_status || "pending").toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* Refund details */}
                      {order.refund_id && (
                        <p className="text-xs opacity-70 mt-2">
                          Refund ID: <span className="font-semibold">{order.refund_id}</span>
                        </p>
                      )}
                    </div>

                    {/* Amount */}
                    <div className="text-left md:text-right">
                      <p className="text-xl font-extrabold">
                        {money(order.final_total || order.total)}
                      </p>

                      <p className="text-sm opacity-75 mt-1">
                        Method:{" "}
                        <span className="font-semibold">
                          {order.payment_method}{" "}
                          {order.payment_type ? `(${order.payment_type})` : ""}
                        </span>
                      </p>

                      {order.discount_applied && (
                        <p className="text-green-600 text-sm mt-1">
                          🎁 Coupon Applied (₹{order.discount_amount})
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      onClick={() => generatePDF(order)}
                      disabled={pdfId === order.id}
                      className={`px-4 py-2 rounded-xl font-semibold shadow-sm transition
                        ${
                          pdfId === order.id
                            ? "bg-gray-400 text-white cursor-not-allowed"
                            : "bg-[#b9314f] hover:bg-[#ff7aa2] text-white"
                        }`}
                    >
                      {pdfId === order.id ? "Generating…" : "Download Invoice"}
                    </button>

                    {canCancel(order) && (
                      <button
                        onClick={() => cancelOrder(order)}
                        disabled={actionId === order.id}
                        className={`px-4 py-2 rounded-xl font-semibold shadow-sm transition
                          ${
                            actionId === order.id
                              ? "bg-gray-400 text-white cursor-not-allowed"
                              : "bg-red-600 hover:bg-red-700 text-white"
                          }`}
                      >
                        {actionId === order.id
                          ? "Processing…"
                          : order.payment_method === "COD"
                          ? "Cancel Order"
                          : isOnlinePaid(order)
                          ? "Cancel & Refund"
                          : "Cancel Order"}
                      </button>
                    )}
                  </div>

                  {/* Notes */}
                  {order.notes && (
                    <div className="mt-4 text-sm opacity-80">
                      <span className="font-semibold">Note:</span> {order.notes}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
