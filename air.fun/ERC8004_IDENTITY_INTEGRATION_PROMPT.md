# 🆔 Air.Fun Agent Identity Integration - ERC-8004 Implementation Prompt

**Date:** December 12, 2025  
**Project:** air.fun Main Platform  
**Goal:** Give every agent an on-chain identity using ERC-8004 protocol

---

## 📋 Overview

You are tasked with integrating **ERC-8004 agent identity** into the air.fun streaming platform. This gives every deployed agent:

1. **Portable on-chain identity** (ERC-721 NFT)
2. **Censorship-resistant identifier** across chains
3. **Reputation tracking** via feedback system
4. **Trust model support** (for future features)

---

## 🌐 What is ERC-8004?

### Protocol Summary

**ERC-8004: Trustless Agents** is a blockchain protocol that enables discovering, choosing, and interacting with agents across organizational boundaries without pre-existing trust.

### Three Core Registries

| Registry                | Purpose            | What It Does                                          |
| ----------------------- | ------------------ | ----------------------------------------------------- |
| **Identity Registry**   | Agent Registration | ERC-721 NFT that represents each agent with unique ID |
| **Reputation Registry** | Feedback & Trust   | Tracks client feedback (0-100 scores) with tags       |
| **Validation Registry** | Trust Verification | Records validator checks (zkML, TEE, staking)         |

### Why ERC-8004 for Air.Fun?

| Benefit                 | Description                                           |
| ----------------------- | ----------------------------------------------------- |
| **Portable Identity**   | Agent identity persists across streams, platforms     |
| **Reputation Building** | Viewers can leave feedback on agent interactions      |
| **Trust Signals**       | Future: Insurance, staking, quality assurance         |
| **NFT Compatibility**   | Agents are tradeable NFTs (IPFi marketplace ready)    |
| **Cross-chain**         | Same agent can exist on Base Sepolia + Hedera Testnet |

---

## 🔗 ERC-8004 Contract Addresses

### ✅ Already Deployed on Testnets

| Network            | Chain ID | Identity Registry                            | Reputation Registry                          | Validation Registry                          |
| ------------------ | -------- | -------------------------------------------- | -------------------------------------------- | -------------------------------------------- |
| **Base Sepolia**   | 84532    | `0x8004AA63c570c570eBF15376c0dB199918BFe9Fb` | `0x8004bd8daB57f14Ed299135749a5CB5c42d341BF` | `0x8004C269D0A5647E51E121FeB226200ECE932d55` |
| **Hedera Testnet** | 296      | `0x4c74ebd72921d537159ed2053f46c12a7d8e5923` | `0xc565edcba77e3abeade40bfd6cf6bf583b3293e0` | `0x18df085d85c586e9241e0cd121ca422f571c2da6` |

### Also Available On (Optional)

- ETH Sepolia (11155111)
- Linea Sepolia
- Polygon Amoy
- HyperEVM Testnet

---

## 🏗️ Architecture: Agent Identity in Air.Fun

