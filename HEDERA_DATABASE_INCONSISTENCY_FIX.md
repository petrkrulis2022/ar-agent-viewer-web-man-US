# Hedera Agent Database Inconsistency - Fix Required

## Problem Summary

# Hedera Agent Database Inconsistency - CODING AGENT TASK

## ✅ DATABASE FIXED - ❌ FRONTEND CACHE OVERRIDE ISSUE FOUND

### Current Status

✅ **Database Updated** - All Hedera agents have `deployment_chain_id = 296`  
❌ **Frontend Override Logic** - Code in `useDatabase.js` is overriding database values!

### Root Cause Identified

File: `src/hooks/useDatabase.js` (Lines 532-564)

The hook has **enhancement logic** that overrides database chain IDs based on agent names:

```javascript
deployment_chain_id: (() => {
  const agentName = (obj.name || "").toLowerCase();
  let enhancedChainId;

  if (agentName.includes("dynamic")) enhancedChainId = 421614;
  else if (agentName.includes("base")) enhancedChainId = 84532;
  else if (agentName.includes("sepolia 4")) enhancedChainId = 11155111;
  // ...
  else enhancedChainId = 11155111; // ❌ Default to Ethereum Sepolia

  // Use database value ONLY if it's a "recognized testnet"
  const dbChainId = obj.deployment_chain_id || obj.chain_id;
  const recognizedTestnets = [11155111, 421614, 84532, 11155420, 43113];

  if (dbChainId && recognizedTestnets.includes(dbChainId)) {
    return dbChainId; // ✅ Uses database value if recognized
  }

  return enhancedChainId; // ❌ Otherwise uses fallback (wrong!)
})(),
```

**Problem:** Hedera Testnet (296) is NOT in `recognizedTestnets` array!

So the logic:

1. Reads `deployment_chain_id = 296` from database ✅
2. Checks if 296 is in recognizedTestnets → NO ❌
3. Falls back to `enhancedChainId = 11155111` (based on name) ❌

---

## SOLUTION: Add Hedera (296) to Recognized Networks

### File to Edit

`src/hooks/useDatabase.js`

### Changes Required

**Line ~540 - Add 296 to recognizedTestnets array:**

```javascript
// BEFORE (missing Hedera):
const recognizedTestnets = [11155111, 421614, 84532, 11155420, 43113];

// AFTER (includes Hedera):
const recognizedTestnets = [
  296, // Hedera Testnet ✅
  11155111, // Ethereum Sepolia
  421614, // Arbitrum Sepolia
  84532, // Base Sepolia
  11155420, // OP Sepolia
  43113, // Avalanche Fuji
];
```

### Additional Fixes in Same File

**1. Line ~422 - chain_id enhancement (similar issue):**

```javascript
const recognizedTestnets = [
  296, // ✅ Add Hedera here too
  11155111,
  421614,
  84532,
  11155420,
  43113,
];
```

**2. Line ~453 - deployment_network_name enhancement:**
Add Hedera mapping:

```javascript
const chainToNetwork = {
  296: "Hedera Testnet", // ✅ Add this
  11155111: "Ethereum Sepolia",
  421614: "Arbitrum Sepolia",
  84532: "Base Sepolia",
  11155420: "OP Sepolia",
  43113: "Avalanche Fuji",
};
```

**3. Line ~485 - network enhancement:**
Add Hedera name detection:

```javascript
const agentName = (obj.name || "").toLowerCase();
if (agentName.includes("hedera")) return "Hedera Testnet"; // ✅ Add this
if (agentName.includes("dynamic")) return "Arbitrum Sepolia";
// ... rest of logic
```

---

## Testing After Fix

### 1. Clear Browser Cache

```javascript
// Run in browser console:
localStorage.clear();
sessionStorage.clear();
location.reload(true);
```

### 2. Hard Refresh

- Press `Ctrl + Shift + R` (or `Cmd + Shift + R` on Mac)

### 3. Check Console Logs

Should show:

```
Agent Fields:
- deployment_chain_id: 296  ✅
- chain_id: 296  ✅
- Agent Network (raw): 296  ✅
```

NOT:

```
- deployment_chain_id: 11155111  ❌
- Agent Network (raw): 11155111  ❌
```

---

## Complete Fix Summary

### Files to Modify

1. ✅ **Database** - Already fixed (UPDATE query completed)
2. ❌ **src/hooks/useDatabase.js** - Add 296 to recognizedTestnets (3 locations)

### Expected Outcome

- Console shows correct chain IDs from database
- No override logic interfering with Hedera agents
- Network filters work correctly
- Payment flow uses correct network (296)

---

## Quick Fix Code Block

Copy this into `src/hooks/useDatabase.js` at the appropriate lines:

