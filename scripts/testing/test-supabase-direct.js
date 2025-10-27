// Direct Supabase Test Script
import { createClient } from "@supabase/supabase-js";

console.log("🔬 DIRECT SUPABASE TEST STARTING...");

// Test environment variables
console.log("🔍 Environment variables:");
console.log("- VITE_SUPABASE_URL:", import.meta.env.VITE_SUPABASE_URL);
console.log(
  "- VITE_SUPABASE_ANON_KEY length:",
  import.meta.env.VITE_SUPABASE_ANON_KEY?.length
);

// Supabase configuration - using environment variables for web
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://ncjbwzibnqrbrvicdmec.supabase.co";
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jamJ3emlibnFyYnJ2aWNkbWVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NzMzMDAsImV4cCI6MjA3NzA0OTMwMH0.OBxPLTZYpm6J59HFcn6VvXHlDt3r_HXMQEFCYKNR110";

console.log("🔍 Final configuration:");
console.log("- SUPABASE_URL:", SUPABASE_URL);
console.log("- SUPABASE_ANON_KEY length:", SUPABASE_ANON_KEY.length);

// Check if we have valid Supabase credentials
const hasValidCredentials =
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  SUPABASE_URL !== "your_supabase_project_url_here" &&
  SUPABASE_ANON_KEY !== "your_supabase_anon_key_here" &&
  SUPABASE_URL.startsWith("https://");

console.log("🔍 Credential validation:", hasValidCredentials);

// Create Supabase client
const supabase = hasValidCredentials
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

console.log("🔍 Supabase client created:", !!supabase);

// Test connection
async function testDirectConnection() {
  try {
    console.log("🔗 Testing direct connection...");

    if (!supabase) {
      console.error("❌ No supabase client");
      return;
    }

    const { data, error } = await supabase
      .from("deployed_objects")
      .select(
        "id, name, interaction_fee_amount, deployment_network_name, deployment_chain_id"
      )
      .limit(3);

    if (error) {
      console.error("❌ Direct query failed:", error);
      console.error("Error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
    } else {
      console.log("✅ Direct query successful!");
      console.log("📊 Sample data:", data);

      if (data && data.length > 0) {
        console.log("🔍 First agent payment fields:");
        const first = data[0];
        console.log("- interaction_fee_amount:", first.interaction_fee_amount);
        console.log(
          "- deployment_network_name:",
          first.deployment_network_name
        );
        console.log("- deployment_chain_id:", first.deployment_chain_id);
      }
    }
  } catch (error) {
    console.error("💥 Direct test failed:", error);
  }
}

// Run test
testDirectConnection();

// Export for use in browser console
window.testDirectSupabase = testDirectConnection;
window.supabaseClient = supabase;

console.log(
  "🔬 Direct test script loaded. Run window.testDirectSupabase() in console for manual test."
);
