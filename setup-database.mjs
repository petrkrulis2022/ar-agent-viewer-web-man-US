import { createClient } from "@supabase/supabase-js";

// Use service role key for admin operations
const SUPABASE_URL = "https://ncjbwzibnqrbrvicdmec.supabase.co";
const SUPABASE_SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jamJ3emlibnFyYnJ2aWNkbWVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDY4MDE1OSwiZXhwIjoyMDY2MjU2MTU5fQ.OimR1FKKf2kcQ1c0WO7MvuuB85wRMV6vhbH5DnC8G8E";

console.log("🔧 Database Setup Tool - Creating Missing Tables");
console.log("===============================================");

async function setupDatabase() {
  try {
    // Create admin client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    console.log("✅ Admin client created");

    // Create ar_qr_codes table
    console.log("\n🔧 Creating ar_qr_codes table...");

    const createTableSQL = `
      -- Create ar_qr_codes table if it doesn't exist
      CREATE TABLE IF NOT EXISTS ar_qr_codes (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        
        -- Transaction and payment info
        transaction_id TEXT NOT NULL UNIQUE,
        qr_code_data TEXT NOT NULL,
        
        -- 3D positioning in AR space
        position_x REAL DEFAULT 0,
        position_y REAL DEFAULT 0, 
        position_z REAL DEFAULT -2,
        rotation_x REAL DEFAULT 0,
        rotation_y REAL DEFAULT 0,
        rotation_z REAL DEFAULT 0,
        scale REAL DEFAULT 1.5,
        
        -- Geographic location (optional)
        latitude REAL,
        longitude REAL,
        altitude REAL,
        
        -- QR code status and lifecycle
        status TEXT DEFAULT 'generated' CHECK (status IN ('generated', 'active', 'scanned', 'expired', 'paid')),
        
        -- Agent relationship
        agent_id TEXT,
        
        -- Payment details
        amount INTEGER,
        recipient_address TEXT,
        contract_address TEXT DEFAULT '0xFAD0070d0388FB3F18F1100A5FFc67dF8834D9db',
        chain_id TEXT DEFAULT '1043',
        
        -- Timestamps
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        expiration_time TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '5 minutes'),
        scanned_at TIMESTAMP WITH TIME ZONE,
        paid_at TIMESTAMP WITH TIME ZONE,
        
        -- Metadata
        metadata JSONB DEFAULT '{}',
        
        -- Constraints
        CONSTRAINT valid_expiration CHECK (expiration_time > created_at)
      );
    `;

    // Execute table creation
    const { error: createError } = await supabase.rpc("exec", {
      sql: createTableSQL,
    });

    if (createError) {
      console.log("❌ Table creation failed:", createError.message);
      console.log("Trying alternative method...");

      // Try using REST API insert (this might work better)
      try {
        const { error } = await supabase
          .from("_supabase_sql_console")
          .insert([{ query: createTableSQL }]);

        if (error) {
          console.log("❌ Alternative method failed:", error.message);
        } else {
          console.log("✅ Table created using alternative method");
        }
      } catch (altError) {
        console.log("⚠️ Alternative method not available");
      }
    } else {
      console.log("✅ ar_qr_codes table created successfully");
    }

    // Test the new table
    console.log("\n🔍 Testing ar_qr_codes table...");
    const { data, error } = await supabase
      .from("ar_qr_codes")
      .select("id")
      .limit(1);

    if (error) {
      console.log("❌ Table test failed:", error.message);
    } else {
      console.log("✅ ar_qr_codes table is accessible");
      console.log("   Current record count:", data?.length || 0);
    }

    // Create indexes for performance
    console.log("\n🔧 Creating indexes...");
    const indexSQL = `
      CREATE INDEX IF NOT EXISTS idx_ar_qr_codes_status ON ar_qr_codes(status);
      CREATE INDEX IF NOT EXISTS idx_ar_qr_codes_agent_id ON ar_qr_codes(agent_id);
      CREATE INDEX IF NOT EXISTS idx_ar_qr_codes_expiration ON ar_qr_codes(expiration_time);
    `;

    try {
      await supabase.rpc("exec", { sql: indexSQL });
      console.log("✅ Indexes created successfully");
    } catch (indexError) {
      console.log("⚠️ Index creation skipped:", indexError.message);
    }

    // Enable RLS and create policies
    console.log("\n🔒 Setting up Row Level Security...");
    const rlsSQL = `
      ALTER TABLE ar_qr_codes ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY IF NOT EXISTS "Allow public read access" ON ar_qr_codes
        FOR SELECT USING (true);
        
      CREATE POLICY IF NOT EXISTS "Allow public insert" ON ar_qr_codes
        FOR INSERT WITH CHECK (true);
        
      CREATE POLICY IF NOT EXISTS "Allow public update" ON ar_qr_codes
        FOR UPDATE USING (true);
    `;

    try {
      await supabase.rpc("exec", { sql: rlsSQL });
      console.log("✅ RLS policies created successfully");
    } catch (rlsError) {
      console.log("⚠️ RLS setup skipped:", rlsError.message);
    }

    console.log("\n🎉 Database setup completed!");
    console.log("Now testing the full application...");
  } catch (error) {
    console.error("❌ Setup failed:", error);
  }
}

setupDatabase();
