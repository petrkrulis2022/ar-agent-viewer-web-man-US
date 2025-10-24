import { createClient } from "@supabase/supabase-js";

// Configuration
const SUPABASE_URL = "https://ncjbwzibnqrbrvicdmec.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jamJ3emlibnFyYnJ2aWNkbWVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2ODAxNTksImV4cCI6MjA2NjI1NjE1OX0.R7rx4jOPt9oOafcyJr3x-nEvGk5-e4DP7MbfCVOCHHI";

console.log("💳 All Payment Terminals Query");
console.log("==============================\n");

async function listAllPaymentTerminals() {
  try {
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });

    // Query ALL payment terminals
    const { data, error } = await supabase
      .from("deployed_objects")
      .select("*")
      .eq("agent_type", "Payment Terminal")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Database error:", error.message);
      console.error("   Details:", error);
      return;
    }

    if (!data || data.length === 0) {
      console.log("⚠️  No payment terminals found in database");
      return;
    }

    console.log(`✅ Found ${data.length} payment terminal(s) total:\n`);

    // Group by wallet address
    const byWallet = {};
    data.forEach((terminal) => {
      const wallet = terminal.agent_wallet_address || "No wallet";
      if (!byWallet[wallet]) {
        byWallet[wallet] = [];
      }
      byWallet[wallet].push(terminal);
    });

    // Display grouped by wallet
    Object.entries(byWallet).forEach(([wallet, terminals]) => {
      console.log(`\n📍 Wallet: ${wallet}`);
      console.log(`   Count: ${terminals.length} terminal(s)\n`);

      terminals.forEach((terminal, index) => {
        console.log(`   ${index + 1}. ${terminal.name || "Unnamed Terminal"}`);
        console.log(`      ID: ${terminal.id}`);
        console.log(`      Network: ${terminal.network || "N/A"}`);
        console.log(`      Status: ${terminal.status || "N/A"}`);
        console.log(
          `      Created: ${new Date(terminal.created_at).toLocaleString()}`
        );
        if (terminal.qr_code_id) {
          console.log(`      QR Code ID: ${terminal.qr_code_id}`);
        }
        console.log("");
      });
    });

    console.log(`\n📊 Summary:`);
    console.log(`   Total terminals: ${data.length}`);
    console.log(`   Unique wallets: ${Object.keys(byWallet).length}`);
    console.log(`\n   Wallets with terminals:`);
    Object.entries(byWallet).forEach(([wallet, terminals]) => {
      console.log(`   - ${wallet}: ${terminals.length} terminal(s)`);
    });
  } catch (error) {
    console.error("❌ Exception:", error.message);
    console.error(error);
  }
}

// Run the query
listAllPaymentTerminals();
