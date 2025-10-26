import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log("🔍 Testing Supabase connection...");
console.log("URL:", supabaseUrl);
console.log("Anon Key format:", supabaseAnonKey?.substring(0, 15) + "...");

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing environment variables!");
  console.log("VITE_SUPABASE_URL:", !!supabaseUrl);
  console.log("VITE_SUPABASE_ANON_KEY:", !!supabaseAnonKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log("📡 Testing basic connection...");

    // Test 1: Basic table query
    const { data, error } = await supabase
      .from("deployed_objects")
      .select("id, name, created_at")
      .eq("is_active", true)
      .limit(5);

    if (error) {
      console.error("❌ Supabase Error:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));

      if (error.message.includes("Legacy API keys are disabled")) {
        console.log("🔧 SOLUTION: Update to new API key format (sb_ prefix)");
      }
      if (
        error.message.includes("relation") &&
        error.message.includes("does not exist")
      ) {
        console.log("🔧 SOLUTION: Table 'deployed_objects' may not exist");
      }
      return;
    }

    console.log("✅ Connection successful!");
    console.log("📊 Found objects:", data?.length || 0);
    console.log("📋 Sample data:", JSON.stringify(data, null, 2));

    // Test 2: Check table structure
    console.log("\n🔍 Testing table structure...");
    const { data: tableData, error: tableError } = await supabase
      .from("deployed_objects")
      .select("*")
      .limit(1);

    if (tableError) {
      console.error("❌ Table structure error:", tableError);
    } else {
      console.log("✅ Table structure accessible");
      if (tableData && tableData.length > 0) {
        console.log("📋 Table columns:", Object.keys(tableData[0]));
      }
    }
  } catch (err) {
    console.error("💥 Connection failed:", err);
    console.error("Full error:", JSON.stringify(err, null, 2));
  }
}

testConnection();
