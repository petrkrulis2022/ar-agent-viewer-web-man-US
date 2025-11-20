# Hedera AI Integration - Agentsphere Implementation Tasks

**Date:** November 20, 2025  
**AR Viewer Branch:** `revolut-qr-payments-sim-dynamimic-online-payments-solana-hedera-ai`  
**Agentsphere Branch:** `revolut-pay-sim-solana-hedera`

---

## 🎯 Overview

The AR Viewer has been fully integrated with Hedera AI Agent Kit and is now ready to:
- Discover agents from Agentsphere API
- Communicate with agents via WebSockets
- Pay multiple agents in one USDh transaction

**Your mission:** Implement the Agentsphere backend to deploy and manage AI agents with Hedera capabilities.

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

### Phase 3: Backend Services Implementation

#### 3.1 Hedera Account Service
**File:** `server/services/hederaAccountService.js`

```javascript
import { Client, PrivateKey, AccountCreateTransaction, Hbar } from "@hashgraph/sdk";

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
    publicKey: newAccountPublicKey.toString()
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
      longitude: agentData.longitude
    }
  };
  
  // Upload metadata to IPFS or similar
  const metadataUrl = await uploadMetadata(metadata);
  
  // Mint NFT (placeholder - implement with erc-8004-contracts)
  const nftId = "0.0.xxxxxx"; // Will be returned from contract
  
  return {
    nftId,
    metadataUrl
  };
}
```

#### 3.3 Agent Deployment Service
**File:** `server/services/agentDeploymentService.js`

```javascript
import { createAgentAccount, associateUSDhToken, fundAgentWithUSDh } from './hederaAccountService.js';
import { mintAgentIdentityNFT } from './agentIdentityService.js';
import { deployAgentMicroservice } from './agentMicroserviceService.js';

/**
 * Complete agent deployment flow
 */
export async function deployAgent(agentData) {
  try {
    // 1. Create Hedera account for agent
    console.log('Creating Hedera account...');
    const account = await createAgentAccount();
    
    // 2. Associate and fund with USDh
    console.log('Setting up USDh...');
    await associateUSDhToken(account.accountId, account.privateKey);
    await fundAgentWithUSDh(account.accountId, process.env.AGENT_ACCOUNT_INITIAL_USDH || 100);
    
    // 3. Mint identity NFT
    console.log('Minting identity NFT...');
    const identity = await mintAgentIdentityNFT(agentData);
    
    // 4. Deploy agent microservice
    console.log('Deploying agent service...');
    const service = await deployAgentMicroservice({
      ...agentData,
      hederaAccountId: account.accountId,
      hederaPrivateKey: account.privateKey,
      identityNftId: identity.nftId
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
      supports_x402: agentData.requiresExternalData || false
    });
    
    console.log('Agent deployed successfully:', deployedAgent.id);
    return deployedAgent;
    
  } catch (error) {
    console.error('Agent deployment failed:', error);
    throw error;
  }
}
```

---

### Phase 4: Agent Microservice Template

#### 4.1 Agent Service Structure
```
server/
  agent-services/
    template/
      index.js              # Main agent logic
      a2a-listener.js       # A2A communication handler
      x402-client.js        # x402 payment client
      chat-handler.js       # WebSocket chat server
      journey-planner.js    # Business logic
```

#### 4.2 Agent Service Main File
**File:** `server/agent-services/template/index.js`

```javascript
import express from 'express';
import WebSocket from 'ws';
import { A2AListener } from './a2a-listener.js';
import { X402Client } from './x402-client.js';
import { JourneyPlanner } from './journey-planner.js';

export function createAgentService(config) {
  const app = express();
  const wss = new WebSocket.Server({ noServer: true });
  
  // Initialize components
  const a2aListener = new A2AListener(config.hederaAccountId, config.hederaPrivateKey);
  const x402Client = config.supportsX402 ? new X402Client(config.hederaAccountId) : null;
  const journeyPlanner = new JourneyPlanner(config.type, a2aListener, x402Client);
  
  // WebSocket handler for user communication
  wss.on('connection', (ws) => {
    console.log('User connected to agent');
    
    ws.on('message', async (data) => {
      const message = JSON.parse(data);
      
      switch (message.type) {
        case 'chat_message':
          const response = await journeyPlanner.handleChatMessage(message.payload.text);
          ws.send(JSON.stringify({
            type: 'chat_response',
            payload: { text: response }
          }));
          break;
          
        case 'journey_request':
          const plan = await journeyPlanner.planJourney(message.payload);
          ws.send(JSON.stringify({
            type: 'final_plan',
            payload: plan
          }));
          break;
          
        case 'payment_confirmed':
          console.log('Payment confirmed:', message.payload.transactionId);
          // Process confirmed payment
          break;
      }
    });
  });
  
  // HTTP health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', agentId: config.agentId });
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
    console.log('A2A listener started for', this.accountId);
  }
  
  async sendMessage(recipientAccountId, messageType, payload) {
    // Send A2A message to another agent
    console.log('Sending A2A message:', { recipientAccountId, messageType });
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
    
    console.log('Fetching data with x402:', apiUrl);
  }
}
```