### Agent Lifecycle with ERC-8004

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    AGENT IDENTITY LIFECYCLE                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  STEP 1: STREAMER DEPLOYS AGENT                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  Streamer Interface → "Deploy Agent" button                           │  │
│  │  ├── Create agent in Supabase                                         │  │
│  │  ├── Upload registration file to IPFS                                 │  │
│  │  └── Mint ERC-8004 Identity NFT                                       │  │
│  │                                                                        │  │
│  │  Transaction: IdentityRegistry.register()                             │  │
│  │  ├── Streamer pays gas                                                │  │
│  │  ├── Receives agentId (e.g., #42)                                     │  │
│  │  └── Agent now has global identity: eip155:84532:0x8004AA...:42       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  STEP 2: AGENT APPEARS ON STREAM                                            │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  Viewers see 3D cube agent with:                                      │  │
│  │  ├── 🆔 Badge showing agentId                                         │  │
│  │  ├── ⭐ Reputation score (if has feedback)                            │  │
│  │  └── 🔗 Link to view on-chain identity                                │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  STEP 3: VIEWER INTERACTS WITH AGENT                                        │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  Viewer clicks agent → Pays streamer                                  │  │
│  │  After interaction, viewer can:                                       │  │
│  │  ├── Leave feedback (0-100 score)                                     │  │
│  │  ├── Add tags (e.g., "helpful", "fast", "accurate")                  │  │
│  │  └── Submit to ReputationRegistry                                     │  │
│  │                                                                        │  │
│  │  Transaction: ReputationRegistry.giveFeedback()                       │  │
│  │  ├── Viewer pays gas                                                  │  │
│  │  └── Feedback stored on-chain                                         │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  STEP 4: REPUTATION ACCUMULATES                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  Agent reputation visible to all:                                     │  │
│  │  ├── Average score (e.g., 87/100)                                     │  │
│  │  ├── Total feedback count                                             │  │
│  │  ├── Top tags (e.g., "helpful", "responsive")                         │  │
│  │  └── Displayed on cube agent badge                                    │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  STEP 5: AGENT OWNERSHIP (FUTURE - IPFi)                                    │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  Agent identity is ERC-721 NFT → Can be traded:                       │  │
│  │  ├── Streamer can sell agent to another streamer                      │  │
│  │  ├── Reputation transfers with agent                                  │  │
│  │  └── New owner can use agent in their streams                         │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📦 Implementation Requirements

### Required Packages

Add to `package.json`:

```json
{
  "dependencies": {
    "ethers": "^6.13.0",
    "viem": "^2.21.0",
    "ipfs-http-client": "^60.0.1",
    "@openzeppelin/contracts": "^5.0.0"
  }
}
```

### ERC-8004 Contract ABIs

**File:** `platform/contracts/erc8004-abis.ts`

```typescript
// Identity Registry ABI
export const IDENTITY_REGISTRY_ABI = [
  // Registration
  "function register(string uri) returns (uint256)",
  "function registerWithMetadata(string uri, string[] keys, bytes[] values) returns (uint256)",

  // Metadata
  "function setMetadata(uint256 agentId, string key, bytes value)",
  "function getMetadata(uint256 agentId, string key) view returns (bytes)",

  // ERC-721 Standard
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function transferFrom(address from, address to, uint256 tokenId)",

  // Events
  "event AgentRegistered(uint256 indexed agentId, address indexed owner, string uri)",
  "event MetadataSet(uint256 indexed agentId, string indexed indexedKey, string key, bytes value)",
];

// Reputation Registry ABI
export const REPUTATION_REGISTRY_ABI = [
  // Feedback
  "function giveFeedback(uint256 agentId, uint8 score, string[] tags, string offchainFileUri)",
  "function revokeFeedback(uint256 agentId, uint256 feedbackIndex)",

  // Query
  "function getFeedbackCount(uint256 agentId) view returns (uint256)",
  "function getFeedback(uint256 agentId, uint256 index) view returns (tuple(address client, uint8 score, string[] tags, string offchainFileUri, uint256 timestamp, bool revoked))",
  "function getSummary(uint256 agentId) view returns (uint256 count, uint256 averageScore)",

  // Events
  "event FeedbackGiven(uint256 indexed agentId, address indexed client, uint256 feedbackIndex, uint8 score)",
];

// Validation Registry ABI (Optional - for future)
export const VALIDATION_REGISTRY_ABI = [
  "function requestValidation(uint256 agentId, address validator, string offchainFileUri)",
  "function respondToValidation(uint256 agentId, uint256 requestIndex, uint8 score, string[] tags)",
];
```

### Chain Configuration with ERC-8004

**File:** `platform/lib/chains.ts`

```typescript
export const CHAIN_CONFIG = {
  baseSepolia: {
    chainId: 84532,
    name: "Base Sepolia",
    rpcUrl: "https://sepolia.base.org",
    explorer: "https://sepolia.basescan.org",

    // ... existing config (USDC, AIR, etc.)

    // ERC-8004 Contracts
    erc8004: {
      identityRegistry: "0x8004AA63c570c570eBF15376c0dB199918BFe9Fb",
      reputationRegistry: "0x8004bd8daB57f14Ed299135749a5CB5c42d341BF",
      validationRegistry: "0x8004C269D0A5647E51E121FeB226200ECE932d55",
    },
  },

  hederaTestnet: {
    chainId: 296,
    name: "Hedera Testnet",
    rpcUrl: "https://testnet.hashio.io/api",
    explorer: "https://hashscan.io/testnet",

    // ... existing config (USDh, AIR, etc.)

    // ERC-8004 Contracts
    erc8004: {
      identityRegistry: "0x4c74ebd72921d537159ed2053f46c12a7d8e5923",
      reputationRegistry: "0xc565edcba77e3abeade40bfd6cf6bf583b3293e0",
      validationRegistry: "0x18df085d85c586e9241e0cd121ca422f571c2da6",
    },
  },
};
```

---

## 🎯 Implementation Tasks

### Phase 1: Agent Registration Service (Priority: HIGH)

#### Task 1.1: IPFS Upload Service

**File:** `platform/services/ipfsService.ts`

```typescript
import { create } from "ipfs-http-client";

// Use public IPFS gateway or run your own
const ipfs = create({ url: "https://ipfs.infura.io:5001/api/v0" });

export interface AgentRegistrationFile {
  type: "https://eips.ethereum.org/EIPS/eip-8004#registration-v1";
  name: string;
  description: string;
  image: string;
  endpoints: Array<{
    name: string;
    endpoint: string;
    version?: string;
  }>;
  registrations: Array<{
    agentId: number;
    agentRegistry: string; // e.g., "eip155:84532:0x8004AA63..."
  }>;
  supportedTrust: Array<"reputation" | "crypto-economic" | "tee-attestation">;
}

export async function uploadAgentRegistration(
  agentName: string,
  description: string,
  imageUrl: string,
  streamerWallet: string,
  streamId: string
): Promise<string> {
  const registrationFile: AgentRegistrationFile = {
    type: "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
    name: agentName,
    description: description,
    image: imageUrl,
    endpoints: [
      {
        name: "agentWallet",
        endpoint: `eip155:84532:${streamerWallet}`, // Streamer's wallet
      },
      {
        name: "streamEndpoint",
        endpoint: `https://air.fun/stream/${streamId}`,
      },
    ],
    registrations: [], // Will be populated after minting
    supportedTrust: ["reputation"], // Enable reputation feedback
  };

  const { cid } = await ipfs.add(JSON.stringify(registrationFile, null, 2));
  return `ipfs://${cid.toString()}`;
}
```

#### Task 1.2: ERC-8004 Identity Service

**File:** `platform/services/identityService.ts`

```typescript
import { ethers } from "ethers";
import { CHAIN_CONFIG } from "../lib/chains";
import { IDENTITY_REGISTRY_ABI } from "../contracts/erc8004-abis";
import { uploadAgentRegistration } from "./ipfsService";

