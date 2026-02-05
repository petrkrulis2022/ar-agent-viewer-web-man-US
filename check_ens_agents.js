import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ncjbwzibnqrbrvicdmec.supabase.co";
const supabaseKey = "sb_publishable_nDOtY1UHyrKCWlu2hU2ueg_fRRYs0hA";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkENSAgents() {
  // First check what columns exist
  const { data: allData, error: allError } = await supabase
    .from("deployed_objects")
    .select("*")
    .limit(1);

  if (allError) {
    console.error("Error getting columns:", allError);
    return;
  }

  console.log("\n=== Available columns ===");
  if (allData && allData.length > 0) {
    console.log(Object.keys(allData[0]).join(", "));
  }

  // Now get all agents
  const { data, error } = await supabase
    .from("deployed_objects")
    .select("id, name")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Error:", error);
    return;
  }

  console.log("\n=== All Agents ===\n");
  data.forEach((agent) => {
    console.log(`ID: ${agent.id} - Name: ${agent.name}`);
  });
  console.log(`\nTotal: ${data.length} agents`);
}

checkENSAgents();
