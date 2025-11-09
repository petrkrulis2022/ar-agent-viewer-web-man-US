# USDh and Custom Stablecoins Integration Summary

**Date:** November 8, 2025  
**Status:** ✅ COMPLETE - Ready for Testing

---

## 🎯 Integration Completed

Successfully integrated USDh stablecoin and infrastructure for 6 additional custom stablecoins on Hedera Testnet and other EVM testnets.

### ✅ What Was Done

1. **Removed Native HBAR Support**

   - Deleted native HBAR transfer logic from `dynamicQRService.js`
   - Removed HBAR balance display from `NetworkDisplay.jsx`
   - Updated `hedera-testnet-chain.js` to ERC-20 only mode

2. **Added Custom Stablecoin Infrastructure**

   - Created `stablecoin-registry.json` with USDh + 6 placeholders
   - Created `customStablecoinService.js` for token management
   - Updated `ccip-config-consolidated.json` with custom stablecoins

3. **Updated Components**

   - `NetworkDisplay.jsx` now shows all deployed stablecoins
   - `dynamicQRService.js` supports custom token selection
   - Added validation for placeholder tokens

4. **Payment Flow Changes**
   - All payments now use ERC-20 `transfer()` method
   - QR codes generate EIP-681 URIs with 6-decimal amounts
   - Token validation prevents usage of undeployed tokens

---

## 🪙 Deployed Tokens

### USDh (DEPLOYED) ✅

- **Contract Address:** `0x00000000000000000000000000000000006e24c7`
- **Network:** Hedera Testnet (296)
- **Decimals:** 6
- **Status:** DEPLOYED AND ACTIVE
- **Icon:** 💎

### Future Tokens (Placeholders) 🚧

All configured with address `0x0000000000000000000000000000000000000000`:

1. **USDΔ** (USD Delta) 🔺 - 6 decimals
2. **USDaix** 🌊 - 6 decimals
3. **USDΔ+** (USD Delta Plus) ⚡ - 6 decimals
4. **USDaix+** 🚀 - 6 decimals
5. **USDar** 🎯 - 6 decimals
6. **USDair** ☁️ - 6 decimals

---

## 📁 Files Modified

### Configuration Files

```
✅ src/config/ccip-config-consolidated.json
   - Added customStablecoins section to HederaTestnet
   - Removed HBAR from feeTokens
   - Added defaultPaymentToken: "USDh"

✅ src/config/stablecoin-registry.json (NEW)
   - Complete registry of all 7 custom stablecoins
   - Network deployment tracking
   - Validation rules

✅ src/config/hedera-testnet-chain.js
   - Removed paymentType: "native"
   - Added paymentType: "ERC20"
   - Updated default fee from 1 HBAR to 10 USDh
```

### Service Layer

```
✅ src/services/customStablecoinService.js (NEW)
   - getDeployedStablecoins(chainId)
   - getStablecoin(symbol, chainId)
   - validateToken(symbol, chainId)
   - formatAmount(amount, symbol)
   - parseAmount(amount, symbol)

✅ src/services/dynamicQRService.js
   - Added paymentToken parameter to generateDynamicQR()
   - Added token validation before QR generation
   - Custom stablecoin address lookup
   - Removed native HBAR transfer logic (lines 652-660 deleted)
```

### UI Components

```
✅ src/components/NetworkDisplay.jsx
   - Removed hbarBalance state
   - Added stablecoinBalances state
   - fetchStablecoinBalances() - gets all deployed tokens
   - Shows all stablecoins with icons and balances
```

---

## 🔧 API Changes

### DynamicQRService

**Old Method Signature:**

```javascript
async generateDynamicQR(agentData, amountUSD = null)
```

**New Method Signature:**

```javascript
async generateDynamicQR(agentData, amountUSD = null, paymentToken = null)
```

**Example Usage:**

