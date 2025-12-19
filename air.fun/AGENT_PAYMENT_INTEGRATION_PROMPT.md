# 🎯 Air.Fun Agent Payment Integration - Copilot Implementation Prompt

**Date:** December 11, 2025  
**Project:** air.fun Main Platform  
**Goal:** Integrate clickable AI agents with blockchain payment capabilities

---

## 📋 Overview

You are tasked with integrating **payment receiving functionality** into the air.fun streaming platform. The core feature is:

**Clickable AI agents that viewers can interact with to send crypto payments directly to the streamer's (deployer's) wallet.**

This integration is inspired by the **Cube Pay project** - an AR payment infrastructure where 3D agents can receive blockchain payments.

---

## 🎯 Core Requirements

### What We're Building

1. **Clickable 3D Agents** - Viewers can click on agents deployed by streamers
2. **Agent-Wallet Link** - Each agent is linked to the streamer's wallet address
3. **Payment Trigger** - Clicking an agent triggers a blockchain transaction
4. **Multi-Chain Support** - Base Sepolia, Hedera Testnet (Solana Devnet future)
5. **Direct Payments** - Funds go directly from viewer wallet to streamer wallet

### What We're NOT Building (Simplified Version)

- ❌ No bonding curve (direct tips only for now)
- ❌ No memecoin creation (simplified direct payment)
- ❌ No 6-face rotating cube (simple payment modal)
- ❌ No voice commands (click only)

---

## 🏗️ Architecture

### System Flow

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                    AGENT PAYMENT FLOW                                         │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│   STREAMER                          VIEWER                                    │
│   ┌─────────────────────┐           ┌─────────────────────┐                  │
│   │ 1. Connect Wallet   │           │ 1. Watch Stream     │                  │
│   │ 2. Start Stream     │           │ 2. See 3D Agents    │                  │
│   │ 3. Deploy Agent     │           │ 3. Click Agent      │                  │
│   │    (linked to wallet)│           │ 4. Payment Modal    │                  │
│   └─────────────────────┘           │ 5. Confirm TX       │                  │
│                                      └──────────┬──────────┘                  │
│                                                 │                             │
│                                                 ▼                             │
│   ┌──────────────────────────────────────────────────────────────────────┐   │
│   │                      BLOCKCHAIN LAYER                                 │   │
│   │                                                                       │   │
│   │   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐            │   │
│   │   │Base Sepolia │     │   Hedera    │     │   Solana    │            │   │
│   │   │  (84532)    │     │  Testnet    │     │   Devnet    │            │   │
│   │   │             │     │   (296)     │     │  (Future)   │            │   │
│   │   │ USDC Token  │     │ USDh Token  │     │   USDC      │            │   │
│   │   └─────────────┘     └─────────────┘     └─────────────┘            │   │
│   │                                                                       │   │
│   │   Direct ERC-20/HTS Transfer: Viewer Wallet → Streamer Wallet        │   │
│   └──────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

### Development Location

```
air.fun/air.fun_main/
├── platform/                    # Native streaming platform
│   ├── components/
│   │   ├── Agent3D.tsx          # 3D agent rendering (MODIFY)
│   │   ├── AgentPaymentModal.tsx # NEW: Payment modal component
│   │   ├── PaymentService.ts    # NEW: Blockchain payment service
│   │   └── ViewerInterface.tsx  # Viewer experience (MODIFY)
│   ├── services/
│   │   └── blockchainService.ts # NEW: Multi-chain payment service
│   └── lib/
│       └── chains.ts            # NEW: Chain configuration
│
├── filter/                      # Chrome extension (similar changes)
│   └── extension/
│       └── src/
│           ├── content/
│           │   └── viewer.ts    # MODIFY: Add payment handling
│           └── shared/
│               └── payment.ts   # NEW: Payment utilities
│
└── shared/                      # Shared types
    └── types/
        └── payment.ts           # NEW: Payment types
```

### Reference Blockchain Integration From

