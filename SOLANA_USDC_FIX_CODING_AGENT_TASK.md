# 🎯 CODING AGENT TASK: Fix Solana USDC Token Transfer

## 🐛 Problem Summary

Phantom wallet successfully opens for Solana transactions, but it's requesting **12 SOL** instead of **12 USDC** on Solana Devnet.

**Current State**: ✅ Phantom triggers correctly  
**Issue**: ❌ Wrong token being requested (native SOL instead of SPL token USDC)

---

## 📋 Context - What We Fixed Already

### Issues Resolved (Commit: 644ad4e)

1. ✅ **Network mismatch modal** - No longer appears for Solana Devnet users
2. ✅ **Cross-chain detection** - Skips Solana-to-Solana payments correctly
3. ✅ **Wallet prioritization** - Phantom prioritized over Brave's built-in wallet
4. ✅ **Wallet connection** - Silent connect with fallback to explicit authorization
5. ✅ **ChainId override** - Forces "devnet" for Solana agents
6. ✅ **MetaMask triggering** - Fixed, Phantom now opens correctly
7. ✅ **Transaction execution** - Real Solana implementation (not placeholder)

### Modified Files in Previous Fixes

- `src/components/CubePaymentEngine.jsx` - Added Solana detection, chainId override
- `src/services/dynamicQRService.js` - Early Solana detection, Solana Pay URI
- `src/services/paymentProcessor.js` - Protocol-aware wallet connection

---

## 🎯 Remaining Issue - USDC Token Transfer

### Test Agent Details

- **Agent ID**: `a874ebf6-c70d-4f91-a958-3724d0b2e0f1`
- **Network**: Solana Devnet
- **Wallet Address**: `Dn382aRJfXJwyE12Yck3mLSXtGeMQdcSJ7NR5wsQaJd5`
- **Token**: USDC (SPL Token)
- **Token Address**: `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`
- **Payment Amount**: 12 USDC
- **Database chain_id**: `11155111` (wrong - but overridden in code to "devnet")

### Current Behavior

