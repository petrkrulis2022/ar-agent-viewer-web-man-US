const { createClient } = require("@supabase/supabase-js");

console.log("🎯 COMPREHENSIVE AGENTSPHERE FILTER MAPPING ANALYSIS");
console.log("===============================================");

// Supabase configuration
const SUPABASE_URL = "https://ncjbwzibnqrbrvicdmec.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jamJ3emlibnFyYnJ2aWNkbWVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2ODAxNTksImV4cCI6MjA2NjI1NjE1OX0.R7rx4jOPt9oOafcyJr3x-nEvGk5-e4DP7MbfCVOCHHI";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Function to categorize agents based on multiple criteria
function categorizeAgent(agent) {
  const name = (agent.name || "").toLowerCase();
  const agentType = (agent.agent_type || "").toLowerCase();
  const objectType = (agent.object_type || "").toLowerCase();
  const description = (agent.description || "").toLowerCase();

  // Screenshot categories to match exactly
  if (
    agentType.includes("intelligent assistant") ||
    description.includes("intelligent assistant") ||
    description.includes("ai assistant")
  ) {
    return "Intelligent Assistant";
  }

  if (
    agentType.includes("bus stop") ||
    name.includes("bus") ||
    description.includes("bus") ||
    description.includes("directions")
  ) {
    return "Bus Stop Agent";
  }

  if (
    agentType.includes("study_buddy") ||
    agentType.includes("study buddy") ||
    name.includes("study") ||
    description.includes("study")
  ) {
    return "Study Buddy";
  }

  if (
    agentType.includes("tutor") ||
    description.includes("tutor") ||
    description.includes("education") ||
    description.includes("teaching")
  ) {
    return "Tutor";
  }

  if (
    agentType.includes("content creator") ||
    description.includes("content") ||
    description.includes("creator")
  ) {
    return "Content Creator";
  }

  if (
    description.includes("payment") ||
    description.includes("transaction") ||
    description.includes("terminal") ||
    name.includes("payment")
  ) {
    return "Payment Terminal";
  }

  if (
    description.includes("local service") ||
    description.includes("service") ||
    agentType.includes("service")
  ) {
    return "Local Services";
  }

  if (
    description.includes("game") ||
    description.includes("entertainment") ||
    name.includes("game")
  ) {
    return "Game Agent";
  }

  if (
    description.includes("security") ||
    description.includes("home security") ||
    name.includes("security")
  ) {
    return "Home Security";
  }

  if (
    description.includes("real estate") ||
    description.includes("broker") ||
    description.includes("property")
  ) {
    return "Real Estate Broker";
  }

  if (
    description.includes("landmark") ||
    description.includes("monument") ||
    agentType.includes("landmark")
  ) {
    return "Landmark";
  }

  if (
    description.includes("building") ||
    agentType.includes("building") ||
    objectType.includes("building")
  ) {
    return "Building";
  }

  // Basic 3D objects (cubes, spheres, pyramids)
  if (
    description.includes("3d cube") ||
    description.includes("cube object") ||
    name.includes("cube")
  ) {
    return "AR 3D Object";
  }

  if (
    description.includes("3d sphere") ||
    description.includes("spherical object") ||
    name.includes("sphere")
  ) {
    return "AR 3D Object";
  }

  if (
    description.includes("3d pyramid") ||
    description.includes("pyramid object") ||
    name.includes("pyramid")
  ) {
    return "AR 3D Object";
  }

  return "Other";
}

