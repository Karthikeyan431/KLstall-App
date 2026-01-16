// src/pages/Cart.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { Helmet } from "react-helmet-async";

export default function Cart() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- LOAD USER + CART ---------------- */
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        navigate("/login");
        return;
      }

      setUser(data.user);

      const { data: cartData } = await supabase
        .from("cart")
        .select("*")
        .eq("user_id", data.user.id)
        .order("created_at");

      setCart(cartData || []);
      setLoading(false);
    };

    load();
  }, [navigate]);

  /* ---------------- HELPERS ---------------- */
  const total = cart.reduce(
    (sum, i) => sum + Number(i.price) * Number(i.qty),
    0
  );

  const updateQty = async (id, qty) => {
    if (qty < 1) return;

    await supabase.from("cart").update({ qty }).eq("id", id);

    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty } : i))
    );
  };

  const removeItem = async (id) => {
    await supabase.from("cart").delete().eq("id", id);
    setCart((prev) => prev.filter((i) => i.id !== id));
    toast.success("Item removed");
  };

  /* ---------------- UI ---------------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading cart…
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Cart | KL Stall</title>
      </Helmet>

      <Toaster />

      <div className="min-h-screen max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-extrabold mb-8">🛒 Your Cart</h1>

        {cart.length === 0 ? (
          <p className="text-gray-500">Your cart is empty</p>
        ) : (
          <>
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 items-center bg-white rounded-xl p-4 shadow"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />

                  <div className="flex-1">
                    <h2 className="font-semibold">{item.name}</h2>
                    <p className="text-sm text-gray-500">
                      ₹ {item.price}
                    </p>

                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() => updateQty(item.id, item.qty - 1)}
                        className="px-3 py-1 bg-gray-200 rounded"
                      >
                        −
                      </button>

                      <span className="font-semibold">{item.qty}</span>

                      <button
                        onClick={() => updateQty(item.id, item.qty + 1)}
                        className="px-3 py-1 bg-gray-200 rounded"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold">
                      ₹ {item.price * item.qty}
                    </p>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 text-sm mt-2"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 bg-white rounded-xl p-6 shadow">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>₹ {total}</span>
              </div>

              <button
                onClick={() => navigate("/payout")}
                className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-yellow-400 text-white font-semibold"
              >
                Proceed to Payout
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
