# AR Viewer: Interaction Fee Display Validation Guide

## 🎯 Overview

This guide explains how to verify that the AR Viewer correctly displays interaction fees from AgentSphere agents, ensuring that user-entered fees (e.g., 3 USDC) are shown accurately instead of hardcoded fallback values (1 USDC).

## 🔍 Current Implementation

### Enhanced Interaction Fee Validation System

AR Viewer now includes a comprehensive validation system that:

1. **Prioritizes Dynamic Data**: Uses `interaction_fee_amount` and `interaction_fee_token` from AgentSphere's dynamic deployment system
2. **Falls Back to Legacy Data**: Supports existing fee fields for backward compatibility
3. **Provides Debug Tools**: Includes validation dashboard and logging for troubleshooting
4. **Validates Data Sources**: Tracks where fee data comes from for debugging

### Field Priority Order

The system checks fields in this priority order:

```javascript
1. agent.interaction_fee_amount      // NEW: Dynamic deployment field
2. agent.fee_usdt                   // Specific: USDT fees
3. agent.fee_usdc                   // Specific: USDC fees
4. agent.fee_usds                   // Specific: USDs fees
5. agent.interaction_fee_usdfc      // Legacy: USDFC fees
6. agent.interaction_fee            // Legacy: Generic fee
7. 1.0 USDC                        // Fallback: When no data found
```

## 🧪 Testing & Validation

### 1. Fee Validation Dashboard

Access the debug dashboard at: **http://localhost:5176/debug-fees**

The dashboard shows:

- ✅ **Total agents analyzed**
- ✅ **Agents using dynamic data** (new format)
- ✅ **Agents using legacy data** (existing format)
- ❌ **Agents using fallback fees** (need attention)

### 2. Individual Agent Analysis

Click on any agent in the dashboard to see:

#### Fee Information

- **Display Amount**: The numeric fee value shown to users
- **Display Token**: The token symbol (USDC, USDT, etc.)
- **Full Display**: The complete fee string (e.g., "3.0 USDC")
- **Data Source**: Which database field was used
- **Is Dynamic**: Whether using new dynamic deployment data

#### Raw Database Fields

- **interaction_fee_amount**: New dynamic field (should be 3.0, not 1.0)
- **interaction_fee_token**: New token field (should be "USDC")
- **interaction_fee**: Legacy fee field
- **fee_usdt/fee_usdc/fee_usds**: Specific currency fields

### 3. Console Logging

Check browser console for detailed validation output:

```javascript
🔍 AGENT DATA VALIDATION DEBUG:
Agent ID: agent_123
Agent Name: Test Agent

💰 INTERACTION FEE FIELD ANALYSIS:
- interaction_fee_amount: 3.0 (type: number)
- interaction_fee_token: USDC
- interaction_fee (legacy): null
- fee_usdt: null
- fee_usdc: null

✅ RESOLVED INTERACTION FEE:
- Display Fee: 3.0
- Display Token: USDC
- Data Source: dynamic (interaction_fee_amount)
```

## 🎯 Expected Results After AgentSphere Fix

### Before Fix (Current Issue)

```
Agent displays: "1 USDC" (hardcoded fallback)
Console shows: "Data Source: fallback (hardcoded)"
Dashboard shows: Red "fallback" badge
```

### After Fix (Expected Result)

```
Agent displays: "3 USDC" (actual deployed fee)
Console shows: "Data Source: dynamic (interaction_fee_amount)"
Dashboard shows: Green "dynamic" badge
```

## 🛠️ Components Updated

### 1. Agent Display Components

- **AgentDetailModal.jsx**: Updated fee display in detail view
- **NeARAgentsList.jsx**: Updated fee display in agent list
- **AgentCard.jsx**: Updated fee display in agent cards

### 2. Validation System

- **agentDataValidator.js**: Enhanced with fee field validation
- **AgentFeeValidationDashboard.jsx**: New debug dashboard component

### 3. QR Payment Services

- **dynamicQRService.js**: Updated to use validated fee amounts
- **CubePaymentHandler.jsx**: Updated payment flow

## 🔧 How Fee Display Works

### 1. Data Fetching

