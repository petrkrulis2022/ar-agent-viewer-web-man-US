import { createClient } from "@supabase/supabase-js";

// Database connection using service role for full access
const supabaseUrl = "https://ncjbwzibnqrbrvicdmec.supabase.co";
const serviceRoleKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jamJ3emlibnFyYnJ2aWNkbWVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDY4MDE1OSwiZXhwIjoyMDY2MjU2MTU5fQ.OimR1FKKf2kcQ1c0WO7MvuuB85wRMV6vhbH5DnC8G8E";

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function updateTerminalFees() {
  console.log("🔧 UPDATING PAYMENT TERMINAL FEES FOR HACKATHON DEMO...\n");

  try {
    // 1. Update Payment Terminal - Peter - Sepolia to 162 USD (E-shop)
    console.log(
      "1️⃣ Updating 'Payment Terminal - Peter - Sepolia' to 162 USD..."
    );
    const { data: data1, error: error1 } = await supabase
      .from("deployed_objects")
      .update({
        interaction_fee_amount: 162,
        interaction_fee: 162,
        interaction_fee_usdfc: 162,
      })
      .eq("id", "fbf6d253-2b63-42e5-b56f-d534e7b353eb")
      .select();

    if (error1) {
      console.error("❌ Error updating terminal 1:", error1);
    } else {
      console.log("✅ Updated successfully!");
      console.log(`   Name: ${data1[0]?.name}`);
      console.log(`   New Fee: ${data1[0]?.interaction_fee_amount} USD\n`);
    }

    // 2. Update Payment Terminal 2 Peter - Sepolia to 528 USD (Crypto on-ramp)
    console.log(
      "2️⃣ Updating 'Payment Terminal 2 Peter - Sepolia' to 528 USD..."
    );
    const { data: data2, error: error2 } = await supabase
      .from("deployed_objects")
      .update({
        interaction_fee_amount: 528,
        interaction_fee: 528,
        interaction_fee_usdfc: 528,
      })
      .eq("id", "64df84fc-c40c-43c8-b1e1-16428fc8b3ad")
      .select();

    if (error2) {
      console.error("❌ Error updating terminal 2:", error2);
    } else {
      console.log("✅ Updated successfully!");
      console.log(`   Name: ${data2[0]?.name}`);
      console.log(`   New Fee: ${data2[0]?.interaction_fee_amount} USD\n`);
    }

    // 3. Update Trailing Terminal 3 Peter Sepolia to 6.50 USD (Bus ticket)
    console.log(
      "3️⃣ Updating 'Trailing Terminal 3 Peter Sepolia' to 6.50 USD..."
    );
    const { data: data3, error: error3 } = await supabase
      .from("deployed_objects")
      .update({
        interaction_fee_amount: 6.5,
        interaction_fee: 6.5,
        interaction_fee_usdfc: 6.5,
      })
      .eq("id", "39edf8f9-6784-408f-bde7-48c63b0dd3b8")
      .select();

    if (error3) {
      console.error("❌ Error updating terminal 3:", error3);
    } else {
      console.log("✅ Updated successfully!");
      console.log(`   Name: ${data3[0]?.name}`);
      console.log(`   New Fee: ${data3[0]?.interaction_fee} USD\n`);
    }

    // 4. Verify all updates
    console.log("═══════════════════════════════════════");
    console.log("📋 VERIFICATION - All Payment Terminals:");
    console.log("═══════════════════════════════════════\n");

    const { data: allTerminals, error: verifyError } = await supabase
      .from("deployed_objects")
      .select("id, name, object_type, interaction_fee_amount, token")
      .in("object_type", ["payment_terminal", "trailing_payment_terminal"])
      .ilike(
        "agent_wallet_address",
        "0x6ef27e391c7eac228c26300aa92187382cc7ff8a"
      )
      .order("created_at", { ascending: false });

    if (verifyError) {
      console.error("❌ Error verifying:", verifyError);
    } else {
      allTerminals.forEach((terminal, index) => {
        const emoji = terminal.interaction_fee_amount > 1 ? "✅" : "⚠️";
        console.log(`${emoji} ${terminal.name}`);
        console.log(`   Fee: ${terminal.interaction_fee_amount} USD`);
        console.log(`   Type: ${terminal.object_type}`);
        console.log("");
      });
    }

    console.log("═══════════════════════════════════════");
    console.log("🎉 HACKATHON DEMO SETUP COMPLETE!");
    console.log("═══════════════════════════════════════");
    console.log("Demo Scenarios:");
    console.log("  💳 E-shop Payment: 162 USD");
    console.log("  💰 Crypto On-ramp: 528 USD (500 + 28 fees)");
    console.log("  🚌 Bus Ticket: 6.50 USD");
    console.log("═══════════════════════════════════════");
  } catch (err) {
    console.error("❌ Exception:", err);
  }
}

updateTerminalFees();
