# Payment Terminal Dynamic Fee Debug Session

**Date:** October 24, 2025  
**Branch:** revolut-qr-payments-sim  
**Issue:** Payment terminals showing $10 instead of $162 dynamic amount

---

## Problem Statement

Payment terminals should receive dynamic payment amounts ($162 from e-shop) but are showing fixed $10 for all payment methods:

- ❌ Crypto QR showing 10 USDC instead of 162 USDC
- ❌ Bank QR showing $10 instead of $162
- ❌ Virtual Card showing $10 instead of $162

**Critical Constraint:** Only Payment Terminals should use dynamic amounts. Regular agents must continue showing their own fees.

---

## Payment Terminals Affected

Wallet: `0x6ef27E391c7eac228c26300aA92187382cc7fF8a`

### Payment Terminals (3 total):

1. **Payment Terminal - Peter - Sepolia**

   - ID: `fbf6d253-2b63-42e5-b56f-d534e7b353eb`
   - Type: `payment_terminal`

2. **Revolut 2 - Base**

   - ID: `5b97ec1f-93ed-4ae6-b0fb-9496d1815c7d`
   - Type: `payment_terminal`

3. **Debug - Fuji - 0x..fF8a - 22 USDC**
   - ID: `c8a4292e-2710-4eee-8dd4-b4d3b8896c0b`
   - Type: `payment_terminal`

### Regular Agents (5 total):

- Cube Dynamic 1 (intelligent_assistant)
- Cube Sepolia 4 dev account (intelligent_assistant)
- Cube Sepolia 2 (intelligent_assistant)
- Cube Sepolia 3 dev account (intelligent_assistant)
- revolut 1 (intelligent_assistant)

---

## Database Field Analysis

### Wallet Address Storage

Agents are identified by wallet using these fields:

- ✅ `agent_wallet_address`: `0x6ef27E391c7eac228c26300aA92187382cc7fF8a` (POPULATED)
- ✅ `owner_wallet`: `0x6ef27E391c7eac228c26300aA92187382cc7fF8a` (POPULATED)
- ❌ `deployer_wallet_address`: `null` (NOT USED in this system)

### Agent Type Classification

The `agent_type` field values:

- `"payment_terminal"` - For payment terminals that should use dynamic amounts
- `"intelligent_assistant"` - For regular agents that use their own fees
- `"Trailing Payment Terminal"` - Another type that should use dynamic amounts

**Note:** The field uses **underscores** in the database (`payment_terminal`), but may need space normalization in code comparisons.

---

## Payment Flow

### E-shop → AR Viewer Flow:

1. E-shop creates payment redirect URL with Base64 encoded data
2. Data includes: `{ orderId, amount: 162, currency: "USD", items, merchantName, redirectUrl }`
3. AR Viewer decodes and stores in `paymentContext.amount`
4. When user clicks payment terminal → Should pass `paymentContext.amount` (162)
5. Payment methods display the dynamic amount

### Normal Mode Flow:

1. User directly scans QR code or opens AR Viewer
2. No `paymentContext.amount` present
3. Payment terminals should use default ($10)
4. Regular agents always use their own `interaction_fee_amount`

---

## Code Implementation Status

### ✅ Fixed Files:

#### 1. `src/components/AgentInteractionModal.jsx`

**Purpose:** Initial payment modal before payment method selection

**Changes:**

- Line 45-54: `getServiceFeeDisplay()` returns string instead of object
- Line 341: Added `paymentAmount` prop
- Line 700: Passes `paymentAmount` to display function

**Status:** ✅ Working - Displays dynamic amounts correctly

---

#### 2. `src/components/RevolutBankQRModal.jsx`

**Purpose:** Revolut Bank QR payment interface

**Changes:**

- Line 717: Removed `/100` division from amount prop
- Line 803: Removed `/100` division from success display

**Status:** ✅ Working - Shows correct decimal amounts

---

#### 3. `src/services/dynamicQRService.js`

**Purpose:** Generates EIP-681 payment URIs for crypto QR codes

**Changes:**

- Lines 402-408: Fixed `feeAmount` calculation
- Priority: Use `amountUSD` if provided, otherwise `interaction_fee_amount`

**Status:** ✅ Working for regular agents

---

#### 4. `src/components/CubePaymentEngine.jsx`

**Purpose:** 3D payment cube with 6 payment methods

**Changes:**

- Line 1909: Uses `result.paymentUri` instead of `result.eip681URI`
- Line 1695: Default `paymentAmount = 10.0`

**Status:** ✅ QR display fixed, receives `paymentAmount` from AR3DScene

---

### ⚠️ File with Debug Logging Added:

#### 5. `src/components/AR3DScene.jsx`

**Purpose:** Orchestrates 3D scene and payment flow

**Debug Changes:**

- Lines 520-541: Added IIFE with console logging for AgentInteractionModal
- Lines 543-568: Added IIFE with console logging for CubePaymentEngine

**Current Logic:**

```javascript
const isPaymentTerminal =
  selectedAgent?.agent_type === "Payment Terminal" ||
  selectedAgent?.agent_type === "Trailing Payment Terminal";

const paymentAmount = isPaymentTerminal ? paymentContext?.amount : null;
```

**Debug Logs:**

