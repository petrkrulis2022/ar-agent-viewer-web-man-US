import { createClient } from "@supabase/supabase-js";

// Configuration
const SUPABASE_URL = "https://ncjbwzibnqrbrvicdmec.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jamJ3emlibnFyYnJ2aWNkbWVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NzMzMDAsImV4cCI6MjA3NzA0OTMwMH0.OBxPLTZYpm6J59HFcn6VvXHlDt3r_HXMQEFCYKNR110";

const WALLET_ADDRESS = "0x6ef27E391c7eac228c26300aA92187382cc7fF8a";

console.log("🔍 Agent Types Investigation");
console.log("============================\n");

async function investigateAgentTypes() {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });

    // First, check all unique agent types in the database
    console.log("1️⃣ Checking all unique agent types...\n");
    const { data: allAgents, error: allError } = await supabase
      .from("deployed_objects")
      .select("agent_type")
      .limit(1000);

    if (allError) {
      console.error("❌ Error:", allError.message);
      return;
    }

    const uniqueTypes = [...new Set(allAgents.map((a) => a.agent_type))];
    console.log(`Found ${uniqueTypes.length} unique agent types:`);
    uniqueTypes.forEach((type) => console.log(`   - "${type}"`));

    // Now check agents for our specific wallet
    console.log(`\n2️⃣ Checking agents for wallet ${WALLET_ADDRESS}...\n`);
    const { data: walletAgents, error: walletError } = await supabase
      .from("deployed_objects")
      .select("*")
      .ilike("agent_wallet_address", WALLET_ADDRESS);

    if (walletError) {
      console.error("❌ Error:", walletError.message);
      return;
    }

    if (!walletAgents || walletAgents.length === 0) {
      console.log("⚠️  No agents found for this wallet");
      return;
    }

    console.log(`✅ Found ${walletAgents.length} agent(s) for this wallet:\n`);

    // Group by agent type
    const byType = {};
    walletAgents.forEach((agent) => {
      const type = agent.agent_type || "Unknown";
      if (!byType[type]) {
        byType[type] = [];
      }
      byType[type].push(agent);
    });

    Object.entries(byType).forEach(([type, agents]) => {
      console.log(`\n📦 ${type} (${agents.length}):`);
      agents.forEach((agent, index) => {
        console.log(`   ${index + 1}. ${agent.name || "Unnamed"}`);
        console.log(`      ID: ${agent.id}`);
        console.log(`      Network: ${agent.network || "N/A"}`);
        console.log(
          `      Created: ${new Date(agent.created_at).toLocaleString()}`
        );
      });
    });

    console.log(`\n📊 Summary by type:`);
    Object.entries(byType).forEach(([type, agents]) => {
      console.log(`   ${type}: ${agents.length}`);
    });
  } catch (error) {
    console.error("❌ Exception:", error.message);
    console.error(error);
  }
}

investigateAgentTypes();
