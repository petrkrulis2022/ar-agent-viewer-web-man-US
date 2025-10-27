import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log("🔍 Checking all AR objects in database...");
console.log(`URL: ${supabaseUrl}`);
console.log(`Key format: ${supabaseKey?.substring(0, 20)}...`);

const supabase = createClient(supabaseUrl, supabaseKey);

try {
  // Get ALL objects without limit
  const { data, error, count } = await supabase
    .from("deployed_objects")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Error fetching objects:", error);
    process.exit(1);
  }

  console.log(`\n📊 Total objects in database: ${count}`);
  console.log(`📋 Retrieved objects: ${data?.length || 0}`);

  if (data && data.length > 0) {
    console.log("\n🗂️ All AR Objects:");
    data.forEach((obj, index) => {
      console.log(
        `${index + 1}. ${obj.name || "Unnamed"} (ID: ${obj.id.substring(
          0,
          8
        )}...)`
      );
      console.log(
        `   Type: ${obj.object_type || "N/A"} | Network: ${
          obj.network || "N/A"
        }`
      );
      console.log(
        `   Active: ${
          obj.is_active !== false ? "✅" : "❌"
        } | Created: ${obj.created_at?.substring(0, 10)}`
      );
      console.log("");
    });

    // Check for inactive objects
    const inactive = data.filter((obj) => obj.is_active === false);
    if (inactive.length > 0) {
      console.log(`⚠️  Found ${inactive.length} inactive objects`);
    }

    // Check different networks
    const networks = [
      ...new Set(data.map((obj) => obj.network).filter(Boolean)),
    ];
    console.log(
      `🌐 Networks found: ${networks.join(", ") || "None specified"}`
    );
  }
} catch (err) {
  console.error("💥 Unexpected error:", err);
}
