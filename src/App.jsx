// src/App.jsx

import React, { useContext } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";

// Pages
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import UpdatePassword from "./pages/UpdatePassword";
import Profile from "./pages/Profile";
import Packages from "./pages/Packages";
import Cart from "./pages/Cart";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Settings from "./pages/Settings";
import Contact from "./pages/Contact";
import AdminPackages from "./pages/AdminPackages";
import AdminPage from "./pages/AdminPage";
import DebugAuth from "./pages/DebugAuth";

// Components
import Navbar from "./components/Navbar";
import AdminRoute from "./components/AdminRoute";
import ChatWidget from "./components/ChatWidget";   // ⭐ Chatbot added

// Providers
import { ThemeProvider } from "./contexts/ThemeContext";
import { PreferencesProvider } from "./contexts/PreferencesContext";
import { ThemeContext } from "./contexts/ThemeContext";
import { PreferencesContext } from "./contexts/PreferencesContext";

// Toast
import { Toaster } from "react-hot-toast";

function AppContent() {
  const { theme } = useContext(ThemeContext);
  const { prefs } = useContext(PreferencesContext);

  return (
    <div
      className={`min-h-screen w-full flex flex-col overflow-x-hidden transition ${
        theme === "dark"
          ? "dark bg-[#0f0f0f] text-white"
          : "bg-[#FFF3EC] text-[#1a1a1a]"
      }`}
    >
      {/* Navbar */}
      <Navbar />

      {/* PAGES */}
      <main className="flex-1 pt-16">
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Auth */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/update-password" element={<UpdatePassword />} />

          {/* User Pages */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/packages" element={<Packages />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/contact" element={<Contact />} />

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />
          <Route path="/admin-packages" element={<AdminPackages />} />

          {/* Debug */}
          <Route path="/debug-auth" element={<DebugAuth />} />
        </Routes>

        <Toaster position="top-center" />
      </main>

      {/* ⭐ AI CHATBOT ALWAYS ON SCREEN */}
      <ChatWidget />
    </div>
  );
}

export default function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <PreferencesProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </PreferencesProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
}
