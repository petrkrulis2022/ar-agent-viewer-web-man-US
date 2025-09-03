// Dynamic Agent Data Validation Utility
// Validates agent data for AgentSphere dynamic deployment integration

import { dynamicQRService } from "./dynamicQRService";

/**
 * Validates agent data completeness for dynamic deployment
 * @param {Object} agent - Agent object from database
 * @returns {Object} Validation results with data source and completeness info
 */
export const validateAgentData = (agent) => {
  const validation = {
    hasLegacyData: !!(agent.chain_id && agent.network && agent.interaction_fee),
    hasDynamicData: !!(
      agent.deployment_chain_id &&
      agent.deployment_network_name &&
      agent.interaction_fee_amount
    ),
    hasPaymentConfig: !!(
      agent.payment_config && agent.payment_config.wallet_address
    ),
    hasWalletAddress: !!(
      agent.wallet_address ||
      agent.payment_config?.wallet_address ||
      agent.deployer_address ||
      agent.payment_recipient_address
    ),
    isComplete: false,
    dataSource: "unknown",
    missingFields: [],
  };

  // Determine data source and completeness
  if (validation.hasDynamicData) {
    validation.dataSource = "dynamic";
    validation.isComplete = !!(
      agent.deployment_chain_id &&
      agent.deployment_network_name &&
      agent.interaction_fee_amount &&
      validation.hasWalletAddress
    );

    // Check for missing dynamic fields
    if (!agent.deployment_chain_id)
      validation.missingFields.push("deployment_chain_id");
    if (!agent.deployment_network_name)
      validation.missingFields.push("deployment_network_name");
    if (!agent.interaction_fee_amount)
      validation.missingFields.push("interaction_fee_amount");
    if (!validation.hasWalletAddress)
      validation.missingFields.push("wallet_address");
  } else if (validation.hasLegacyData) {
    validation.dataSource = "legacy";
    validation.isComplete = !!(
      agent.chain_id &&
      agent.network &&
      agent.interaction_fee &&
      validation.hasWalletAddress
    );

    // Check for missing legacy fields
    if (!agent.chain_id) validation.missingFields.push("chain_id");
    if (!agent.network) validation.missingFields.push("network");
    if (!agent.interaction_fee)
      validation.missingFields.push("interaction_fee");
    if (!validation.hasWalletAddress)
      validation.missingFields.push("wallet_address");
  }

  return validation;
};

/**
 * Validates network compatibility between agent and user
 * @param {Object} agent - Agent object from database
 * @param {Object} userNetwork - User's current network info
 * @returns {Object} Compatibility results with required actions
 */
export const validateNetworkCompatibility = (agent, userNetwork) => {
  // Use dynamic deployment data with fallback to legacy
  const agentChainId = agent.deployment_chain_id || agent.chain_id;
  const agentNetworkName = agent.deployment_network_name || agent.network;

  if (!agentChainId) {
    return {
      compatible: false,
      message: "Agent deployment network information is missing",
      severity: "error",
      action: "contact_support",
    };
  }

  if (agentChainId !== userNetwork.chainId) {
    return {
      compatible: false,
      message: `This agent is deployed on ${agentNetworkName} (Chain ${agentChainId}). Please switch to this network to interact.`,
      severity: "warning",
      action: "switch_network",
      requiredNetwork: {
        chainId: agentChainId,
        name: agentNetworkName,
        rpcUrl: agent.payment_config?.network_info?.rpcUrl,
      },
      userNetwork: {
        chainId: userNetwork.chainId,
        name: userNetwork.name,
      },
    };
  }

  return {
    compatible: true,
    message: `Networks compatible: ${agentNetworkName}`,
    severity: "success",
    action: "proceed",
  };
};

/**
 * Gets comprehensive agent payment configuration with dynamic data support
 * @param {Object} agent - Agent object from database
 * @returns {Object} Normalized payment configuration
 */
export const getAgentPaymentConfig = (agent) => {
  const validation = validateAgentData(agent);

  return {
    // Use dynamic fields with fallback to legacy
    chainId: agent.deployment_chain_id || agent.chain_id,
    networkName: agent.deployment_network_name || agent.network,
    interactionFee: agent.interaction_fee_amount || agent.interaction_fee,
    feeToken: agent.interaction_fee_token || agent.currency_type || "USDC",

    // Wallet addresses (prioritize payment config)
    walletAddress:
      agent.payment_config?.wallet_address ||
      agent.wallet_address ||
      agent.deployer_address ||
      agent.payment_recipient_address,

    // Token and network info
    tokenAddress: agent.token_address,
    networkConfig: agent.payment_config?.network_info,

    // Metadata
    supportedTokens: agent.payment_config?.supported_tokens || [
      agent.interaction_fee_token || agent.currency_type || "USDC",
    ],
    deploymentStatus: agent.deployment_status || "active",
    deployedAt: agent.deployed_at || agent.created_at,

    // Data source tracking
    isUsingDynamicData: validation.hasDynamicData,
    dataSource: validation.dataSource,
    dataCompleteness: validation,

    // Enhanced features
    hasNetworkConfig: !!agent.payment_config?.network_info,
    supportsMultipleTokens: !!(
      agent.payment_config?.supported_tokens &&
      agent.payment_config.supported_tokens.length > 1
    ),

    // Migration status
    needsUpgrade:
      validation.dataSource === "legacy" && !validation.hasDynamicData,
  };
};

/**
 * Analyzes a collection of agents for data migration insights
 * @param {Array} agents - Array of agent objects
 * @returns {Object} Analysis results and recommendations
 */
