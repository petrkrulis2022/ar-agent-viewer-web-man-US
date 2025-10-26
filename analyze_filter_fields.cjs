#!/usr/bin/env node

const { createClient } = require("@supabase/supabase-js");

// Supabase configuration - using the same credentials from your project
const SUPABASE_URL = "https://ncjbwzibnqrbrvicdmec.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kamJ3emlibnFyYnJ2aWNkbWVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NzMzMDAsImV4cCI6MjA3NzA0OTMwMH0.OBxPLTZYpm6J59HFcn6VvXHlDt3r_HXMQEFCYKNR110";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper function to format results nicely
function formatResults(title, data) {
  console.log("\n" + "=".repeat(60));
  console.log(`📊 ${title}`);
  console.log("=".repeat(60));

  if (!data || data.length === 0) {
    console.log("❌ No data found");
    return;
  }

  // Pretty print the data
  console.table(data);
  console.log(`✅ Found ${data.length} records`);
}

// Query 1: Check agent_type field values
async function checkAgentTypes() {
  try {
    const { data, error } = await supabase
      .from("deployed_objects")
      .select("agent_type")
      .not("agent_type", "is", null);

    if (error) throw error;

    // Count occurrences
    const typeCounts = {};
    data.forEach((item) => {
      typeCounts[item.agent_type] = (typeCounts[item.agent_type] || 0) + 1;
    });

    const results = Object.entries(typeCounts)
      .map(([type, count]) => ({
        field_name: "agent_type",
        field_value: type,
        count: count,
      }))
      .sort((a, b) => b.count - a.count);

    formatResults("AGENT TYPE FIELD VALUES", results);
    return results;
  } catch (error) {
    console.error("❌ Error checking agent types:", error.message);
    return [];
  }
}

// Query 2: Check object_type field values
async function checkObjectTypes() {
  try {
    const { data, error } = await supabase
      .from("deployed_objects")
      .select("object_type")
      .not("object_type", "is", null);

    if (error) throw error;

    // Count occurrences
    const typeCounts = {};
    data.forEach((item) => {
      typeCounts[item.object_type] = (typeCounts[item.object_type] || 0) + 1;
    });

    const results = Object.entries(typeCounts)
      .map(([type, count]) => ({
        field_name: "object_type",
        field_value: type,
        count: count,
      }))
      .sort((a, b) => b.count - a.count);

    formatResults("OBJECT TYPE FIELD VALUES", results);
    return results;
  } catch (error) {
    console.error("❌ Error checking object types:", error.message);
    return [];
  }
}

// Query 3: Categorize agents based on screenshot filters
async function categorizeAgents() {
  try {
    const { data, error } = await supabase
      .from("deployed_objects")
      .select(
        "id, name, agent_type, object_type, description, latitude, longitude, created_at"
      );

    if (error) throw error;

    const categorized = data.map((agent) => {
      const desc = (agent.description || "").toLowerCase();
      const agentType = (agent.agent_type || "").toLowerCase();
      const objectType = (agent.object_type || "").toLowerCase();

      let category = "Other";

      // Categorization logic based on screenshot filters
      if (
        agentType.includes("intelligent") ||
        agentType.includes("assistant") ||
        desc.includes("intelligent") ||
        desc.includes("assistant")
      ) {
        category = "Intelligent Assistant";
      } else if (
        agentType.includes("local") ||
        agentType.includes("service") ||
        desc.includes("local") ||
        desc.includes("service")
      ) {
        category = "Local Services";
      } else if (
        agentType.includes("payment") ||
        agentType.includes("terminal") ||
        desc.includes("payment") ||
        desc.includes("transaction")
      ) {
        category = "Payment Terminal";
      } else if (
        agentType.includes("game") ||
        desc.includes("game") ||
        desc.includes("entertainment")
      ) {
        category = "Game Agent";
      } else if (
        agentType.includes("tutor") ||
        agentType.includes("teach") ||
        desc.includes("tutor") ||
        desc.includes("education")
      ) {
        category = "Tutor";
      } else if (agentType.includes("security") || desc.includes("security")) {
        category = "Home Security";
      } else if (
        agentType.includes("content") ||
        agentType.includes("creator") ||
        desc.includes("content") ||
        desc.includes("creative")
      ) {
        category = "Content Creator";
      } else if (
        (agentType.includes("real") && agentType.includes("estate")) ||
        desc.includes("real estate") ||
        desc.includes("property")
      ) {
        category = "Real Estate Broker";
      } else if (
        agentType.includes("bus") ||
        agentType.includes("transport") ||
        desc.includes("bus") ||
        desc.includes("transport")
      ) {
        category = "Bus Stop Agent";
      } else if (
        agentType.includes("study") ||
        agentType.includes("buddy") ||
        desc.includes("study")
      ) {
        category = "Study Buddy";
      } else if (
        agentType.includes("landmark") ||
        desc.includes("landmark") ||
        desc.includes("monument")
      ) {
        category = "Landmark";
      } else if (
        agentType.includes("building") ||
        objectType.includes("building") ||
        desc.includes("building")
      ) {
        category = "Building";
      }

      return {
        id: agent.id,
        name: agent.name,
        agent_type: agent.agent_type,
        object_type: agent.object_type,
        suggested_category: category,
        description_preview: (agent.description || "").substring(0, 50) + "...",
        location: `${agent.latitude?.toFixed(4) || "N/A"}, ${
          agent.longitude?.toFixed(4) || "N/A"
        }`,
      };
    });

    formatResults("CATEGORIZED AGENTS", categorized.slice(0, 20)); // Show first 20

    // Count by category
    const categoryCounts = {};
    categorized.forEach((agent) => {
      categoryCounts[agent.suggested_category] =
        (categoryCounts[agent.suggested_category] || 0) + 1;
    });

    const categoryResults = Object.entries(categoryCounts)
      .map(([category, count]) => ({
        category,
        agent_count: count,
        percentage: ((count / categorized.length) * 100).toFixed(2) + "%",
      }))
      .sort((a, b) => b.agent_count - a.agent_count);

    formatResults("CATEGORY DISTRIBUTION", categoryResults);

    return { categorized, categoryResults };
  } catch (error) {
    console.error("❌ Error categorizing agents:", error.message);
    return { categorized: [], categoryResults: [] };
  }
}

