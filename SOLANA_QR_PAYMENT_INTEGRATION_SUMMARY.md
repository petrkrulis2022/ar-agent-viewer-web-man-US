# 📋 Solana Wallet QR Payment Integration in AR Viewer

**Date:** October 30, 2025  
**Branch:** `revolut-qr-payments-sim-dynamimic-online-payments-solana-hedera`  
**Repository:** ar-agent-viewer-web-man-US

---

## 🎯 Objective

Fix Solana Devnet QR code payments in AR Viewer to trigger Phantom wallet instead of MetaMask when clicking on payment QR codes for Solana agents.

---

## 📊 Problem Statement

### Initial Issue

When clicking "Crypto QR" payment option on a Solana Devnet agent:

- ❌ MetaMask was being triggered instead of Phantom wallet
- ❌ Error: "MetaMask not detected. Please install MetaMask to proceed with the transaction."
- ✅ Phantom wallet was connected and visible in navbar
- ✅ Solana agent was correctly deployed with Solana wallet address

### Root Causes Identified

1. **Multiple code paths** with inconsistent protocol detection
2. **Chain ID confusion**: String "devnet" being converted to number (NaN)
3. **Hardcoded EVM logic** in payment processors
4. **Database inconsistency**: Agent has `chain_id: 11155111` (Ethereum) but `network: "Solana Devnet"`
5. **Placeholder implementation**: Solana transaction handler was returning fake success

---

## ✅ Changes Made

### 1. Payment Processor - Protocol-Specific Wallet Connection

**File:** `src/services/paymentProcessor.js`

**Problem:** `ensureWalletConnection()` only checked for MetaMask (`window.ethereum`), even for Solana payments.

**Solution:**

- Made `ensureWalletConnection()` protocol-aware (accepts `protocol` parameter)
- Updated `processQRPayment()` to pass protocol from payment URI parsing
- Added existing connection check to avoid unnecessary popups

**Changes:**

```javascript
// Line 21: Pass protocol to wallet connection
await this.ensureWalletConnection(paymentDetails.protocol);

// Lines 205-261: Protocol-specific wallet connection
async ensureWalletConnection(protocol = "ethereum") {
  console.log(`🔌 Ensuring ${protocol} wallet connection...`);

  if (protocol === "solana") {
    // Check for Solana wallet (Phantom, Solflare, etc.)
    if (!window.solana) {
      throw new Error("Solana wallet not found. Please install Phantom...");
    }

    // Check if already connected first
    if (window.solana.isConnected && window.solana.publicKey) {
      console.log("✅ Solana wallet already connected:", window.solana.publicKey.toString());
      this.walletConnected = true;
      return window.solana.publicKey.toString();
    }

    // Connect to Solana wallet only if not already connected
    const response = await window.solana.connect({ onlyIfTrusted: true });
    if (!response.publicKey) {
      throw new Error("No Solana wallet accounts found...");
    }

    this.walletConnected = true;
    console.log("✅ Solana wallet connected:", response.publicKey.toString());
    return response.publicKey.toString();

  } else if (protocol === "ethereum") {
    // Check for Ethereum wallet (MetaMask, etc.)
    if (!window.ethereum) {
      throw new Error("MetaMask not found...");
    }

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    // ... existing MetaMask logic
  }
}
```

**Impact:** ✅ Correct wallet (Phantom/MetaMask) is triggered based on payment protocol

---

### 2. Dynamic QR Service - Chain ID Detection & Network Handling

**File:** `src/services/dynamicQRService.js`

#### 2a. Skip EVM Network Detection for Solana Agents

**Problem:** Code tried to detect user's network using `window.ethereum.request()` even for Solana agents, causing "stuck generating" state when MetaMask was disabled.

**Lines 416-450:**

