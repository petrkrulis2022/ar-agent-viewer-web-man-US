import { createClient } from "@supabase/supabase-js";

// Database connection using service role for full access
const supabaseUrl = "https://ncjbwzibnqrbrvicdmec.supabase.co";
const serviceRoleKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jamJ3emlibnFyYnJ2aWNkbWVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTQ3MzMwMCwiZXhwIjoyMDc3MDQ5MzAwfQ.5LiZQFdXgyMnM_HDVW5ZLTGuhF_9xOAbXEJ6yeJ_yTk";

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function listPaymentTerminals() {
  console.log("🔍 LISTING ALL PAYMENT TERMINALS (ALL VARIATIONS)...\n");
  console.log("Wallet: 0x6ef27e391c7eac228c26300aa92187382cc7ff8a\n");

  try {
    // Query for all agents with this wallet to see all object_type values
    const { data: allAgents, error: allError } = await supabase
      .from("deployed_objects")
      .select("id, name, object_type, interaction_fee, token, created_at")
      .ilike(
        "agent_wallet_address",
        "0x6ef27e391c7eac228c26300aa92187382cc7ff8a"
      )
      .order("created_at", { ascending: false });

    if (allError) {
      console.error("❌ Error:", allError);
      return;
    }

    if (!allAgents || allAgents.length === 0) {
      console.log("⚠️ No agents found for this wallet.");
      return;
    }

    console.log(`✅ Found ${allAgents.length} agent(s) total:\n`);

    // Separate payment terminals and others
    const paymentTerminals = [];
    const trailingTerminals = [];
    const others = [];

    allAgents.forEach((agent) => {
      const type = agent.object_type || "";
      if (
        type.toLowerCase().includes("payment") &&
        type.toLowerCase().includes("terminal")
      ) {
        if (type.toLowerCase().includes("trailing")) {
          trailingTerminals.push(agent);
        } else {
          paymentTerminals.push(agent);
        }
      } else {
        others.push(agent);
      }
    });

    // Display Payment Terminals
    if (paymentTerminals.length > 0) {
      console.log("═══════════════════════════════════════");
      console.log("📍 PAYMENT TERMINALS (" + paymentTerminals.length + ")");
      console.log("═══════════════════════════════════════\n");

      paymentTerminals.forEach((terminal, index) => {
        console.log(`${index + 1}. ${terminal.name}`);
        console.log(`   ID: ${terminal.id}`);
        console.log(`   Type: "${terminal.object_type}"`);
        console.log(`   Fee: ${terminal.interaction_fee || "N/A"}`);
        console.log(`   Token: ${terminal.token || "N/A"}`);
        console.log(
          `   Created: ${new Date(terminal.created_at).toLocaleString()}`
        );
        console.log("");
      });
    }

    // Display Trailing Payment Terminals
    if (trailingTerminals.length > 0) {
      console.log("═══════════════════════════════════════");
      console.log(
        "🚶 TRAILING PAYMENT TERMINALS (" + trailingTerminals.length + ")"
      );
      console.log("═══════════════════════════════════════\n");

      trailingTerminals.forEach((terminal, index) => {
        console.log(`${index + 1}. ${terminal.name}`);
        console.log(`   ID: ${terminal.id}`);
        console.log(`   Type: "${terminal.object_type}"`);
        console.log(`   Fee: ${terminal.interaction_fee || "N/A"}`);
        console.log(`   Token: ${terminal.token || "N/A"}`);
        console.log(
          `   Created: ${new Date(terminal.created_at).toLocaleString()}`
        );
        console.log("");
      });
    }

    // Display Other Agents
    if (others.length > 0) {
      console.log("═══════════════════════════════════════");
      console.log("🤖 OTHER AGENTS (" + others.length + ")");
      console.log("═══════════════════════════════════════\n");

      others.forEach((agent, index) => {
        console.log(`${index + 1}. ${agent.name}`);
        console.log(`   ID: ${agent.id}`);
        console.log(`   Type: "${agent.object_type}"`);
        console.log(`   Fee: ${agent.interaction_fee || "N/A"}`);
        console.log("");
      });
    }

    console.log("═══════════════════════════════════════");
    console.log("SUMMARY:");
    console.log(`  Payment Terminals: ${paymentTerminals.length}`);
    console.log(`  Trailing Terminals: ${trailingTerminals.length}`);
    console.log(`  Other Agents: ${others.length}`);
    console.log(`  TOTAL: ${allAgents.length}`);
    console.log("═══════════════════════════════════════");
  } catch (err) {
    console.error("❌ Exception:", err);
  }
}

listPaymentTerminals();
