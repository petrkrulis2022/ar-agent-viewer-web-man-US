# 🔄 AR Viewer: AgentSphere Dynamic Deployment Data Integration Plan

## Project Context

AgentSphere is fixing their data storage to provide **dynamic, accurate deployment data** instead of hardcoded values. AR Viewer needs to ensure it properly consumes and utilizes this dynamic data for QR generation, network validation, and payment processing.

## Data Structure Transition

### **Before (Current - Hardcoded):**

```javascript
{
  interaction_fee_amount: 1.0,                   // Always "1 USDC"
  chain_id: 1043,                               // Wrong/hardcoded "Chain 1043"
  network: "BlockDAG Testnet",                  // Hardcoded network
  currency_type: "USBDG+"                       // Default token
}
```

### **After (AgentSphere Fix - Dynamic):**

```javascript
{
  // NEW: Dynamic Deployment Data
  deployment_network_name: "Ethereum Sepolia",    // Was: "BlockDAG Testnet"
  deployment_chain_id: 11155111,                  // Was: 1043
  deployment_network_id: 11155111,

  // NEW: Dynamic Payment Data
  interaction_fee_amount: 10.0,                   // Was: 1.0
  interaction_fee_token: "USDC",

  // NEW: Complete Payment Configuration
  payment_config: {
    wallet_address: "0x...fF8a",                 // Agent's wallet
    supported_tokens: ["USDC"],
    network_info: {
      name: "Ethereum Sepolia",
      chainId: 11155111,
      rpcUrl: "https://sepolia.infura.io"
    }
  },

  // Deployment Metadata
  deployer_address: "0x...fF8a",
  deployed_at: "2024-01-15T10:30:00Z",
  deployment_status: "active"
}
```

## Implementation Strategy

### ✅ **Phase 1: No Display Changes Required**

AR Viewer already displays agent data correctly through the existing component structure. The display logic will automatically show correct data once AgentSphere provides proper dynamic values.

**Current Implementation Status:**

- ✅ Agent cards display `agent.interaction_fee` and `agent.currency_type`
- ✅ Network info shown through `agent.network` and `agent.chain_id`
- ✅ Payment routing uses `agent.wallet_address` or `agent.payment_config.wallet_address`

### 🔄 **Phase 2: Update Dynamic QR Service**

The `dynamicQRService.js` needs updates to read the new dynamic fields:

```javascript
// UPDATE: Enhanced Dynamic QR Generation
async generateDynamicQR(agentData, amountUSD = null) {
  try {
    // 1. Use dynamic deployment data (NEW)
    const deploymentChainId = agentData.deployment_chain_id || agentData.chain_id;
    const deploymentNetwork = agentData.deployment_network_name || agentData.network;

    // 2. Use dynamic interaction fee (NEW)
    const interactionFee = amountUSD || agentData.interaction_fee_amount || agentData.interaction_fee;
    const feeToken = agentData.interaction_fee_token || agentData.currency_type;

    // 3. Use dynamic wallet address (NEW)
    const recipientAddress = agentData.payment_config?.wallet_address ||
                            agentData.wallet_address ||
                            agentData.deployer_address;

    // 4. Use dynamic network configuration (NEW)
    const networkInfo = agentData.payment_config?.network_info || {
      name: deploymentNetwork,
      chainId: deploymentChainId,
      rpcUrl: this.getNetworkRPC(deploymentChainId)
    };

    console.log("🌐 Using dynamic deployment data:");
    console.log("- Network:", deploymentNetwork);
    console.log("- Chain ID:", deploymentChainId);
    console.log("- Fee:", interactionFee, feeToken);
    console.log("- Recipient:", recipientAddress);

    // Continue with existing QR generation logic...
  }
}
```

### 🔄 **Phase 3: Update Agent Data Fetching**

Ensure AR Viewer fetches the complete agent data including new dynamic fields:

```javascript
// UPDATE: Enhanced Agent Data Query
const fetchAgentData = async (agentId) => {
  const { data, error } = await supabase
    .from("deployed_objects")
    .select(
      `
      id, name, description, agent_type,
      latitude, longitude, altitude,
      
      // Legacy fields (for backward compatibility)
      interaction_fee, currency_type, network, chain_id,
      wallet_address, token_address,
      
      // NEW: Dynamic deployment fields
      deployment_network_name, deployment_chain_id, deployment_network_id,
      interaction_fee_amount, interaction_fee_token,
      payment_config, deployer_address, deployed_at, deployment_status,
      
      // Additional fields
      text_chat, voice_chat, video_chat, is_active, created_at
    `
    )
    .eq("id", agentId)
    .single();

  if (error) throw error;

  // Log dynamic data verification
  console.log("Agent dynamic deployment data:", {
    network: data.deployment_network_name || data.network,
    chainId: data.deployment_chain_id || data.chain_id,
    fee: `${data.interaction_fee_amount || data.interaction_fee} ${
      data.interaction_fee_token || data.currency_type
    }`,
    wallet: data.payment_config?.wallet_address || data.wallet_address,
  });

  return data;
};
```

### 🔄 **Phase 4: Network Validation Enhancement**

Update network compatibility validation to use dynamic data:

