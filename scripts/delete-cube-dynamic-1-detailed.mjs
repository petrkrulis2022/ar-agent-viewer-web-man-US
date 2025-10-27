import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log("❌ Supabase environment variables not found");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Target agent details
const TARGET_AGENT_ID = "f911cc7d-244c-4916-9612-71b3904e9424";
const TARGET_AGENT_NAME = "Cube Dynamic 1";

console.log("🗑️  Attempting to delete Cube Dynamic 1 agent...");
console.log(`Target ID: ${TARGET_AGENT_ID}`);
console.log("");

try {
  // Attempt deletion with detailed response
  const { data, error, status, statusText } = await supabase
    .from("deployed_objects")
    .delete()
    .eq("id", TARGET_AGENT_ID)
    .select();

  console.log("Response details:");
  console.log(`Status: ${status} ${statusText}`);
  console.log(`Error:`, error);
  console.log(`Data:`, data);

  if (error) {
    console.log("❌ Deletion failed:", error.message);
    console.log("Full error:", JSON.stringify(error, null, 2));
  } else {
    console.log("✅ Deletion command executed");
    if (data && data.length > 0) {
      console.log(`✅ Deleted agent: ${data[0].name}`);
    } else {
      console.log("⚠️  No data returned from deletion");
    }
  }
} catch (err) {
  console.log("❌ Unexpected error:", err.message);
  console.log("Full error:", err);
}
