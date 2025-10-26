import { createClient } from "@supabase/supabase-js";

// Configuration
const SUPABASE_URL = "https://ncjbwzibnqrbrvicdmec.supabase.co";
const SUPABASE_SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jamJ3emlibnFyYnJ2aWNkbWVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTQ3MzMwMCwiZXhwIjoyMDc3MDQ5MzAwfQ.5LiZQFdXgyMnM_HDVW5ZLTGuhF_9xOAbXEJ6yeJ_yTk";

console.log("🔧 Testing Data Addition");
console.log("========================");

async function addTestAgents() {
  try {
    // Create admin client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    console.log("✅ Admin client created");

    // Check current data
    console.log("\n🔍 Checking existing data...");
    const { data: existing, error: readError } = await supabase
      .from("deployed_objects")
      .select("*");

    if (readError) {
      console.error("❌ Read error:", readError);
      return;
    }

    console.log("📊 Existing records:", existing?.length || 0);
    if (existing && existing.length > 0) {
      console.log("Sample record:", existing[0]);
    }

    // Add some test agents near common locations
    const testAgents = [
      {
        name: "Prague AI Assistant",
        description: "Smart AI helper for Prague city center",
        latitude: 50.0755,
        longitude: 14.4378,
        altitude: 10,
        object_type: "agent",
        agent_type: "intelligent_assistant",
        user_id: "test-user-1",
        is_active: true,
      },
      {
        name: "Berlin Helper Bot",
        description: "Tourist information agent for Berlin",
        latitude: 52.52,
        longitude: 13.405,
        altitude: 15,
        object_type: "agent",
        agent_type: "local_services",
        user_id: "test-user-2",
        is_active: true,
      },
      {
        name: "London Agent",
        description: "Financial district assistant",
        latitude: 51.5074,
        longitude: -0.1278,
        altitude: 12,
        object_type: "agent",
        agent_type: "content_creator",
        user_id: "test-user-3",
        is_active: true,
      },
    ];

    console.log("\n🔧 Adding test agents...");
    const { data: inserted, error: insertError } = await supabase
      .from("deployed_objects")
      .insert(testAgents)
      .select();

    if (insertError) {
      console.error("❌ Insert error:", insertError);
      console.error("Error details:", {
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
      });
    } else {
      console.log("✅ Successfully added test agents:", inserted?.length || 0);
      console.log("New agents:", inserted);
    }

    // Verify the total count now
    console.log("\n🔍 Final verification...");
    const { data: final, error: finalError } = await supabase
      .from("deployed_objects")
      .select("id, name, latitude, longitude");

    if (finalError) {
      console.error("❌ Final check error:", finalError);
    } else {
      console.log("✅ Total agents in database:", final?.length || 0);
      console.log("All agents:", final);
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

addTestAgents();
