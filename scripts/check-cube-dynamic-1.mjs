import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log("❌ Supabase environment variables not found");
  console.log("VITE_SUPABASE_URL:", supabaseUrl ? "Set" : "Missing");
  console.log("VITE_SUPABASE_ANON_KEY:", supabaseKey ? "Set" : "Missing");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log("🔍 Searching for Cube Dynamic 1 agent...");

try {
  const { data, error } = await supabase
    .from("deployed_objects")
    .select("*")
    .ilike("name", "%Cube Dynamic 1%");

  if (error) {
    console.log("❌ Database error:", error.message);
  } else {
    console.log(`✅ Found ${data.length} agent(s):`);
    data.forEach((agent, index) => {
      console.log(`\n--- Agent ${index + 1} ---`);
      console.log(`ID: ${agent.id}`);
      console.log(`Name: ${agent.name}`);
      console.log(`Chain ID: ${agent.chain_id}`);
      console.log(`Network: ${agent.network}`);
      console.log(`interaction_fee_amount: ${agent.interaction_fee_amount}`);
      console.log(`interaction_fee_usdfc: ${agent.interaction_fee_usdfc}`);
      console.log(`interaction_fee: ${agent.interaction_fee}`);
      console.log(`interaction_fee_token: ${agent.interaction_fee_token}`);
      console.log(`Contract Address: ${agent.contract_address}`);
      console.log(`Created: ${agent.created_at}`);
      console.log("---");
    });
  }
} catch (err) {
  console.log("❌ Error:", err.message);
}
