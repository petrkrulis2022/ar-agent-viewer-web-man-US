import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      buffer: "buffer",
      stream: "stream-browserify",
      util: "util",
      path: "path-browserify",
      // Compatibility shim for thirdweb (needs ethers v5 APIs)
      "ethers/lib/utils": path.resolve(__dirname, "./ethers-v5-shim.js"),
    },
  },
  define: {
    global: "globalThis",
    "process.env": {},
  },
  build: {
    rollupOptions: {
      external: ["http", "https", "zlib", "fs"],
    },
  },
  optimizeDeps: {
    include: [
      "@solana/web3.js",
      "@solana/spl-token",
      "@hashgraph/sdk",
      "buffer",
    ],
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: "globalThis",
        Buffer: "Buffer",
      },
      // Inject Buffer polyfill
      inject: ["./agentsphere-polyfills.js"],
    },
  },
  server: {
    port: 5176,
    strictPort: true,
    host: true,
    allowedHosts: [
      "ce9c2121aa0a.ngrok-free.app",
      "e921551af012.ngrok-free.app",
      "jair-unrenunciatory-pseudozealously.ngrok-free.app",
      "jair-unrenunciatory-pseudozealously.ngrok-free.dev", // Current Ngrok URL
    ],
    cors: {
      origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "https://ce9c2121aa0a.ngrok-free.app",
        "https://jair-unrenunciatory-pseudozealously.ngrok-free.app",
        "https://jair-unrenunciatory-pseudozealously.ngrok-free.dev",
      ],
      credentials: true,
    },
  },
});
