// src/App.jsx

import React, { useContext, Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";

// Lazy-loaded Pages
const Home = lazy(() => import("./pages/Home"));
const Signup = lazy(() => import("./pages/Signup"));
const Login = lazy(() => import("./pages/Login"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const UpdatePassword = lazy(() => import("./pages/UpdatePassword"));
const Profile = lazy(() => import("./pages/Profile"));
const Packages = lazy(() => import("./pages/Packages"));
const Cart = lazy(() => import("./pages/Cart"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Orders = lazy(() => import("./pages/Orders"));
const Settings = lazy(() => import("./pages/Settings"));
const Contact = lazy(() => import("./pages/Contact"));
const AdminPackages = lazy(() => import("./pages/AdminPackages"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const DebugAuth = lazy(() => import("./pages/DebugAuth"));
const Payout = lazy(() => import("./pages/Payout"));
const Checkout = lazy(() => import("./pages/Checkout"));

// Components
import Navbar from "./components/Navbar";
import AdminRoute from "./components/AdminRoute";
import ChatWidget from "./components/ChatWidget";
import PageLoader from "./components/PageLoader";

// Providers & Contexts
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

      {/* Pages */}
      <main className="flex-1 pt-16">
        <Suspense fallback={<PageLoader />}>
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
            <Route path="/payout" element={<Payout />} />
            <Route path="/checkout" element={<Checkout />} />            

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
        </Suspense>

        <Toaster position="top-center" />
      </main>

      {/* AI Chatbot */}
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
