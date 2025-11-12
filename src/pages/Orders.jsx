// src/pages/Orders.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import toast, { Toaster } from "react-hot-toast";

const LOGO_URL =
  "https://i.ibb.co/qMw20Rfy/IMG-20250917-214439-removebg-preview.png";
const CONTACT_PHONE_1 = "9566061075";
const CONTACT_PHONE_2 = "8220584194";
const CONTACT_EMAIL = "klstall.decors@gmail.com";

export default function Orders() {
  const { session } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pdfGeneratingId, setPdfGeneratingId] = useState(null);
  const [profileName, setProfileName] = useState("");
  const [updatingId, setUpdatingId] = useState(null); // disable while updating

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfileName();
      fetchOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // Fetch profile name
  const fetchProfileName = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", session.user.id)
        .single();
      if (error) throw error;
      setProfileName(data?.full_name || "");
    } catch (err) {
      console.warn("⚠ Could not fetch profile name:", err?.message || err);
    }
  };

  // Fetch orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error("❌ Failed to load orders:", err);
      toast.error("Could not load your orders. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fmtPrice = (v) => Number(v || 0).toFixed(2);

  // Update order status (returns updated row or throws)
  const updateOrderStatus = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      // Request the updated row back with .select().single()
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

      if (error) {
        console.error("Supabase update error:", error);
        toast.error(error.message || "Failed to update order status.");
        return null;
      }

      // Update local state using authoritative DB row if returned
      if (data) {
        setOrders((prev) => prev.map((o) => (o.id === id ? data : o)));
      } else {
        // fallback: optimistic update
        setOrders((prev) =>
          prev.map((order) => (order.id === id ? { ...order, status: newStatus } : order))
        );
      }

      toast.success(
        newStatus === "cancelled"
          ? "Order cancelled successfully!"
          : newStatus === "returned"
          ? "Return requested!"
          : "Order updated!"
      );

      // Re-fetch to ensure full consistency (optional but safe)
      // small delay to let DB settle
      setTimeout(() => fetchOrders(), 400);

      return data || true;
    } catch (err) {
      console.error("❌ Failed to update order:", err);
      toast.error("Could not update order status. Please try again.");
      return null;
    } finally {
      setUpdatingId(null);
    }
  };

  // Cancel order confirmation using toast.custom (with proper async button handlers)
  const cancelOrder = (id) => {
    toast.dismiss();
    toast.custom(
      (t) => (
        <div className="bg-white shadow-xl rounded-xl p-4 border border-gray-200 max-w-sm">
          <p className="font-semibold text-gray-800 mb-3">Cancel this order?</p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={async () => {
                // disable toast while processing by dismissing it, then run update
                toast.dismiss(t.id);
                await updateOrderStatus(id, "cancelled");
              }}
              className="px-4 py-1 rounded bg-red-500 hover:bg-red-600 text-white"
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => toast.dismiss(t.id)}
              className="px-4 py-1 rounded bg-gray-200 hover:bg-gray-300 text-black"
            >
              No
            </button>
          </div>
        </div>
      ),
      { position: "top-center", duration: 6000 }
    );
  };

  // Return order confirmation
  const returnOrder = (id) => {
    toast.dismiss();
    toast.custom(
      (t) => (
        <div className="bg-white shadow-xl rounded-xl p-4 border border-gray-200 max-w-sm">
          <p className="font-semibold text-gray-800 mb-3">Request a return?</p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={async () => {
                toast.dismiss(t.id);
                await updateOrderStatus(id, "returned");
              }}
              className="px-4 py-1 rounded bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => toast.dismiss(t.id)}
              className="px-4 py-1 rounded bg-gray-200 hover:bg-gray-300 text-black"
            >
              No
            </button>
          </div>
        </div>
      ),
      { position: "top-center", duration: 6000 }
    );
  };

  // Generate PDF (unchanged logic, just toast on success/error)
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
      } catch {
        console.warn("⚠ Logo not loaded.");
      }

      y += 95;
      doc.setFontSize(22);
      doc.setTextColor(185, 49, 79);
      doc.text("KL Stall & Decors", pageWidth / 2, y, { align: "center" });
      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      doc.text("Your Event, Our Perfection!", pageWidth / 2, y + 18, { align: "center" });
      y += 50;

      const customerName =
        profileName || order.name || session?.user?.user_metadata?.full_name || "Customer";
      const customerEmail = session?.user?.email || "Not provided";

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Customer: ${customerName}`, marginLeft, y);
      doc.text(`Email: ${customerEmail}`, marginLeft, y + 18);

      y += 45;
      doc.text(`Order ID: ${order.id}`, marginLeft, y);
      doc.text(`Payment Method: ${order.payment_method || "N/A"}`, marginLeft, y + 18);
      doc.text(`Order Date: ${new Date(order.created_at).toLocaleString()}`, marginLeft, y + 36);

      let statusColor = [0, 0, 0];
      if (order.status === "cancelled") statusColor = [255, 0, 0];
      else if (order.status === "returned") statusColor = [255, 128, 0];
      else if (order.status === "completed") statusColor = [0, 150, 0];
      doc.setTextColor(...statusColor);
      doc.text(`Order Status: ${order.status || "Pending"}`, marginLeft, y + 54);

      y += 80;

      let items = [];
      try {
        items =
          typeof order.items === "string"
            ? JSON.parse(order.items)
            : Array.isArray(order.items)
            ? order.items
            : [];
      } catch {
        items = [];
      }

      const tableBody = items.map((it, idx) => [
        it.title || it.name || `Item ${idx + 1}`,
        it.qty || it.quantity || 1,
        fmtPrice(it.price),
        fmtPrice((it.price || 0) * (it.qty || it.quantity || 1)),
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

      doc.save(`Order_${String(order.id).slice(0, 10)}.pdf`);
      toast.success("PDF downloaded successfully!");
    } catch (err) {
      console.error("❌ PDF generation failed:", err);
      toast.error("Failed to generate PDF.");
    } finally {
      setPdfGeneratingId(null);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-[#FFF5F9] px-4 py-10">
      <Toaster position="top-center" />
      <h1 className="text-3xl md:text-4xl font-bold text-[#b9314f] mb-8 text-center">
        📦 My Orders
      </h1>

      {loading ? (
        <div className="text-lg text-gray-600 animate-pulse">Loading orders...</div>
      ) : orders.length === 0 ? (
        <p className="text-gray-700 text-lg">No orders yet. Start shopping now!</p>
      ) : (
        <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg p-6 space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border-b pb-5 last:border-none flex flex-col md:flex-row md:justify-between md:items-center"
            >
              <div>
                <h2 className="text-lg font-semibold text-[#b9314f]">Order ID: {order.id}</h2>
                <p className="text-sm text-gray-600">
                  {new Date(order.created_at).toLocaleString()}
                </p>
                <p className="text-sm mt-1">
                  Payment: <span className="font-medium">{order.payment_method || "N/A"}</span>
                </p>
                <p className="font-bold mt-1 text-gray-900">
                  Total: INR {fmtPrice(order.total_price || order.total)}
                </p>
                <p
                  className={`mt-1 text-sm font-semibold ${
                    order.status === "cancelled"
                      ? "text-red-600"
                      : order.status === "returned"
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                >
                  Status: {order.status || "Pending"}
                </p>
              </div>

              <div className="mt-4 md:mt-0 flex items-center gap-3">
                <button
                  onClick={() => generatePDF(order)}
                  disabled={pdfGeneratingId === order.id}
                  className={`px-5 py-2 rounded-lg font-medium text-white transition-all ${
                    pdfGeneratingId === order.id
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#b9314f] hover:bg-[#ff7a9e]"
                  }`}
                >
                  {pdfGeneratingId === order.id ? "Generating..." : "⬇ Download PDF"}
                </button>

                {order.status !== "cancelled" && order.status !== "returned" && (
                  <button
                    onClick={() => cancelOrder(order.id)}
                    disabled={updatingId === order.id}
                    className={`px-4 py-2 rounded-lg text-white ${
                      updatingId === order.id ? "bg-gray-400 cursor-not-allowed" : "bg-gray-500 hover:bg-gray-600"
                    }`}
                    type="button"
                  >
                    {updatingId === order.id ? "Processing..." : "❌ Cancel"}
                  </button>
                )}

                {order.status === "completed" && (
                  <button
                    onClick={() => returnOrder(order.id)}
                    disabled={updatingId === order.id}
                    className={`px-4 py-2 rounded-lg text-white ${
                      updatingId === order.id ? "bg-gray-400 cursor-not-allowed" : "bg-yellow-600 hover:bg-yellow-700"
                    }`}
                    type="button"
                  >
                    {updatingId === order.id ? "Processing..." : "🔄 Return"}
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
