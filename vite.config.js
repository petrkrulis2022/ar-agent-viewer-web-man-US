
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
      path: "path-browserify",
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
    port: 5173,
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
      ],
      credentials: true,
    },
  },
});
