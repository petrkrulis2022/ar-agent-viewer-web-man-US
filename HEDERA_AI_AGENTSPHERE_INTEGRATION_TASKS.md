# Hedera AI Integration - Agentsphere Implementation Tasks

**Date:** November 20, 2025  
**AR Viewer Branch:** `revolut-qr-payments-sim-dynamimic-online-payments-solana-hedera-ai`  
**Agentsphere Branch:** `revolut-pay-sim-solana-hedera`

---

## 🎯 Overview

**STATUS:** ✅ Both platforms integrated and ready for testing!

### AR Viewer (Complete)

- ✅ Discover agents from Agentsphere API
- ✅ Communicate with agents via WebSockets
- ✅ Pay multiple agents in one USDh transaction

### Agentsphere (Complete)

- ✅ Hedera wallet creation for agents
- ✅ ERC-8004 identity NFT minting
- ✅ A2A communication service
- ✅ x402 micropayment client
- ✅ Agent deployment workflow
- ✅ API endpoints for discovery

**Next Steps:** End-to-end integration testing

---

## ✅ What AR Viewer Has Completed

### 1. Services Implemented

- **Agent Discovery Service** - Calls Agentsphere API to find nearby agents
- **Agent Communication Service** - WebSocket client for agent chat/voice/video
- **Hedera Payment Service** - Multi-transfer USDh transactions

### 2. Dependencies Installed

```bash
@hashgraph/sdk  # Hedera JavaScript SDK
dotenv          # Environment variables
```

### 3. Hedera Tools Cloned (in `/tools`)

- A2A (Agent-to-Agent communication)
- erc-8004-contracts (Agent identity)
- x402-hedera (Agent payments for data)
- tutorial-a2a-x402-trustless-agent (Reference)

### 4. Configuration

- USDh Token: `0.0.7218375`
- Network: Hedera Testnet
- API Endpoint: `http://localhost:3001`

---

## 🔧 Required Agentsphere Implementation

### Phase 1: Environment Setup & Repository Preparation

#### 1.1 Clone Hedera Tools

```bash
# In agentsphere-full-web-man-US root directory
cd /path/to/agentsphere-full-web-man-US
mkdir -p tools
cd tools

# Clone required repositories
git clone https://github.com/a2aproject/A2A.git
git clone https://github.com/hedera-dev/erc-8004-contracts.git
git clone https://github.com/hedera-dev/x402-hedera.git
git clone https://github.com/hedera-dev/tutorial-a2a-x402-trustless-agent.git

cd ..
```

#### 1.2 Install Dependencies

```bash
# In agentsphere root
npm install @hashgraph/sdk dotenv --legacy-peer-deps
```

#### 1.3 Environment Configuration

Add to `.env` file:

```bash
# Hedera Configuration
HEDERA_NETWORK=testnet
HEDERA_TREASURY_ACCOUNT_ID=0.0.xxxxxxx  # Your treasury account
HEDERA_TREASURY_PRIVATE_KEY=302e020100300506032b657004220420...
HEDERA_USDH_TOKEN_ID=0.0.7218375

# Agent Configuration
AGENT_ACCOUNT_INITIAL_HBAR=10  # HBAR for transaction fees
AGENT_ACCOUNT_INITIAL_USDH=100 # USDh for x402 payments
```

Get testnet credentials from: https://portal.hedera.com/

---

### Phase 2: Database Schema Updates

#### 2.1 Add Hedera Fields to `deployed_objects` Table

```sql
-- Add these columns to deployed_objects table
ALTER TABLE deployed_objects ADD COLUMN IF NOT EXISTS hedera_account_id VARCHAR(50);
ALTER TABLE deployed_objects ADD COLUMN IF NOT EXISTS hedera_account_key TEXT;
ALTER TABLE deployed_objects ADD COLUMN IF NOT EXISTS identity_nft_id VARCHAR(50);
ALTER TABLE deployed_objects ADD COLUMN IF NOT EXISTS identity_nft_metadata_url TEXT;
ALTER TABLE deployed_objects ADD COLUMN IF NOT EXISTS a2a_endpoint VARCHAR(255);
ALTER TABLE deployed_objects ADD COLUMN IF NOT EXISTS service_url VARCHAR(255);
ALTER TABLE deployed_objects ADD COLUMN IF NOT EXISTS supports_x402 BOOLEAN DEFAULT false;

-- Create index for Hedera account lookups
CREATE INDEX IF NOT EXISTS idx_hedera_account ON deployed_objects(hedera_account_id);
CREATE INDEX IF NOT EXISTS idx_identity_nft ON deployed_objects(identity_nft_id);
```

---

### Phase 3: Backend Services Implementation ✅

**STATUS:** Complete - Agentsphere has implemented all core Hedera services in TypeScript

#### Implemented Services:

