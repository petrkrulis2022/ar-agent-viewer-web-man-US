# Dynamic Payment Amount Testing Guide

**Implementation Date**: November 11, 2025  
**Feature**: Dynamic payment amounts from URL parameters (e-shop/on-ramp integration)

---

## What Was Implemented

✅ **URL Parameter Parsing** - Extracts payment data from e-shop and on-ramp redirects  
✅ **Fee Type Support** - Handles both `fixed` and `dynamic` fee agents  
✅ **Payment Amount Override** - URL amounts override default agent fees for dynamic agents  
✅ **Backward Compatibility** - Agents without `fee_type` field continue to work  
✅ **Payment Info Display** - Shows order ID and merchant name when available

---

## Files Modified

1. **`src/utils/paymentUtils.js`** (NEW)

   - `parsePaymentDataFromURL()` - Decodes base64 payment data from URL
   - `getDynamicPaymentAmount()` - Calculates final amount based on fee_type
   - `validatePaymentAmount()` - Validates amount is reasonable
   - `formatPaymentAmount()` - Formats display
   - `getPaymentConfigSummary()` - Logging helper

2. **`src/components/CubePaymentEngine.jsx`**
   - Added `fee_type`, `interaction_fee_amount`, `interaction_fee_token` to database query
   - Added URL parsing in `useEffect` hook
   - Created `getFinalPaymentAmount()` helper function
   - Updated all payment handlers (crypto QR, bank QR, virtual card, cross-chain)
   - Enhanced AR QR display with dynamic amount and URL payment data

---

## Testing Scenarios

### Scenario 1: Fixed Fee Agent (No URL Parameters)

**Setup:**

- Agent with `fee_type = "fixed"` and `interaction_fee_amount = 10.0`
- Open AR viewer directly (no URL parameters)

**Expected Result:**

- ✅ Payment modal shows **10.0 USDh** (or configured token)
- ✅ Amount is NOT dynamic
- ✅ No order information displayed

**Test URL:**

```
http://localhost:5173/
```

---

### Scenario 2: Dynamic Fee Agent (No URL Parameters)

**Setup:**

- Agent with `fee_type = "dynamic"` and `interaction_fee_amount = null`
- Open AR viewer directly (no URL parameters)

**Expected Result:**

- ✅ Payment modal shows **"Dynamic Amount"** label
- ✅ Amount is highlighted as dynamic
- ✅ No order information displayed

**Test URL:**

```
http://localhost:5173/
```

---

### Scenario 3: Dynamic Fee Agent + E-Shop Redirect

**Setup:**

- Agent with `fee_type = "dynamic"`
- Redirect from e-shop with amount = 237.6

**Expected Result:**

- ✅ Payment modal shows **237.6 USDh** (not default fee)
- ✅ Order ID displayed: `ORD-MWHW0Y0FD`
- ✅ Payment processes with 237.6 amount
- ✅ Console logs show URL payment data

**Test URL:**

```
http://localhost:5173/?payment=true&data=eyJvcmRlcklkIjoiT1JELU1XSFcwWTBGRCIsImFtb3VudCI6MjM3LjYsImN1cnJlbmN5IjoiVVNEIiwiaXRlbXMiOlt7InByb2R1Y3RJZCI6Imhvb2RpZS0xIiwibmFtZSI6IkN1YmVQYXkgVGVjaCBIb29kaWUiLCJxdWFudGl0eSI6MSwicHJpY2UiOjEwMCwiaW1hZ2UiOiIvc3JjL2Fzc2V0cy9ob29kaWUtbmF2eS1ibHVlLnBuZyIsImNvbG9yIjoiTmF2eSBCbHVlIiwic2l6ZSI6IlMifV19
```

**Decoded Data:**

```json
{
  "orderId": "ORD-MWHW0Y0FD",
  "amount": 237.6,
  "currency": "USD",
  "items": [...]
}
```

---

### Scenario 4: Dynamic Fee Agent + On-Ramp Redirect

**Setup:**

- Agent with `fee_type = "dynamic"`
- Redirect from on-ramp with amount = 528

**Expected Result:**

- ✅ Payment modal shows **528 USDh** (not default fee)
- ✅ Order ID displayed: `12O57975E`
- ✅ Merchant name displayed: `CubePay Exchange`
- ✅ Payment processes with 528 amount
- ✅ Console logs show on-ramp payment data

**Test URL:**

```
http://localhost:5173/payment-redirect?data=eyJvcmRlcklkIjoiMTJPNTc5NzVFIiwiYW1vdW50Ijo1MjgsImN1cnJlbmN5IjoiVVNEIiwibWVyY2hhbnROYW1lIjoiQ3ViZVBheSBFeGNoYW5nZSIsInR5cGUiOiJvbm9mcmFtcCIsImNyeXB0byI6IkVUSCJ9
```

**Decoded Data:**

```json
{
  "orderId": "12O57975E",
  "amount": 528,
  "currency": "USD",
  "merchantName": "CubePay Exchange",
  "type": "onramp",
  "crypto": "ETH"
}
```

