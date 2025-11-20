# Dynamic Fee Types & URL Payment Data - Implementation Summary

**Date Implemented:** November 11-12, 2025  
**Feature:** Dynamic payment amount integration for E-shop and On-ramp flows

---

## Overview

Implemented a complete dynamic fee system that allows payment terminals to accept variable payment amounts passed via URL parameters from e-commerce platforms and on-ramp services. This enables seamless integration where external applications can redirect users to AR Viewer with specific payment amounts.

---

## Database Schema Changes

### New Fields in `deployed_objects` Table

```sql
-- Fee type classification
fee_type VARCHAR(20) DEFAULT 'fixed'

-- Payment amount (NULL for dynamic agents)
interaction_fee_amount DECIMAL(18,6)

-- Token to use for payments
interaction_fee_token VARCHAR(10) DEFAULT 'USDC'
```

### Fee Types

1. **`fixed`** - Traditional agents with predefined fees (e.g., 10 USDC)
2. **`dynamic`** - Payment terminals that accept amounts from URL parameters

---

## URL Parameter Format

### Parameter Name

Supports both formats for flexibility:

- `?paymentData=...` (Primary)
- `?data=...` (Alternative)

### Data Structure

Base64-encoded JSON object:

```json
{
  "orderId": "ORD-12345",
  "amount": 7.55,
  "currency": "USDC",
  "merchantName": "AgentSphere E-Shop"
}
```

### Example URL

```
http://localhost:5173/?paymentData=eyJvcmRlcklkIjoiT1JELTEyMzQ1IiwiYW1vdW50Ijo3LjU1LCJjdXJyZW5jeSI6IlVTREMiLCJtZXJjaGFudE5hbWUiOiJBZ2VudFNwaGVyZSBFLVNob3AifQ==
```

---

## Implementation Details

### Files Modified

1. **`src/lib/supabase.js`**

   - Added `fee_type` and `interaction_fee_token` to SELECT queries
   - Ensures dynamic fee data is loaded from database

2. **`src/hooks/useDatabase.js`**

   - Preserves `fee_type` field from database
   - Respects `fee_type='dynamic'` and keeps `interaction_fee_amount=NULL`
   - Prevents mock data generator from overwriting dynamic fee configurations

3. **`src/components/AgentInteractionModal.jsx`**

   - Updated `getServiceFeeDisplay()` to check `fee_type='dynamic'`
   - Shows "Dynamic Amount" label when no URL data present
   - Displays actual amount when URL parameter provided

4. **`src/components/CubePaymentEngine.jsx`**

   - Updated `getFinalPaymentAmount()` to respect `fee_type`
   - Fixed display logic to show "Dynamic Amount" or actual value
   - Passes correct amount to QR code generation

5. **`src/components/AR3DScene.jsx`**

   - Checks `fee_type` before setting `paymentAmount` prop
   - Returns `null` for dynamic agents without URL data
   - Maintains backward compatibility for fixed fee agents

6. **`src/components/CameraView.jsx`**

   - Updated to respect `fee_type='dynamic'`
   - Passes `null` for dynamic agents, triggering proper display

7. **`src/utils/paymentUtils.js`** (NEW FILE)

   - `parsePaymentDataFromURL()` - Parses base64 payment data
   - `getDynamicPaymentAmount()` - Calculates final amount based on fee_type
   - `validatePaymentAmount()` - Validates amount is reasonable
   - `formatPaymentAmount()` - Formats for display
   - `getPaymentConfigSummary()` - Debugging helper

8. **`src/App.jsx`**

   - Auto-redirect to `/ar-view` when `paymentData` parameter detected
   - Skips landing page for seamless payment flow
   - Preserves URL parameters during navigation

9. **`onofframp-cube-paygate/vite.config.js`** (NEW FILE)
   - Created to set port 5176 for on-ramp
   - Prevents port conflicts

---

## User Flow

### For Dynamic Fee Agents (with URL data)

