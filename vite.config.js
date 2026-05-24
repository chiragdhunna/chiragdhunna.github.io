import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import basicSsl from "@vitejs/plugin-basic-ssl";
import path from "path";

export default defineConfig(({ command }) => ({
  plugins: [react(), command === "serve" && basicSsl()].filter(Boolean),
  base: "/",
  server: {
    port: 3000,
    host: true,
    https: true,
  },
  optimizeDeps: {
    include: ["react-pdf", "pdfjs-dist"],
  },
  resolve: {
    alias: {
      "pdfjs-dist": "pdfjs-dist/legacy/build/pdf",
      "@": path.resolve(__dirname, "./src"),
      "@assets": path.resolve(__dirname, "./src/assets"),
    },
  },
  assetsInclude: ["**/*.png", "**/*.jpg", "**/*.jpeg", "**/*.svg", "**/*.gif"],
}));