```javascript
// Use agent's default token
const qr = await dynamicQRService.generateDynamicQR(agent, 10);

// Override with USDh
const qr = await dynamicQRService.generateDynamicQR(agent, 10, "USDh");

// Will throw error if token not deployed
const qr = await dynamicQRService.generateDynamicQR(agent, 10, "USDΔ");
// Error: "USDΔ is not yet deployed on HederaTestnet..."
```

### CustomStablecoinService

**Get Token Config:**

```javascript
import customStablecoinService from "./services/customStablecoinService";

const usdh = customStablecoinService.getStablecoin("USDh", 296);
// {
//   symbol: "USDh",
//   contractAddress: "0x00000000000000000000000000000000006e24c7",
//   decimals: 6,
//   status: "DEPLOYED",
//   ...
// }
```

**Validate Token:**

```javascript
try {
  customStablecoinService.validateToken("USDh", 296);
  // ✅ Token valid and deployed
} catch (error) {
  // ❌ Token not deployed or invalid
  console.error(error.message);
}
```

**Get All Stablecoins:**

```javascript
const tokens = customStablecoinService.getAllStablecoins(296);
// [
//   { symbol: "USDh", isDeployed: true, ... },
//   { symbol: "USDΔ", isDeployed: false, ... },
//   ...
// ]
```

---

## 💻 Code Examples

### Agent Configuration (AgentSphere Backend)

**Old HBAR Agent:**

```json
{
  "deployment_chain_id": 296,
  "deployment_token_symbol": "HBAR",
  "interaction_fee_amount": "1.00",
  "interaction_fee_token": "HBAR"
}
```

**New USDh Agent:**

```json
{
  "deployment_chain_id": 296,
  "deployment_token_symbol": "USDh",
  "deployment_token_contract_address": "0x00000000000000000000000000000000006e24c7",
  "interaction_fee_amount": "10.00",
  "interaction_fee_token": "USDh"
}
```

### Payment Flow

**1. User Views Agent:**

```
Agent Card shows: "Pay 10.00 USDh"
Network Display shows: "💎 250.50 USDh"
```

**2. User Clicks "Crypto QR":**

```javascript
// AR Viewer generates QR with:
- Token: USDh
- Address: 0x00000000000000000000000000000000006e24c7
- Amount: 10000000 (10.00 * 10^6)
- Chain: 296
- Type: ERC-20 transfer
```

**3. QR Code Data (EIP-681):**

```
ethereum:0x00000000000000000000000000000000006e24c7@296/transfer?address=0xAGENT_WALLET&uint256=10000000
```

**4. MetaMask Transaction:**

```javascript
{
  to: "0x00000000000000000000000000000000006e24c7", // USDh contract
  data: "0xa9059cbb..." // transfer(recipient, 10000000)
  chainId: 296
}
```

---

## 🧪 Testing Guide

### Phase 1: USDh Balance Display

1. **Connect MetaMask to Hedera Testnet (296)**
2. **Add USDh to MetaMask:**

   - Token Address: `0x00000000000000000000000000000000006e24c7`
   - Symbol: `USDh`
   - Decimals: `6`

3. **Expected Behavior:**
   - Network Display shows: `💎 X.XX USDh`
   - Console shows: `💰 USDh Balance fetched: X.XX`
   - No HBAR balance shown

### Phase 2: QR Generation

1. **Navigate to Agent on Hedera Testnet**
2. **Agent Should Display:**

   - Payment amount in USDh (not HBAR)
   - Token symbol: USDh

3. **Click "Crypto QR"**
4. **Expected QR Data:**

   ```json
   {
     "chainType": "EVM",
     "chainId": 296,
     "to": "0x00000000000000000000000000000000006e24c7",
     "amount": "10.00",
     "token": "USDh"
   }
   ```

5. **Console Should Show:**
   ```
   ✅ Custom stablecoin USDh validated for chain 296
   🪙 Using custom stablecoin USDh at address: 0x00000000000000000000000000000000006e24c7
   📱 Generated EIP-681 for ERC-20 on chain 296: ethereum:0x...
   ```

