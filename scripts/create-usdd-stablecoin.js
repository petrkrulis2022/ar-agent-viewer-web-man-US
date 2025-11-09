// Create USDd Stablecoin on Hedera Testnet
// Run: node scripts/create-usdd-stablecoin.js

import { hederaStablecoinService } from "../src/services/hederaStablecoinService.js";

// ⚠️ REPLACE THESE WITH YOUR ACTUAL CREDENTIALS FROM https://portal.hedera.com/
const HEDERA_ACCOUNT_ID = "0.0.YOUR_ACCOUNT_ID"; // e.g., "0.0.123456"
const HEDERA_PRIVATE_KEY = "YOUR_PRIVATE_KEY"; // Your DER-encoded private key

async function createUSDdStablecoin() {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("🪙 HEDERA STABLECOIN CREATION WIZARD");
  console.log("═══════════════════════════════════════════════════════════\n");

  try {
    // Validate credentials
    if (HEDERA_ACCOUNT_ID === "0.0.YOUR_ACCOUNT_ID") {
      console.error(
        "❌ ERROR: Please update HEDERA_ACCOUNT_ID with your actual account ID"
      );
      console.log("\n📝 To get credentials:");
      console.log("   1. Visit: https://portal.hedera.com/");
      console.log("   2. Create a testnet account");
      console.log("   3. Copy your Account ID and Private Key");
      console.log("   4. Update this script with your credentials\n");
      process.exit(1);
    }

    if (HEDERA_PRIVATE_KEY === "YOUR_PRIVATE_KEY") {
      console.error(
        "❌ ERROR: Please update HEDERA_PRIVATE_KEY with your actual private key"
      );
      process.exit(1);
    }

    // Step 1: Initialize SDK
    console.log("📡 Step 1: Initializing Hedera Stablecoin SDK...");
    console.log(`   Account ID: ${HEDERA_ACCOUNT_ID}`);
    console.log(`   Network: Hedera Testnet (Chain ID 296)\n`);

    await hederaStablecoinService.initialize(
      HEDERA_ACCOUNT_ID,
      HEDERA_PRIVATE_KEY
    );

    console.log("✅ SDK initialized successfully!\n");

    // Step 2: Create the stablecoin
    console.log("🏗️  Step 2: Creating USDd stablecoin...");
    console.log("   This will:");
    console.log("   • Create a new ERC-20 token on Hedera");
    console.log("   • Set decimals to 6 (stablecoin standard)");
    console.log("   • Mint initial supply of 1,000,000 USDd");
    console.log("   • Set max supply to 100,000,000 USDd");
    console.log("   • Generate EVM-compatible address\n");
    console.log("   ⏳ This may take 10-30 seconds...\n");

    const result = await hederaStablecoinService.createStablecoin({
      name: "USD Digital",
      symbol: "USDd",
      initialSupply: "1000000", // 1 million tokens
      maxSupply: "100000000", // 100 million max
    });

    if (result.success) {
      console.log(
        "═══════════════════════════════════════════════════════════"
      );
      console.log("✅ SUCCESS! STABLECOIN CREATED");
      console.log(
        "═══════════════════════════════════════════════════════════\n"
      );

      console.log("📋 Token Details:");
      console.log(
        "┌─────────────────────────────────────────────────────────────┐"
      );
      console.log(`│ Name:             ${result.name.padEnd(40)} │`);
      console.log(`│ Symbol:           ${result.symbol.padEnd(40)} │`);
      console.log(
        `│ Decimals:         ${result.decimals.toString().padEnd(40)} │`
      );
      console.log(`│ Network:          ${result.network.padEnd(40)} │`);
      console.log(
        `│ Chain ID:         ${result.chainId.toString().padEnd(40)} │`
      );
      console.log(
        "├─────────────────────────────────────────────────────────────┤"
      );
      console.log(`│ Hedera Token ID:  ${result.tokenId.padEnd(40)} │`);
      console.log(`│ EVM Address:      ${result.evmAddress.padEnd(40)} │`);
      console.log(
        "├─────────────────────────────────────────────────────────────┤"
      );
      console.log(`│ Initial Supply:   ${result.initialSupply.padEnd(40)} │`);
      console.log(`│ Max Supply:       ${result.maxSupply.padEnd(40)} │`);
      console.log(
        "└─────────────────────────────────────────────────────────────┘\n"
      );

      console.log("🔗 View on HashScan:");
      console.log(`   ${result.explorer}\n`);

      console.log(
        "═══════════════════════════════════════════════════════════"
      );
      console.log("🎯 NEXT STEPS");
      console.log(
        "═══════════════════════════════════════════════════════════\n"
      );

      console.log("1️⃣  Add token to MetaMask:");
      console.log(`   • Network: Hedera Testnet (296)`);
      console.log(`   • Token Address: ${result.evmAddress}`);
      console.log(`   • Symbol: ${result.symbol}`);
      console.log(`   • Decimals: ${result.decimals}\n`);

      console.log("2️⃣  Update AgentSphere agent config:");
      console.log(`   {`);
      console.log(`     "deployment_chain_id": 296,`);
      console.log(`     "deployment_network_name": "Hedera Testnet",`);
      console.log(`     "deployment_token_symbol": "${result.symbol}",`);
      console.log(
        `     "deployment_token_contract_address": "${result.evmAddress}",`
      );
      console.log(`     "interaction_fee_token": "${result.symbol}"`);
      console.log(`   }\n`);

      console.log(
        "3️⃣  The ccip-config-consolidated.json is already updated!\n"
      );

      console.log("4️⃣  Test payment flow:");
      console.log(`   • Connect MetaMask to Hedera Testnet`);
      console.log(`   • Navigate to your Hedera agent in AR viewer`);
      console.log(`   • Click "Crypto QR" payment button`);
      console.log(`   • Verify QR generates with ${result.symbol} payment\n`);

      console.log(
        "═══════════════════════════════════════════════════════════"
      );
      console.log("✅ STABLECOIN READY FOR AGENTSPHERE PAYMENTS!");
      console.log(
        "═══════════════════════════════════════════════════════════\n"
      );

      // Save to file for reference
      const fs = await import("fs");
      const output = {
        createdAt: new Date().toISOString(),
        account: HEDERA_ACCOUNT_ID,
        token: result,
      };

      fs.writeFileSync(
        "stablecoin-details.json",
        JSON.stringify(output, null, 2)
      );

      console.log("💾 Token details saved to: stablecoin-details.json\n");
    } else {
      console.error(
        "═══════════════════════════════════════════════════════════"
      );
      console.error("❌ FAILED TO CREATE STABLECOIN");
      console.error(
        "═══════════════════════════════════════════════════════════\n"
      );
      console.error("Error:", result.error);
      console.error("\n💡 Troubleshooting:");
      console.error("   • Verify your account has HBAR balance");
      console.error("   • Check credentials are correct");
      console.error("   • Try again in a few minutes");
      console.error(
        "   • Get testnet HBAR: https://portal.hedera.com/faucet\n"
      );
    }
  } catch (error) {
    console.error(
      "═══════════════════════════════════════════════════════════"
    );
    console.error("❌ ERROR OCCURRED");
    console.error(
      "═══════════════════════════════════════════════════════════\n"
    );
    console.error("Error message:", error.message);
    console.error("\nFull error:", error);
    console.error("\n💡 Common issues:");
    console.error("   • Insufficient HBAR balance");
    console.error("   • Invalid credentials");
    console.error("   • Network connection issues");
    console.error("   • SDK initialization failed\n");
    process.exit(1);
  }
}

// Run the wizard
createUSDdStablecoin().catch(console.error);
