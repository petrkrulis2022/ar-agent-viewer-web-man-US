import { createClient } from "@supabase/supabase-js";

// Database connection using service role for full access
const supabaseUrl = "https://ncjbwzibnqrbrvicdmec.supabase.co";
const serviceRoleKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jamJ3emlibnFyYnJ2aWNkbWVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTQ3MzMwMCwiZXhwIjoyMDc3MDQ5MzAwfQ.5LiZQFdXgyMnM_HDVW5ZLTGuhF_9xOAbXEJ6yeJ_yTk";

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function listPaymentTerminals() {
  console.log("🔍 LISTING PAYMENT TERMINALS...\n");
  console.log("Wallet: 0x6ef27e391c7eac228c26300aa92187382cc7ff8a\n");

  try {
    const { data: terminals, error } = await supabase
      .from("deployed_objects")
      .select(
        `
        id,
        name,
        object_type,
        interaction_fee,
        token,
        agent_wallet_address,
        created_at
      `
      )
      .in("object_type", ["payment_terminal", "Trailing Payment Terminal"])
      .ilike(
        "agent_wallet_address",
        "0x6ef27e391c7eac228c26300aa92187382cc7ff8a"
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error:", error);
      return;
    }

    if (!terminals || terminals.length === 0) {
      console.log("⚠️ No payment terminals found for this wallet.");
      return;
    }

    console.log(`✅ Found ${terminals.length} payment terminal(s):\n`);

    terminals.forEach((terminal, index) => {
      console.log(`${index + 1}. ${terminal.name}`);
      console.log(`   ID: ${terminal.id}`);
      console.log(`   Type: ${terminal.object_type}`);
      console.log(`   Fee: ${terminal.interaction_fee || "N/A"}`);
      console.log(`   Token: ${terminal.token || "N/A"}`);
      console.log(
        `   Created: ${new Date(terminal.created_at).toLocaleString()}`
      );
      console.log("");
    });
  } catch (err) {
    console.error("❌ Exception:", err);
  }
}

listPaymentTerminals();
