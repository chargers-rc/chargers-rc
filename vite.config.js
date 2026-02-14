import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import UnoCSS from "unocss/vite"
import path from "path"

export default defineConfig({
  base: "/",   // ⭐ REQUIRED for multi‑tenant routing

  plugins: [
    react(),
    UnoCSS(),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@app": path.resolve(__dirname, "src/app"),
      "@components": path.resolve(__dirname, "src/components"),
      "@context": path.resolve(__dirname, "src/context"),
      "@utils": path.resolve(__dirname, "src/utils"),
    },
  },
})