```
air.fun/air.fun_blockchain_integration/
├── BLOCKCHAIN.md                # Contract addresses
├── BLOCKCHAIN_INTEGRATION.md    # Integration code examples
└── CONTRACTS_QUICK_REFERENCE.md # Quick reference
```

---

## 🔗 Blockchain Configuration

### Chain IDs & Networks

| Chain          | Chain ID | Network | RPC URL                                |
| -------------- | -------- | ------- | -------------------------------------- |
| Base Sepolia   | 84532    | Testnet | https://sepolia.base.org               |
| Hedera Testnet | 296      | Testnet | https://testnet.hashio.io/api          |
| Solana Devnet  | -        | Devnet  | https://api.devnet.solana.com (Future) |

### Stablecoin Addresses (Payment Tokens)

```typescript
// chains.ts - Chain configuration

export const CHAIN_CONFIG = {
  baseSepolia: {
    chainId: 84532,
    name: "Base Sepolia",
    rpcUrl: "https://sepolia.base.org",
    stablecoin: {
      address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // USDC
      symbol: "USDC",
      decimals: 6,
    },
    explorer: "https://sepolia.basescan.org",
  },
  hederaTestnet: {
    chainId: 296,
    name: "Hedera Testnet",
    rpcUrl: "https://testnet.hashio.io/api",
    stablecoin: {
      address: "0x00000000000000000000000000000000006e24c7", // USDh
      tokenId: "0.0.7200455",
      symbol: "USDh",
      decimals: 6,
    },
    explorer: "https://hashscan.io/testnet",
  },
  solanaDevnet: {
    // FUTURE - Not yet implemented
    name: "Solana Devnet",
    rpcUrl: "https://api.devnet.solana.com",
    stablecoin: {
      address: "TBD",
      symbol: "USDC",
      decimals: 6,
    },
  },
};
```

---

## 📦 Implementation Tasks

### Task 1: Agent Data Model Update

**File:** `shared/types/agent.ts`

Add payment-related fields to agent type:

```typescript
export interface Agent {
  id: string;
  name: string;
  type: "payable_cube" | "interactive_jam" | "prediction_bot" | "game_buddy";

  // Existing fields
  position: { x: number; y: number; z: number };
  streamId: string;

  // NEW: Payment fields
  walletAddress: string; // Streamer's wallet (receives payments)
  paymentEnabled: boolean; // Whether agent can receive payments
  defaultTipAmount: number; // Suggested tip amount (e.g., 1.00 USDC)
  supportedChains: ("baseSepolia" | "hederaTestnet" | "solanaDevnet")[];
}
```

### Task 2: Payment Service

**File:** `platform/services/blockchainService.ts`

Create multi-chain payment service:

```typescript
import { ethers } from "ethers";

// ERC-20 ABI (minimal for transfer)
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
];

export class PaymentService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;

  async connect(): Promise<string> {
    if (!window.ethereum) {
      throw new Error("No wallet detected");
    }

    this.provider = new ethers.BrowserProvider(window.ethereum);
    this.signer = await this.provider.getSigner();
    return await this.signer.getAddress();
  }

  async switchChain(chainId: number): Promise<void> {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error: any) {
      // Chain not added, add it
      if (error.code === 4902) {
        await this.addChain(chainId);
      } else {
        throw error;
      }
    }
  }

  async sendPayment(
    toAddress: string,
    amount: number,
    chainId: number
  ): Promise<string> {
    if (!this.signer) {
      throw new Error("Wallet not connected");
    }

    // Switch to correct chain
    await this.switchChain(chainId);

    // Get stablecoin config
    const chainConfig = this.getChainConfig(chainId);
    const stablecoinAddress = chainConfig.stablecoin.address;
    const decimals = chainConfig.stablecoin.decimals;

    // Create token contract instance
    const tokenContract = new ethers.Contract(
      stablecoinAddress,
      ERC20_ABI,
      this.signer
    );

    // Convert amount to token units
    const amountInUnits = ethers.parseUnits(amount.toString(), decimals);

    // Execute transfer
    const tx = await tokenContract.transfer(toAddress, amountInUnits);
    const receipt = await tx.wait();

    return receipt.hash;
  }

  private getChainConfig(chainId: number) {
    // Return chain config based on chainId
    // Implementation based on CHAIN_CONFIG
  }
}

export const paymentService = new PaymentService();
```

