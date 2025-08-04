// Database Test Script - Check what agents are in Supabase
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL || "https://ncjbwzibnqrbrvicdmec.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

// Use service role key if available, otherwise anon key
const SUPABASE_KEY = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;

console.log("🔧 Database Test Configuration:");
console.log("- SUPABASE_URL:", SUPABASE_URL);
console.log("- Using Service Role Key:", !!SUPABASE_SERVICE_ROLE_KEY);
console.log(
  "- Using Anon Key:",
  !!SUPABASE_ANON_KEY && !SUPABASE_SERVICE_ROLE_KEY
);
console.log("- Key length:", SUPABASE_KEY?.length || 0);

if (!SUPABASE_KEY) {
  console.error("❌ No Supabase key found in environment variables");
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

async function testDatabaseConnection() {
  try {
    console.log("\n🔗 Testing database connection...");

    // Test basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from("deployed_objects")
      .select("id")
      .limit(1);

    if (connectionError) {
      console.error("❌ Connection test failed:", connectionError);
      return false;
    }

    console.log("✅ Database connection successful");
    return true;
  } catch (error) {
    console.error("❌ Connection test error:", error);
    return false;
  }
}

async function queryAllAgents() {
  try {
    console.log("\n📊 Querying all agents in deployed_objects table...");

    const { data, error, count } = await supabase
      .from("deployed_objects")
      .select(
        `
        id,
        name,
        description,
        latitude,
        longitude,
        altitude,
        object_type,
        agent_type,
        user_id,
        created_at,
        is_active,
        mcp_services,
        token_address,
        token_symbol,
        chain_id,
        deployer_wallet_address,
        payment_recipient_address,
        agent_wallet_address,
        text_chat,
        voice_chat,
        video_chat,
        interaction_fee,
        features,
        interaction_types,
        agent_capabilities,
        payment_enabled,
        currency_type,
        payment_amount,
        location_type,
        revenue_sharing_percentage
      `,
        { count: "exact" }
      );

    if (error) {
      console.error("❌ Query error:", error);
      return null;
    }

    console.log(`✅ Found ${data.length} agents in database`);

    if (data.length === 0) {
      console.log("ℹ️ No agents found in deployed_objects table");
      return [];
    }

    console.log("\n📋 Agent List:");
    data.forEach((agent, index) => {
      console.log(`\n${index + 1}. ${agent.name || "Unnamed Agent"}`);
      console.log(`   ID: ${agent.id}`);
      console.log(
        `   Type: ${agent.agent_type || agent.object_type || "Unknown"}`
      );
      console.log(`   Description: ${agent.description || "No description"}`);
      console.log(
        `   Location: ${agent.latitude}, ${agent.longitude} (altitude: ${
          agent.altitude || 0
        }m)`
      );
      console.log(`   Active: ${agent.is_active ? "Yes" : "No"}`);
      console.log(`   Token: ${agent.token_symbol || "Not set"}`);
      console.log(
        `   Interaction Fee: ${
          agent.interaction_fee || agent.payment_amount || "Not set"
        }`
      );
      console.log(
        `   Deployer Wallet: ${agent.deployer_wallet_address || "Not set"}`
      );
      console.log(
        `   Payment Recipient: ${agent.payment_recipient_address || "Not set"}`
      );
      console.log(
        `   Agent Wallet: ${agent.agent_wallet_address || "Not set"}`
      );
      console.log(`   Text Chat: ${agent.text_chat ? "Yes" : "No"}`);
      console.log(`   Voice Chat: ${agent.voice_chat ? "Yes" : "No"}`);
      console.log(`   Video Chat: ${agent.video_chat ? "Yes" : "No"}`);
      console.log(
        `   MCP Services: ${
          agent.mcp_services ? JSON.stringify(agent.mcp_services) : "None"
        }`
      );
      console.log(
        `   Features: ${
          agent.features ? JSON.stringify(agent.features) : "None"
        }`
      );
      console.log(`   Created: ${agent.created_at}`);
    });

    return data;
  } catch (error) {
    console.error("❌ Query error:", error);
    return null;
  }
}

async function queryActiveAgents() {
  try {
    console.log("\n🟢 Querying only active agents...");

    const { data, error } = await supabase
      .from("deployed_objects")
      .select("*")
      .eq("is_active", true);

    if (error) {
      console.error("❌ Active agents query error:", error);
      return null;
    }

    console.log(`✅ Found ${data.length} active agents`);

    if (data.length > 0) {
      console.log("\n📋 Active Agent Summary:");
      data.forEach((agent, index) => {
        console.log(
          `${index + 1}. ${agent.name || "Unnamed"} (${
            agent.agent_type || agent.object_type || "Unknown type"
          })`
        );
      });
    }

    return data;
  } catch (error) {
    console.error("❌ Active agents query error:", error);
    return null;
  }
}

async function checkTableSchema() {
  try {
    console.log("\n🏗️ Checking table schema...");

    // Try to get one record to see what columns exist
    const { data, error } = await supabase
      .from("deployed_objects")
      .select("*")
      .limit(1);

    if (error) {
      console.error("❌ Schema check error:", error);
      return;
    }

    if (data.length > 0) {
      console.log("✅ Available columns:");
      Object.keys(data[0]).forEach((column) => {
        console.log(
          `   - ${column}: ${typeof data[0][column]} (${
            data[0][column] === null ? "NULL" : "has value"
          })`
        );
      });
    } else {
      console.log("ℹ️ No data available to check schema");
    }
  } catch (error) {
    console.error("❌ Schema check error:", error);
  }
}

// Main test function
async function runDatabaseTest() {
  console.log("🚀 Starting AgentSphere Database Test\n");

  // Test connection
  const connected = await testDatabaseConnection();
  if (!connected) {
    console.log("❌ Cannot proceed - database connection failed");
    return;
  }

  // Check table schema
  await checkTableSchema();

  // Query all agents
  const allAgents = await queryAllAgents();

  // Query active agents
  const activeAgents = await queryActiveAgents();

  // Summary
  console.log("\n📊 Database Test Summary:");
  console.log(`- Connection: ${connected ? "SUCCESS" : "FAILED"}`);
  console.log(`- Total agents: ${allAgents ? allAgents.length : "Unknown"}`);
  console.log(
    `- Active agents: ${activeAgents ? activeAgents.length : "Unknown"}`
  );

  if (allAgents && allAgents.length === 0) {
    console.log("\n💡 Recommendation: No agents found in database.");
    console.log("   This explains why the AR Viewer is showing mock data.");
    console.log("   You need to deploy some agents through AgentSphere first.");
  } else if (activeAgents && activeAgents.length === 0) {
    console.log("\n💡 Recommendation: Agents exist but none are active.");
    console.log(
      "   Check the 'is_active' status in your AgentSphere deployment."
    );
  } else if (allAgents && allAgents.length > 0) {
    console.log("\n✅ Real agents found! The AR Viewer should display them.");
    console.log(
      "   If you're still seeing mock data, check the AR Viewer location settings."
    );
  }

  console.log("\n🏁 Database test completed");
}

// Run the test
runDatabaseTest().catch(console.error);
