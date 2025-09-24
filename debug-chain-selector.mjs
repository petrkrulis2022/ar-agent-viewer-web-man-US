// Debug script to trace the chain selector issue
import ccipConfigService from "./src/services/ccipConfigService.js";
import ccipConfigRaw from "./src/config/ccip-config.json" assert { type: "json" };

console.log("🔍 DEBUGGING CHAIN SELECTOR ISSUE");
console.log("=".repeat(50));

// Check raw config file first
console.log("\n📄 RAW CONFIG FILE:");
console.log(
  "OPSepolia config:",
  JSON.stringify(ccipConfigRaw.OPSepolia, null, 2)
);
console.log(
  "OPSepolia chainSelector type:",
  typeof ccipConfigRaw.OPSepolia.chainSelector
);
console.log(
  "OPSepolia chainSelector value:",
  ccipConfigRaw.OPSepolia.chainSelector
);

// Wait for service initialization
console.log("\n⏳ Waiting for CCIP service initialization...");
await new Promise((resolve) => setTimeout(resolve, 100));

// Check service configuration
console.log("\n🔧 CCIP SERVICE CONFIG:");
const destConfig = ccipConfigService.getNetworkConfig("11155420");
console.log("getNetworkConfig(11155420):", JSON.stringify(destConfig, null, 2));

if (destConfig) {
  console.log("\n🎯 CHAIN SELECTOR ANALYSIS:");
  console.log("destConfig.chainSelector:", destConfig.chainSelector);
  console.log("Type:", typeof destConfig.chainSelector);
  console.log("String value:", String(destConfig.chainSelector));
  console.log('Equals "OPSepolia"?:', destConfig.chainSelector === "OPSepolia");
  console.log(
    "Equals chainName?:",
    destConfig.chainSelector === destConfig.chainName
  );
  console.log(
    'Expected value "5224473277236331295"?:',
    String(destConfig.chainSelector) === "5224473277236331295"
  );

  // Test BigInt conversion
  try {
    const bigIntValue = BigInt(destConfig.chainSelector);
    const hexValue = bigIntValue.toString(16);
    console.log("\n🔢 NUMERIC CONVERSIONS:");
    console.log("As BigInt:", bigIntValue.toString());
    console.log("As Hex:", "0x" + hexValue);
    console.log("Expected OP Sepolia hex: 0x486af0e97ee6da06");
    console.log("Hex matches expected?:", hexValue === "486af0e97ee6da06");
  } catch (e) {
    console.log("\n❌ BIGINT CONVERSION ERROR:", e.message);
    console.log("This suggests chainSelector is not a valid numeric string");
  }
} else {
  console.log("❌ No config found for chain ID 11155420");
}

// Test the buildCCIPTransaction to see what happens
console.log("\n🔧 TESTING buildCCIPTransaction...");
try {
  const result = await ccipConfigService.buildCCIPTransaction(
    "84532", // Base Sepolia
    "11155420", // OP Sepolia
    "1", // 1 USDC
    "0x742C4F331DD7c75e98b8C4b88EC73E6bC9312c9E", // Test recipient
    "native"
  );

  if (result.success) {
    console.log("✅ Transaction built successfully");
    console.log("Debug info chainSelector:", result.debugInfo?.chainSelector);
    console.log("Debug info type:", typeof result.debugInfo?.chainSelector);
  } else {
    console.log("❌ Transaction build failed:", result.error);
  }
} catch (error) {
  console.log("❌ Exception in buildCCIPTransaction:", error.message);
}

console.log("\n" + "=".repeat(50));
console.log("🏁 DEBUG COMPLETE");
