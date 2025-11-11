# Dynamic Fee Type Display Fix - Summary

## Issue Description

Agent "Hedera Pay 3" with `fee_type='dynamic'` and `interaction_fee_amount=NULL` was displaying "3 USDh" instead of "Dynamic Amount" in the payment modal.

## Root Cause Analysis

### Problem 1: Missing `fee_type` field in database query

**File:** `src/lib/supabase.js`
**Line:** 162-195

The `getNearAgentsFromSupabase()` function was not including the `fee_type` field in its SELECT query, meaning the agent data loaded from Supabase did not contain this critical field.

### Problem 2: Component logic not respecting `fee_type`

**Files:**

- `src/components/AR3DScene.jsx` (line 566-593)
- `src/components/CameraView.jsx` (line 889)

The components were passing `paymentAmount` based on a fallback chain:

```javascript
selectedAgent?.interaction_fee_amount || selectedAgent?.interaction_fee || 10.0;
```

This meant that even when `interaction_fee_amount` was NULL (correct for dynamic fee agents), the code would fall back to `interaction_fee`, which contained the hardcoded value "3" from the mock data generator.

## Solution Implemented

### Fix 1: Added `fee_type` to database query

**File:** `src/lib/supabase.js`

Added `fee_type` and `interaction_fee_token` to the SELECT query in `getNearAgentsFromSupabase()`:

```javascript
const { data, error } = await supabase
  .from("deployed_objects")
  .select(
    `
    id,
    name,
    // ... other fields ...
    interaction_fee_amount,
    interaction_fee_token,
    interaction_fee_usdfc,
    fee_type,              // ← ADDED
    interaction_range,
    // ... remaining fields ...
  `
  )
  .limit(100);
```

### Fix 2: Updated AR3DScene.jsx to respect `fee_type`

**File:** `src/components/AR3DScene.jsx`

Replaced the paymentAmount calculation logic to check `fee_type` first:

```javascript
paymentAmount={
  (() => {
    const isDynamicFee = selectedAgent?.fee_type === "dynamic";

    // For dynamic fee agents, return null to show "Dynamic Amount" label
    if (isDynamicFee && !isPaymentTerminal) {
      return null;
    }

    // For payment terminals, use payment context amount
    if (isPaymentTerminal) {
      return paymentContext?.amount || selectedAgent?.interaction_fee || 10.0;
    }

    // For fixed fee agents, use interaction_fee_amount
    return selectedAgent?.interaction_fee_amount ||
           selectedAgent?.interaction_fee ||
           10.0;
  })()
}
```

### Fix 3: Updated CameraView.jsx to respect `fee_type`

**File:** `src/components/CameraView.jsx`

Simplified the paymentAmount calculation:

```javascript
paymentAmount={
  selectedAgent?.fee_type === "dynamic"
    ? null
    : selectedAgent?.interaction_fee_amount ||
      selectedAgent?.interaction_fee ||
      10.0
}
```

## Behavior After Fix

### For Dynamic Fee Agents (`fee_type='dynamic'`)

- Database: `fee_type='dynamic'`, `interaction_fee_amount=NULL`
- Display: **"Dynamic Amount"** (orange text)
- Amount used: Parsed from URL parameter (e.g., `?paymentData=...`)
- Fallback: If no URL parameter, shows "Dynamic Amount" label

### For Fixed Fee Agents (`fee_type='fixed'` or NULL)

- Database: `fee_type='fixed'`, `interaction_fee_amount=10.5`
- Display: **"10.5 USDh"** (or other token symbol)
- Amount used: `interaction_fee_amount` from database
- Fallback chain: `interaction_fee_amount` → `interaction_fee` → 10.0

### For Payment Terminals

- Database: `agent_type='Payment Terminal'`
- Display: Amount from `paymentContext` (e.g., **"25.00 USDC"**)
- Amount used: `paymentContext.amount`
- Fallback: `interaction_fee` → 10.0

## Testing

### Test Case 1: Dynamic Fee Agent (Fixed Issue)

**Agent:** "Hedera Pay 3"

- Database: `fee_type='dynamic'`, `interaction_fee_amount=NULL`
- **Expected:** Display "Dynamic Amount" label
- **Result:** ✅ PASS - Now shows "Dynamic Amount"

### Test Case 2: Dynamic Fee Agent with URL Parameter

**Agent:** "Hedera Pay 3"

- URL: `http://localhost:5173/?paymentData=eyJvcmRlcklkIjoiT1JELTEyMzQ1IiwiYW1vdW50Ijo3LjU1LCJjdXJyZW5jeSI6IlVTREMiLCJtZXJjaGFudE5hbWUiOiJBZ2VudFNwaGVyZSBFLVNob3AifQ==`
- **Expected:** Display "7.55 USDC" (from URL)
- **Result:** ✅ PASS - Dynamic amount overrides

### Test Case 3: Fixed Fee Agent

**Agent:** Regular agent with fixed fee

- Database: `fee_type='fixed'`, `interaction_fee_amount=10.5`
- **Expected:** Display "10.5 USDh"
- **Result:** ✅ PASS - Shows fixed amount

## Files Modified

1. **src/lib/supabase.js**
   - Added `fee_type` and `interaction_fee_token` to SELECT query
2. **src/components/AR3DScene.jsx**
   - Updated `paymentAmount` calculation to check `fee_type` first
   - Added detailed console logging for debugging
3. **src/components/CameraView.jsx**
   - Updated `paymentAmount` calculation to respect `fee_type`

## Database Schema Requirements

Ensure the `deployed_objects` table has these fields:

```sql
fee_type VARCHAR(20) DEFAULT 'fixed',
interaction_fee_amount DECIMAL(18,6),
interaction_fee_token VARCHAR(10) DEFAULT 'USDC',
```

## URL Parameter Format

For dynamic fee agents, payment data can be passed via URL:

```
?paymentData=BASE64_ENCODED_JSON
```

Where the JSON contains:

```json
{
  "orderId": "ORD-12345",
  "amount": 7.55,
  "currency": "USDC",
  "merchantName": "AgentSphere E-Shop"
}
```

## Related Documentation

- **DYNAMIC_PAYMENT_AMOUNT_TESTING_GUIDE.md** - Comprehensive testing scenarios
- **src/utils/paymentUtils.js** - URL parsing and amount calculation utilities
- **AR_VIEWER_DYNAMIC_PAYMENT_INTEGRATION.md** - Original implementation guide

## Verification Steps

1. ✅ Database query includes `fee_type` field
2. ✅ Component logic checks `fee_type` before using fallback amounts
3. ✅ Dynamic fee agents show "Dynamic Amount" label
4. ✅ Fixed fee agents show their configured amount
5. ✅ URL parameter overrides work for dynamic fee agents
6. ✅ Backward compatibility maintained for agents without `fee_type` field

## Notes

- The mock data generator in `useDatabase.js` (line 109) still has hardcoded fee amounts, but this doesn't affect real database queries anymore since the components now respect the `fee_type` field from the database
- The fallback to `interaction_fee` is maintained for backward compatibility with older agents that may not have `interaction_fee_amount` or `fee_type` fields
