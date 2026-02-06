require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
);

async function deletePOS1() {
  try {
    console.log("🗑️  Deleting POS 1 agent (terminal_id: 36568B62)...\n");

    // Delete by terminal_id
    const { data, error } = await supabase
      .from("deployed_objects")
      .delete()
      .eq("terminal_id", "36568B62");

    if (error) throw error;

    console.log("✅ POS 1 agent deleted successfully!");
    console.log("📊 You can now deploy a fresh POS 1 agent.\n");
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

deletePOS1();