export class IdentityService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;

  async connect(): Promise<string> {
    if (!window.ethereum) throw new Error("No wallet detected");
    this.provider = new ethers.BrowserProvider(window.ethereum);
    this.signer = await this.provider.getSigner();
    return await this.signer.getAddress();
  }

  /**
   * Register agent identity on-chain
   * @returns agentId (uint256 token ID)
   */
  async registerAgent(
    agentName: string,
    description: string,
    imageUrl: string,
    streamerWallet: string,
    streamId: string,
    chainKey: "baseSepolia" | "hederaTestnet"
  ): Promise<{
    agentId: number;
    txHash: string;
    registrationUri: string;
  }> {
    if (!this.signer) throw new Error("Wallet not connected");

    // 1. Upload registration file to IPFS
    const ipfsUri = await uploadAgentRegistration(
      agentName,
      description,
      imageUrl,
      streamerWallet,
      streamId
    );

    // 2. Get contract instance
    const config = CHAIN_CONFIG[chainKey];
    const identityRegistry = new ethers.Contract(
      config.erc8004.identityRegistry,
      IDENTITY_REGISTRY_ABI,
      this.signer
    );

    // 3. Mint agent identity NFT
    const tx = await identityRegistry.register(ipfsUri);
    const receipt = await tx.wait();

    // 4. Extract agentId from event
    const event = receipt.logs.find(
      (log: any) =>
        log.topics[0] === ethers.id("AgentRegistered(uint256,address,string)")
    );
    const agentId = Number(event.topics[1]);

    return {
      agentId,
      txHash: receipt.hash,
      registrationUri: ipfsUri,
    };
  }

  /**
   * Get agent registration data
   */
  async getAgentRegistration(
    agentId: number,
    chainKey: "baseSepolia" | "hederaTestnet"
  ): Promise<any> {
    if (!this.provider) throw new Error("Provider not initialized");

    const config = CHAIN_CONFIG[chainKey];
    const identityRegistry = new ethers.Contract(
      config.erc8004.identityRegistry,
      IDENTITY_REGISTRY_ABI,
      this.provider
    );

    const uri = await identityRegistry.tokenURI(agentId);

    // Fetch from IPFS
    if (uri.startsWith("ipfs://")) {
      const cid = uri.replace("ipfs://", "");
      const response = await fetch(`https://ipfs.io/ipfs/${cid}`);
      return await response.json();
    }

    return null;
  }

  /**
   * Get agent owner
   */
  async getAgentOwner(
    agentId: number,
    chainKey: "baseSepolia" | "hederaTestnet"
  ): Promise<string> {
    if (!this.provider) throw new Error("Provider not initialized");

    const config = CHAIN_CONFIG[chainKey];
    const identityRegistry = new ethers.Contract(
      config.erc8004.identityRegistry,
      IDENTITY_REGISTRY_ABI,
      this.provider
    );

    return await identityRegistry.ownerOf(agentId);
  }
}

