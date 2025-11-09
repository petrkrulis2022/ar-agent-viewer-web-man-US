# Hedera Stablecoin Creation Guide

## Create 6-Decimal USDd Token for AgentSphere Payments

**Date**: 2025-11-07  
**Purpose**: Create a proper 6-decimal stablecoin (USDd) on Hedera Testnet for AR viewer payments

---

## ✅ Installation Complete

The Hedera Stablecoin Studio SDK has been installed:

```bash
npm install @hashgraph/stablecoin-npm-sdk --legacy-peer-deps
```

Service file created: `/src/services/hederaStablecoinService.js`

---

## 📋 Prerequisites

### 1. **Hedera Testnet Account**

- Visit: https://portal.hedera.com/
- Create a testnet account
- You'll receive:
  - **Account ID**: `0.0.XXXXXX` (e.g., `0.0.123456`)
  - **Private Key**: Keep this SECRET!
  - **Public Key**: For verification

### 2. **Fund Your Account**

- Get testnet HBAR from: https://portal.hedera.com/faucet
- You need HBAR to pay for stablecoin creation transaction fees

---

## 🚀 Quick Start - Create USDd Token

### Step 1: Import the Service

```javascript
import { hederaStablecoinService } from "./services/hederaStablecoinService";
```

### Step 2: Initialize with Your Credentials

```javascript
// ⚠️ IMPORTANT: Use your ACTUAL Hedera testnet credentials
const accountId = "0.0.YOUR_ACCOUNT_ID"; // Replace with your account ID
const privateKey = "YOUR_PRIVATE_KEY"; // Replace with your private key

await hederaStablecoinService.initialize(accountId, privateKey);
```

### Step 3: Create the Stablecoin

```javascript
const result = await hederaStablecoinService.createStablecoin({
  name: "USD Digital",
  symbol: "USDd",
  decimals: 6, // ✅ 6 DECIMALS - STABLECOIN STANDARD
  initialSupply: "1000000", // 1 million tokens (1,000,000.000000)
  maxSupply: "10000000", // 10 million max (optional)
});

console.log("✅ Stablecoin Created!");
console.log("Hedera Token ID:", result.tokenId); // e.g., 0.0.123456
console.log("EVM Address:", result.evmAddress); // e.g., 0x000...123456
console.log("Decimals:", result.decimals); // 6
console.log("Explorer:", result.explorer); // HashScan link
```

---

## 📝 Complete Example Script

Create a new file: `/scripts/create-usdd-stablecoin.js`

```javascript
import { hederaStablecoinService } from "../src/services/hederaStablecoinService.js";

async function createUSDd() {
  try {
    console.log("🚀 Creating USDd Stablecoin on Hedera Testnet...\n");

    // Step 1: Initialize
    console.log("Step 1: Initializing SDK...");
    await hederaStablecoinService.initialize(
      "0.0.YOUR_ACCOUNT_ID", // ← Replace with YOUR account ID
      "YOUR_PRIVATE_KEY" // ← Replace with YOUR private key
    );

    // Step 2: Create stablecoin
    console.log("\nStep 2: Creating stablecoin...");
    const result = await hederaStablecoinService.createStablecoin({
      name: "USD Digital",
      symbol: "USDd",
      initialSupply: "1000000", // 1 million tokens
      maxSupply: "100000000", // 100 million max
    });

    if (result.success) {
      console.log("\n✅ SUCCESS! Stablecoin created:\n");
      console.log(
        "┌─────────────────────────────────────────────────────────┐"
      );
      console.log(
        "│ Token Details                                           │"
      );
      console.log(
        "├─────────────────────────────────────────────────────────┤"
      );
      console.log(`│ Name:          ${result.name.padEnd(40)} │`);
      console.log(`│ Symbol:        ${result.symbol.padEnd(40)} │`);
      console.log(
        `│ Decimals:      ${result.decimals.toString().padEnd(40)} │`
      );
      console.log(`│ Token ID:      ${result.tokenId.padEnd(40)} │`);
      console.log(`│ EVM Address:   ${result.evmAddress.padEnd(40)} │`);
      console.log(`│ Initial Supply:${result.initialSupply.padEnd(40)} │`);
      console.log(`│ Max Supply:    ${result.maxSupply.padEnd(40)} │`);
      console.log(
        "└─────────────────────────────────────────────────────────┘"
      );
      console.log(`\n📱 View on HashScan: ${result.explorer}`);
      console.log(`\n🔧 Use this EVM address in your agent config:`);
      console.log(`   ${result.evmAddress}`);
    } else {
      console.error("❌ Failed to create stablecoin:", result.error);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// Run the script
createUSDd();
```

