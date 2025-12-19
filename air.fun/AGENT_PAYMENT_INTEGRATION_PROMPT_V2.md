# 🎯 Air.Fun Agent Payment Integration - Copilot Implementation Prompt V2

**Date:** December 11, 2025  
**Project:** air.fun Main Platform  
**Version:** 2.0 - Unified Cube Agent with 6 Functional Faces

---

## 🌐 Background: AR Payment Infrastructure

### What is AR Viewer & AgentSphere?

**AR Viewer** and **AgentSphere** are pioneering projects building the **world's first payment infrastructure for Augmented Reality applications**. The core innovation is:

- **AI agents represented as interactive 3D objects** in AR space
- **Users pay agents** using innovative 3D interfaces (the "Cube Pay" concept)
- **Multi-chain blockchain integration** (Hedera, Solana, Base, Ethereum testnets)
- **GPS-positioned agents** at real-world locations with RTK GPS precision
- **QR code generation** for seamless crypto payments

### The Cube Pay Concept

Instead of flat traditional payment modals, users interact with a **floating 3D payment cube** that:

- Rotates interactively in 3D space
- Has 6 faces representing different functions/payment methods
- Creates an immersive payment experience
- Integrates blockchain, AI, and AR technologies

### What We're Bringing to Air.Fun

From the Cube Pay / AR Viewer projects, we're adapting:

| Component       | Original (AR Viewer)    | Adapted for Air.Fun            |
| --------------- | ----------------------- | ------------------------------ |
| **3D Cube**     | Payment method selector | Multi-function agent interface |
| **Rotation**    | Mouse/touch drag        | Same - drag to rotate          |
| **Blockchain**  | Multi-chain payments    | Base Sepolia + Hedera Testnet  |
| **Wallet Link** | Agent-to-wallet binding | Streamer wallet binding        |
| **QR Payments** | Crypto QR codes         | Integrated in Payment face     |

---

## 📋 Project Overview

### What is Air.Fun?

**Air.Fun** is a decentralized livestreaming platform where:

- **Streamers** broadcast live content and deploy interactive AI agents
- **Viewers** watch streams and interact with agents to support creators
- **Agents** are 3D cubes with multiple functions (payments, chat, games, etc.)
- **Blockchain** handles all payments with instant settlement

### What We're Building

**A unified 3D cube agent** that viewers can:

1. **Rotate** with mouse/finger during live streams
2. **Click different faces** for different interactions
3. **Pay streamers** via crypto (bonding curve pre-graduation, DEX post-graduation)
4. **Chat, play games, make predictions** via other faces

---

## 🎮 The Unified Cube Agent Design

### Single Agent Type with 6 Functional Faces

Instead of multiple agent types, we have **ONE universal cube** where each face serves a specific function:

```
                              ┌─────────────────────┐
                              │       TOP           │
                              │   🎮 GAMES          │
                              │   Mini-games &      │
                              │   Challenges        │
                              └─────────────────────┘
                                       │
      ┌──────────────────┬─────────────┴─────────────┬──────────────────┐
      │      LEFT        │          FRONT            │      RIGHT       │
      │                  │                           │                  │
      │   💬 CHAT        │   💰 PAYMENT              │   🎤 VOICE       │
      │                  │                           │                  │
      │   Text chat      │   Crypto (USDC/USDh/AIR)  │   Voice chat     │
      │   with agent     │   + Card (placeholder)    │   with agent     │
      │                  │                           │                  │
      └──────────────────┴─────────────┬─────────────┴──────────────────┘
                                       │
                              ┌────────┴────────────┐
                              │       BACK          │
                              │   🔮 PREDICTIONS    │
                              │   Betting &         │
                              │   Markets           │
                              └─────────────────────┘
                                       │
                              ┌────────┴────────────┐
                              │      BOTTOM         │
                              │   🎁 DIRECT TIP     │
                              │   Pure tip to       │
                              │   streamer (95%)    │
                              └─────────────────────┘
```

### Face Functions Summary

| Face       | Icon | Function                            | Implementation Priority |
| ---------- | ---- | ----------------------------------- | ----------------------- |
| **FRONT**  | 💰   | Payment (Crypto + Card placeholder) | ✅ HIGH - Core feature  |
| **BACK**   | 🔮   | Predictions (Betting/markets)       | ⏳ MEDIUM               |
| **LEFT**   | 💬   | Chat (Text with agent)              | ⏳ MEDIUM               |
| **RIGHT**  | 🎤   | Voice Chat (Voice interaction)      | ⏳ MEDIUM               |
| **TOP**    | 🎮   | Games (Mini-games/challenges)       | ⏳ MEDIUM               |
| **BOTTOM** | 🎁   | Direct Tip (Pure tip to streamer)   | ✅ HIGH - Core feature  |

