// Direct Database Connection Test
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ncjbwzibnqrbrvicdmec.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jamJ3emlibnFyYnJ2aWNkbWVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2ODAxNTksImV4cCI6MjA2NjI1NjE1OX0.R7rx4jOPt9oOafcyJr3x-nEvGk5-e4DP7MbfCVOCHHI";

async function testDatabaseConnection() {
  try {
    console.log("🔍 Testing real database connection...");

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    console.log("✅ Supabase client created");

    // Test basic connection
    console.log("🔍 Testing ar_qr_codes table...");
    const { data: arData, error: arError } = await supabase
      .from("ar_qr_codes")
      .select("id, name, agent_type, object_type, latitude, longitude")
      .limit(10);

    if (arError) {
      console.log("⚠️ ar_qr_codes table error:", arError.message);

      // Try deployed_objects table instead
      console.log("🔍 Testing deployed_objects table...");
      const { data, error } = await supabase
        .from("deployed_objects")
        .select("id, name, object_type, latitude, longitude")
        .limit(10);

      if (error) {
        console.error("❌ deployed_objects table error:", error);
        return false;
      }

      console.log(
        `✅ Database connection successful using deployed_objects table!`
      );
      console.log(
        `📊 Found ${data?.length || 0} agents in deployed_objects table`
      );

      if (data && data.length > 0) {
        console.log("🎯 Real agents found:");
        data.forEach((agent, i) => {
          console.log(
            `${i + 1}. ${agent.name} (${agent.object_type}) - ID: ${agent.id}`
          );
        });
      } else {
        console.log("⚠️ No agents found in database");
      }

      return data;
    }

    // If ar_qr_codes worked
    console.log(`✅ Database connection successful!`);
    console.log(`📊 Found ${arData?.length || 0} agents in ar_qr_codes table`);

    if (arData && arData.length > 0) {
      console.log("🎯 Real agents found:");
      arData.forEach((agent, i) => {
        console.log(
          `${i + 1}. ${agent.name} (${
            agent.agent_type || agent.object_type
          }) - ID: ${agent.id}`
        );
      });
    } else {
      console.log("⚠️ No agents found in database");
    }

    return arData;
  } catch (error) {
    console.error("❌ Connection test failed:", error);
    return false;
  }
}

testDatabaseConnection();