export const identityService = new IdentityService();
```

### Phase 2: Reputation System (Priority: MEDIUM)

#### Task 2.1: Reputation Service

**File:** `platform/services/reputationService.ts`

```typescript
import { ethers } from "ethers";
import { CHAIN_CONFIG } from "../lib/chains";
import { REPUTATION_REGISTRY_ABI } from "../contracts/erc8004-abis";

export class ReputationService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;

  async connect(): Promise<string> {
    if (!window.ethereum) throw new Error("No wallet detected");
    this.provider = new ethers.BrowserProvider(window.ethereum);
    this.signer = await this.provider.getSigner();
    return await this.signer.getAddress();
  }

  /**
   * Submit feedback for an agent
   * @param agentId Agent's ERC-8004 token ID
   * @param score 0-100 rating
   * @param tags Array of tags like ["helpful", "fast", "accurate"]
   */
  async giveFeedback(
    agentId: number,
    score: number, // 0-100
    tags: string[],
    chainKey: "baseSepolia" | "hederaTestnet"
  ): Promise<string> {
    if (!this.signer) throw new Error("Wallet not connected");
    if (score < 0 || score > 100) throw new Error("Score must be 0-100");

    const config = CHAIN_CONFIG[chainKey];
    const reputationRegistry = new ethers.Contract(
      config.erc8004.reputationRegistry,
      REPUTATION_REGISTRY_ABI,
      this.signer
    );

    const tx = await reputationRegistry.giveFeedback(
      agentId,
      score,
      tags,
      "" // offchainFileUri (optional)
    );

    const receipt = await tx.wait();
    return receipt.hash;
  }

  /**
   * Get agent reputation summary
   */
  async getAgentReputation(
    agentId: number,
    chainKey: "baseSepolia" | "hederaTestnet"
  ): Promise<{
    feedbackCount: number;
    averageScore: number;
  }> {
    if (!this.provider) throw new Error("Provider not initialized");

    const config = CHAIN_CONFIG[chainKey];
    const reputationRegistry = new ethers.Contract(
      config.erc8004.reputationRegistry,
      REPUTATION_REGISTRY_ABI,
      this.provider
    );

    const [count, avgScore] = await reputationRegistry.getSummary(agentId);

    return {
      feedbackCount: Number(count),
      averageScore: Number(avgScore),
    };
  }

  /**
   * Get all feedback for an agent
   */
  async getAllFeedback(
    agentId: number,
    chainKey: "baseSepolia" | "hederaTestnet"
  ): Promise<
    Array<{
      client: string;
      score: number;
      tags: string[];
      timestamp: number;
      revoked: boolean;
    }>
  > {
    if (!this.provider) throw new Error("Provider not initialized");

    const config = CHAIN_CONFIG[chainKey];
    const reputationRegistry = new ethers.Contract(
      config.erc8004.reputationRegistry,
      REPUTATION_REGISTRY_ABI,
      this.provider
    );

    const count = await reputationRegistry.getFeedbackCount(agentId);
    const feedbacks = [];

    for (let i = 0; i < count; i++) {
      const feedback = await reputationRegistry.getFeedback(agentId, i);
      feedbacks.push({
        client: feedback.client,
        score: feedback.score,
        tags: feedback.tags,
        timestamp: Number(feedback.timestamp),
        revoked: feedback.revoked,
      });
    }

    return feedbacks;
  }
}

export const reputationService = new ReputationService();
```

### Phase 3: UI Integration (Priority: HIGH)

#### Task 3.1: Agent Deployment with Identity

**File:** `platform/components/StreamerInterface.tsx`

Modify agent deployment flow:

```tsx
import { identityService } from "../services/identityService";
import { supabase } from "../lib/supabase";

