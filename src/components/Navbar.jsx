import React, { useState, useEffect, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { ThemeContext } from "../contexts/ThemeContext";
import { useTranslation } from "react-i18next";

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { cartCount, fetchCart } = useCart();
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();

  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const authPages = ["/login", "/signup", "/reset-password", "/update-password"];
  const isAuthPage = authPages.includes(location.pathname);

  const links = [
    { name: t("home"), path: "/" },
    { name: t("packages"), path: "/packages" },
    { name: t("profile"), path: "/profile" },
    { name: t("settings"), path: "/settings" },
  ];

  useEffect(() => {
    if (user) fetchCart();
  }, [user]);

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
    <nav className="fixed top-0 left-0 w-full z-50 shadow-md">
      <div
        className={`
          w-full px-4 sm:px-8 flex items-center justify-between h-16 backdrop-blur-md transition-all duration-300
          ${theme === "dark"
            ? "bg-[#0E0E0E]/80 text-white"
            : "bg-[#FFF5F9]/70 text-[#1a1a1a] border-b border-[#FF66C4]/20"
          }
        `}
      >
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center space-x-2 hover:scale-105 transition-transform"
        >
          <img
            src="https://i.ibb.co/FkYCyrW1/IMG-20250917-214439-removebg-preview.png"
            alt="Logo"
            className="h-10 w-auto"
          />
          <span
            className={`font-extrabold text-lg tracking-wide ${
              theme === "dark" ? "text-white" : "text-[#1a1a1a]"
            }`}
          >
            KL STALL
          </span>
        </Link>

        {!isAuthPage && (
          <>
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">

              {links.map((l) => (
                <Link
                  key={l.path}
                  to={l.path}
                  className={`
                    transition font-medium 
                    ${location.pathname === l.path
                      ? "text-amber-500 font-bold"
                      : theme === "dark"
                      ? "text-gray-300 hover:text-amber-400"
                      : "text-[#1a1a1a] hover:text-amber-500"
                    }
                  `}
                >
                  {l.name}
                </Link>
              ))}

              {/* Admin */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`
                    transition font-medium 
                    ${location.pathname === "/admin"
                      ? "text-amber-500 font-bold"
                      : theme === "dark"
                      ? "text-gray-200 hover:text-amber-400"
                      : "text-[#1a1a1a] hover:text-amber-500"
                    }
                  `}
                >
                  Admin
                </Link>
              )}

              {/* Cart */}
              <Link
                to="/cart"
                className={`relative font-medium transition ${
                  theme === "dark"
                    ? "text-gray-200 hover:text-amber-400"
                    : "text-[#1a1a1a] hover:text-amber-500"
                }`}
              >
                🛒 {t("cart")}
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs rounded-full px-2 py-0.5 shadow animate-pulse">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Login / Logout */}
              {!user ? (
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-md bg-amber-400 text-black font-semibold shadow hover:bg-amber-300 transition"
                >
                  {t("login")}
                </Link>
              ) : (
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-md bg-red-600 text-white font-semibold shadow hover:bg-red-700 transition"
                >
                  {t("logout")}
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle menu"
                className="flex flex-col justify-center items-center w-10 h-10"
              >
                <span
                  className={`block w-6 h-0.5 rounded transition-all duration-300 ${
                    theme === "dark" ? "bg-white" : "bg-[#1a1a1a]"
                  } ${isOpen ? "rotate-45 translate-y-2" : "-translate-y-2"}`}
                />
                <span
                  className={`block w-6 h-0.5 rounded transition-all duration-300 ${
                    theme === "dark" ? "bg-white" : "bg-[#1a1a1a]"
                  } ${isOpen ? "opacity-0" : "opacity-100"}`}
                />
                <span
                  className={`block w-6 h-0.5 rounded transition-all duration-300 ${
                    theme === "dark" ? "bg-white" : "bg-[#1a1a1a]"
                  } ${
                    isOpen ? "-rotate-45 -translate-y-2" : "translate-y-2"
                  }`}
                />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Mobile Menu */}
      {!isAuthPage && isOpen && (
        <div
          className={`
            md:hidden fixed top-16 left-0 w-full border-t p-5 space-y-5 z-40 transition-all duration-300
            ${theme === "dark"
              ? "bg-[#0E0E0E] text-white border-gray-700"
              : "bg-[#FFF5F9] text-[#1a1a1a] border-pink-200"
            }
          `}
        >
          {links.map((l) => (
            <Link
              key={l.path}
              to={l.path}
              onClick={() => setIsOpen(false)}
              className={`block text-lg ${
                location.pathname === l.path ? "text-amber-500 font-bold" : ""
              }`}
            >
              {l.name}
            </Link>
          ))}

          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setIsOpen(false)}
              className="block text-lg text-amber-500 font-semibold"
            >
              Admin
            </Link>
          )}

          {!user ? (
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="w-full text-center px-4 py-2 bg-amber-400 rounded-lg font-semibold text-black"
            >
              {t("login")}
            </Link>
          ) : (
            <button
              onClick={() => {
                setIsOpen(false);
                handleLogout();
              }}
              className="w-full text-center px-4 py-2 bg-red-600 rounded-lg font-semibold text-white"
            >
              {t("logout")}
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
