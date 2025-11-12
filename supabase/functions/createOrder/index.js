// supabase/functions/createOrder/index.ts

import Razorpay from "https://esm.sh/razorpay@2.9.4";

Deno.serve(async (req) => {
  // ✅ Handle preflight (CORS) requests
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  try {
    const body = await req.json();

    const key_id = Deno.env.get("RAZORPAY_KEY_ID");
    const key_secret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!key_id || !key_secret) {
      return new Response(
        JSON.stringify({ error: "Missing Razorpay credentials" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    const razorpay = new Razorpay({
      key_id,
      key_secret,
    });

    const order = await razorpay.orders.create({
      amount: body.amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        user_id: body.user_id || "unknown",
      },
    });

    return new Response(JSON.stringify(order), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // ✅ CORS fixed
      },
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*", // ✅ CORS fixed
        },
      }
    );
  }
});
