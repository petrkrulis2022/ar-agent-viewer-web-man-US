import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ncjbwzibnqrbrvicdmec.supabase.co";
const supabaseKey = "sb_publishable_nDOtY1UHyrKCWlu2hU2ueg_fRRYs0hA";

const supabase = createClient(supabaseUrl, supabaseKey);

async function addENSColumns() {
  console.log("🔧 Adding ENS columns to deployed_objects table...\n");

  const { data, error } = await supabase.rpc("exec_sql", {
    sql: `
      -- Add ENS payment columns to deployed_objects table
      ALTER TABLE deployed_objects
      ADD COLUMN IF NOT EXISTS ens_payment_enabled BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS ens_domain TEXT,
      ADD COLUMN IF NOT EXISTS ens_address TEXT,
      ADD COLUMN IF NOT EXISTS ens_resolved_address TEXT,
      ADD COLUMN IF NOT EXISTS ens_resolver_network TEXT DEFAULT 'mainnet',
      ADD COLUMN IF NOT EXISTS ens_avatar_url TEXT;

      -- Create indexes for performance
      CREATE INDEX IF NOT EXISTS idx_deployed_objects_ens_enabled ON deployed_objects(ens_payment_enabled);
      CREATE INDEX IF NOT EXISTS idx_deployed_objects_ens_domain ON deployed_objects(ens_domain);
    `,
  });

  if (error) {
    console.error("❌ Error adding columns:", error);
    console.log("\n📋 Please run this SQL manually in Supabase SQL Editor:\n");
    console.log(`
ALTER TABLE deployed_objects
ADD COLUMN IF NOT EXISTS ens_payment_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ens_domain TEXT,
ADD COLUMN IF NOT EXISTS ens_address TEXT,
ADD COLUMN IF NOT EXISTS ens_resolved_address TEXT,
ADD COLUMN IF NOT EXISTS ens_resolver_network TEXT DEFAULT 'mainnet',
ADD COLUMN IF NOT EXISTS ens_avatar_url TEXT;

CREATE INDEX IF NOT EXISTS idx_deployed_objects_ens_enabled ON deployed_objects(ens_payment_enabled);
CREATE INDEX IF NOT EXISTS idx_deployed_objects_ens_domain ON deployed_objects(ens_domain);
    `);
    return;
  }

  console.log("✅ ENS columns added successfully!\n");
}

addENSColumns();