1. User clicks QR code for Solana agent
2. ✅ Phantom wallet opens successfully
3. ❌ Shows "Transfer SOL" with amount: **12 SOL**
4. ❌ Error: "insufficient lamports" (user doesn't have 12 SOL, only USDC)

### Expected Behavior

1. User clicks QR code for Solana agent
2. ✅ Phantom wallet opens
3. ✅ Shows "Transfer USDC" or SPL token transfer
4. ✅ Amount: **12 USDC** (using token address `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`)

---

## 🔍 Root Cause Analysis

The `executeSolanaTransaction()` function in `paymentProcessor.js` has SPL token support:

```javascript
if (paymentDetails.tokenAddress) {
  // SPL Token Transfer logic exists
  const splToken = await import("@solana/spl-token");
  // ... creates token transfer instruction
}
```

**Problem**: `paymentDetails.tokenAddress` is likely **not being populated** when the transaction is created.

### Potential Issues

1. Token address not extracted from Solana Pay URI
2. Token address not passed through transaction data flow
3. Agent's `token_address` field not being read from database
4. Missing SPL token parameter in QR code generation

---

## 🛠️ Required Fix

### Investigation Points

1. **Check Solana Pay URI generation** in `dynamicQRService.js`:

   - Does it include `spl-token` parameter?
   - Format should be: `solana:{recipient}?amount={amount}&spl-token={tokenAddress}`

2. **Check URI parsing**:

   - Is `parseSolanaPayURI()` extracting the token address?
   - Is it passing `tokenAddress` to `executeSolanaTransaction()`?

3. **Check agent data flow**:
   - Is agent's `token_address` field being read from database?
   - Is it passed through `transactionData` to QR generation?

### Implementation Requirements

1. ✅ Ensure agent's `token_address` (`4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`) is included in transaction data
2. ✅ Generate proper Solana Pay URI with `spl-token` parameter
3. ✅ Parse and extract `spl-token` from URI when handling QR click
4. ✅ Pass `tokenAddress` to `executeSolanaTransaction()`
5. ✅ Verify SPL token transfer logic executes (not native SOL transfer)

### Success Criteria

- [ ] Phantom opens showing **"Transfer USDC"** (not "Transfer SOL")
- [ ] Amount shows **12 USDC** (not 12 SOL)
- [ ] Transaction uses token address `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`
- [ ] User can complete USDC payment on Solana Devnet
- [ ] EVM transactions (MetaMask) still work correctly
- [ ] No regression in Phantom wallet triggering

---

## 📁 Files to Modify

### Primary Files

#### 1. `src/services/dynamicQRService.js`

- **Line ~420-490**: `generateDynamicQR()` - Add SPL token to Solana Pay URI
- **Line ~863-901**: `handleSolanaTransaction()` - Ensure token address parsed and passed

#### 2. `src/services/paymentProcessor.js`

- **Line ~387-520**: `executeSolanaTransaction()` - Verify token address received
- Ensure `paymentDetails.tokenAddress` is populated

#### 3. `src/components/CubePaymentEngine.jsx`

- **Line ~780-842**: Agent initialization - Verify token_address included in data
- **Line ~1760-1915**: QR generation - Pass token_address to QR service

---

## 🌐 Reference Information

### Solana Pay URI Format with SPL Token

```
solana:{recipient}?amount={amount}&spl-token={tokenMintAddress}&label={label}
```

### USDC on Solana Devnet

- **Token Mint Address**: `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`
- **Decimals**: 6 (standard for USDC)
- **Network**: Solana Devnet
- **Symbol**: USDC

### Example Correct Solana Pay URI

```
solana:Dn382aRJfXJwyE12Yck3mLSXtGeMQdcSJ7NR5wsQaJd5?amount=12&spl-token=4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU&label=Agent%20Payment
```

### SPL Token Transfer Code Pattern

```javascript
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
} from "@solana/spl-token";

// Get token accounts
const fromTokenAccount = await getAssociatedTokenAddress(
  new PublicKey(tokenAddress),
  wallet.publicKey
);

const toTokenAccount = await getAssociatedTokenAddress(
  new PublicKey(tokenAddress),
  new PublicKey(recipient)
);

// Create transfer instruction
const transferInstruction = createTransferInstruction(
  fromTokenAccount,
  toTokenAccount,
  wallet.publicKey,
  amount * Math.pow(10, 6) // 6 decimals for USDC
);
```

---

## 🎯 DETAILED TASK FOR CODING AGENT

**CRITICAL**: Work on branch `revolut-qr-payments-sim-dynamimic-online-payments-solana-hedera`

### Step-by-Step Instructions

#### Phase 1: Investigation

1. Trace the data flow of `token_address` from agent data to transaction execution
2. Check if agent's `token_address` field is being read in `CubePaymentEngine.jsx`
3. Verify if `token_address` is passed to `dynamicQRService.generateDynamicQR()`
4. Check if Solana Pay URI includes the `spl-token` parameter
5. Verify if `handleSolanaTransaction()` extracts token address from URI

#### Phase 2: Fix Solana Pay URI Generation

1. In `src/services/dynamicQRService.js`, locate the Solana Pay URI generation code
2. Ensure it includes the `spl-token` parameter when `token_address` is present
3. Format: `solana:{recipient}?amount={amount}&spl-token={tokenAddress}&label={label}`
4. Add console logs to verify the URI is generated correctly

#### Phase 3: Fix URI Parsing

1. Locate or create `parseSolanaPayURI()` function
2. Extract the `spl-token` parameter from the URI
3. Pass it as `tokenAddress` in the payment details object
4. Ensure it reaches `executeSolanaTransaction()`

#### Phase 4: Verify Token Address Flow

1. In `CubePaymentEngine.jsx`, ensure `agent.token_address` is included in transaction data
2. Pass it through to `dynamicQRService.generateDynamicQR()`
3. Verify it's available when creating the Solana Pay URI

#### Phase 5: Testing

1. Test with agent ID: `a874ebf6-c70d-4f91-a958-3724d0b2e0f1`
2. Use Chrome browser (to avoid Brave wallet conflicts)
3. Click QR code for the Solana agent
4. Verify Phantom opens showing "Transfer USDC" (not SOL)
5. Verify amount shows 12 USDC
6. Test an EVM agent to ensure no regression
7. Verify MetaMask still works for EVM transactions

#### Phase 6: Validation

1. Add console logs showing:
   - Token address extracted from agent data
   - Solana Pay URI generated
   - Token address parsed from URI
   - Token address passed to `executeSolanaTransaction()`
2. Verify SPL token transfer code path is executed
3. Confirm no errors in console

---

## 🔧 Code Modifications Needed

### 1. Update Solana Pay URI Generation

**File**: `src/services/dynamicQRService.js`

**Location**: Around line 420-490 in `generateDynamicQR()`

**Current** (likely):

```javascript
const solanaPayUri = `solana:${recipientAddress}?amount=${amount}&label=${encodeURIComponent(
  label
)}`;
```

**Should be**:

```javascript
const solanaPayUri = tokenAddress
  ? `solana:${recipientAddress}?amount=${amount}&spl-token=${tokenAddress}&label=${encodeURIComponent(
      label
    )}`
  : `solana:${recipientAddress}?amount=${amount}&label=${encodeURIComponent(
      label
    )}`;
```

### 2. Parse Token Address from URI

**File**: `src/services/dynamicQRService.js`

**Location**: In `handleSolanaTransaction()` around line 863-901

**Add parsing logic**:

```javascript
function parseSolanaPayURI(uri) {
  try {
    const url = new URL(uri);
    const recipient = url.pathname.replace("solana:", "");
    const amount = url.searchParams.get("amount");
    const tokenAddress = url.searchParams.get("spl-token");
    const label = url.searchParams.get("label");

    return { recipient, amount, tokenAddress, label };
  } catch (error) {
    console.error("Failed to parse Solana Pay URI:", error);
    return null;
  }
}
```

### 3. Pass Token Address to Transaction Execution

**File**: `src/services/dynamicQRService.js`

**In handleSolanaTransaction()**:

```javascript
const paymentDetails = parseSolanaPayURI(qrData);
if (paymentDetails && paymentDetails.tokenAddress) {
  console.log("🪙 SPL Token Transfer:", paymentDetails.tokenAddress);
}

// Pass to paymentProcessor
await paymentProcessor.executeSolanaTransaction(paymentDetails);
```

### 4. Ensure Token Address in Agent Data Flow

**File**: `src/components/CubePaymentEngine.jsx`

**Location**: Around line 1760-1915 in QR generation

**Verify this includes**:

```javascript
const transactionData = {
  recipient: agent.wallet_address,
  amount: agent.fee,
  tokenAddress: agent.token_address, // ← Must be included
  chainId: "devnet",
  chainType: "SVM",
};
```

---

## 📊 Testing Checklist

### Pre-Testing Setup

- [ ] Checkout branch: `revolut-qr-payments-sim-dynamimic-online-payments-solana-hedera`
- [ ] Run `npm install` to ensure dependencies are up to date
- [ ] Start dev server: `npm run dev -- --port 5173`
- [ ] Open Chrome browser (avoid Brave)
- [ ] Install Phantom wallet extension
- [ ] Connect to Solana Devnet
- [ ] Ensure wallet has some USDC on Devnet

### Solana USDC Testing

- [ ] Navigate to agent `a874ebf6-c70d-4f91-a958-3724d0b2e0f1`
- [ ] Click QR code
- [ ] Verify Phantom wallet opens (not MetaMask)
- [ ] Verify transaction shows "Transfer USDC" (not "Transfer SOL")
- [ ] Verify amount is 12 USDC
- [ ] Verify recipient is `Dn382aRJfXJwyE12Yck3mLSXtGeMQdcSJ7NR5wsQaJd5`
- [ ] Check console logs for token address flow
- [ ] Attempt to complete transaction (optional)

### EVM Regression Testing

- [ ] Find an EVM agent (Ethereum/Polygon)
- [ ] Click QR code
- [ ] Verify MetaMask opens (not Phantom)
- [ ] Verify transaction details are correct
- [ ] Ensure no errors in console
- [ ] Verify EVM functionality not broken

### Console Log Verification

Look for these logs:

- [ ] `🔍 Agent token_address: 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`
- [ ] `📱 Solana Pay URI: solana:...&spl-token=4zMMC9...`
- [ ] `🪙 SPL Token Transfer: 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`
- [ ] `✅ executeSolanaTransaction with tokenAddress: 4zMMC9...`

---

## 🚨 Important Notes

### DO NOT

- ❌ Don't create a new branch - work on existing branch
- ❌ Don't modify network detection logic (already working)
- ❌ Don't change Phantom wallet prioritization (already working)
- ❌ Don't alter cross-chain detection (already working)
- ❌ Don't modify chainId override logic (already working)

### DO

- ✅ Focus only on token address flow
- ✅ Add detailed console logs for debugging
- ✅ Test both Solana and EVM agents
- ✅ Preserve all existing functionality
- ✅ Follow Solana Pay specification
- ✅ Use proper SPL token decimals (6 for USDC)

### Branch Information

- **Branch**: `revolut-qr-payments-sim-dynamimic-online-payments-solana-hedera`
- **Base Commit**: `644ad4e` (Solana wallet integration fixes)
- **Repository**: `https://github.com/petrkrulis2022/ar-agent-viewer-web-man-US`

---

## 📚 Related Documentation

- **Previous Work**: `SOLANA_QR_PAYMENT_INTEGRATION_SUMMARY.md`
- **Context**: `SOLANA_USDC_TOKEN_FIX_SUMMARY.md`
- **Solana Pay Spec**: https://docs.solanapay.com/spec
- **SPL Token Docs**: https://spl.solana.com/token
- **Phantom Wallet Docs**: https://docs.phantom.app/

---

## 🎯 PROMPT FOR CODING AGENT

```
Fix Solana USDC token transfer issue where Phantom wallet is requesting 12 SOL instead of 12 USDC on Solana Devnet.

CONTEXT:
- Phantom wallet successfully opens (already fixed)
- Problem: Wrong token type (SOL instead of USDC SPL token)
- Test agent ID: a874ebf6-c70d-4f91-a958-3724d0b2e0f1
- USDC token address: 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU
- Network: Solana Devnet

ROOT CAUSE:
The agent's token_address is not being passed through the transaction flow to executeSolanaTransaction(), causing native SOL transfer instead of SPL token transfer.

REQUIRED CHANGES:
1. Update Solana Pay URI generation in dynamicQRService.js to include spl-token parameter
2. Parse spl-token from URI when handling QR click
3. Pass tokenAddress through to executeSolanaTransaction()
4. Verify token_address flows from agent data to transaction execution

CRITICAL REQUIREMENTS:
- Work on branch: revolut-qr-payments-sim-dynamimic-online-payments-solana-hedera
- Don't modify existing Phantom wallet triggering logic (already working)
- Don't change network detection or cross-chain logic (already working)
- Test both Solana (USDC) and EVM (MetaMask) transactions
- Add console logs to trace token address flow

SUCCESS CRITERIA:
- Phantom shows "Transfer USDC" (not "Transfer SOL")
- Amount displays as 12 USDC
- Token address 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU is used
- EVM transactions still work correctly

FILES TO MODIFY:
- src/services/dynamicQRService.js (URI generation and parsing)
- src/services/paymentProcessor.js (verify token address received)
- src/components/CubePaymentEngine.jsx (ensure token_address passed)

Please implement this fix, test with agent a874ebf6-c70d-4f91-a958-3724d0b2e0f1, and verify both Solana USDC and EVM transactions work correctly.
```

---

**Priority**: 🔴 High  
**Category**: Bug Fix - Payment Integration  
**Estimated Effort**: 2-4 hours  
**Branch**: `revolut-qr-payments-sim-dynamimic-online-payments-solana-hedera`
