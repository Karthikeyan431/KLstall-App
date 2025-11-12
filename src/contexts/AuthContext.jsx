// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase"; // adjust path if needed

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function init() {
      setLoading(true);
      const { data: { session: curSession } = {} } = await supabase.auth.getSession();
      if (!mounted) return;

      setSession(curSession);
      const user = curSession?.user ?? null;

      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, is_admin")
          .eq("id", user.id)
          .single();
        if (error) {
          console.error("Failed to load profile:", error);
          setProfile(null);
        } else {
          setProfile(data);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    }

    init();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session ?? null);
      if (!session) {
        setProfile(null);
        return;
      }

      (async () => {
        const user = session.user;
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, is_admin")
          .eq("id", user.id)
          .single();
        if (!error) setProfile(data);
      })();
    });

    return () => {
      mounted = false;
      if (authListener?.subscription) authListener.subscription.unsubscribe();
      else if (authListener?.unsubscribe) authListener.unsubscribe();
    };
  }, []);

  // ✅ Add logout function
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setSession(null);
      setProfile(null);
      console.log("✅ User logged out successfully");
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  };

  const value = {
    loading,
    session,
    user: session?.user ?? null,
    profile,
    isAdmin: !!profile?.is_admin,
    logout, // ← make it available
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