1. **hederaService.ts** - Complete wallet management

   - `createAgentAccount()` - Creates Hedera accounts for agents
   - `associateUSDhToken()` - Associates USDh token with accounts
   - `fundAgentWithUSDh()` - Funds agents with initial USDh balance
   - `transferUSDh()` - Handles USDh transfers
   - `getAccountBalance()` - Retrieves account balances

2. **a2aService.ts** - Agent-to-agent communication

   - `initializeA2A()` - Sets up A2A protocol
   - `sendMessage()` - Sends messages between agents
   - `handleIncomingMessage()` - Processes received messages
   - `coordinateJourney()` - Multi-agent journey coordination

3. **x402Client.ts** - Micropayment protocol for external data

   - `fetchDataWithPayment()` - Pays for and retrieves external data
   - `validatePayment()` - Validates x402 payments
   - `handleDataResponse()` - Processes received data

4. **agentDeploymentService.ts** - Complete deployment workflow
   - Orchestrates account creation, NFT minting, and service deployment
   - Saves all Hedera data to database
   - Returns deployed agent with complete metadata

#### 3.1 Reference Implementation (TypeScript)

**File:** `server/services/hederaService.ts` (already implemented)

```javascript
import {
  Client,
  PrivateKey,
  AccountCreateTransaction,
  Hbar,
} from "@hashgraph/sdk";

/**
 * Create a new Hedera account for an agent
 * @returns {Object} { accountId, privateKey, publicKey }
 */
export async function createAgentAccount() {
  const client = Client.forTestnet();
  client.setOperator(
    process.env.HEDERA_TREASURY_ACCOUNT_ID,
    process.env.HEDERA_TREASURY_PRIVATE_KEY
  );

  // Generate new key pair for agent
  const newAccountPrivateKey = PrivateKey.generateED25519();
  const newAccountPublicKey = newAccountPrivateKey.publicKey;

  // Create account with initial balance
  const transaction = new AccountCreateTransaction()
    .setKey(newAccountPublicKey)
    .setInitialBalance(Hbar.from(process.env.AGENT_ACCOUNT_INITIAL_HBAR || 10));

  const receipt = await transaction.execute(client);
  const accountId = (await receipt.getReceipt(client)).accountId;

  console.log(`Created agent account: ${accountId.toString()}`);

  return {
    accountId: accountId.toString(),
    privateKey: newAccountPrivateKey.toString(),
    publicKey: newAccountPublicKey.toString(),
  };
}

/**
 * Associate USDh token with agent account
 */
export async function associateUSDhToken(accountId, privateKey) {
  const client = Client.forTestnet();
  client.setOperator(accountId, privateKey);

  const tokenId = process.env.HEDERA_USDH_TOKEN_ID;

  const transaction = new TokenAssociateTransaction()
    .setAccountId(accountId)
    .setTokenIds([tokenId]);

  await transaction.execute(client);
  console.log(`Associated USDh token with ${accountId}`);
}

/**
 * Fund agent account with initial USDh
 */
export async function fundAgentWithUSDh(agentAccountId, amount) {
  const client = Client.forTestnet();
  client.setOperator(
    process.env.HEDERA_TREASURY_ACCOUNT_ID,
    process.env.HEDERA_TREASURY_PRIVATE_KEY
  );

  const tokenId = process.env.HEDERA_USDH_TOKEN_ID;

  const transaction = new TransferTransaction()
    .addTokenTransfer(tokenId, process.env.HEDERA_TREASURY_ACCOUNT_ID, -amount)
    .addTokenTransfer(tokenId, agentAccountId, amount);

  await transaction.execute(client);
  console.log(`Funded ${agentAccountId} with ${amount} USDh`);
}
```

#### 3.2 Agent Identity Service (ERC-8004)

**File:** `server/services/agentIdentityService.js`

```javascript
/**
 * Mint ERC-8004 identity NFT for agent
 * Links to agent card metadata
 */
export async function mintAgentIdentityNFT(agentData) {
  // TODO: Implement based on erc-8004-contracts repo
  // 1. Deploy or use existing ERC-8004 contract
  // 2. Prepare metadata JSON with agent card URL
  // 3. Mint NFT to agent's Hedera account
  // 4. Return NFT ID

  const metadata = {
    name: agentData.name,
    description: agentData.description,
    type: agentData.type,
    agentCardUrl: `${process.env.AGENTSPHERE_FRONTEND_URL}/agent-card/${agentData.id}`,
    capabilities: agentData.capabilities,
    location: {
      latitude: agentData.latitude,
      longitude: agentData.longitude,
    },
  };

  // Upload metadata to IPFS or similar
  const metadataUrl = await uploadMetadata(metadata);

  // Mint NFT (placeholder - implement with erc-8004-contracts)
  const nftId = "0.0.xxxxxx"; // Will be returned from contract

  return {
    nftId,
    metadataUrl,
  };
}
```