async function comprehensiveAnalysis() {
  try {
    console.log("📊 Fetching all agents for comprehensive analysis...");

    // Get all agents with full details
    const { data: allAgents, error } = await supabase
      .from("deployed_objects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Query error:", error);
      return;
    }

    console.log(`✅ Retrieved ${allAgents.length} agents from database`);

    // Categorize all agents
    const categorizedAgents = allAgents.map((agent) => ({
      ...agent,
      suggested_category: categorizeAgent(agent),
    }));

    // Count by category
    const categoryCounts = {};
    categorizedAgents.forEach((agent) => {
      const category = agent.suggested_category;
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    // Display category distribution
    console.log("\n📊 CATEGORY DISTRIBUTION (Based on Screenshot Filters):");
    console.log("=" * 60);

    const sortedCategories = Object.entries(categoryCounts).sort(
      ([, a], [, b]) => b - a
    );

    sortedCategories.forEach(([category, count]) => {
      const percentage = ((count / allAgents.length) * 100).toFixed(1);
      const icon = count > 0 ? "✅" : "❌";
      console.log(
        `${icon} ${category.padEnd(20)} : ${count
          .toString()
          .padStart(3)} agents (${percentage}%)`
      );
    });

    // Show agents by category
    console.log("\n📋 DETAILED AGENT BREAKDOWN BY CATEGORY:");
    console.log("=" * 60);

    sortedCategories.forEach(([category, count]) => {
      if (count > 0) {
        console.log(`\n🏷️  ${category.toUpperCase()} (${count} agents):`);
        const agentsInCategory = categorizedAgents
          .filter((agent) => agent.suggested_category === category)
          .slice(0, 5); // Show first 5 examples

        agentsInCategory.forEach((agent, idx) => {
          console.log(`   ${idx + 1}. ${agent.name}`);
          console.log(`      Type: ${agent.agent_type}`);
          console.log(
            `      Desc: ${(agent.description || "N/A").substring(0, 80)}...`
          );
          console.log(
            `      Location: ${agent.latitude?.toFixed(
              4
            )}, ${agent.longitude?.toFixed(4)}`
          );
        });

        if (count > 5) {
          console.log(
            `      ... and ${count - 5} more agents in this category`
          );
        }
      }
    });

    // Field analysis for existing categorization
    console.log("\n🔍 EXISTING FIELD ANALYSIS:");
    console.log("=" * 60);

    const agentTypes = {};
    const objectTypes = {};

    allAgents.forEach((agent) => {
      if (agent.agent_type) {
        agentTypes[agent.agent_type] = (agentTypes[agent.agent_type] || 0) + 1;
      }
      if (agent.object_type) {
        objectTypes[agent.object_type] =
          (objectTypes[agent.object_type] || 0) + 1;
      }
    });

    console.log("\n📊 Current agent_type values:");
    Object.entries(agentTypes)
      .sort(([, a], [, b]) => b - a)
      .forEach(([type, count]) => {
        console.log(`   - ${type}: ${count} agents`);
      });

    console.log("\n📊 Current object_type values:");
    Object.entries(objectTypes)
      .sort(([, a], [, b]) => b - a)
      .forEach(([type, count]) => {
        console.log(`   - ${type}: ${count} objects`);
      });

    // Database schema check
    console.log("\n🔍 DATABASE SCHEMA CHECK:");
    console.log("=" * 60);

    if (allAgents.length > 0) {
      const sampleAgent = allAgents[0];
      const allFields = Object.keys(sampleAgent);

      console.log(`📊 Total fields per agent: ${allFields.length}`);
      console.log("\n🔍 Filter-relevant fields:");

      const filterFields = allFields.filter(
        (field) =>
          field.includes("type") ||
          field.includes("category") ||
          field.includes("class") ||
          field.includes("tag") ||
          field.includes("kind")
      );

      filterFields.forEach((field) => {
        const sampleValue = sampleAgent[field];
        console.log(`   ✅ ${field}: ${sampleValue || "null"}`);
      });

      if (filterFields.length === 0) {
        console.log("   ❌ No dedicated filter fields found");
      }
    }

    // Recommendations
    console.log("\n💡 IMPLEMENTATION RECOMMENDATIONS:");
    console.log("=" * 60);
    console.log("");
    console.log("🎯 IMMEDIATE ACTIONS:");
    console.log("");
    console.log("1. 📊 Current State Summary:");
    console.log(`   - Total agents: ${allAgents.length}`);
    console.log(
      `   - Categorizable: ${
        allAgents.length - (categoryCounts["Other"] || 0)
      } (${(
        ((allAgents.length - (categoryCounts["Other"] || 0)) /
          allAgents.length) *
        100
      ).toFixed(1)}%)`
    );
    console.log(
      `   - Need categorization: ${categoryCounts["Other"] || 0} (${(
        ((categoryCounts["Other"] || 0) / allAgents.length) *
        100
      ).toFixed(1)}%)`
    );
    console.log("");
    console.log("2. 🔧 Frontend Filter Implementation:");
    console.log("   ✅ Use description-based categorization (ready now)");
    console.log("   ✅ Categories match screenshot exactly");
    console.log("   ✅ Can be implemented without database changes");
    console.log("");
    console.log("3. 🚀 Code Implementation Options:");
    console.log("");
    console.log("   Option A - Frontend Categorization (RECOMMENDED):");
    console.log("   ```javascript");
    console.log("   const categorizeAgent = (agent) => {");
    console.log("     // Use the logic from this analysis");
    console.log("     // No database changes needed");
    console.log("   };");
    console.log("   ```");
    console.log("");
    console.log("   Option B - Database Migration:");
    console.log("   ```sql");
    console.log("   ALTER TABLE deployed_objects");
    console.log("   ADD COLUMN category VARCHAR(50);");
    console.log("   ```");
    console.log("");
    console.log("4. 📊 Filter Counts for UI:");
    sortedCategories.forEach(([category, count]) => {
      if (category !== "Other" && count > 0) {
        console.log(`   - ${category}: ${count} available`);
      }
    });

    console.log("\n✅ COMPREHENSIVE ANALYSIS COMPLETE!");
    console.log(
      "\n🎯 Ready to implement filters with current database structure."
    );
  } catch (error) {
    console.error("❌ Analysis failed:", error);
  }
}

// Run comprehensive analysis
comprehensiveAnalysis().catch((error) => {
  console.error("❌ Script error:", error);
  process.exit(1);
});
