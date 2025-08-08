const { createClient } = require("@supabase/supabase-js");

console.log("🚀 Starting Agentsphere Filter Analysis...");

// Supabase configuration
const SUPABASE_URL = "https://ncjbwzibnqrbrvicdmec.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jamJ3emlibnFyYnJ2aWNkbWVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2ODAxNTksImV4cCI6MjA2NjI1NjE1OX0.R7rx4jOPt9oOafcyJr3x-nEvGk5-e4DP7MbfCVOCHHI";

console.log("📡 Creating Supabase client...");
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
  try {
    console.log("🔍 Testing database connection...");

    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from("deployed_objects")
      .select("id")
      .limit(1);

    if (testError) {
      console.error("❌ Connection error:", testError);
      return;
    }

    console.log("✅ Database connected successfully!");
    console.log(`📊 Test query returned ${testData?.length || 0} records`);

    // Query 1: Get agent types
    console.log("\n🔍 Analyzing agent_type field...");
    const { data: agentData, error: agentError } = await supabase
      .from("deployed_objects")
      .select("agent_type")
      .not("agent_type", "is", null);

    if (agentError) {
      console.error("❌ Agent type query error:", agentError);
    } else {
      const typeCounts = {};
      agentData.forEach((item) => {
        typeCounts[item.agent_type] = (typeCounts[item.agent_type] || 0) + 1;
      });

      console.log("📈 Agent Type Distribution:");
      Object.entries(typeCounts).forEach(([type, count]) => {
        console.log(`   - ${type}: ${count} agents`);
      });
    }

    // Query 2: Get object types
    console.log("\n🔍 Analyzing object_type field...");
    const { data: objectData, error: objectError } = await supabase
      .from("deployed_objects")
      .select("object_type")
      .not("object_type", "is", null);

    if (objectError) {
      console.error("❌ Object type query error:", objectError);
    } else {
      const typeCounts = {};
      objectData.forEach((item) => {
        typeCounts[item.object_type] = (typeCounts[item.object_type] || 0) + 1;
      });

      console.log("📈 Object Type Distribution:");
      Object.entries(typeCounts).forEach(([type, count]) => {
        console.log(`   - ${type}: ${count} objects`);
      });
    }

    // Query 3: Sample agents for categorization
    console.log("\n🔍 Analyzing agent descriptions for categorization...");
    const { data: sampleData, error: sampleError } = await supabase
      .from("deployed_objects")
      .select("id, name, agent_type, object_type, description")
      .limit(10);

    if (sampleError) {
      console.error("❌ Sample query error:", sampleError);
    } else {
      console.log("📋 Sample Agents for Category Analysis:");
      sampleData.forEach((agent, index) => {
        console.log(`\n   ${index + 1}. ${agent.name}`);
        console.log(`      Agent Type: ${agent.agent_type || "N/A"}`);
        console.log(`      Object Type: ${agent.object_type || "N/A"}`);
        console.log(
          `      Description: ${(agent.description || "N/A").substring(
            0,
            100
          )}...`
        );

        // Suggest category based on screenshot filters
        const desc = (agent.description || "").toLowerCase();
        const agentType = (agent.agent_type || "").toLowerCase();

        let suggestedCategory = "Other";
        if (
          agentType.includes("intelligent") ||
          desc.includes("intelligent") ||
          desc.includes("assistant")
        ) {
          suggestedCategory = "Intelligent Assistant";
        } else if (desc.includes("local") || desc.includes("service")) {
          suggestedCategory = "Local Services";
        } else if (desc.includes("payment") || desc.includes("transaction")) {
          suggestedCategory = "Payment Terminal";
        } else if (desc.includes("game") || desc.includes("entertainment")) {
          suggestedCategory = "Game Agent";
        } else if (desc.includes("tutor") || desc.includes("education")) {
          suggestedCategory = "Tutor";
        }

        console.log(`      🎯 Suggested Category: ${suggestedCategory}`);
      });
    }

    // Query 4: Count total agents
    console.log("\n🔍 Getting total agent count...");
    const { count, error: countError } = await supabase
      .from("deployed_objects")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("❌ Count query error:", countError);
    } else {
      console.log(`📊 Total Agents in Database: ${count}`);
    }

    // Recommendations
    console.log("\n" + "=".repeat(50));
    console.log("💡 RECOMMENDATIONS FOR FILTER IMPLEMENTATION");
    console.log("=".repeat(50));
    console.log("");
    console.log("🎯 Based on the analysis:");
    console.log("");
    console.log("1. 📊 Current Structure:");
    console.log("   - Most agents appear to have generic types");
    console.log("   - Need description-based categorization");
    console.log("");
    console.log("2. 🔧 Implementation Options:");
    console.log('   - Option A: Add "category" field to database');
    console.log("   - Option B: Use description parsing for filters");
    console.log("   - Option C: Hybrid approach with both");
    console.log("");
    console.log("3. 📋 Screenshot Filter Categories to Map:");
    console.log("   ✅ Intelligent Assistant");
    console.log("   ✅ Local Services");
    console.log("   ✅ Payment Terminal");
    console.log("   ✅ Game Agent");
    console.log("   ✅ Tutor");
    console.log("   ✅ Home Security");
    console.log("   ✅ Content Creator");
    console.log("   ✅ Real Estate Broker");
    console.log("   ✅ Bus Stop Agent");
    console.log("   ✅ Study Buddy");
    console.log("   ✅ Landmark");
    console.log("   ✅ Building");
    console.log("");
    console.log("4. 🚀 Next Steps:");
    console.log("   - Review agent descriptions manually");
    console.log("   - Create category mapping logic");
    console.log("   - Implement frontend filters");
    console.log("   - Test with real data");

    console.log("\n✅ Analysis complete!");
  } catch (error) {
    console.error("❌ Unexpected error:", error);
  }
}

// Run the main function
main().catch((error) => {
  console.error("❌ Script failed:", error);
  process.exit(1);
});
