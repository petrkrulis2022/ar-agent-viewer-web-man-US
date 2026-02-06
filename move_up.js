import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

(async () => {
  // Move POS 1 up: 25%, 50% → 25%, 30%
  await supabase
    .from("deployed_objects")
    .update({ screen_position_x: 25, screen_position_y: 30 })
    .ilike("name", "%POS 1%");

  // Move POS 2 up: 74.65%, 56.26% → 74.65%, 35%
  await supabase
    .from("deployed_objects")
    .update({ screen_position_x: 74.6473354231975, screen_position_y: 35 })
    .ilike("name", "%POS 2%");
  
  console.log("✅ POS 1 moved to (25%, 30%)");
  console.log("✅ POS 2 moved to (74.65%, 35%)");
})();