---

## 💰 Payment Face: Pre vs Post Graduation

The **FRONT (Payment) face** dynamically changes based on the stream's memecoin graduation status:

### Pre-Graduation (Market Cap < $69,000)

```
┌─────────────────────────────────────────────────────────────────┐
│  💰 PAYMENT FACE - PRE-GRADUATION                               │
│  🟡 Yellow Glow Effect                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────┐  ┌─────────────────────┐               │
│  │   📱 CRYPTO         │  │   💳 CARD           │               │
│  │                     │  │                     │               │
│  │   Buy with          │  │   Buy with Card     │               │
│  │   USDC / USDh       │  │   (Coming Soon)     │               │
│  │                     │  │                     │               │
│  │   ✅ ACTIVE         │  │   🔒 PLACEHOLDER    │               │
│  └─────────────────────┘  └─────────────────────┘               │
│                                                                  │
│  Via Bonding Curve Contract:                                    │
│  • 95% → Streamer (Creator)                                     │
│  • 5% → Platform                                                │
│  • Viewer receives: Memecoin tokens                             │
│                                                                  │
│  Progress: ████████░░░░ $45,000 / $69,000                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Post-Graduation (Market Cap ≥ $69,000)

```
┌─────────────────────────────────────────────────────────────────┐
│  📈 DEX TRADING FACE - POST-GRADUATION                          │
│  🟢 Green Glow Effect + 🎓 Badge                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────┐  ┌─────────────────────┐               │
│  │   📱 TRADE DEX      │  │   💳 CARD           │               │
│  │                     │  │                     │               │
│  │   Buy/Sell with     │  │   Buy with Card     │               │
│  │   AIR Token         │  │   (Coming Soon)     │               │
│  │                     │  │                     │               │
│  │   ✅ ACTIVE         │  │   🔒 PLACEHOLDER    │               │
│  └─────────────────────┘  └─────────────────────┘               │
│                                                                  │
│  Liquidity Pool: MEMECOIN / AIR                                 │
│  Trade on DEX: Buy or Sell memecoin                             │
│                                                                  │
│  🎓 GRADUATED - Trading Live on DEX!                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Direct Tip Face (BOTTOM) - Always Available

```
┌─────────────────────────────────────────────────────────────────┐
│  🎁 DIRECT TIP FACE                                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Tip streamer directly (pure support, no tokens back):          │
│                                                                  │
│  PRE-GRADUATION:  Pay with USDC / USDh                          │
│  POST-GRADUATION: Pay with AIR token                            │
│                                                                  │
│  Fee Distribution:                                               │
│  • 95% → Streamer                                               │
│  • 5% → Platform                                                │
│                                                                  │
│  ⚠️ Direct tip = NO tokens back (pure support)                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Visual Design: Graduation Indicators

### Glow Effects

| Status          | Glow Color | Description                           |
| --------------- | ---------- | ------------------------------------- |
| Pre-Graduation  | 🟡 Yellow  | Pulsing yellow glow, shows progress   |
| Post-Graduation | 🟢 Green   | Steady green glow + 🎓 floating badge |

### Cube Appearance

```
PRE-GRADUATION:                      POST-GRADUATION:

    ╔═══════════╗                       ╔═══════════╗
    ║           ║                       ║    🎓     ║  ← Floating badge
    ║   CUBE    ║  🟡 Yellow glow       ║   CUBE    ║  🟢 Green glow
    ║           ║  (pulsing)            ║           ║  (steady)
    ╚═══════════╝                       ╚═══════════╝

    Progress bar visible               "GRADUATED" text
    on Payment face                    on Payment face
```

---

## 🔧 Tech Stack Required

### Frontend (Platform)

| Package                 | Version | Purpose                                      |
| ----------------------- | ------- | -------------------------------------------- |
| `react`                 | 18.3.x  | UI framework                                 |
| `react-dom`             | 18.3.x  | React DOM renderer                           |
| `typescript`            | 5.8.x   | Type-safe JavaScript                         |
| `vite`                  | 6.2.x   | Build tool & dev server                      |
| `three`                 | 0.164.x | 3D graphics library                          |
| `@react-three/fiber`    | 8.16.x  | React renderer for Three.js                  |
| `@react-three/drei`     | 9.105.x | Useful R3F helpers                           |
| `ethers`                | 6.x     | Ethereum/EVM blockchain interaction          |
| `@supabase/supabase-js` | 2.86.x  | Database, auth, real-time                    |
| `thirdweb`              | 5.114.x | Wallet connection (optional, can use ethers) |

### Backend / Database

| Service              | Purpose                                       |
| -------------------- | --------------------------------------------- |
| **Supabase**         | PostgreSQL database + real-time subscriptions |
| **Redis** (optional) | Price caching, state sync                     |

### Blockchain

| Chain          | Chain ID | RPC URL                       | Stablecoin    |
| -------------- | -------- | ----------------------------- | ------------- |
| Base Sepolia   | 84532    | https://sepolia.base.org      | USDC          |
| Hedera Testnet | 296      | https://testnet.hashio.io/api | USDh          |
| Solana Devnet  | -        | https://api.devnet.solana.com | USDC (Future) |

### Chrome Extension (Filter Mode)

| Package         | Version | Purpose                |
| --------------- | ------- | ---------------------- |
| `typescript`    | 5.8.x   | Type-safe JavaScript   |
| `vite`          | 6.2.x   | Build tool             |
| `@types/chrome` | 0.0.280 | Chrome extension types |
| `ws`            | 8.18.x  | WebSocket (server)     |

---

## 🔗 Blockchain Configuration

### Token Addresses

```typescript
// lib/chains.ts