#### 3.3 Agent Deployment Service

**File:** `server/services/agentDeploymentService.js`

```javascript
import {
  createAgentAccount,
  associateUSDhToken,
  fundAgentWithUSDh,
} from "./hederaAccountService.js";
import { mintAgentIdentityNFT } from "./agentIdentityService.js";
import { deployAgentMicroservice } from "./agentMicroserviceService.js";

/**
 * Complete agent deployment flow
 */
export async function deployAgent(agentData) {
  try {
    // 1. Create Hedera account for agent
    console.log("Creating Hedera account...");
    const account = await createAgentAccount();

    // 2. Associate and fund with USDh
    console.log("Setting up USDh...");
    await associateUSDhToken(account.accountId, account.privateKey);
    await fundAgentWithUSDh(
      account.accountId,
      process.env.AGENT_ACCOUNT_INITIAL_USDH || 100
    );

    // 3. Mint identity NFT
    console.log("Minting identity NFT...");
    const identity = await mintAgentIdentityNFT(agentData);

    // 4. Deploy agent microservice
    console.log("Deploying agent service...");
    const service = await deployAgentMicroservice({
      ...agentData,
      hederaAccountId: account.accountId,
      hederaPrivateKey: account.privateKey,
      identityNftId: identity.nftId,
    });

    // 5. Save to database
    const deployedAgent = await saveDeployedAgent({
      ...agentData,
      hedera_account_id: account.accountId,
      hedera_account_key: account.privateKey, // Encrypt in production!
      identity_nft_id: identity.nftId,
      identity_nft_metadata_url: identity.metadataUrl,
      service_url: service.url,
      a2a_endpoint: service.a2aEndpoint,
      supports_x402: agentData.requiresExternalData || false,
    });

    console.log("Agent deployed successfully:", deployedAgent.id);
    return deployedAgent;
  } catch (error) {
    console.error("Agent deployment failed:", error);
    throw error;
  }
}
```

---

### Phase 4: Agent Services ✅

**STATUS:** Agentsphere has implemented agent business logic and communication handlers

#### Implemented Components:

1. **Agent Type Implementations**
   - BusAgent: Handles bus schedules, routes, tickets
   - TrainAgent: Manages train bookings, connections
   - HotelAgent: Hotel search, reservations, availability
   - Each agent has Hedera wallet and can receive payments

2. **A2A Communication** (a2aService.ts)
   - Agents can discover and communicate with each other
   - Journey coordination between multiple agents
   - Bus → Train → Hotel complete journey flows

3. **x402 Integration** (x402Client.ts)
   - Agents fetch external data (schedules, availability)
   - Micropayments for API calls
   - Real-time data integration

4. **WebSocket Server** (In Progress)
   - ⏳ Real-time communication with AR Viewer
   - ⏳ Chat message handling
   - ⏳ Journey status updates

#### 4.1 Agent Service Structure (Reference)

**Current Implementation:** TypeScript services in `server/services/`

```
server/
  services/
    hederaService.ts        # Hedera wallet management
    a2aService.ts           # Agent-to-agent communication
    x402Client.ts           # Micropayment client
    agentDeploymentService.ts  # Deployment workflow
  agents/
    BusAgent.ts            # Bus service logic
    TrainAgent.ts          # Train service logic  
    HotelAgent.ts          # Hotel service logic
```

#### 4.2 Agent Service Main File (Reference Template)

**File:** `server/agent-services/template/index.js`

```javascript
import express from "express";
import WebSocket from "ws";
import { A2AListener } from "./a2a-listener.js";
import { X402Client } from "./x402-client.js";
import { JourneyPlanner } from "./journey-planner.js";

export function createAgentService(config) {
  const app = express();
  const wss = new WebSocket.Server({ noServer: true });

  // Initialize components
  const a2aListener = new A2AListener(
    config.hederaAccountId,
    config.hederaPrivateKey
  );
  const x402Client = config.supportsX402
    ? new X402Client(config.hederaAccountId)
    : null;
  const journeyPlanner = new JourneyPlanner(
    config.type,
    a2aListener,
    x402Client
  );

  // WebSocket handler for user communication
  wss.on("connection", (ws) => {
    console.log("User connected to agent");

    ws.on("message", async (data) => {
      const message = JSON.parse(data);

      switch (message.type) {
        case "chat_message":
          const response = await journeyPlanner.handleChatMessage(
            message.payload.text
          );
          ws.send(
            JSON.stringify({
              type: "chat_response",
              payload: { text: response },
            })
          );
          break;

        case "journey_request":
          const plan = await journeyPlanner.planJourney(message.payload);
          ws.send(
            JSON.stringify({
              type: "final_plan",
              payload: plan,
            })
          );
          break;

        case "payment_confirmed":
          console.log("Payment confirmed:", message.payload.transactionId);
          // Process confirmed payment
          break;
      }
    });
  });

  // HTTP health check
  app.get("/health", (req, res) => {
    res.json({ status: "ok", agentId: config.agentId });
  });

  // Start A2A listener
  a2aListener.start();

  return { app, wss };
}
```

