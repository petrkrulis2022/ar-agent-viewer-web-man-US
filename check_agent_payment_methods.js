import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ncjbwzibnqrbrvicdmec.supabase.co";
const supabaseKey = "sb_publishable_nDOtY1UHyrKCWlu2hU2ueg_fRRYs0hA";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAgent() {
  const { data, error } = await supabase
    .from("deployed_objects")
    .select("*")
    .eq("id", "f1f922e7-0d26-4c49-8b8f-679a0cf0b67c")
    .single();

  if (error) {
    console.error("Error:", error);
    return;
  }

  console.log("\n=== POS 2 Agent Full Data ===\n");
  console.log("ENS Enabled:", data.ens_payment_enabled);
  console.log("ENS Domain:", data.ens_domain);
  console.log("ENS Resolved:", data.ens_resolved_address);
  console.log(
    "\nPayment Methods:",
    JSON.stringify(data.payment_methods, null, 2),
  );
  console.log(
    "\nPayment Config:",
    JSON.stringify(data.payment_config, null, 2),
  );
}

checkAgent();
