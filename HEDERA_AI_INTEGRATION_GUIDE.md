# Hedera AI Agent Integration Guide - AR Viewer

**Date:** November 20, 2025  
**Branch:** `revolut-qr-payments-sim-dynamimic-online-payments-solana-hedera-ai`  
**Purpose:** Enable AR Viewer to interact with Hedera AI agents for travel planning

---

## 🎯 Overview

This integration enables the AR Viewer to:

1. **Discover** agents deployed via Agentsphere
2. **Communicate** with agents via WebSockets (chat, voice, video)
3. **Pay** multiple agents in one transaction using USDh stablecoin on Hedera

### Architecture

```
User (AR Viewer)
    ↓ discovers agents
Agentsphere API
    ↓ returns nearby agents
AR Viewer selects agent
    ↓ WebSocket connection
Agent Service (Bus/Train/Hotel)
    ↓ A2A communication with other agents
Multiple Agents collaborate
    ↓ return journey plan with cost breakdown
AR Viewer executes payment
    ↓ multi-transfer transaction
Hedera Network (USDh transfers)
```

---

## 📦 Installed Components

### Hedera Repositories (in `/tools`)

1. **A2A** - Agent-to-Agent communication protocol

   - Path: `tools/A2A/`
   - Used by: Backend agents for inter-agent communication

2. **erc-8004-contracts** - Agent identity contracts

   - Path: `tools/erc-8004-contracts/`
   - Used by: Agentsphere to mint agent identity NFTs

3. **x402-hedera** - x402 payment protocol

   - Path: `tools/x402-hedera/`
   - Used by: Agents to pay for external data services

4. **tutorial-a2a-x402-trustless-agent** - Reference implementation
   - Path: `tools/tutorial-a2a-x402-trustless-agent/`
   - Used by: Development reference

### NPM Packages

```bash
@hashgraph/sdk  # Hedera JavaScript SDK for transactions
dotenv          # Environment variable management
```

---

## 🔧 Services Implemented

### 1. Agent Discovery Service

**File:** `src/services/agentDiscoveryService.js`

```javascript
import {
  discoverAgents,
  getAgentDetails,
  getAgentsByType,
} from "@/services/agentDiscoveryService";

// Find agents near user's location
const agents = await discoverAgents(latitude, longitude, radiusMeters);

// Get specific agent
const agent = await getAgentDetails(agentId);

// Get agents by type
const busAgents = await getAgentsByType("bus", lat, lon);
```

**API Endpoints (hosted on Agentsphere):**

- `GET /api/agents/discover?lat={lat}&lon={lon}&radius={radius}`
- `GET /api/agents/{agentId}`
- `GET /api/agents/type/{type}?lat={lat}&lon={lon}`

### 2. Agent Communication Service

**File:** `src/services/agentCommunicationService.js`

```javascript
import { createAgentCommunication } from "@/services/agentCommunicationService";

// Create communication instance
const comm = createAgentCommunication(agent.serviceUrl);

// Connect to agent
await comm.connect();

// Listen for messages
comm.on("chat_response", (payload) => {
  console.log("Agent said:", payload.text);
});

comm.on("final_plan", (payload) => {
  console.log("Journey plan:", payload);
});

// Send messages
comm.sendChatMessage("How do I get to the airport?");
comm.requestJourneyPlan({ from: "London", to: "Paris" });

// Disconnect
comm.disconnect();
```

### 3. Hedera Payment Service

**File:** `src/services/hederaPaymentService.js`

```javascript
import {
  handlePaymentWithWallet,
  formatPaymentSummary,
  getTransactionExplorerUrl,
} from "@/services/hederaPaymentService";

// Payment breakdown from agents
const costBreakdown = [
  { agent: "Bus Agent", accountId: "0.0.12345", amount: 5.5 },
  { agent: "Train Agent", accountId: "0.0.67890", amount: 10.0 },
  { agent: "Hotel Agent", accountId: "0.0.11111", amount: 50.0 },
];

// Execute payment
const result = await handlePaymentWithWallet(costBreakdown, walletProvider);

if (result.success) {
  const url = getTransactionExplorerUrl(result.transactionId);
  console.log("View transaction:", url);
}
```

---

## 🌐 Environment Configuration

### `.env` File