### Task 3: Agent Payment Modal Component

**File:** `platform/components/AgentPaymentModal.tsx`

Create payment UI component:

```tsx
import React, { useState } from "react";
import { paymentService } from "../services/blockchainService";
import { CHAIN_CONFIG } from "../lib/chains";

interface AgentPaymentModalProps {
  agent: {
    id: string;
    name: string;
    walletAddress: string;
    defaultTipAmount: number;
    supportedChains: string[];
  };
  onClose: () => void;
  onSuccess: (txHash: string) => void;
}

export const AgentPaymentModal: React.FC<AgentPaymentModalProps> = ({
  agent,
  onClose,
  onSuccess,
}) => {
  const [amount, setAmount] = useState(agent.defaultTipAmount);
  const [selectedChain, setSelectedChain] = useState(agent.supportedChains[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Connect wallet if not connected
      await paymentService.connect();

      // Get chain ID
      const chainConfig = CHAIN_CONFIG[selectedChain];

      // Send payment
      const txHash = await paymentService.sendPayment(
        agent.walletAddress,
        amount,
        chainConfig.chainId
      );

      onSuccess(txHash);
    } catch (err: any) {
      setError(err.message || "Payment failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Tip {agent.name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        {/* Chain Selector */}
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">
            Select Network
          </label>
          <div className="flex gap-2">
            {agent.supportedChains.map((chain) => (
              <button
                key={chain}
                onClick={() => setSelectedChain(chain)}
                className={`px-4 py-2 rounded-lg ${
                  selectedChain === chain
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300"
                }`}
              >
                {CHAIN_CONFIG[chain].name}
              </button>
            ))}
          </div>
        </div>

        {/* Amount Input */}
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">
            Amount ({CHAIN_CONFIG[selectedChain].stablecoin.symbol})
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value))}
            className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg"
            step="0.01"
            min="0.01"
          />
          {/* Quick amounts */}
          <div className="flex gap-2 mt-2">
            {[1, 5, 10, 25].map((preset) => (
              <button
                key={preset}
                onClick={() => setAmount(preset)}
                className="px-3 py-1 bg-gray-700 rounded text-sm text-white"
              >
                ${preset}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Payment Button */}
        <button
          onClick={handlePayment}
          disabled={isLoading}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-lg disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span>
              Processing...
            </span>
          ) : (
            `Send ${amount} ${CHAIN_CONFIG[selectedChain].stablecoin.symbol}`
          )}
        </button>

        {/* Wallet Address */}
        <p className="mt-4 text-xs text-gray-500 text-center">
          Sending to: {agent.walletAddress.slice(0, 10)}...
          {agent.walletAddress.slice(-8)}
        </p>
      </div>
    </div>
  );
};
```

### Task 4: Integrate with Agent3D Component

**File:** `platform/components/Agent3D.tsx`

Modify to handle clicks and trigger payment:

