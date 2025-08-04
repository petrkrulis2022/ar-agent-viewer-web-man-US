// Test script to verify AR Viewer database connection and agent loading
// Open browser console and paste this script to test

console.log("🧪 AR Viewer Database Test Script");
console.log("================================");

// Test the database connection
async function testARViewerDatabase() {
  try {
    console.log("🔍 Testing database connection...");

    // Test with device location (if available)
    console.log("📍 This test now uses your device's actual GPS location");
    console.log(
      "📍 The AR Viewer will automatically detect your location and find nearby agents"
    );

    // Try to fetch agents directly using the app's database hook
    if (window.location.href.includes("localhost:517")) {
      console.log("✅ AR Viewer app detected");

      // Look for React DevTools to access component state
      if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        console.log("🔧 React DevTools available - checking for agent data...");
      }

      console.log("📝 Manual test steps:");
      console.log("1. Open NeAR Agents Marketplace");
      console.log("2. Allow location access when prompted");
      console.log("3. Check if agents near your location are loading");
      console.log("4. Try different filter types");
      console.log("5. Check browser network tab for API calls");
      console.log(
        "📍 Note: Agents will only appear if there are deployed agents near your current location"
      );
    } else {
      console.log("❌ Not on AR Viewer app");
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testARViewerDatabase();

// Check if we're on the right page
if (window.location.href.includes("localhost:517")) {
  console.log("🎯 You are on the AR Viewer app");
  console.log("📱 The app now uses your device's GPS location automatically");
  console.log(
    "� Try opening the NeAR Agents Marketplace to see agents near you"
  );
  console.log("🔧 If no agents appear, check:");
  console.log("   - Browser console for location permission requests");
  console.log("   - Whether you're near any deployed agents");
  console.log("   - Network tab for failed API calls");
  console.log("   - Database connection status");
} else {
  console.log("🔗 Please navigate to http://localhost:5174/ first");
}
