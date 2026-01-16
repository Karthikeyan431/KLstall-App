// src/pages/Payout.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { Helmet } from "react-helmet-async";

export default function Payout() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    number: "",
    event_date: "",
    event_time: "",
    event_place: "",
    address: "",
    pincode: "",
    nearby_location: "",
    payment_method: "COD",
    online_type: "FULL",
  });

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
        .eq("user_id", data.user.id);

      if (!cartData || cartData.length === 0) {
        toast.error("Your cart is empty");
        navigate("/cart");
        return;
      }

      setCart(cartData);
      setLoading(false);
    };

    load();
  }, [navigate]);

  /* ---------------- HELPERS ---------------- */
  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const total = cart.reduce(
    (sum, i) => sum + Number(i.price) * Number(i.qty),
    0
  );

  const payable =
    form.payment_method === "ONLINE" && form.online_type === "ADVANCE"
      ? Math.round(total * 0.2)
      : total;

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async () => {
    const required = [
      "name",
      "number",
      "event_date",
      "event_time",
      "event_place",
      "address",
      "pincode",
    ];

    for (const r of required) {
      if (!form[r]) {
        toast.error("Please fill all required fields");
        return;
      }
    }

    setSubmitting(true);

    try {
      const { error } = await supabase.from("payout_details").insert({
        user_id: user.id,
        ...form,
      });

      if (error) throw error;

      sessionStorage.setItem(
        "checkout_payload",
        JSON.stringify({
          customer: form,
          cart,
          total,
          payable,
        })
      );

      toast.success("Details saved successfully");
      navigate("/checkout");
    } catch (err) {
      toast.error("Unable to save details");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading…
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Payout | KL Stall</title>
      </Helmet>

      <Toaster />

      <div className="min-h-screen bg-gradient-to-b from-[#FFF5F9] to-[#FFE4EC] px-4 py-10">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-extrabold mb-8 text-[#b9314f]">
            🧾 Customer & Event Details
          </h1>

          {/* FORM CARD */}
          <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 grid md:grid-cols-2 gap-5">
            {[
              ["Name", "name"],
              ["Mobile Number", "number"],
              ["Event Date", "event_date", "date"],
              ["Event Time", "event_time", "time"],
              ["Event Place", "event_place"],
              ["Pincode", "pincode"],
              ["Nearby Location (optional)", "nearby_location"],
            ].map(([label, key, type]) => (
              <div key={key} className={key === "event_place" ? "md:col-span-2" : ""}>
                <label className="block font-semibold text-sm mb-1 text-gray-700">
                  {label} :
                </label>
                <input
                  type={type || "text"}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FF66C4]"
                  value={form[key]}
                  onChange={(e) => update(key, e.target.value)}
                />
              </div>
            ))}

            <div className="md:col-span-2">
              <label className="block font-semibold text-sm mb-1 text-gray-700">
                Address :
              </label>
              <textarea
                rows="3"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FF66C4]"
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
              />
            </div>
          </div>

          {/* PAYMENT */}
          <div className="mt-8 bg-white rounded-3xl shadow-xl p-6">
            <h2 className="font-bold text-lg mb-4 text-[#b9314f]">
              Payment Method
            </h2>

            <label className="block font-medium">
              <input
                type="radio"
                checked={form.payment_method === "COD"}
                onChange={() => update("payment_method", "COD")}
              />{" "}
              Cash on Delivery
            </label>

            <label className="block font-medium mt-2">
              <input
                type="radio"
                checked={form.payment_method === "ONLINE"}
                onChange={() => update("payment_method", "ONLINE")}
              />{" "}
              Online Payment
            </label>

            {form.payment_method === "ONLINE" && (
              <div className="ml-6 mt-3 space-y-2">
                <label>
                  <input
                    type="radio"
                    checked={form.online_type === "FULL"}
                    onChange={() => update("online_type", "FULL")}
                  />{" "}
                  Full Payment
                </label>
                <label>
                  <input
                    type="radio"
                    checked={form.online_type === "ADVANCE"}
                    onChange={() => update("online_type", "ADVANCE")}
                  />{" "}
                  Advance (20%)
                </label>
              </div>
            )}
          </div>

          {/* SUMMARY */}
          <div className="mt-8 bg-white rounded-3xl shadow-xl p-6">
            <div className="flex justify-between text-lg">
              <span>Total</span>
              <span>₹ {total}</span>
            </div>

            <div className="flex justify-between text-xl font-bold mt-2">
              <span>Payable</span>
              <span>₹ {payable}</span>
            </div>

            <button
              disabled={submitting}
              onClick={handleSubmit}
              className="mt-6 w-full py-4 rounded-xl text-white font-semibold text-lg bg-gradient-to-r from-[#FF66C4] to-[#FFDE59] disabled:opacity-60"
            >
              {submitting ? "Saving…" : "Confirm & Continue"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
