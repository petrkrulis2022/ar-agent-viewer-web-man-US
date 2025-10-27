import { createClient } from "@supabase/supabase-js";

// Database connection using service role for full access
const supabaseUrl = "https://ncjbwzibnqrbrvicdmec.supabase.co";
const serviceRoleKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jamJ3emlibnFyYnJ2aWNkbWVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTQ3MzMwMCwiZXhwIjoyMDc3MDQ5MzAwfQ.5LiZQFdXgyMnM_HDVW5ZLTGuhF_9xOAbXEJ6yeJ_yTk";

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function discoverSchema() {
  console.log("🔍 DISCOVERING DATABASE SCHEMA...\n");

  try {
    // First, let's get a sample agent to see what columns exist
    console.log("1. GETTING SAMPLE AGENT TO DISCOVER SCHEMA...");
    const { data: sampleAgents, error: sampleError } = await supabase
      .from("deployed_objects")
      .select("*")
      .limit(1);

    if (sampleError) {
      console.error("❌ Error fetching sample agent:", sampleError);
      return;
    }

    if (sampleAgents.length > 0) {
      console.log("✅ Sample agent columns found:");
      const agent = sampleAgents[0];
      Object.keys(agent)
        .sort()
        .forEach((key) => {
          console.log(`   • ${key}: ${typeof agent[key]} = ${agent[key]}`);
        });
      console.log("");
    }

    // Now search for all Cube agents with all available columns
    console.log("2. SEARCHING FOR ALL CUBE AGENTS...");
    const { data: allCubeAgents, error: allError } = await supabase
      .from("deployed_objects")
      .select("*")
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

      // Show all fee-related fields
      const feeFields = Object.keys(agent).filter(
        (key) =>
          key.toLowerCase().includes("fee") ||
          key.toLowerCase().includes("amount") ||
          key.toLowerCase().includes("usdc") ||
          key.toLowerCase().includes("token")
      );

      console.log(`   💰 Fee fields:`);
      feeFields.forEach((field) => {
        console.log(`      • ${field}: ${agent[field]}`);
      });

      // Show all network-related fields
      const networkFields = Object.keys(agent).filter(
        (key) =>
          key.toLowerCase().includes("network") ||
          key.toLowerCase().includes("chain") ||
          key.toLowerCase().includes("deployment")
      );

      console.log(`   🌐 Network fields:`);
      networkFields.forEach((field) => {
        console.log(`      • ${field}: ${agent[field]}`);
      });

      console.log("");
    });

    // 3. Specifically search for "Cube Dynamic 1"
    console.log('3. SEARCHING FOR "CUBE DYNAMIC 1"...');

    const searchPatterns = [
      "%dynamic%",
      "%Dynamic%",
      "%DYNAMIC%",
      "Cube Dynamic 1",
      "cube dynamic 1",
      "CUBE DYNAMIC 1",
    ];

    for (const pattern of searchPatterns) {
      const { data: results, error } = await supabase
        .from("deployed_objects")
        .select("id, name, created_at")
        .ilike("name", pattern);

      if (!error && results.length > 0) {
        console.log(`📍 Pattern "${pattern}" found ${results.length} results:`);
        results.forEach((agent) => {
          console.log(
            `   • ${agent.name} (ID: ${agent.id}) - Created: ${agent.created_at}`
          );
        });
      } else if (error) {
        console.log(`❌ Error searching pattern "${pattern}":`, error.message);
      } else {
        console.log(`ℹ️  Pattern "${pattern}" found 0 results`);
      }
    }

    // 4. Verify agents from the screenshot data
    console.log("\n4. VERIFYING SCREENSHOT AGENTS...");
    const screenshotAgents = [
      {
        id: "1022df78-8b62-473e-a7ad-fdba0c05b4a6",
        name: "Cube Sepolia Updated 1",
      },
      {
        id: "a92ed3f5-e490-4ca4-9c38-9747e666d6a6",
        name: "Cube Sepolia 4 dev account",
      },
      {
        id: "b1407463-06d6-4556-a956-bac36957f767",
        name: "Cube Sepolia 3 dev account",
      },
      { id: "120ef520-4131-40da-9d54-1df302086788", name: "Cube Sepolia 2" },
      {
        id: "f0704c18-8870-425e-9b47-4f8beb7f4673",
        name: "Cube Base Sepolia 1",
      },
    ];

    for (const expectedAgent of screenshotAgents) {
      const { data: agent, error } = await supabase
        .from("deployed_objects")
        .select("*")
        .eq("id", expectedAgent.id)
        .single();

      if (error) {
        console.log(
          `❌ Could not find "${expectedAgent.name}" (${expectedAgent.id}):`,
          error.message
        );
      } else {
        console.log(`✅ Found: "${agent.name}"`);

        // Show fee comparison with screenshot data
        const screenshotData = {
          "Cube Sepolia Updated 1": { amount: 18, token: "USDC", usdfc: 18.0 },
          "Cube Sepolia 4 dev account": {
            amount: 4,
            token: "USDC",
            usdfc: 4.0,
          },
          "Cube Sepolia 3 dev account": {
            amount: 10,
            token: "USDC",
            usdfc: 7.0,
          },
          "Cube Sepolia 2": { amount: 7, token: "USDC", usdfc: 10.0 },
          "Cube Base Sepolia 1": { amount: 3, token: "USDC", usdfc: 3.0 },
        };

        const expected = screenshotData[agent.name];
        if (expected) {
          console.log(`   📊 Screenshot vs DB comparison:`);
          console.log(
            `      • interaction_fee_amount: DB=${
              agent.interaction_fee_amount
            } | Screenshot=${expected.amount} | Match=${
              agent.interaction_fee_amount == expected.amount ? "✅" : "❌"
            }`
          );
          console.log(
            `      • interaction_fee_token: DB=${
              agent.interaction_fee_token
            } | Screenshot=${expected.token} | Match=${
              agent.interaction_fee_token == expected.token ? "✅" : "❌"
            }`
          );
          console.log(
            `      • interaction_fee_usdfc: DB=${
              agent.interaction_fee_usdfc
            } | Screenshot=${expected.usdfc} | Match=${
              agent.interaction_fee_usdfc == expected.usdfc ? "✅" : "❌"
            }`
          );
        }
        console.log("");
      }
    }

    // 5. Total database stats
    console.log("\n5. DATABASE STATISTICS...");
    const { data: allAgents, error: countError } = await supabase
      .from("deployed_objects")
      .select("id, name, created_at")
      .order("created_at", { ascending: false });

    if (!countError) {
      console.log(`📊 Total agents in database: ${allAgents.length}`);
      console.log("\n📅 10 Most Recent Agents:");
      allAgents.slice(0, 10).forEach((agent, index) => {
        console.log(
          `${index + 1}. ${agent.name} (${new Date(
            agent.created_at
          ).toLocaleString()})`
        );
      });
    }
  } catch (error) {
    console.error("💥 Critical error during investigation:", error);
  }
}

// Run the investigation
discoverSchema()
  .then(() => {
    console.log("\n🏁 SCHEMA DISCOVERY COMPLETE");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Investigation failed:", error);
    process.exit(1);
  });
