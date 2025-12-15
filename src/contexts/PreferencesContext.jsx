// src/contexts/PreferencesContext.jsx
import { createContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import i18n from "../i18n";

export const PreferencesContext = createContext();

export function PreferencesProvider({ children }) {
  const [prefs, setPrefs] = useState({
    language: "en",
    notifications: true,
    chatbot_enabled: true,
  });

  const [loading, setLoading] = useState(true);

  // 🔥 Load preferences from DB on login
  useEffect(() => {
    const loadPreferences = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!error && data) {
        setPrefs(data);

        // 🔥 Apply language immediately after loading
        if (data.language) {
          i18n.changeLanguage(data.language);
        }
      }

      setLoading(false);
    };

    loadPreferences();
  }, []);

  // 🔥 Update preferences (local + DB)
  const updatePrefs = async (updates) => {
    const newPrefs = { ...prefs, ...updates };

    // Update local UI immediately
    setPrefs(newPrefs);

    // 🔥 Update language immediately (very important for Tamil)
    if (updates.language) {
      i18n.changeLanguage(updates.language);
    }

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) return;

    // Save to DB
    await supabase.from("preferences").upsert({
      user_id: user.id,
      ...newPrefs,
    });
  };

  return (
    <PreferencesContext.Provider value={{ prefs, updatePrefs, loading }}>
      {children}
    </PreferencesContext.Provider>
  );
}
