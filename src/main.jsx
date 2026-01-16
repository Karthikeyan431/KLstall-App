import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./responsive-fix.css";
import "./i18n";
import App from "./App.jsx";
import { HelmetProvider } from "react-helmet-async";

import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";

// THE TWO CONTEXTS WE USE
import { ThemeProvider } from "./contexts/ThemeContext";
import { PreferencesProvider } from "./contexts/PreferencesContext";

const root = createRoot(document.getElementById("root"));

root.render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        {/* Global Theme & Preferences */}
        <ThemeProvider>
          <PreferencesProvider>
            <HelmetProvider>
              <App />
            </HelmetProvider>
          </PreferencesProvider>
        </ThemeProvider>
      </CartProvider>
    </AuthProvider>
  </StrictMode>
);
