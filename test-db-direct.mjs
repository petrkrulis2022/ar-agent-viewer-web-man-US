import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://vaygtgkqoxkcdjhczaqt.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZheWd0Z2txb3hrY2RqaGN6YXF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM3MzIxNjQsImV4cCI6MjAzOTMwODE2NH0.QGRdl2cN1LJe7eHvPxYzdjgfzGPGZAr7DWRCo48GcsQ"
);

async function testDatabase() {
  console.log("🔍 Testing database connection...");

  // Test basic connection with fee fields
  const { data: basicData, error: basicError } = await supabase
    .from("deployed_objects")
    .select(
      "id, name, interaction_fee_amount, interaction_fee, fee_usdt, fee_usdc"
    )
    .limit(5);

  if (basicError) {
    console.error("❌ Error:", basicError);
    return;
  }

  console.log("✅ Raw data from database:");
  console.log(JSON.stringify(basicData, null, 2));

  // Check column names
  console.log("\n🔍 Checking column existence...");
  const { data: columnData, error: columnError } = await supabase
    .rpc("get_table_columns", { table_name: "deployed_objects" })
    .single();

  if (columnError) {
    console.log("ℹ️ Could not check columns:", columnError.message);
  } else {
    console.log("Columns:", columnData);
  }
}

testDatabase().catch(console.error);