async function handleDeployAgent() {
  try {
    setIsDeploying(true);

    // 1. Connect wallet
    const walletAddress = await identityService.connect();

    // 2. Register agent on-chain (Base Sepolia)
    const { agentId, txHash, registrationUri } =
      await identityService.registerAgent(
        agentName,
        agentDescription,
        agentImageUrl,
        walletAddress,
        streamId,
        "baseSepolia"
      );

    // 3. Save to Supabase with ERC-8004 identity
    const { data, error } = await supabase.from("agents").insert({
      stream_id: streamId,
      name: agentName,
      description: agentDescription,
      wallet_address: walletAddress,
      position: { x: 0, y: 0, z: -3 },

      // ERC-8004 fields
      erc8004_agent_id: agentId,
      erc8004_chain: "baseSepolia",
      erc8004_registry: "0x8004AA63c570c570eBF15376c0dB199918BFe9Fb",
      erc8004_registration_uri: registrationUri,
      erc8004_tx_hash: txHash,
    });

    setIsDeploying(false);
    alert(`Agent deployed! Identity NFT #${agentId}`);
  } catch (error) {
    console.error("Agent deployment failed:", error);
    setIsDeploying(false);
  }
}
```

#### Task 3.2: Agent Badge with Identity

**File:** `platform/components/AgentIdentityBadge.tsx`

```tsx
import React, { useEffect, useState } from "react";
import { reputationService } from "../services/reputationService";

interface AgentIdentityBadgeProps {
  agentId: number;
  chain: "baseSepolia" | "hederaTestnet";
}

export const AgentIdentityBadge: React.FC<AgentIdentityBadgeProps> = ({
  agentId,
  chain,
}) => {
  const [reputation, setReputation] = useState<{
    feedbackCount: number;
    averageScore: number;
  } | null>(null);

  useEffect(() => {
    loadReputation();
  }, [agentId, chain]);

  async function loadReputation() {
    try {
      const rep = await reputationService.getAgentReputation(agentId, chain);
      setReputation(rep);
    } catch (error) {
      console.error("Failed to load reputation:", error);
    }
  }

  return (
    <div className="absolute top-0 right-0 bg-black/80 rounded-lg p-2 text-white text-xs">
      <div className="flex items-center gap-2">
        <span>🆔 #{agentId}</span>
        {reputation && reputation.feedbackCount > 0 && (
          <span>⭐ {reputation.averageScore}/100</span>
        )}
      </div>
      {reputation && (
        <div className="text-gray-400 mt-1">
          {reputation.feedbackCount} reviews
        </div>
      )}
    </div>
  );
};
```

#### Task 3.3: Feedback Modal

**File:** `platform/components/FeedbackModal.tsx`

```tsx
import React, { useState } from "react";
import { reputationService } from "../services/reputationService";

