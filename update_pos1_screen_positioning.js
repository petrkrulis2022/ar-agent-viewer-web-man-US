#!/usr/bin/env node

/**
 * Update POS 1 agent to use screen positioning instead of GPS
 * This places POS 1 at screen coordinates (25%, 50%) - left side center
 * instead of using GPS which was overlapping with POS 2
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function updatePOS1() {
  try {
    console.log("🔄 Updating POS 1 to use screen positioning (25%, 50%)...");

    // Find POS 1 agent
    const { data: pos1, error: findError } = await supabase
      .from("deployed_objects")
      .select("id, name, positioning_mode")
      .ilike("name", "%POS 1%")
      .limit(1);

    if (findError) {
      console.error("❌ Error finding POS 1:", findError);
      return;
    }

    if (!pos1 || pos1.length === 0) {
      console.error("❌ POS 1 agent not found");
      return;
    }

    const agentId = pos1[0].id;
    console.log(`✅ Found POS 1 (ID: ${agentId})`);
    console.log(`   Current positioning_mode: ${pos1[0].positioning_mode}`);

    // Update positioning mode and screen coordinates
    const { data: updated, error: updateError } = await supabase
      .from("deployed_objects")
      .update({
        positioning_mode: "screen",
        screen_position_x: 25, // Left side (25% from left)
        screen_position_y: 50, // Center vertically
      })
      .eq("id", agentId)
      .select();

    if (updateError) {
      console.error("❌ Error updating POS 1:", updateError);
      return;
    }

    console.log("✅ POS 1 updated successfully!");
    console.log(`   New positioning_mode: ${updated[0].positioning_mode}`);
    console.log(
      `   Screen position: (${updated[0].screen_position_x}%, ${updated[0].screen_position_y}%)`,
    );
    console.log(
      "\n🎉 Changes applied! POS 1 will now appear at left-center (25%, 50%)",
    );
    console.log("   POS 2 appears at right-center (74.6%, 56.2%)");
  } catch (err) {
    console.error("❌ Unexpected error:", err);
  }
}

updatePOS1();
