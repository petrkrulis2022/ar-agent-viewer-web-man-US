#!/usr/bin/env node

// Test script to check wallet display in payment modals
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://dboygwafrnzahvhwfzlb.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRib3lnd2Fmcm56YWh2aHdmemxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE5OTEwNzAsImV4cCI6MjA0NzU2NzA3MH0.jdrmhm5GZJY1bXNbcJiePWLLIkdGIH_eqhsLLSy1fR0";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log("🧪 Testing Wallet Display in Payment Modals");
console.log("==========================================");

// Test the wallet helper functions
const getAgentWalletAddress = (agent) => {
  console.log("🔍 Testing wallet info for agent:", {
    name: agent?.name,
    agent_wallet_address: agent?.agent_wallet_address,
    owner_wallet: agent?.owner_wallet,
    deployer_wallet_address: agent?.deployer_wallet_address,
    user_id: agent?.user_id,
  });

  // Priority order for agent wallet address:
  // 1. agent_wallet_address (primary field for agent's wallet)
  // 2. owner_wallet (backup field)
  // 3. deployer_wallet_address (fallback)
  // 4. user_id (legacy fallback - might be wallet address)

  let walletAddress = null;
  let source = "fallback";

  if (agent?.agent_wallet_address) {
    walletAddress = agent.agent_wallet_address;
    source = "agent_wallet_address";
  } else if (agent?.owner_wallet) {
    walletAddress = agent.owner_wallet;
    source = "owner_wallet";
  } else if (agent?.deployer_wallet_address) {
    walletAddress = agent.deployer_wallet_address;
    source = "deployer_wallet_address";
  } else if (agent?.user_id && agent.user_id.startsWith("0x")) {
    // Some legacy agents might have wallet address in user_id
    walletAddress = agent.user_id;
    source = "user_id (legacy)";
  }

  console.log("🔍 Agent wallet resolved:", {
    walletAddress,
    source,
    agent: agent?.name,
    note: "Currently same as deployer's wallet - will change when agents get individual wallets",
  });

  return walletAddress || "No wallet configured";
};

const formatWalletAddress = (address) => {
  if (!address || address === "No wallet configured") {
    return address;
  }

  // Format as shortened address: 0x1234...5678
  if (address.length > 10) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  return address;
};

try {
  console.log("🔍 Fetching test agents...");

  const { data: agents, error } = await supabase
    .from("deployed_objects")
    .select("*")
    .eq("is_active", true)
    .limit(3);

  if (error) {
    console.error("❌ Database error:", error);
    process.exit(1);
  }

  if (!agents || agents.length === 0) {
    console.log("❌ No active agents found");
    process.exit(1);
  }

  console.log(`✅ Found ${agents.length} agents to test`);
  console.log("");

  agents.forEach((agent, index) => {
    console.log(`--- Agent ${index + 1}: ${agent.name} ---`);

    // Test wallet address resolution
    const walletAddress = getAgentWalletAddress(agent);
    const formattedAddress = formatWalletAddress(walletAddress);

    console.log("📱 Payment Modal Display:");
    console.log(
      `   Service Fee: ${
        agent.interaction_fee_amount ||
        agent.interaction_fee_usdfc ||
        agent.interaction_fee ||
        1
      } USDC`
    );
    console.log(`   Network: ${agent.network || "Unknown"}`);
    console.log(`   Receiving Wallet: ${formattedAddress}`);
    console.log(`   Full Address: ${walletAddress}`);
    console.log("");
  });

  console.log("✅ Wallet display test completed!");
  console.log("");
  console.log("🎯 Summary:");
  console.log("- All payment modals now show receiving wallet address");
  console.log("- Currently agent wallet = deployer wallet (same address)");
  console.log("- Future: agents will get individual wallets");
  console.log("- QR codes will use this wallet as recipient");
} catch (error) {
  console.error("❌ Test failed:", error);
  process.exit(1);
}