interface FeedbackModalProps {
  agentId: number;
  agentName: string;
  chain: "baseSepolia" | "hederaTestnet";
  onClose: () => void;
  onSuccess: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  agentId,
  agentName,
  chain,
  onClose,
  onSuccess,
}) => {
  const [score, setScore] = useState(80);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableTags = [
    "helpful",
    "fast",
    "accurate",
    "responsive",
    "creative",
    "professional",
  ];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await reputationService.connect();
      const txHash = await reputationService.giveFeedback(
        agentId,
        score,
        selectedTags,
        chain
      );

      onSuccess();
      alert(`Feedback submitted! TX: ${txHash}`);
    } catch (error) {
      console.error("Feedback submission failed:", error);
      alert("Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold text-white mb-4">Rate {agentName}</h2>

        {/* Score Slider */}
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">
            Score: {score}/100
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={score}
            onChange={(e) => setScore(Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Tags */}
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">
            Tags (optional)
          </label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  if (selectedTags.includes(tag)) {
                    setSelectedTags(selectedTags.filter((t) => t !== tag));
                  } else {
                    setSelectedTags([...selectedTags, tag]);
                  }
                }}
                className={`px-3 py-1 rounded-lg text-sm ${
                  selectedTags.includes(tag)
                    ? "bg-purple-600 text-white"
                    : "bg-gray-700 text-gray-300"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-lg disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Submit Feedback"}
        </button>

        <button
          onClick={onClose}
          className="w-full mt-2 py-2 text-gray-400 hover:text-white"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
```

### Phase 4: Database Schema Updates

#### Task 4.1: Add ERC-8004 Fields to Agents Table

**SQL Migration:**

```sql
-- Add ERC-8004 identity fields to agents table
ALTER TABLE agents ADD COLUMN IF NOT EXISTS erc8004_agent_id BIGINT;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS erc8004_chain TEXT;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS erc8004_registry TEXT;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS erc8004_registration_uri TEXT;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS erc8004_tx_hash TEXT;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS reputation_score INTEGER DEFAULT 0;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS reputation_count INTEGER DEFAULT 0;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_agents_erc8004_id ON agents(erc8004_agent_id, erc8004_chain);
```

---

## 🧪 Testing Checklist

### Identity Registration

- [ ] Connect wallet successfully
- [ ] Upload registration file to IPFS
- [ ] Mint ERC-8004 identity NFT on Base Sepolia
- [ ] Mint ERC-8004 identity NFT on Hedera Testnet
- [ ] Verify agentId returned correctly
- [ ] Save identity data to Supabase

### Reputation System

- [ ] Submit feedback with score 0-100
- [ ] Submit feedback with tags
- [ ] Fetch agent reputation summary
- [ ] Display reputation on agent badge
- [ ] Multiple feedbacks accumulate correctly

### UI Integration

- [ ] Agent deploys with identity badge
- [ ] Badge shows agentId
- [ ] Badge shows reputation score
- [ ] Feedback modal opens after payment
- [ ] Feedback submission succeeds

---

## 📋 Implementation Priority

| Priority  | Task                           | Time Estimate |
| --------- | ------------------------------ | ------------- |
| 🔴 HIGH   | IPFS upload service            | 0.5 day       |
| 🔴 HIGH   | Identity registration service  | 1 day         |
| 🔴 HIGH   | Agent deployment with identity | 1 day         |
| 🔴 HIGH   | Agent identity badge UI        | 0.5 day       |
| 🟡 MEDIUM | Reputation service             | 1 day         |
| 🟡 MEDIUM | Feedback modal UI              | 1 day         |
| 🟡 MEDIUM | Database schema updates        | 0.5 day       |
| 🟢 LOW    | Cross-chain sync               | 1 day         |
| 🟢 LOW    | Validation registry (future)   | 2 days        |

---

## 🔗 Resources

### ERC-8004 Documentation

Located in your codebase:

- **Specification:** `tools/erc-8004-contracts/ERC8004SPEC.md`
- **README:** `tools/erc-8004-contracts/README.md`
- **Security Tests:** `tools/erc-8004-contracts/SECURITY_TESTS.md`
- **Contract Source:** `tools/erc-8004-contracts/contracts/`

### External Links

- [ERC-8004 Specification](https://eips.ethereum.org/EIPS/eip-8004)
- [OpenZeppelin ERC-721](https://docs.openzeppelin.com/contracts/5.x/erc721)
- [IPFS Documentation](https://docs.ipfs.tech/)

---

## 🚀 Expected Outcome

After implementation:

```
1. Streamer deploys agent
2. System uploads registration to IPFS
3. System mints ERC-8004 identity NFT (agentId #42)
4. Agent appears with 🆔 badge showing "#42"
5. Viewer interacts with agent (pays, chats, etc.)
6. Viewer can leave feedback (score + tags)
7. Agent's reputation accumulates on-chain
8. Badge updates to show "⭐ 87/100 (23 reviews)"
9. High-reputation agents are more trusted
10. Future: Agents can be traded as NFTs on IPFi marketplace
```

---

## ⚠️ Important Notes

1. **Gas Costs:**

   - Identity registration: ~0.01 ETH (streamer pays)
   - Feedback submission: ~0.005 ETH (viewer pays)
   - Consider gas abstraction for better UX

2. **IPFS Gateway:**

   - Use reliable IPFS gateway (Infura, Pinata, or self-hosted)
   - Pin registration files to prevent expiration

3. **Chain Selection:**

   - Base Sepolia: Lower gas, faster finality
   - Hedera Testnet: Alternative for testing
   - Both chains have same contract addresses pattern

4. **Future Extensions:**
   - Validation Registry for zkML/TEE attestations
   - Cross-chain identity sync
   - Agent marketplace (IPFi)
   - Insurance/staking based on reputation

---

**Good luck with the implementation! 🎉**