export const CHAIN_CONFIG = {
  baseSepolia: {
    chainId: 84532,
    name: "Base Sepolia",
    rpcUrl: "https://sepolia.base.org",
    explorer: "https://sepolia.basescan.org",

    // Stablecoin (Pre-graduation payments)
    stablecoin: {
      address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      symbol: "USDC",
      decimals: 6,
    },

    // Platform token (Post-graduation payments)
    airToken: {
      address: "0xB2D4ED0c17487ABfEfC4d3feEE7EB860e82aA3f7",
      symbol: "AIR",
      decimals: 18,
    },

    // Factory contracts
    memecoinFactory: "0x3c4ceDfE7F0a20013B0adae70443d0102166Db54",
    liquidityPoolFactory: "0x5834aEe88F9163a4146B3053D2Ffa34Bf53b6727",
  },

  hederaTestnet: {
    chainId: 296,
    name: "Hedera Testnet",
    rpcUrl: "https://testnet.hashio.io/api",
    explorer: "https://hashscan.io/testnet",

    // Stablecoin (Pre-graduation payments)
    stablecoin: {
      address: "0x00000000000000000000000000000000006e24c7",
      tokenId: "0.0.7200455",
      symbol: "USDh",
      decimals: 6,
    },

    // Platform token (Post-graduation payments)
    airToken: {
      address: "0x00000000000000000000000000000000007052b7",
      tokenId: "0.0.7361207",
      symbol: "AIR",
      decimals: 18,
    },

    // Factory contracts
    memecoinFactory: "0x210542A52aF3c0A5854B75E84C67312Ffe6F004A",
    liquidityPoolFactory: "0x6796cb5394c66f194771b059c54137a9eD64cbEa",
  },

  // FUTURE: Solana Devnet
  solanaDevnet: {
    name: "Solana Devnet",
    rpcUrl: "https://api.devnet.solana.com",
    stablecoin: { address: "TBD", symbol: "USDC", decimals: 6 },
    airToken: { address: "TBD", symbol: "AIR", decimals: 9 },
  },
};

// FUTURE: USDair will replace USDC/USDh as unified stablecoin
export const FUTURE_TOKENS = {
  usdair: {
    description: "Unified platform stablecoin (replaces USDC/USDh)",
    status: "PLANNED",
  },
};
```

### Platform Wallet

```typescript
export const PLATFORM_WALLET = "0x97b83759eadb2503a8947e8d6eb734795cdefc95";
```

---

## 📁 Project Structure

### Development Location

```
air.fun/air.fun_main/
├── platform/                        # Native streaming platform
│   ├── App.tsx                      # Main app
│   ├── components/
│   │   ├── CubeAgent.tsx            # NEW: 3D rotating cube agent
│   │   ├── CubeFaces/               # NEW: Individual face components
│   │   │   ├── PaymentFace.tsx      # Payment (Crypto + Card)
│   │   │   ├── DirectTipFace.tsx    # Direct tip
│   │   │   ├── ChatFace.tsx         # Text chat
│   │   │   ├── VoiceFace.tsx        # Voice chat
│   │   │   ├── GamesFace.tsx        # Games/challenges
│   │   │   └── PredictionsFace.tsx  # Predictions/betting
│   │   ├── PaymentModal.tsx         # NEW: Payment modal component
│   │   ├── GraduationBadge.tsx      # NEW: 🎓 Graduation indicator
│   │   ├── StreamerInterface.tsx    # Streamer dashboard (MODIFY)
│   │   └── ViewerInterface.tsx      # Viewer experience (MODIFY)
│   ├── services/
│   │   ├── paymentService.ts        # NEW: Multi-chain payment logic
│   │   ├── bondingCurveService.ts   # NEW: Bonding curve interactions
│   │   ├── dexService.ts            # NEW: DEX trading (post-graduation)
│   │   └── graduationService.ts     # NEW: Check graduation status
│   ├── hooks/
│   │   ├── useCubeRotation.ts       # NEW: Mouse/touch rotation
│   │   ├── useGraduationStatus.ts   # NEW: Track graduation
│   │   └── usePaymentToken.ts       # NEW: Get correct token
│   ├── lib/
│   │   ├── chains.ts                # NEW: Chain configuration
│   │   └── supabase.ts              # Existing: Supabase client
│   └── types/
│       ├── agent.ts                 # MODIFY: Add cube agent types
│       └── payment.ts               # NEW: Payment types
│
├── filter/                          # Chrome extension
│   └── extension/
│       └── src/
│           ├── content/
│           │   ├── cube-overlay.ts  # NEW: 2D cube representation
│           │   └── viewer.ts        # MODIFY: Add cube interactions
│           └── shared/
│               └── payment.ts       # NEW: Payment utilities
│
└── shared/                          # Shared types
    └── types/
        └── cube-agent.ts            # NEW: Shared cube types
