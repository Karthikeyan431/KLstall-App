// src/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { cartCount, fetchCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // ✅ Pages that show only logo
  const authPages = ["/login", "/signup", "/reset-password", "/update-password"];
  const isAuthPage = authPages.includes(location.pathname);

  const links = [
    { name: "Home", path: "/" },
    { name: "Packages", path: "/packages" },
    { name: "Profile", path: "/profile" },
  ];

  // ✅ Load cart whenever user logs in
  useEffect(() => {
    if (user) fetchCart();
  }, [user, fetchCart]);

  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false);
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50">
      <div className="w-full px-4 sm:px-8 flex items-center justify-between h-16 bg-white/30 backdrop-blur-md shadow-sm">
        {/* ✅ Logo Section */}
        <Link
          to="/"
          className="flex items-center space-x-2 hover:scale-105 transition-transform duration-200"
        >
          <img
            src="https://i.ibb.co/FkYCyrW1/IMG-20250917-214439-removebg-preview.png"
            alt="Logo"
            className="h-10 w-auto"
          />
          <span className="font-extrabold text-lg text-[#3b2b2b] tracking-wide">
            KL STALL
          </span>
        </Link>

        {/* ✅ Hide buttons on auth pages */}
        {!isAuthPage && (
          <>
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
              {links.map((l) => (
                <Link
                  key={l.path}
                  to={l.path}
                  className={`transition duration-200 font-medium ${
                    location.pathname === l.path
                      ? "text-amber-600 font-semibold"
                      : "text-gray-800 hover:text-amber-500"
                  }`}
                >
                  {l.name}
                </Link>
              ))}

              {isAdmin && (
                <Link
                  to="/admin"
                  className={`transition duration-200 ${
                    location.pathname === "/admin"
                      ? "text-amber-600 font-semibold"
                      : "text-gray-800 hover:text-amber-500"
                  }`}
                >
                  Admin
                </Link>
              )}

              {/* ✅ Cart with soft glow animation */}
              <Link
                to="/cart"
                className="relative text-gray-800 hover:text-amber-500 font-medium transition"
              >
                🛒 Cart
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full px-2 py-0.5 shadow animate-pulse-glow">
                    {cartCount}
                  </span>
                )}
              </Link>

              {!user ? (
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-md bg-amber-400 text-black font-semibold shadow-sm hover:bg-amber-300 transition"
                >
                  Login
                </Link>
              ) : (
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-md bg-red-600 text-white font-semibold shadow-sm hover:bg-red-700 transition"
                >
                  Logout
                </button>
              )}
            </div>

            {/* ✅ Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle menu"
                className="relative flex flex-col justify-center items-center w-10 h-10 group"
              >
                <span
                  className={`block w-6 h-0.5 bg-gray-800 rounded transition-all duration-300 transform ${
                    isOpen ? "rotate-45 translate-y-0.5" : "-translate-y-2"
                  }`}
                />
                <span
                  className={`block w-6 h-0.5 bg-gray-800 rounded transition-all duration-300 transform ${
                    isOpen ? "opacity-0 scale-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`block w-6 h-0.5 bg-gray-800 rounded transition-all duration-300 transform ${
                    isOpen ? "-rotate-45 -translate-y-0.5" : "translate-y-2"
                  }`}
                />
              </button>
            </div>
          </>
        )}
      </div>

      {/* ✅ Mobile Dropdown Menu */}
      {!isAuthPage && isOpen && (
        <div className="md:hidden fixed top-16 left-0 w-full bg-white/95 backdrop-blur-sm border-t border-gray-100 p-5 space-y-4 z-40 animate-slide-down">
          {links.map((l) => (
            <Link
              key={l.path}
              to={l.path}
              onClick={() => setIsOpen(false)}
              className={`block text-lg transition duration-200 ${
                location.pathname === l.path
                  ? "text-amber-600 font-semibold"
                  : "text-gray-900 hover:text-amber-500"
              }`}
            >
              {l.name}
            </Link>
          ))}

          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setIsOpen(false)}
              className="block text-lg text-amber-600 font-semibold"
            >
              Admin
            </Link>
          )}

          {/* ✅ Mobile Cart with soft glow */}
          <Link
            to="/cart"
            onClick={() => setIsOpen(false)}
            className="block text-lg text-gray-900 font-medium"
          >
            🛒 Cart{" "}
            {cartCount > 0 && (
              <span className="text-red-500 font-semibold animate-pulse-glow">
                ({cartCount})
              </span>
            )}
          </Link>

          {!user ? (
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="inline-block w-full text-center px-4 py-2 bg-amber-400 text-black rounded-lg font-semibold shadow hover:bg-amber-300 transition"
            >
              Login
            </Link>
          ) : (
            <button
              onClick={() => {
                setIsOpen(false);
                handleLogout();
              }}
              className="inline-block w-full text-center px-4 py-2 bg-red-600 rounded-lg font-semibold text-white shadow hover:bg-red-700 transition"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
