// src/pages/Cart.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ Load user and profile
  useEffect(() => {
    const getUserAndProfile = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) console.error("User fetch error:", error);
      if (data?.user) {
        setUser(data.user);
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("full_name, coins")
          .eq("id", data.user.id)
          .single();
        if (profileError) console.error("Profile fetch error:", profileError);
        else setUserProfile(profile);
      }
      setLoading(false);
    };
    getUserAndProfile();
  }, []);

  // ✅ Load user's cart
  useEffect(() => {
    if (!user) return;
    const fetchCartItems = async () => {
      const { data, error } = await supabase
        .from("cart")
        .select("*")
        .eq("user_id", user.id);
      if (error) console.error("Cart fetch error:", error);
      else setCartItems(data);
    };
    fetchCartItems();
  }, [user]);

  // ✅ Remove item
  const removeFromCart = async (id) => {
    const { error } = await supabase.from("cart").delete().eq("id", id);
    if (error) {
      console.error("Remove error:", error);
      toast.error("Failed to remove item.");
    } else {
      setCartItems(cartItems.filter((item) => item.id !== id));
      toast.success("Item removed!");
    }
  };

  // ✅ Update quantity
  const updateQuantity = async (id, newQty) => {
    if (newQty < 1) return;
    const { error } = await supabase
      .from("cart")
      .update({ qty: newQty })
      .eq("id", id);
    if (error) {
      console.error("Qty update error:", error);
      toast.error("Failed to update quantity.");
    } else {
      setCartItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, qty: newQty } : item))
      );
      toast.success("Quantity updated!");
    }
  };

  const total = cartItems.reduce(
    (acc, item) => acc + (item.price || 0) * (item.qty || 1),
    0
  );

  // ✅ Cash on Delivery
  const handleCashOnDelivery = async () => {
    if (!user) return toast.error("Please log in first!");
    if (cartItems.length === 0) return toast.error("Your cart is empty!");

    try {
      const { error } = await supabase.from("orders").insert([
        {
          user_id: user.id,
          items: cartItems,
          total: total,
          payment_method: "Cash on Delivery",
          status: "Pending",
        },
      ]);
      if (error) throw error;
      await supabase.from("cart").delete().eq("user_id", user.id);
      setCartItems([]);
      toast.success("Order placed successfully! 💵");
      navigate("/orders");
    } catch (err) {
      console.error("COD Error:", err);
      toast.error("Could not place order. Try again!");
    }
  };

  // ✅ Razorpay Online Payment
  const handleRazorpayPayment = async () => {
    if (!user) return toast.error("Please log in first!");
    if (cartItems.length === 0) return toast.error("Your cart is empty!");

    try {
      // 🔹 1. Create order via Supabase Edge Function
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
      console.log("Create Order Response:", data);
      if (!res.ok || !data?.order?.id) throw new Error(data.error || "Order failed");

      const { order } = data;

      // 🔹 2. Open Razorpay checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID_LIVE,
        amount: order.amount,
        currency: "INR",
        name: "KL Stall & Decors",
        description: "Online Payment",
        order_id: order.id,
        handler: async function (response) {
          try {
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
            console.log("Verify Payment Response:", verifyData);

            if (verifyData.success) {
              toast.success("Payment successful 🎉");
              await supabase.from("cart").delete().eq("user_id", user.id);
              setCartItems([]);
              navigate("/orders");
            } else {
              toast.error("Payment verification failed!");
            }
          } catch (verifyErr) {
            console.error("Payment verification error:", verifyErr);
            toast.error("Error verifying payment.");
          }
        },
        prefill: {
          name: userProfile?.full_name || "Customer",
          email: user?.email || "klstall.decors@gmail.com",
          contact: "9566061075",
        },
        theme: { color: "#FF66C4" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Online Payment Error:", err);
      toast.error("Payment failed. Try again.");
    }
  };

  if (loading)
    return <p className="text-center mt-10 text-gray-500">Loading cart...</p>;

  return (
    <motion.div
      className="min-h-screen w-full flex flex-col items-center justify-center bg-[#FFF5F9] text-[#1a1a1a] px-6 py-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Toaster position="bottom-center" reverseOrder={false} />
      <h1 className="text-3xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-[#FF66C4] to-[#FFDE59]">
        Your Cart 🛒
      </h1>

      {cartItems.length === 0 ? (
        <motion.div
          className="flex flex-col items-center justify-center text-[#1a1a1a]/70 mt-20"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
        >
          <p className="text-lg font-semibold">Your cart is empty!</p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/packages")}
            className="mt-6 bg-gradient-to-r from-[#FF66C4] to-[#FFDE59] text-white font-semibold px-6 py-3 rounded-full shadow-md hover:opacity-90"
          >
            Browse Packages
          </motion.button>
        </motion.div>
      ) : (
        <div className="w-full max-w-3xl space-y-6">
          {cartItems.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.02 }}
              className="bg-white border border-[#FF66C4]/30 rounded-xl p-5 flex items-center justify-between shadow-md"
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-lg border border-[#FF66C4]/20"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-sm text-gray-500">
                  No Image
                </div>
              )}

              <div className="flex-1 ml-4">
                <h2 className="font-semibold text-lg text-[#b9314f]">
                  {item.name}
                </h2>
                <p className="text-gray-700 text-sm">₹{item.price}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.id, (item.qty || 1) - 1)}
                  className="px-2 py-1 rounded-full bg-[#FFDE59] hover:bg-[#ffd83b] text-black font-bold"
                >
                  −
                </button>
                <span className="text-lg font-semibold">{item.qty || 1}</span>
                <button
                  onClick={() => updateQuantity(item.id, (item.qty || 1) + 1)}
                  className="px-2 py-1 rounded-full bg-[#FF66C4] hover:bg-[#ff4dab] text-white font-bold"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => removeFromCart(item.id)}
                className="ml-4 bg-gradient-to-r from-[#ff5858] to-[#ff7b7b] px-3 py-2 rounded-full text-white font-medium shadow-md hover:opacity-90"
              >
                ✕
              </button>
            </motion.div>
          ))}

          <div className="bg-white border border-[#FF66C4]/30 rounded-xl p-6 text-center shadow-md">
            <h3 className="text-2xl font-bold">
              Total:{" "}
              <span className="text-[#ff5858]">
                ₹{total.toLocaleString("en-IN")}
              </span>
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleCashOnDelivery}
              className="w-full sm:w-auto bg-gradient-to-r from-[#FFDE59] to-[#FF66C4] text-white font-semibold px-6 py-3 rounded-full shadow-md hover:opacity-90"
            >
              Cash on Delivery 💵
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleRazorpayPayment}
              className="w-full sm:w-auto bg-gradient-to-r from-[#FF66C4] to-[#FFDE59] text-white font-semibold px-6 py-3 rounded-full shadow-md hover:opacity-90"
            >
              Pay Online 💳
            </motion.button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