```javascript
// UPDATE: Dynamic Network Validation
const validateNetworkCompatibility = (agent, userNetwork) => {
  // Use dynamic deployment data with fallback to legacy
  const agentChainId = agent.deployment_chain_id || agent.chain_id;
  const agentNetworkName = agent.deployment_network_name || agent.network;

  if (agentChainId !== userNetwork.chainId) {
    return {
      compatible: false,
      message: `This agent is deployed on ${agentNetworkName} (Chain ${agentChainId}). Please switch to this network to interact.`,
      requiredNetwork: {
        chainId: agentChainId,
        name: agentNetworkName,
        rpcUrl: agent.payment_config?.network_info?.rpcUrl,
      },
    };
  }

  return { compatible: true };
};
```

### 🔄 **Phase 5: Update EVM Configuration**

Enhance the existing `evmTestnets.js` to support dynamic network detection:

```javascript
// UPDATE: Dynamic Network Configuration
export const getDynamicNetworkConfig = (agent) => {
  // Use dynamic deployment data
  const chainId = agent.deployment_chain_id || agent.chain_id;
  const networkName = agent.deployment_network_name || agent.network;
  const rpcUrl = agent.payment_config?.network_info?.rpcUrl;

  // Check if it's a known network
  const knownNetwork = EVM_TESTNETS.find((net) => net.chainId === chainId);

  if (knownNetwork) {
    return {
      ...knownNetwork,
      // Override with dynamic data if available
      name: networkName || knownNetwork.name,
      rpcUrl: rpcUrl || knownNetwork.rpcUrl,
    };
  }

  // Create dynamic network config for unknown networks
  return {
    chainId: chainId,
    name: networkName,
    rpcUrl: rpcUrl || `https://rpc-${chainId}.example.com`,
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    blockExplorer: `https://explorer-${chainId}.example.com`,
    isTestnet: true,
    isDynamic: true, // Flag for dynamic networks
  };
};
```

## Backward Compatibility Strategy

### 🔒 **Safe Migration Approach**

```javascript
// SAFE: Gradual migration with fallbacks
const getAgentPaymentData = (agent) => {
  return {
    // Use new fields with fallback to legacy
    chainId: agent.deployment_chain_id || agent.chain_id,
    networkName: agent.deployment_network_name || agent.network,
    interactionFee: agent.interaction_fee_amount || agent.interaction_fee,
    feeToken: agent.interaction_fee_token || agent.currency_type,
    walletAddress:
      agent.payment_config?.wallet_address ||
      agent.wallet_address ||
      agent.deployer_address,

    // Preserve existing functionality
    tokenAddress: agent.token_address,
    networkConfig: agent.payment_config?.network_info,
  };
};
```

### 🧪 **Testing Validation**

```javascript
// Testing function to validate dynamic data
export const validateDynamicAgentData = (agent) => {
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
    isComplete: false,
  };

  // Check if agent has sufficient data for payments
  const paymentData = getAgentPaymentData(agent);
  validation.isComplete = !!(
    paymentData.chainId &&
    paymentData.networkName &&
    paymentData.interactionFee &&
    paymentData.walletAddress
  );

  return validation;
};
```

## Expected Data Flow

### **1. AgentSphere Deployment**

```
User deploys agent → AgentSphere stores dynamic data → Database updated
```

### **2. AR Viewer Integration**

```
AR Viewer fetches agent → Reads dynamic data → Generates QR with actual values
```

### **3. Payment Processing**

```
User scans QR → Uses actual network → Pays actual fee → To actual wallet
```

## Testing Verification Checklist

When AgentSphere dynamic data is live, verify:

- [ ] ✅ **Correct Interaction Fee**: Shows actual deployed amount (e.g., 10 USDC, not 1 USDC)
- [ ] ✅ **Correct Chain ID**: Shows actual deployment chain (e.g., 11155111, not 1043)
- [ ] ✅ **Correct Network Name**: Shows actual network (e.g., "Ethereum Sepolia", not "BlockDAG")
- [ ] ✅ **Correct Wallet Address**: Shows deployer's actual wallet address
- [ ] ✅ **Complete Payment Config**: Uses network info and supported tokens
- [ ] ✅ **Dynamic QR Generation**: QR codes use actual deployment data
- [ ] ✅ **Network Validation**: Correctly validates user's network against agent's deployment network

## Implementation Files to Update

### **Core Service Updates:**

1. `src/services/dynamicQRService.js` - Use dynamic deployment fields
2. `src/services/networkDetectionService.js` - Support dynamic network configs
3. `src/config/evmTestnets.js` - Add dynamic network configuration function

### **Component Updates (Optional):**

1. `src/components/AgentCard.jsx` - Display dynamic network/fee info
2. `src/components/PaymentQRModal.jsx` - Use dynamic payment data
3. `src/components/NetworkValidation.jsx` - Validate against dynamic networks

### **Database Integration:**

1. `src/lib/supabase.js` - Update queries to fetch new dynamic fields
2. Add validation for dynamic data completeness

## Conclusion

AR Viewer is already well-architected to handle dynamic deployment data. The main updates needed are:

1. **Update data fetching** to include new dynamic fields
2. **Enhance QR generation** to use dynamic values instead of hardcoded ones
3. **Add fallback logic** for backward compatibility
4. **Implement validation** to ensure data completeness

The existing display components will automatically show correct information once they receive the proper dynamic data from AgentSphere.

**No breaking changes are required** - this is purely an enhancement to use dynamic data instead of hardcoded values.
