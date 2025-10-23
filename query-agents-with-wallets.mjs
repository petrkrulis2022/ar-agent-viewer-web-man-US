#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";

// Supabase connection details
const SUPABASE_URL = "https://ncjbwzibnqrbrvicdmec.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jamJ3emlibnFyYnJ2aWNkbWVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUwNDk3OTksImV4cCI6MjA1MDYyNTc5OX0.WLLOgWUTxu7uIWPxCOvYk2m8RVpYDx3FxJqzZ-J7nxU";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function queryAgentsWithWallets() {
  try {
    console.log("🔍 Querying agents with ALL wallet address fields...\n");

    // Query with all wallet-related fields
    const { data, error } = await supabase
      .from("deployed_objects")
      .select(
        `
        id,
        name,
        agent_type,
        agent_wallet_address,
        owner_wallet,
        deployer_wallet_address,
        wallet_address,
        user_id,
        payment_recipient_address,
        deployment_network_name,
        deployment_chain_id,
        created_at
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    console.log(`📊 Total Agents Found: ${data.length}\n`);
    console.log("═══════════════════════════════════════════════════════\n");

    // Analyze wallet field population
    const walletStats = {
      agent_wallet_address: 0,
      owner_wallet: 0,
      deployer_wallet_address: 0,
      wallet_address: 0,
      user_id: 0,
      payment_recipient_address: 0,
      no_wallet: 0,
    };

    data.forEach((agent, index) => {
      console.log(`${index + 1}. ${agent.name} (${agent.agent_type})`);
      console.log(`   ID: ${agent.id}`);
      console.log(`   Network: ${agent.deployment_network_name || "N/A"}`);
      console.log(`   Chain ID: ${agent.deployment_chain_id || "N/A"}`);
      console.log(`   Created: ${agent.created_at}`);
      console.log("\n   💰 WALLET FIELDS:");
      console.log(
        `      agent_wallet_address:     ${
          agent.agent_wallet_address || "❌ NULL"
        }`
      );
      console.log(
        `      owner_wallet:             ${agent.owner_wallet || "❌ NULL"}`
      );
      console.log(
        `      deployer_wallet_address:  ${
          agent.deployer_wallet_address || "❌ NULL"
        }`
      );
      console.log(
        `      wallet_address:           ${agent.wallet_address || "❌ NULL"}`
      );
      console.log(
        `      user_id:                  ${agent.user_id || "❌ NULL"}`
      );
      console.log(
        `      payment_recipient_address: ${
          agent.payment_recipient_address || "❌ NULL"
        }`
      );

      // Update stats
      if (agent.agent_wallet_address) walletStats.agent_wallet_address++;
      if (agent.owner_wallet) walletStats.owner_wallet++;
      if (agent.deployer_wallet_address) walletStats.deployer_wallet_address++;
      if (agent.wallet_address) walletStats.wallet_address++;
      if (agent.user_id) walletStats.user_id++;
      if (agent.payment_recipient_address)
        walletStats.payment_recipient_address++;

      // Check if agent has ANY wallet field
      const hasWallet =
        agent.agent_wallet_address ||
        agent.owner_wallet ||
        agent.deployer_wallet_address ||
        agent.wallet_address ||
        agent.payment_recipient_address;

      if (!hasWallet) {
        walletStats.no_wallet++;
        console.log("\n   ⚠️  NO WALLET ADDRESSES FOUND FOR THIS AGENT!");
      }

      console.log(
        "\n───────────────────────────────────────────────────────\n"
      );
    });

    // Summary statistics
    console.log("═══════════════════════════════════════════════════════");
    console.log("📊 WALLET FIELD POPULATION STATISTICS:\n");
    console.log(
      `   agent_wallet_address:     ${walletStats.agent_wallet_address}/${data.length} agents`
    );
    console.log(
      `   owner_wallet:             ${walletStats.owner_wallet}/${data.length} agents`
    );
    console.log(
      `   deployer_wallet_address:  ${walletStats.deployer_wallet_address}/${data.length} agents`
    );
    console.log(
      `   wallet_address:           ${walletStats.wallet_address}/${data.length} agents`
    );
    console.log(
      `   user_id:                  ${walletStats.user_id}/${data.length} agents`
    );
    console.log(
      `   payment_recipient_address: ${walletStats.payment_recipient_address}/${data.length} agents`
    );
    console.log(
      `\n   ⚠️  Agents with NO wallet:   ${walletStats.no_wallet}/${data.length}`
    );
    console.log("═══════════════════════════════════════════════════════");

    // Show which field is most commonly used
    console.log("\n💡 RECOMMENDATIONS:");
    if (walletStats.agent_wallet_address > 0) {
      console.log(
        `   ✅ Use 'agent_wallet_address' as primary field (${walletStats.agent_wallet_address} agents have it)`
      );
    } else if (walletStats.deployer_wallet_address > 0) {
      console.log(
        `   ⚠️  Use 'deployer_wallet_address' as fallback (${walletStats.deployer_wallet_address} agents have it)`
      );
    } else if (walletStats.owner_wallet > 0) {
      console.log(
        `   ⚠️  Use 'owner_wallet' as fallback (${walletStats.owner_wallet} agents have it)`
      );
    } else if (walletStats.no_wallet === data.length) {
      console.log(
        "   🔴 CRITICAL: NO AGENTS HAVE WALLET ADDRESSES! Need to update deployment flow."
      );
    }
  } catch (error) {
    console.error("❌ Error querying agents:", error.message);
    throw error;
  }
}

// Run the query
queryAgentsWithWallets();