1. User shops on E-shop (port 5175) or uses On-ramp (port 5176)
2. Checkout creates payment with specific amount
3. System encodes payment data:
   ```javascript
   const paymentData = {
     orderId: "ORDER-123",
     amount: 25.5,
     currency: "USDC",
     merchantName: "My Store",
   };
   const encoded = btoa(JSON.stringify(paymentData));
   window.location.href = `http://localhost:5173/?paymentData=${encoded}`;
   ```
4. AR Viewer auto-opens to `/ar-view` with camera active
5. User finds and taps payment terminal (e.g., "Hedera Pay 3")
6. Modal shows **"25.50 USDh"** (from URL)
7. User clicks "Generate Payment"
8. QR code generated for exact amount
9. Transaction sent to blockchain

### For Dynamic Fee Agents (without URL data)

1. User opens AR Viewer normally
2. Taps dynamic fee agent
3. Modal shows **"Dynamic Amount"** label in orange
4. Cannot proceed without URL parameter

### For Fixed Fee Agents (backward compatible)

1. Works exactly as before
2. Shows configured amount from database
3. No URL parameter needed

---

## Database Setup

### Example: Creating a Dynamic Fee Agent

```sql
-- Update existing agent to be dynamic
UPDATE deployed_objects
SET
  fee_type = 'dynamic',
  interaction_fee_amount = NULL,
  interaction_fee = NULL,
  interaction_fee_token = 'USDC'
WHERE name = 'Hedera Pay 3';

-- Verify
SELECT
  id,
  name,
  fee_type,
  interaction_fee_amount,
  interaction_fee,
  interaction_fee_token
FROM deployed_objects
WHERE name = 'Hedera Pay 3';
```

### Example: Creating a Fixed Fee Agent

```sql
-- Standard agent with fixed fee
UPDATE deployed_objects
SET
  fee_type = 'fixed',
  interaction_fee_amount = 10.50,
  interaction_fee_token = 'USDC'
