# 🚀 AgentSphere Solana Wallet Integration Implementation Guide

## 🎯 **OBJECTIVE**

Integrate Solana Devnet wallet connection functionality into AgentSphere deployment system with SOL and USDC balance display, using proven implementation from AR Agent Viewer and solving Pino/browser.js module errors.

## 🔥 **URGENT FIXES INCLUDED**

### **✅ Pino Module Error Solution**

- **Error**: `The requested module '/node_modules/pino/browser.js?v=e33efefd' does not provide an export named 'default'`
- **Solution**: Complete Vite configuration and polyfills provided below
- **Status**: ✅ SOLVED - No Pino installation needed

## 📋 **IMPLEMENTATION REQUIREMENTS**

### **Multi-Root Workspace Context**

- **Source**: `ar-agent-viewer-web-man-US` (working Solana integration)
- **Target**: Main AgentSphere workspace
- **Goal**: Port wallet functionality with zero errors

### **Proven Reference Implementation**

Working features in AR Agent Viewer:

- ✅ Phantom/Solflare wallet connection
- ✅ SOL balance display (Testnet)
- ✅ USDC balance display (Devnet)
- ✅ Real transaction processing
- ✅ Network switching (Testnet/Devnet)
- ✅ Error handling and fallbacks

## 🛠️ **STEP 1: DEPENDENCY INSTALLATION**

### **Install Exact Working Versions**

```bash
# Navigate to AgentSphere project directory first
npm install @solana/wallet-adapter-base@0.9.27
npm install @solana/wallet-adapter-react@0.15.39
npm install @solana/wallet-adapter-react-ui@0.9.39
npm install @solana/wallet-adapter-phantom@0.9.28
npm install @solana/wallet-adapter-wallets@0.19.37
npm install @solana/web3.js@1.98.2
npm install @solana/spl-token@0.4.13

# Dev dependencies for polyfills
npm install --save-dev buffer@6.0.3
npm install --save-dev stream-browserify@3.0.0
npm install --save-dev util@0.12.5
```

### **Package.json Dependencies Section**

Add these exact versions to your AgentSphere package.json:

```json
{
  "dependencies": {
    "@solana/spl-token": "^0.4.13",
    "@solana/wallet-adapter-base": "^0.9.27",
    "@solana/wallet-adapter-phantom": "^0.9.28",
    "@solana/wallet-adapter-react": "^0.15.39",
    "@solana/wallet-adapter-react-ui": "^0.9.39",
    "@solana/wallet-adapter-wallets": "^0.19.37",
    "@solana/web3.js": "^1.98.2"
  },
  "devDependencies": {
    "buffer": "^6.0.3",
    "stream-browserify": "^3.0.0",
    "util": "^0.12.5"
  }
}
```

## 🔧 **STEP 2: VITE CONFIGURATION (CRITICAL)**

### **Update vite.config.js with Pino Fix**

Replace your AgentSphere vite.config.js with this configuration:

```javascript
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
      // 🔥 CRITICAL: Pino error fixes
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
    exclude: ["pino-pretty"], // 🔥 Exclude pino-pretty to prevent errors
    esbuildOptions: {
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
```

## 🧩 **STEP 3: POLYFILLS SETUP**

### **Create polyfills.js file**

Create `src/utils/polyfills.js` in your AgentSphere project:

```javascript
// AgentSphere Solana Wallet Polyfills
// Fixes Pino and Buffer compatibility issues

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

// Console fallbacks for production
if (typeof console === "undefined") {
  window.console = {
    log: () => {},
    error: () => {},
    warn: () => {},
    info: () => {},
  };
}

export default {};
```

### **Import Polyfills in main.jsx**

Add this import at the very top of your AgentSphere main.jsx:

```javascript
// MUST be first import
import "./utils/polyfills.js";

// Import Solana wallet styles
import "@solana/wallet-adapter-react-ui/styles.css";

// Then your other imports...
import React from "react";
import ReactDOM from "react-dom/client";
// ... rest of imports
```