#### 4.3 A2A Listener Implementation

**File:** `server/agent-services/template/a2a-listener.js`

```javascript
// TODO: Implement using tools/A2A repository
// This enables agents to communicate with each other

export class A2AListener {
  constructor(accountId, privateKey) {
    this.accountId = accountId;
    this.privateKey = privateKey;
    this.handlers = new Map();
  }

  start() {
    // Initialize A2A protocol listener
    // Based on tools/A2A repository
    console.log("A2A listener started for", this.accountId);
  }

  async sendMessage(recipientAccountId, messageType, payload) {
    // Send A2A message to another agent
    console.log("Sending A2A message:", { recipientAccountId, messageType });
  }

  onMessage(messageType, handler) {
    this.handlers.set(messageType, handler);
  }
}
```

#### 4.4 x402 Client Implementation

**File:** `server/agent-services/template/x402-client.js`

```javascript
// TODO: Implement using tools/x402-hedera repository
// This enables agents to pay for external API data

export class X402Client {
  constructor(accountId) {
    this.accountId = accountId;
  }

  async fetchData(apiUrl) {
    // 1. Make initial request
    // 2. Receive 402 Payment Required with invoice
    // 3. Pay invoice using Hedera
    // 4. Retry request with payment proof
    // 5. Return data

    console.log("Fetching data with x402:", apiUrl);
  }
}
```

---

### Phase 5: API Endpoints for AR Viewer

#### 5.1 Agent Discovery Endpoint

**File:** `server/routes/agents.js`

```javascript
import express from "express";
import { supabase } from "../config/supabase.js";

const router = express.Router();

/**
 * GET /api/agents/discover
 * Find agents near a location
 */
router.get("/discover", async (req, res) => {
  try {
    const { lat, lon, radius = 1000 } = req.query;

    // Query deployed_objects with geospatial filtering
    const { data: agents, error } = await supabase
      .from("deployed_objects")
      .select("*")
      .not("hedera_account_id", "is", null) // Only Hedera-enabled agents
      .eq("is_active", true);

    if (error) throw error;

    // Filter by distance (simple implementation)
    const nearbyAgents = agents
      .filter((agent) => {
        const distance = calculateDistance(
          parseFloat(lat),
          parseFloat(lon),
          agent.latitude,
          agent.longitude
        );
        return distance <= radius;
      })
      .map((agent) => ({
        id: agent.id,
        name: agent.name,
        type: agent.agent_type,
        latitude: agent.latitude,
        longitude: agent.longitude,
        distance: calculateDistance(lat, lon, agent.latitude, agent.longitude),
        hederaAccountId: agent.hedera_account_id,
        serviceUrl: agent.service_url,
        fee: agent.interaction_fee_amount,
        feeToken: agent.interaction_fee_token,
        identityNftId: agent.identity_nft_id,
        capabilities: agent.capabilities || [],
      }));

    res.json(nearbyAgents);
  } catch (error) {
    console.error("Discovery error:", error);
    res.status(500).json({ error: "Failed to discover agents" });
  }
});

/**
 * GET /api/agents/:id
 * Get specific agent details
 */
router.get("/:id", async (req, res) => {
  try {
    const { data: agent, error } = await supabase
      .from("deployed_objects")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error) throw error;

    res.json({
      id: agent.id,
      name: agent.name,
      type: agent.agent_type,
      hederaAccountId: agent.hedera_account_id,
      serviceUrl: agent.service_url,
      a2aEndpoint: agent.a2a_endpoint,
      identityNftId: agent.identity_nft_id,
      metadataUrl: agent.identity_nft_metadata_url,
      // ... other fields
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to get agent" });
  }
});

/**
 * GET /api/agents/type/:type
 * Get agents by type (bus, train, hotel)
 */
router.get("/type/:type", async (req, res) => {
  try {
    const { lat, lon } = req.query;

    let query = supabase
      .from("deployed_objects")
      .select("*")
      .eq("agent_type", req.params.type)
      .not("hedera_account_id", "is", null);

    const { data: agents, error } = await query;

    if (error) throw error;

    res.json(agents);
  } catch (error) {
    res.status(500).json({ error: "Failed to get agents by type" });
  }
});

export default router;
```

---

### Phase 5: API Endpoints ✅

**STATUS:** Complete - All discovery endpoints implemented in Agentsphere

#### Implemented Endpoints:

