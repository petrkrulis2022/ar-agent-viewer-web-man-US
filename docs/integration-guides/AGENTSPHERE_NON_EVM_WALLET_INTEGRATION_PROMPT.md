# AgentSphere Non-EVM Wallet Integration Implementation Prompt

## 🎯 **Objective**

Extend AgentSphere's AR QR payment system to support non-EVM networks (starting with Solana Devnet) with the same multi-chain wallet connection modal interface that's currently working for EVM networks.

## 🚨 **IMMEDIATE PRIORITY FIX REQUIRED**

**Current Bug**: AR viewer showing Ethereum address `0x6e942bd90be8e31f50fe453e00dc4710c85a6b41` when Phantom wallet is connected to Solana Devnet with address `Dn382aRJfXJwyE12Yck3mLSXtGeMQdcSJ7NR5wsQaJd5`.

**Root Cause**: Wallet detection logic prioritizes Ethereum over Solana, even when user is actively connected to Solana network.

**Required Fix**: Implement proper network-aware wallet detection that:

1. Checks Solana connection status first
2. Uses Solana address when connected to Solana networks
3. Falls back to Ethereum only when Solana not connected
4. Updates AR viewer to display correct wallet address based on active network

## 📋 **Current State Analysis**

### ✅ **What's Already Working:**

1. **EVM Networks**: Complete support for 5 EVM testnets
2. **Multi-Chain Wallet Modal**: UI exists with "EVM Networks" and "Other Networks" tabs
3. **Solana Devnet**: Connected via Phantom wallet (5.0000 SOL balance shown)
4. **Hedera Network**: Listed in the "Other Networks" section
5. **Unified Wallet Connection**: Modal interface supports both network types

### ⚠️ **CRITICAL ISSUE IDENTIFIED:**

**Phantom Wallet Network Mismatch**:

- **Expected**: Solana Devnet address `Dn382aRJfXJwyE12Yck3mLSXtGeMQdcSJ7NR5wsQaJd5`
- **Actual**: Ethereum Sepolia address `0x6e942bd90be8e31f50fe453e00dc4710c85a6b41`
- **Root Cause**: AR viewer defaults to Ethereum connection even when Phantom is connected to Solana
- **Impact**: Users cannot make payments to Solana agents despite having Solana wallet connected

### 🔍 **Current Architecture:**

- **EVM Tab**: Shows Ethereum Sepolia, Arbitrum Sepolia, Base Sepolia, OP Sepolia, Avalanche Fuji, Polygon Amoy
- **Other Networks Tab**: Shows Solana Testnet (connected) and Hedera Network
- **Active Connection**: Phantom wallet connected to Solana Testnet with wallet address `Dn3BZqR3fX3uwE1ZY...` and 5.0000 SOL balance

## 🚀 **Implementation Requirements**

### **1. Solana Integration for AgentSphere**

#### **A. Update Agent Data Schema**

```javascript
// Extend agent object to support non-EVM networks
const agentExample = {
  // ... existing EVM fields

  // Non-EVM Network Support
  network_type: "solana", // "evm" | "solana" | "hedera"
  solana_network: "devnet", // "devnet" | "testnet" | "mainnet"
  solana_token_mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC mint on Solana
  solana_decimals: 6,

  // Agent's Solana wallet (where payments go)
  agent_solana_wallet: "AgentWalletAddressHere...",

  // Cross-chain compatibility
  supported_networks: ["polygon-amoy", "solana-devnet"],
};
```

#### **B. Create Solana Network Service**

```javascript
// src/services/solanaNetworkService.js
export const SOLANA_NETWORKS = {
  devnet: {
    name: "Solana Devnet",
    chainId: "devnet",
    rpcUrl: "https://api.devnet.solana.com",
    explorerUrl: "https://explorer.solana.com/?cluster=devnet",
    usdcMint: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU", // USDC Devnet
    symbol: "SOL",
  },
  testnet: {
    name: "Solana Testnet",
    chainId: "testnet",
    rpcUrl: "https://api.testnet.solana.com",
    explorerUrl: "https://explorer.solana.com/?cluster=testnet",
    usdcMint: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
    symbol: "SOL",
  },
};

export const getSolanaNetworkInfo = (network) => {
  return SOLANA_NETWORKS[network] || null;
};

export const getUSDCMintForSolana = (network) => {
  return SOLANA_NETWORKS[network]?.usdcMint || null;
};
```