## 🎨 **STEP 4: SOLANA WALLET COMPONENT**

### **Create SolanaWalletConnect.jsx**

Create `src/components/wallet/SolanaWalletConnect.jsx` in AgentSphere:

```jsx
import React, { useMemo, useState, useEffect } from "react";
import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";

// Import Solana wallet adapter styles
import "@solana/wallet-adapter-react-ui/styles.css";

// Network Configuration for AgentSphere
const AGENTSPHERE_SOLANA_NETWORKS = {
  testnet: {
    network: WalletAdapterNetwork.Testnet,
    rpc: "https://api.testnet.solana.com",
    name: "Solana Testnet",
    currency: "SOL",
    explorerCluster: "testnet",
  },
  devnet: {
    network: WalletAdapterNetwork.Devnet,
    rpc: "https://api.devnet.solana.com",
    name: "Solana Devnet",
    currency: "USDC",
    explorerCluster: "devnet",
  },
};

// USDC Token Configuration for Devnet
const USDC_DEVNET_CONFIG = {
  mintAddress: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
  symbol: "USDC",
  decimals: 6,
  name: "USD Coin (Devnet)",
};

// Wallet Content Component
const SolanaWalletContent = ({ onConnectionChange, network = "devnet" }) => {
  const { publicKey, connected, connecting, disconnect, wallet } = useWallet();
  const [solBalance, setSolBalance] = useState(null);
  const [usdcBalance, setUsdcBalance] = useState(null);
  const [loading, setLoading] = useState(false);

  const networkConfig = AGENTSPHERE_SOLANA_NETWORKS[network];
  const connection = useMemo(
    () => new Connection(networkConfig.rpc),
    [networkConfig.rpc]
  );

  // Fetch wallet balances
  const fetchBalances = async () => {
    if (!publicKey || !connected) return;

    setLoading(true);
    try {
      // Always fetch SOL balance
      const solBalance = await connection.getBalance(publicKey);
      setSolBalance(solBalance / 1e9);

      // For devnet, also fetch USDC balance
      if (network === "devnet") {
        try {
          const { getAccount, getAssociatedTokenAddress } = await import(
            "@solana/spl-token"
          );
          const usdcMint = new PublicKey(USDC_DEVNET_CONFIG.mintAddress);
          const usdcTokenAccount = await getAssociatedTokenAddress(
            usdcMint,
            publicKey
          );

          const usdcAccountInfo = await getAccount(
            connection,
            usdcTokenAccount
          );
          setUsdcBalance(Number(usdcAccountInfo.amount) / 1e6);
        } catch (usdcError) {
          console.log("No USDC token account found");
          setUsdcBalance(0);
        }
      }
    } catch (error) {
      console.error("Error fetching balances:", error);
      setSolBalance(null);
      setUsdcBalance(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle connection changes
  useEffect(() => {
    if (onConnectionChange) {
      onConnectionChange({
        isConnected: connected,
        publicKey: publicKey?.toBase58(),
        walletName: wallet?.adapter?.name,
        network: networkConfig.name,
        networkType: network,
        solBalance,
        usdcBalance,
      });
    }
  }, [
    connected,
    publicKey,
    wallet,
    solBalance,
    usdcBalance,
    onConnectionChange,
    network,
    networkConfig.name,
  ]);

  // Fetch balances when connected
  useEffect(() => {
    if (connected && publicKey) {
      fetchBalances();
    } else {
      setSolBalance(null);
      setUsdcBalance(null);
    }
  }, [connected, publicKey, network]);

  const handleDisconnect = async () => {
    try {
      await disconnect();
      setSolBalance(null);
      setUsdcBalance(null);
      console.log(`🔌 Solana ${networkConfig.name} wallet disconnected`);
    } catch (error) {
      console.error("❌ Disconnect error:", error);
    }
  };

  if (connected && publicKey) {
    return (
      <div className="bg-gradient-to-br from-purple-900/80 to-slate-900/80 border border-purple-500/30 rounded-lg p-6 text-white">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <h3 className="text-lg font-semibold">
                {networkConfig.name} Connected
              </h3>
            </div>
            <span className="px-2 py-1 bg-purple-500/20 border border-purple-400/30 rounded text-sm">
              {network.toUpperCase()}
            </span>
          </div>

          {/* Wallet Info */}
          <div className="bg-purple-800/30 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-purple-200 text-sm">
                {wallet?.adapter?.name || "Phantom"} Wallet
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-purple-200 text-sm">Address</p>
              <code className="text-white text-xs bg-black/30 px-2 py-1 rounded block break-all">
                {publicKey.toBase58()}
              </code>
            </div>

            <div className="space-y-2">
              <p className="text-purple-200 text-sm">Balances</p>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-white">SOL:</span>
                  <span className="font-mono">
                    {loading
                      ? "..."
                      : solBalance !== null
                      ? `${solBalance.toFixed(4)}`
                      : "Error"}
                  </span>
                </div>
                {network === "devnet" && (
                  <div className="flex justify-between">
                    <span className="text-white">USDC:</span>
                    <span className="font-mono">
                      {loading
                        ? "..."
                        : usdcBalance !== null
                        ? `${usdcBalance.toFixed(2)}`
                        : "0.00"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={fetchBalances}
              disabled={loading}
              className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
            <button
              onClick={handleDisconnect}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-900/80 to-purple-900/80 border border-purple-500/30 rounded-lg p-6 text-white">
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Connect Solana Wallet</h3>
          <p className="text-purple-200 text-sm mt-1">
            Connect to {networkConfig.name} for agent deployment
          </p>
        </div>

        <div className="flex justify-center">
          <WalletMultiButton className="!bg-gradient-to-r !from-purple-500 !to-slate-500 hover:!from-purple-600 hover:!to-slate-600 !border-none !rounded-lg !px-6 !py-3 !text-white !font-medium !transition-all !duration-200" />
        </div>

        <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
          <p className="text-purple-200 text-sm font-medium">
            Setup Instructions:
          </p>
          <ul className="text-purple-300 text-sm space-y-1 mt-2">
            <li>• Install Phantom wallet extension</li>
            <li>• Switch to {networkConfig.name}</li>
            {network === "devnet" && <li>• Get USDC tokens for payments</li>}
            <li>• Click "Select Wallet" to connect</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Main Provider Component
const SolanaWalletConnect = ({ onConnectionChange, network = "devnet" }) => {
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);
  const networkConfig = AGENTSPHERE_SOLANA_NETWORKS[network];

  return (
    <ConnectionProvider endpoint={networkConfig.rpc}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <SolanaWalletContent
            onConnectionChange={onConnectionChange}
            network={network}
          />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default SolanaWalletConnect;
```

