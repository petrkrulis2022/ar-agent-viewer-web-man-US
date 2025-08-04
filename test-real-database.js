// Database Connection Test for Real Agents
// Run this in the browser console to test database connectivity

console.log("🔍 Testing Real Database Connection...");
console.log("====================================");

async function testRealDatabase() {
  try {
    // Test if Supabase is configured
    console.log("📋 Environment Check:");
    console.log(
      "- VITE_SUPABASE_URL:",
      import.meta?.env?.VITE_SUPABASE_URL || "Not accessible from console"
    );

    // Try to access the database directly
    console.log("🔗 Testing direct Supabase connection...");

    // This should be available if the app loaded
    if (window.supabase) {
      console.log("✅ Supabase client available globally");
    } else {
      console.log("⚠️ No global Supabase client");
    }

    // Try a simple test query
    console.log("📊 Attempting test query to ar_qr_codes table...");

    // We'll need to access this through the React component
    console.log("🔧 To test real database connection:");
    console.log("1. Open browser DevTools Network tab");
    console.log("2. Refresh the NeAR Agents Marketplace");
    console.log("3. Look for API calls to Supabase");
    console.log("4. Check if any ar_qr_codes queries appear");
  } catch (error) {
    console.error("❌ Database test failed:", error);
  }
}

// Manual steps for database connection
console.log("🎯 REAL DATABASE CONNECTION STEPS:");
console.log("1. Check if Supabase environment variables are correct");
console.log("2. Verify ar_qr_codes table exists and has data");
console.log("3. Test direct database query");
console.log("4. Check network requests in DevTools");

testRealDatabase();