export const analyzeAgentDataMigration = (agents) => {
  if (!agents || agents.length === 0) {
    return {
      totalAgents: 0,
      analysis: "No agents found",
      recommendations: ["Deploy some agents to analyze data structure"],
    };
  }

  const analysis = {
    totalAgents: agents.length,
    withDynamicData: 0,
    withLegacyData: 0,
    withIncompleteData: 0,
    withPaymentConfig: 0,
    uniqueNetworks: new Set(),
    uniqueTokens: new Set(),
    recommendations: [],
  };

  agents.forEach((agent) => {
    const validation = validateAgentData(agent);

    if (validation.hasDynamicData) {
      analysis.withDynamicData++;
    } else if (validation.hasLegacyData) {
      analysis.withLegacyData++;
    } else {
      analysis.withIncompleteData++;
    }

    if (validation.hasPaymentConfig) {
      analysis.withPaymentConfig++;
    }

    // Track networks and tokens
    const config = getAgentPaymentConfig(agent);
    if (config.networkName) analysis.uniqueNetworks.add(config.networkName);
    if (config.feeToken) analysis.uniqueTokens.add(config.feeToken);
  });

  // Convert sets to arrays for serialization
  analysis.uniqueNetworks = Array.from(analysis.uniqueNetworks);
  analysis.uniqueTokens = Array.from(analysis.uniqueTokens);

  // Generate recommendations
  if (analysis.withLegacyData > 0) {
    analysis.recommendations.push(
      `${analysis.withLegacyData} agents using legacy data structure - consider migration to dynamic deployment fields`
    );
  }

  if (analysis.withIncompleteData > 0) {
    analysis.recommendations.push(
      `${analysis.withIncompleteData} agents have incomplete payment configuration`
    );
  }

  if (analysis.withDynamicData > 0) {
    analysis.recommendations.push(
      `${analysis.withDynamicData} agents already using dynamic deployment data - ready for enhanced features`
    );
  }

  if (analysis.uniqueNetworks.length > 1) {
    analysis.recommendations.push(
      `Multi-network deployment detected (${analysis.uniqueNetworks.length} networks) - ensure network switching is properly configured`
    );
  }

  return analysis;
};

/**
 * Tests QR generation with both legacy and dynamic data
 * @param {Object} agent - Agent object to test
 * @returns {Promise<Object>} Test results
 */
export const testDynamicQRGeneration = async (agent) => {
  const results = {
    agentId: agent.id,
    agentName: agent.name,
    dataValidation: validateAgentData(agent),
    paymentConfig: getAgentPaymentConfig(agent),
    qrGenerationTest: null,
    errors: [],
  };

  try {
    // Test QR generation with dynamic service
    const qrData = await dynamicQRService.generateDynamicQR(agent, 1);

    results.qrGenerationTest = {
      success: true,
      qrCodeGenerated: !!qrData.qrCodeUrl,
      networkDetected: qrData.networkInfo?.name,
      paymentAmount: qrData.tokenInfo?.amount,
      paymentToken: qrData.tokenInfo?.symbol,
      recipientAddress: qrData.recipientAddress,
      usingDynamicData: qrData.agentInfo?.hasDynamicData,
    };
  } catch (error) {
    results.qrGenerationTest = {
      success: false,
      error: error.message,
    };
    results.errors.push(`QR Generation: ${error.message}`);
  }

  return results;
};

/**
 * Enhanced agent data query selector for Supabase
 * Returns SQL selector string that includes both legacy and dynamic fields
 */
export const getEnhancedAgentDataSelector = () => {
  return `
    id,
    name,
    description,
    latitude,
    longitude,
    altitude,
    object_type,
    agent_type,
    user_id,
    created_at,
    is_active,
    
    /* Legacy payment fields (for backward compatibility) */
    token_address,
    token_symbol,
    chain_id,
    deployer_wallet_address,
    payment_recipient_address,
    agent_wallet_address,
    interaction_fee,
    interaction_fee_usdfc,
    currency_type,
    network,
    
    /* Dynamic deployment fields (when available) */
    deployment_network_name,
    deployment_chain_id,
    deployment_network_id,
    interaction_fee_amount,
    interaction_fee_token,
    payment_config,
    deployer_address,
    deployed_at,
    deployment_status,
    
    /* Communication and features */
    text_chat,
    voice_chat,
    video_chat,
    interaction_range,
    mcp_services,
    features
  `;
};

/**
 * Logs detailed agent data analysis for debugging
 * @param {Array} agents - Array of agent objects
 */
export const logAgentDataAnalysis = (agents) => {
  console.log("🔍 Agent Data Analysis:");

  const analysis = analyzeAgentDataMigration(agents);

  console.log(`📊 Total Agents: ${analysis.totalAgents}`);
  console.log(`🆕 With Dynamic Data: ${analysis.withDynamicData}`);
  console.log(`📋 With Legacy Data: ${analysis.withLegacyData}`);
  console.log(`⚠️ With Incomplete Data: ${analysis.withIncompleteData}`);
  console.log(`💳 With Payment Config: ${analysis.withPaymentConfig}`);
  console.log(`🌐 Networks: ${analysis.uniqueNetworks.join(", ")}`);
  console.log(`💰 Tokens: ${analysis.uniqueTokens.join(", ")}`);

  if (analysis.recommendations.length > 0) {
    console.log("💡 Recommendations:");
    analysis.recommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec}`);
    });
  }

  return analysis;
};

export default {
  validateAgentData,
  validateNetworkCompatibility,
  getAgentPaymentConfig,
  analyzeAgentDataMigration,
  testDynamicQRGeneration,
  getEnhancedAgentDataSelector,
  logAgentDataAnalysis,
};