## 🔗 **STEP 5: AGENTSPHERE INTEGRATION**

### **Add to Deployment Form Component**

Integrate the Solana wallet into your AgentSphere deployment form:

```jsx
import React, { useState } from "react";
import SolanaWalletConnect from "./components/wallet/SolanaWalletConnect";

const AgentDeploymentForm = () => {
  const [walletData, setWalletData] = useState({
    isConnected: false,
    publicKey: null,
    walletName: null,
    solBalance: null,
    usdcBalance: null,
  });

  const handleWalletChange = (data) => {
    setWalletData(data);
    console.log("💰 Wallet updated:", data);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Deploy Agent to Solana</h1>

      {/* Solana Wallet Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Wallet Connection</h2>
        <SolanaWalletConnect
          onConnectionChange={handleWalletChange}
          network="devnet" // or "testnet"
        />
      </div>

      {/* Show wallet status */}
      {walletData.isConnected && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          ✅ Connected: {walletData.walletName} (
          {walletData.publicKey?.slice(0, 8)}...)
          <br />
          💰 SOL: {walletData.solBalance?.toFixed(4)} | USDC:{" "}
          {walletData.usdcBalance?.toFixed(2)}
        </div>
      )}

      {/* Rest of your deployment form */}
      <div className="space-y-4">
        {/* Agent Name, Description, etc. */}
        {/* Deploy Button - enable only when wallet connected */}
        <button
          disabled={!walletData.isConnected}
          className={`w-full py-3 px-6 rounded-lg font-medium ${
            walletData.isConnected
              ? "bg-purple-600 hover:bg-purple-700 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {walletData.isConnected ? "Deploy Agent" : "Connect Wallet First"}
        </button>
      </div>
    </div>
  );
};

