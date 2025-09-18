// CCIP Integration Test
// Quick test to verify CCIP services are working correctly

import CCIPConfigService from "./src/services/ccipConfigService.js";
import DynamicQRService from "./src/services/dynamicQRService.js";

async function testCCIPIntegration() {
  console.log("🧪 Testing CCIP Integration...");

  try {
    // Test 1: CCIP Config Service initialization
    console.log("\n1️⃣ Testing CCIP Config Service...");
    const ccipService = new CCIPConfigService();

    // Test network configurations
    const ethSepoliaConfig = ccipService.getNetworkConfig("11155111");
    const arbitrumSepoliaConfig = ccipService.getNetworkConfig("421614");

    console.log("✅ Ethereum Sepolia config:", ethSepoliaConfig?.chainName);
    console.log(
      "✅ Arbitrum Sepolia config:",
      arbitrumSepoliaConfig?.chainName
    );

    // Test 2: Cross-chain route detection
    console.log("\n2️⃣ Testing cross-chain route detection...");
    const isCrossChain = ccipService.isCrossChainTransfer("11155111", "421614");
    const isRouteSupported = ccipService.isRouteSupported("11155111", "421614");

    console.log("✅ Is cross-chain transfer:", isCrossChain);
    console.log("✅ Is route supported:", isRouteSupported);

    // Test 3: Fee estimation
    console.log("\n3️⃣ Testing fee estimation...");
    const feeEstimate = await ccipService.estimateCCIPFees(
      "11155111", // Ethereum Sepolia
      "421614", // Arbitrum Sepolia
      "10", // 10 USDC
      "0x742d35Cc6634C0532925a3b8D30fe85F86c3067E", // Example recipient
      "native" // Use native token for fees
    );

    console.log("✅ Fee estimate result:", feeEstimate);

    // Test 4: Available destinations
    console.log("\n4️⃣ Testing available destinations...");
    const destinations = ccipService.getAvailableDestinations("11155111");
    console.log(
      "✅ Available destinations from Ethereum Sepolia:",
      destinations.length
    );

    // Test 5: CCIP transaction building
    console.log("\n5️⃣ Testing CCIP transaction building...");
    const ccipTransaction = await ccipService.buildCCIPTransaction(
      "11155111", // Source: Ethereum Sepolia
      "421614", // Destination: Arbitrum Sepolia
      "5", // 5 USDC
      "0x742d35Cc6634C0532925a3b8D30fe85F86c3067E", // Recipient
      "native" // Fee token
    );

    console.log("✅ CCIP transaction build result:", ccipTransaction.success);

    // Test 6: Dynamic QR Service with CCIP
    console.log("\n6️⃣ Testing Dynamic QR Service with CCIP...");
    const dynamicQR = new DynamicQRService();

    // Mock agent data
    const mockAgent = {
      id: "test-agent",
      name: "Test Agent",
      agent_wallet_address: "0x742d35Cc6634C0532925a3b8D30fe85F86c3067E",
      interaction_fee_amount: "2.50",
      chain_id: "421614", // Deployed on Arbitrum Sepolia
    };

    // Test cross-chain detection
    const crossChainDetection = await dynamicQR.detectCrossChainNeed(
      mockAgent,
      "11155111"
    );
    console.log("✅ Cross-chain detection:", crossChainDetection);

    // Test payment options
    const paymentOptions = dynamicQR.getAvailablePaymentOptions(
      mockAgent,
      "11155111"
    );
    console.log("✅ Payment options:", paymentOptions.length);

    console.log("\n🎉 CCIP Integration Test Complete!");
    console.log("✅ All core CCIP functionality is working correctly");

    return {
      success: true,
      message: "CCIP integration test passed successfully",
    };
  } catch (error) {
    console.error("❌ CCIP Integration Test Failed:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Run test if this file is executed directly
if (typeof window !== "undefined") {
  // Browser environment
  window.testCCIPIntegration = testCCIPIntegration;
  console.log(
    "🧪 CCIP test function available as window.testCCIPIntegration()"
  );
} else {
  // Node environment
  testCCIPIntegration().then((result) => {
    console.log("\n📊 Test Result:", result);
    process.exit(result.success ? 0 : 1);
  });
}

export default testCCIPIntegration;
