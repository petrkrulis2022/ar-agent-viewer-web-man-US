# 🚀 USDh Integration - Quick Start Guide

## ✅ Integration Complete!

The AR Viewer now supports **USDh** and **6 custom stablecoins** instead of native HBAR.

---

## 🎯 What Changed?

### Before (HBAR)

```
✗ Native HBAR transfers
✗ 18 decimals (like ETH)
✗ 1 HBAR = ~$0.10
✗ Special case logic
```

### After (USDh)

```
✓ ERC-20 token transfers
✓ 6 decimals (like USDC)
✓ 10 USDh = $10.00
✓ Standardized flow
```

---

## 📋 Quick Test Steps

### 1️⃣ Add USDh to MetaMask

**Network:** Hedera Testnet (296)

```
Token Address: 0x00000000000000000000000000000000006e24c7
Symbol:        USDh
Decimals:      6
```

### 2️⃣ Check Balance Display

✅ Should show: `💎 X.XX USDh`  
❌ Should NOT show: `X.XXXX HBAR`

### 3️⃣ Generate QR Code

1. Navigate to Hedera agent
2. Click "Crypto QR"
3. Check console for:

```
✅ Custom stablecoin USDh validated for chain 296
🪙 Using custom stablecoin USDh at address: 0x00000000000000000000000000000000006e24c7
```

### 4️⃣ Scan & Pay

QR should trigger ERC-20 transfer:

- To: `0x00000000000000000000000000000000006e24c7`
- Function: `transfer(address,uint256)`
- Amount: `10000000` (10.00 USDh with 6 decimals)

---

## 🪙 Available Stablecoins

| Token       | Status      | Address       | Networks       |
| ----------- | ----------- | ------------- | -------------- |
| **USDh** 💎 | ✅ DEPLOYED | `0x...6e24c7` | Hedera Testnet |
| USDΔ 🔺     | 🚧 Planned  | `0x...000000` | All Testnets   |
| USDaix 🌊   | 🚧 Planned  | `0x...000000` | All Testnets   |
| USDΔ+ ⚡    | 🚧 Planned  | `0x...000000` | All Testnets   |
| USDaix+ 🚀  | 🚧 Planned  | `0x...000000` | All Testnets   |
| USDar 🎯    | 🚧 Planned  | `0x...000000` | All Testnets   |
| USDair ☁️   | 🚧 Planned  | `0x...000000` | All Testnets   |

---

## 🔧 Developer Usage

### Get Stablecoin Info

```javascript
import customStablecoinService from "./services/customStablecoinService";

// Get USDh config
const usdh = customStablecoinService.getStablecoin("USDh", 296);
// { symbol: "USDh", contractAddress: "0x...6e24c7", decimals: 6, ... }

// Get all deployed tokens
const tokens = customStablecoinService.getAllStablecoins(296);

// Validate before use
customStablecoinService.validateToken("USDh", 296); // OK
customStablecoinService.validateToken("USDΔ", 296); // Throws error (not deployed)
```

### Generate Payment QR

```javascript
import dynamicQRService from "./services/dynamicQRService";

// Use agent's default token
const qr1 = await dynamicQRService.generateDynamicQR(agent, 10);

// Override with specific token
const qr2 = await dynamicQRService.generateDynamicQR(agent, 10, "USDh");
```

### Get Token Balance

```javascript
import { ethers } from "ethers";

const provider = new ethers.providers.Web3Provider(window.ethereum);
const tokenContract = new ethers.Contract(
  "0x00000000000000000000000000000000006e24c7",
  ["function balanceOf(address) view returns (uint256)"],
  provider
);

const balance = await tokenContract.balanceOf(userAddress);
const formatted = parseFloat(ethers.utils.formatUnits(balance, 6));
console.log(`Balance: ${formatted} USDh`);
```

---

## 📁 Key Files

```
✅ New Files:
   - src/config/stablecoin-registry.json
   - src/services/customStablecoinService.js
   - USDH_INTEGRATION_SUMMARY.md

✅ Modified Files:
   - src/config/ccip-config-consolidated.json
   - src/config/hedera-testnet-chain.js
   - src/components/NetworkDisplay.jsx
   - src/services/dynamicQRService.js
```

---

## 🐛 Troubleshooting

### Balance Not Showing?

```bash
# Check console
# Should see: "💰 USDh Balance fetched: X.XX"

# Verify token added to MetaMask
# Address: 0x00000000000000000000000000000000006e24c7
```

### QR Generation Failing?

```javascript
// Check agent config
console.log(agent.interaction_fee_token); // Should be "USDh"
console.log(agent.deployment_chain_id); // Should be 296
```

### Wrong Amount in MetaMask?

```
Check decimals:
✅ Should be 6
❌ If 18, token contract wrong
```

---

## 🎉 Success Indicators

### ✅ Integration Working If:

1. **Balance Display**

   - Shows `💎 X.XX USDh`
   - NO HBAR shown

2. **QR Code**

   - Console shows USDh validation
   - EIP-681 URI has USDh address
   - Amount calculated with 6 decimals

3. **MetaMask**

   - Shows ERC-20 transfer
   - Contract: `0x...6e24c7`
   - Function: `transfer`

4. **Transaction**
   - HashScan shows token transfer
   - Correct amount received

---

## 📞 Quick Commands

```bash
# Start server
npm run dev

# Check for errors
# (Should be 0 errors)

# Test in browser
http://localhost:5173
```

---

## 🔗 Resources

- **HashScan (USDh):** https://hashscan.io/testnet/token/0x00000000000000000000000000000000006e24c7
- **Hedera Explorer:** https://hashscan.io/testnet
- **Full Documentation:** USDH_INTEGRATION_SUMMARY.md

---

**Status:** ✅ READY FOR TESTING  
**Next Step:** Connect to Hedera Testnet and test payment flow!
