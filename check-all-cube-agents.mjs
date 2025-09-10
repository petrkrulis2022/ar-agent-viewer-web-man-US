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

console.log(
  "🔍 Searching for all agents with 'Cube' in name (comprehensive)..."
);

try {
  const { data, error } = await supabase
    .from("deployed_objects")
    .select("*")
    .ilike("name", "%Cube%");

  if (error) {
    console.log("❌ Database error:", error.message);
  } else {
    console.log(`✅ Found ${data.length} agent(s) with "Cube" in name:`);
    data.forEach((agent, index) => {
      console.log(`\n=== Agent ${index + 1} ===`);
      console.log(`ID: ${agent.id}`);
      console.log(`Name: ${agent.name}`);
      console.log(`Network: ${agent.network}`);
      console.log(`Chain ID: ${agent.chain_id}`);

      // All fee-related fields
      console.log(`\n--- Fee Fields ---`);
      console.log(`interaction_fee_amount: ${agent.interaction_fee_amount}`);
      console.log(`interaction_fee_usdfc: ${agent.interaction_fee_usdfc}`);
      console.log(`interaction_fee: ${agent.interaction_fee}`);
      console.log(`interaction_fee_token: ${agent.interaction_fee_token}`);

      // Check for any other fields that might contain fee/price/cost
      const allKeys = Object.keys(agent);
      const feeRelatedKeys = allKeys.filter(
        (key) =>
          key.toLowerCase().includes("fee") ||
          key.toLowerCase().includes("price") ||
          key.toLowerCase().includes("cost") ||
          key.toLowerCase().includes("amount") ||
          key.toLowerCase().includes("usdc") ||
          key.toLowerCase().includes("usdt")
      );

      console.log(`\n--- All Fee/Price Related Fields ---`);
      feeRelatedKeys.forEach((key) => {
        console.log(`${key}: ${agent[key]}`);
      });

      // Check payment_config if it exists
      if (agent.payment_config) {
        console.log(`\n--- Payment Config ---`);
        console.log(JSON.stringify(agent.payment_config, null, 2));
      }

      console.log(`\n--- Created ---`);
      console.log(`created_at: ${agent.created_at}`);
      console.log("=====================================");
    });
  }
} catch (err) {
  console.log("❌ Error:", err.message);
}
