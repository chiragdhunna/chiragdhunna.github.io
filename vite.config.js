import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/",
  server: {
    port: 3000,
  },
  optimizeDeps: {
    include: ["react-pdf", "pdfjs-dist"],
  },
  resolve: {
    alias: {
      "pdfjs-dist": "pdfjs-dist/legacy/build/pdf",
    },
  },
});