```javascript
// For AgentInteractionModal
console.log("🔍 AR3DScene: Determining paymentAmount for modal", {
  agentName: selectedAgent?.name,
  agentType: selectedAgent?.agent_type,
  isPaymentTerminal,
  paymentContextAmount: paymentContext?.amount,
  willPass: isPaymentTerminal ? paymentContext?.amount : null,
});

// For CubePaymentEngine
console.log("🔍 AR3DScene: Determining paymentAmount for cube", {
  agentName: selectedAgent?.name,
  agentType: selectedAgent?.agent_type,
  isPaymentTerminal,
  paymentContextAmount: paymentContext?.amount,
  selectedAgentFee: selectedAgent?.interaction_fee,
  selectedAgentFeeAmount: selectedAgent?.interaction_fee_amount,
  finalAmount: amount,
});
```

**Status:** ⚠️ Logic appears correct but not working - debug logs added to investigate

---

## Suspected Issue

The `agent_type` field in the database uses **underscores**:

- Database: `"payment_terminal"`
- Code check: `agent_type === "Payment Terminal"` (with space)

**Mismatch:** The comparison is case-sensitive and checks for spaces, but the database stores underscores!

### Potential Solutions:

1. Normalize the comparison: `.replace(/_/g, " ")` before checking
2. Check for both formats: `agent_type === "payment_terminal" || agent_type === "Payment Terminal"`
3. Use `.toLowerCase()` and replace underscores consistently

---

## Testing Instructions

### Test Environment:

- URL: `http://localhost:5173`
- Test file: `test-payment-flow.html`

### E-shop Mode Test ($162):

1. Click "🛒 Test E-shop Payment ($162)" button
2. Click on one of the 3 payment terminals
3. Check console for debug logs starting with "🔍 AR3DScene"
4. Expected: All payment methods should show $162

### Normal Mode Test ($10):

1. Click "🏠 Test Normal Mode ($10)" button
2. Click on a payment terminal
3. Expected: Should show $10 default

### Regular Agent Test:

1. Click on any non-payment-terminal agent
2. Expected: Should show agent's own fee (e.g., 4 USDC)

---

## Next Steps

### 1. Check Debug Logs

Run the test and check console for:

- What is the actual `agent_type` value?
- Is `isPaymentTerminal` evaluating to `true` or `false`?
- What is the value of `paymentContext?.amount`?

### 2. Fix Agent Type Comparison

Based on logs, fix AR3DScene.jsx to properly identify payment terminals:

```javascript
// Normalize agent_type to handle both formats
const normalizedAgentType = (selectedAgent?.agent_type || "")
  .toLowerCase()
  .replace(/_/g, " ");

const isPaymentTerminal =
  normalizedAgentType === "payment terminal" ||
  normalizedAgentType === "trailing payment terminal";
```

### 3. Test All Payment Methods

After fix, verify:

- ✅ Crypto QR: Shows 162000000 (162 × 10^6 for USDC)
- ✅ Bank QR: Shows $162.00
- ✅ Virtual Card: Shows $162.00

### 4. Commit Changes

Files to commit:

- `src/components/AgentInteractionModal.jsx`
- `src/components/AR3DScene.jsx`
- `src/components/RevolutBankQRModal.jsx`
- `src/components/CubePaymentEngine.jsx`
- `src/services/dynamicQRService.js`

Commit message:

```
fix: Dynamic payment amounts for Payment Terminals only

- Add agent_type normalization to handle underscore vs space format
- Fix payment terminals to receive dynamic amounts from e-shop
- Ensure regular agents continue using their own fees
- Support Crypto QR, Bank QR, and Virtual Card payment methods
```

---

## Reference: ARViewer.jsx Filtering Logic

The filtering system in ARViewer.jsx shows how agent types are normalized:

```javascript
// Normalize agent type - replace underscores with spaces
const agentType = (agent.agent_type || agent.object_type || "")
  .toLowerCase()
  .replace(/_/g, " ");
```

This same normalization should be applied in AR3DScene.jsx when checking for payment terminals.

---

## Summary

**Root Cause (Suspected):**
The agent_type comparison is failing because:

- Database stores: `"payment_terminal"` (lowercase with underscore)
- Code checks for: `"Payment Terminal"` (capitalized with space)

**Solution:**
Normalize the agent_type string before comparison, similar to how it's done in ARViewer.jsx filtering logic.

**Scope:**
Only the 3 payment terminals should receive dynamic amounts. The 5 regular agents should continue showing their own fees.

**Testing Required:**

- E-shop mode: $162 for payment terminals
- Normal mode: $10 for payment terminals
- Regular agents: Their own fee (any mode)
- All three payment methods: Crypto QR, Bank QR, Virtual Card

---

## Console Debug Output Expected

When clicking a payment terminal in e-shop mode, you should see:

```
🔍 AR3DScene: Determining paymentAmount for modal {
  agentName: "Payment Terminal - Peter - Sepolia",
  agentType: "payment_terminal",           // ← This is the key!
  isPaymentTerminal: false,                 // ← Should be true but isn't!
  paymentContextAmount: 162,
  willPass: null                            // ← Should be 162!
}
```

The issue is clear: `agentType` is `"payment_terminal"` (underscore), but the code checks for `"Payment Terminal"` (space + capitalized), so `isPaymentTerminal` evaluates to `false`.