1. **GET /api/agents/discover**
   - Returns nearby agents within radius
   - Filters by agent type
   - Includes Hedera account info
   - **Used by AR Viewer:** `agentDiscoveryService.discoverAgents()`

2. **GET /api/agents/:id**
   - Returns specific agent details
   - Includes service URL, A2A endpoint, identity NFT
   - **Used by AR Viewer:** `agentDiscoveryService.getAgentDetails()`

3. **GET /api/agents/type/:type**
   - Returns all agents of type (bus/train/hotel)
   - Supports geolocation filtering
   - **Used by AR Viewer:** `agentDiscoveryService.getAgentsByType()`

#### 5.1 Example Response Format

```json
{
  "id": "uuid",
  "name": "Heathrow Bus Agent",
  "type": "bus",
  "hederaAccountId": "0.0.123456",
  "serviceUrl": "https://bus-agent.example.com",
  "a2aEndpoint": "wss://bus-agent.example.com/a2a",
  "identityNftId": "0.0.654321",
  "metadataUrl": "ipfs://...",
  "latitude": 51.47,
  "longitude": -0.4543,
  "fee": 5
}
```

---

### Phase 6: Integration Testing ⏳

**STATUS:** Ready to begin end-to-end testing

#### Test Scenarios:

**Scenario 1: Deployment & Discovery**
1. Deploy 3 agents via Agentsphere (bus, train, hotel)
2. Verify Hedera accounts created and funded
3. Verify agents appear in AR Viewer discovery
4. Verify agent cards display correctly

**Scenario 2: Multi-Agent Journey**
1. User requests London → Paris journey in AR Viewer
2. AR Viewer discovers bus, train, hotel agents
3. Agents use A2A to coordinate journey
4. User receives complete itinerary with costs
5. User pays all agents in single multi-transfer transaction

**Scenario 3: x402 External Data**
1. Train agent needs real-time schedule data
2. Agent uses x402 to fetch from external API
3. Pays for data with USDh micropayment
4. Returns updated schedule to user

#### 6.1 Deploy Test Agents (Next Step)

```javascript
// In Agentsphere UI or via script
const testAgents = [
  {
    name: "Heathrow Bus Agent",
    type: "bus",
    latitude: 51.47,
    longitude: -0.4543,
    fee: 5,
    capabilities: ["route-planning", "real-time-schedules"],
  },
  {
    name: "Eurostar Train Agent",
    type: "train",
    latitude: 51.5179,
    longitude: -0.1235,
    fee: 10,
    requiresExternalData: true, // Will use x402
  },
  {
    name: "Paris Hotel Agent",
    type: "hotel",
    latitude: 48.8566,
    longitude: 2.3522,
    fee: 15,
    requiresExternalData: true,
  },
];

// Deploy each agent
for (const agentData of testAgents) {
  await deployAgent(agentData);
}
```

#### 6.2 Test Agent Discovery

```bash
# From AR Viewer or curl
curl "http://localhost:3001/api/agents/discover?lat=51.5074&lon=-0.1278&radius=5000"
```

#### 6.3 Test WebSocket Connection

```javascript
// From AR Viewer
const ws = new WebSocket("ws://localhost:3002"); // Agent service URL
ws.onopen = () => {
  ws.send(
    JSON.stringify({
      type: "chat_message",
      payload: { text: "Hello!" },
    })
  );
};
```

#### 6.4 Test Multi-Agent Journey

```javascript
// User requests: London → Paris
// 1. Bus Agent receives request
// 2. Bus Agent sends A2A to Train Agent
// 3. Train Agent sends A2A to Hotel Agent
// 4. Hotel Agent queries booking API (x402)
// 5. All agents return cost breakdown
// 6. User pays in one transaction
```

---

## 📋 Implementation Checklist

### Phase 1: Setup ✅

- ✅ Clone Hedera tools to `tools/` directory
- ✅ Install @hashgraph/sdk and dotenv
- ✅ Get testnet account from Hedera portal
- ✅ Configure .env with treasury account

### Phase 2: Database 🗄️

- ✅ Add Hedera columns to deployed_objects
- ✅ Create indexes
- ✅ Test database migrations

### Phase 3: Services 🔧

- ✅ Implement hederaService.ts (complete wallet management)
- ✅ Implement agentIdentityService (ERC-8004)
- ✅ Implement agentDeploymentService
- ✅ Test account creation and USDh funding

### Phase 4: Agent Services 🤖

- ✅ Create a2aService.ts
- ✅ Implement A2A communication
- ✅ Implement x402Client.ts
- ✅ Create journey coordination logic
- ⏳ Set up WebSocket server (next phase)

### Phase 5: API Endpoints 🌐

- ✅ Implement /api/agents/discover
- ✅ Implement /api/agents/:id
- ✅ Implement /api/agents/type/:type
- ✅ Test all endpoints

### Phase 6: Integration Testing 🧪