```javascript
// Agents fetched from AgentSphere database
const agent = await fetchAgentData(agentId);
```

### 2. Fee Validation

```javascript
// Enhanced validation with priority order
const feeInfo = formatInteractionFee(agent);
// Returns: { amount: 3.0, token: "USDC", display: "3.0 USDC", source: "dynamic" }
```

### 3. Display Rendering

```javascript
// Component renders validated fee
<span className="interaction-fee">
  {feeInfo.display} // Shows "3.0 USDC" instead of "1 USDC"
</span>
```

## 🚨 Troubleshooting

### Issue: Still Showing "1 USDC"

**Check 1: Data Source**

```javascript
// In browser console
const feeInfo = formatInteractionFee(agent);
console.log("Fee source:", feeInfo.source);
```

If source is `"fallback (hardcoded)"`, the agent data is missing fee information.

**Check 2: Raw Agent Data**

```javascript
// Check what AgentSphere is sending
console.log("Raw agent data:", agent);
console.log("interaction_fee_amount:", agent.interaction_fee_amount);
```

If `interaction_fee_amount` is `null` or `undefined`, AgentSphere hasn't fixed the storage issue yet.

**Check 3: Database Fields**
Use the validation dashboard to see all available fee fields for each agent.

### Issue: Wrong Token Displayed

Check the `interaction_fee_token` field:

```javascript
console.log("Token field:", agent.interaction_fee_token);
```

Should match the token selected during agent deployment.

### Issue: Decimal Places Wrong

The system automatically formats decimals:

- Whole numbers: `"3 USDC"` (no decimal)
- Decimals: `"3.5 USDC"` (removes trailing zeros)

## ✅ Success Criteria

### 1. Agent Card Display

- ✅ Shows actual deployed fee amount (3 USDC, not 1 USDC)
- ✅ Shows correct token symbol
- ✅ No hardcoded fallback values visible

### 2. QR Code Generation

- ✅ QR codes contain correct payment amounts
- ✅ Payment flows use actual fee values
- ✅ No 1 USDC default amounts in transactions

### 3. Validation Dashboard

- ✅ Shows majority of agents using "dynamic" data source
- ✅ Minimal agents using "fallback" data source
- ✅ Console logs show correct fee resolution

### 4. Different Agents Show Different Fees

- ✅ Agent A: 3 USDC
- ✅ Agent B: 5 USDC
- ✅ Agent C: 1.5 USDC
- ✅ No agents showing identical fallback fees

## 🔄 Development Workflow

### 1. Test Current State

```bash
# Start AR Viewer
npm run dev

# Open validation dashboard
# http://localhost:5176/debug-fees

# Check console for fee validation logs
```

### 2. Verify AgentSphere Fix

```bash
# After AgentSphere updates interaction fee storage:
# 1. Refresh validation dashboard
# 2. Check for "dynamic" data sources
# 3. Verify correct fee amounts displayed
# 4. Test QR generation with new amounts
```

### 3. Production Testing

```bash
# Test with real AgentSphere agents
# Verify different agents show different fees
# Confirm QR payments use correct amounts
# Check user experience in AR view
```

## 📋 Testing Checklist

- [ ] Validation dashboard loads without errors
- [ ] Console shows detailed fee field analysis
- [ ] Agents display actual deployed fees (not 1 USDC fallback)
- [ ] Different agents show different fee amounts
- [ ] QR codes generate with correct payment amounts
- [ ] Payment flows use validated fee data
- [ ] No hardcoded values visible in UI
- [ ] Legacy agents still work with existing data
- [ ] Error handling works for missing data

## 🎉 Expected Outcome

Once AgentSphere fixes the interaction fee storage issue:

1. **AR Viewer will automatically display correct fees** without code changes
2. **Debug dashboard will show "dynamic" data sources** for updated agents
3. **QR codes will contain actual payment amounts** instead of fallback values
4. **Users will see deployed fees** (3 USDC) instead of hardcoded defaults (1 USDC)

The AR Viewer is now **fully prepared** to correctly display interaction fees as soon as AgentSphere resolves the storage issue.

---

_For technical questions or issues, check the validation dashboard at `/debug-fees` and review the console logs for detailed fee field analysis._
