import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: "dist/stats.html",
      open: false,      // mobile safe (won’t auto-open)
      gzipSize: true,
      brotliSize: true
    })
  ],
  server: {
    host: true,   // mobile browser support
    port: 5173
  }
});