---

### Phase 5: API Endpoints for AR Viewer

#### 5.1 Agent Discovery Endpoint
**File:** `server/routes/agents.js`

```javascript
import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

/**
 * GET /api/agents/discover
 * Find agents near a location
 */
router.get('/discover', async (req, res) => {
  try {
    const { lat, lon, radius = 1000 } = req.query;
    
    // Query deployed_objects with geospatial filtering
    const { data: agents, error } = await supabase
      .from('deployed_objects')
      .select('*')
      .not('hedera_account_id', 'is', null) // Only Hedera-enabled agents
      .eq('is_active', true);
    
    if (error) throw error;
    
    // Filter by distance (simple implementation)
    const nearbyAgents = agents.filter(agent => {
      const distance = calculateDistance(
        parseFloat(lat), parseFloat(lon),
        agent.latitude, agent.longitude
      );
      return distance <= radius;
    }).map(agent => ({
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
      capabilities: agent.capabilities || []
    }));
    
    res.json(nearbyAgents);
  } catch (error) {
    console.error('Discovery error:', error);
    res.status(500).json({ error: 'Failed to discover agents' });
  }
});

/**
 * GET /api/agents/:id
 * Get specific agent details
 */
router.get('/:id', async (req, res) => {
  try {
    const { data: agent, error } = await supabase
      .from('deployed_objects')
      .select('*')
      .eq('id', req.params.id)
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
    res.status(500).json({ error: 'Failed to get agent' });
  }
});

/**
 * GET /api/agents/type/:type
 * Get agents by type (bus, train, hotel)
 */
router.get('/type/:type', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    let query = supabase
      .from('deployed_objects')
      .select('*')
      .eq('agent_type', req.params.type)
      .not('hedera_account_id', 'is', null);
    
    const { data: agents, error } = await query;
    
    if (error) throw error;
    
    res.json(agents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get agents by type' });
  }
});

export default router;
```

---

### Phase 6: Testing Workflow

#### 6.1 Deploy Test Agents
```javascript
// In Agentsphere UI or via script
const testAgents = [
  {
    name: 'Heathrow Bus Agent',
    type: 'bus',
    latitude: 51.4700,
    longitude: -0.4543,
    fee: 5,
    capabilities: ['route-planning', 'real-time-schedules']
  },
  {
    name: 'Eurostar Train Agent',
    type: 'train',
    latitude: 51.5179,
    longitude: -0.1235,
    fee: 10,
    requiresExternalData: true // Will use x402
  },
  {
    name: 'Paris Hotel Agent',
    type: 'hotel',
    latitude: 48.8566,
    longitude: 2.3522,
    fee: 15,
    requiresExternalData: true
  }
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
const ws = new WebSocket('ws://localhost:3002'); // Agent service URL
ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'chat_message',
    payload: { text: 'Hello!' }
  }));
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
- [ ] Clone Hedera tools to `tools/` directory
- [ ] Install @hashgraph/sdk and dotenv
- [ ] Get testnet account from Hedera portal
- [ ] Configure .env with treasury account

### Phase 2: Database 🗄️
- [ ] Add Hedera columns to deployed_objects
- [ ] Create indexes
- [ ] Test database migrations

### Phase 3: Services 🔧
- [ ] Implement hederaAccountService.js
- [ ] Implement agentIdentityService.js (ERC-8004)
- [ ] Implement agentDeploymentService.js
- [ ] Test account creation and USDh funding

### Phase 4: Agent Microservices 🤖
- [ ] Create agent service template
- [ ] Implement A2A listener
- [ ] Implement x402 client
- [ ] Create journey planner logic
- [ ] Set up WebSocket server

### Phase 5: API Endpoints 🌐
- [ ] Implement /api/agents/discover
- [ ] Implement /api/agents/:id
- [ ] Implement /api/agents/type/:type
- [ ] Test all endpoints

### Phase 6: Testing 🧪
- [ ] Deploy 3 test agents (bus, train, hotel)
- [ ] Test discovery from AR Viewer
- [ ] Test WebSocket communication
- [ ] Test A2A agent-to-agent communication
- [ ] Test x402 external data fetching
- [ ] Test complete journey flow
- [ ] Test multi-transfer payment

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

**AR Viewer Status:** ✅ Complete and ready  
**Agentsphere Status:** ⏳ Awaiting implementation  
**Next Milestone:** Deploy first test agent and verify discovery from AR Viewer

**Date Created:** November 20, 2025
