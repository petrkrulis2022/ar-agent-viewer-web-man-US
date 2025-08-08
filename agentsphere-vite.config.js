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
      // Add these for Solana wallet compatibility
      pino: "pino/browser",
      "pino/child": "pino/browser",
      "pino-pretty": false,
    },
  },
  define: {
    global: "globalThis",
    "process.env": {},
    Buffer: "Buffer",
  },
  optimizeDeps: {
    include: [
      "@solana/web3.js",
      "@solana/spl-token",
      "@solana/wallet-adapter-base",
      "@solana/wallet-adapter-react",
      "@solana/wallet-adapter-phantom",
      "buffer",
    ],
    exclude: ["pino-pretty"],
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
