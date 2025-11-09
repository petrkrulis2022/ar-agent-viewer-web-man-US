# Token Address Infrastructure Analysis

## Supporting USDd and Future Stablecoins on Hedera & Other Networks

**Date**: 2025-11-04  
**Scope**: Hedera-to-Hedera same-chain payments with ERC-20 tokens (USDd initially)  
**NOT CCIP**: This analysis focuses on direct same-chain ERC-20 transfers, NOT cross-chain CCIP transfers

---

## Executive Summary

Currently, the payment system is hardcoded to use USDC token addresses from the CCIP configuration. To support USDd (and future stablecoins) on Hedera Testnet and other networks, we need to:

1. **Decouple token addresses from CCIP** - CCIP config should only be for cross-chain
2. **Create flexible token registry** - Support multiple tokens per network
3. **Add token selection mechanism** - Allow agents to specify which token they accept
4. **Update QR generation** - Support dynamic token addresses per agent/network

---

## Current Token Address Architecture

### 1. **Configuration Files**

#### `/src/config/ccip-config-consolidated.json`

- **Current State**: Contains USDC addresses for CCIP-supported networks
- **Hedera Entry Added**:
  ```json
  "HederaTestnet": {
    "chainId": 296,
    "usdc": {
      "tokenAddress": "0x00000000000000000000000000000000006dba7f",  // USDd
      "decimals": 6
    }
  }
  ```
- **Issue**: Naming it "usdc" is misleading when it's actually USDd
- **Recommendation**: Rename to generic "defaultToken" or create "supportedTokens" array

---

### 2. **Service Layer - Token Address Usage**

#### **A. `/src/services/dynamicQRService.js`** ⚠️ CRITICAL

**Lines affected**: 15, 34-36, 60, 102, 612, 620, 669, 673

**Current Implementation**:

```javascript
// Line 15: Hardcoded for USDC only
this.usdcTokenAddresses = {};

// Lines 34-36: Only loads USDC from config
this.usdcTokenAddresses["solana-devnet"] = config.usdc.tokenAddress;
this.usdcTokenAddresses[chainId] = config.usdc.tokenAddress;

// Line 612: Token lookup is USDC-only
const tokenAddress = this.usdcTokenAddresses[targetNetwork];
```

**Problems**:

1. Property name `usdcTokenAddresses` assumes only USDC
2. No mechanism to specify which token an agent accepts
3. No fallback if agent wants different token (like USDd)
4. Hedera HBAR payments work, but token payments are limited

**Needed Changes**:

```javascript
// PROPOSED STRUCTURE
this.tokenRegistry = {
  296: {  // Hedera Testnet
    'HBAR': { address: 'native', decimals: 18, type: 'native' },
    'USDd': { address: '0x00000000000000000000000000000000006dba7f', decimals: 6, type: 'ERC20' },
    // Future: 'USDC-Hedera': { address: '0x...', decimals: 6, type: 'ERC20' }
  },
  11155111: {  // Ethereum Sepolia
    'ETH': { address: 'native', decimals: 18, type: 'native' },
    'USDC': { address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', decimals: 6, type: 'ERC20' }
  }
  // ... other networks
};

// NEW METHOD
getTokenAddress(chainId, tokenSymbol) {
  return this.tokenRegistry[chainId]?.[tokenSymbol]?.address || null;
}

// BACKWARD COMPATIBLE
getUSDCAddress(chainId) {
  return this.getTokenAddress(chainId, 'USDC');
}
```

**Key Changes Required**:

1. **Line 15**: Rename `usdcTokenAddresses` → `tokenRegistry`
2. **Lines 32-37**: Loop through all tokens in config, not just USDC
3. **Line 612**: Change to `getTokenAddress(targetNetwork, agentToken)`
4. **Lines 642-647**: Use agent-specified token address
5. **Lines 751-775**: Update `generateTransferData()` to accept token decimals

---

#### **B. `/src/services/ccipConfigService.js`** ⚠️ MEDIUM PRIORITY

**Lines affected**: 207, 304, 542, 553, 1365, 1377, 1395, 1481, 1487

**Current Implementation**:

```javascript
// Line 207: Only stores USDC config
usdc: config.usdc,

// Line 304: USDC-only getter
getUSDCAddress(chainName) {
  return config.usdc.tokenAddress;
}

// Lines 542, 553: Hardcoded USDC in CCIP transactions
usdcTokenAddress: sourceConfig.usdc.tokenAddress,
token: sourceConfig.usdc.tokenAddress,
```

**Impact**:

- CCIP cross-chain transfers are USDC-only ✅ **This is CORRECT** - keep as is
- USDd will NOT work for cross-chain CCIP (expected behavior)
- Same-chain transfers don't use CCIP service