```tsx
import React, { useState } from "react";
import { useThree } from "@react-three/fiber";
import { AgentPaymentModal } from "./AgentPaymentModal";

interface Agent3DProps {
  agent: Agent;
  onClick?: () => void;
}

export const Agent3D: React.FC<Agent3DProps> = ({ agent }) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [lastPaymentTx, setLastPaymentTx] = useState<string | null>(null);

  const handleAgentClick = () => {
    if (agent.paymentEnabled) {
      setShowPaymentModal(true);
    }
  };

  const handlePaymentSuccess = (txHash: string) => {
    setLastPaymentTx(txHash);
    setShowPaymentModal(false);

    // Show success notification
    console.log(`Payment successful! TX: ${txHash}`);

    // TODO: Emit event to notify streamer of tip
  };

  return (
    <>
      {/* 3D Agent Mesh - Clickable */}
      <mesh
        position={[agent.position.x, agent.position.y, agent.position.z]}
        onClick={handleAgentClick}
      >
        {/* Your existing 3D model rendering */}
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={agent.paymentEnabled ? "#00ff00" : "#888888"}
        />

        {/* Glow effect for payable agents */}
        {agent.paymentEnabled && (
          <pointLight color="#00ff00" intensity={0.5} distance={3} />
        )}
      </mesh>

      {/* Payment Modal (rendered outside 3D canvas) */}
      {showPaymentModal && (
        <AgentPaymentModal
          agent={agent}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
};
```

### Task 5: Chrome Extension Integration (Filter Mode)

**File:** `filter/extension/src/content/viewer.ts`

Add payment handling for filter/extension mode:

```typescript
// Add to existing viewer.ts

import { CHAIN_CONFIG } from "../shared/chains";

interface PaymentRequest {
  agentId: string;
  streamerWallet: string;
  amount: number;
  chain: "baseSepolia" | "hederaTestnet";
}

class ViewerPaymentHandler {
  private currentPaymentRequest: PaymentRequest | null = null;

  handleAgentClick(agent: Agent): void {
    if (!agent.paymentEnabled) return;

    // Create payment modal overlay
    this.showPaymentModal({
      agentId: agent.id,
      streamerWallet: agent.walletAddress,
      amount: agent.defaultTipAmount,
      chain: agent.supportedChains[0],
    });
  }

  private showPaymentModal(request: PaymentRequest): void {
    // Create DOM overlay for payment
    const modal = document.createElement("div");
    modal.id = "airfun-payment-modal";
    modal.innerHTML = `
      <div style="
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
      ">
        <div style="
          background: #1a1a2e;
          padding: 24px;
          border-radius: 16px;
          max-width: 400px;
          width: 90%;
        ">
          <h2 style="color: white; margin-bottom: 16px;">
            Send Tip
          </h2>
          
          <div style="margin-bottom: 16px;">
            <label style="color: #888; display: block; margin-bottom: 8px;">
              Amount (${CHAIN_CONFIG[request.chain].stablecoin.symbol})
            </label>
            <input 
              type="number" 
              id="tip-amount"
              value="${request.amount}"
              style="
                width: 100%;
                padding: 12px;
                background: #2a2a3e;
                border: none;
                border-radius: 8px;
                color: white;
              "
            />
          </div>
          
          <button 
            id="confirm-payment"
            style="
              width: 100%;
              padding: 16px;
              background: linear-gradient(to right, #7c3aed, #2563eb);
              color: white;
              border: none;
              border-radius: 8px;
              font-weight: bold;
              cursor: pointer;
            "
          >
            Send Payment
          </button>
          
          <button 
            id="cancel-payment"
            style="
              width: 100%;
              padding: 12px;
              margin-top: 8px;
              background: transparent;
              color: #888;
              border: none;
              cursor: pointer;
            "
          >
            Cancel
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Handle confirm
    document
      .getElementById("confirm-payment")
      ?.addEventListener("click", async () => {
        const amount = parseFloat(
          (document.getElementById("tip-amount") as HTMLInputElement).value
        );
        await this.executePayment(
          request.streamerWallet,
          amount,
          request.chain
        );
        modal.remove();
      });

    // Handle cancel
    document.getElementById("cancel-payment")?.addEventListener("click", () => {
      modal.remove();
    });
  }

  private async executePayment(
    toAddress: string,
    amount: number,
    chain: string
  ): Promise<void> {
    // Send message to service worker to execute payment
    chrome.runtime.sendMessage({
      type: "EXECUTE_PAYMENT",
      payload: { toAddress, amount, chain },
    });
  }
}
```

---

## 🧪 Testing Plan

### Test Scenarios

1. **Streamer deploys agent with wallet address**

   - Verify agent.walletAddress is saved correctly
   - Verify agent.paymentEnabled = true

2. **Viewer clicks payable agent**

   - Payment modal opens
   - Chain selector works
   - Amount input works

3. **Viewer sends payment on Base Sepolia**

   - Wallet connects
   - Chain switches to 84532
   - USDC transfer executes
   - TX hash returned

4. **Viewer sends payment on Hedera Testnet**

   - Wallet connects
   - Chain switches to 296
   - USDh transfer executes
   - TX hash returned

5. **Filter mode payment**
   - Canvas overlay agent is clickable
   - Payment modal appears as DOM overlay
   - Payment executes correctly

### Test Wallets

```
Streamer Test Wallet: Use any MetaMask wallet
Viewer Test Wallet: Use any MetaMask wallet