```javascript
// Line ~422 (chain_id logic):
const recognizedTestnets = [296, 11155111, 421614, 84532, 11155420, 43113];

// Line ~453 (network name mapping):
const chainToNetwork = {
  296: "Hedera Testnet",
  11155111: "Ethereum Sepolia",
  421614: "Arbitrum Sepolia",
  84532: "Base Sepolia",
  11155420: "OP Sepolia",
  43113: "Avalanche Fuji",
};

// Line ~485 (network name detection):
if (agentName.includes("hedera")) return "Hedera Testnet";

// Line ~540 (deployment_chain_id logic):
const recognizedTestnets = [296, 11155111, 421614, 84532, 11155420, 43113];
```

---

## Priority: CRITICAL

This prevents the database fix from working. Without this change, all Hedera agents will continue showing chain ID 11155111 despite database having 296.

---

## Estimated Time: 5 minutes

- Add 296 to 3 arrays
- Hard refresh browser
- Verify console logs show 296

---

## Current Database State (INCORRECT)

```javascript
Agent: "Hedera h IA Main 1"
{
  deployment_chain_id: 11155111,  // ❌ WRONG - This is Ethereum Sepolia
  chain_id: 11155111,              // ❌ WRONG - This is Ethereum Sepolia
  deployment_network_name: "Hedera Testnet",  // ✅ CORRECT
  network_id: undefined
}
```

## Expected Database State (CORRECT)

```javascript
Agent: "Hedera h IA Main 1"
{
  deployment_chain_id: 296,        // ✅ Hedera Testnet chain ID
  chain_id: 296,                   // ✅ Hedera Testnet chain ID
  deployment_network_name: "Hedera Testnet",  // ✅ Already correct
  network_id: 296                  // ✅ Should also be 296
}
```

## Root Cause Analysis

### Database Inconsistency

The agent has a **contradiction** between:

- **Network Name**: "Hedera Testnet" (correct)
- **Chain IDs**: 11155111 (Ethereum Sepolia - incorrect)

This happens because:

1. Agent was created or migrated with wrong chain_id values
2. Only the `deployment_network_name` field has the correct value
3. The numeric chain ID fields still reference Ethereum Sepolia (11155111)

### Impact on Application Flow

**Before Override Logic (Lines 1926-1933 in CubePaymentEngine.jsx):**

```javascript
const agentNetwork = agent?.deployment_chain_id || agent?.chain_id;
// Returns: 11155111 ❌
```

**After Override Logic:**

```javascript
if (networkName && networkName.toLowerCase().includes("hedera")) {
  agentNetworkNum = 296; // ✅ Correct
}
```

**Problem:** The override is a **band-aid fix** that works in some code paths but not all. The database should have correct values from the start.

## Why Frontend Overrides Are Not Sufficient

### 1. Network Filter Issues (ARViewer.jsx)

When filtering agents by network, the logic checks:

```javascript
if (activeFilter === "ethereum-sepolia") {
  // This agent WILL match because deployment_chain_id === 11155111
  filtered = filtered.filter(
    (agent) =>
      agent.deployment_chain_id === "11155111" || agent.chain_id === "11155111"
  );
}
```

**Result:** Hedera agents appear in Ethereum Sepolia filter ❌

### 2. Cross-Chain Detection (dynamicQRService.js)

The `getAgentNetwork()` function reads from database:

```javascript
async getAgentNetwork(agentData) {
  return String(agentData.chain_id || agentData.network_id || 11155111);
  // Returns: "11155111" ❌
}
```

**Result:** System thinks agent is on Ethereum Sepolia, triggering cross-chain modal ❌

### 3. Payment Token Configuration

Token lookup uses chain ID:

```javascript
const tokenAddress = this.usdcTokenAddresses[agentNetwork];
// Looks up: this.usdcTokenAddresses[11155111]
// Returns: Ethereum Sepolia USDC instead of Hedera USDh ❌
```

### 4. Transaction Routing

Network comparison for routing:

```javascript
if (userNetwork !== agentNetwork) {
  // User: 296, Agent: 11155111
  // Triggers: Cross-chain modal ❌
}
```

## Current Workarounds in Code

### CubePaymentEngine.jsx (Lines 1926-1933)

```javascript
let agentNetworkNum = agentNetwork ? parseInt(agentNetwork) : null;
const networkName = agent?.deployment_network_name || agent?.network;
if (networkName && networkName.toLowerCase().includes("hedera")) {
  console.log(
    "🔧 Hedera network detected from name - overriding chain ID to 296"
  );
  agentNetworkNum = 296;
}
```

### dynamicQRService.js (Lines 119-137)

```javascript
async getAgentNetwork(agentData) {
  let chainId = String(
    agentData.deployment_chain_id ||
    agentData.chain_id ||
    agentData.network_id ||
    11155111
  );

  const networkName = agentData.deployment_network_name || agentData.network;
  if (networkName && networkName.toLowerCase().includes("hedera")) {
    console.log("🔧 [getAgentNetwork] Hedera network detected from name - overriding chain ID to 296");
    chainId = "296";
  }

  return chainId;
}
```

### dynamicQRService.js (Lines 427-437)

```javascript
let agentChainId = String(
  agentData.deployment_chain_id ||
    agentData.chain_id ||
    agentData.network_id ||
    11155111
);

const networkName = agentData.deployment_network_name || agentData.network;
if (networkName && networkName.toLowerCase().includes("hedera")) {
  console.log(
    "🔧 Hedera network detected from name - overriding chain ID to 296"
  );
  agentChainId = "296";
}
```

