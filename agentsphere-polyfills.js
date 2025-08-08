// AgentSphere Solana Wallet Fix for Pino Error
// Add this to your main.jsx or App.jsx in AgentSphere

// Fix for Pino browser compatibility
if (typeof global === "undefined") {
  window.global = window;
}

// Buffer polyfill (critical for Solana)
import { Buffer } from "buffer";
window.Buffer = Buffer;

// Process polyfill
window.process = {
  env: {},
  browser: true,
  version: "",
  versions: {
    node: "",
  },
};

export default {};
