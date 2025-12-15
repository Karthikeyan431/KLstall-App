// src/pages/Orders.jsx
import React, { useEffect, useState, useContext } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import toast, { Toaster } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { ThemeContext } from "../contexts/ThemeContext";

// CONSTANTS (UNCHANGED)
const LOGO_URL =
  "https://i.ibb.co/qMw20Rfy/IMG-20250917-214439-removebg-preview.png";
const CONTACT_PHONE_1 = "9566061075";
const CONTACT_PHONE_2 = "8220584194";
const CONTACT_EMAIL = "klstall.decors@gmail.com";

export default function Orders() {
  const { session } = useAuth();
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);

  // STATES
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pdfGeneratingId, setPdfGeneratingId] = useState(null);
  const [profileName, setProfileName] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  // THEME CLASSES
  const pageBg =
    theme === "dark"
      ? "bg-[#0f0f0f] text-white"
      : "bg-gradient-to-b from-[#FFF5F9] to-[#FFE4EC] text-[#1a1a1a]";

  const cardClass =
    theme === "dark"
      ? "bg-[#1A1A1A] text-white border border-[#FF66C4]/40 shadow-xl"
      : "bg-white text-black border border-[#FF66C4]/20 shadow-xl";

  const statusText = (status) => {
    if (status === "cancelled") return "text-red-500 font-semibold";
    if (status === "returned") return "text-yellow-600 font-semibold";
    return "text-green-600 font-semibold";
  };

  // LOAD PROFILE + ORDERS
  useEffect(() => {
    if (session?.user?.id) {
      fetchProfileName();
      fetchOrders();
    }
  }, [session]);

  const fetchProfileName = async () => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", session.user.id)
        .single();

      setProfileName(data?.full_name || "");
    } catch {}
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      setOrders(data || []);
    } catch {
      toast.error(t("orders_load_error"));
    }
    setLoading(false);
  };

  const fmtPrice = (v) => Number(v || 0).toFixed(2);

  // UPDATE ORDER STATUS
  const updateOrderStatus = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const { data, error } = await supabase
        .from("orders")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", session.user.id)
        .select()
        .single();

      if (error) return toast.error(error.message || t("orders_update_error"));

      setOrders((prev) => prev.map((o) => (o.id === id ? data : o)));

      toast.success(
        newStatus === "cancelled"
          ? t("order_cancelled")
          : newStatus === "returned"
          ? t("order_returned")
          : t("order_updated")
      );

      setTimeout(fetchOrders, 300);
      return data;
    } catch {
      toast.error(t("orders_update_error"));
      return null;
    } finally {
      setUpdatingId(null);
    }
  };

  // CONFIRMATION POPUPS
  const cancelOrder = (id) => {
    toast.dismiss();
    toast.custom(
      (tObj) => (
        <div className="bg-white rounded-xl p-4 shadow-xl border border-gray-200">
          <p className="font-semibold mb-3">{t("cancel_confirm")}</p>

          <div className="flex justify-end gap-3">
            <button
              onClick={async () => {
                toast.dismiss(tObj.id);
                await updateOrderStatus(id, "cancelled");
              }}
              className="px-4 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md"
            >
              {t("yes")}
            </button>

            <button
              onClick={() => toast.dismiss(tObj.id)}
              className="px-4 py-1 bg-gray-200 hover:bg-gray-300 text-black rounded-md"
            >
              {t("no")}
            </button>
          </div>
        </div>
      ),
      { duration: 6000, position: "top-center" }
    );
  };

  const returnOrder = (id) => {
    toast.dismiss();
    toast.custom(
      (tObj) => (
        <div className="bg-white rounded-xl p-4 shadow-xl border border-gray-200">
          <p className="font-semibold mb-3">{t("return_confirm")}</p>

          <div className="flex justify-end gap-3">
            <button
              onClick={async () => {
                toast.dismiss(tObj.id);
                await updateOrderStatus(id, "returned");
              }}
              className="px-4 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md"
            >
              {t("yes")}
            </button>

            <button
              onClick={() => toast.dismiss(tObj.id)}
              className="px-4 py-1 bg-gray-200 hover:bg-gray-300 rounded-md"
            >
              {t("no")}
            </button>
          </div>
        </div>
      ),
      { duration: 6000, position: "top-center" }
    );
  };

  // PDF GENERATOR (UNCHANGED)
  const generatePDF = async (order) => {
    setPdfGeneratingId(order.id);
    try {
      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;
      const doc = new jsPDF({ unit: "pt", format: "a4" });

      const pageWidth = doc.internal.pageSize.getWidth();
      const marginLeft = 40;
      let y = 40;

      try {
        const res = await fetch(LOGO_URL);
        const blob = await res.blob();
        const reader = new FileReader();
        const base64 = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
        doc.addImage(base64, "PNG", pageWidth / 2 - 40, y, 80, 80);
      } catch {}

      y += 95;
      doc.setFontSize(22);
      doc.setTextColor(185, 49, 79);
      doc.text("KL Stall & Decors", pageWidth / 2, y, { align: "center" });

      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      doc.text("Your Event, Our Perfection!", pageWidth / 2, y + 18, {
        align: "center",
      });

      y += 50;

      const customerName =
        profileName ||
        order.name ||
        session?.user?.user_metadata?.full_name ||
        "Customer";

      const customerEmail = session?.user?.email || "Not provided";

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Customer: ${customerName}`, marginLeft, y);
      doc.text(`Email: ${customerEmail}`, marginLeft, y + 18);

      y += 45;

      doc.text(`Order ID: ${order.id}`, marginLeft, y);
      doc.text(`Payment Method: ${order.payment_method}`, marginLeft, y + 18);
      doc.text(
        `Order Date: ${new Date(order.created_at).toLocaleString()}`,
        marginLeft,
        y + 36
      );

      let statusColor = [0, 0, 0];
      if (order.status === "cancelled") statusColor = [255, 0, 0];
      else if (order.status === "returned") statusColor = [255, 128, 0];
      else if (order.status === "completed") statusColor = [0, 150, 0];

      doc.setTextColor(...statusColor);
      doc.text(`Status: ${order.status}`, marginLeft, y + 54);

      y += 80;

      let items = [];
      try {
        items =
          typeof order.items === "string"
            ? JSON.parse(order.items)
            : order.items || [];
      } catch {
        items = [];
      }

      const tableBody = items.map((it, idx) => [
        it.title || it.name || `Item ${idx + 1}`,
        it.qty || 1,
        fmtPrice(it.price),
        fmtPrice((it.price || 0) * (it.qty || 1)),
      ]);

      if (tableBody.length > 0) {
        autoTable(doc, {
          startY: y,
          head: [["Item", "Qty", "Price", "Total"]],
          body: tableBody,
          margin: { left: marginLeft, right: marginLeft },
        });
        y = doc.lastAutoTable.finalY + 20;
      }

      const totalPrice = order.total_price || order.total || 0;

      doc.setFont("helvetica", "bold");
      doc.setTextColor(185, 49, 79);
      doc.text(`Grand Total: INR ${fmtPrice(totalPrice)}`, pageWidth - marginLeft, y, {
        align: "right",
      });

      y += 40;

      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.text("Thank you for choosing KL Stall & Decors!", marginLeft, y);
      doc.text(`Phone: ${CONTACT_PHONE_1} | ${CONTACT_PHONE_2}`, marginLeft, y + 14);
      doc.text(`Email: ${CONTACT_EMAIL}`, marginLeft, y + 28);

      doc.save(`Order_${order.id}.pdf`);
      toast.success(t("pdf_success"));
    } catch {
      toast.error(t("pdf_failed"));
    }

    setPdfGeneratingId(null);
  };

  // MAIN UI
  return (
    <div className={`min-h-screen w-full flex flex-col items-center px-4 py-10 ${pageBg}`}>
      <Toaster position="top-center" />

      {/* TITLE */}
      <h1 className="text-3xl md:text-4xl font-extrabold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-[#FF66C4] to-[#FFDE59]">
        📦 {t("my_orders")}
      </h1>

      {/* LOADING */}
      {loading ? (
        <p className="text-lg opacity-80 animate-pulse">{t("loading_orders")}</p>
      ) : orders.length === 0 ? (
        <p className="text-lg opacity-80">{t("no_orders")}</p>
      ) : (
        <div className={`w-full max-w-5xl rounded-3xl p-6 space-y-6 ${cardClass}`}>
          {orders.map((order) => (
            <div
              key={order.id}
              className="pb-6 border-b border-pink-200/30 last:border-none flex flex-col md:flex-row justify-between gap-4"
            >
              {/* LEFT */}
              <div>
                <h2 className="text-lg font-bold text-[#b9314f]">
                  {t("order_id")}: {order.id}
                </h2>

                <p className="text-sm opacity-80">
                  {new Date(order.created_at).toLocaleString()}
                </p>

                <p className="mt-1 text-sm">
                  {t("payment")}:{" "}
                  <span className="font-semibold">{order.payment_method}</span>
                </p>

                <p className="font-bold mt-1">
                  {t("total")}: ₹ {fmtPrice(order.total_price || order.total)}
                </p>

                <p className={`mt-1 text-sm ${statusText(order.status)}`}>
                  {t("status")}: {order.status}
                </p>
              </div>

              {/* RIGHT BUTTONS */}
              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                {/* PDF BUTTON */}
                <button
                  onClick={() => generatePDF(order)}
                  disabled={pdfGeneratingId === order.id}
                  className={`min-w-[130px] px-4 py-2 rounded-md text-white font-semibold shadow transition ${
                    pdfGeneratingId === order.id
                      ? "bg-gray-500 cursor-not-allowed"
                      : "bg-[#b9314f] hover:bg-[#ff7aa2]"
                  }`}
                >
                  {pdfGeneratingId === order.id ? t("generating") : t("download_pdf")}
                </button>

                {/* CANCEL BUTTON */}
                {order.status !== "cancelled" && order.status !== "returned" && (
                  <button
                    onClick={() => cancelOrder(order.id)}
                    disabled={updatingId === order.id}
                    className={`min-w-[110px] px-4 py-2 rounded-md text-white transition ${
                      updatingId === order.id
                        ? "bg-gray-500 cursor-not-allowed"
                        : "bg-gray-600 hover:bg-gray-700"
                    }`}
                  >
                    {updatingId === order.id ? t("processing") : t("cancel")}
                  </button>
                )}

                {/* RETURN BUTTON */}
                {order.status === "completed" && (
                  <button
                    onClick={() => returnOrder(order.id)}
                    disabled={updatingId === order.id}
                    className={`min-w-[110px] px-4 py-2 rounded-md text-white transition ${
                      updatingId === order.id
                        ? "bg-gray-500 cursor-not-allowed"
                        : "bg-yellow-600 hover:bg-yellow-700"
                    }`}
                  >
                    {updatingId === order.id ? t("processing") : t("return")}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