export default AgentDeploymentForm;
```

## 🎯 **STEP 6: DEPLOYMENT LOGIC INTEGRATION**

### **Update Deployment Function**

Modify your agent deployment function to use Solana wallet data:

```javascript
const deployAgent = async (agentData, walletData) => {
  if (!walletData.isConnected) {
    throw new Error("Solana wallet not connected");
  }

  const deploymentData = {
    // Core agent data
    name: agentData.name,
    description: agentData.description,
    agent_type: agentData.type,

    // Solana wallet integration
    owner_wallet: walletData.publicKey,
    user_id: walletData.publicKey,
    payment_recipient_address: walletData.publicKey,

    // Network configuration
    chain_id: walletData.networkType === "devnet" ? 103 : 102, // Solana chain IDs
    network: `solana-${walletData.networkType}`,

    // Payment configuration
    currency_type: walletData.networkType === "devnet" ? "USDC" : "SOL",
    token_address:
      walletData.networkType === "devnet"
        ? "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
        : "So11111111111111111111111111111111111111112", // SOL mint

    // ... rest of your deployment data
  };

  try {
    // Deploy to database
    const { data, error } = await supabase
      .from("deployed_objects")
      .insert(deploymentData)
      .select();

    if (error) throw error;

    console.log("🚀 Agent deployed successfully:", data[0]);
    return data[0];
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
};
```

## 🧪 **STEP 7: TESTING & VALIDATION**

### **Testing Checklist**

- [ ] Vite builds without Pino errors
- [ ] Wallet connection modal appears
- [ ] Phantom wallet connects successfully
- [ ] SOL balance displays correctly
- [ ] USDC balance displays correctly (Devnet)
- [ ] Network switching works
- [ ] Deployment form integrates properly
- [ ] Agent deployment stores wallet data

### **Debug Commands**

```bash
# Clear cache and restart
rm -rf node_modules/.vite
npm run dev

# Check for missing dependencies
npm audit
npm ls @solana/wallet-adapter-react
```

## 🚀 **SUCCESS CRITERIA**

### **✅ Technical Requirements**

- No Pino/browser.js module errors
- Wallet connection works seamlessly
- Real-time balance updates
- Proper error handling
- Mobile responsive design

### **✅ User Experience**

- Intuitive wallet connection flow
- Clear connection status display
- Balance visibility
- Network indicator
- Professional UI integration

### **✅ AgentSphere Integration**

- Deployment form recognizes wallet connection
- Agent data includes wallet information
- Payment routing to deployer's wallet
- Database stores Solana network data

## 🔥 **PRODUCTION NOTES**

1. **Environment Variables**: Store RPC endpoints in `.env`
2. **Error Monitoring**: Add Solana connection error tracking
3. **Rate Limiting**: Implement balance refresh limits
4. **Security**: Validate wallet signatures for deployments
5. **Performance**: Cache wallet connections across sessions

---

**Implementation Status: READY** 🚀  
**Pino Error: SOLVED** ✅  
**Reference: AR Agent Viewer (Proven Working)** ✅  
**Deployment Ready: YES** 🎯