**Recommendation**:

- ✅ **NO CHANGES NEEDED** - CCIP should remain USDC-only
- Document clearly: "USDd is for Hedera same-chain only, not CCIP"

---

#### **C. `/src/components/CubePaymentEngine.jsx`** ⚠️ HIGH PRIORITY

**Lines affected**: 723-733, 1086, 1438, 2771

**Current Implementation**:

```javascript
// Lines 723-728: Hardcoded USDC symbol for all networks
const supportedNetworks = {
  11155111: { name: "Ethereum Sepolia", symbol: "USDC" },
  421614: { name: "Arbitrum Sepolia", symbol: "USDC" },
  // ... etc
  296: { name: "Hedera Testnet", symbol: "HBAR" },
};

// Line 1086: Fallback to USDC
token: agent.interaction_fee_token || "USDC",
```

**Problems**:

1. Network symbols hardcoded (doesn't account for multiple tokens)
2. Agent's `interaction_fee_token` field is used, but no validation
3. No way to verify if token is actually supported on that network

**Needed Changes**:

```javascript
// PROPOSED: Read token from agent data
const agentTokenSymbol =
  agent.interaction_fee_token || agent.deployment_token_symbol || "USDC"; // fallback

// PROPOSED: Validate token is supported on agent's network
const agentChainId = agent.deployment_chain_id || agent.chain_id;
const tokenConfig = dynamicQRService.getTokenAddress(
  agentChainId,
  agentTokenSymbol
);

if (!tokenConfig) {
  console.warn(
    `Token ${agentTokenSymbol} not supported on chain ${agentChainId}, falling back to USDC`
  );
}
```

**Key Changes Required**:

1. **Line 1086**: Add token validation before using
2. **Line 1438**: Read token symbol from agent, not network default
3. **Lines 1900-2000**: Update network detection to check agent's token requirements
4. **Add new function**: `validateAgentTokenSupport(agent)` before payment

---

### 3. **Database Schema & Agent Fields**

#### **Agent Token Configuration Fields**

From `/src/hooks/useDatabase.js` and `/src/utils/agentDataValidator.js`:

**Current Fields**:

```javascript
// Legacy field (used inconsistently)
token_address: obj.token_address || null;

// Deployment-specific (preferred)
deployment_token_contract_address: obj.deployment_token_contract_address ||
  obj.token_contract_address;

// Token symbol
deployment_token_symbol: obj.deployment_token_symbol; // e.g., "USDd", "USDC"
```

**Recommendation**: Standardize on:

- `deployment_token_symbol` → Which token agent accepts (e.g., "USDd")
- `deployment_token_contract_address` → Override default token address
- `deployment_chain_id` → Which network agent is on

**AgentSphere Backend Integration**:
When deploying agent with USDd:

```json
{
  "deployment_chain_id": 296,
  "deployment_network_name": "Hedera Testnet",
  "deployment_token_symbol": "USDd",
  "deployment_token_contract_address": "0x00000000000000000000000000000000006dba7f",
  "interaction_fee_amount": "5.00",
  "interaction_fee_token": "USDd"
}
```

---

### 4. **QR Code Generation Logic**

#### **Same-Chain ERC-20 Payment Flow**

From `/src/services/dynamicQRService.js` lines 642-660:

**Current Code**:

```javascript
if (tokenAddress) {
  // ERC-20 token transfer URI format with chain ID
  const amountInDecimals = Math.floor(
    parseFloat(feeAmount) * Math.pow(10, 6) // ⚠️ Hardcoded 6 decimals
  );
  paymentUri = `ethereum:${tokenAddress}@${targetNetwork}/transfer?address=${walletAddress}&uint256=${amountInDecimals}`;
}
```

**Issues**:

1. ✅ Token address comes from lookup - Good!
2. ⚠️ Decimals hardcoded to 6 - Need dynamic decimals
3. ❌ No validation if token exists on network

**Fixed Code**:

```javascript
// Get token config with decimals
const agentToken =
  agentData.deployment_token_symbol ||
  agentData.interaction_fee_token ||
  "USDC";
const tokenConfig = this.tokenRegistry[targetNetwork]?.[agentToken];

if (!tokenConfig) {
  throw new Error(
    `Token ${agentToken} not supported on network ${targetNetwork}`
  );
}

const tokenAddress = tokenConfig.address;
const decimals = tokenConfig.decimals;

if (tokenAddress !== "native") {
  // ERC-20 token transfer
  const amountInDecimals = Math.floor(
    parseFloat(feeAmount) * Math.pow(10, decimals) // ✅ Dynamic decimals
  );
  paymentUri = `ethereum:${tokenAddress}@${targetNetwork}/transfer?address=${walletAddress}&uint256=${amountInDecimals}`;
} else {
  // Native token (HBAR, ETH, etc.)
  const amountInWei = Math.floor(
    parseFloat(feeAmount) * Math.pow(10, decimals)
  );
  paymentUri = `ethereum:${walletAddress}@${targetNetwork}?value=${amountInWei}`;
}
```

---

## Implementation Plan

### Phase 1: Token Registry Infrastructure (Priority: HIGH)

**Files to modify**:

1. `/src/config/token-registry.json` ← **NEW FILE**
2. `/src/services/dynamicQRService.js`
3. `/src/services/tokenRegistryService.js` ← **NEW SERVICE**

**New Token Registry Config**:

```json
{
  "networks": {
    "296": {
      "name": "Hedera Testnet",
      "nativeToken": "HBAR",
      "tokens": {
        "HBAR": {
          "type": "native",
          "address": "native",
          "decimals": 18,
          "symbol": "HBAR",
          "name": "Hedera"
        },
        "USDd": {
          "type": "ERC20",
          "address": "0x00000000000000000000000000000000006dba7f",
          "decimals": 6,
          "symbol": "USDd",
          "name": "USD Digital (Demo Stablecoin)"
        }
      }
    },
    "11155111": {
      "name": "Ethereum Sepolia",
      "nativeToken": "ETH",
      "tokens": {
        "ETH": {
          "type": "native",
          "address": "native",
          "decimals": 18,
          "symbol": "ETH",
          "name": "Ether"
        },
        "USDC": {
          "type": "ERC20",
          "address": "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
          "decimals": 6,
          "symbol": "USDC",
          "name": "USD Coin"
        }
      }
    }
  }
}
```

---

### Phase 2: Update DynamicQRService (Priority: HIGH)

**Changes to `/src/services/dynamicQRService.js`**:

```javascript
// Line 15: Replace usdcTokenAddresses with tokenRegistry
import tokenRegistryConfig from "../config/token-registry.json";

class DynamicQRService {
  constructor() {
    this.tokenRegistry = {};
    this.initializeTokenRegistry();
  }

  initializeTokenRegistry() {
    // Load from token-registry.json
    Object.entries(tokenRegistryConfig.networks).forEach(
      ([chainId, network]) => {
        this.tokenRegistry[chainId] = network.tokens;
      }
    );

    console.log("✅ Token Registry initialized:", {
      networks: Object.keys(this.tokenRegistry).length,
      totalTokens: Object.values(this.tokenRegistry).reduce(
        (sum, tokens) => sum + Object.keys(tokens).length,
        0
      ),
    });
  }

  getTokenConfig(chainId, tokenSymbol) {
    return this.tokenRegistry[chainId]?.[tokenSymbol] || null;
  }

  getSupportedTokens(chainId) {
    return Object.keys(this.tokenRegistry[chainId] || {});
  }

  // Backward compatibility
  getUSDCAddress(chainId) {
    return this.getTokenConfig(chainId, "USDC")?.address || null;
  }
}
```

**Line 612**: Replace token lookup:

```javascript
// OLD:
const tokenAddress = this.usdcTokenAddresses[targetNetwork];

// NEW:
const agentToken =
  agentData.deployment_token_symbol ||
  agentData.interaction_fee_token ||
  "USDC";
const tokenConfig = this.getTokenConfig(targetNetwork, agentToken);
const tokenAddress = tokenConfig?.address;
const decimals = tokenConfig?.decimals || 6;
```

**Lines 642-660**: Update QR generation with dynamic decimals (shown above)

---

### Phase 3: Update CubePaymentEngine (Priority: MEDIUM)

**Changes to `/src/components/CubePaymentEngine.jsx`**:

```javascript
// Line 1086: Validate token before using
const agentToken =
  agent.interaction_fee_token || agent.deployment_token_symbol || "USDC";
const agentChain = agent.deployment_chain_id || agent.chain_id;

// Validate token is supported
const tokenConfig = dynamicQRService.getTokenConfig(agentChain, agentToken);
if (!tokenConfig) {
  console.warn(
    `⚠️ Agent requests ${agentToken} on chain ${agentChain}, but token not supported. ` +
      `Available: ${dynamicQRService.getSupportedTokens(agentChain).join(", ")}`
  );
  // Fallback to network's native token or USDC
}
```

---

### Phase 4: NetworkDisplay Token Balance (Priority: LOW)

**Changes to `/src/components/NetworkDisplay.jsx`**:

Current implementation shows USDd balance hardcoded. Make it dynamic:

```javascript
// Fetch all ERC-20 token balances for current network
const supportedTokens = dynamicQRService.getSupportedTokens(296);
const tokenBalances = {};

for (const tokenSymbol of supportedTokens) {
  const tokenConfig = dynamicQRService.getTokenConfig(296, tokenSymbol);
  if (tokenConfig.type === "ERC20") {
    const balance = await fetchERC20Balance(
      accounts[0],
      tokenConfig.address,
      tokenConfig.decimals
    );
    tokenBalances[tokenSymbol] = balance;
  }
}

setTokenBalances(tokenBalances); // Display all tokens
```

---

## Testing Requirements

### Test Scenarios for USDd on Hedera

1. **Same-Chain USDd Payment**:

   - User: Hedera Testnet (296)
   - Agent: Hedera Testnet (296), accepts USDd
   - Expected: Generate QR with USDd ERC-20 transfer
   - Token address: `0x00000000000000000000000000000000006dba7f`

2. **Same-Chain HBAR Payment**:

   - User: Hedera Testnet (296)
   - Agent: Hedera Testnet (296), accepts HBAR
   - Expected: Generate QR with native HBAR transfer
   - Should NOT trigger CCIP

3. **Token Not Supported**:

   - User: Hedera Testnet (296)
   - Agent: Hedera Testnet (296), accepts "USDC" (not deployed on Hedera)
   - Expected: Error or fallback to HBAR

4. **Cross-Chain Attempt**:
   - User: Ethereum Sepolia (11155111)
   - Agent: Hedera Testnet (296), accepts USDd
   - Expected: CCIP error (USDd not in CCIP config) - this is correct behavior

---

## Files Summary

### Files That Need Changes

| File                                        | Priority     | Changes             | Reason                      |
| ------------------------------------------- | ------------ | ------------------- | --------------------------- |
| `/src/config/token-registry.json`           | **HIGH**     | Create new file     | Central token configuration |
| `/src/services/tokenRegistryService.js`     | **HIGH**     | Create new file     | Token management service    |
| `/src/services/dynamicQRService.js`         | **CRITICAL** | Major refactor      | Token address lookup logic  |
| `/src/components/CubePaymentEngine.jsx`     | **HIGH**     | Token validation    | Payment routing             |
| `/src/components/NetworkDisplay.jsx`        | **LOW**      | Multi-token balance | UI enhancement              |
| `/src/config/ccip-config-consolidated.json` | **LOW**      | Rename "usdc" key   | Clarity (optional)          |

### Files That Should NOT Change

| File                                    | Reason                              |
| --------------------------------------- | ----------------------------------- |
| `/src/services/ccipConfigService.js`    | CCIP is USDC-only, keep as is       |
| `/src/services/solanaPaymentService.js` | Solana has own token handling       |
| `/src/services/hederaWalletService.js`  | Native HBAR only, working correctly |

---

## Future Stablecoin Support

To add a new stablecoin (e.g., proper USDC on Hedera):

1. **Update `/src/config/token-registry.json`**:

```json
"296": {
  "tokens": {
    "HBAR": { ... },
    "USDd": { ... },
    "USDC": {  // NEW
      "type": "ERC20",
      "address": "0x...",  // Real USDC contract
      "decimals": 6,
      "symbol": "USDC",
      "name": "USD Coin (Official)"
    }
  }
}
```

2. **Deploy agent with new token**:

```json
{
  "deployment_token_symbol": "USDC",
  "deployment_token_contract_address": "0x...",
  "interaction_fee_token": "USDC"
}
```

3. **That's it!** Token registry automatically handles it.

---

## Critical Implementation Notes

### ✅ DO:

- Use token registry for ALL same-chain payments
- Validate token support before generating QR
- Store decimals with token config
- Support both native and ERC-20 tokens
- Keep CCIP separate (USDC only)

### ❌ DON'T:

- Hardcode token addresses in service files
- Assume 6 decimals for all tokens
- Mix CCIP config with same-chain token config
- Use `token_address` field directly without validation
- Try to use USDd for cross-chain CCIP

---

## Next Steps

1. ✅ **Already Done**: Added USDd to Hedera config
2. ✅ **Already Done**: Added USDd balance display
3. 🔲 **TODO**: Create `/src/config/token-registry.json`
4. 🔲 **TODO**: Refactor `dynamicQRService.js` to use token registry
5. 🔲 **TODO**: Add token validation in `CubePaymentEngine.jsx`
6. 🔲 **TODO**: Test USDd payment QR generation
7. 🔲 **TODO**: Document token deployment guide for AgentSphere

---

**Analysis Complete** - Ready for implementation! 🚀
