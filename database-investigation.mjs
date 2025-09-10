import { createClient } from "@supabase/supabase-js";

// Database connection using service role for full access
const supabaseUrl = "https://ncjbwzibnqrbrvicdmec.supabase.co";
const serviceRoleKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jamJ3emlibnFyYnJ2aWNkbWVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDY4MDE1OSwiZXhwIjoyMDY2MjU2MTU5fQ.OimR1FKKf2kcQ1c0WO7MvuuB85wRMV6vhbH5DnC8G8E";

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function investigateDatabase() {
  console.log("🔍 DATABASE INVESTIGATION STARTING...\n");

  try {
    // 1. Get all agents that contain "Cube" in their name
    console.log("1. SEARCHING FOR ALL CUBE AGENTS...");
    const { data: allCubeAgents, error: allError } = await supabase
      .from("deployed_objects")
      .select(
        `
        id,
        name,
        network,
        deployment_network_name,
        chain_id,
        deployment_chain_id,
        interaction_fee_amount,
        interaction_fee_token,
        interaction_fee_usdfc,
        fee_data_source,
        created_at,
        updated_at
      `
      )
      .ilike("name", "%cube%")
      .order("name");

    if (allError) {
      console.error("❌ Error fetching all cube agents:", allError);
      return;
    }

    console.log(
      `✅ Found ${allCubeAgents.length} agents with "Cube" in name:\n`
    );

    allCubeAgents.forEach((agent, index) => {
      console.log(`${index + 1}. ${agent.name} (ID: ${agent.id})`);
      console.log(`   • Network: ${agent.network}`);
      console.log(
        `   • Deployment Network Name: ${agent.deployment_network_name}`
      );
      console.log(`   • Chain ID: ${agent.chain_id}`);
      console.log(`   • Deployment Chain ID: ${agent.deployment_chain_id}`);
      console.log(`   • Fee Amount: ${agent.interaction_fee_amount}`);
      console.log(`   • Fee Token: ${agent.interaction_fee_token}`);
      console.log(`   • Fee USDC: ${agent.interaction_fee_usdfc}`);
      console.log(`   • Fee Source: ${agent.fee_data_source}`);
      console.log(`   • Created: ${agent.created_at}`);
      console.log(`   • Updated: ${agent.updated_at}\n`);
    });

    // 2. Specifically search for "Cube Dynamic 1"
    console.log('2. SEARCHING SPECIFICALLY FOR "CUBE DYNAMIC 1"...');
    const { data: dynamicAgent, error: dynamicError } = await supabase
      .from("deployed_objects")
      .select("*")
      .ilike("name", "%dynamic%")
      .ilike("name", "%cube%");

    if (dynamicError) {
      console.error("❌ Error searching for Cube Dynamic:", dynamicError);
    } else {
      console.log(
        `✅ Found ${dynamicAgent.length} agents matching "Cube Dynamic":`
      );
      dynamicAgent.forEach((agent) => {
        console.log(`   • ${agent.name} (ID: ${agent.id})`);
      });
    }

    // 3. Check database constraints and indexes
    console.log("\n3. CHECKING DATABASE SCHEMA...");
    const { data: columns, error: schemaError } = await supabase.rpc(
      "get_table_columns",
      { table_name: "deployed_objects" }
    );

    if (schemaError) {
      console.log(
        "ℹ️  Could not fetch schema details (expected with service role limitations)"
      );
    }

    // 4. Get exact agents from your screenshot data
    console.log("\n4. VERIFYING AGENTS FROM SCREENSHOT...");
    const screenshotIds = [
      "1022df78-8b62-473e-a7ad-fdba0c05b4a6", // Cube Sepolia Updated 1
      "a92ed3f5-e490-4ca4-9c38-9747e666d6a6", // Cube Sepolia 4 dev account
      "b1407463-06d6-4556-a956-bac36957f767", // Cube Sepolia 3 dev account
      "120ef520-4131-40da-9d54-1df302086788", // Cube Sepolia 2
      "f0704c18-8870-425e-9b47-4f8beb7f4673", // Cube Base Sepolia 1
    ];

    for (const id of screenshotIds) {
      const { data: agent, error } = await supabase
        .from("deployed_objects")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.log(`❌ Could not find agent ${id}:`, error.message);
      } else {
        console.log(`✅ Found: ${agent.name}`);
        console.log(`   • All fee fields:`, {
          interaction_fee_amount: agent.interaction_fee_amount,
          interaction_fee_token: agent.interaction_fee_token,
          interaction_fee_usdfc: agent.interaction_fee_usdfc,
          fee_data_source: agent.fee_data_source,
        });
        console.log(`   • Network fields:`, {
          network: agent.network,
          deployment_network_name: agent.deployment_network_name,
          chain_id: agent.chain_id,
          deployment_chain_id: agent.deployment_chain_id,
        });
        console.log("");
      }
    }

    // 5. Find the missing "Cube Dynamic 1"
    console.log("\n5. COMPREHENSIVE SEARCH FOR MISSING AGENT...");

    // Search by various patterns
    const searchPatterns = [
      "Dynamic",
      "dynamic",
      "Cube Dynamic",
      "cube dynamic",
      "Dynamic 1",
      "dynamic 1",
    ];

    for (const pattern of searchPatterns) {
      const { data: results, error } = await supabase
        .from("deployed_objects")
        .select("id, name, created_at")
        .ilike("name", `%${pattern}%`);

      if (!error && results.length > 0) {
        console.log(`📍 Pattern "${pattern}" found ${results.length} results:`);
        results.forEach((agent) => {
          console.log(`   • ${agent.name} (ID: ${agent.id})`);
        });
      }
    }

    // 6. Check total agent count and recent additions
    console.log("\n6. DATABASE STATISTICS...");
    const { data: totalCount, error: countError } = await supabase
      .from("deployed_objects")
      .select("id", { count: "exact" });

    if (!countError) {
      console.log(`📊 Total agents in database: ${totalCount.length}`);
    }

    // Get most recent agents
    const { data: recentAgents, error: recentError } = await supabase
      .from("deployed_objects")
      .select("id, name, created_at")
      .order("created_at", { ascending: false })
      .limit(10);

    if (!recentError) {
      console.log("\n📅 10 Most Recent Agents:");
      recentAgents.forEach((agent, index) => {
        console.log(`${index + 1}. ${agent.name} (${agent.created_at})`);
      });
    }
  } catch (error) {
    console.error("💥 Critical error during investigation:", error);
  }
}

// Run the investigation
investigateDatabase()
  .then(() => {
    console.log("\n🏁 DATABASE INVESTIGATION COMPLETE");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Investigation failed:", error);
    process.exit(1);
  });
