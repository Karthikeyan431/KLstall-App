// verifyPayment/index.js
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function verifySignature(order_id, payment_id, signature) {
  const payload = order_id + "|" + payment_id;
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(payload)
    .digest("hex");
  return expected === signature;
}

export async function main(req, res) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, payment_method } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const ok = verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    if (!ok) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    const { data, error } = await supabase
      .from("orders")
      .update({
        razorpay_payment_id,
        razorpay_signature,
        payment_status: "paid",
        payment_method: payment_method || null
      })
      .eq("razorpay_order_id", razorpay_order_id)
      .select()
      .single();

    if (error) {
      console.error("DB update error:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.json({ success: true, order: data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