```

### Reference From Blockchain Integration

```
air.fun/air.fun_blockchain_integration/
├── BLOCKCHAIN.md                    # All contract addresses
├── BLOCKCHAIN_INTEGRATION.md        # TypeScript integration examples
├── CONTRACTS_QUICK_REFERENCE.md     # Quick reference
└── USER_FLOWS.md                    # Complete user flows & economics
```

---

## 🎯 Implementation Tasks

### Phase 1: Core Cube Agent (Priority: HIGH)

#### Task 1.1: Create Rotating Cube Component

**File:** `platform/components/CubeAgent.tsx`

```tsx
import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useCubeRotation } from "../hooks/useCubeRotation";
import { useGraduationStatus } from "../hooks/useGraduationStatus";

interface CubeAgentProps {
  streamId: string;
  streamerWallet: string;
  position: [number, number, number];
  onFaceClick: (face: CubeFace, data: any) => void;
}

type CubeFace = "front" | "back" | "left" | "right" | "top" | "bottom";

export const CubeAgent: React.FC<CubeAgentProps> = ({
  streamId,
  streamerWallet,
  position,
  onFaceClick,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { isGraduated, marketCap, threshold } = useGraduationStatus(streamId);
  const {
    isDragging,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    velocity,
  } = useCubeRotation();

  // Auto-rotate when not dragging
  useFrame((state, delta) => {
    if (!meshRef.current || isDragging) return;

    // Apply momentum from drag
    meshRef.current.rotation.x += velocity.x;
    meshRef.current.rotation.y += velocity.y;

    // Slow auto-rotation when idle
    if (Math.abs(velocity.x) < 0.001 && Math.abs(velocity.y) < 0.001) {
      meshRef.current.rotation.y += delta * 0.2; // Slow spin
    }
  });

  // Determine glow color based on graduation
  const glowColor = isGraduated ? "#22c55e" : "#eab308"; // Green or Yellow

  // Detect which face was clicked
  const handleClick = (event: THREE.Event) => {
    event.stopPropagation();
    const face = detectClickedFace(event.faceIndex);
    onFaceClick(face, { streamId, streamerWallet, isGraduated });
  };

  return (
    <group position={position}>
      {/* Glow effect */}
      <pointLight
        color={glowColor}
        intensity={isGraduated ? 1 : 0.7}
        distance={5}
      />

      {/* Graduation badge */}
      {isGraduated && (
        <sprite position={[0, 1.5, 0]} scale={[0.5, 0.5, 1]}>
          {/* 🎓 Badge texture */}
        </sprite>
      )}

      {/* The Cube */}
      <mesh
        ref={meshRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={handleClick}
      >
        <boxGeometry args={[2, 2, 2]} />
        {/* 6 materials for 6 faces */}
        <meshStandardMaterial attach="material-0" color="#3b82f6" />{" "}
        {/* Right: Voice */}
        <meshStandardMaterial attach="material-1" color="#8b5cf6" /> {/* Left: Chat */}
        <meshStandardMaterial attach="material-2" color="#22c55e" />{" "}
        {/* Top: Games */}
        <meshStandardMaterial attach="material-3" color="#f97316" /> {/* Bottom: Tip */}
        <meshStandardMaterial attach="material-4" color="#10b981" />{" "}
        {/* Front: Payment */}
        <meshStandardMaterial attach="material-5" color="#6366f1" /> {/* Back: Predictions */}
      </mesh>
    </group>
  );
};

function detectClickedFace(faceIndex: number): CubeFace {
  // Three.js box geometry: 2 triangles per face, faceIndex / 2 gives face
  const faceMap: CubeFace[] = [
    "right",
    "left",
    "top",
    "bottom",
    "front",
    "back",
  ];
  return faceMap[Math.floor(faceIndex / 2)];
}
```

#### Task 1.2: Cube Rotation Hook

**File:** `platform/hooks/useCubeRotation.ts`

```typescript
import { useState, useCallback } from "react";

export function useCubeRotation() {
  const [isDragging, setIsDragging] = useState(false);
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });

  const handlePointerDown = useCallback((event: any) => {
    event.stopPropagation();
    setIsDragging(true);
    setLastPosition({ x: event.clientX, y: event.clientY });
  }, []);

  const handlePointerMove = useCallback(
    (event: any) => {
      if (!isDragging) return;

      const deltaX = event.clientX - lastPosition.x;
      const deltaY = event.clientY - lastPosition.y;

      // Update velocity based on drag
      setVelocity({
        x: deltaY * 0.005,
        y: deltaX * 0.005,
      });

      setLastPosition({ x: event.clientX, y: event.clientY });
    },
    [isDragging, lastPosition]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    // Velocity will naturally decay in useFrame
  }, []);

  // Decay velocity over time
  const decayVelocity = useCallback(() => {
    setVelocity((v) => ({
      x: v.x * 0.95,
      y: v.y * 0.95,
    }));
  }, []);

  return {
    isDragging,
    velocity,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    decayVelocity,
  };
}
```

### Phase 2: Payment Service (Priority: HIGH)

#### Task 2.1: Payment Service

**File:** `platform/services/paymentService.ts`

```typescript
import { ethers } from "ethers";
import { CHAIN_CONFIG, PLATFORM_WALLET } from "../lib/chains";

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
    if (!window.ethereum) throw new Error("No wallet detected");
    this.provider = new ethers.BrowserProvider(window.ethereum);
    this.signer = await this.provider.getSigner();
    return await this.signer.getAddress();
  }

  async switchChain(chainId: number): Promise<void> {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });
  }

  /**
   * Send payment (handles fee split automatically)
   * @param toAddress Streamer's wallet address
   * @param amount Amount in token units (e.g., 10 for $10)
   * @param chainKey 'baseSepolia' | 'hederaTestnet'
   * @param isGraduated Whether stream has graduated (determines token)
   */
  async sendPayment(
    toAddress: string,
    amount: number,
    chainKey: "baseSepolia" | "hederaTestnet",
    isGraduated: boolean
  ): Promise<{
    txHash: string;
    creatorAmount: number;
    platformAmount: number;
  }> {
    if (!this.signer) throw new Error("Wallet not connected");

    const config = CHAIN_CONFIG[chainKey];
    await this.switchChain(config.chainId);

    // Determine which token to use
    const tokenConfig = isGraduated ? config.airToken : config.stablecoin;

    // Calculate fee split: 95% creator, 5% platform
    const creatorAmount = amount * 0.95;
    const platformAmount = amount * 0.05;

    const tokenContract = new ethers.Contract(
      tokenConfig.address,
      ERC20_ABI,
      this.signer
    );

    const decimals = tokenConfig.decimals;

    // Transfer to creator (95%)
    const creatorUnits = ethers.parseUnits(
      creatorAmount.toFixed(decimals),
      decimals
    );
    const tx1 = await tokenContract.transfer(toAddress, creatorUnits);
    await tx1.wait();

    // Transfer to platform (5%)
    const platformUnits = ethers.parseUnits(
      platformAmount.toFixed(decimals),
      decimals
    );
    const tx2 = await tokenContract.transfer(PLATFORM_WALLET, platformUnits);
    const receipt = await tx2.wait();

    return {
      txHash: receipt.hash,
      creatorAmount,
      platformAmount,
    };
  }

  /**
   * Get user's token balance
   */
  async getBalance(
    chainKey: "baseSepolia" | "hederaTestnet",
    isGraduated: boolean
  ): Promise<string> {
    if (!this.signer) throw new Error("Wallet not connected");

    const config = CHAIN_CONFIG[chainKey];
    const tokenConfig = isGraduated ? config.airToken : config.stablecoin;

    const tokenContract = new ethers.Contract(
      tokenConfig.address,
      ERC20_ABI,
      this.signer
    );

    const address = await this.signer.getAddress();
    const balance = await tokenContract.balanceOf(address);
    return ethers.formatUnits(balance, tokenConfig.decimals);
  }
}

