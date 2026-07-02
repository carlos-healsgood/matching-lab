import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Served from https://carlos-healsgood.github.io/matching-lab/ on GitHub Pages,
// so the production bundle needs the repo name as base. Dev stays at root.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/matching-lab/" : "/",
  plugins: [react(), tailwindcss()],
}));