```javascript
// Check if agent is on Solana FIRST
const agentIsSolana =
  agentChainId === "devnet" || agentChainId === "solana-devnet";

console.log("🔍 Agent network detection:", {
  agentChainId,
  isSolana: agentIsSolana,
  isNumeric: !isNaN(parseInt(agentChainId)),
});

// Skip EVM network detection if agent is on Solana
let userChainId = null;

if (!agentIsSolana && typeof window !== "undefined" && window.ethereum) {
  try {
    const currentChainId = await window.ethereum.request({
      method: "eth_chainId",
    });
    userChainId = String(parseInt(currentChainId, 16));
    console.log("🌐 User connected to EVM network:", userChainId);
  } catch (error) {
    console.warn("⚠️ Could not detect user EVM network:", error);
  }
}
```

**Impact:** ✅ QR generation no longer gets stuck when MetaMask is disabled for Solana agents

---

#### 2b. Preserve String Chain IDs (Don't Parse Solana "devnet")

**Problem:** `parseInt("devnet")` returns `NaN`, which defaulted to Ethereum Sepolia (11155111).

**Lines 500-530:**

```javascript
// Use agent's network as target (original logic)
// Check if chain ID is numeric (EVM) or string (Solana)
let targetNetwork = agentChainId;
let chainType = this.detectChainType(targetNetwork);

console.log("🔍 Target network detection:", {
  agentChainId,
  targetNetwork,
  chainType,
});

// For EVM networks, convert to number and try to detect current network
if (chainType === "EVM" && typeof window !== "undefined" && window.ethereum) {
  // Convert to number only for EVM chains
  targetNetwork = parseInt(agentChainId) || 11155111;

  try {
    const currentChainId = await window.ethereum.request({
      method: "eth_chainId",
    });
    targetNetwork = parseInt(currentChainId, 16);
    console.log("🌐 Detected EVM network:", targetNetwork);
  } catch (error) {
    console.warn(
      "⚠️ Could not detect EVM network, using default:",
      targetNetwork
    );
  }
}
// For Solana, targetNetwork stays as "devnet" or "solana-devnet" (string)
```

**Impact:** ✅ Solana chainIds preserved as strings, correctly detected as SVM

---

#### 2c. Chain Type Detection

**Lines 66-70:**

```javascript
detectChainType(chainId) {
  if (chainId === "solana-devnet" || chainId === "devnet") {
    return "SVM"; // Solana Virtual Machine
  }
  return "EVM"; // Ethereum Virtual Machine
}
```

**Impact:** ✅ Correctly identifies Solana networks

---

### 3. Cube Payment Engine - Wallet Address Format Detection

**File:** `src/components/CubePaymentEngine.jsx`

**Problem:** When using legacy QR data format, `chainType` wasn't set, causing code to default to EVM even for Solana agents with Solana wallet addresses.

**Lines 1034-1074:**

```javascript
// Legacy string format
console.log("⚠️ Legacy string QR data format detected");

// Get wallet address to check format
const walletAddress =
  agent.agent_wallet_address || agent.payment_recipient_address;

// Detect chain type from multiple sources
const chainType =
  selectedNetwork === "devnet" ||
  selectedNetwork === "solana-devnet" ||
  agent.network === "solana-devnet" ||
  agent.chain_id === "devnet" ||
  // Check wallet address format - Solana addresses don't start with 0x and are base58
  (walletAddress &&
    !walletAddress.startsWith("0x") &&
    walletAddress.length > 40)
    ? "SVM"
    : "EVM";

console.log("🔍 Chain type detection:", {
  selectedNetwork,
  agentNetwork: agent.network,
  agentChainId: agent.chain_id,
  walletAddress,
  walletStartsWith0x: walletAddress?.startsWith("0x"),
  walletLength: walletAddress?.length,
  detectedChainType: chainType,
});

transactionData = {
  to: walletAddress,
  value: "0",
  data: "0x",
  amount: agent.interaction_fee_amount || "1.00",
  token: agent.interaction_fee_token || "USDC",
  chainId: selectedNetwork || agent.chain_id || "devnet",
  chainType: chainType, // ✅ ADD CHAIN TYPE
};

console.log("🔍 Generated legacy transaction data with chainType:", chainType);
```

