import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

(async () => {
  const { data } = await supabase
    .from("deployed_objects")
    .update({ screen_position_x: 85, screen_position_y: 50 })
    .ilike("name", "%POS 2%")
    .select();
  
  console.log("✅ POS 2 moved to (85%, 50%)");
})();
