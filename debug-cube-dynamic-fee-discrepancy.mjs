import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log("❌ Supabase environment variables not found");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Reproduce the modal fee logic
const getModalFeeDisplay = (agent) => {
  let fee = 1; // fallback
  let token = "USDC";
  let source = "fallback";

  // PRIORITY 1: interaction_fee_amount (authoritative field)
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

  return { fee, token, source, display: `${fee} ${token}` };
};

// Reproduce the card fee logic (AgentCard.jsx)
const getCardFeeDisplay = (agent) => {
  const payment_config = agent.payment_config || {};

  const feeAmount =
    payment_config?.interaction_fee_amount ??
    agent.interaction_fee_amount ??
    agent.fee_usdc ?? // Non-existent field!
    agent.fee_usdt ?? // Non-existent field!
    agent.interaction_fee;

  const feeToken =
    payment_config?.interaction_fee_token ||
    payment_config?.payment_token ||
    agent.interaction_fee_token ||
    agent.currency_type ||
    (agent.fee_usdc ? "USDC" : agent.fee_usdt ? "USDT" : "");

  return {
    feeAmount,
    feeToken,
    display: `${feeAmount} ${feeToken}`,
    debugInfo: {
      payment_config_fee: payment_config?.interaction_fee_amount,
      agent_fee_amount: agent.interaction_fee_amount,
      agent_fee_usdc: agent.fee_usdc,
      agent_fee_usdt: agent.fee_usdt,
      agent_interaction_fee: agent.interaction_fee,
    },
  };
};

// Reproduce the modern card fee logic
const getModernCardFeeDisplay = (agent) => {
  const amount =
    agent?.interaction_fee_amount ||
    agent?.fee_usdc || // Non-existent field!
    agent?.fee_usdt || // Non-existent field!
    1; // Hardcoded fallback!

  const token = agent?.token_symbol || "USDC";

  return {
    amount,
    token,
    display: `${amount} ${token}`,
    debugInfo: {
      interaction_fee_amount: agent?.interaction_fee_amount,
      fee_usdc: agent?.fee_usdc,
      fee_usdt: agent?.fee_usdt,
      token_symbol: agent?.token_symbol,
    },
  };
};

console.log("🔍 Testing fee display logic for Cube Dynamic 1...");

try {
  const { data, error } = await supabase
    .from("deployed_objects")
    .select("*")
    .ilike("name", "%Cube Dynamic 1%")
    .limit(1);

  if (error) {
    console.log("❌ Database error:", error.message);
    process.exit(1);
  }

  if (data.length === 0) {
    console.log("❌ No Cube Dynamic 1 agent found");
    process.exit(1);
  }

  const agent = data[0];

  console.log("\n=== AGENT DATA ===");
  console.log("Name:", agent.name);
  console.log("interaction_fee_amount:", agent.interaction_fee_amount);
  console.log("interaction_fee_usdfc:", agent.interaction_fee_usdfc);
  console.log("interaction_fee:", agent.interaction_fee);
  console.log("interaction_fee_token:", agent.interaction_fee_token);
  console.log("fee_usdc:", agent.fee_usdc, "(should be undefined)");
  console.log("fee_usdt:", agent.fee_usdt, "(should be undefined)");
  console.log("token_symbol:", agent.token_symbol);
  console.log("payment_config:", agent.payment_config);

  console.log("\n=== MODAL FEE DISPLAY (AgentInteractionModal.jsx) ===");
  const modalResult = getModalFeeDisplay(agent);
  console.log("Display:", modalResult.display);
  console.log("Source:", modalResult.source);
  console.log("Details:", modalResult);

  console.log("\n=== CARD FEE DISPLAY (AgentCard.jsx) ===");
  const cardResult = getCardFeeDisplay(agent);
  console.log("Display:", cardResult.display);
  console.log("Debug Info:", cardResult.debugInfo);

  console.log("\n=== MODERN CARD FEE DISPLAY (ModernAgentCard.jsx) ===");
  const modernCardResult = getModernCardFeeDisplay(agent);
  console.log("Display:", modernCardResult.display);
  console.log("Debug Info:", modernCardResult.debugInfo);

  console.log("\n=== DISCREPANCY ANALYSIS ===");
  console.log("Modal shows:", modalResult.display);
  console.log("Card shows:", cardResult.display);
  console.log("Modern Card shows:", modernCardResult.display);

  if (modalResult.display !== cardResult.display) {
    console.log("🔴 DISCREPANCY FOUND between Modal and Card!");
  }
  if (modalResult.display !== modernCardResult.display) {
    console.log("🔴 DISCREPANCY FOUND between Modal and Modern Card!");
  }
} catch (err) {
  console.log("❌ Error:", err.message);
}
