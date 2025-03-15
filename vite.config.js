import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  plugins: [react()],
  base: "/openai-limit-tracker/", // GitHub Pages deployment
  server: {
    port: 3000,
    open: true,
    proxy: {
      "/api": "http://localhost:5000", // Redirect API requests to backend
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false, // Hide source maps for security
  },
});