WHERE name = 'Standard Agent';
```

---

## Testing

### Test Case 1: Dynamic Fee with URL Parameter ✅

**URL:**

```
http://localhost:5173/?paymentData=eyJvcmRlcklkIjoiT1JELTEyMzQ1IiwiYW1vdW50Ijo3LjU1LCJjdXJyZW5jeSI6IlVTREMiLCJtZXJjaGFudE5hbWUiOiJBZ2VudFNwaGVyZSBFLVNob3AifQ==
```

**Expected:**

- Redirects to AR view with camera
- "Hedera Pay 3" shows "7.55 USDh"
- QR generates for 7.55 USDh
- Transaction successful

**Result:** ✅ PASSED  
**Transaction:** https://hashscan.io/testnet/transaction/1762890270.776318000

### Test Case 2: Dynamic Fee without URL ✅

**Action:** Open AR view normally, tap "Hedera Pay 3"

**Expected:**

- Modal shows "Dynamic Amount" in orange
- Order info section hidden

**Result:** ✅ PASSED

### Test Case 3: Fixed Fee Agent ✅

**Action:** Tap any fixed fee agent

**Expected:**

- Shows configured amount (e.g., "10 USDC")
- Works as before

**Result:** ✅ PASSED

---

## Integration Examples

### E-shop Integration (Port 5175)

```javascript
// In your checkout flow
function proceedToPayment(orderData) {
  const paymentData = {
    orderId: orderData.id,
    amount: orderData.total,
    currency: "USDC",
    merchantName: "AgentSphere E-Shop",
  };

  const encoded = btoa(JSON.stringify(paymentData));

  // Redirect to AR Viewer
  window.location.href = `http://localhost:5173/?paymentData=${encoded}`;
}
```

### On-ramp Integration (Port 5176)

```javascript
// In your crypto purchase flow
function initiateRampTransaction(purchaseAmount) {
  const paymentData = {
    orderId: `RAMP-${Date.now()}`,
    amount: purchaseAmount,
    currency: "USDC",
    merchantName: "CubePay Exchange",
  };

  const encoded = btoa(JSON.stringify(paymentData));

  // Redirect to AR Viewer
  window.location.href = `http://localhost:5173/?paymentData=${encoded}`;
}
```

---

## Current Deployment Status

### Servers Running

- **Port 5173**: AR Viewer (main application)
- **Port 5175**: E-shop (eshop-sparkle-assets)
- **Port 5176**: On-ramp (onofframp-cube-paygate)

### Network Access

Local URLs:

- http://localhost:5173/ (AR Viewer)
- http://localhost:5175/ (E-shop)
- http://localhost:5176/ (On-ramp)

Network URLs (same WiFi):

- http://172.22.207.112:5173/ (AR Viewer)
- http://172.22.207.112:5175/ (E-shop)
- http://172.22.207.112:5176/ (On-ramp)

---

## Payment Flow Logic

### Display Logic

```javascript
// In AgentInteractionModal and CubePaymentEngine
if (agent.fee_type === "dynamic") {
  if (urlPaymentData && urlPaymentData.amount) {
    display = `${urlPaymentData.amount} ${token}`;
  } else {
    display = "Dynamic Amount";
  }
} else {
  // Fixed fee
  display = `${agent.interaction_fee_amount || agent.interaction_fee} ${token}`;
}
```

### Amount Priority

1. **Dynamic amount from URL** (highest priority)
2. **Agent's interaction_fee_amount** (for fixed fees)
3. **Agent's interaction_fee** (legacy fallback)
4. **10.0** (default fallback)

---

## Token Detection

### Hedera Network

- **Token Symbol**: USDh (Hedera USD stablecoin)
- **Detection**: Based on `deployment_network_name` or `network` field
- **Contract**: 0x00000000000000000000000000000000006e24c7

### Other Networks

- **Default**: USDC
- **Customizable**: Via `interaction_fee_token` field

---

## Known Limitations

1. **ngrok Free Tier**: Limited to 1 simultaneous tunnel
2. **WSL2 Networking**: Requires port forwarding for external access
3. **URL Parameter Size**: Base64 encoding limited by browser URL length

---

## Next Steps for Testing

1. ✅ Test E-shop → AR Viewer flow with various amounts
2. ✅ Test On-ramp → AR Viewer flow
3. ⏳ Test with different tokens (USDC, USDh, custom)
4. ⏳ Test error handling for invalid amounts
5. ⏳ Test with multiple dynamic fee agents
6. ⏳ Load testing with concurrent transactions

---

## Security Considerations

1. **Amount Validation**: Implemented in `validatePaymentAmount()`
   - Must be positive number
   - Maximum 1,000,000 to prevent errors
2. **URL Parameter Validation**: Checks for valid JSON structure

3. **Future Enhancement**: Add HMAC signature verification for payment data

---

## Git Commit

**Branch:** `revolut-qr-payments-sim-dynamimic-online-payments-solana-hedera`

**Commit:** 52c3478

**Message:**

```
✅ Dynamic Fee Type Implementation - URL Parameter Payment Integration

- Added fee_type field support (dynamic/fixed) for payment terminals
- Implemented URL parameter parsing for dynamic payment amounts
- Successfully tested: 7.55 USDh transaction on Hedera
```

---

## Documentation Created

1. `DYNAMIC_PAYMENT_AMOUNT_TESTING_GUIDE.md` - Testing scenarios
2. `DYNAMIC_FEE_TYPE_FIX_SUMMARY.md` - Technical fix details
3. `DYNAMIC_FEES_IMPLEMENTATION_SUMMARY.md` - This document

---

## Questions for Next Session

1. Should we add webhook callbacks after payment completion?
2. Do we need order status tracking?
3. Should we support multiple payment terminals in URL?
4. Network access configuration for production?
5. Integration testing with actual e-shop/on-ramp flows?

---

**Status:** ✅ Ready for testing  
**Last Updated:** November 12, 2025