### Phase 3: Payment Execution

1. **Scan QR with MetaMask Mobile**
2. **MetaMask Should Show:**

   - Contract: `0x00000000000000000000000000000000006e24c7`
   - Function: `transfer`
   - Amount: `10.000000 USDh`

3. **Complete Transaction**
4. **Verify on HashScan:**
   - https://hashscan.io/testnet/transaction/0x...
   - Should show ERC-20 transfer to agent wallet

### Phase 4: Error Handling

**Test Placeholder Token:**

```javascript
// Try to use USDΔ (not deployed)
const qr = await dynamicQRService.generateDynamicQR(agent, 10, "USDΔ");
```

**Expected Error:**

```
Error: USDΔ is not yet deployed on HederaTestnet.
Please select a different payment token or wait for deployment.
```

---

## 🚨 Common Issues & Solutions

### Issue 1: Balance Not Showing

**Symptom:** NetworkDisplay doesn't show USDh balance

**Solutions:**

1. Check token added to MetaMask with correct address
2. Verify connected to Hedera Testnet (296)
3. Check console for balance fetch errors
4. Ensure USDh contract exists on testnet

### Issue 2: QR Generation Fails

**Symptom:** Error when generating payment QR

**Possible Causes:**

- Token validation failing (placeholder address)
- Agent has wrong token symbol in database
- Network mismatch

**Debug:**

```javascript
// Check agent config
console.log(agent.interaction_fee_token); // Should be "USDh"
console.log(agent.deployment_chain_id); // Should be 296

// Check token config
const token = customStablecoinService.getStablecoin("USDh", 296);
console.log(token); // Should have valid contractAddress
```

### Issue 3: Wrong Decimals

**Symptom:** Payment amount incorrect in MetaMask

**Check:**

- All custom stablecoins MUST use 6 decimals
- Verify in stablecoin-registry.json
- Check token contract on HashScan

### Issue 4: Native HBAR Still Appearing

**Symptom:** Old HBAR logic still executing

**Fix:**

1. Clear browser cache: `Ctrl+Shift+Del`
2. Restart development server: `npm run dev`
3. Hard refresh: `Ctrl+Shift+R`

---

## 📊 Migration Path

### For Existing HBAR Agents

**Database Update Required:**

```sql
-- Update all Hedera agents from HBAR to USDh
UPDATE deployed_objects
SET
  interaction_fee_token = 'USDh',
  deployment_token_symbol = 'USDh',
  deployment_token_contract_address = '0x00000000000000000000000000000000006e24c7',
  interaction_fee_amount = interaction_fee_amount * 10 -- Convert 1 HBAR -> 10 USDh
WHERE
  deployment_chain_id = 296
  AND interaction_fee_token = 'HBAR';
```

**Expected Changes:**

- `1.00 HBAR` → `10.00 USDh`
- Native transfer → ERC-20 transfer
- No QR code format changes (both use EIP-681)

---

## 🔮 Future Deployment Checklist

When deploying additional stablecoins (USDΔ, USDaix, etc.):

### Step 1: Deploy Token on Hedera

```bash
# Use Hedera Stablecoin Studio or SDK
node scripts/create-custom-stablecoin.js
```

### Step 2: Update Registry

```json
// stablecoin-registry.json
{
  "stablecoins": {
    "USDΔ": {
      "status": "DEPLOYED", // Change from NOT_DEPLOYED
      "deployedNetworks": {
        "HederaTestnet": {
          "chainId": 296,
          "contractAddress": "0xNEW_ADDRESS_HERE", // Update
          "deploymentDate": "2025-11-XX",
          "verified": true
        }
      }
    }
  }
}
```

### Step 3: Update CCIP Config