### ARViewer.jsx (Lines 585-680)

```javascript
// Network filter with contradiction detection
if (activeFilter === "hedera-testnet") {
  filtered = filtered.filter((agent) => {
    const deploymentChainId = String(agent.deployment_chain_id || "");
    const chainId = String(agent.chain_id || "");
    const networkName = (
      agent.deployment_network_name ||
      agent.network ||
      ""
    ).toLowerCase();

    // Accept if network name contains "hedera" (name-based detection)
    if (networkName.includes("hedera")) {
      return true;
    }

    // Also accept if chain IDs match Hedera
    return deploymentChainId === "296" || chainId === "296";
  });
}
```

**Problem:** We have override logic duplicated in **4 different places** in the codebase! This is technical debt and error-prone.

## Required Fix: Update Database

### Task for Coding Agent

**Objective:** Update the database to store correct chain IDs for Hedera agents, eliminating the need for frontend overrides.

### SQL Query Needed

```sql
-- Update all agents with "Hedera Testnet" network name to have correct chain IDs
UPDATE ar_objects
SET
  deployment_chain_id = 296,
  chain_id = 296,
  network_id = 296
WHERE
  deployment_network_name = 'Hedera Testnet'
  OR network ILIKE '%hedera%'
  OR name ILIKE '%hedera%';

-- Verify the update
SELECT
  id,
  name,
  deployment_network_name,
  deployment_chain_id,
  chain_id,
  network_id
FROM ar_objects
WHERE deployment_network_name = 'Hedera Testnet'
  OR network ILIKE '%hedera%';
```

### Verification Steps

1. **Run SQL update** against the Supabase database
2. **Hard refresh** the application (Ctrl+Shift+R)
3. **Check console logs** when clicking "Pay with Crypto":

   - Should show: `Agent Network (raw): 296` ✅
   - NOT: `Agent Network (raw): 11155111` ❌

4. **Test network filter**:

   - Switch to "Hedera Testnet" filter
   - Hedera agents should appear ✅
   - Switch to "Ethereum Sepolia" filter
   - Hedera agents should NOT appear ✅

5. **Test payment flow**:
   - Click "Pay with Crypto" on Hedera agent
   - Should NOT show "Switch to Hedera Testnet" modal ✅
   - Should generate QR code directly ✅
   - QR should use USDh token (0x00000000000000000000000000000000006e24c7) ✅

### Cleanup After Database Fix

Once database is updated, we can **remove** the override logic from:

1. `CubePaymentEngine.jsx` (lines 1926-1933)
2. `dynamicQRService.js` - `getAgentNetwork()` (lines 119-137)
3. `dynamicQRService.js` - `generateDynamicQR()` (lines 427-437)
4. Simplify network filter logic in `ARViewer.jsx`

This will reduce code complexity and eliminate duplicate override logic.

## Additional Considerations

### Payment Token Field

The agent also has:

```javascript
interaction_fee_token: "USDC"; // Should be "USDh" for Hedera
```

Consider updating this as well:

```sql
UPDATE ar_objects
SET interaction_fee_token = 'USDh'
WHERE deployment_network_name = 'Hedera Testnet'
  AND interaction_fee_token = 'USDC';
```

### Migration for All Networks

If other agents have similar issues (wrong chain IDs for their network), create a comprehensive migration:

```sql
-- Polygon Amoy agents (chain_id should be 80002)
UPDATE ar_objects
SET deployment_chain_id = 80002, chain_id = 80002, network_id = 80002
WHERE deployment_network_name = 'Polygon Amoy'
  AND deployment_chain_id != 80002;

-- Solana Devnet agents (use string 'devnet')
UPDATE ar_objects
SET deployment_chain_id = 'devnet', chain_id = 'devnet', network_id = 'devnet'
WHERE deployment_network_name = 'Solana Devnet'
  AND deployment_chain_id != 'devnet';

-- Add more networks as needed...
```

## Success Criteria

✅ **Database Updated**: Hedera agents have `deployment_chain_id = 296`  
✅ **Console Logs Correct**: Shows `Agent Network (raw): 296`  
✅ **Network Filter Works**: Hedera agents only in Hedera filter  
✅ **No Cross-Chain Modal**: Same-chain payment flows directly to QR  
✅ **Correct Token Used**: USDh (0x00000000000000000000000000000000006e24c7)  
✅ **Code Cleanup**: Override logic removed from frontend

## Priority: HIGH

This is a **data integrity issue** that requires database correction, not just frontend workarounds.

## Estimated Effort

- SQL update: 5 minutes
- Testing: 10 minutes
- Code cleanup (removing overrides): 15 minutes
- **Total: ~30 minutes**

---

**Coding Agent Instructions:**

1. Connect to Supabase database
2. Run the SQL update query for Hedera agents
3. Verify the update with SELECT query
4. Test the application to confirm correct behavior
5. Report back with results and any issues found
