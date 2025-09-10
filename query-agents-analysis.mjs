import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://vomvmqwkobcmvhkjiqsm.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvbXZtcXdrb2JjbXZoa2ppcXNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQyNzUxMjQsImV4cCI6MjA0OTg1MTEyNH0.n4vY6jzKzWUdE6dEt_nnFqoqiKJUmOQI74bY7Xtb9tQ";

const supabase = createClient(supabaseUrl, supabaseKey);

console.log("🔍 Querying deployed_objects table for fee analysis...\n");

try {
  const { data, error } = await supabase
    .from("deployed_objects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Database error:", error);
    process.exit(1);
  }

  console.log(`✅ Found ${data.length} agents total\n`);

  // Filter only the 5 agents we care about
  const cubeAgents = data.filter(
    (agent) =>
      agent.name && (agent.name.includes("Cube") || agent.name.includes("cube"))
  );

  console.log(`🎯 Found ${cubeAgents.length} Cube-related agents:\n`);

  cubeAgents.forEach((agent, i) => {
    console.log(`📋 ${i + 1}. Agent: ${agent.name}`);
    console.log(`   ID: ${agent.id}`);
    console.log(`   Chain ID: ${agent.chain_id}`);
    console.log(`   Deployment Chain ID: ${agent.deployment_chain_id}`);
    console.log(`   Network: ${agent.network}`);
    console.log(`   Deployment Network Name: ${agent.deployment_network_name}`);
    console.log(`   Interaction Fee Amount: ${agent.interaction_fee_amount}`);
    console.log(`   Interaction Fee: ${agent.interaction_fee}`);
    console.log(`   Fee Amount: ${agent.fee_amount}`);
    console.log(`   USDC Fee: ${agent.interaction_fee_usdfc || "N/A"}`);
    console.log("   ==========================================\n");
  });

  // Now let's analyze the discrepancies
  console.log("🔍 ANALYSIS OF DISCREPANCIES:\n");

  console.log("FROM DATABASE SCREENSHOT vs LIVE DATA:");
  const expectedAgents = [
    { name: "Cube Sepolia Updated 1", expectedFee: 18 },
    { name: "Cube Sepolia 4 dev account", expectedFee: 4 },
    { name: "Cube Sepolia 3 dev account", expectedFee: 10 },
    { name: "Cube Sepolia 2", expectedFee: 7 },
    { name: "Cube Base Sepolia 1", expectedFee: 3 },
  ];

  expectedAgents.forEach((expected) => {
    const found = cubeAgents.find((agent) => agent.name === expected.name);
    if (found) {
      console.log(`✅ Found: ${expected.name}`);
      console.log(`   Expected Fee: ${expected.expectedFee} USDC`);
      console.log(
        `   Actual interaction_fee_amount: ${found.interaction_fee_amount}`
      );
      console.log(
        `   Match: ${
          found.interaction_fee_amount == expected.expectedFee ? "✅" : "❌"
        }`
      );
    } else {
      console.log(`❌ MISSING: ${expected.name}`);
    }
    console.log("");
  });
} catch (err) {
  console.error("❌ Connection error:", err);
}
