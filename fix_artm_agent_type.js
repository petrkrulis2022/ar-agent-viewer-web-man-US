/**
 * Fix ARTM Agent Type in Database
 *
 * Updates the ARTM 1 agent to have the correct agent_type and object_type values
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY; // Use service role to bypass RLS

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixARTMAgent() {
  console.log("🔧 Fixing ARTM agent type...\n");

  try {
    // Update ARTM 1 agent
    const { data, error } = await supabase
      .from("deployed_objects")
      .update({
        agent_type: "Virtual Terminal",
        object_type: "virtual_terminal",
      })
      .eq("name", "ARTM 1")
      .select();

    if (error) throw error;

    console.log("✅ Successfully updated ARTM agent:");
    console.log(JSON.stringify(data, null, 2));

    // Verify the update
    const { data: verified, error: verifyError } = await supabase
      .from("deployed_objects")
      .select(
        "id, name, agent_type, object_type, bank_integrations, exchange_integrations",
      )
      .eq("name", "ARTM 1")
      .single();

    if (verifyError) throw verifyError;

    console.log("\n✅ Verification:");
    console.log(`   Name: ${verified.name}`);
    console.log(`   agent_type: "${verified.agent_type}"`);
    console.log(`   object_type: "${verified.object_type}"`);
    console.log(
      `   bank_integrations: ${JSON.stringify(verified.bank_integrations)}`,
    );
    console.log(
      `   exchange_integrations: ${JSON.stringify(
        verified.exchange_integrations,
      )}`,
    );
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

fixARTMAgent();
