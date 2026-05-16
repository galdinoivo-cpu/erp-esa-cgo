import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

/** Pasta do repositório = subcaminho em https://USER.github.io/REPO/ */
const GH_PAGES_BASE = "/erp-esa-cgo/";

export default defineConfig(({ mode }) => ({
  base: mode === "production" ? GH_PAGES_BASE : "/",
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
}));
