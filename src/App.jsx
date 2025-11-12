// src/App.jsx
import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Packages from "./pages/Packages";
import AdminPackages from "./pages/AdminPackages";
import Cart from "./pages/Cart";
import DebugAuth from "./pages/DebugAuth";
import AdminRoute from "./components/AdminRoute";
import AdminPage from "./pages/AdminPage";
import Home from "./pages/Home";
import ResetPassword from "./pages/ResetPassword";
import UpdatePassword from "./pages/UpdatePassword";
import Dashboard from "./pages/Dashboard";
import Contact from "./pages/Contact";
import Orders from "./pages/Orders";
import { Toaster } from "react-hot-toast";

// ✅ Floating chatbot component
import FloatingChatbot from "./components/FloatingChatbot";

// ✅ Inner component to use `useLocation` inside BrowserRouter
function AppContent() {
  const location = useLocation();

  // Pages where chatbot should be hidden
  const hideChatPages = [
    "/login",
    "/signup",
    "/reset-password",
    "/update-password",
  ];

  return (
    <div
      className="min-h-screen w-full overflow-x-hidden flex flex-col"
      style={{
        background:
          "linear-gradient(135deg, #FFDEE9 0%, #FFE3B3 50%, #FFF5F9 100%)",
        margin: 0,
        padding: 0,
        border: "none",
      }}
    >
      {/* ✅ Global Navbar */}
      <Navbar />

      {/* ✅ Main content area */}
      <main className="flex-1 pt-16 w-full overflow-hidden">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/packages" element={<Packages />} />
          <Route path="/admin-packages" element={<AdminPackages />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />
          <Route path="/cart" element={<Cart />} />
          <Route path="/debug-auth" element={<DebugAuth />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/update-password" element={<UpdatePassword />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>

        {/* ✅ Floating Chatbot on all pages except hidden ones */}
        {!hideChatPages.includes(location.pathname) && <FloatingChatbot />}

        {/* ✅ Global Toast Notifications */}
        <Toaster position="top-center" />
      </main>
    </div>
  );
}

// ✅ Root wrapper (BrowserRouter)
export default function App() {
  console.log("✅ App is rendering...");
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