---

### Scenario 5: Fixed Fee Agent + URL Parameters (Should Ignore URL)

**Setup:**

- Agent with `fee_type = "fixed"` and `interaction_fee_amount = 10.0`
- URL has amount = 237.6 in parameters

**Expected Result:**

- ✅ Payment modal shows **10.0 USDh** (IGNORES URL amount)
- ✅ Amount is NOT overridden
- ✅ Order info may display but amount is fixed

**Test URL:**

```
http://localhost:5173/?payment=true&data=eyJvcmRlcklkIjoiT1JELU1XSFcwWTBGRCIsImFtb3VudCI6MjM3LjYsImN1cnJlbmN5IjoiVVNEIn0=
```

---

### Scenario 6: Agent Without fee_type (Backward Compatibility)

**Setup:**

- Old agent without `fee_type` field
- Has `interaction_fee_amount = 15.0`
- URL has amount parameter

**Expected Result:**

- ✅ Payment modal shows **15.0 USDh** (uses default fallback)
- ✅ No errors or warnings
- ✅ URL amount is ignored (safe fallback behavior)

**Test URL:**

```
http://localhost:5173/
```

---

## Console Log Verification

When everything is working, you should see these logs:

### On Page Load:

```
📋 Parsing URL payment data and calculating dynamic amount...
📦 Parsed payment data from URL: {orderId: "ORD-123", amount: 237.6, ...}
💰 Using dynamic amount from URL: 237.6
💳 Payment configuration: {
  feeType: "dynamic",
  agentDefaultFee: null,
  urlAmount: 237.6,
  finalAmount: 237.6,
  orderId: "ORD-123",
  ...
}
```

### On Payment Generation:

```
💰 Using payment amount: 237.6
✅ QR code generated with amount: 237.6
```

---

## Database Verification

Check that your agents have the correct `fee_type`:

```sql
SELECT
  name,
  object_type,
  fee_type,
  interaction_fee_amount,
  interaction_fee_token,
  deployment_network_name
FROM deployed_objects
WHERE object_type IN ('payment_terminal', 'trailing_payment_terminal')
ORDER BY created_at DESC
LIMIT 10;
```

**Expected Results:**

- Payment terminals with `fee_type = 'fixed'` have a specific `interaction_fee_amount`
- Payment terminals with `fee_type = 'dynamic'` have `interaction_fee_amount = null`

---

## Common Issues & Solutions

### Issue 1: URL Parameters Not Parsing

**Symptom:** Amount always shows default fee  
**Check:** Console logs for `📦 Parsed payment data from URL`  
**Solution:** Verify URL encoding is correct (base64)

### Issue 2: Amount Shows "Dynamic Amount" Instead of Value

**Symptom:** Dynamic label shown even with URL amount  
**Check:** `urlPaymentData.amount` is defined and is a number  
**Solution:** Ensure e-shop/on-ramp sends `amount` field

### Issue 3: Fixed Fee Agent Uses URL Amount

**Symptom:** Fixed fee overridden by URL  
**Check:** Agent's `fee_type` field in database  
**Solution:** Update agent to `fee_type = 'fixed'`

### Issue 4: Negative or Invalid Amount

**Symptom:** Error message about invalid amount  
**Check:** Console logs from `validatePaymentAmount()`  
**Solution:** E-shop/on-ramp must send positive amount < 1,000,000

---

## Quick Test Commands

### Test URL Encoding (Browser Console):

```javascript
// Encode test data
const testData = { orderId: "TEST-123", amount: 100, currency: "USD" };
const encoded = btoa(JSON.stringify(testData));
console.log("Test URL:", `http://localhost:5173/?data=${encoded}`);
```

### Test URL Decoding:

```javascript
// Decode existing URL parameter
const urlParams = new URLSearchParams(window.location.search);
const encoded = urlParams.get("data");
if (encoded) {
  const decoded = JSON.parse(atob(encoded));
  console.log("Decoded:", decoded);
}
```

---

## Success Criteria

✅ **Fixed fee agents** always show their configured `interaction_fee_amount`  
✅ **Dynamic fee agents** show URL amount when present, otherwise "Dynamic Amount"  
✅ **URL payment data** (order ID, merchant) displays correctly  
✅ **Payment processing** uses the correct final amount  
✅ **Backward compatibility** maintained for agents without `fee_type`  
✅ **No console errors** during URL parsing or payment generation

---

## Next Steps After Testing

1. ✅ Verify all scenarios pass
2. ✅ Test with real e-shop checkout flow (port 5175)
3. ✅ Test with real on-ramp flow (port 5176)
4. ✅ Confirm transaction amounts on Hedera HashScan
5. ✅ Confirm transaction amounts on Solana Explorer
6. ✅ Update AgentSphere deployment to set `fee_type` correctly

---

**Implementation Status**: ✅ Complete  
**Ready for Testing**: Yes  
**Estimated Testing Time**: 15-20 minutes
