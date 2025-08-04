import { createClient } from "@supabase/supabase-js";

// Configuration - exactly as in the main app
const SUPABASE_URL = "https://ncjbwzibnqrbrvicdmec.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jamJ3emlibnFyYnJ2aWNkbWVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2ODAxNTksImV4cCI6MjA2NjI1NjE1OX0.R7rx4jOPt9oOafcyJr3x-nEvGk5-e4DP7MbfCVOCHHI";

console.log("🔧 Database Connection Diagnostic Tool");
console.log("====================================");

async function runDatabaseTests() {
  try {
    console.log("📋 Configuration:");
    console.log("- URL:", SUPABASE_URL);
    console.log("- Key length:", SUPABASE_ANON_KEY.length);

    // Create client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });

    console.log("✅ Supabase client created");

    // Test 1: Check deployed_objects table
    console.log("\n🔍 Test 1: deployed_objects table");
    try {
      const { data, error } = await supabase
        .from("deployed_objects")
        .select("id")
        .limit(1);

      if (error) {
        console.log("❌ deployed_objects error:", error.message);
        console.log("   Details:", error.details);
        console.log("   Hint:", error.hint);
        console.log("   Code:", error.code);
      } else {
        console.log("✅ deployed_objects table accessible");
        console.log("   Data count:", data?.length || 0);
      }
    } catch (err) {
      console.log("❌ deployed_objects exception:", err.message);
    }

    // Test 2: Check ar_qr_codes table
    console.log("\n🔍 Test 2: ar_qr_codes table");
    try {
      const { data, error } = await supabase
        .from("ar_qr_codes")
        .select("id")
        .limit(1);

      if (error) {
        console.log("❌ ar_qr_codes error:", error.message);
        console.log("   Details:", error.details);
        console.log("   Hint:", error.hint);
      } else {
        console.log("✅ ar_qr_codes table accessible");
        console.log("   Data count:", data?.length || 0);
      }
    } catch (err) {
      console.log("❌ ar_qr_codes exception:", err.message);
    }

    // Test 3: List all tables
    console.log("\n🔍 Test 3: Available tables");
    try {
      const { data, error } = await supabase.rpc("get_schema_tables"); // This might not work but worth trying

      if (error) {
        console.log("⚠️ Cannot list tables:", error.message);
      } else {
        console.log("✅ Tables:", data);
      }
    } catch (err) {
      console.log("⚠️ Table listing not available");
    }

    // Test 4: Try creating ar_qr_codes table if it doesn't exist
    console.log("\n🔍 Test 4: Create missing tables");
    try {
      // This will fail gracefully if table exists
      const createQuery = `
        CREATE TABLE IF NOT EXISTS deployed_objects (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name TEXT,
          description TEXT,
          latitude REAL,
          longitude REAL,
          altitude REAL DEFAULT 0,
          object_type TEXT DEFAULT 'agent',
          agent_type TEXT DEFAULT 'intelligent_assistant',
          user_id UUID,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          is_active BOOLEAN DEFAULT true,
          mcp_services JSONB DEFAULT '[]',
          token_address TEXT,
          token_symbol TEXT DEFAULT 'USDT',
          chain_id TEXT DEFAULT '2810',
          deployer_wallet_address TEXT,
          payment_recipient_address TEXT,
          agent_wallet_address TEXT,
          text_chat BOOLEAN DEFAULT true,
          voice_chat BOOLEAN DEFAULT false,
          video_chat BOOLEAN DEFAULT false,
          interaction_fee REAL DEFAULT 1.0,
          features JSONB DEFAULT '[]',
          fee_usdt REAL,
          fee_usdc REAL,
          fee_usds REAL,
          interaction_fee_usdfc REAL,
          interaction_range REAL DEFAULT 50.0,
          currency_type TEXT DEFAULT 'USDT',
          network TEXT DEFAULT 'Morph'
        );
        
        ALTER TABLE deployed_objects ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Allow public read access" ON deployed_objects;
        CREATE POLICY "Allow public read access" ON deployed_objects
          FOR SELECT USING (true);
          
        DROP POLICY IF EXISTS "Allow public insert" ON deployed_objects  
        CREATE POLICY "Allow public insert" ON deployed_objects
          FOR INSERT WITH CHECK (true);
      `;

      console.log("🔧 Attempting to ensure deployed_objects table exists...");
      const { error } = await supabase.rpc("exec_sql", { sql: createQuery });

      if (error) {
        console.log("⚠️ Table creation result:", error.message);
      } else {
        console.log("✅ Table creation/verification completed");
      }
    } catch (err) {
      console.log("⚠️ Table creation not possible:", err.message);
    }

    console.log("\n🎯 Summary:");
    console.log(
      "The application should work with mock data if database is not ready."
    );
    console.log(
      "Check the browser console for more detailed runtime information."
    );
  } catch (error) {
    console.error("❌ Test suite failed:", error);
  }
}

runDatabaseTests();
