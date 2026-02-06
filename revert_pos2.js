import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

(async () => {
  const { data } = await supabase
    .from("deployed_objects")
    .update({ screen_position_x: 74.6473354231975, screen_position_y: 56.2579403380983 })
    .ilike("name", "%POS 2%")
    .select();
  
  console.log("✅ POS 2 reverted to (74.65%, 56.26%)");
})();
