import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ncjbwzibnqrbrvicdmec.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jamJ3emlibnFyYnJ2aWNkbWVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NzMzMDAsImV4cCI6MjA3NzA0OTMwMH0.OBxPLTZYpm6J59HFcn6VvXHlDt3r_HXMQEFCYKNR110";

const WALLET_ADDRESS = "0x6ef27E391c7eac228c26300aA92187382cc7fF8a";

console.log("🔍 COMPREHENSIVE WALLET AGENT ANALYSIS");
console.log("=".repeat(70));
console.log(`Wallet: ${WALLET_ADDRESS}\n`);

async function analyzeWalletAgents() {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });

    // Get all agents for this wallet
    console.log("📊 Fetching all agents...\n");

    const { data: agents, error } = await supabase
      .from("deployed_objects")
      .select("*")
      .ilike("agent_wallet_address", WALLET_ADDRESS)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Database error:", error.message);
      console.error("   Details:", error);
      return;
    }

    if (!agents || agents.length === 0) {
      console.log("⚠️  No agents found for this wallet");
      return;
    }

    console.log(`✅ Found ${agents.length} agent(s)\n`);
    console.log("=".repeat(70));

    // Analyze agent types
    const typeMap = {};
    const paymentTerminals = [];

    agents.forEach((agent, index) => {
      const type = agent.agent_type || agent.object_type || "null";
      typeMap[type] = (typeMap[type] || 0) + 1;

      // Check if it's a payment terminal by name
      const isPaymentTerminalByName = agent.name
        ?.toLowerCase()
        .includes("payment terminal");
      if (isPaymentTerminalByName) {
        paymentTerminals.push(agent);
      }

      console.log(`\n${index + 1}. ${agent.name || "Unnamed Agent"}`);
      console.log(`   ${"─".repeat(65)}`);
      console.log(`   📦 ID: ${agent.id}`);
      console.log(`   🏷️  Type (agent_type): ${agent.agent_type || "null"}`);
      console.log(`   🏷️  Type (object_type): ${agent.object_type || "null"}`);
      console.log(
        `   💳 Payment Terminal: ${
          isPaymentTerminalByName ? "YES (by name)" : "NO"
        }`
      );
      console.log(`   🔗 Network: ${agent.network || "N/A"}`);
      console.log(`   📍 Status: ${agent.status || "N/A"}`);
      console.log(
        `   📅 Created: ${new Date(agent.created_at).toLocaleString()}`
      );
      console.log(
        `   🌍 Location: ${
          agent.latitude ? `${agent.latitude}, ${agent.longitude}` : "Not set"
        }`
      );

      // Show QR code ID if available
      if (agent.qr_code_id) {
        console.log(`   💰 QR Code ID: ${agent.qr_code_id}`);
      }
    });

    console.log("\n" + "=".repeat(70));
    console.log("📊 SUMMARY");
    console.log("=".repeat(70));
    console.log(`\n🔢 Total Agents: ${agents.length}`);
    console.log(`\n📦 Agents by Type:`);
    Object.entries(typeMap).forEach(([type, count]) => {
      console.log(`   - ${type}: ${count}`);
    });

    console.log(`\n💳 Payment Terminals (identified by name):`);
    console.log(`   Count: ${paymentTerminals.length}`);
    if (paymentTerminals.length > 0) {
      paymentTerminals.forEach((pt, idx) => {
        console.log(`   ${idx + 1}. ${pt.name}`);
      });
    }

    console.log(`\n🔴 ISSUE IDENTIFIED:`);
    console.log(`   All agents have agent_type = null`);
    console.log(
      `   The AR Viewer filter uses: agent_type === "payment terminal"`
    );
    console.log(
      `   This means the filter won't work with current database state`
    );

    console.log(`\n💡 HOW THE FILTER CURRENTLY WORKS:`);
    console.log(`   The AR Viewer code at line 407 does:`);
    console.log(`   \`\`\``);
    console.log(
      `   const agentType = (agent.agent_type || agent.object_type || "")`
    );
    console.log(`     .toLowerCase()`);
    console.log(`     .replace(/_/g, " ");`);
    console.log(`   \`\`\``);
    console.log(`   Since agent_type and object_type are both null,`);
    console.log(`   agentType becomes "" (empty string)`);
    console.log(`   The filter checks: agentType === "payment terminal"`);
    console.log(`   This will never match when agentType is ""`);

    console.log(`\n✅ WORKING FILTERS:`);
    console.log(
      `   - "My agents" works: filters by agent_wallet_address matching user wallet`
    );
    console.log(
      `   - "All agents" works: shows all agents without type filtering`
    );
    console.log(
      `   - "My Payment Terminals" doesn't work: requires agent_type to be set`
    );
  } catch (error) {
    console.error("❌ Exception:", error.message);
    console.error(error);
  }
}

analyzeWalletAgents();
