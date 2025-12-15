// src/pages/Cart.jsx
import React, { useEffect, useState, useContext } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { ThemeContext } from "../contexts/ThemeContext";

export default function Cart() {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);

  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // ------------------------------------------------------
  // LOAD USER + PROFILE + CART
  // ------------------------------------------------------
  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        navigate("/login");
        return;
      }

      setUser(data.user);

      const { data: P } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      setProfile(P);

      const { data: C } = await supabase
        .from("cart")
        .select("*")
        .eq("user_id", data.user.id);

      setCartItems(C || []);
      setLoading(false);
    }
    load();
  }, []);

  // ------------------------------------------------------
  // THEME CLASSES
  // ------------------------------------------------------
  const pageBg =
    theme === "dark"
      ? "bg-[#0f0f0f] text-white"
      : "bg-gradient-to-b from-[#FFF5F9] to-[#FFE4EC] text-[#1a1a1a]";

  const cardClass =
    theme === "dark"
      ? "bg-[#1A1A1A] border border-[#FF66C4]/40 text-white"
      : "bg-white border border-[#FF66C4]/30 text-black";

  const qtyMinus =
    theme === "dark"
      ? "bg-[#2A2A2A] text-white border border-[#FF66C4]"
      : "bg-[#FFDE59] text-black";

  const qtyPlus =
    theme === "dark"
      ? "bg-[#FF66C4] text-white border border-[#FF66C4]"
      : "bg-[#FF66C4] text-white";

  const btnPrimary =
    theme === "dark"
      ? "bg-[#1A1A1A] border border-[#FF66C4] text-white hover:bg-[#222]"
      : "bg-gradient-to-r from-[#FF66C4] to-[#FFDE59] text-white";

  const btnAlt =
    theme === "dark"
      ? "bg-[#1A1A1A] border border-[#FFDE59] text-white hover:bg-[#222]"
      : "bg-gradient-to-r from-[#FFDE59] to-[#FF66C4] text-white";

  // ------------------------------------------------------
  // REMOVE ITEM
  // ------------------------------------------------------
  const removeItem = async (id) => {
    await supabase.from("cart").delete().eq("id", id);
    setCartItems(cartItems.filter((i) => i.id !== id));
    toast.success(t("item_removed"));
  };

  // ------------------------------------------------------
  // QUANTITY UPDATE
  // ------------------------------------------------------
  const updateQty = async (id, qty) => {
    if (qty < 1) return;

    await supabase.from("cart").update({ qty }).eq("id", id);

    setCartItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty } : i))
    );
  };

  // ------------------------------------------------------
  // TOTAL PRICE
  // ------------------------------------------------------
  const total = cartItems.reduce(
    (acc, i) => acc + (i.price || 0) * (i.qty || 1),
    0
  );

  // ------------------------------------------------------
  // CASH ON DELIVERY — WORKING PERFECT
  // ------------------------------------------------------
  const handleCOD = async () => {
    if (!user) return toast.error(t("login_first"));
    if (cartItems.length === 0) return toast.error(t("empty_cart"));

    try {
      await supabase.from("orders").insert({
        user_id: user.id,
        items: cartItems,
        total,
        status: "Pending",
        payment_method: "Cash on Delivery",
      });

      await supabase.from("cart").delete().eq("user_id", user.id);
      setCartItems([]);

      toast.success(t("order_success"));
      navigate("/orders");
    } catch (err) {
      toast.error(t("order_failed"));
    }
  };

  // ------------------------------------------------------
  // RAZORPAY ONLINE PAYMENT — WORKING PERFECT
  // ------------------------------------------------------
  const handleOnlinePay = async () => {
    if (!user) return toast.error(t("login_first"));
    if (cartItems.length === 0) return toast.error(t("empty_cart"));

    try {
      // 1) Create Razorpay Order using Supabase Edge Function
      const res = await fetch(
        "https://alayipoqgverqdvjmskj.supabase.co/functions/v1/createOrder",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            items: cartItems,
            total,
            paymentMethod: "Online",
          }),
        }
      );

      const data = await res.json();
      if (!res.ok || !data?.order?.id)
        throw new Error("Order creation failed");

      const { order } = data;

      // 2) Razorpay Checkout Options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID_LIVE,
        amount: order.amount,
        currency: "INR",
        name: "KL Stall & Decors",
        description: t("online_payment"),
        order_id: order.id,

        handler: async function (response) {
          // 3) Verify payment
          const verifyRes = await fetch(
            "https://alayipoqgverqdvjmskj.supabase.co/functions/v1/verifyPayment",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: order.id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId: user.id,
              }),
            }
          );

          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            toast.success(t("payment_success"));

            await supabase.from("cart").delete().eq("user_id", user.id);
            setCartItems([]);
            navigate("/orders");
          } else {
            toast.error(t("payment_failed"));
          }
        },

        prefill: {
          name: profile?.full_name || "Customer",
          email: user?.email,
          contact: "9566061075",
        },

        theme: { color: "#FF66C4" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error("Payment failed. Try again.");
    }
  };

  // ------------------------------------------------------
  // LOADING
  // ------------------------------------------------------
  if (loading)
    return (
      <div className={`min-h-screen flex items-center justify-center ${pageBg}`}>
        {t("loading_cart")}
      </div>
    );

  // ------------------------------------------------------
  // MAIN UI
  // ------------------------------------------------------
  return (
    <div className={`min-h-screen w-full px-4 py-10 flex flex-col items-center ${pageBg}`}>
      <Toaster />

      {/* TITLE */}
      <h1 className="text-3xl font-extrabold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-[#FF66C4] to-[#FFDE59]">
        {t("your_cart")} 🛒
      </h1>

      {/* EMPTY CART */}
      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center mt-20">
          <p className="text-lg opacity-80">{t("empty_cart")}</p>

          <button
            onClick={() => navigate("/packages")}
            className={`mt-6 px-6 py-3 rounded-full font-semibold ${btnPrimary}`}
          >
            {t("browse_packages")}
          </button>
        </div>
      ) : (
        <div className="w-full max-w-3xl space-y-6">
          {/* ITEMS */}
          {cartItems.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.02 }}
              className={`p-4 rounded-2xl shadow-md flex items-center justify-between ${cardClass}`}
            >
              {/* IMAGE */}
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-300 rounded-lg flex items-center justify-center text-sm">
                  {t("no_image")}
                </div>
              )}

              {/* DETAILS */}
              <div className="flex-1 ml-4">
                <h2 className="text-lg font-semibold">{item.name}</h2>
                <p className="opacity-80">₹ {item.price}</p>
              </div>

              {/* QTY */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQty(item.id, (item.qty || 1) - 1)}
                  className={`px-3 py-1 rounded-full font-bold ${qtyMinus}`}
                >
                  −
                </button>

                <span className="font-semibold text-lg">{item.qty || 1}</span>

                <button
                  onClick={() => updateQty(item.id, (item.qty || 1) + 1)}
                  className={`px-3 py-1 rounded-full font-bold ${qtyPlus}`}
                >
                  +
                </button>
              </div>

              {/* REMOVE */}
              <button
                onClick={() => removeItem(item.id)}
                className="ml-4 bg-gradient-to-r from-red-500 to-red-600 px-3 py-2 rounded-full text-white shadow"
              >
                ✕
              </button>
            </motion.div>
          ))}

          {/* TOTAL */}
          <div className={`p-6 rounded-2xl shadow-md text-center ${cardClass}`}>
            <h3 className="text-2xl font-bold">
              {t("total")}:
              <span className="text-[#ff5858]"> ₹ {total.toLocaleString("en-IN")}</span>
            </h3>
          </div>

          {/* BUTTONS */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
            <button
              onClick={handleCOD}
              className={`px-6 py-3 rounded-full font-semibold ${btnAlt}`}
            >
              {t("cash_delivery")} 💵
            </button>

            <button
              onClick={handleOnlinePay}
              className={`px-6 py-3 rounded-full font-semibold ${btnPrimary}`}
            >
              {t("pay_online")} 💳
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