```bash
# Hedera Configuration
VITE_HEDERA_NETWORK=testnet
VITE_HEDERA_USDH_TOKEN_ID=0.0.7218375
VITE_HEDERA_OPERATOR_ID=            # Optional: for backend operations
VITE_HEDERA_OPERATOR_KEY=           # Optional: for backend operations

# Agentsphere API
VITE_AGENTSPHERE_API_URL=http://localhost:3001
```

### Vite Config Updates

Added Hedera SDK to optimized dependencies:

```javascript
optimizeDeps: {
  include: [
    "@solana/web3.js",
    "@solana/spl-token",
    "@hashgraph/sdk",  // Added
    "buffer"
  ],
  // ... polyfills
}
```

---

## 💡 Usage Example

See `src/components/AgentInteractionExample.jsx` for a complete example.

### Basic Flow

```javascript
// 1. Discover agents
const agents = await discoverAgents(51.5074, -0.1278, 5000);

// 2. Connect to agent
const comm = createAgentCommunication(agents[0].serviceUrl);
await comm.connect();

// 3. Request journey
comm.on("final_plan", async (plan) => {
  // 4. Pay for journey
  const result = await handlePaymentWithWallet(
    plan.costBreakdown,
    walletProvider
  );

  console.log("Payment:", result.transactionId);
});

comm.requestJourneyPlan({
  from: "London",
  to: "Paris",
  departureTime: new Date().toISOString(),
});
```

---

## 🔐 Wallet Integration

### Supported Wallets

- **HashPack** (Recommended)
- **Blade Wallet**
- **Kabila**

### HashPack Integration

```javascript
// Connect wallet
const hashpack = window.hashpack;
await hashpack.connectToLocalWallet();

// Use in payment
const result = await handlePaymentWithWallet(costBreakdown, {
  accountId: hashpack.accountId,
  signTransaction: (tx) => hashpack.signTransaction(tx),
  sendTransaction: (tx) => hashpack.sendTransaction(tx),
});
```

---

## 🚀 Agent Types & Use Cases

### Bus Agent

- **Type:** `bus`
- **Service:** Local bus route planning
- **Fee:** 2-5 USDh
- **Features:**
  - Real-time bus schedules
  - Route optimization
  - Connection to train/metro agents

### Train Agent

- **Type:** `train`
- **Service:** Train ticket booking and schedules
- **Fee:** 5-10 USDh
- **Features:**
  - Cross-city route planning
  - A2A communication with bus/hotel agents
  - x402 payments for timetable APIs

### Hotel Agent

- **Type:** `hotel`
- **Service:** Accommodation booking
- **Fee:** 10-20 USDh
- **Features:**
  - Hotel availability checks
  - x402 payments for booking APIs
  - Integration with journey planning

---

## 🔄 Multi-Agent Journey Flow

```
1. User taps Bus Agent in AR view
2. Bus Agent connects via WebSocket
3. User: "I need to get from London to Paris"
4. Bus Agent analyzes request
5. Bus Agent contacts Train Agent (A2A)
6. Train Agent contacts Hotel Agent (A2A)
7. Hotel Agent queries booking API (x402 payment)
8. All agents collaborate on plan
9. Final plan sent to user:
   - Bus: London → Heathrow (5 USDh)
   - Train: Heathrow → Paris CDG (10 USDh)
   - Hotel: Paris center (50 USDh)
   - Total: 65 USDh
10. User approves payment
11. Single Hedera transaction pays all 3 agents
12. Journey confirmed
```

---

## 📊 Transaction Structure

### Multi-Transfer Example

```javascript
// Hedera transaction
TransferTransaction {
  tokenId: "0.0.7218375" (USDh),
  transfers: [
    // Debit from user
    { account: "0.0.USER", amount: -65.00 },

    // Credits to agents
    { account: "0.0.BUS",   amount: +5.00 },
    { account: "0.0.TRAIN", amount: +10.00 },
    { account: "0.0.HOTEL", amount: +50.00 }
  ],
  memo: "AgentSphere Journey Payment"
}
```

### Transaction ID Format

`{seconds}.{nanoseconds}@{shard}.{realm}.{num}`  
Example: `1732104567.123456789@0.0.800`

### View on HashScan

`https://hashscan.io/testnet/transaction/{transactionId}`

---

## 🧪 Testing

### Local Testing Setup

1. **Start Agentsphere Backend** (port 3001)

   ```bash
   cd agentsphere-full-web-man-US
   npm run dev
   ```

2. **Start AR Viewer** (port 5173)

   ```bash
   cd ar-agent-viewer-web-man-US
   npm run dev
   ```

