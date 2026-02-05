/**
 * Check Virtual Terminal Agents in Database
 *
 * This script verifies the actual agent_type values stored in the database
 * for Virtual Terminal (ARTM) agents.
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkVirtualTerminalAgents() {
  console.log("🔍 Checking Virtual Terminal agents in database...\n");

  try {
    // Query all agents with relevant fields
    const { data: allAgents, error: allError } = await supabase
      .from("deployed_objects")
      .select(
        "id, name, agent_type, object_type, bank_integrations, exchange_integrations",
      )
      .order("created_at", { ascending: false });

    if (allError) throw allError;

    console.log(`📊 Total agents in database: ${allAgents.length}\n`);

    // Find agents with "Virtual Terminal" or related terms
    const virtualTerminalAgents = allAgents.filter((agent) => {
      const agentType = (agent.agent_type || "").toLowerCase();
      const objectType = (agent.object_type || "").toLowerCase();
      const name = (agent.name || "").toLowerCase();

      return (
        agentType.includes("virtual") ||
        agentType.includes("terminal") ||
        agentType.includes("artm") ||
        agentType.includes("atm") ||
        objectType.includes("virtual") ||
        objectType.includes("terminal") ||
        name.includes("artm") ||
        name.includes("atm")
      );
    });

    console.log(
      `🏧 Found ${virtualTerminalAgents.length} Virtual Terminal/ARTM agents:\n`,
    );

    virtualTerminalAgents.forEach((agent, index) => {
      console.log(`${index + 1}. ${agent.name}`);
      console.log(`   ID: ${agent.id}`);
      console.log(`   agent_type: "${agent.agent_type}"`);
      console.log(`   object_type: "${agent.object_type}"`);
      console.log(
        `   bank_integrations: ${JSON.stringify(agent.bank_integrations)}`,
      );
      console.log(
        `   exchange_integrations: ${JSON.stringify(
          agent.exchange_integrations,
        )}`,
      );
      console.log("");
    });

    // Show all unique agent_type values in database
    const uniqueTypes = [
      ...new Set(allAgents.map((a) => a.agent_type).filter(Boolean)),
    ];
    console.log("\n📋 All unique agent_type values in database:");
    uniqueTypes.sort().forEach((type) => {
      console.log(`   - "${type}"`);
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

checkVirtualTerminalAgents();
