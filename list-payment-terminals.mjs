import { createClient } from "@supabase/supabase-js";

// Configuration
const SUPABASE_URL = "https://ncjbwzibnqrbrvicdmec.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jamJ3emlibnFyYnJ2aWNkbWVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2ODAxNTksImV4cCI6MjA2NjI1NjE1OX0.R7rx4jOPt9oOafcyJr3x-nEvGk5-e4DP7MbfCVOCHHI";

const WALLET_ADDRESS = "0x6ef27E391c7eac228c26300aA92187382cc7fF8a";

console.log("💳 Payment Terminals Query");
console.log("=========================");
console.log(`Wallet: ${WALLET_ADDRESS}\n`);

async function listPaymentTerminals() {
  try {
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });

    // Query payment terminals for this wallet
    const { data, error } = await supabase
      .from("deployed_objects")
      .select("*")
      .ilike("agent_wallet_address", WALLET_ADDRESS)
      .eq("agent_type", "Payment Terminal");

    if (error) {
      console.error("❌ Database error:", error.message);
      console.error("   Details:", error);
      return;
    }

    if (!data || data.length === 0) {
      console.log("⚠️  No payment terminals found for this wallet");
      return;
    }

    console.log(`✅ Found ${data.length} payment terminal(s):\n`);

    data.forEach((terminal, index) => {
      console.log(`\n${index + 1}. ${terminal.name || "Unnamed Terminal"}`);
      console.log(`   ID: ${terminal.id}`);
      console.log(`   Agent Type: ${terminal.agent_type}`);
      console.log(`   Wallet: ${terminal.agent_wallet_address}`);
      console.log(`   Network: ${terminal.network || "N/A"}`);
      console.log(`   Status: ${terminal.status || "N/A"}`);
      console.log(`   Created: ${terminal.created_at || "N/A"}`);

      // Show position if available
      if (
        terminal.position_x !== null &&
        terminal.position_y !== null &&
        terminal.position_z !== null
      ) {
        console.log(
          `   Position: (${terminal.position_x}, ${terminal.position_y}, ${terminal.position_z})`
        );
      }

      // Show QR code info if available
      if (terminal.qr_code_id) {
        console.log(`   QR Code ID: ${terminal.qr_code_id}`);
      }

      console.log("   ---");
    });

    console.log(`\n📊 Summary:`);
    console.log(`   Total terminals: ${data.length}`);
    console.log(`   Wallet address: ${WALLET_ADDRESS}`);
  } catch (error) {
    console.error("❌ Exception:", error.message);
    console.error(error);
  }
}

// Run the query
listPaymentTerminals();
