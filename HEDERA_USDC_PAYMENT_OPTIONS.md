# Hedera Testnet USDC Payment Options

## Problem

USDC contract on Hedera Testnet: `0x0000000000000000000000000000000000068c0A`

- No public faucet available for testnet USDC
- Cannot obtain USDC tokens for testing agent payments

## Solutions

### Option 1: Use HBAR for Agent Payments (RECOMMENDED)

Since HBAR has a public faucet and USDC doesn't, use native HBAR for agent payments on Hedera Testnet.

**Steps:**

1. Get testnet HBAR from faucet: https://portal.hedera.com/faucet
2. Update payment logic to accept HBAR instead of USDC on Hedera
3. Agent payments will be in HBAR (e.g., 1 HBAR = $0.05-0.10 USD equivalent)

**Pricing suggestion:**

- Small agent: 5 HBAR (~$0.25-0.50)
- Medium agent: 10 HBAR (~$0.50-1.00)
- Large agent: 20 HBAR (~$1.00-2.00)

### Option 2: Create Your Own Test Token

Use Hedera SDK to create a fungible token that mimics USDC for testing:

```javascript
// Create a test USDC-like token on Hedera Testnet
const { TokenCreateTransaction, TokenType } = require("@hashgraph/sdk");

const transaction = await new TokenCreateTransaction()
  .setTokenName("Test USDC")
  .setTokenSymbol("TUSDC")
  .setDecimals(6) // USDC uses 6 decimals
  .setInitialSupply(1000000) // 1,000,000 TUSDC
  .setTreasuryAccountId(yourAccountId)
  .setAdminKey(yourAdminKey)
  .setSupplyKey(yourSupplyKey)
  .setTokenType(TokenType.FungibleCommon)
  .execute(client);
```

**Then:**

1. Deploy your test token
2. Update `usdc_contract` to your token address
3. Mint tokens to your wallet for testing

### Option 3: Contact Hedera for Testnet USDC

Reach out to Hedera team:

- Discord: https://hedera.com/discord
- Support: https://help.hedera.com/
- Request testnet USDC faucet or tokens

### Option 4: Use Hedera Token Service (HTS) Native USDC

If the address `0x0000000000000000000000000000000000068c0A` is a Hedera Token Service (HTS) token:

1. **Associate the token** with your account first:

```javascript
const transaction = await new TokenAssociateTransaction()
  .setAccountId(yourAccountId)
  .setTokenIds([tokenId])
  .execute(client);
```

2. **Check if there's an airdrop program** or request tokens from the token treasury

## Current Configuration

Updated `evmNetworkService.js`:

```javascript
296: {
  name: "Hedera Testnet",
  usdc_contract: "0x0000000000000000000000000000000000068c0A",
  rpc_url: "testnet.hashio.io/api",
  currency_symbol: "HBAR",
}
```

## Recommended Approach for Development

**Use HBAR for now:**

1. ✅ HBAR has public faucet (free testnet tokens)
2. ✅ No token association needed
3. ✅ Native to Hedera - fastest transactions
4. ✅ Can easily test payments immediately

**Switch to USDC later when:**

- You get access to testnet USDC tokens
- You deploy to mainnet (where USDC is available)
- You create your own test token

## Implementation Changes Needed

To use HBAR instead of USDC for Hedera payments:

1. **Update `CubePaymentEngine.jsx`:**

   - Detect Hedera network (Chain ID 296)
   - Use native HBAR transfer instead of ERC20 token transfer
   - No need to call `approve()` or `transferFrom()`

2. **Payment flow:**
   - Generate payment request with HBAR amount
   - Use `eth_sendTransaction` for native transfer
   - No smart contract interaction needed

## Resources

- Hedera Faucet: https://portal.hedera.com/faucet
- Hedera Token Service Docs: https://docs.hedera.com/hedera/sdks-and-apis/sdks/token-service
- Hedera SDK Examples: https://github.com/hashgraph/hedera-sdk-js/tree/main/examples
- Hedera Explorer: https://hashscan.io/testnet

## Next Steps

1. Use HBAR faucet to get testnet tokens
2. Test agent payments with HBAR
3. Update pricing in HBAR (not USD)
4. Later: migrate to USDC when available on mainnet
