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

// Target agent details for safety
const TARGET_AGENT_ID = "f911cc7d-244c-4916-9612-71b3904e9424";
const TARGET_AGENT_NAME = "Cube Dynamic 1";

console.log("🎯 TARGET AGENT TO DELETE:");
console.log(`ID: ${TARGET_AGENT_ID}`);
console.log(`Name: ${TARGET_AGENT_NAME}`);
console.log("");

// First, verify the agent exists and show details
console.log("🔍 Step 1: Verifying target agent exists...");

try {
  const { data: verifyData, error: verifyError } = await supabase
    .from("deployed_objects")
    .select("*")
    .eq("id", TARGET_AGENT_ID)
    .single();

  if (verifyError) {
    console.log("❌ Verification error:", verifyError.message);
    process.exit(1);
  }

  if (!verifyData) {
    console.log("❌ Agent not found with the specified ID");
    process.exit(1);
  }

  console.log("✅ Agent found:");
  console.log(`   Name: ${verifyData.name}`);
  console.log(`   Network: ${verifyData.network}`);
  console.log(
    `   Fee: ${verifyData.interaction_fee_amount} ${verifyData.interaction_fee_token}`
  );
  console.log("");

  // Safety check - confirm this is exactly "Cube Dynamic 1"
  if (verifyData.name !== TARGET_AGENT_NAME) {
    console.log("❌ SAFETY CHECK FAILED: Agent name does not match exactly");
    console.log(`   Expected: "${TARGET_AGENT_NAME}"`);
    console.log(`   Found: "${verifyData.name}"`);
    process.exit(1);
  }

  console.log("✅ Safety check passed - this is the correct agent");
  console.log("");

  // Proceed with deletion
  console.log("🗑️  Step 2: Deleting agent...");

  const { data: deleteData, error: deleteError } = await supabase
    .from("deployed_objects")
    .delete()
    .eq("id", TARGET_AGENT_ID)
    .select();

  if (deleteError) {
    console.log("❌ Deletion error:", deleteError.message);
    process.exit(1);
  }

  console.log("✅ Agent successfully deleted!");
  console.log(`   Deleted agent: ${deleteData[0].name}`);
  console.log(`   ID: ${deleteData[0].id}`);
  console.log("");

  // Final verification - confirm deletion
  console.log("🔍 Step 3: Verifying deletion...");

  const { data: checkData, error: checkError } = await supabase
    .from("deployed_objects")
    .select("*")
    .eq("id", TARGET_AGENT_ID);

  if (checkError && checkError.code !== "PGRST116") {
    // PGRST116 is "no rows found"
    console.log("❌ Verification error:", checkError.message);
  } else if (checkData && checkData.length === 0) {
    console.log("✅ Deletion confirmed - agent no longer exists in database");
  } else {
    console.log("⚠️  WARNING: Agent still exists in database");
  }
} catch (err) {
  console.log("❌ Unexpected error:", err.message);
}
