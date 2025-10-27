// Test Network Detection
import { networkDetectionService } from "./src/services/networkDetectionService.js";

async function testNetworkDetection() {
  try {
    console.log("🧪 Testing network detection...");

    if (typeof window !== "undefined" && window.ethereum) {
      const network = await networkDetectionService.detectCurrentNetwork();
      console.log("✅ Detected network:", network);
      console.log("- Name:", network.name);
      console.log("- Chain ID:", network.chainId);
      console.log("- Is Supported:", network.isSupported);
      console.log("- Color:", network.color);
    } else {
      console.log("❌ MetaMask not available in this environment");
    }
  } catch (error) {
    console.error("❌ Network detection test failed:", error);
  }
}

// This will only work in browser environment
if (typeof window !== "undefined") {
  testNetworkDetection();
} else {
  console.log("📝 This test needs to be run in the browser console");
}