Run it:

```bash
node scripts/create-usdd-stablecoin.js
```

---

## 🔧 Integration with AR Viewer

### Update Agent Deployment Configuration

When deploying an agent in AgentSphere that accepts USDd:

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

### Update Config File

The `ccip-config-consolidated.json` has already been updated with your USDd address:

```json
"HederaTestnet": {
  "chainId": 296,
  "usdc": {
    "tokenAddress": "0x00000000000000000000000000000000006dba7f",
    "decimals": 6
  }
}
```

---

## 💰 Token Operations

### Mint More Tokens (Cash In)

```javascript
await hederaStablecoinService.mintTokens(
  "0.0.123456", // Token ID
  "10000", // Amount to mint (10,000.000000)
  "0.0.YOUR_ACCOUNT_ID" // Recipient account
);
```

### Check Balance

```javascript
const balance = await hederaStablecoinService.getBalance(
  "0.0.123456", // Token ID
  "0.0.YOUR_ACCOUNT_ID" // Account to check
);
console.log(`Balance: ${balance} USDd`);
```

### Get Token Details

```javascript
const details = await hederaStablecoinService.getStablecoinDetails(
  "0.0.123456"
);
console.log(details);
```

---

## 🔍 Verify Your Stablecoin

After creation, verify on HashScan:

1. **Visit**: https://hashscan.io/testnet/
2. **Search**: Your token ID (e.g., `0.0.123456`)
3. **Verify**:
   - ✅ Name: "USD Digital"
   - ✅ Symbol: "USDd"
   - ✅ Decimals: 6
   - ✅ Type: "Fungible Common"
   - ✅ Supply: 1,000,000.000000

---

## 📱 Test Payment Flow

### 1. Connect MetaMask to Hedera Testnet

- Network: Hedera Testnet
- Chain ID: 296
- RPC: https://testnet.hashio.io/api

### 2. Add USDd Token to MetaMask

- Token Address: `0x00000000000000000000000000000000006dba7f`
- Symbol: USDd
- Decimals: 6

### 3. Test Payment

1. Navigate to Hedera agent in AR viewer
2. Click "Crypto QR" payment button
3. QR code should generate with USDd transfer (6 decimals)
4. Scan and approve transaction

---

## ⚠️ Important Notes

### Decimals Matter!

- **6 decimals** = Stablecoin standard (USDC, USDT)
- **18 decimals** = Native token standard (HBAR, ETH)
- **Your current code expects 6 decimals** for ERC-20 tokens

### EVM Address Conversion

Hedera token IDs are automatically converted to EVM addresses:

- **Hedera Format**: `0.0.123456`
- **EVM Format**: `0x000000000000000000000000000000000001e240`

The service handles this conversion automatically.

### Security

- **NEVER** commit private keys to Git
- **NEVER** share your private key
- Use environment variables for credentials:
  ```javascript
  const accountId = process.env.HEDERA_ACCOUNT_ID;
  const privateKey = process.env.HEDERA_PRIVATE_KEY;
  ```

---

## 🎯 Success Criteria

After creating your stablecoin, you should have:

✅ Token ID in Hedera format (0.0.XXXXX)  
✅ EVM-compatible address (0x...)  
✅ 6 decimals confirmed  
✅ Visible on HashScan  
✅ Integrated in ccip-config-consolidated.json  
✅ Working payment QR generation  
✅ Successful test transaction

---

## 📚 Additional Resources

- **SDK Documentation**: https://github.com/hashgraph/stablecoin-studio/blob/main/sdk/README.md
- **Hedera Portal**: https://portal.hedera.com/
- **HashScan Explorer**: https://hashscan.io/testnet/
- **Hedera Docs**: https://docs.hedera.com/
- **Testnet Faucet**: https://portal.hedera.com/faucet

---

## 🐛 Troubleshooting

### "Insufficient balance" error

→ Get more HBAR from the faucet: https://portal.hedera.com/faucet

### "Invalid account ID" error

→ Double-check your account ID format: `0.0.XXXXX`

### "Invalid private key" error

→ Ensure private key is in correct format (DER encoded hex string)

### QR generation fails

→ Verify token address in config matches your created token's EVM address

### Wrong decimal amount

→ Check that token was created with 6 decimals (not 18)

---

**Ready to create your stablecoin!** 🚀

Run the creation script and you'll have a proper 6-decimal USDd token ready for AgentSphere payments!
