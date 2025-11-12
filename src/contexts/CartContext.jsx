// src/contexts/CartContext.jsx
import React, { createContext, useContext, useState, useCallback } from "react";
import { supabase } from "../lib/supabase"; // ✅ Make sure this path is correct

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  // ✅ Fetch cart from Supabase
  const fetchCart = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setCart([]);
      setCartCount(0);
      return;
    }

    const { data, error } = await supabase
      .from("cart")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error loading cart:", error);
      return;
    }

    setCart(data || []);
    setCartCount(data?.length || 0);
  }, []);

  // ✅ Add item to cart (syncs with Supabase)
  const addToCart = async (item) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Please log in to add items!");

    const existing = cart.find((p) => p.id === item.id);
    if (existing) {
      await supabase
        .from("cart")
        .update({ quantity: existing.quantity + 1 })
        .eq("id", existing.id);
    } else {
      await supabase.from("cart").insert([
        {
          user_id: user.id,
          name: item.title,
          price: item.price,
          image: item.image_url || null,
          quantity: 1,
        },
      ]);
    }

    await fetchCart(); // refresh global state
  };

  // ✅ Update quantity
  const updateQuantity = async (id, newQty) => {
    if (newQty <= 0) return removeFromCart(id);
    await supabase.from("cart").update({ quantity: newQty }).eq("id", id);
    await fetchCart();
  };

  // ✅ Remove from cart
  const removeFromCart = async (id) => {
    await supabase.from("cart").delete().eq("id", id);
    await fetchCart();
  };

  // ✅ Clear entire cart
  const clearCart = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("cart").delete().eq("user_id", user.id);
    setCart([]);
    setCartCount(0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