**Logic:**

- **Check 1:** Network name matches Solana
- **Check 2:** Chain ID is "devnet"
- **Check 3:** Wallet address format (Solana = base58, no "0x", length > 40 chars)
  - Ethereum addresses: 42 chars (including "0x")
  - Solana addresses: 32-44 chars (base58 encoded)

**Impact:** ✅ Correctly detects `chainType: "SVM"` for Solana agents even when network metadata is inconsistent

---

### 4. QR Payment Data Service - Correct Method Calls

**File:** `src/services/qrPaymentDataService.js`

**Problem:** Called non-existent `dynamicQRService.executePayment()` method.

**Lines 104-133:**

```javascript
async handleQRClick(qrData) {
  try {
    console.log("🖱️ CUBE QR INTEGRATION: QR code clicked for in-app payment");
    console.log("🔍 QR Data received:", JSON.stringify(qrData, null, 2));
    console.log("🔍 Active QR Session:", JSON.stringify(this.activeQRSession, null, 2));

    if (!qrData || !this.activeQRSession) {
      throw new Error("No active QR session");
    }

    // Extract transaction data from QR session
    const transactionData =
      qrData.transactionData ||
      this.activeQRSession.transactionData ||
      this.activeQRSession; // Fallback to entire session if transactionData not found

    console.log("🔍 Transaction Data to be used:", {
      chainId: transactionData?.chainId,
      chainType: transactionData?.chainType,
      to: transactionData?.to,
      amount: transactionData?.amount,
      hasChainType: !!transactionData?.chainType,
      fullData: transactionData,
    });

    // Use existing dynamic QR service's handleQRClick method
    const paymentResult = await dynamicQRService.handleQRClick(
      null, // agentData not needed
      transactionData // Pass the transaction data with chainType
    );

    // ... rest of method
  }
}
```

**Impact:** ✅ Correct method called with proper chainType data

---

### 5. Dynamic QR Service - Real Solana Transaction Implementation

**File:** `src/services/dynamicQRService.js`

**Problem:** `handleSolanaTransaction()` was a placeholder that returned fake success without executing any blockchain transaction.

**Lines 830-869 (REPLACED):**

```javascript
async handleSolanaTransaction(qrData) {
  console.log("🌟 Executing REAL Solana transaction:", qrData);

  if (typeof window === "undefined" || (!window.solana && !window.phantom)) {
    throw new Error(
      "Solana wallet not detected. Please install Phantom or another Solana wallet."
    );
  }

  // Try to connect to Solana wallet (Phantom, Solflare, etc.)
  const wallet = window.phantom?.solana || window.solana;

  if (!wallet.isConnected) {
    await wallet.connect();
  }

  console.log("👤 Connected Solana account:", wallet.publicKey.toString());

  // Import payment processor to handle the actual transaction
  const { default: paymentProcessor } = await import("./paymentProcessor.js");

  // Create payment URI in Solana Pay format
  const paymentUri = `solana:${qrData.to}?amount=${qrData.amount}&label=AgentSphere%20Payment`;

  const paymentData = {
    payment_uri: paymentUri,
    data: paymentUri,
    qrObject: {
      amount: qrData.amount,
      agent: { name: qrData.agentName || "Agent" },
    },
  };

  console.log("💳 Processing Solana payment:", paymentData);

  // Use payment processor to execute the transaction
  const result = await paymentProcessor.processQRPayment(paymentData);

  console.log("✅ Solana transaction result:", result);

  return result;
}
```

**Previous (Placeholder):**

```javascript
async handleSolanaTransaction(qrData) {
  // ... wallet connection ...

  // For now, return a placeholder response
  console.log("🔧 Solana transaction data:", qrData);

  return {
    success: true,
    message: "Solana transaction initiated. Please complete in your wallet.",
    chainType: "SVM",
    note: "Full Solana transaction support requires additional implementation",
  };
}
```

