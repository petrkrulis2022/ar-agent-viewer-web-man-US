# Hedera Testnet - HBAR Native Payments

## ✅ Implementation Status: ACTIVE

We are using **HBAR (Hedera's native currency)** for all agent payments on Hedera Testnet.

## Why HBAR Instead of USDC?

1. **✅ HBAR Faucet Available**: Free testnet HBAR at https://portal.hedera.com/faucet
2. **❌ No USDC Faucet**: USDC contract `0x0000000000000000000000000000000000068c0A` has no public testnet faucet
3. **⚡ Faster Transactions**: Native payments are faster than ERC20 token transfers
4. **💰 Lower Gas Costs**: No token approve() or transferFrom() calls needed
5. **🚀 Immediate Testing**: Can test payments right away without complex token setup

## How It Works

### Agent Payment Flow

```
1. User connects MetaMask to Hedera Testnet (Chain ID 296)
2. System detects Hedera network automatically
3. User scans QR code or clicks "Pay with HBAR" button
4. Payment executes via native eth_sendTransaction
5. Transaction confirmed on Hedera Testnet
6. Agent unlocked for interaction
```

### Technical Implementation

**Payment Method**: Native HBAR Transfer

- Uses `eth_sendTransaction` (not ERC20 token contract)
- No `approve()` step required
- Direct wallet-to-wallet transfer
- 18 decimal precision (same as ETH)

**Service**: `hederaWalletService.js`

- `getHBARBalance(address)` - Fetch HBAR balance
- `executeHBARPayment(recipient, amount)` - Send HBAR payment
- `generateHederaPaymentQRData()` - Create EIP-681 payment QR code

## Agent Pricing in HBAR

Based on current HBAR price (~$0.05-0.10 USD):

| Agent Tier    | HBAR Amount | USD Equivalent |
| ------------- | ----------- | -------------- |
| Small Agent   | 5 HBAR      | ~$0.25-0.50    |
| Medium Agent  | 10 HBAR     | ~$0.50-1.00    |
| Large Agent   | 20 HBAR     | ~$1.00-2.00    |
| Premium Agent | 50 HBAR     | ~$2.50-5.00    |

## Getting Testnet HBAR

### Option 1: Hedera Portal Faucet (Recommended)

1. Visit: https://portal.hedera.com/faucet
2. Connect your wallet or paste address
3. Receive 10,000 testnet HBAR (free)
4. Faucet resets daily

### Option 2: Hedera Discord

1. Join: https://hedera.com/discord
2. Go to #testnet-faucet channel
3. Request HBAR with your wallet address

## Configuration Files

### Network Detection

**File**: `src/services/networkDetectionService.js`

```javascript
HEDERA_TESTNET: {
  chainId: 296,
  name: "Hedera Testnet",
  shortName: "Hedera",
  rpcUrl: "https://testnet.hashio.io/api",
  nativeCurrency: "HBAR",
  currency: "HBAR",
  blockExplorer: "https://hashscan.io/testnet",
  icon: "/icons/hedera.svg",
  color: "#00D4AA",
  isSupported: true,
}
```

### Payment Engine

**File**: `src/components/CubePaymentEngine.jsx`

```javascript
supportedNetworks = {
  296: { name: "Hedera Testnet", color: "#00D4AA", symbol: "HBAR" },
};
```

### EVM Network Service

**File**: `src/services/evmNetworkService.js`

```javascript
296: {
  name: "Hedera Testnet",
  usdc_contract: "0x0000000000000000000000000000000000068c0A", // Reference only
  rpc_url: "testnet.hashio.io/api",
  currency_symbol: "HBAR", // Native currency used for payments
}
```

## Code Examples

### Sending HBAR Payment

```javascript
import { hederaWalletService } from "./services/hederaWalletService";

// Send 10 HBAR to agent deployer
const txHash = await hederaWalletService.executeHBARPayment(
  agentDeployerAddress,
  10 // HBAR amount
);

console.log("Payment successful:", txHash);
```

### Checking HBAR Balance

```javascript
const balance = await hederaWalletService.getHBARBalance(userAddress);
console.log(`Balance: ${balance.toFixed(4)} HBAR`);
```

### Generating Payment QR Code

```javascript
const paymentData = await hederaWalletService.generateHederaAgentPayment(
  agent,
  10 // HBAR amount
);

const qrData = hederaWalletService.generateHederaPaymentQRData(paymentData);
// Returns: ethereum:0x...?value=10000000000000000000&chainId=0x128
```

## Network Information

- **Chain ID**: 296 (0x128 in hex)
- **Network Name**: Hedera Testnet
- **RPC URL**: https://testnet.hashio.io/api
- **Currency Symbol**: HBAR
- **Currency Decimals**: 18
- **Block Explorer**: https://hashscan.io/testnet
- **Faucet**: https://portal.hedera.com/faucet

## Future Plans

### Phase 1: HBAR Payments (Current)

- ✅ Native HBAR transfers
- ✅ MetaMask integration
- ✅ QR code payments
- ✅ Balance display

### Phase 2: Custom Token (Planned)

- Create AgentSphere token on Hedera Token Service (HTS)
- Deploy "AGSP" fungible token
- Use for premium agents and features
- Airdrop to early users

### Phase 3: Mainnet Migration

- Deploy to Hedera Mainnet
- Use real HBAR for payments
- Integrate USDC when available
- Add fiat on/off ramp

## Testing Checklist

- [ ] Get testnet HBAR from faucet
- [ ] Connect MetaMask to Hedera Testnet (Chain ID 296)
- [ ] Verify network shows as "Hedera" with green badge
- [ ] Check HBAR balance displays correctly
- [ ] Deploy test agent on Hedera network
- [ ] Make payment in HBAR
- [ ] Verify transaction on HashScan explorer
- [ ] Confirm agent unlocks after payment

## Resources

- Hedera Docs: https://docs.hedera.com/
- Hedera SDK: https://github.com/hashgraph/hedera-sdk-js
- Hedera Portal: https://portal.hedera.com/
- HashScan Explorer: https://hashscan.io/testnet
- Hedera Discord: https://hedera.com/discord
- Faucet: https://portal.hedera.com/faucet

## Support

For issues or questions:

1. Check Hedera docs: https://docs.hedera.com/
2. Ask in Discord: https://hedera.com/discord
3. Check HashScan for transaction status: https://hashscan.io/testnet
4. Verify RPC connectivity: https://testnet.hashio.io/api

---

**Last Updated**: October 31, 2025
**Status**: Active Development
**Network**: Hedera Testnet
**Payment Method**: HBAR (Native Currency)
