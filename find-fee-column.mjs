import { createClient } from "@supabase/supabase-js";

// Database connection using service role for full access
const supabaseUrl = "https://ncjbwzibnqrbrvicdmec.supabase.co";
const serviceRoleKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jamJ3emlibnFyYnJ2aWNkbWVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTQ3MzMwMCwiZXhwIjoyMDc3MDQ5MzAwfQ.5LiZQFdXgyMnM_HDVW5ZLTGuhF_9xOAbXEJ6yeJ_yTk";

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function findFeeColumn() {
  console.log("🔍 FINDING THE CORRECT FEE COLUMN...\n");

  try {
    // Get one terminal with ALL columns
    const { data, error } = await supabase
      .from("deployed_objects")
      .select("*")
      .eq("id", "39edf8f9-6784-408f-bde7-48c63b0dd3b8")
      .single();

    if (error) {
      console.error("❌ Error:", error);
      return;
    }

    console.log("📋 ALL COLUMNS for 'Trailing Terminal 3 Peter Sepolia':\n");

    // Look for fee-related fields
    const feeFields = Object.keys(data).filter(
      (key) =>
        key.toLowerCase().includes("fee") ||
        key.toLowerCase().includes("amount") ||
        key.toLowerCase().includes("price") ||
        key.toLowerCase().includes("cost")
    );

    console.log("💰 FEE-RELATED FIELDS:");
    feeFields.forEach((field) => {
      console.log(`  ${field}: ${data[field]}`);
    });

    console.log("\n📄 ALL FIELDS:");
    Object.keys(data)
      .sort()
      .forEach((key) => {
        const value = data[key];
        if (value !== null && value !== undefined && value !== "") {
          console.log(`  ${key}: ${JSON.stringify(value).substring(0, 100)}`);
        }
      });
  } catch (err) {
    console.error("❌ Exception:", err);
  }
}

findFeeColumn();
