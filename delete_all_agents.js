import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ncjbwzibnqrbrvicdmec.supabase.co";
const supabaseKey = "sb_publishable_nDOtY1UHyrKCWlu2hU2ueg_fRRYs0hA";

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteAllAgents() {
  console.log(
    "\n⚠️  WARNING: This will delete ALL agents from the database!\n",
  );

  // First, count agents
  const { count, error: countError } = await supabase
    .from("deployed_objects")
    .select("*", { count: "exact", head: true });

  if (countError) {
    console.error("Error counting agents:", countError);
    return;
  }

  console.log(`Found ${count} agents to delete.`);

  // Delete all
  const { error: deleteError } = await supabase
    .from("deployed_objects")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000"); // Match all (dummy condition)

  if (deleteError) {
    console.error("Error deleting agents:", deleteError);
    return;
  }

  console.log(`✅ Successfully deleted all ${count} agents!\n`);
}

deleteAllAgents();
