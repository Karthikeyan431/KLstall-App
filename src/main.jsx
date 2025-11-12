import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client'; // ✅ use only createRoot
import './index.css';
import './responsive-fix.css';
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from "./contexts/CartContext";

const root = createRoot(document.getElementById('root')); // create root
root.render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
       <App />
      </CartProvider>
    </AuthProvider>
  </StrictMode>
);
