import { createClient } from "@supabase/supabase-js";

// Test the exact same query the app uses
const SUPABASE_URL = "https://ncjbwzibnqrbrvicdmec.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jamJ3emlibnFyYnJ2aWNkbWVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NzMzMDAsImV4cCI6MjA3NzA0OTMwMH0.OBxPLTZYpm6J59HFcn6VvXHlDt3r_HXMQEFCYKNR110";

console.log("🔧 App Query Simulation");
console.log("=======================");

async function simulateAppQuery() {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });

    console.log("✅ Supabase client created");

    // Simulate the exact location the app might use
    const latitude = 50.64; // Around Czech Republic
    const longitude = 13.83;
    const radius = 100000; // 100km

    console.log(
      `🔍 Simulating query for location: ${latitude}, ${longitude} within ${radius}m`
    );

    // Test basic query first
    console.log("\n🔍 Step 1: Basic query...");
    const { data: basicData, error: basicError } = await supabase
      .from("deployed_objects")
      .select("id, name, latitude, longitude")
      .limit(5);

    if (basicError) {
      console.error("❌ Basic query failed:", basicError);
      return;
    }

    console.log(
      "✅ Basic query successful, found records:",
      basicData?.length || 0
    );
    console.log("Sample records:", basicData);

    // Test the full query that the app uses (UPDATED VERSION)
    console.log("\n🔍 Step 2: Full app query (updated)...");
    const { data, error } = await supabase
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
        interaction_fee_usdfc,
        interaction_range,
        currency_type,
        network,
        mcp_services,
        features
      `
      )
      .limit(100);

    if (error) {
      console.error("❌ Full query failed:", error);
      console.error("Error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });

      // Try a simpler query if full one fails
      console.log("\n🔄 Trying simplified query...");
      const { data: simpleData, error: simpleError } = await supabase
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
          created_at
        `
        )
        .limit(10);

      if (simpleError) {
        console.error("❌ Simple query also failed:", simpleError);
      } else {
        console.log("✅ Simple query worked!");
        console.log("Records:", simpleData?.length || 0);
        console.log("Sample:", simpleData?.[0]);
        return simpleData;
      }
    } else {
      console.log("✅ Full query successful!");
      console.log("Records found:", data?.length || 0);
      if (data && data.length > 0) {
        console.log("Sample record:", data[0]);
      }
      return data;
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

simulateAppQuery();