#### **C. Update Network Detection Service**

```javascript
// src/services/networkDetectionService.js
// Add Solana support to existing EVM detection

export const SUPPORTED_NON_EVM_NETWORKS = {
  SOLANA_DEVNET: {
    name: "Solana Devnet",
    networkId: "solana-devnet",
    type: "solana",
    wallet: "phantom", // or "solflare", "backpack"
  },
};

export const detectSolanaNetwork = async () => {
  if (window.solana && window.solana.isPhantom) {
    try {
      const network = await window.solana.request({
        method: "solana_requestNetwork",
      });
      return network;
    } catch (error) {
      console.log("Solana network detection failed:", error);
      return null;
    }
  }
  return null;
};

// 🔧 CRITICAL FIX: Proper wallet address detection
export const getActiveWalletAddress = async () => {
  // Check if Solana wallet is connected first
  if (window.solana && window.solana.isConnected) {
    try {
      const publicKey = window.solana.publicKey?.toString();
      if (publicKey) {
        console.log("🟢 Using Solana address:", publicKey);
        return {
          address: publicKey,
          type: "solana",
          network: "devnet",
        };
      }
    } catch (error) {
      console.log("Solana address detection failed:", error);
    }
  }

  // Fallback to Ethereum wallet
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (accounts.length > 0) {
        console.log("🟡 Using Ethereum address:", accounts[0]);
        return {
          address: accounts[0],
          type: "ethereum",
          network: "sepolia",
        };
      }
    } catch (error) {
      console.log("Ethereum address detection failed:", error);
    }
  }

  return null;
};
```

### **2. Update AgentInteractionModal for Solana**

#### **A. Extend Network Display Logic**

```javascript
// In AgentInteractionModal.jsx
const getNetworkDisplay = (agent) => {
  // Existing EVM logic...

  // Add Solana support
  if (agent?.network_type === "solana") {
    const solanaNetwork = getSolanaNetworkInfo(agent.solana_network);
    return solanaNetwork?.name || "Unknown Solana Network";
  }

  // Existing fallback logic...
};

const getTokenContractDisplay = (agent) => {
  // Existing EVM logic...

  // Add Solana support
  if (agent?.network_type === "solana") {
    const mint = getUSDCMintForSolana(agent.solana_network);
    if (mint) {
      return `${mint.substring(0, 8)}...${mint.substring(mint.length - 8)}`;
    }
  }

  // Existing fallback logic...
};
```

#### **B. Update Payment Generation**

```javascript
// Extend payment data for Solana agents
const generateSolanaPaymentData = (agent, userWallet) => {
  return {
    network: agent.solana_network,
    recipient: agent.agent_solana_wallet,
    amount: agent.interaction_fee_amount,
    mint: getUSDCMintForSolana(agent.solana_network),
    memo: `AgentSphere payment to ${agent.name}`,
    reference: generatePaymentReference(),
  };
};
```

### **3. Update CubePaymentEngine for Non-EVM**

#### **A. Add Solana Payment Support**

```javascript
// In CubePaymentEngine.jsx
const handleSolanaPayment = async (paymentData) => {
  try {
    if (!window.solana || !window.solana.isPhantom) {
      throw new Error("Phantom wallet not detected");
    }

    const connection = new Connection(
      getSolanaNetworkInfo(paymentData.network).rpcUrl
    );

    // Create USDC transfer instruction
    const transaction = new Transaction();
    const transferInstruction = createTransferInstruction(
      userTokenAccount, // Source
      paymentData.recipient, // Destination
      userWallet, // Owner
      paymentData.amount * Math.pow(10, 6) // Amount in smallest unit
    );

    transaction.add(transferInstruction);

    // Sign and send transaction
    const signature = await window.solana.signAndSendTransaction(transaction);

    return {
      success: true,
      signature,
      network: paymentData.network,
    };
  } catch (error) {
    console.error("Solana payment failed:", error);
    throw error;
  }
};
```

### **4. Enhanced QR Code Generation**

#### **A. Solana QR Code Support**