**Impact:** ✅ Now uses real Solana transaction logic from `paymentProcessor.js` which includes Solana Web3.js integration

---

### 6. AR QR Code Component - Enhanced Logging

**File:** `src/components/ARQRCodeFixed.jsx`

**Lines 130-135:**

```javascript
event.stopPropagation();
console.log("📱 AR QR Code clicked for payment processing");
console.log("🔍 QR Data:", qrData);
console.log("🔍 QR Object:", qrObject);

setIsScanning(true);
```

**Impact:** ✅ Better visibility into what data is passed when QR is clicked

---

## 🔍 Root Cause Analysis

### Primary Issues

1. **Multiple Code Paths**

   - `ARQRCodeFixed.jsx` → `paymentProcessor.processQRPayment()`
   - `CubePaymentEngine.jsx` → `dynamicQRService.handleQRClick()`
   - `qrPaymentDataService.js` → wrong method call
   - Each path had different protocol detection logic

2. **Type Confusion**

   - Solana chainId is a **string** (`"devnet"`)
   - EVM chainId is a **number** (`11155111`)
   - Code called `parseInt("devnet")` → `NaN` → defaulted to `11155111`

3. **Hardcoded Assumptions**

   - `window.ethereum` always checked, even for Solana
   - Payment processor assumed EVM by default
   - Transaction handlers hardcoded to MetaMask

4. **Database Inconsistency**
   - Agent has conflicting metadata:
     - ✅ `network: "Solana Devnet"` (correct)
     - ✅ `deployment_network_name: "Solana Devnet"` (correct)
     - ✅ `agent_wallet_address: "Dn382a..."` (Solana address, correct)
     - ✅ `token_address: "4zMMC9..."` (Solana USDC address, correct)
     - ❌ `chain_id: 11155111` (Ethereum Sepolia - WRONG!)
     - ❌ `deployment_chain_id: 11155111` (Ethereum Sepolia - WRONG!)

---

## 🎯 Current State

### ✅ Working

1. ✅ Phantom wallet detection on page load
2. ✅ "My Agents" filter correctly shows Solana agents when Phantom connected
3. ✅ QR code generation for Solana agents
4. ✅ Chain type correctly detected as `SVM` (not `EVM`)
5. ✅ Phantom wallet triggers when clicking QR code (not MetaMask)
6. ✅ Transaction request sent to Phantom

### ⚠️ Known Issues

1. **Transaction Fails** - Need to debug exact failure reason

   - Check if recipient address is correct format
   - Verify amount and token parameters
   - Ensure user has sufficient SOL/USDC balance

2. **Database Metadata** - Agent has wrong `chain_id`

   - Should be `"devnet"` (string)
   - Currently is `11155111` (number)
   - This causes confusion in network detection

3. **Token Transfer** - May need SPL token transfer instead of native SOL
   - Agent specifies USDC payment
   - Need to use `@solana/spl-token` library
   - Token address: `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`

---

## 📝 Files Modified

| File                                   | Lines Changed                    | Purpose                                                      |
| -------------------------------------- | -------------------------------- | ------------------------------------------------------------ |
| `src/services/paymentProcessor.js`     | 205-261, 21, 380                 | Protocol-specific wallet connection, Solana wallet detection |
| `src/services/dynamicQRService.js`     | 66-70, 416-450, 500-530, 830-869 | Chain detection, network handling, Solana transaction        |
| `src/services/qrPaymentDataService.js` | 104-133                          | Correct method calls, logging                                |
| `src/components/CubePaymentEngine.jsx` | 1034-1074                        | Wallet address format detection                              |
| `src/components/ARQRCodeFixed.jsx`     | 130-135                          | Enhanced logging                                             |
| `src/components/ARViewer.jsx`          | 149-199                          | (Previous session) Silent wallet detection on mount          |