// Query 4: Check table schema for filter-related fields
async function checkTableSchema() {
  try {
    // Get a sample record to see all available fields
    const { data, error } = await supabase
      .from("deployed_objects")
      .select("*")
      .limit(1);

    if (error) throw error;

    if (data && data.length > 0) {
      const sampleAgent = data[0];
      const fields = Object.keys(sampleAgent).map((fieldName) => {
        const value = sampleAgent[fieldName];
        return {
          column_name: fieldName,
          data_type: typeof value,
          sample_value:
            value === null
              ? "null"
              : String(value).substring(0, 30) +
                (String(value).length > 30 ? "..." : ""),
          is_filter_relevant:
            fieldName.includes("type") ||
            fieldName.includes("category") ||
            fieldName.includes("class") ||
            fieldName.includes("kind") ||
            fieldName.includes("tag")
              ? "✅ YES"
              : "❌ No",
        };
      });

      formatResults("TABLE SCHEMA ANALYSIS", fields);

      // Filter relevant fields
      const filterFields = fields.filter(
        (f) => f.is_filter_relevant === "✅ YES"
      );
      if (filterFields.length > 0) {
        formatResults("FILTER-RELEVANT FIELDS", filterFields);
      }

      return fields;
    }
  } catch (error) {
    console.error("❌ Error checking table schema:", error.message);
    return [];
  }
}

// Query 5: Sample agents with their data
async function getSampleAgents() {
  try {
    const { data, error } = await supabase
      .from("deployed_objects")
      .select(
        "id, name, agent_type, object_type, description, latitude, longitude, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) throw error;

    const samples = data.map((agent) => ({
      name: agent.name,
      agent_type: agent.agent_type,
      object_type: agent.object_type,
      description_preview: (agent.description || "").substring(0, 60) + "...",
      location: `${agent.latitude?.toFixed(4) || "N/A"}, ${
        agent.longitude?.toFixed(4) || "N/A"
      }`,
      created: new Date(agent.created_at).toLocaleDateString(),
    }));

    formatResults("SAMPLE AGENTS (Latest 10)", samples);
    return samples;
  } catch (error) {
    console.error("❌ Error getting sample agents:", error.message);
    return [];
  }
}

// Main analysis function
async function runFilterAnalysis() {
  console.log("🔍 AGENTSPHERE FILTER FIELD ANALYSIS");
  console.log("🎯 Analyzing database structure vs. screenshot filters");
  console.log("📅 Date:", new Date().toISOString());

  try {
    // Test connection first
    console.log("\n📡 Testing database connection...");
    const { data: testData, error: testError } = await supabase
      .from("deployed_objects")
      .select("id")
      .limit(1);

    if (testError) {
      console.error("❌ Database connection failed:", testError.message);
      return;
    }

    console.log("✅ Database connection successful!");

    // Run all analysis queries
    console.log("\n🚀 Running comprehensive filter analysis...");

    const agentTypes = await checkAgentTypes();
    const objectTypes = await checkObjectTypes();
    const { categorized, categoryResults } = await categorizeAgents();
    const schema = await checkTableSchema();
    const samples = await getSampleAgents();

    // Summary and recommendations
    console.log("\n" + "=".repeat(60));
    console.log("📋 ANALYSIS SUMMARY & RECOMMENDATIONS");
    console.log("=".repeat(60));

    console.log("\n🎯 Current State:");
    console.log(`   - Total agents analyzed: ${categorized.length}`);
    console.log(`   - Unique agent_types: ${agentTypes.length}`);
    console.log(`   - Unique object_types: ${objectTypes.length}`);

    console.log("\n📊 Filter Mapping Status:");
    categoryResults.forEach((cat) => {
      const icon = cat.agent_count > 0 ? "✅" : "❌";
      console.log(
        `   ${icon} ${cat.category}: ${cat.agent_count} agents (${cat.percentage})`
      );
    });

    console.log("\n💡 Recommendations:");
    if (categoryResults.find((c) => c.category === "Other")?.agent_count > 0) {
      console.log(
        '   🔧 Consider adding a dedicated "category" field to database'
      );
      console.log("   🔧 Most agents are currently uncategorized");
    }

    if (agentTypes.length === 1 && agentTypes[0]?.field_value === "ai_agent") {
      console.log('   🔧 All agents have same agent_type ("ai_agent")');
      console.log("   🔧 Need more granular categorization system");
    }

    console.log(
      "   🔧 Update frontend filters to use description-based categorization"
    );
    console.log("   🔧 Consider migrating data to proper category fields");

    console.log(
      "\n✅ Analysis complete! Use these insights to implement proper filtering."
    );
  } catch (error) {
    console.error("❌ Analysis failed:", error);
  }
}

// Run the analysis
if (require.main === module) {
  console.log("🚀 Starting script execution...");
  runFilterAnalysis().catch((error) => {
    console.error("❌ Script error:", error);
    process.exit(1);
  });
}

module.exports = {
  runFilterAnalysis,
  checkAgentTypes,
  checkObjectTypes,
  categorizeAgents,
  checkTableSchema,
  getSampleAgents,
};