3. **Deploy Test Agents** via Agentsphere UI

   - Bus Agent at location A
   - Train Agent at location B
   - Hotel Agent at location C

4. **Test in AR Viewer**
   - Open `http://localhost:5173`
   - Allow camera access
   - Discover agents
   - Tap agent to interact
   - Request journey
   - Execute payment

### Test Accounts

Get testnet accounts from: https://portal.hedera.com/

Example:

```
Account ID: 0.0.xxxxxxx
Private Key: 302e020100300506032b657004220420...
```

Fund with testnet HBAR and USDh.

---

## 🛠️ Next Steps

### For AR Viewer Team

1. ✅ **Agent Discovery UI**

   - Integrate `discoverAgents()` into AR scene
   - Display agents as 3D objects in AR
   - Show distance and agent type

2. ✅ **Chat Interface**

   - Add chat modal when agent is tapped
   - Implement voice recording
   - Add video call support

3. ⏳ **Payment Flow**

   - Integrate wallet connection UI
   - Show payment breakdown clearly
   - Add transaction confirmation

4. ⏳ **Journey Visualization**
   - Display route on map
   - Show timeline of journey legs
   - Highlight costs per segment

### For Agentsphere Team

1. ⏳ **Agent Deployment**

   - Implement ERC-8004 identity minting
   - Create agent accounts with USDh
   - Deploy agent microservices

2. ⏳ **A2A Communication**

   - Set up A2A protocol listeners
   - Implement inter-agent messaging
   - Handle concurrent requests

3. ⏳ **x402 Integration**

   - Connect to external APIs
   - Implement x402 payment flow
   - Track agent spending

4. ⏳ **MCP Server Integration**
   - Evaluate Hedera HTS MCP server
   - Determine if agents can sign on user's behalf
   - Implement if viable

---

## 📚 Resources

### Hedera Documentation

- [Hedera AI Studio](https://docs.hedera.com/hedera/open-source-solutions/ai-studio-on-hedera)
- [Hedera AI Agent Kit](https://docs.hedera.com/hedera/open-source-solutions/ai-studio-on-hedera/hedera-ai-agent-kit)
- [Hedera SDK Reference](https://docs.hedera.com/hedera/sdks-and-apis/sdks)

### GitHub Repositories

- [A2A Protocol](https://github.com/a2aproject/A2A)
- [ERC-8004 Contracts](https://github.com/hedera-dev/erc-8004-contracts)
- [x402 Hedera](https://github.com/hedera-dev/x402-hedera)
- [Tutorial Reference](https://github.com/hedera-dev/tutorial-a2a-x402-trustless-agent)
- [Hedera HTS MCP](https://github.com/hedera-dev/hts-mcp-server)

### Blog Posts

- [Deep Dive: Hedera Agent Kit](https://hedera.com/blog/deep-dive-into-the-hedera-agent-kit-plugins-tools-and-practical-workflows)
- [A2A Plugins & Tools](https://github.com/a2aproject/A2A-agent-kit-plugins-tools-and-practical-workflows)

---

## 🐛 Troubleshooting

### "Wallet not connected"

- Ensure HashPack/Blade is installed
- Click "Connect Wallet" before payment
- Check wallet network (must be testnet)

### "Agent not responding"

- Check Agentsphere backend is running
- Verify agent service URL is correct
- Check WebSocket connection in DevTools

### "Transaction failed"

- Ensure sufficient USDh balance
- Check all agent account IDs are valid
- Verify token association

### "Cannot find agents"

- Check Agentsphere API URL in `.env`
- Verify agents are deployed
- Check location coordinates

---

## 📝 Summary

### What We Built

✅ **Agent Discovery Service** - Find nearby agents  
✅ **Agent Communication Service** - Chat, voice, video with agents  
✅ **Hedera Payment Service** - Multi-transfer USDh payments  
✅ **Example Integration** - Complete usage example  
✅ **Hedera SDK Integration** - Browser-compatible setup  
✅ **Environment Configuration** - USDh token, testnet setup

### What's Next

The AR Viewer is now ready to:

1. Discover agents deployed via Agentsphere
2. Communicate with agents for journey planning
3. Pay multiple agents in a single Hedera transaction

Next phase requires Agentsphere team to:

1. Deploy agents with A2A listeners
2. Implement agent identity (ERC-8004)
3. Set up x402 for external data payments

---

**Status:** ✅ AR Viewer integration complete  
**Ready for:** Agentsphere agent deployment  
**Last Updated:** November 20, 2025