---

## 🚀 Next Steps

### Immediate Actions

1. **Debug Transaction Failure**

   - Check browser console for exact Solana transaction error
   - Verify payment parameters (recipient, amount, token)
   - Test with native SOL transfer first, then USDC

2. **Fix Database**

   - Update agent in Supabase:
     ```sql
     UPDATE agents
     SET chain_id = 'devnet',
         deployment_chain_id = 'devnet'
     WHERE id = 'a874ebf6-c70d-4f91-a958-3724d0b2e0f1';
     ```

3. **Implement SPL Token Transfer**
   - Use `@solana/spl-token` for USDC transfers
   - Get or create associated token accounts
   - Handle insufficient balance errors gracefully

### Future Enhancements

1. **Network Auto-Detection**

   - Detect Solana network from Phantom (devnet/mainnet)
   - Warn if user on wrong network

2. **Better Error Messages**

   - User-friendly error messages
   - Guide users to fix common issues

3. **Transaction Confirmation**
   - Poll for transaction confirmation
   - Show transaction status in UI
   - Link to Solana Explorer

---

## 📚 Technical Reference

### Wallet Detection Patterns

```javascript
// Ethereum (MetaMask)
if (window.ethereum) {
  const accounts = await window.ethereum.request({
    method: "eth_accounts",
  });
}

// Solana (Phantom)
if (window.solana && window.solana.isPhantom) {
  const response = await window.solana.connect({
    onlyIfTrusted: true,
  });
}
```

### Address Format Patterns

```javascript
// Ethereum: 42 chars, starts with 0x
// Example: 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238

// Solana: 32-44 chars, base58 encoded, no 0x
// Example: Dn382aRJfXJwyE12Yck3mLSXtGeMQdcSJ7NR5wsQaJd5

// Detection:
const isSolana = !address.startsWith("0x") && address.length > 40;
```

### Chain ID Patterns

```javascript
// EVM: Numeric
const evmChainId = 11155111; // Ethereum Sepolia
const evmChainId2 = 84532; // Base Sepolia

// Solana: String
const solanaChainId = "devnet"; // or
const solanaChainId2 = "solana-devnet"; // or
const solanaChainId3 = "mainnet-beta";
```

---

## 🎓 Lessons Learned

1. **Multi-wallet support requires protocol detection at every layer**

   - UI layer (which button to show)
   - QR generation (which URI format)
   - Click handler (which wallet to trigger)
   - Transaction execution (which Web3 library)

2. **Type consistency is critical**

   - EVM chainIds are numbers
   - Solana chainIds are strings
   - Don't blindly call `parseInt()` on all IDs

3. **Database schema should match reality**

   - If network is Solana, chainId should be "devnet", not 11155111
   - Inconsistent metadata causes bugs throughout the stack

4. **Silent wallet detection is better UX**

   - Use `{ onlyIfTrusted: true }` to avoid unnecessary popups
   - Check `isConnected` before calling `connect()`

5. **Logging is essential for debugging**
   - Log at every decision point
   - Include all relevant data (chainId, protocol, address format)
   - Use emoji prefixes for easy searching (🔍 🌐 ✅ ❌)

---

## 📊 Testing Checklist

- [ ] Generate QR for Solana agent
- [ ] QR displays correctly
- [ ] Click QR triggers Phantom (not MetaMask)
- [ ] Phantom shows correct recipient
- [ ] Phantom shows correct amount
- [ ] Transaction succeeds on Solana Devnet
- [ ] Transaction hash returned
- [ ] UI shows success message
- [ ] Balance updates after transaction

---

**Session Duration:** ~2.5 hours  
**Complexity:** High (multi-wallet, multi-protocol, multiple code paths)  
**Status:** In Progress (Phantom triggers correctly, transaction needs debugging)

---

_This document will be updated as we continue debugging the transaction execution._