Get Test Tokens:
- Base Sepolia USDC: Faucet at https://faucet.circle.com/
- Hedera Testnet USDh: Faucet or use existing test tokens
```

---

## 📋 Implementation Checklist

### Phase 1: Core Payment Infrastructure

- [ ] Create `shared/types/payment.ts` with payment types
- [ ] Create `platform/lib/chains.ts` with chain configuration
- [ ] Create `platform/services/blockchainService.ts` with PaymentService class
- [ ] Test wallet connection and chain switching

### Phase 2: Platform Integration

- [ ] Update `Agent` type with payment fields
- [ ] Create `AgentPaymentModal.tsx` component
- [ ] Modify `Agent3D.tsx` to handle clicks and show modal
- [ ] Add payment success/error handling
- [ ] Test end-to-end payment flow

### Phase 3: Filter Extension

- [ ] Add payment handler to `viewer.ts`
- [ ] Create DOM overlay for payment modal
- [ ] Implement service worker message passing
- [ ] Test on Twitch/YouTube with extension

### Phase 4: Database & Backend

- [ ] Add payment fields to Supabase agents table
- [ ] Create payment history table
- [ ] Add real-time payment notifications
- [ ] Notify streamer of incoming tips

---

## 🔗 Reference Materials

### From Cube Pay Project

- Payment cube concept with multi-chain support
- QR code generation for crypto payments
- Agent-wallet linking pattern

### From Blockchain Integration Folder

```
air.fun/air.fun_blockchain_integration/
├── BLOCKCHAIN.md           # All contract addresses
├── BLOCKCHAIN_INTEGRATION.md # TypeScript integration examples
└── USER_FLOWS.md           # Complete user flows
```

### Tech Stack (Main Project)

- React 18 + TypeScript + Vite
- Three.js + @react-three/fiber (3D)
- Thirdweb SDK (wallet connection) - OR can use ethers.js directly
- WebSocket for real-time sync
- Supabase for database

---

## ⚠️ Important Notes

1. **Use ethers.js v6** - The project should use ethers v6 syntax
2. **Direct transfers only** - No smart contract interaction for tips (just ERC-20 transfer)
3. **Streamer wallet = Agent wallet** - Agent's wallet address is the streamer's wallet
4. **Test on testnets first** - Base Sepolia and Hedera Testnet only
5. **Future: Solana Devnet** - Architecture should allow adding Solana later

---

## 🚀 Expected Outcome

After implementation, the flow will be:

```
1. Streamer starts stream
2. Streamer deploys AI agent (linked to their wallet)
3. Agent appears on stream (3D in platform, canvas in filter)
4. Viewer clicks agent
5. Payment modal opens with chain selector
6. Viewer selects Base Sepolia or Hedera Testnet
7. Viewer enters tip amount (default or custom)
8. Viewer clicks "Send Payment"
9. Wallet prompts for transaction approval
10. USDC/USDh transfers from viewer to streamer wallet
11. Success notification shown
12. Streamer sees incoming tip in real-time
```

---

**Good luck with the implementation! 🎉**
