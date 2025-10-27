import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY; // Use service role to see all tables

console.log("🔍 Checking database schema...");
console.log(`URL: ${supabaseUrl}`);

const supabase = createClient(supabaseUrl, supabaseKey);

try {
  // Get all tables in the public schema
  const { data: tables, error: tablesError } = await supabase
    .from("information_schema.tables")
    .select("table_name")
    .eq("table_schema", "public")
    .eq("table_type", "BASE TABLE");

  if (tablesError) {
    console.error("❌ Error fetching tables:", tablesError);

    // Try alternative approach - list common table names
    const commonTables = [
      "agents",
      "ar_agents",
      "ar_objects",
      "cube_agents",
      "objects",
      "deployments",
    ];
    console.log("\n🔍 Trying common table names...");

    for (const tableName of commonTables) {
      try {
        const { data, error, count } = await supabase
          .from(tableName)
          .select("*", { count: "exact" })
          .limit(1);

        if (!error) {
          console.log(`✅ Found table: ${tableName} (${count} records)`);

          if (count > 0 && data && data.length > 0) {
            console.log(
              `   Sample columns: ${Object.keys(data[0])
                .slice(0, 5)
                .join(", ")}...`
            );
          }
        }
      } catch (e) {
        // Silent fail for non-existent tables
      }
    }
    process.exit(1);
  }

  console.log(`\n📊 Found ${tables?.length || 0} tables:`);
  if (tables) {
    tables.forEach((table) => {
      console.log(`📋 ${table.table_name}`);
    });

    // Check each table for records
    console.log("\n🔍 Checking record counts...");
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table.table_name)
          .select("*", { count: "exact", head: true });

        if (!error && count !== null) {
          console.log(`📊 ${table.table_name}: ${count} records`);
        }
      } catch (e) {
        // Some tables might not be accessible
      }
    }
  }
} catch (err) {
  console.error("💥 Unexpected error:", err);
}
