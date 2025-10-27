// Test script to verify Debug agent modal data
import { supabase } from "./src/lib/supabase.js";

async function testDebugAgentData() {
  console.log("🧪 Testing Debug Agent Payment Modal Data\n");

  if (!supabase) {
    console.log("❌ Supabase not configured");
    return;
  }

  try {
    console.log("🔍 Querying database for Debug agent...");
    const { data, error } = await supabase
      .from("deployed_objects")
      .select(
        `
        name, 
        chain_id, 
        network, 
        interaction_fee_amount, 
        interaction_fee_token, 
        interaction_fee_usdfc, 
        interaction_fee
      `
      )
      .ilike("name", "%Debug%")
      .limit(1);

    if (error) {
      console.log("❌ Database error:", error.message);
      return;
    }

    if (!data || data.length === 0) {
      console.log("⚠️ No Debug agent found in database");
      return;
    }

    const agent = data[0];
    console.log("✅ Database query successful!\n");
    console.log("📊 Raw agent data:");
    console.log(JSON.stringify(agent, null, 2));

    // Test the getServiceFeeDisplay logic
    console.log("\n🔧 Testing fee priority logic:");

    let fee = 1; // fallback
    let token = "USDC";
    let source = "fallback";

    // PRIORITY 1: interaction_fee_amount (authoritative field for new deployments)
    if (
      agent?.interaction_fee_amount !== undefined &&
      agent?.interaction_fee_amount !== null &&
      !isNaN(agent?.interaction_fee_amount) &&
      agent?.interaction_fee_amount > 0
    ) {
      fee = parseFloat(agent.interaction_fee_amount);
      token = agent?.interaction_fee_token || "USDC";
      source = "interaction_fee_amount";
    }
    // PRIORITY 2: interaction_fee_usdfc (legacy field)
    else if (
      agent?.interaction_fee_usdfc !== undefined &&
      agent?.interaction_fee_usdfc !== null &&
      !isNaN(agent?.interaction_fee_usdfc) &&
      agent?.interaction_fee_usdfc > 0
    ) {
      fee = parseFloat(agent.interaction_fee_usdfc);
      token = "USDC";
      source = "interaction_fee_usdfc";
    }
    // PRIORITY 3: interaction_fee (fallback legacy field)
    else if (
      agent?.interaction_fee !== undefined &&
      agent?.interaction_fee !== null &&
      !isNaN(agent?.interaction_fee) &&
      agent?.interaction_fee > 0
    ) {
      fee = parseFloat(agent.interaction_fee);
      token = "USDC";
      source = "interaction_fee";
    }

    console.log(`✅ Final fee display: ${fee} ${token}`);
    console.log(`📍 Fee source: ${source}`);
    console.log(`🌐 Network: ${agent.network} (Chain ID: ${agent.chain_id})`);

    // Expected vs Actual comparison
    console.log("\n📋 EXPECTED vs ACTUAL:");
    console.log("Expected: 12 USDC from interaction_fee_amount field");
    console.log(`Actual:   ${fee} ${token} from ${source} field`);

    if (fee === 12 && token === "USDC" && source === "interaction_fee_amount") {
      console.log("🎉 SUCCESS: Modal should display correct fee!");
    } else {
      console.log("❌ ISSUE: Fee logic needs adjustment");
    }

    console.log("\n🚀 Next Step: Test the payment modal in the web interface");
    console.log("   1. Go to http://localhost:5173/");
    console.log("   2. Find the Debug agent");
    console.log("   3. Click it and check the Payment tab");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

// Run the test
testDebugAgentData();
