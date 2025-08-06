import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      buffer: "buffer",
      stream: "stream-browserify",
      util: "util",
    },
  },
  define: {
    global: "globalThis",
    "process.env": {},
    Buffer: "Buffer",
  },
  optimizeDeps: {
    include: ["@solana/web3.js", "@solana/spl-token", "buffer"],
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: "globalThis",
      },
    },
  },
  server: {
    host: true,
    allowedHosts: "all",
  },
});
