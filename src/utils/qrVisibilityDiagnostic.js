/**
 * QR Code Visibility Diagnostic Test
 * Quick test to diagnose why QR codes might not be visible
 */

export const runQRVisibilityDiagnostic = () => {
  console.log("🔍 Running QR Code Visibility Diagnostic...");
  console.log("=" * 50);

  // Test 1: Check if demo agents are loaded
  const agentElements = document.querySelectorAll("[data-agent-id]");
  const agentCount = agentElements.length;
  console.log(`1. Demo Agents: ${agentCount} found`);

  // Test 2: Check AR scene canvas
  const canvasElements = document.querySelectorAll("canvas");
  const arCanvas = Array.from(canvasElements).find(
    (canvas) => canvas.parentElement?.style.background === "transparent"
  );
  console.log(`2. AR Canvas: ${arCanvas ? "✅ Found" : "❌ Missing"}`);

  // Test 3: Check ARQRCodeFixed component
  const qrContainer = document.querySelector('[class*="pointer-events-auto"]');
  console.log(`3. QR Container: ${qrContainer ? "✅ Found" : "❌ Missing"}`);

  // Test 4: Check persistent QR state
  const debugInfo = document.querySelector('[class*="bg-black/80"]');
  const debugText = debugInfo?.textContent || "";
  const hasQRInfo =
    debugText.includes("QR") || debugText.includes("persistent");
  console.log(`4. QR Debug Info: ${hasQRInfo ? "✅ Present" : "❌ Missing"}`);

  // Test 5: Check for QR generation button
  const testButton = document.querySelector('button[class*="bg-purple-600"]');
  console.log(`5. Test QR Button: ${testButton ? "✅ Found" : "❌ Missing"}`);

  // Test 6: Check Three.js rendering
  const threeCanvas = document.querySelector(
    'canvas[data-engine="three.js r169"]'
  );
  console.log(
    `6. Three.js Canvas: ${threeCanvas ? "✅ Active" : "❌ Not found"}`
  );

  console.log("\n🎯 Quick Fix Steps:");
  console.log("1. Click on spinning agent cubes to generate QR codes");
  console.log("2. Use '🧪 Generate Test QR' button for immediate testing");
  console.log("3. Check browser console for QR generation logs");
  console.log("4. Look for floating QR codes in the 3D scene");

  // Test manual QR generation
  if (window.arQRManager && testButton) {
    console.log("\n🧪 Manual QR Test Available:");
    console.log(
      "Click the purple 'Generate Test QR' button to force QR creation"
    );
  }

  console.log("=" * 50);
};

// Auto-run diagnostic on page load
if (typeof window !== "undefined") {
  window.addEventListener("load", () => {
    setTimeout(runQRVisibilityDiagnostic, 2000);
  });

  // Make available globally for manual testing
  window.runQRVisibilityDiagnostic = runQRVisibilityDiagnostic;
}

export default runQRVisibilityDiagnostic;