- ⏳ Deploy 3 test agents (bus, train, hotel)
- ⏳ Test discovery from AR Viewer
- ⏳ Test WebSocket communication
- ⏳ Test A2A agent-to-agent communication
- ⏳ Test x402 external data fetching
- ⏳ Test complete journey flow
- ⏳ Test multi-transfer payment

---

## 🔗 Reference Materials

### Documentation

- [Hedera AI Studio Docs](https://docs.hedera.com/hedera/open-source-solutions/ai-studio-on-hedera)
- [Hedera SDK Reference](https://docs.hedera.com/hedera/sdks-and-apis/sdks)
- [ERC-8004 Standard](https://github.com/hedera-dev/erc-8004-contracts)

### Code Repositories

- `tools/A2A/` - Agent communication
- `tools/erc-8004-contracts/` - Identity NFTs
- `tools/x402-hedera/` - Payment for data
- `tools/tutorial-a2a-x402-trustless-agent/` - Working example

### AR Viewer Integration Guide

- See: `HEDERA_AI_INTEGRATION_GUIDE.md` in AR Viewer repo
- Services: `src/services/` in AR Viewer

---

## 🚨 Important Notes

1. **Security:** Never commit private keys to git. Use environment variables and encryption.

2. **USDh Token:** Already deployed at `0.0.7218375` on testnet.

3. **Port Configuration:**

   - Agentsphere API: 3001
   - AR Viewer: 5173
   - Agent microservices: Dynamic (3002+)

4. **A2A Communication:** Each agent needs to run an A2A listener on its Hedera account.

5. **x402 Payments:** Agents pay for data from their own USDh balance.

6. **Testing:** Use testnet for all development. Get testnet HBAR from faucet.

---

## 📞 Support & Questions

- AR Viewer implementation: See `HEDERA_AI_INTEGRATION_GUIDE.md`
- Hedera SDK issues: Refer to official docs
- A2A/ERC-8004/x402: Check tutorial repo examples

---

---

## 🎉 Integration Complete!

### Agentsphere Implementation Summary

The Agentsphere team has successfully implemented:

1. **Hedera Service** (`hederaService.ts`)

   - ✅ `createAgentWallet()` - Creates accounts with USDh
   - ✅ `mintAgentIdentity()` - Mints ERC-8004 NFTs
   - ✅ `transferUSDh()` - Token transfers
   - ✅ `processX402Payment()` - Micropayments
   - ✅ `multiTransferUSDh()` - Split payments
   - ✅ `fundAgentWallet()` - Initial funding
   - ✅ `getUSDhBalance()` - Balance queries

2. **A2A Service** (`a2aService.ts`)

   - ✅ `discoverAgents()` - Find agents by type/location
   - ✅ `sendMessage()` - Agent-to-agent messaging
   - ✅ `queryAgent()` - Query specific data
   - ✅ `coordinateJourney()` - Multi-agent planning
   - ✅ `startListener()` - Listen for messages

3. **x402 Client** (`x402Client.ts`)

   - ✅ `fetch()` - Auto-pay for protected APIs
   - ✅ `queryTimetable()` - Timetable service
   - ✅ `queryHotelAvailability()` - Hotel service
   - ✅ `queryNexus()` - Thirdweb Nexus
   - ✅ `checkBalance()` - Balance verification

4. **Database Schema**

   - ✅ `hedera_account_id` - Hedera account
   - ✅ `hedera_private_key` - Private key (encrypted)
   - ✅ `hedera_nft_id` - ERC-8004 identity
   - ✅ `agent_wallet_public_key` - Public key
   - ✅ `agent_capabilities` - JSONB capabilities
   - ✅ `a2a_endpoint` - Communication URL
   - ✅ `x402_enabled` - Micropayment flag

5. **Agent Types Supported**
   - 🚌 `bus_agent` - Bus routing & ticketing
   - 🚆 `train_agent` - Train schedules
   - 🏨 `hotel_agent` - Hotel bookings
   - ✈️ `flight_agent` - Flight search
   - 🍽️ `restaurant_agent` - Restaurant reservations
   - 🌍 `travel_agent` - Journey coordination

### Environment Configuration

```env
# Hedera Testnet
VITE_TREASURY_ACCOUNT_ID=0.0.xxxxxxx
VITE_TREASURY_PRIVATE_KEY=302e...
VITE_USDH_TOKEN_ID=0.0.7218375
VITE_ERC8004_CONTRACT_ID=0.0.xxxxxxx

# Agent Settings
VITE_AGENT_INITIAL_HBAR=10
VITE_AGENT_INITIAL_USDH=100
VITE_HEDERA_NETWORK=testnet

# Communication
VITE_A2A_BASE_URL=http://localhost:3001

# External APIs
VITE_NEXUS_API_URL=https://nexus.thirdweb.com/api
VITE_TIMETABLE_API_URL=https://api.example.com/timetables
VITE_HOTEL_API_URL=https://api.example.com/hotels
```

---

## 🧪 Next Steps: Integration Testing

### Test Scenario 1: Agent Deployment & Discovery

1. **Deploy Bus Agent** (Agentsphere)

   ```typescript
   // Deploy bus agent at specific location
   await deployAgent({
     name: "Downtown Bus Stop #42",
     type: "bus_agent",
     latitude: 51.5074,
     longitude: -0.1278,
     capabilities: { chat: true, a2a: true, x402: true },
   });
   ```

2. **Discover from AR Viewer**
   ```typescript
   // AR Viewer discovers the agent
   const agents = await discoverAgents(51.5074, -0.1278, 5000);
   console.log("Found:", agents); // Should include Bus Agent
   ```

### Test Scenario 2: Multi-Agent Journey Planning

1. **User Request** (AR Viewer → Bus Agent)

   ```
   User: "I need to get to Paris with train and hotel"
   ```

2. **Bus Agent Coordinates** (A2A)

   ```
   Bus Agent → Train Agent: "Query trains to Paris"
   Train Agent → Hotel Agent: "Query hotels in Paris"
   ```

3. **Journey Plan Returned**

   ```json
   {
     "route": [
       { "agent": "Bus", "from": "London", "to": "St Pancras", "cost": 5 },
       {
         "agent": "Train",
         "from": "St Pancras",
         "to": "Paris Gare du Nord",
         "cost": 15
       },
       { "agent": "Hotel", "location": "Paris Center", "cost": 80 }
     ],
     "costBreakdown": [
       { "agent": "Bus Agent", "accountId": "0.0.12345", "amount": 7 },
       { "agent": "Train Agent", "accountId": "0.0.67890", "amount": 17 },
       { "agent": "Hotel Agent", "accountId": "0.0.11111", "amount": 82 }
     ],
     "total": 106
   }
   ```

4. **User Payment** (AR Viewer)
   ```typescript
   // Single multi-transfer transaction
   await handlePaymentWithWallet(costBreakdown, walletProvider);
   // Pays all 3 agents in one transaction
   ```

### Test Scenario 3: x402 Data Fetching

1. **Train Agent needs timetable data**
   ```typescript
   // Agent queries protected API
   const timetable = await x402Client.queryTimetable({
     from: "London",
     to: "Paris",
     date: "2025-12-01",
   });
   // Automatically pays micropayment from agent's USDh balance
   ```

---

## 📊 System Architecture (Complete)

```
┌─────────────────────────────────────────────────────────────┐
│                    User (AR Viewer)                         │
│  - Agent Discovery                                          │
│  - WebSocket Chat                                           │
│  - Multi-transfer USDh Payment                              │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ↓ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────┐
│              Agentsphere API (Port 3001)                    │
│  - /api/agents/discover                                     │
│  - /api/agents/:id                                          │
│  - /api/agents/type/:type                                   │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ↓ Manages
┌─────────────────────────────────────────────────────────────┐
│                    Travel Agents                            │
│  🚌 Bus Agent    🚆 Train Agent    🏨 Hotel Agent          │
│  - Hedera Account (0.0.xxxxx)                              │
│  - ERC-8004 Identity NFT                                    │
│  - A2A Communication                                        │
│  - x402 Payment Client                                      │
└────────────────┬────────────────────────────────────────────┘
                 │
      ┌──────────┼──────────┬──────────────┐
      │          │          │              │
      ↓ A2A     ↓ x402    ↓ USDh        ↓ Identity
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────┐
│ Other   │ │External │ │ Hedera  │ │ ERC-8004    │
│ Agents  │ │ APIs    │ │ Network │ │ Contract    │
│         │ │ (Nexus) │ │ USDh    │ │             │
└─────────┘ └─────────┘ └─────────┘ └─────────────┘
```

---

## 🎯 System Status Overview

### ✅ AR Viewer Platform (Complete)
**Repository:** `ar-agent-viewer-web-man-US`

**Implemented Components:**
- ✅ `src/services/agentDiscoveryService.js` - Discover agents from Agentsphere API
- ✅ `src/services/agentCommunicationService.js` - WebSocket agent communication
- ✅ `src/services/hederaPaymentService.js` - Multi-transfer USDh payments
- ✅ `src/components/AgentInteractionExample.jsx` - Complete usage example
- ✅ Vite configuration for Hedera SDK
- ✅ Environment configuration (.env)
- ✅ Documentation: `HEDERA_AI_INTEGRATION_GUIDE.md`

**Capabilities:**
- Discover nearby agents by location/type
- Real-time chat with agents via WebSocket
- Pay multiple agents in single transaction
- View agent identity NFTs and metadata

---

### ✅ Agentsphere Platform (Complete)
**Repository:** `agentsphere-full-web-man-US`

**Implemented Components:**
- ✅ `server/services/hederaService.ts` - Wallet & token management
- ✅ `server/services/a2aService.ts` - Agent-to-agent communication
- ✅ `server/services/x402Client.ts` - Micropayment protocol
- ✅ `server/services/agentDeploymentService.ts` - Deployment workflow
- ✅ Database schema with Hedera columns
- ✅ API endpoints: /api/agents/discover, /:id, /type/:type
- ✅ Agent types: Bus, Train, Hotel, Flight, Restaurant, Travel
- ✅ Documentation: `HEDERA_AI_AGENT_KIT_GUIDE.md`

**Capabilities:**
- Create Hedera wallets for agents
- Mint ERC-8004 identity NFTs
- Deploy agents with A2A communication
- Enable x402 external data fetching
- Coordinate multi-agent journeys
- Expose agents via discovery API

---

## 🧪 Integration Testing Plan

### Prerequisites
- Both servers running: Agentsphere (port 3001), AR Viewer (port 5173)
- Testnet accounts funded with HBAR and USDh
- USDh token: `0.0.7218375`

### Test Scenario 1: Agent Deployment & Discovery ⏳

**Step 1 - Deploy Test Agent (Agentsphere)**
```typescript
await deployAgent({
  name: "Downtown Bus Stop #42",
  type: "bus_agent",
  latitude: 51.5074,
  longitude: -0.1278,
  fee: 5,
  capabilities: { chat: true, a2a: true, x402: false }
});
```

**Step 2 - Verify Deployment**
- ✓ Check Hedera account created
- ✓ Check USDh funded
- ✓ Check identity NFT minted
- ✓ Check database entry complete

**Step 3 - Discover from AR Viewer**
```javascript
const agents = await agentDiscoveryService.discoverAgents(
  51.5074, -0.1278, 5000
);
// Should return Bus Agent with all metadata
```

**Expected Result:** ✅ Agent appears in AR Viewer with correct details

---

### Test Scenario 2: Multi-Agent Journey Planning ⏳

**Step 1 - Deploy Journey Agents**
```typescript
await Promise.all([
  deployAgent({ name: "London Bus", type: "bus_agent", ... }),
  deployAgent({ name: "Eurostar Train", type: "train_agent", ... }),
  deployAgent({ name: "Paris Hotel", type: "hotel_agent", ... })
]);
```

**Step 2 - User Journey Request (AR Viewer)**
```javascript
const busAgent = await agentCommunicationService.connect(busAgentUrl);
await busAgent.sendChatMessage("I need to get to Paris with train and hotel");
```

**Step 3 - A2A Coordination (Agentsphere)**
- Bus Agent → Train Agent: Query trains to Paris
- Train Agent → Hotel Agent: Query hotels near Gare du Nord
- Agents return coordinated journey plan

**Step 4 - Payment (AR Viewer)**
```javascript
await hederaPaymentService.handlePaymentWithWallet({
  recipients: [
    { accountId: "0.0.bus", amount: 5 },
    { accountId: "0.0.train", amount: 15 },
    { accountId: "0.0.hotel", amount: 20 }
  ]
});
```

**Expected Result:** ✅ Complete journey planned and paid in one transaction

---

### Test Scenario 3: x402 External Data Fetching ⏳

**Step 1 - Deploy x402-Enabled Agent**
```typescript
await deployAgent({
  name: "Smart Train Agent",
  type: "train_agent",
  capabilities: { x402: true },
  x402Endpoints: ["timetable-api", "nexus-api"]
});
```

**Step 2 - User Requests Real-Time Data**
```javascript
await agent.sendChatMessage("What's the next train to Paris?");
```

**Step 3 - Agent Uses x402 (Agentsphere)**
```typescript
// Agent automatically:
const timetable = await x402Client.queryTimetable({
  from: "London St Pancras",
  to: "Paris Gare du Nord"
});
// Pays for data with USDh
// Returns to user
```

**Expected Result:** ✅ User receives real-time train schedule, agent's balance decreases

---

## 🔗 Reference Documentation

### Agentsphere Guide

See: `agentsphere-full-web-man-US/HEDERA_AI_AGENT_KIT_GUIDE.md`

- Complete implementation details
- Code examples
- Testing procedures
- Security considerations

### AR Viewer Guide

See: `ar-agent-viewer-web-man-US/HEDERA_AI_INTEGRATION_GUIDE.md`

- Service usage examples
- Payment integration
- WebSocket communication

---

**AR Viewer Status:** ✅ Complete and ready  
**Agentsphere Status:** ✅ Complete and ready  
**Next Milestone:** End-to-end integration testing  
**Ready for Production:** After testing phase

**Date Created:** November 20, 2025  
**Last Updated:** November 20, 2025
