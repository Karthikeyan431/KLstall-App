// src/components/PaymentButton.jsx
import React, { useState } from "react";
import axios from "axios";

function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("Razorpay SDK failed to load"));
    document.body.appendChild(script);
  });
}

export default function PaymentButton({ amount, user }) {
  const [debug, setDebug] = useState("Ready...");

  const log = (msg) => {
    console.log(msg);
    setDebug((prev) => prev + "\n" + msg);
  };

  const handlePayment = async () => {
    log("🟢 Pay button clicked");

    try {
      await loadRazorpayScript();
      log("✅ Razorpay SDK loaded");

      const createOrderUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/createOrder`;
      log("🌐 Calling createOrder: " + createOrderUrl);

      // ✅ Public function call (no authorization header needed)
      const createOrderResp = await axios.post(createOrderUrl, {
        amount,
        user_id: user?.id || null,
      });

      log("🧾 Response: " + JSON.stringify(createOrderResp.data));

      const order = createOrderResp.data.order || createOrderResp.data;

      if (!order || !order.id) {
        log("❌ Invalid order response");
        alert("Invalid order response — check Supabase function logs");
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "KL Stall & Decors",
        description: "Order Payment",
        order_id: order.id,
        handler: function (response) {
          log("✅ Payment success: " + JSON.stringify(response));
          alert("✅ Payment Successful!");
        },
        prefill: {
          name: user?.full_name || "Customer",
          email: user?.email || "customer@example.com",
          contact: "9999999999",
        },
        theme: { color: "#F43F5E" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      log("🪄 Razorpay window opened");
    } catch (err) {
      log("❌ Error: " + err.message);
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={handlePayment}
        className="bg-gradient-to-r from-red-600 to-yellow-400 text-white px-6 py-3 rounded-lg shadow-md hover:opacity-90"
      >
        Pay ₹{amount}
      </button>

      {/* Debug Console Box for Mobile */}
      <pre className="bg-gray-100 text-black mt-3 p-2 rounded text-xs overflow-auto h-48">
        {debug}
      </pre>
    </div>
  );
}
