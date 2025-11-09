# 🪙 Hedera USDd Stablecoin - Quick Reference

## ✅ What's Been Done

1. ✅ Installed Hedera Stablecoin Studio SDK
2. ✅ Created service: `src/services/hederaStablecoinService.js`
3. ✅ Created creation script: `scripts/create-usdd-stablecoin.js`
4. ✅ Created detailed guide: `HEDERA_STABLECOIN_CREATION_GUIDE.md`
5. ✅ Updated config: `ccip-config-consolidated.json` (Hedera with USDd placeholder)

---

## 🚀 Quick Start (3 Steps)

### Step 1: Get Hedera Credentials

```bash
# Visit: https://portal.hedera.com/
# Create testnet account → Get Account ID & Private Key
```

### Step 2: Update Creation Script

Edit `scripts/create-usdd-stablecoin.js`:

```javascript
const HEDERA_ACCOUNT_ID = "0.0.123456"; // Your account ID
const HEDERA_PRIVATE_KEY = "your-key-here"; // Your private key
```

### Step 3: Run Creation Script

```bash
node scripts/create-usdd-stablecoin.js
```

**Output**:

- ✅ Token ID (Hedera format)
- ✅ EVM Address (for AR viewer)
- ✅ 6 decimals confirmed
- ✅ Details saved to `stablecoin-details.json`

---

## 📱 Usage in AR Viewer

### Agent Configuration (AgentSphere Backend)

```json
{
  "deployment_chain_id": 296,
  "deployment_token_symbol": "USDd",
  "deployment_token_contract_address": "0x...", // From creation script output
  "interaction_fee_amount": "5.00",
  "interaction_fee_token": "USDd"
}
```

### Payment Flow

1. User connects MetaMask to Hedera Testnet (296)
2. User navigates to Hedera agent
3. User clicks "Crypto QR"
4. QR generates with USDd ERC-20 transfer (6 decimals)
5. User scans and approves
6. Payment complete! ✅

---

## 🔑 Key Features

| Feature            | Value                   |
| ------------------ | ----------------------- |
| **Token Name**     | USD Digital             |
| **Symbol**         | USDd                    |
| **Decimals**       | 6 (stablecoin standard) |
| **Network**        | Hedera Testnet          |
| **Chain ID**       | 296                     |
| **Type**           | ERC-20 Compatible       |
| **Initial Supply** | 1,000,000 USDd          |
| **Max Supply**     | 100,000,000 USDd        |

---

## 💡 Why 6 Decimals?

- ✅ **USDC** = 6 decimals
- ✅ **USDT** = 6 decimals
- ✅ **DAI** = 18 decimals (exception)
- ✅ **Your code expects 6** for ERC-20 tokens

**6 decimals = Stablecoin industry standard**

Example: `5.00 USDd` = `5000000` in smallest units

---

## 🔧 Service API

```javascript
import { hederaStablecoinService } from "./services/hederaStablecoinService";

// Initialize
await hederaStablecoinService.initialize(accountId, privateKey);

// Create token
const result = await hederaStablecoinService.createStablecoin({
  name: "USD Digital",
  symbol: "USDd",
  initialSupply: "1000000",
});

// Get EVM address
const evmAddr = await hederaStablecoinService.getEVMAddress("0.0.123456");

// Mint more tokens
await hederaStablecoinService.mintTokens(
  "0.0.123456",
  "10000",
  "0.0.recipientId"
);

// Check balance
const balance = await hederaStablecoinService.getBalance(
  "0.0.123456",
  "0.0.accountId"
);
```

---

## 🎯 Success Checklist

Before deployment, verify:

- [ ] Token created on Hedera Testnet
- [ ] 6 decimals confirmed on HashScan
- [ ] EVM address obtained
- [ ] Added to MetaMask successfully
- [ ] Config updated in AgentSphere
- [ ] Test payment QR generated
- [ ] Test transaction successful
- [ ] Balance displays correctly

---

## 📚 Documentation

- **Full Guide**: `HEDERA_STABLECOIN_CREATION_GUIDE.md`
- **Token Analysis**: `TOKEN_ADDRESS_INFRASTRUCTURE_ANALYSIS.md`
- **SDK Docs**: https://github.com/hashgraph/stablecoin-studio/blob/main/sdk/README.md
- **Hedera Portal**: https://portal.hedera.com/

---

## ⚠️ Important Notes

1. **Never commit private keys** - Use environment variables
2. **6 decimals required** - Code expects this for ERC-20 tokens
3. **Testnet only** - This setup is for Hedera Testnet (296)
4. **CCIP incompatible** - USDd works for same-chain only, not cross-chain CCIP

---

## 🐛 Quick Troubleshooting

| Problem                | Solution                     |
| ---------------------- | ---------------------------- |
| "Insufficient balance" | Get HBAR from faucet         |
| "Invalid account ID"   | Check format: `0.0.XXXXX`    |
| QR fails               | Verify EVM address in config |
| Wrong amount           | Check token has 6 decimals   |

---

**Ready to create your stablecoin!** 🚀

All files are ready. Just update the credentials in the creation script and run it!
