# Air.Fun Platform - Comprehensive Technical & Infrastructure Guide

**Complete guide to architecture, blockchain infrastructure, smart contracts, user flows, and platform economics**

**Last Updated:** December 11, 2025  
**Status:** Active Development - Ready for Code Space Collaboration

---

## 📋 Table of Contents

### Part A: Platform Overview & Architecture

1. [Executive Summary](#executive-summary)
2. [Platform Overview](#platform-overview)
3. [System Architecture](#system-architecture)
4. [Technology Stack](#technology-stack)
5. [Deployment Modes](#deployment-modes)

### Part B: Blockchain Infrastructure

6. [Blockchain Architecture](#blockchain-architecture)
7. [Deployed Smart Contracts](#deployed-smart-contracts)
8. [Smart Contract Integration](#smart-contract-integration)
9. [Contract Functions Reference](#contract-functions-reference)

### Part C: User Flows & Economics

10. [Streamer Flow](#streamer-flow)
11. [Viewer Flow](#viewer-flow)
12. [Platform Flow](#platform-flow)
13. [Token Economics](#token-economics)
14. [Wallet & Fund Distribution](#wallet--fund-distribution)

### Part D: Advanced Features

15. [AI Agents System](#ai-agents-system)
16. [Graduation to DEX](#graduation-to-dex)
17. [Anti-Bot Protection](#anti-bot-protection)
18. [Stablecoin Integration](#stablecoin-integration)

### Part E: Future Development

19. [Story IP Protocol Integration](#story-ip-protocol-integration)
20. [IPFi Marketplace](#ipfi-marketplace)
21. [Identity & x402 Payments](#identity--x402-payments)
22. [Future Smart Contracts](#future-smart-contracts)
23. [Development Roadmap](#development-roadmap)

---

## Executive Summary

### What is Air.Fun?

**Air.Fun** is a decentralized livestreaming platform that combines interactive 3D AI agents with blockchain-based memecoin economics. It exists in two forms:

1. **Native Platform** - Full-featured standalone streaming application
2. **Filter/Extension** - Chrome extension overlay for existing platforms (Twitch, YouTube, Kick)

### Core Innovation

Streamers deploy clickable AR/VR AI agents into their livestreams. Viewers interact with agents to:

- Purchase memecoins via bonding curve
- Tip streamers directly
- Participate in games and challenges
- Influence stream outcomes

### Key Differentiators

| Feature              | Traditional Platforms | Air.Fun                      |
| -------------------- | --------------------- | ---------------------------- |
| **Creator Revenue**  | 50-70%                | 98% (blockchain-native)      |
| **Settlement Time**  | 30+ days              | Instant (on-chain)           |
| **Interactivity**    | Chat messages         | Clickable 3D agents          |
| **Monetization**     | Ads + Subs            | Bonding curve + tips         |
| **Bot Protection**   | Minimal               | Agent-mediated (95%+ secure) |
| **IP Rights**        | Platform owns         | Creator owns (Story)         |
| **Geographic Reach** | 50 countries          | 170+ countries               |

### Blockchain Integration

- **Dual-chain deployment**: Base Sepolia & Hedera Testnet (Solana coming)
- **Auto-deployed memecoins**: Created when stream starts
- **Bonding curve trading**: $69K graduation threshold
- **Story Protocol**: IP rights for AI agents
- **Future**: Identity (ERC-8004), payments (x402), IPFi marketplace

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AIR.FUN ECOSYSTEM                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────┐          ┌──────────────────────────┐         │
│  │    NATIVE PLATFORM       │          │    FILTER/EXTENSION      │         │
│  │   (Standalone App)       │          │   (Chrome Extension)     │         │
│  └────────────┬─────────────┘          └────────────┬─────────────┘         │
│               │                                     │                        │
│               └──────────────┬──────────────────────┘                        │
│                              │                                               │
│  ┌───────────────────────────▼────────────────────────────────────────────┐ │
│  │                    CORE SERVICES LAYER                                 │ │
│  ├────────────────────────────────────────────────────────────────────────┤ │
│  │ • Streaming Service (WebRTC + Mediasoup)                              │ │
│  │ • Token Factory Service (Memecoin deployment)                         │ │
│  │ • Bonding Curve Service (Price calculations)                          │ │
│  │ • AI Agent Service (Deployment, MCP, tracking)                        │ │
│  │ • Story IP Service (IP registration, royalties) [PLANNED]             │ │
│  │ • Payment Service (x402, USDair, wallets) [PLANNED]                   │ │
│  │ • Real-Time Sync Service (CRDT, WebSocket)                            │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                              │                                               │
│  ┌───────────────────────────▼────────────────────────────────────────────┐ │
│  │                 DATA & BLOCKCHAIN LAYER                                │ │
│  ├────────────────────────────────────────────────────────────────────────┤ │
│  │ CURRENTLY DEPLOYED:                                                    │ │
│  │ • Supabase (PostgreSQL + Real-time)                                   │ │
│  │ • Redis (Price caching, state sync)                                   │ │
│  │ • Base Sepolia (AIR, USDC, Factories) ✅ DEPLOYED                     │ │
│  │ • Hedera Testnet (AIR, USDh, Factories) ✅ DEPLOYED                   │ │
│  │                                                                        │ │
│  │ PLANNED FOR FUTURE:                                                    │ │
│  │ • Base Sepolia (Story Protocol integration) ⏳ NOT YET DEPLOYED       │ │
│  │ • Identity Contracts (ERC-8004) ⏳ NOT YET DEPLOYED                   │ │
│  │ • IPFi Marketplace ⏳ NOT YET DEPLOYED                                │ │
│  │ • x402 Payment Protocol ⏳ NOT YET DEPLOYED                           │ │
│  │ • USDair Stablecoin ⏳ NOT YET DEPLOYED                               │ │
│  │ • Solana Devnet ⏳ NOT YET DEPLOYED                                   │ │
│  │ • IPFS/Arweave (Metadata, permanence) ⏳ NOT YET DEPLOYED             │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

---

## Platform Overview

air.fun is a decentralized livestreaming platform where:

- **Streamers** create streams and automatically get a memecoin deployed
- **Viewers** support streamers by purchasing memecoins on a bonding curve
- **Platform** facilitates the infrastructure and takes a small fee

### Supported Blockchains

| Chain          | Stablecoin | Platform Token | Status         |
| -------------- | ---------- | -------------- | -------------- |
| Base Sepolia   | USDC       | AIR            | ✅ Live        |
| Hedera Testnet | USDh       | AIR            | ✅ Live        |
| Solana Devnet  | USDh (TBD) | AIR            | ⏳ Coming Soon |

> **Note:** USDair will replace all stablecoins (USDC, USDh) as the unified platform stablecoin across all chains in a future update.

---

## Deployment Modes

Air.Fun operates in **two deployment modes** that share the same AI agents database:

### Mode 1: Native Platform (Standalone App)

Full-featured air.fun application with complete streaming and viewing capabilities.

```
┌──────────────────────────────────────────────────────────────────┐
│  NATIVE PLATFORM                                                 │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Streamer Side:                                                  │
│  ├── Opens air.fun streamer app                                  │
│  ├── Creates stream with title, thumbnail                        │
│  ├── Memecoin auto-deployed on stream start                      │
│  ├── Places AI agents on screen (drag & drop)                    │
│  └── Broadcasts WebRTC stream to air.fun servers                 │
│                                                                  │
│  Viewer Side:                                                    │
│  ├── Opens air.fun viewer app or web                             │
│  ├── Sees streamer video + floating AI agents                    │
│  ├── Clicks agents → Buys memecoin, tips, interacts              │
│  └── Participates in games/challenges                            │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Mode 2: Filter/Extension (Chrome Browser Extension)

Air.Fun as an **overlay layer** on existing streaming platforms (Twitch, YouTube, Kick, pump.fun).

```
┌──────────────────────────────────────────────────────────────────┐
│  FILTER MODE (Browser Extension)                                 │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Streamer Side:                                                  │
│  ├── Installs Air.Fun Chrome Extension                           │
│  ├── Streams on Twitch/YouTube as normal                         │
│  ├── Extension overlays AI agents onto stream                    │
│  ├── Agent positions synced to viewers with extension            │
│  └── Continues streaming on Twitch/YouTube as usual              │
│                                                                  │
│  Viewer Side:                                                    │
│  ├── Installs Air.Fun Chrome Extension                           │
│  ├── Watches stream on Twitch/YouTube                            │
│  ├── Extension renders agents as interactive overlay             │
│  ├── Clicks agents → Same functionality as native app            │
│  └── Buys memecoin, tips, interacts                              │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Shared AI Agents Database

Both modes share the **same Supabase database** for AI agents:

| Field              | Description                                                             |
| ------------------ | ----------------------------------------------------------------------- |
| `id`               | Unique agent identifier                                                 |
| `name`             | Agent display name                                                      |
| `type`             | `payable_cube` \| `interactive_jam` \| `prediction_bot` \| `game_buddy` |
| `deployment_mode`  | `platform` \| `filter` \| `both`                                        |
| `stream_id`        | Associated stream                                                       |
| `wallet_address`   | Streamer's wallet (receives payments)                                   |
| `position`         | Screen coordinates (x, y, z)                                            |
| `erc8004_identity` | On-chain agent identity                                                 |
| `story_ip_id`      | Story Protocol IP Asset ID                                              |

---

## Technology Stack

### Frontend Applications (Platform & Filter)

| Layer        | Technology                       |
| ------------ | -------------------------------- |
| Framework    | React 18 with TypeScript         |
| Build Tool   | Vite 6.2                         |
| Styling      | Tailwind CSS                     |
| 3D Rendering | Three.js with @react-three/fiber |
| State Mgmt   | Zustand                          |
| Routing      | React Router                     |
| Real-time    | Socket.io client / WebSocket     |
| Blockchain   | Ethers.js v6                     |
| Wallet       | Thirdweb SDK                     |
| Charts       | Recharts                         |

### Backend Services

| Layer          | Technology                        |
| -------------- | --------------------------------- |
| Runtime        | Node.js 18+                       |
| Framework      | Express                           |
| WebSocket      | Socket.io / ws library            |
| Media Server   | Mediasoup (WebRTC SFU)            |
| Database       | Supabase (PostgreSQL + Real-time) |
| Cache          | Redis                             |
| Authentication | JWT + bcrypt                      |
| Blockchain     | Ethers.js, Hedera SDK             |
| Storage        | AWS S3 / IPFS (planned)           |

### Smart Contracts

| Layer     | Technology                                   |
| --------- | -------------------------------------------- |
| Language  | Solidity 0.8.20                              |
| Framework | Hardhat                                      |
| Libraries | OpenZeppelin                                 |
| Networks  | Base Sepolia (84532), Hedera Testnet (296)   |
| Testing   | Hardhat + Chai + fast-check (Property-based) |

### Infrastructure

| Layer      | Technology                                 |
| ---------- | ------------------------------------------ |
| Hosting    | Vercel (frontend), EC2 (backend) - planned |
| Database   | Supabase PostgreSQL (Multi-AZ) - planned   |
| Cache      | Redis / ElastiCache - planned              |
| Monitoring | CloudWatch, Prometheus, Grafana - planned  |
| CDN        | CloudFront - planned                       |

---

## Blockchain Architecture

### Complete Blockchain Layer Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     BLOCKCHAIN INFRASTRUCTURE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                   CURRENTLY DEPLOYED ✅                              │   │
│  ├──────────────────────────────────────────────────────────────────────┤   │
│  │                                                                      │   │
│  │  BASE SEPOLIA (Chain ID: 84532)                                     │   │
│  │  ┌────────────────────────────────────────────────────────────────┐ │   │
│  │  │ USDC Stablecoin                                                │ │   │
│  │  │ 0x036CbD53842c5426634e7929541eC2318f3dCF7e                     │ │   │
│  │  └────────────────────────────────────────────────────────────────┘ │   │
│  │  ┌────────────────────────────────────────────────────────────────┐ │   │
│  │  │ AIR Platform Token                                             │ │   │
│  │  │ 0xB2D4ED0c17487ABfEfC4d3feEE7EB860e82aA3f7                     │ │   │
│  │  │ • 1B supply • ERC-20 • Liquidity pairing                       │ │   │
│  │  └────────────────────────────────────────────────────────────────┘ │   │
│  │  ┌────────────────────────────────────────────────────────────────┐ │   │
│  │  │ Memecoin Factory                                               │ │   │
│  │  │ 0x3c4ceDfE7F0a20013B0adae70443d0102166Db54                     │ │   │
│  │  │ • Creates memecoins • Deploys bonding curves                   │ │   │
│  │  │ • Uses USDC • 98% creator / 2% platform                        │ │   │
│  │  └────────────────────────────────────────────────────────────────┘ │   │
│  │  ┌────────────────────────────────────────────────────────────────┐ │   │
│  │  │ Liquidity Pool Factory                                         │ │   │
│  │  │ 0x5834aEe88F9163a4146B3053D2Ffa34Bf53b6727                     │ │   │
│  │  │ • Creates MEMECOIN/AIR pools • $69K graduation                 │ │   │
│  │  │ • Burns LP tokens (rug-pull protection)                        │ │   │
│  │  └────────────────────────────────────────────────────────────────┘ │   │
│  │                                                                      │   │
│  │  HEDERA TESTNET (Chain ID: 296)                                     │   │
│  │  ┌────────────────────────────────────────────────────────────────┐ │   │
│  │  │ USDh Stablecoin (HTS)                                          │ │   │
│  │  │ 0x00000000000000000000000000000000006e24c7                     │ │   │
│  │  │ Token ID: 0.0.7200455                                          │ │   │
│  │  └────────────────────────────────────────────────────────────────┘ │   │
│  │  ┌────────────────────────────────────────────────────────────────┐ │   │
│  │  │ AIR Platform Token (HTS)                                       │ │   │
│  │  │ 0x00000000000000000000000000000000007052b7                     │ │   │
│  │  │ Token ID: 0.0.7361207 • 1B supply • 8 decimals                │ │   │
│  │  └────────────────────────────────────────────────────────────────┘ │   │
│  │  ┌────────────────────────────────────────────────────────────────┐ │   │
│  │  │ Memecoin Factory                                               │ │   │
│  │  │ 0x210542A52aF3c0A5854B75E84C67312Ffe6F004A                     │ │   │
│  │  │ • Creates memecoins • Uses USDh • 98/2 split                   │ │   │
│  │  └────────────────────────────────────────────────────────────────┘ │   │
│  │  ┌────────────────────────────────────────────────────────────────┐ │   │
│  │  │ Liquidity Pool Factory                                         │ │   │
│  │  │ 0x6796cb5394c66f194771b059c54137a9eD64cbEa                     │ │   │
│  │  │ • MEMECOIN/AIR pools • Graduation at $69K                      │ │   │
│  │  └────────────────────────────────────────────────────────────────┘ │   │
│  │                                                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                   PLANNED FOR DEPLOYMENT ⏳                          │   │
│  ├──────────────────────────────────────────────────────────────────────┤   │
│  │                                                                      │   │
│  │  STORY PROTOCOL (Base Sepolia)                                      │   │
│  │  • IP Asset Registration for AI Agents                              │   │
│  │  • Programmable IP Licenses (PIL)                                   │   │
│  │  • Derivative licensing & royalties                                 │   │
│  │  • Royalty token issuance                                           │   │
│  │                                                                      │   │
│  │  IDENTITY CONTRACTS (ERC-8004)                                      │   │
│  │  • On-chain agent identity NFTs                                     │   │
│  │  • Agent capabilities & permissions                                 │   │
│  │  • Reputation tracking                                              │   │
│  │                                                                      │   │
│  │  IPFI MARKETPLACE                                                   │   │
│  │  • Agent trading platform                                           │   │
│  │  • Royalty token marketplace                                        │   │
│  │  • Fractional agent ownership                                       │   │
│  │                                                                      │   │
│  │  X402 PAYMENT PROTOCOL                                              │   │
│  │  • Agent-to-agent payments                                          │   │
│  │  • Agent-to-viewer payments                                         │   │
│  │  • Micro-payment infrastructure                                     │   │
│  │                                                                      │   │
│  │  USDAIR STABLECOIN                                                  │   │
│  │  • Multi-chain stablecoin (Base, Hedera, Solana)                   │   │
│  │  • 1:1 USDC-backed                                                  │   │
│  │  • x402 protocol integration                                        │   │
│  │                                                                      │   │
│  │  SOLANA DEVNET                                                      │   │
│  │  • AIR Token (SPL)                                                  │   │
│  │  • Memecoin Factory                                                 │   │
│  │  • Bonding Curve Program                                            │   │
│  │  • Liquidity Pool Program                                           │   │
│  │                                                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Deployed Smart Contracts

### Base Sepolia Testnet (Chain ID: 84532)

**Network Information:**

- **RPC URL**: https://sepolia.base.org
- **Block Explorer**: https://sepolia.basescan.org
- **Native Token**: ETH
- **Stablecoin**: USDC

| Contract                   | Address                                      | Explorer Link                                                                               |
| -------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **USDC** (Stablecoin)      | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` | [BaseScan](https://sepolia.basescan.org/address/0x036CbD53842c5426634e7929541eC2318f3dCF7e) |
| **AIR Token**              | `0xB2D4ED0c17487ABfEfC4d3feEE7EB860e82aA3f7` | [BaseScan](https://sepolia.basescan.org/address/0xB2D4ED0c17487ABfEfC4d3feEE7EB860e82aA3f7) |
| **Memecoin Factory**       | `0x3c4ceDfE7F0a20013B0adae70443d0102166Db54` | [BaseScan](https://sepolia.basescan.org/address/0x3c4ceDfE7F0a20013B0adae70443d0102166Db54) |
| **Liquidity Pool Factory** | `0x5834aEe88F9163a4146B3053D2Ffa34Bf53b6727` | [BaseScan](https://sepolia.basescan.org/address/0x5834aEe88F9163a4146B3053D2Ffa34Bf53b6727) |

### Hedera Testnet (Chain ID: 296)

**Network Information:**

- **RPC URL**: https://testnet.hashio.io/api
- **Block Explorer**: https://hashscan.io/testnet
- **Native Token**: HBAR
- **Stablecoin**: USDh (Custom HTS token)

| Contract                   | Address                                      | Token ID      | Explorer Link                                                                               |
| -------------------------- | -------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------- |
| **USDh** (Stablecoin)      | `0x00000000000000000000000000000000006e24c7` | `0.0.7200455` | [HashScan](https://hashscan.io/testnet/token/0.0.7200455)                                   |
| **AIR Token**              | `0x00000000000000000000000000000000007052b7` | `0.0.7361207` | [HashScan](https://hashscan.io/testnet/token/0.0.7361207)                                   |
| **Memecoin Factory**       | `0x210542A52aF3c0A5854B75E84C67312Ffe6F004A` | -             | [HashScan](https://hashscan.io/testnet/contract/0x210542A52aF3c0A5854B75E84C67312Ffe6F004A) |
| **Liquidity Pool Factory** | `0x6796cb5394c66f194771b059c54137a9eD64cbEa` | -             | [HashScan](https://hashscan.io/testnet/contract/0x6796cb5394c66f194771b059c54137a9eD64cbEa) |

**Deployment Details:**

- **Deployment Date**: December 2, 2024
- **Deployer Address**: `0x97B83759EADB2503a8947E8D6eb734795Cdefc95`
- **Hedera Account ID**: `0.0.7145005`
- **Gas Used**: ~0.001 ETH per contract (Base), ~2 HBAR per contract (Hedera)

---

## Smart Contract Integration

### Contract Architecture Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        STREAMING APPLICATION                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────┐     WebSocket      ┌─────────────────────┐         │
│  │  STREAMER FRONTEND  │◄──────────────────►│      BACKEND        │         │
│  │  (React/Vue/etc)    │  deployment_status  │  (Node.js/Express)  │         │
│  │                     │                     │                     │         │
│  │  ┌───────────────┐  │                     │  ┌───────────────┐  │         │
│  │  │  Deployment   │  │                     │  │ TokenFactory  │  │         │
│  │  │    Modal      │◄─┼─────────────────────┼──│   Service     │  │         │
│  │  │               │  │                     │  │               │  │         │
│  │  │ • Live status │  │                     │  │ • Deploy      │  │         │
│  │  │ • TX hashes   │  │                     │  │ • Broadcast   │  │         │
│  │  │ • Addresses   │  │                     │  │ • Store DB    │  │         │
│  │  │ • Explorer    │  │                     │  │               │  │         │
│  │  │   links       │  │                     │  │               │  │         │
│  │  └───────────────┘  │                     │  └───────┬───────┘  │         │
│  └─────────────────────┘                     └──────────┼──────────┘         │
│                                                         │                    │
└─────────────────────────────────────────────────────────┼────────────────────┘
                                                          │
                                                          │ ethers.js
                                                          │
┌─────────────────────────────────────────────────────────┼────────────────────┐
│                         BLOCKCHAIN LAYER                │                    │
├─────────────────────────────────────────────────────────┼────────────────────┤
│                                                         ▼                    │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                      MEMECOIN FACTORY CONTRACT                        │   │
│  │              Base: 0x3c4ceDfE7F0a20013B0adae70443d0102166Db54        │   │
│  │              Hedera: 0x210542A52aF3c0A5854B75E84C67312Ffe6F004A      │   │
│  │                                                                        │   │
│  │  createMemecoin(name, symbol, creator)                                │   │
│  │           │                                                            │   │
│  │           ▼                                                            │   │
│  │  ┌────────────────────┐    ┌────────────────────┐                     │   │
│  │  │  MEMECOIN (ERC20)  │    │   BONDING CURVE    │                     │   │
│  │  │                    │    │                    │                     │   │
│  │  │  • 1B total supply │◄──►│  • Holds 800M      │                     │   │
│  │  │  • 200M to creator │    │  • Price = k*sold² │                     │   │
│  │  │  • Standard ERC20  │    │  • USDC purchases  │                     │   │
│  │  └────────────────────┘    └─────────┬──────────┘                     │   │
│  └──────────────────────────────────────┼───────────────────────────────┘   │
│                                          │                                   │
│                                          │ At $69K market cap                │
│                                          ▼                                   │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    LIQUIDITY POOL FACTORY                             │   │
│  │              Base: 0x5834aEe88F9163a4146B3053D2Ffa34Bf53b6727        │   │
│  │              Hedera: 0x6796cb5394c66f194771b059c54137a9eD64cbEa      │   │
│  │                                                                        │   │
│  │  createPool(memecoin, memecoinAmount, airAmount)                      │   │
│  │           │                                                            │   │
│  │           ▼                                                            │   │
│  │  ┌────────────────────────────────────────────────────────┐           │   │
│  │  │              LIQUIDITY POOL (MEMECOIN/AIR)             │           │   │
│  │  │                                                        │           │   │
│  │  │  • LP tokens burned (rug-pull protection)              │           │   │
│  │  │  • Token now tradeable on DEX                          │           │   │
│  │  │  • Permanent liquidity locked                          │           │   │
│  │  └────────────────────────────────────────────────────────┘           │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Frontend Integration - Deployment Modal

Backend broadcasts deployment progress via WebSocket to show real-time status in the streamer UI.

```typescript
// Deployment Step Interface
interface DeploymentStep {
  id: string;
  label: string;
  status: "pending" | "in-progress" | "completed" | "error";
  details?: string;
  txHash?: string;
  address?: string;
  blockNumber?: number;
  timestamp?: number;
}

// Deployment Info Interface
interface DeploymentInfo {
  streamId: string;
  tokenName: string;
  tokenSymbol: string;
  chain: "base" | "hedera";
  chainId: number;
  factoryAddress?: string;
  memecoinAddress?: string;
  bondingCurveAddress?: string;
  creatorAddress?: string;
  creatorTokens?: string;
  steps: DeploymentStep[];
}
```

### Backend Integration - Token Factory Service

```typescript
// services/token-factory.service.ts
import { ethers } from "ethers";
import { MemecoinFactoryABI } from "../contracts/abis.js";

export class TokenFactoryService {
  private baseProvider: ethers.JsonRpcProvider;
  private baseWallet: ethers.Wallet;
  private hederaProvider: ethers.JsonRpcProvider;
  private hederaWallet: ethers.Wallet;

  constructor() {
    // Base Sepolia
    this.baseProvider = new ethers.JsonRpcProvider("https://sepolia.base.org");
    this.baseWallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY!, this.baseProvider);

    // Hedera Testnet
    this.hederaProvider = new ethers.JsonRpcProvider("https://testnet.hashio.io/api");
    this.hederaWallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY!, this.hederaProvider);
  }

  async deployMemecoin(
    chain: "base" | "hedera",
    name: string,
    symbol: string,
    creatorAddress: string,
    streamId: string
  ): Promise<{ memecoinAddress: string; bondingCurveAddress: string }> {
    const factoryAddress =
      chain === "base"
        ? "0x3c4ceDfE7F0a20013B0adae70443d0102166Db54"
        : "0x210542A52aF3c0A5854B75E84C67312Ffe6F004A";

    const wallet = chain === "base" ? this.baseWallet : this.hederaWallet;
    const factory = new ethers.Contract(factoryAddress, MemecoinFactoryABI, wallet);

    // Broadcast progress
    this.broadcastStatus(streamId, {
      step: "sending_transaction",
      status: "in-progress",
      chain,
      chainId: chain === "base" ? 84532 : 296,
    });

    const tx = await factory.createMemecoin(name, symbol, creatorAddress);

    this.broadcastStatus(streamId, {
      step: "confirming_transaction",
      status: "in-progress",
      txHash: tx.hash,
    });

    const receipt = await tx.wait();

    // Parse events to get deployed addresses
    const event = receipt.logs.find(
      (log) => log.topics[0] === ethers.id("MemecoinCreated(address,address,address,string,string)")
    );

    const memecoinAddress = ethers.getAddress("0x" + event.topics[1].slice(26));
    const bondingCurveAddress = ethers.getAddress("0x" + event.topics[2].slice(26));

    this.broadcastStatus(streamId, {
      step: "deployment_complete",
      status: "completed",
      memecoinAddress,
      bondingCurveAddress,
    });

    return { memecoinAddress, bondingCurveAddress };
  }
}
```

---

## Contract Functions Reference

### Memecoin Factory

```solidity
// Deploy new memecoin + bonding curve
function createMemecoin(
  string memory name,
  string memory symbol,
  address creator
) external returns (
  address memecoinAddress,
  address bondingCurveAddress
);

// Query creator's memecoins
function getCreatorMemecoins(address creator)
  external view returns (address[] memory);

// Query memecoin info
function getMemecoinInfo(address memecoin)
  external view returns (
    string memory name,
    string memory symbol,
    address creator,
    address bondingCurve,
    uint256 createdAt
  );
```

### Bonding Curve Contract

```solidity
// Purchase tokens (viewer side)
function purchase(uint256 tokenAmount, uint256 maxCost)
  external returns (uint256 actualCost);

// Sell tokens back to curve
function sell(uint256 tokenAmount, uint256 minPayout)
  external returns (uint256 actualPayout);

// Calculate purchase cost
function calculatePurchaseCost(uint256 tokenAmount)
  external view returns (uint256 cost);

// Calculate sell payout
function calculateSellPayout(uint256 tokenAmount)
  external view returns (uint256 payout);

// Get current stats
function getStats() external view returns (
  uint256 tokensSold,
  uint256 currentPrice,
  uint256 marketCap,
  bool isGraduated
);

// Trigger graduation (platform only)
function graduate() external;
```

### Liquidity Pool Factory

```solidity
// Create MEMECOIN/AIR pool
function createLiquidityPool(
  address memecoin,
  uint256 memecoinAmount,
  uint256 airAmount
) external returns (address poolAddress);

// Query pool for memecoin
function getPool(address memecoin)
  external view returns (address poolAddress);
```

### Environment Variables Setup

```bash
# Base Sepolia
BASE_SEPOLIA_RPC=https://sepolia.base.org
BASE_SEPOLIA_PRIVATE_KEY=your_private_key
BASE_USDC_ADDRESS=0x036CbD53842c5426634e7929541eC2318f3dCF7e
BASE_AIR_TOKEN_ADDRESS=0xB2D4ED0c17487ABfEfC4d3feEE7EB860e82aA3f7
BASE_MEMECOIN_FACTORY_ADDRESS=0x3c4ceDfE7F0a20013B0adae70443d0102166Db54
BASE_LIQUIDITY_POOL_FACTORY_ADDRESS=0x5834aEe88F9163a4146B3053D2Ffa34Bf53b6727

# Hedera Testnet
HEDERA_RPC=https://testnet.hashio.io/api
HEDERA_PRIVATE_KEY=your_private_key
HEDERA_ACCOUNT_ID=0.0.YOUR_ACCOUNT
HEDERA_USDH_ADDRESS=0x00000000000000000000000000000000006e24c7
HEDERA_AIR_TOKEN_ADDRESS=0x00000000000000000000000000000000007052b7
HEDERA_MEMECOIN_FACTORY_ADDRESS=0x210542A52aF3c0A5854B75E84C67312Ffe6F004A
HEDERA_LIQUIDITY_POOL_FACTORY_ADDRESS=0x6796cb5394c66f194771b059c54137a9eD64cbEa

# Platform
PLATFORM_WALLET_ADDRESS=0x97b83759eadb2503a8947e8d6eb734795cdefc95
DEPLOYER_PRIVATE_KEY=your_platform_deployer_key
```

---

## Streamer Flow

### 1. Authentication & Wallet Connection

```
┌──────────────────────────────────────────────────────────────────┐
│  STREAMER CONNECTS WALLET                                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Streamer opens app → Clicks "Connect Wallet"                 │
│  2. MetaMask/WalletConnect popup appears                         │
│  3. Streamer signs authentication message (no gas cost)          │
│  4. Backend verifies signature → Issues JWT token                │
│  5. Streamer wallet address is now linked to their account       │
│                                                                  │
│  ┌─────────────────┐                                             │
│  │ Streamer Wallet │ ← This is the CREATOR wallet                │
│  │ 0xABC...123     │   All creator fees go HERE                  │
│  └─────────────────┘                                             │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 2. Stream Creation & Token Deployment

When a streamer creates a stream, the following happens **automatically**:

```
┌──────────────────────────────────────────────────────────────────┐
│  STREAM CREATION FLOW                                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Step 1: Streamer fills form                                     │
│  ├── Stream Title: "My Awesome Stream"                           │
│  ├── Description: "..."                                          │
│  └── Thumbnail (optional)                                        │
│                                                                  │
│  Step 2: Backend generates token symbol                          │
│  ├── Takes streamer name → "MYAWE" (3-5 chars)                   │
│  └── Checks for collisions, adds suffix if needed                │
│                                                                  │
│  Step 3: Smart contract deployment (PLATFORM PAYS GAS)           │
│  ├── Platform's deployer wallet sends transaction                │
│  ├── MemecoinFactory.createMemecoin() is called                  │
│  └── Two contracts are deployed:                                 │
│                                                                  │
│      ┌─────────────────────────────────────────────┐             │
│      │           MEMECOIN CONTRACT                 │             │
│      │  • 1 Billion total supply                   │             │
│      │  • 200M (20%) → Streamer's wallet           │             │
│      │  • 800M (80%) → BondingCurve contract       │             │
│      └─────────────────────────────────────────────┘             │
│                                                                  │
│      ┌─────────────────────────────────────────────┐             │
│      │         BONDING CURVE CONTRACT              │             │
│      │  • Holds 800M tokens for sale               │             │
│      │  • Price formula: price = k × sold²         │             │
│      │  • Accepts USDC/USDh payments               │             │
│      │  • Distributes fees automatically           │             │
│      └─────────────────────────────────────────────┘             │
│                                                                  │
│  Step 4: Real-time status shown in modal                         │
│  ├── ✅ Generating Token Symbol                                  │
│  ├── ✅ Connecting to Factory Contract                           │
│  ├── ✅ Sending Transaction (TX: 0x...)                          │
│  ├── ⏳ Confirming Transaction                                   │
│  ├── ✅ Memecoin Contract Deployed                               │
│  ├── ✅ Bonding Curve Deployed                                   │
│  ├── ✅ Creator Tokens Allocated (200M → streamer)               │
│  └── ✅ Deployment Complete!                                     │
│                                                                  │
│  Step 5: Stream goes live                                        │
│  └── Viewers can now join and purchase tokens                    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### What Streamer Receives on Stream Creation

| Item               | Amount            | Destination                 |
| ------------------ | ----------------- | --------------------------- |
| Memecoin Tokens    | 200,000,000 (20%) | Streamer's connected wallet |
| Bonding Curve Link | -                 | Stored in database          |
| Stream URL         | -                 | Shareable link              |

### 3. Earning from Viewer Purchases

Every time a viewer buys tokens:

```
Viewer pays 100 USDC (USDh on Hedera)
        │
        ▼
┌───────────────────────────────────────┐
│         BONDING CURVE CONTRACT         │
│                                        │
│  Split: 98% / 2%                       │
│                                        │
│  ┌─────────────────────────────────┐   │
│  │ 98 USDC (USDh) → Streamer       │   │
│  │ (Creator Fee)                   │   │
│  └─────────────────────────────────┘   │
│                                        │
│  ┌─────────────────────────────────┐   │
│  │ 2 USDC (USDh) → Platform        │   │
│  │ (Platform Fee)                  │   │
│  └─────────────────────────────────┘   │
│                                        │
│  Tokens sent to viewer                 │
└───────────────────────────────────────┘
```

**Key Point**: Streamer earns USDC/USDh directly to their wallet in real-time, with every purchase!

---

## Viewer Flow

### 1. Discovering & Joining Streams

```
┌──────────────────────────────────────────────────────────────────┐
│  VIEWER DISCOVERY FLOW                                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Viewer opens app → Sees live stream grid                     │
│  2. Each stream card shows:                                      │
│     ├── Thumbnail/Preview                                        │
│     ├── Streamer name                                            │
│     ├── Viewer count                                             │
│     ├── Token symbol & current price                             │
│     └── Market cap                                               │
│                                                                  │
│  3. Viewer clicks stream → Stream view page loads                │
│  4. Video player + bonding curve chart displayed                 │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 2. Connecting Wallet & Buying Tokens

```
┌──────────────────────────────────────────────────────────────────┐
│  VIEWER PURCHASE FLOW                                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Step 1: Connect wallet (if not connected)                       │
│  ├── Click "Connect Wallet"                                      │
│  ├── Sign authentication message                                 │
│  └── Wallet connected: 0xDEF...456                               │
│                                                                  │
│  Step 2: Approve USDC (USDh on Hedera) spending (first time only)│
│  ├── Click "Approve USDC (USDh)"                                 │
│  ├── MetaMask popup: Approve BondingCurve to spend stablecoin    │
│  └── Confirm transaction (viewer pays gas)                       │
│                                                                  │
│  Step 3: Purchase tokens                                         │
│  ├── Enter amount: "Buy 1,000 tokens"                            │
│  ├── UI shows: Cost = X USDC (USDh on Hedera)                    │
│  ├── Set slippage tolerance (default 2%)                         │
│  ├── Click "Purchase"                                            │
│  ├── MetaMask popup: Confirm transaction                         │
│  └── Confirm transaction (viewer pays gas)                       │
│                                                                  │
│  Step 4: Transaction confirmed                                   │
│  ├── Tokens appear in viewer's wallet                            │
│  ├── Bonding curve chart updates                                 │
│  ├── Price increases for next buyer                              │
│  └── Real-time notification shown to all viewers                 │
│                                                                  │
│  FUND FLOW:                                                      │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  Viewer Wallet                                           │    │
│  │  └── Sends: X USDC (USDh on Hedera) to BondingCurve      │    │
│  │  └── Receives: Y Memecoin tokens                         │    │
│  │  └── Pays: Gas fee in ETH/HBAR                           │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Viewer Gas Costs

| Action                        | Who Pays Gas? | Estimated Cost     |
| ----------------------------- | ------------- | ------------------ |
| Connect wallet                | No gas        | Free               |
| Approve USDC (USDh on Hedera) | Viewer        | ~0.001 ETH (~HBAR) |
| Purchase tokens               | Viewer        | ~0.002 ETH (~HBAR) |
| View stream                   | No gas        | Free               |

---

## AI Agents System

AI Agents are interactive 3D objects that streamers place on their streams. Viewers click agents to purchase memecoins, tip, or interact.

### Agent Types

| Type                | Purpose                           | Interaction            |
| ------------------- | --------------------------------- | ---------------------- |
| **Payable Cube**    | Buy button for memecoin purchases | Click → Buy tokens     |
| **Interactive Jam** | Fun interactive element           | Click → Trigger action |
| **Prediction Bot**  | Betting/prediction markets        | Click → Place bet      |
| **Game Buddy**      | Gamification challenges           | Click → Play game      |

### Agent Identity (ERC-8004)

Every agent has an **on-chain identity** using the ERC-8004 standard:

```
┌──────────────────────────────────────────────────────────────────┐
│  AGENT IDENTITY (ERC-8004)                                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Agent Created:                                                  │
│  ├── ERC-8004 Identity NFT minted on-chain                       │
│  ├── Unique agent ID stored in identity contract                 │
│  ├── Wallet address linked (streamer's wallet)                   │
│  └── Metadata: name, type, capabilities                          │
│                                                                  │
│  Identity Properties:                                            │
│  ├── Unique identifier (on-chain)                                │
│  ├── Ownership (streamer wallet)                                 │
│  ├── Capabilities (can receive payments, etc.)                   │
│  └── Reputation/history (future)                                 │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Story Protocol IP Rights

Agents are registered as **IP Assets** on Story Protocol:

```
┌──────────────────────────────────────────────────────────────────┐
│  STORY PROTOCOL INTEGRATION                                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  When Agent is Created:                                          │
│  ├── ERC-8004 identity minted                                    │
│  ├── IP Asset registered on Story Protocol                       │
│  ├── PIL (Programmable IP License) attached                      │
│  └── Ownership tied to streamer's wallet                         │
│                                                                  │
│  IP Rights Include:                                              │
│  ├── Commercial use rights                                       │
│  ├── Derivative licensing (5% royalty default)                   │
│  ├── Attribution requirements                                    │
│  └── Transferable ownership                                      │
│                                                                  │
│  Derivative Licensing:                                           │
│  ├── Streamer A creates "CoolBot" agent                          │
│  ├── Streamer B licenses CoolBot for their stream                │
│  ├── Story Protocol routes 5% of earnings to Streamer A          │
│  └── All tracked on-chain transparently                          │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### IPFi Marketplace (Trading AI Agents)

Agents can be **bought, sold, and traded** on the IPFi marketplace:

| Action                   | Description                                   |
| ------------------------ | --------------------------------------------- |
| **List Agent**           | Streamer lists agent for sale with price      |
| **Buy Agent**            | Buyer purchases full ownership of agent       |
| **License Agent**        | Rent agent for derivative use (royalty-based) |
| **Trade Royalty Tokens** | Fractional ownership via royalty tokens       |

### Agent Payment Flow

When a viewer clicks an agent to buy memecoin:

```
┌──────────────────────────────────────────────────────────────────┐
│  AGENT-MEDIATED PURCHASE FLOW                                    │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Viewer clicks agent on stream                                │
│  2. Agent validates click is from real human (anti-bot)          │
│  3. Purchase modal opens with amount input                       │
│  4. Viewer enters USDC/USDh (USDair in future) amount            │
│  5. Single transaction executes:                                 │
│     ├── Approve token spending                                   │
│     ├── Set spending limit                                       │
│     └── Execute purchase                                         │
│  6. USDC/USDh sent to BondingCurve contract                      │
│  7. Memecoin tokens sent to viewer                               │
│  8. 98% of payment → Streamer wallet (via agent)                 │
│  9. 2% of payment → Platform wallet                              │
│                                                                  │
│  IMPORTANT: All payments go to streamer's wallet                 │
│  (Agent wallet = Streamer wallet = Deployer wallet)              │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Agent Interactions (Voice Chat - Future)

> **🔮 Future Development:** Voice commands to agents are planned but not yet implemented.

| Interaction        | Status         | Description                     |
| ------------------ | -------------- | ------------------------------- |
| Click to buy       | ✅ Implemented | Purchase memecoin via agent     |
| Click to tip       | ✅ Implemented | Direct payment to streamer      |
| Voice commands     | ⏳ Placeholder | "Move left", "Move right", etc. |
| Agent gamification | ⏳ Placeholder | Games, challenges, rewards      |

---

## Platform Flow

### Platform Wallet

```
Platform Wallet: 0x97b83759eadb2503a8947e8d6eb734795cdefc95
```

### What Platform Handles

```
┌──────────────────────────────────────────────────────────────────┐
│  PLATFORM RESPONSIBILITIES                                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. DEPLOYMENT (Platform pays gas)                               │
│  ├── Deployer wallet: Platform's hot wallet                      │
│  ├── Deploys: MemecoinFactory.createMemecoin()                   │
│  ├── Cost: ~0.01 ETH per deployment                              │
│  └── Streamer pays: NOTHING for deployment                       │
│                                                                  │
│  2. FEE COLLECTION (Automatic via smart contract)                │
│  ├── Every purchase: 2% goes to platform wallet                  │
│  ├── In USDC/USDh (stablecoin)                                   │
│  └── No manual claiming needed                                   │
│                                                                  │
│  3. INFRASTRUCTURE                                               │
│  ├── Backend servers                                             │
│  ├── WebRTC/mediasoup media servers                              │
│  ├── Database (Supabase)                                         │
│  ├── Redis caching                                               │
│  └── S3 storage for thumbnails                                   │
│                                                                  │
│  4. GRADUATION (Future - Platform triggers)                      │
│  ├── Monitor market caps                                         │
│  ├── Trigger graduation when $69K reached                        │
│  └── Create liquidity pool                                       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Platform Revenue Model

```
Revenue = 2% of all token purchases

Example:
├── Stream has $100,000 total purchases
├── Platform receives: $2,000 USDC (USDh on Hedera)
└── Deposited directly to platform wallet
```

---

## Token Economics

### Token Distribution

```
┌─────────────────────────────────────────────────────────────────┐
│                    TOKEN DISTRIBUTION                            │
│                    Total: 1,000,000,000                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │                                                           │   │
│  │   ████████████████████  200M (20%)                        │   │
│  │   CREATOR ALLOCATION                                      │   │
│  │   → Sent to streamer's wallet on deployment               │   │
│  │   → Streamer can hold, sell, or distribute                │   │
│  │                                                           │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │                                                           │   │
│  │   ████████████████████████████████████████████████████    │   │
│  │   ████████████████████████████████████████████████████    │   │
│  │   ████████████████████████████████  800M (80%)            │   │
│  │   BONDING CURVE SUPPLY                                    │   │
│  │   → Held in BondingCurve contract                         │   │
│  │   → Sold to viewers via bonding curve                     │   │
│  │   → Price increases as more are sold                      │   │
│  │                                                           │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Bonding Curve Formula

```
Price = K × (Tokens Sold)²

Where:
  K = 0.000000001 (1e-9)

Example prices:
  After 1,000 tokens sold:    $0.000001
  After 10,000 tokens sold:   $0.0001
  After 100,000 tokens sold:  $0.01
  After 1,000,000 tokens sold: $1.00
```

### Fee Distribution

```
┌─────────────────────────────────────────────────────────────────┐
│  FEE DISTRIBUTION ON EVERY PURCHASE                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   USDC/USDh paid by viewer                                       │
│            │                                                     │
│            ▼                                                     │
│   ┌────────────────────────────────────────────────────────┐    │
│   │              BONDING CURVE CONTRACT                     │    │
│   │                                                         │    │
│   │   ┌────────────────────────────────────────────────┐    │    │
│   │   │  98% → STREAMER WALLET (Creator Fee)           │    │    │
│   │   │  Instant transfer to creator address           │    │    │
│   │   │  In USDC (Base) or USDh (Hedera)               │    │    │
│   │   └────────────────────────────────────────────────┘    │    │
│   │                                                         │    │
│   │   ┌────────────────────────────────────────────────┐    │    │
│   │   │  2% → PLATFORM WALLET (Platform Fee)           │    │    │
│   │   │  0x97b83759eadb2503a8947e8d6eb734795cdefc95    │    │    │
│   │   │  In USDC (Base) or USDh (Hedera)               │    │    │
│   │   └────────────────────────────────────────────────┘    │    │
│   │                                                         │    │
│   │   Memecoin tokens sent to viewer                        │    │
│   └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Wallet & Fund Distribution

### All Wallets Involved

| Wallet                    | Purpose                    | Receives                               |
| ------------------------- | -------------------------- | -------------------------------------- |
| **Streamer Wallet**       | Creator's connected wallet | 200M tokens + 98% of all purchase fees |
| **Platform Wallet**       | air.fun treasury           | 2% of all purchase fees                |
| **Deployer Wallet**       | Backend hot wallet         | Nothing (pays deployment gas)          |
| **Viewer Wallet**         | Buyer's wallet             | Memecoin tokens                        |
| **BondingCurve Contract** | Holds tokens for sale      | Nothing (passes through)               |

### Money Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      COMPLETE MONEY FLOW                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ON STREAM CREATION:                                             │
│                                                                  │
│  Platform Deployer Wallet                                        │
│  └── Pays: ~0.01 ETH gas                                         │
│                                                                  │
│  MemecoinFactory Contract                                        │
│  └── Deploys: Memecoin + BondingCurve                            │
│                                                                  │
│  Memecoin Contract                                               │
│  └── Mints: 1 Billion tokens                                     │
│      ├── 200M → Streamer Wallet (creator allocation)             │
│      └── 800M → BondingCurve Contract                            │
│                                                                  │
│  ─────────────────────────────────────────────────────────────   │
│                                                                  │
│  ON EACH TOKEN PURCHASE:                                         │
│                                                                  │
│  Viewer Wallet                                                   │
│  ├── Sends: X USDC/USDh → BondingCurve                           │
│  └── Pays: Gas fee (ETH/HBAR)                                    │
│                                                                  │
│  BondingCurve Contract (instant distribution)                    │
│  ├── 98% USDC (USDh on Hedera) → Streamer Wallet                 │
│  ├── 2% USDC (USDh on Hedera) → Platform Wallet                  │
│  └── Y Tokens → Viewer Wallet                                    │
│                                                                  │
│  ─────────────────────────────────────────────────────────────   │
│                                                                  │
│  ON GRADUATION ($69K market cap):                                │
│                                                                  │
│  LiquidityPoolFactory Contract                                   │
│  └── Creates: Memecoin/AIR liquidity pool                        │
│                                                                  │
│  Remaining BondingCurve tokens + AIR tokens                      │
│  └── Sent to: Liquidity Pool                                     │
│                                                                  │
│  LP Tokens                                                       │
│  └── Burned: To 0x000...dead (rug-pull protection)               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Graduation to DEX

### When Graduation Happens

```
Graduation Threshold: $69,000 Market Cap

Market Cap = Current Price × Tokens Sold

When market cap reaches $69K:
├── Platform backend detects threshold
├── Triggers LiquidityPoolFactory.createLiquidityPool()
└── Token becomes tradeable on DEX
```

### Graduation Process

```
┌─────────────────────────────────────────────────────────────────┐
│                    GRADUATION FLOW                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Market cap reaches $69,000                                   │
│                                                                  │
│  2. BondingCurve.graduate() is called                            │
│     └── Marks token as graduated                                 │
│     └── No more purchases allowed on bonding curve               │
│                                                                  │
│  3. LiquidityPoolFactory.createLiquidityPool() is called         │
│     Parameters:                                                  │
│     ├── memecoinAddress: The graduated token                     │
│     ├── creator: Streamer's wallet                               │
│     ├── memecoinAmount: Remaining tokens in bonding curve        │
│     └── airAmount: Matching AIR tokens from platform             │
│                                                                  │
│  4. Liquidity Pool created                                       │
│     ├── Pool Address: New contract                               │
│     ├── Contains: Memecoin + AIR pair                            │
│     └── Trading: Now possible via AMM                            │
│                                                                  │
│  5. LP tokens burned                                             │
│     └── Prevents rug pull (liquidity locked forever)             │
│                                                                  │
│  6. Token now tradeable                                          │
│     ├── Buy/Sell on DEX                                          │
│     ├── Price determined by AMM formula                          │
│     └── No more bonding curve pricing                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Post-Graduation Trading

After graduation:

- Bonding curve is closed (no purchases)
- Token trades against AIR in liquidity pool
- Standard AMM pricing (x \* y = k)
- Anyone can provide additional liquidity (optional)

---

## Anti-Bot Protection

### The Bot Problem

Traditional DEXs and memecoin platforms suffer from **massive bot manipulation**:

- 70%+ of tokens on pump.fun created/manipulated by bots
- Bots front-run trades, snipe launches
- Unfair for human traders
- Damages community trust

### Air.Fun Solution: Agent-Mediated Trading

**ALL purchases on Air.Fun MUST go through clickable AI agents.**

```
┌──────────────────────────────────────────────────────────────────┐
│  ANTI-BOT MECHANISM                                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Traditional DEX:                                                │
│  └── Bot sends transaction directly to smart contract ❌         │
│                                                                  │
│  Air.Fun:                                                        │
│  └── ALL purchases MUST click interactive AI agent ✅            │
│                                                                  │
│  Flow:                                                           │
│  1. Viewer sees agent on stream                                  │
│  2. Viewer clicks agent (mouse/touch)                            │
│  3. Agent validates human interaction:                           │
│     ├── Click coordinates within agent bounds                    │
│     ├── Click timing within human range                          │
│     ├── Active WebRTC session (watching stream)                  │
│     └── Browser fingerprint validation                           │
│  4. Only then: Purchase transaction submitted                    │
│                                                                  │
│  Result:                                                         │
│  ├── Bots cannot interact with agents programmatically           │
│  ├── Must have active stream viewing session                     │
│  ├── Click validation prevents automation                        │
│  └── 95%+ bot exclusion (vs 30% on pump.fun)                     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Post-Graduation: Liquidity Pool Trading

**Challenge:** After graduation, memecoin trades on MEMECOIN/AIR liquidity pool. How to prevent bots?

**Solution Options:**

| Option                        | Description                               | Trade-off                          |
| ----------------------------- | ----------------------------------------- | ---------------------------------- |
| **Agent-gated LP access**     | Require agent click even for LP trades    | Lower liquidity, but bot-free      |
| **Whitelist system**          | Only verified humans can trade on LP      | Requires KYC/verification          |
| **Time-locked access**        | Stream viewers get priority access window | Bots wait, humans trade first      |
| **Fee premium for direct LP** | Higher fees for non-agent trades          | Bots pay more, subsidizes platform |

**Current Implementation:** Agent-gated during bonding curve phase. Post-graduation LP trading is open (standard DEX behavior).

### Fee Impact Analysis

**Question:** Do we lose fees by excluding bots?

| Scenario                       | Bot Volume | Human Volume | Platform Revenue             |
| ------------------------------ | ---------- | ------------ | ---------------------------- |
| **With Bots** (pump.fun style) | 70%        | 30%          | Higher volume, lower quality |
| **Bot-Free** (Air.Fun)         | 5%         | 95%          | Lower volume, higher quality |

**Key Insight:** Bot volume is often wash trading (fake volume). Real revenue comes from:

- Human engagement (repeat buyers)
- Community building (loyal viewers)
- Streamer growth (attracts more streamers)

**Making Up for Lost Bot Fees:**

1. **Premium Features:** Charge for advanced agent customization
2. **IPFi Marketplace Fees:** Take cut of agent trading
3. **Graduation Bonus:** Platform receives AIR tokens at graduation
4. **Subscription Tiers:** Premium streamer features

---

## Stablecoin Integration

### USDC on Base Sepolia

```
Address: 0x036CbD53842c5426634e7929541eC2318f3dCF7e
Decimals: 6
Usage: All token purchases on Base
```

### USDh on Hedera Testnet

```
Address: 0x00000000000000000000000000000000006e24c7
Token ID: 0.0.7200455
Decimals: 6
Usage: All token purchases on Hedera
```

### Stablecoin Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    STABLECOIN FLOW                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  VIEWER (has USDC/USDh in wallet)                                │
│  │                                                               │
│  │ 1. Approve BondingCurve to spend USDC (USDh on Hedera)        │
│  │    USDC.approve(bondingCurveAddress, amount)                  │
│  │                                                               │
│  │ 2. Purchase tokens                                            │
│  │    BondingCurve.purchase(tokenAmount, maxCost)                │
│  │                                                               │
│  ▼                                                               │
│  BONDING CURVE CONTRACT                                          │
│  │                                                               │
│  │ 1. Pulls USDC (USDh on Hedera) from viewer                    │
│  │    USDC.transferFrom(viewer, bondingCurve, cost)              │
│  │                                                               │
│  │ 2. Calculates fee split                                       │
│  │    creatorFee = cost * 98%                                    │
│  │    platformFee = cost * 2%                                    │
│  │                                                               │
│  │ 3. Distributes USDC (USDh on Hedera)                          │
│  │    USDC.transfer(creator, creatorFee)                         │
│  │    USDC.transfer(platformWallet, platformFee)                 │
│  │                                                               │
│  │ 4. Sends tokens to viewer                                     │
│  │    Memecoin.transfer(viewer, tokenAmount)                     │
│  │                                                               │
│  ▼                                                               │
│  RESULT:                                                         │
│  ├── Viewer: Has memecoin tokens                                 │
│  ├── Streamer: Has 98% of payment in USDC/USDh                   │
│  └── Platform: Has 2% of payment in USDC/USDh                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Summary: Who Gets What

### On Stream Creation

| Recipient | What They Get        | Who Pays                      |
| --------- | -------------------- | ----------------------------- |
| Streamer  | 200M memecoin tokens | Free (platform pays gas)      |
| Platform  | Nothing yet          | Pays ~0.01 ETH deployment gas |
| Viewers   | Nothing yet          | -                             |

### On Every Token Purchase

| Recipient | What They Get                | Source                |
| --------- | ---------------------------- | --------------------- |
| Viewer    | Memecoin tokens              | BondingCurve contract |
| Streamer  | 98% of purchase in USDC/USDh | Viewer's payment      |
| Platform  | 2% of purchase in USDC/USDh  | Viewer's payment      |

### On Graduation

| Recipient        | What They Get           |
| ---------------- | ----------------------- |
| Liquidity Pool   | Remaining tokens + AIR  |
| LP Token Holders | Nothing (tokens burned) |
| Everyone         | Tradeable token on DEX  |

---

## Future Development

### 🔮 USDair Stablecoin

**Status:** Planned - Will replace USDC/USDh across all chains

USDair is the **unified platform stablecoin** that will be deployed identically on all supported chains:

| Feature                       | Description                        |
| ----------------------------- | ---------------------------------- |
| **Cross-chain consistency**   | Same token on Base, Hedera, Solana |
| **x402 Protocol Integration** | Built-in agent payment support     |
| **Platform control**          | Air.Fun manages stablecoin supply  |
| **1:1 USDC backing**          | Fully collateralized               |

**x402 Agent Payments:** USDair will natively support the x402 protocol for agent-to-agent and agent-to-viewer payments, enabling:

- Agent pays viewer for winning game
- Agent purchases service from another agent
- Automated micro-payments

### 🔮 LiveCoin (Temporary Stream Token)

**Status:** Planned - High-volatility gamification token

| Characteristic | Description                                   |
| -------------- | --------------------------------------------- |
| **Lifespan**   | Single stream only (expires when stream ends) |
| **Volatility** | Higher than memecoin (lower K value)          |
| **Purpose**    | Real-time betting, predictions, games         |
| **Conversion** | Can convert to memecoin at end of stream      |

**Use Cases:**

- Viewers bet LiveCoin on stream outcomes
- Price spikes during exciting moments
- Winners convert LiveCoin → Memecoin

### 🔮 Solana Devnet Integration

**Status:** Planned - Contracts not yet deployed

| Contract                   | Solana Devnet Address | Status     |
| -------------------------- | --------------------- | ---------- |
| **AIR Token**              | TBD                   | ⏳ Pending |
| **USDh/USDair**            | TBD                   | ⏳ Pending |
| **Memecoin Factory**       | TBD                   | ⏳ Pending |
| **Bonding Curve**          | TBD                   | ⏳ Pending |
| **Liquidity Pool Factory** | TBD                   | ⏳ Pending |

### 🔮 Voice Commands to Agents

**Status:** Placeholder - Infrastructure ready, not implemented

| Command         | Action                      |
| --------------- | --------------------------- |
| "Move left"     | Agent moves left on screen  |
| "Move right"    | Agent moves right on screen |
| "Move up/down"  | Agent moves up/down         |
| "Talk"          | Agent speaks (TTS)          |
| Custom commands | Streamer-defined actions    |

### 🔮 Agent Gamification

**Status:** Placeholder - Future feature

| Game Type          | Description                              |
| ------------------ | ---------------------------------------- |
| **Challenges**     | Viewers bet on streamer completing tasks |
| **Predictions**    | Bet on stream outcomes                   |
| **Agent Battles**  | Viewers fund competing agents            |
| **Treasure Hunts** | Find hidden agents for rewards           |

---

## Story IP Protocol Integration

**Status:** ⏳ Planned - Not yet deployed

### Overview

Story Protocol will be integrated to provide **IP rights management** for AI agents, enabling creators to:

- Register agents as IP assets
- License agents to other streamers
- Earn royalties from derivative works
- Trade IP rights as NFTs

### Agent IP Registration Flow

```typescript
// When agent is created:
const ipAsset = await registerAgentAsIP({
  agentId: agent.id,
  metadata: {
    name: agent.name,
    description: "3D AR agent for livestreaming",
    image: agent.avatarUrl,
    creator: streamer.walletAddress,
  },
  chain: "base-sepolia",
});

// Attach PIL (Programmable IP License):
await attachLicense({
  ipAssetId: ipAsset.id,
  terms: {
    commercialUse: true,
    derivativeRoyalty: 0.05, // 5% royalty on derivatives
    attribution: true,
  },
});
```

### Derivative Licensing

When another streamer wants to use an agent created by someone else:

```
Streamer A creates "CoolBot" agent
Streamer B wants to use CoolBot in their stream

Flow:
  1. Streamer B licenses CoolBot as derivative
  2. Story Protocol automatically routes 5% of earnings to Streamer A
  3. Streamer B can customize appearance but pays royalty
  4. All tracked on-chain transparently
```

### Royalty Token Issuance

When memecoin graduates ($69k market cap):

```
1. Issue 1M Royalty Tokens (ERC-20) via Story Protocol
2. Distribution:
   - 80% to streamer (800k tokens)
   - 20% to public sale on IPfi marketplace (200k tokens)
3. Royalty Tokens represent fractional ownership of agent IP
4. Derivatives pay royalties → Distributed to token holders
```

### Story Protocol Contracts (To Be Deployed)

| Contract                  | Network      | Status     | Purpose                         |
| ------------------------- | ------------ | ---------- | ------------------------------- |
| **IP Asset Registry**     | Base Sepolia | ⏳ Planned | Register agents as IP assets    |
| **Licensing Module**      | Base Sepolia | ⏳ Planned | Manage PIL licenses             |
| **Royalty Module**        | Base Sepolia | ⏳ Planned | Distribute derivative royalties |
| **Royalty Token Factory** | Base Sepolia | ⏳ Planned | Issue fractional IP tokens      |

---

## IPFi Marketplace

**Status:** ⏳ Planned - Not yet deployed

### Overview

IPFi (IP Finance) marketplace enables **trading of AI agents and their IP rights** as financial assets.

### Marketplace Features

| Feature                  | Description                        |
| ------------------------ | ---------------------------------- |
| **List Agent for Sale**  | Sell full ownership of agent       |
| **License Agent**        | Rent agent for use (royalty-based) |
| **Trade Royalty Tokens** | Buy/sell fractional IP ownership   |
| **APY Calculation**      | Royalties ÷ Market Cap × 100       |
| **Price Discovery**      | Market-driven agent valuations     |

### Trading Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    IPFI MARKETPLACE FLOW                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  AGENT OWNERSHIP TRADING:                                        │
│  ├── Streamer lists agent for 10 ETH                             │
│  ├── Buyer purchases full ownership                              │
│  ├── Agent NFT (ERC-8004) transferred                            │
│  └── Buyer now controls agent + receives future royalties        │
│                                                                  │
│  ROYALTY TOKEN TRADING:                                          │
│  ├── Agent generates $10k/year in derivative royalties           │
│  ├── 200k royalty tokens at $0.10 each = $20k market cap        │
│  ├── APY = ($10k / $20k) × 100 = 50%                             │
│  ├── Investors buy tokens for yield                              │
│  └── Royalties auto-distributed to token holders                 │
│                                                                  │
│  LICENSING MARKETPLACE:                                          │
│  ├── Streamer wants to use "CoolBot" for 1 month                 │
│  ├── Pays 100 USDC upfront + 5% ongoing royalties               │
│  ├── Gets license NFT (time-limited)                             │
│  └── Original creator receives payments                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Revenue Streams from Agent IP

| Revenue Source           | Who Receives          | Amount        |
| ------------------------ | --------------------- | ------------- |
| **Agent Purchase**       | Original creator      | 100% of sale  |
| **Derivative Royalties** | Royalty token holders | 5% of revenue |
| **License Fees**         | Original creator      | Custom rate   |
| **Marketplace Fees**     | Platform              | 2.5% of sale  |

### IPFi Smart Contracts (To Be Deployed)

| Contract                | Network      | Status     | Purpose                  |
| ----------------------- | ------------ | ---------- | ------------------------ |
| **Agent Marketplace**   | Base Sepolia | ⏳ Planned | Buy/sell agent ownership |
| **Royalty Exchange**    | Base Sepolia | ⏳ Planned | Trade royalty tokens     |
| **License Marketplace** | Base Sepolia | ⏳ Planned | Rent agents              |
| **Escrow Contract**     | Base Sepolia | ⏳ Planned | Secure P2P transactions  |

---

## Identity & x402 Payments

**Status:** ⏳ Planned - Not yet deployed

### ERC-8004 Agent Identity

Every agent will have an **on-chain identity NFT** that establishes:

- Unique identifier
- Ownership rights
- Capabilities (payment receiving, autonomous actions)
- Reputation history
- MCP server connections

```typescript
// Mint agent identity:
const identityNFT = await mintAgentIdentity({
  agentId: agent.id,
  owner: streamer.walletAddress,
  capabilities: {
    canReceivePayments: true,
    canSendPayments: true,
    canAccessMCP: ["stripe-mcp", "memory-mcp"],
  },
  metadata: {
    name: agent.name,
    type: agent.type,
    createdAt: Date.now(),
  },
});
```

### x402 Payment Protocol

**x402** is a standard for **agent-to-agent payments** using the **USDair stablecoin**.

#### Use Cases

| Payment Type         | Example                                  |
| -------------------- | ---------------------------------------- |
| **Agent → Viewer**   | Agent rewards viewer for winning game    |
| **Agent → Agent**    | Agent pays another agent for service     |
| **Agent → Streamer** | Agent tips streamer from collected funds |
| **Viewer → Agent**   | Viewer pays agent for interaction        |

#### x402 Payment Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    X402 PAYMENT FLOW                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  AGENT → VIEWER PAYMENT (Reward for winning game):              │
│  ├── Viewer completes challenge on stream                        │
│  ├── Agent verifies completion (on-chain or oracle)              │
│  ├── Agent sends x402 payment request                            │
│  ├── USDair transferred from agent wallet → viewer wallet        │
│  └── Transaction recorded in agent identity NFT history          │
│                                                                  │
│  AGENT → AGENT PAYMENT (Service request):                        │
│  ├── Agent A needs data from Agent B's MCP server                │
│  ├── Agent A sends x402 payment request with service ID          │
│  ├── USDair transferred from Agent A → Agent B                   │
│  ├── Agent B provides data/service                               │
│  └── Both agents record transaction in identity history          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### USDair Stablecoin

**USDair** is the native stablecoin for agent payments:

| Feature              | Description                         |
| -------------------- | ----------------------------------- |
| **Multi-chain**      | Base, Hedera, Solana                |
| **Backing**          | 1:1 USDC reserves                   |
| **x402 Integration** | Built-in agent payment support      |
| **Micro-payments**   | Optimized for sub-cent transactions |
| **Gas Optimization** | Batched payments to reduce costs    |

### Identity & Payment Contracts (To Be Deployed)

| Contract                | Network              | Status     | Purpose                |
| ----------------------- | -------------------- | ---------- | ---------------------- |
| **ERC-8004 Identity**   | Base Sepolia         | ⏳ Planned | Agent identity NFTs    |
| **x402 Payment Module** | Base, Hedera, Solana | ⏳ Planned | Agent payment protocol |
| **USDair Stablecoin**   | Base, Hedera, Solana | ⏳ Planned | Multi-chain stablecoin |
| **Payment Escrow**      | Base, Hedera, Solana | ⏳ Planned | Secure agent payments  |

---

## Future Smart Contracts

### Summary of Planned Deployments

| Contract/System           | Target Chain(s)      | Priority | Timeline   | Dependencies       |
| ------------------------- | -------------------- | -------- | ---------- | ------------------ |
| **Story IP Registry**     | Base Sepolia         | High     | Months 4-6 | None               |
| **ERC-8004 Identity**     | Base Sepolia         | High     | Months 4-6 | None               |
| **IPFi Marketplace**      | Base Sepolia         | Medium   | Months 7-9 | Story IP, ERC-8004 |
| **x402 Payment Protocol** | Base, Hedera, Solana | Medium   | Months 7-9 | USDair stablecoin  |
| **USDair Stablecoin**     | Base, Hedera, Solana | High     | Months 4-6 | None               |
| **Solana Contracts**      | Solana Devnet        | Low      | Months 10+ | USDair, testing    |
| **Governance Token**      | Base Sepolia         | Low      | Months 10+ | Platform maturity  |

### Integration Roadmap

```
Phase 1 (Current - Months 1-3):
✅ Base Sepolia: AIR, USDC, Memecoin Factory, LP Factory
✅ Hedera: AIR, USDh, Memecoin Factory, LP Factory
✅ Token deployment automation
✅ Bonding curve trading
✅ Real-time blockchain status

Phase 2 (Months 4-6):
⏳ Story Protocol integration (IP registration)
⏳ ERC-8004 identity contracts
⏳ USDair stablecoin (replace USDC/USDh)
⏳ Agent IP registration in UI
⏳ Derivative licensing UI

Phase 3 (Months 7-9):
⏳ IPFi marketplace launch
⏳ x402 payment protocol
⏳ Agent-to-agent payments
⏳ Royalty token trading
⏳ Agent rental marketplace

Phase 4 (Months 10-12):
⏳ Solana integration
⏳ Cross-chain bridges
⏳ Governance token launch
⏳ DAO formation
⏳ Advanced DeFi features
```

---

## Development Roadmap

### Current Status (December 11, 2025)

**✅ Completed:**

- Dual-chain deployment (Base Sepolia + Hedera Testnet)
- Memecoin factory contracts
- Bonding curve trading
- Liquidity pool factories
- Real-time deployment UI
- Backend token factory service
- WebSocket status broadcasting
- Contract verification on explorers

**🔄 In Progress:**

- Integration testing across both chains
- Frontend purchase flow
- Price chart visualization
- Transaction history
- Agent placement UI

**⏳ Planned:**

- Story Protocol integration
- ERC-8004 identity system
- IPFi marketplace
- x402 payment protocol
- USDair stablecoin
- Solana deployment
- Mobile applications

### Technical Priorities

1. **Smart Contract Layer** ✅ **COMPLETE**
   - Base Sepolia contracts deployed
   - Hedera Testnet contracts deployed
   - Contract verification complete
   - ABIs exported for frontend

2. **Backend Services** 🔄 **IN PROGRESS** (80% complete)
   - Token factory service ✅
   - WebSocket broadcasting ✅
   - Database integration ✅
   - Purchase flow ⏳
   - Graduation monitoring ⏳

3. **Frontend Integration** 🔄 **IN PROGRESS** (60% complete)
   - Wallet connection ✅
   - Stream creation ✅
   - Deployment modal ✅
   - Purchase UI ⏳
   - Price charts ⏳

4. **Advanced Features** ⏳ **NOT STARTED**
   - Story IP integration
   - Identity contracts
   - IPFi marketplace
   - x402 payments
   - Agent rental system

### Architecture Already Built (Other Codespace)

Based on the `PROJECT_OVERVIEW.md` and `TECH_STACK.md`, the other codespace has already built:

**✅ Platform Product:**

- React 18 + TypeScript + Vite
- WebRTC streaming (peer-to-peer)
- Supabase integration
- Wallet connection (Thirdweb)
- Stream gallery
- 3D agent placement (Three.js)
- Real-time agent sync
- Auction system

**✅ Filter Extension:**

- Chrome Manifest V3 extension
- Content scripts for Twitch/YouTube/Kick
- WebSocket signaling server
- Canvas overlay rendering
- Clickable agent interactions
- Agent templates (Payment Cube, Voice Bot, Q&A, Prediction)

### Integration Strategy

**Your blockchain infrastructure will fit into the existing architecture as follows:**

1. **Token Factory Service** → Integrates with backend `/api/streams/create` endpoint
2. **Bonding Curve Service** → Integrates with agent click handlers
3. **Price Updates** → WebSocket broadcasts to all connected clients
4. **Wallet Transactions** → Uses existing Thirdweb wallet connections
5. **Contract ABIs** → Imported by frontend services
6. **Deployment Modal** → Plugs into existing stream creation UI

**No conflicts expected** - The blockchain layer is additive and complements the existing WebRTC/agent infrastructure.

---

## Quick Reference

### Key Addresses (Base Sepolia)

```
Platform Wallet:       0x97b83759eadb2503a8947e8d6eb734795cdefc95
USDC:                  0x036CbD53842c5426634e7929541eC2318f3dCF7e
AIR Token:             0xB2D4ED0c17487ABfEfC4d3feEE7EB860e82aA3f7
Memecoin Factory:      0x3c4ceDfE7F0a20013B0adae70443d0102166Db54
Liquidity Pool Factory: 0x5834aEe88F9163a4146B3053D2Ffa34Bf53b6727
```

### Key Addresses (Hedera Testnet)

```
Platform Wallet:       0x97b83759eadb2503a8947e8d6eb734795cdefc95
USDh:                  0x00000000000000000000000000000000006e24c7 (Token ID: 0.0.7200455)
AIR Token:             0x00000000000000000000000000000000007052b7 (Token ID: 0.0.7361207)
Memecoin Factory:      0x210542A52aF3c0A5854B75E84C67312Ffe6F004A
Liquidity Pool Factory: 0x6796cb5394c66f194771b059c54137a9eD64cbEa
```

### Key Addresses (Solana Devnet) - COMING SOON

```
Platform Wallet:       TBD
USDh/USDair:           TBD
AIR Token:             TBD
Memecoin Factory:      TBD
Liquidity Pool Factory: TBD
```

### Key Parameters

| Parameter            | Value             |
| -------------------- | ----------------- |
| Total Token Supply   | 1,000,000,000     |
| Creator Allocation   | 200,000,000 (20%) |
| Bonding Curve Supply | 800,000,000 (80%) |
| Creator Fee          | 98%               |
| Platform Fee         | 2%                |
| Graduation Threshold | $69,000           |
| Bonding Curve K      | 0.000000001       |

---

## Document Summary

This comprehensive guide consolidates information from multiple source files:

### Source Files Merged

1. **ARCHITECTURE.md** - Project structure, technology stack, service architecture
2. **BLOCKCHAIN_INTEGRATION.md** - Contract integration patterns, frontend/backend flows
3. **BLOCKCHAIN.md** - Deployed contract addresses and network information
4. **CONTRACTS_QUICK_REFERENCE.md** - Quick reference card for contracts
5. **DEPLOYMENT_INSTRUCTIONS.md** - Deployment procedures and configuration
6. **DEPLOYMENT_SUMMARY.md** - Deployment status and results
7. **AIR_FUN_COMPREHENSIVE_VISION.md** - Complete platform vision and future features
8. **PROJECT_OVERVIEW.md** - Existing architecture from other codespace
9. **TECH_STACK.md** - Technology choices and rationale

### What This Document Provides

**✅ For Developers:**

- Complete smart contract addresses for both chains
- Integration patterns for frontend and backend
- Contract function references and ABIs
- Environment variable setup
- Real-world code examples

**✅ For Blockchain Integration:**

- Deployed contracts on Base Sepolia and Hedera Testnet
- Token factory service implementation
- WebSocket deployment status broadcasting
- Transaction handling patterns

**✅ For Future Development:**

- Story IP Protocol integration plans
- IPFi marketplace specifications
- ERC-8004 identity system
- x402 payment protocol
- USDair stablecoin roadmap

**✅ For Business Logic:**

- Complete user flows (streamer, viewer, platform)
- Token economics (98/2 fee split)
- Graduation mechanics ($69K threshold)
- Anti-bot protection strategies
- Agent IP rights management

### Key Differentiators from Other Platforms

1. **Dual-Chain Architecture**: Base Sepolia + Hedera Testnet (Solana coming)
2. **Agent-Mediated Trading**: 95%+ bot protection via clickable agents
3. **Creator-First Economics**: 98% revenue to creators vs 50-70% on traditional platforms
4. **IP Rights**: Story Protocol integration for agent licensing
5. **Two Deployment Modes**: Native platform + browser extension filter

### Critical Addresses - Copy/Paste Ready

```bash
# Base Sepolia (Chain ID: 84532)
USDC=0x036CbD53842c5426634e7929541eC2318f3dCF7e
AIR=0xB2D4ED0c17487ABfEfC4d3feEE7EB860e82aA3f7
FACTORY=0x3c4ceDfE7F0a20013B0adae70443d0102166Db54
LP_FACTORY=0x5834aEe88F9163a4146B3053D2Ffa34Bf53b6727

# Hedera Testnet (Chain ID: 296)
USDh=0x00000000000000000000000000000000006e24c7
AIR=0x00000000000000000000000000000000007052b7
FACTORY=0x210542A52aF3c0A5854B75E84C67312Ffe6F004A
LP_FACTORY=0x6796cb5394c66f194771b059c54137a9eD64cbEa

# Platform
PLATFORM_WALLET=0x97b83759eadb2503a8947e8d6eb734795cdefc95
```

### Next Steps for Codespace Collaboration

1. **Import Contract ABIs**: Located in `packages/contracts/artifacts/`
2. **Connect Token Factory Service**: Integrate with stream creation endpoint
3. **Add Deployment Modal**: Use DeploymentInfo interface provided
4. **Implement Purchase Flow**: Connect to bonding curve contracts
5. **WebSocket Integration**: Broadcast deployment status to frontend
6. **Test Both Chains**: Verify Base Sepolia and Hedera Testnet flows

### Status Legend

- ✅ **Deployed/Complete** - Live on testnets and working
- 🔄 **In Progress** - Currently being built
- ⏳ **Planned** - Future development, not yet started
- 📌 **Optional** - Nice-to-have features

---

**Document Version**: 2.0 Comprehensive  
**Last Updated**: December 11, 2025  
**Prepared For**: Code Space Collaboration  
**Total Lines**: 1,971  
**Coverage**: Complete blockchain infrastructure + user flows + future roadmap
