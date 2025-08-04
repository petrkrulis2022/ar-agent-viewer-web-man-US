// Simple Database Query Test for Browser Console
// Run this in the browser console to check the database

import { supabase } from "./src/lib/supabase.js";

export async function testDatabase() {
  console.log("🚀 Testing AgentSphere Database Connection");

  try {
    // Test 1: Basic connection
    console.log("\n1️⃣ Testing basic connection...");
    const { data: testData, error: testError } = await supabase
      .from("deployed_objects")
      .select("id")
      .limit(1);

    if (testError) {
      console.error("❌ Connection failed:", testError);
      return { success: false, error: testError };
    }

    console.log("✅ Connection successful!");

    // Test 2: Count all records
    console.log("\n2️⃣ Counting all records...");
    const { count, error: countError } = await supabase
      .from("deployed_objects")
      .select("id", { count: "exact", head: true });

    if (countError) {
      console.error("❌ Count query failed:", countError);
    } else {
      console.log(`📊 Total records in deployed_objects: ${count}`);
    }

    // Test 3: Get all agents with essential fields
    console.log("\n3️⃣ Querying all agents...");
    const { data: allAgents, error: allError } = await supabase.from(
      "deployed_objects"
    ).select(`
        id,
        name,
        description,
        latitude,
        longitude,
        altitude,
        object_type,
        agent_type,
        is_active,
        created_at,
        deployer_wallet_address,
        token_symbol,
        interaction_fee
      `);

    if (allError) {
      console.error("❌ All agents query failed:", allError);
      return { success: false, error: allError };
    }

    console.log(`✅ Found ${allAgents.length} total agents`);

    // Test 4: Get only active agents
    console.log("\n4️⃣ Querying active agents...");
    const { data: activeAgents, error: activeError } = await supabase
      .from("deployed_objects")
      .select("*")
      .eq("is_active", true);

    if (activeError) {
      console.error("❌ Active agents query failed:", activeError);
    } else {
      console.log(`✅ Found ${activeAgents.length} active agents`);
    }

    // Show detailed results
    if (allAgents.length > 0) {
      console.log("\n📋 Agent Details:");
      allAgents.forEach((agent, index) => {
        console.log(`\n${index + 1}. ${agent.name || "Unnamed Agent"}`);
        console.log(`   📍 ID: ${agent.id}`);
        console.log(
          `   🏷️ Type: ${agent.agent_type || agent.object_type || "Unknown"}`
        );
        console.log(
          `   📝 Description: ${(
            agent.description || "No description"
          ).substring(0, 100)}...`
        );
        console.log(
          `   🌍 Location: ${agent.latitude}, ${agent.longitude} (${
            agent.altitude || 0
          }m)`
        );
        console.log(`   ✅ Active: ${agent.is_active ? "Yes" : "No"}`);
        console.log(`   💰 Token: ${agent.token_symbol || "Not set"}`);
        console.log(`   💳 Fee: ${agent.interaction_fee || "Not set"}`);
        console.log(
          `   👤 Deployer: ${
            agent.deployer_wallet_address
              ? agent.deployer_wallet_address.substring(0, 8) + "..."
              : "Not set"
          }`
        );
        console.log(
          `   📅 Created: ${new Date(agent.created_at).toLocaleDateString()}`
        );
      });
    } else {
      console.log("\n❌ No agents found in database!");
      console.log("💡 This explains why AR Viewer is showing mock data.");
      console.log("💡 Deploy some agents through AgentSphere first.");
    }

    // Test 5: Sample location query (like AR Viewer does)
    console.log("\n5️⃣ Testing location-based query (like AR Viewer)...");
    const sampleLat = 37.7749; // San Francisco
    const sampleLng = -122.4194;

    const { data: nearbyAgents, error: nearbyError } = await supabase
      .from("deployed_objects")
      .select("*")
      .eq("is_active", true);

    if (nearbyError) {
      console.error("❌ Nearby query failed:", nearbyError);
    } else {
      console.log(`✅ Location query returned ${nearbyAgents.length} agents`);
      if (nearbyAgents.length > 0) {
        console.log("📍 Sample agent locations:");
        nearbyAgents.slice(0, 5).forEach((agent) => {
          console.log(
            `   - ${agent.name}: ${agent.latitude}, ${agent.longitude}`
          );
        });
      }
    }

    return {
      success: true,
      totalAgents: allAgents.length,
      activeAgents: activeAgents?.length || 0,
      agents: allAgents,
    };
  } catch (error) {
    console.error("❌ Database test failed:", error);
    return { success: false, error };
  }
}

// Auto-run if this is loaded as a module
if (typeof window !== "undefined") {
  window.testDatabase = testDatabase;
  console.log(
    "🔧 Database test function loaded. Run testDatabase() in console to test."
  );
}
