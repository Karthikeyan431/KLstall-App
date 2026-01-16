// src/pages/Checkout.jsx
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";

const DISCOUNT_AMOUNT = 1500;
const COUPON_COINS_REQUIRED = 150;
const ADVANCE_PERCENT = 0.2;

export default function Checkout() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [payout, setPayout] = useState(null);
  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("COD"); // COD | ONLINE
  const [onlineType, setOnlineType] = useState("FULL"); // FULL | ADVANCE

  /* ---------------- COUPON STATE ---------------- */
  const [couponPopupOpen, setCouponPopupOpen] = useState(false);
  const [couponApplied, setCouponApplied] = useState(false);

  /* ---------------- LOAD USER + CART + PAYOUT + PROFILE ---------------- */
  useEffect(() => {
    const load = async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        if (!auth?.user) {
          navigate("/login");
          return;
        }

        const currentUser = auth.user;
        setUser(currentUser);

        // CART
        const { data: cartData, error: cartErr } = await supabase
          .from("cart")
          .select("*")
          .eq("user_id", currentUser.id);

        if (cartErr || !cartData || cartData.length === 0) {
          toast.error("Cart is empty");
          navigate("/cart");
          return;
        }
        setCart(cartData);

        // PAYOUT (latest)
        const { data: payoutData, error: payoutErr } = await supabase
          .from("payout_details")
          .select("*")
          .eq("user_id", currentUser.id)
          .order("created_at", { ascending: false })
          .limit(1);

        if (payoutErr || !payoutData || payoutData.length === 0) {
          toast.error("Please fill event details first");
          navigate("/payout");
          return;
        }
        setPayout(payoutData[0]);

        // PROFILE (coins)
        const { data: prof, error: profErr } = await supabase
          .from("profiles")
          .select("id, full_name, phone, coins, eligible_for_discount")
          .eq("id", currentUser.id)
          .single();

        if (profErr) throw profErr;
        setProfile(prof);

        setLoading(false);

        // ✅ Auto coupon popup (only when eligible)
        const coins = Number(prof?.coins || 0);
        if (coins >= COUPON_COINS_REQUIRED) {
          setTimeout(() => setCouponPopupOpen(true), 500);
        }
      } catch (e) {
        console.error(e);
        toast.error("Checkout loading failed");
        setLoading(false);
      }
    };

    load();
  }, [navigate]);

  /* ---------------- HELPERS ---------------- */
  const money = (v) => `₹ ${Number(v || 0).toLocaleString("en-IN")}`;
  const coins = Number(profile?.coins || 0);
  const isCouponEligible = coins >= COUPON_COINS_REQUIRED;

  /* ---------------- TOTALS ---------------- */
  const subtotal = useMemo(() => {
    return cart.reduce(
      (sum, i) => sum + Number(i.price || 0) * Number(i.qty || 1),
      0
    );
  }, [cart]);

  const discount = useMemo(() => {
    if (!couponApplied) return 0;
    return Math.min(DISCOUNT_AMOUNT, subtotal); // cannot exceed subtotal
  }, [couponApplied, subtotal]);

  const finalTotal = useMemo(() => {
    return Math.max(0, subtotal - discount);
  }, [subtotal, discount]);

  const advance = useMemo(() => Math.round(finalTotal * ADVANCE_PERCENT), [finalTotal]);

  const payable = useMemo(() => {
    if (paymentMethod !== "ONLINE") return 0;
    return onlineType === "FULL" ? finalTotal : advance;
  }, [paymentMethod, onlineType, finalTotal, advance]);

  /* ---------------- COUPON ACTIONS ---------------- */
  const applyCoupon = () => {
    if (!isCouponEligible) {
      toast.error("Not enough coins to use coupon");
      return;
    }
    setCouponApplied(true);
    setCouponPopupOpen(false);
    toast.success("🎁 Coupon applied! ₹1500 discount added");
  };

  const removeCoupon = () => {
    setCouponApplied(false);
    toast("Coupon removed");
  };

  /* ---------------- COD ORDER ---------------- */
  const placeCODOrder = async () => {
    if (!user || !payout) return;

    // ✅ coupon validation
    if (couponApplied && !isCouponEligible) {
      toast.error("Coupon not eligible right now");
      return;
    }

    setPaying(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/placeCodOrder`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.id,
            payout_id: payout.id,
            coupon_used: couponApplied === true, // ✅ NEW
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "COD failed");

      toast.success("Order placed successfully ✅");
      navigate("/orders");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "COD order failed");
    } finally {
      setPaying(false);
    }
  };

  /* ---------------- ONLINE PAYMENT ---------------- */
  const payOnline = async () => {
    if (!user || !payout) return;

    // ✅ coupon validation
    if (couponApplied && !isCouponEligible) {
      toast.error("Coupon not eligible right now");
      return;
    }

    if (payable <= 0) {
      toast.error("Invalid payable amount");
      return;
    }

    setPaying(true);
    try {
      // 1️⃣ Create Razorpay Order
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/createOrder`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: payable,
          }),
        }
      );

      const data = await res.json();
      if (!data?.order?.id) throw new Error("Unable to start payment");

      // 2️⃣ Open Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // ✅ using your existing env
        amount: data.order.amount,
        currency: "INR",
        name: "KL Stall & Decors",
        description:
          onlineType === "FULL"
            ? "Full Payment"
            : "Advance Payment (20%)",
        order_id: data.order.id,

        handler: async (response) => {
          try {
            // 3️⃣ Verify Payment
            const verifyRes = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verifyPayment`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,

                  user_id: user.id,
                  payment_type: onlineType,
                  payout_id: payout.id,

                  coupon_used: couponApplied === true, // ✅ NEW
                }),
              }
            );

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData?.error || "Verification failed");
            }

            toast.success("Payment successful 🎉");
            navigate("/orders");
          } catch (e) {
            console.error(e);
            toast.error(e.message || "Payment verification failed");
          }
        },

        modal: {
          ondismiss: () => toast.error("Payment cancelled"),
        },

        prefill: {
          name: payout.name,
          contact: payout.phone,
          email: user.email,
        },

        theme: { color: "#FF66C4" },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Payment failed");
    } finally {
      setPaying(false);
    }
  };

  /* ---------------- UI ---------------- */
  if (loading) return <div className="p-10">Loading…</div>;

  return (
    <>
      <Helmet>
        <title>Checkout | KL Stall</title>
      </Helmet>

      <Toaster position="top-center" />

      {/* ✅ Coupon Popup */}
      <AnimatePresence>
        {couponPopupOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-pink-200"
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-extrabold text-[#b9314f]">
                    🎁 Coupon Unlocked!
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    You have{" "}
                    <span className="font-bold text-black">{coins} coins</span>.
                    Use 150 coins & get{" "}
                    <span className="font-bold text-green-700">₹1500 OFF</span>
                    .
                  </p>
                </div>

                <button
                  onClick={() => setCouponPopupOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                >
                  ×
                </button>
              </div>

              <div className="mt-5 rounded-2xl bg-gradient-to-r from-pink-50 to-yellow-50 border border-pink-100 p-4">
                <p className="text-sm text-gray-700">
                  ✅ Discount: <b>₹1500</b>
                  <br />
                  ✅ Coins Used: <b>150</b>
                  <br />
                  ✅ Valid before event date/time
                </p>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => setCouponPopupOpen(false)}
                  className="flex-1 py-3 rounded-2xl border border-gray-300 font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Later
                </button>

                <button
                  onClick={applyCoupon}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#FF66C4] to-[#FFDE59] text-white font-extrabold shadow-lg hover:opacity-95"
                >
                  Apply Coupon
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#FF66C4] to-[#FFDE59]">
            Checkout
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Confirm your event details & payment.
          </p>
        </div>

        {/* TOP GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: CART */}
          <div className="lg:col-span-2 space-y-6">
            {/* CART CARD */}
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-pink-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-extrabold text-[#b9314f]">
                  🛒 Cart Summary
                </h2>

                {/* Coins badge */}
                <div className="px-3 py-1 rounded-full text-sm bg-yellow-50 border border-yellow-200">
                  🪙 Coins: <b>{coins}</b>
                </div>
              </div>

              <div className="divide-y">
                {cart.map((i) => (
                  <div
                    key={i.id}
                    className="py-3 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-gray-800 truncate">
                        {i.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Qty: {i.qty} • Price: {money(i.price)}
                      </p>
                    </div>

                    <p className="font-extrabold text-gray-900">
                      {money(Number(i.price || 0) * Number(i.qty || 1))}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* COUPON CARD */}
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-pink-100">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-extrabold">🎁 Discount Coupon</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Unlock discount by collecting coins.
                  </p>
                </div>

                {couponApplied ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                    APPLIED
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                    NOT APPLIED
                  </span>
                )}
              </div>

              <div className="mt-4 rounded-2xl p-4 border border-gray-200 bg-gradient-to-r from-[#FFF5F9] to-[#FFFBEA]">
                {isCouponEligible ? (
                  <>
                    <p className="text-sm text-gray-700">
                      ✅ Eligible: You have <b>{coins} coins</b>
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                      Use 150 coins & get <b>₹1500 OFF</b>
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-700">
                      ❌ Not Eligible
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Need <b>{COUPON_COINS_REQUIRED}</b> coins. You currently
                      have <b>{coins}</b>.
                    </p>
                  </>
                )}
              </div>

              <div className="mt-4 flex gap-3">
                {!couponApplied ? (
                  <button
                    disabled={!isCouponEligible}
                    onClick={applyCoupon}
                    className={`flex-1 py-3 rounded-2xl font-extrabold shadow-lg ${
                      isCouponEligible
                        ? "bg-gradient-to-r from-[#FF66C4] to-[#FFDE59] text-white hover:opacity-95"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Apply Coupon
                  </button>
                ) : (
                  <button
                    onClick={removeCoupon}
                    className="flex-1 py-3 rounded-2xl font-extrabold border border-red-200 text-red-600 hover:bg-red-50"
                  >
                    Remove Coupon
                  </button>
                )}

                <button
                  onClick={() => setCouponPopupOpen(true)}
                  className="px-4 py-3 rounded-2xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold"
                >
                  View
                </button>
              </div>
            </div>

            {/* PAYMENT METHOD */}
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-pink-100">
              <h2 className="text-lg font-extrabold mb-4">💳 Payment Method</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentMethod("COD")}
                  className={`rounded-2xl border p-4 text-left transition ${
                    paymentMethod === "COD"
                      ? "border-[#FF66C4] bg-pink-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <p className="font-extrabold text-gray-900">Cash on Delivery</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Pay on event day.
                  </p>
                </button>

                <button
                  onClick={() => setPaymentMethod("ONLINE")}
                  className={`rounded-2xl border p-4 text-left transition ${
                    paymentMethod === "ONLINE"
                      ? "border-[#FF66C4] bg-pink-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <p className="font-extrabold text-gray-900">Online Payment</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Razorpay secure payment.
                  </p>
                </button>
              </div>

              {paymentMethod === "ONLINE" && (
                <div className="mt-5 rounded-2xl border border-gray-200 p-4 bg-white">
                  <p className="font-bold text-gray-800 mb-3">
                    Choose payment type
                  </p>

                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={onlineType === "FULL"}
                        onChange={() => setOnlineType("FULL")}
                      />
                      <span className="font-semibold">
                        Full Payment ({money(finalTotal)})
                      </span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={onlineType === "ADVANCE"}
                        onChange={() => setOnlineType("ADVANCE")}
                      />
                      <span className="font-semibold">
                        Advance 20% ({money(advance)})
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: BILL SUMMARY */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 bg-white rounded-3xl p-6 shadow-2xl border border-pink-100">
              <h2 className="text-lg font-extrabold text-gray-900">
                🧾 Bill Details
              </h2>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-bold">{money(subtotal)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Discount</span>
                  <span className={`font-bold ${discount > 0 ? "text-green-600" : "text-gray-700"}`}>
                    - {money(discount)}
                  </span>
                </div>

                <div className="h-px bg-gray-200" />

                <div className="flex justify-between text-base">
                  <span className="font-extrabold">Final Total</span>
                  <span className="font-extrabold text-[#b9314f]">
                    {money(finalTotal)}
                  </span>
                </div>

                {paymentMethod === "ONLINE" && (
                  <div className="mt-2 rounded-2xl border border-gray-200 p-3 bg-gray-50">
                    <p className="text-xs text-gray-600">
                      Payable now
                    </p>
                    <p className="text-lg font-extrabold">
                      {money(payable)}
                    </p>
                  </div>
                )}
              </div>

              <button
                disabled={paying}
                onClick={() => {
                  if (paying) return;
                  paymentMethod === "COD" ? placeCODOrder() : payOnline();
                }}
                className="mt-6 w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF66C4] to-[#FFDE59] text-white font-extrabold shadow-xl disabled:opacity-60"
              >
                {paying
                  ? "Processing…"
                  : paymentMethod === "COD"
                  ? "Confirm Order"
                  : "Pay Now"}
              </button>

              <p className="text-xs text-gray-500 mt-3 text-center">
                By continuing, you agree to our booking policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