export const paymentService = new PaymentService();
```

#### Task 2.2: Graduation Status Hook

**File:** `platform/hooks/useGraduationStatus.ts`

```typescript
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

interface GraduationStatus {
  isGraduated: boolean;
  marketCap: number;
  threshold: number;
  memecoinAddress: string | null;
  bondingCurveAddress: string | null;
  liquidityPoolAddress: string | null;
}

export function useGraduationStatus(streamId: string): GraduationStatus {
  const [status, setStatus] = useState<GraduationStatus>({
    isGraduated: false,
    marketCap: 0,
    threshold: 69000,
    memecoinAddress: null,
    bondingCurveAddress: null,
    liquidityPoolAddress: null,
  });

  useEffect(() => {
    // Initial fetch
    fetchStatus();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel(`stream:${streamId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "streams",
          filter: `id=eq.${streamId}`,
        },
        (payload) => {
          updateFromPayload(payload.new);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [streamId]);

  async function fetchStatus() {
    const { data } = await supabase
      .from("streams")
      .select("*")
      .eq("id", streamId)
      .single();

    if (data) {
      updateFromPayload(data);
    }
  }

  function updateFromPayload(data: any) {
    setStatus({
      isGraduated: data.is_graduated || false,
      marketCap: data.market_cap || 0,
      threshold: 69000,
      memecoinAddress: data.memecoin_address,
      bondingCurveAddress: data.bonding_curve_address,
      liquidityPoolAddress: data.liquidity_pool_address,
    });
  }

  return status;
}
```

### Phase 3: Payment Modal (Priority: HIGH)

#### Task 3.1: Payment Modal Component

**File:** `platform/components/PaymentModal.tsx`

```tsx
import React, { useState } from "react";
import { paymentService } from "../services/paymentService";
import { CHAIN_CONFIG } from "../lib/chains";

interface PaymentModalProps {
  streamId: string;
  streamerWallet: string;
  isGraduated: boolean;
  marketCap: number;
  onClose: () => void;
  onSuccess: (txHash: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  streamId,
  streamerWallet,
  isGraduated,
  marketCap,
  onClose,
  onSuccess,
}) => {
  const [amount, setAmount] = useState(5);
  const [selectedChain, setSelectedChain] = useState<
    "baseSepolia" | "hederaTestnet"
  >("baseSepolia");
  const [paymentMethod, setPaymentMethod] = useState<"crypto" | "card">(
    "crypto"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tokenSymbol = isGraduated
    ? CHAIN_CONFIG[selectedChain].airToken.symbol
    : CHAIN_CONFIG[selectedChain].stablecoin.symbol;

  const handlePayment = async () => {
    if (paymentMethod === "card") {
      // Placeholder for future Revolut integration
      alert("Card payment coming soon! Using Revolut sandbox integration.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await paymentService.connect();

      const result = await paymentService.sendPayment(
        streamerWallet,
        amount,
        selectedChain,
        isGraduated
      );

      onSuccess(result.txHash);
    } catch (err: any) {
      setError(err.message || "Payment failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-700">
        {/* Header with graduation status */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">
              {isGraduated ? "📈 Trade on DEX" : "💰 Buy Tokens"}
            </h2>
            {!isGraduated && (
              <p className="text-sm text-gray-400">
                Progress: ${marketCap.toLocaleString()} / $69,000
              </p>
            )}
            {isGraduated && (
              <p className="text-sm text-green-400">
                🎓 Graduated - Trading with AIR
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Payment Method Toggle */}
        <div className="mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setPaymentMethod("crypto")}
              className={`flex-1 py-3 rounded-lg font-medium ${
                paymentMethod === "crypto"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-700 text-gray-300"
              }`}
            >
              📱 Crypto
            </button>
            <button
              onClick={() => setPaymentMethod("card")}
              className={`flex-1 py-3 rounded-lg font-medium ${
                paymentMethod === "card"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-700 text-gray-300"
              }`}
            >
              💳 Card (Soon)
            </button>
          </div>
        </div>

        {/* Chain Selector (Crypto only) */}
        {paymentMethod === "crypto" && (
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">Network</label>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedChain("baseSepolia")}
                className={`flex-1 py-2 rounded-lg ${
                  selectedChain === "baseSepolia"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300"
                }`}
              >
                Base Sepolia
              </button>
              <button
                onClick={() => setSelectedChain("hederaTestnet")}
                className={`flex-1 py-2 rounded-lg ${
                  selectedChain === "hederaTestnet"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300"
                }`}
              >
                Hedera Testnet
              </button>
            </div>
          </div>
        )}

        {/* Amount Input */}
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">
            Amount ({tokenSymbol})
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
            step="0.01"
            min="0.01"
          />
          <div className="flex gap-2 mt-2">
            {[1, 5, 10, 25, 100].map((preset) => (
              <button
                key={preset}
                onClick={() => setAmount(preset)}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white"
              >
                ${preset}
              </button>
            ))}
          </div>
        </div>

        {/* Fee breakdown */}
        <div className="mb-4 p-3 bg-gray-800 rounded-lg text-sm">
          <div className="flex justify-between text-gray-400">
            <span>To Creator (95%)</span>
            <span>
              {(amount * 0.95).toFixed(2)} {tokenSymbol}
            </span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Platform Fee (5%)</span>
            <span>
              {(amount * 0.05).toFixed(2)} {tokenSymbol}
            </span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handlePayment}
          disabled={isLoading || paymentMethod === "card"}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span>
              Processing...
            </span>
          ) : paymentMethod === "card" ? (
            "🔒 Coming Soon (Revolut Integration)"
          ) : (
            `Send ${amount} ${tokenSymbol}`
          )}
        </button>

        {/* Wallet info */}
        <p className="mt-4 text-xs text-gray-500 text-center">
          Sending to: {streamerWallet.slice(0, 10)}...{streamerWallet.slice(-8)}
        </p>
      </div>
    </div>
  );
};
```

### Phase 4: Chrome Extension (Priority: MEDIUM)

#### Task 4.1: Simplified 2D Cube for Extension

**File:** `filter/extension/src/content/cube-overlay.ts`

For performance reasons, the Chrome extension uses a **simplified 2D representation**:

```typescript
// Simplified 2D cube representation for Chrome extension
// Uses CSS 3D transforms instead of WebGL for better performance

interface CubeOverlayOptions {
  streamId: string;
  streamerWallet: string;
  isGraduated: boolean;
  position: { x: number; y: number };
}

export class CubeOverlay {
  private element: HTMLElement;
  private currentFace: number = 0;

  constructor(options: CubeOverlayOptions) {
    this.element = this.createCubeElement(options);
    this.attachToVideo();
  }

  private createCubeElement(options: CubeOverlayOptions): HTMLElement {
    const wrapper = document.createElement("div");
    wrapper.id = "airfun-cube-overlay";
    wrapper.innerHTML = `
      <div class="cube-container" style="
        position: absolute;
        left: ${options.position.x}%;
        top: ${options.position.y}%;
        width: 80px;
        height: 80px;
        perspective: 200px;
        cursor: grab;
        z-index: 999999;
      ">
        <div class="cube" style="
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.3s;
          animation: float 3s ease-in-out infinite;
        ">
          <!-- Simplified: Show one face at a time, rotate on click -->
          <div class="face front" data-face="payment">💰</div>
          <div class="face right" data-face="voice">🎤</div>
          <div class="face back" data-face="predictions">🔮</div>
          <div class="face left" data-face="chat">💬</div>
          <div class="face top" data-face="games">🎮</div>
          <div class="face bottom" data-face="tip">🎁</div>
        </div>
        
        <!-- Graduation glow -->
        <div class="glow" style="
          position: absolute;
          inset: -10px;
          border-radius: 50%;
          background: ${options.isGraduated ? "#22c55e" : "#eab308"};
          opacity: 0.3;
          filter: blur(15px);
          animation: pulse 2s infinite;
        "></div>
        
        ${options.isGraduated ? '<div class="badge">🎓</div>' : ""}
      </div>
    `;

    // Add click handlers
    this.addInteractionHandlers(wrapper, options);

    return wrapper;
  }

  private addInteractionHandlers(
    wrapper: HTMLElement,
    options: CubeOverlayOptions
  ) {
    const cube = wrapper.querySelector(".cube") as HTMLElement;

    // Drag to rotate
    let isDragging = false;
    let startX = 0;
    let rotationY = 0;

    cube.addEventListener("mousedown", (e) => {
      isDragging = true;
      startX = e.clientX;
      cube.style.cursor = "grabbing";
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - startX;
      rotationY += deltaX * 0.5;
      cube.style.transform = `rotateY(${rotationY}deg)`;
      startX = e.clientX;
    });

    document.addEventListener("mouseup", () => {
      isDragging = false;
      cube.style.cursor = "grab";
    });

    // Click on face
    wrapper.querySelectorAll(".face").forEach((face) => {
      face.addEventListener("click", () => {
        const faceType = face.getAttribute("data-face");
        this.handleFaceClick(faceType, options);
      });
    });
  }

  private handleFaceClick(face: string | null, options: CubeOverlayOptions) {
    switch (face) {
      case "payment":
      case "tip":
        this.showPaymentModal(options);
        break;
      case "chat":
        this.showChatModal();
        break;
      case "voice":
        this.showVoiceModal();
        break;
      case "games":
        this.showGamesModal();
        break;
      case "predictions":
        this.showPredictionsModal();
        break;
    }
  }

  private showPaymentModal(options: CubeOverlayOptions) {
    // Show DOM-based payment modal
    // Similar to PaymentModal but as injected HTML
  }

  // Other modal methods...

  private attachToVideo() {
    const video = document.querySelector("video");
    if (video && video.parentElement) {
      video.parentElement.appendChild(this.element);
    }
  }
}
```

---

## 🧪 Testing Checklist

### Phase 1: Cube Rendering

- [ ] Cube renders in 3D space
- [ ] Cube auto-rotates when idle
- [ ] Mouse drag rotates cube
- [ ] Touch drag rotates cube (mobile)
- [ ] Momentum/inertia works after drag
- [ ] Face detection works on click

### Phase 2: Graduation Status

- [ ] Yellow glow for pre-graduation
- [ ] Green glow for post-graduation
- [ ] 🎓 Badge appears after graduation
- [ ] Real-time updates via Supabase

### Phase 3: Payment Flow

- [ ] Wallet connects successfully
- [ ] Chain switching works
- [ ] USDC transfer works (pre-graduation)
- [ ] USDh transfer works (pre-graduation)
- [ ] AIR transfer works (post-graduation)
- [ ] 95/5 fee split correct
- [ ] Success notification shows

### Phase 4: All Faces

- [ ] Payment face opens payment modal
- [ ] Direct tip face opens tip modal
- [ ] Chat face opens chat interface
- [ ] Voice face opens voice interface
- [ ] Games face opens games interface
- [ ] Predictions face opens predictions interface

### Phase 5: Chrome Extension

- [ ] 2D cube renders on Twitch
- [ ] 2D cube renders on YouTube
- [ ] Click detection works
- [ ] Payment modal appears
- [ ] Transaction completes

---

## 📋 Implementation Priority

| Priority  | Task                        | Estimated Time |
| --------- | --------------------------- | -------------- |
| 🔴 HIGH   | Cube rendering + rotation   | 1-2 days       |
| 🔴 HIGH   | Payment service + modal     | 1-2 days       |
| 🔴 HIGH   | Graduation status detection | 0.5 day        |
| 🟡 MEDIUM | Direct tip face             | 0.5 day        |
| 🟡 MEDIUM | Chrome extension 2D cube    | 1-2 days       |
| 🟢 LOW    | Chat face                   | 1 day          |
| 🟢 LOW    | Voice face                  | 1 day          |
| 🟢 LOW    | Games face                  | 2 days         |
| 🟢 LOW    | Predictions face            | 2 days         |
| ⚪ FUTURE | Card payment (Revolut)      | TBD            |
| ⚪ FUTURE | USDair integration          | TBD            |
| ⚪ FUTURE | Solana Devnet               | TBD            |

---

## 🔗 Quick Reference

### Contract Addresses

| Contract             | Base Sepolia                                 | Hedera Testnet                               |
| -------------------- | -------------------------------------------- | -------------------------------------------- |
| **USDC**             | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` | -                                            |
| **USDh**             | -                                            | `0.0.7200455`                                |
| **AIR**              | `0xB2D4ED0c17487ABfEfC4d3feEE7EB860e82aA3f7` | `0.0.7361207`                                |
| **Memecoin Factory** | `0x3c4ceDfE7F0a20013B0adae70443d0102166Db54` | `0x210542A52aF3c0A5854B75E84C67312Ffe6F004A` |
| **LP Factory**       | `0x5834aEe88F9163a4146B3053D2Ffa34Bf53b6727` | `0x6796cb5394c66f194771b059c54137a9eD64cbEa` |

### Key Parameters

| Parameter            | Value                                        |
| -------------------- | -------------------------------------------- |
| Platform Fee         | 5%                                           |
| Creator Fee          | 95%                                          |
| Graduation Threshold | $69,000                                      |
| Platform Wallet      | `0x97b83759eadb2503a8947e8d6eb734795cdefc95` |

---

## 🚀 Expected Outcome

After implementation:

```
1. Viewer watches live stream
2. Sees rotating 3D cube agent (yellow glow = pre-graduation)
3. Drags cube with mouse/finger to rotate
4. Clicks FRONT face (Payment) → Payment modal opens
5. Selects chain (Base Sepolia or Hedera)
6. Enters amount, confirms transaction
7. USDC/USDh transfers: 95% to streamer, 5% to platform
8. Viewer receives memecoin tokens (pre-graduation)
9. Stream reaches $69k → Cube turns green with 🎓 badge
10. Now viewers pay with AIR token instead
11. Other faces provide chat, voice, games, predictions
```

---

**Good luck with the implementation! 🎉**

---

## 📝 Future Development Notes

### USDair Stablecoin

- Will replace USDC and USDh as unified platform stablecoin
- Deploy on all chains (Base, Hedera, Solana)
- Status: PLANNED

### Revolut Card Integration

- Virtual card payments via Revolut sandbox
- Placeholder face ready for integration
- Status: PLANNED

### Solana Devnet

- Full integration pending
- Contract deployment needed
- Status: PLANNED

### Bonding Curve Integration

- Pre-graduation purchases should go through bonding curve contract
- Currently using direct transfer for simplicity
- Full bonding curve integration: OPTIONAL for MVP