```json
// ccip-config-consolidated.json
{
  "chains": {
    "HederaTestnet": {
      "customStablecoins": {
        "USDΔ": {
          "tokenAddress": "0xNEW_ADDRESS_HERE", // Update
          "status": "DEPLOYED" // Change status
        }
      }
    }
  }
}
```

### Step 4: Test

```javascript
// Verify deployment
const token = customStablecoinService.getStablecoin("USDΔ", 296);
console.log(token.status); // Should be "DEPLOYED"

// Test QR generation
const qr = await dynamicQRService.generateDynamicQR(agent, 10, "USDΔ");
// Should succeed without errors
```

---

## 🎓 Technical Details

### ERC-20 Standard Compliance

All custom stablecoins follow ERC-20 standard:

```solidity
interface IERC20 {
    function transfer(address to, uint256 value) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function decimals() external view returns (uint8);
}
```

### Decimal Handling

**6 Decimals Standard:**

- 1.00 USDh = 1000000 (smallest unit)
- 10.50 USDh = 10500000
- 0.01 USDh = 10000

**Why 6 Decimals?**

- Matches USDC, USDT standard
- Reduces gas costs
- Sufficient precision for payments
- Avoids overflow issues

### EIP-681 URI Format

**Standard Format:**

```
ethereum:<token_address>@<chain_id>/transfer?address=<recipient>&uint256=<amount>
```

**USDh Example:**

```
ethereum:0x00000000000000000000000000000000006e24c7@296/transfer?address=0xRECIPIENT&uint256=10000000
```

**Components:**

- `ethereum:` - Scheme
- Token address - USDh contract
- `@296` - Hedera Testnet chain ID
- `/transfer` - Function name
- `address=` - Recipient wallet
- `uint256=` - Amount in smallest unit (6 decimals)

---

## ✅ Verification Checklist

Before Production:

- [ ] USDh contract deployed on Hedera Testnet
- [ ] Token verified on HashScan
- [ ] Balance display working in NetworkDisplay
- [ ] QR generation working for USDh payments
- [ ] Payment execution successful via MetaMask
- [ ] Error handling for placeholder tokens working
- [ ] AgentSphere backend updated with USDh agents
- [ ] Database migration completed (HBAR → USDh)
- [ ] Documentation reviewed and updated
- [ ] Testing completed on Hedera Testnet

---

## 📞 Support

### Debugging Commands

```javascript
// Check stablecoin config
console.log(customStablecoinService.getAllStablecoins(296));

// Validate token
try {
  customStablecoinService.validateToken("USDh", 296);
  console.log("✅ Token valid");
} catch (e) {
  console.error("❌", e.message);
}

// Get token address
const address = customStablecoinService.getTokenAddress("USDh", 296);
console.log("USDh Address:", address);

// Check if deployed
const isDeployed = customStablecoinService.isDeployed(
  "0x00000000000000000000000000000000006e24c7"
);
console.log("Is Deployed:", isDeployed);
```

### HashScan Links

- **USDh Contract:** https://hashscan.io/testnet/token/0x00000000000000000000000000000000006e24c7
- **Explorer:** https://hashscan.io/testnet

---

## 🎉 Summary

**Integration Status:** ✅ COMPLETE

**What Changed:**

- ❌ Removed: Native HBAR payments
- ✅ Added: USDh ERC-20 stablecoin
- ✅ Added: Infrastructure for 6 more stablecoins
- ✅ Added: Token validation system
- ✅ Added: Multi-token balance display

**What's Next:**

1. Test USDh integration on Hedera Testnet
2. Deploy additional stablecoins as needed
3. Expand to other EVM testnets

**Key Benefits:**

- Standardized payment flow (ERC-20 only)
- Scalable multi-token architecture
- Better error handling
- Consistent 6-decimal standard
- Cross-network support ready

---

**Last Updated:** November 8, 2025  
**Version:** 1.0.0  
**Status:** Ready for Production Testing