```javascript
// Update QR service for Solana Pay protocol
const generateSolanaQR = (paymentData) => {
  // Use Solana Pay standard
  const solanaPayUrl = `solana:${paymentData.recipient}?amount=${
    paymentData.amount
  }&spl-token=${paymentData.mint}&memo=${encodeURIComponent(paymentData.memo)}`;

  return generateQRCode(solanaPayUrl);
};
```

### **5. Update UnifiedWalletConnect Component**

#### **A. Add Solana Connection Logic**

```javascript
// In UnifiedWalletConnect.jsx or equivalent
const connectSolanaWallet = async () => {
  try {
    if (window.solana && window.solana.isPhantom) {
      const response = await window.solana.connect();
      const publicKey = response.publicKey.toString();

      // Update connected state
      setConnectedWallets(prev => ({
        ...prev,
        solana: {
          address: publicKey,
          network: "devnet", // Detect actual network
          balance: await getSolanaBalance(publicKey)
        }
      }));

      return { success: true, address: publicKey };
    }
  } catch (error) {
    console.error("Solana wallet connection failed:", error);
    throw error;
  }
};
```

## 📝 **Implementation Steps**

### **🚨 Phase 0: CRITICAL BUG FIX (Immediate Priority)**

1. **Fix wallet address detection logic** to prioritize Solana when connected
2. **Update AR viewer component** to use `getActiveWalletAddress()` function
3. **Test address switching** between Solana and Ethereum connections
4. **Verify correct address display** in AR viewer interface

### **Phase 1: Core Solana Integration**

1. Create `solanaNetworkService.js` with network configurations
2. Update `networkDetectionService.js` to include Solana detection
3. Extend agent data schema to support `network_type` and Solana fields
4. Test basic Solana network detection

### **Phase 2: Payment Modal Updates**

1. Update `AgentInteractionModal.jsx` network display logic
2. Add Solana token contract display
3. Implement Solana payment data generation
4. Test with mock Solana agents

### **Phase 3: Payment Engine Integration**

1. Update `CubePaymentEngine.jsx` for Solana payments
2. Implement Solana Pay transaction creation
3. Add proper error handling for Solana transactions
4. Test end-to-end payment flow

### **Phase 4: QR Code Enhancement**

1. Update QR service to support Solana Pay protocol
2. Implement cross-network QR detection
3. Test QR scanning with Solana wallets

### **Phase 5: Testing & Validation**

1. Create test Solana agents in database
2. Test wallet connection across networks
3. Validate payment flows for both EVM and Solana
4. Ensure consistent UI/UX across network types

## 🔍 **Key Considerations**

### **A. Data Consistency**

- Ensure Solana agents have correct `network_type: "solana"`
- Maintain backward compatibility with existing EVM agents
- Use consistent naming conventions across networks

### **B. Wallet Detection Priority**

```javascript
// Recommended wallet detection order
const SOLANA_WALLET_PRIORITY = ["phantom", "solflare", "backpack", "slope"];
```

### **C. Error Handling**

- Graceful fallback when Solana wallet not available
- Clear error messages for network mismatches
- Proper transaction confirmation handling

### **D. Security**

- Validate all Solana addresses before transactions
- Implement proper USDC mint verification
- Add transaction simulation before signing

## 🎯 **Expected Outcome**

After implementation, users should be able to:

1. **Browse agents** on both EVM and Solana networks
2. **Connect wallets** using the same modal interface
3. **Make payments** to Solana agents using USDC on Solana Devnet
4. **Generate QR codes** for cross-platform payments
5. **Switch networks** seamlessly within the same interface

The modal should show:

- **EVM Networks**: Current 6 EVM testnets
- **Other Networks**: Solana Devnet (connected), Hedera Network (future)
- **Active Connections**: Both Phantom (Solana) and MetaMask (EVM) simultaneously

## 📋 **Validation Checklist**

- [ ] Solana agents display correct network in agent cards
- [ ] Payment modal shows proper Solana network and USDC mint
- [ ] Phantom wallet integration works for payments
- [ ] QR codes generate valid Solana Pay URLs
- [ ] Cross-network wallet switching functions properly
- [ ] Transaction confirmations display correctly
- [ ] Error handling works for failed Solana transactions
- [ ] UI remains consistent across EVM and non-EVM flows

This implementation will provide AgentSphere with complete multi-chain support, allowing users to interact with agents deployed on any supported blockchain through a unified interface.
