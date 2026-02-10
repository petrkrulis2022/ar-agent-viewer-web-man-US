# Intangible Tech — UnrealPay Investor Pitch Overview (Draft)

_Short version is the **Investor summary (≤2500 characters)** section below; the rest is the detailed narrative._

## Investor summary (≤2500 characters)

**Intangible Tech** is building **UnrealPay**, payment infrastructure for the spatial web. We make payments native to AR by turning checkouts and financial actions into **interactive 3D interfaces** (our signature 3D cube payment engine) and into **deployable AR terminals** that work across **TradFi + crypto rails**.

Instead of flat modals, users pay inside the camera experience: the terminal is a **persistent AR object** (an agent/device) that can be discovered, tapped, and paid. This becomes the foundation for **agentic commerce**—AI agents that can charge per interaction, coordinate other agents, and settle payments with clear proofs.

Three flagship products:

- **Virtual POS (Payment Terminal — POS):** merchant-grade AR terminal for e‑commerce and on/off‑ramp checkouts. Supports **dynamic payment context** (order ID, amount, items, merchant, return URL) passed via URL‑safe payloads, **terminal-only mode** for fast checkout, and **fixed vs dynamic fees**.
- **Virtual MyTerminal (My Payment Terminal):** personal/creator terminal—an always-available payment endpoint in AR, enabling P2P and creator monetization.
- **ARTM (Virtual Terminal):** AR-native teller flow (card and crypto-to-cash). Implemented with **structured, receipt-like flows** and a “trusted display” pattern (camera remains visible, explicit step stacking). Includes a **dispenser identifier** in terminal config as the hook for binding to physical cash dispensers (hardware attestation/audit on roadmap).

Why we’re defensible: UnrealPay is an **SDK + protocol stack**:

- **UI primitives:** 3D cube selection → QR/terminal flows.
- **Redirect/session protocol:** merchants can integrate without deep backend coupling; pay in AR; return with status.
- **Rail adapters:** multi-chain crypto (incl. ENS identity + USDC transfers) and cross-chain USDC settlement (Arc/CCTP/Bridge Kit mode). TradFi rails have defined endpoints and demo flows; some card/bank paths are currently **simulated/mock** for iteration speed.

Outcome: UnrealPay builds the expertise to become the **first AR financial infrastructure** spanning TradFi + crypto rails and enabling scalable **agentic commerce**.

## 1) One-line description

UnrealPay (by **Intangible Tech**) is a **payment infrastructure layer for the spatial web**: it turns AR experiences and AI agents into **monetizable, location-aware interfaces** using a signature **3D Cube payment UI**, and connects them to **TradFi** (card / bank rails) and **crypto rails** (multi-chain + cross-chain USDC).

## 2) The big idea: payments become spatial, not modal

Traditional payments are flat overlays that break immersion and are hard to trust in AR contexts.
UnrealPay reframes payment as a **spatial interaction**:

- A user sees an agent, storefront, device, or terminal **as a 3D object in AR**.
- The payment interface is a **3D cube** that the user can rotate and select faces from.
- The “terminal” is not a website—it's a **persistent AR object** that can be deployed, discovered, and interacted with.

This is the foundation for **agentic commerce**: AI agents can sell services, coordinate other agents, and accept payments in the same AR environment where the user is already engaged.

---

## 3) Product suite: three flagship “terminals”

### A) Virtual POS (Payment Terminal — POS)

**What it is**
A merchant-grade AR terminal that acts like a POS device, but lives as a **3D object in AR**. It can be used for:

- E‑commerce checkout completion (redirect into AR, pay, redirect back)
- On‑ramp / off‑ramp checkout (buy crypto, sell crypto)
- In-person AR payments (e.g., pop-ups, events, creators, micro-merchants)

**Core capabilities**

- **Dynamic payment redirect system**: external apps (e‑shop / on‑ramp) can pass full payment context (order ID, amount, currency, items, merchant, return URL) to the AR terminal using **URL-safe encoded payloads**.
- **Terminal-only payment mode**: when payment context is present, the AR viewer can filter the experience so the user sees **only their payment terminals**, reducing confusion and speeding checkout.
- **Fixed-fee or dynamic-fee acceptance**:
  - Fixed fee: terminal shows a specific amount.
  - Dynamic fee: terminal accepts a per-transaction amount set by the merchant/app at checkout.
- **Multiple rails behind one interface**: crypto QR, bank QR, virtual card experiences, and cross-chain USDC settlement.

**Why investors should care**
Virtual POS is the “transaction engine” that converts any web funnel into an AR-native checkout—without asking every merchant to build custom payment UX.

---

### B) Virtual MyTerminal (My Payment Terminal)

**What it is**
A personal, creator-first terminal: a “MyTerminal” that an individual deploys as their **own always-available payment endpoint** in AR.

**Typical use cases**

- Creators receiving payments/tips in AR (events, streams, IRL meetups)
- Personal commerce (sell a digital item or service as a micro-merchant)
- A user’s “financial identity object” in AR: a persistent place where others can pay them

**What’s different from Virtual POS**

- Optimized for **personal ownership and discoverability** (your own terminal(s), your own settings)
- Becomes a building block for **peer-to-peer agentic commerce** (users paying users / agents paying agents)

---

### C) ARTM (Augmented Reality Teller Machine) — “virtual trusted display” for cash-out

**What it is**
ARTM is a **Virtual Terminal** designed as an AR-native teller experience: a 3D ATM-like device in AR paired with an on-screen flow that supports:

- **Card-based withdrawal flows** (bank integrations)
- **Crypto-to-cash withdrawal flows** (exchange + wallet integrations)

**Key concept: a virtual trusted display**
In the AR viewer, ARTM is rendered in a way that keeps the **camera feed visible behind the modal layers** and uses explicit stacking rules.
For investor language, the right framing is:

- Not “unhackable” in an absolute sense,
- But **tamper-resistant-by-design UI**: the terminal behaves like a “trusted display layer” that reduces overlay confusion and makes the payment/withdrawal steps visible and auditable.

**Cash dispenser connection (hardware-binding)**
ARTM’s data model includes a **dispenser identifier** (e.g., `dispenser_id` / `cash dispenser ID`) in terminal configuration. This is the hook for:

- Binding a virtual terminal to a physical cash dispenser
- Enabling hardware attestation / audit logs (roadmap)
- Showing the dispenser identity inside the ARTM UI during withdrawal

**User experience (today)**

- ARTM presents two entry actions:
  - **“Tap on Card”** (bank withdrawal flow)
  - **“Tap on Wallet”** (crypto withdrawal flow)
- The flow is currently implemented with **mock/simulated processing** steps for speed of iteration and demo readiness, while the schema and UI enforce the correct structure (integrations enabled, balances, limits, receipts).

**Why investors should care**
ARTM is a wedge into the hardest part of payments: cash-out and real-world settlement. It positions UnrealPay to bridge **digital value → physical utility** in an AR-native way.

---

## 4) UnrealPay SDK: why this is defensible infrastructure

UnrealPay isn’t just an app; it’s an SDK + protocol stack that makes AR payments repeatable.

### A) SDK layer 1 — “Payment UI primitives”

- A signature **3D Cube payment engine** that:
  - Lives inside an AR camera experience
  - Supports multiple payment methods as cube faces
  - Transitions into QR / terminal flows without losing immersion

### B) SDK layer 2 — “Payment session + redirect protocol”

- A practical integration path for merchants who already have a checkout:
  1. merchant creates an order
  2. merchant redirects user to UnrealPay with an encoded payload
  3. user completes payment in AR terminal
  4. user is redirected back with payment status

This is critical because it lowers integration cost: merchants do not need deep backend coupling to start.

### C) SDK layer 3 — “Rail adapters (TradFi + crypto) behind one interface”

UnrealPay’s core advantage is **rail abstraction**:

- TradFi-oriented flows (virtual card / bank QR experiences; some are simulated today, production endpoints are defined)
- Crypto-native flows:
  - Multi-chain support
  - ENS-based human-readable recipient identities
  - Cross-chain USDC settlement paths (Arc/CCTP/Bridge Kit rail)

### D) SDK layer 4 — “Proof + audit surfaces for AR finance”

AR finance needs trust surfaces that are understandable inside AR:

- Show chain IDs, transaction hashes, and route steps
- Provide “receipt-like” confirmations inside the AR interface
- Make progress steps explicit (connect → approve → bridge → confirm → done)

This knowledge—how to present **transaction proofs** inside spatial UX—is a moat.

---

## 5) What’s implemented today (truthful snapshot)

- **AR-native payment interaction** via the signature 3D cube UI (3D cube UI + QR transitions)
- **Payment terminals as deployable agent types**:
  - Payment Terminal (POS)
  - Trailing Payment Terminal
  - My Payment Terminal (personal)
  - Virtual Terminal (ARTM)
- **Dynamic payment amounts + redirect-based merchant integration** (e‑shop and on/off-ramp flows)
- **ENS payments** (ENS resolution + USDC on Sepolia)
- **Mock-mode support** for fast demos where backend APIs are not available
- **Cross-chain USDC rail (Arc / Bridge Kit)** integrated as an optional payment rail mode

---

## 6) Why UnrealPay wins in the “Augmented Reality economy”

### A) AR will need its own financial infrastructure

As AR becomes the front-end for daily computing, payments can’t remain “pop-up modals.”
They become:

- **Spatial objects** (terminals, wallets, storefronts)
- **Contextual** (location-aware, camera-present, real-world anchored)
- **Agentic** (AI agents coordinating purchases, splitting payments, and proving fulfillment)

### B) UnrealPay is already building the hard parts

The three flagship features collectively create the expertise required to own AR finance:

- Virtual POS teaches **merchant checkout, dynamic pricing, redirect protocols, and multi-rail acceptance**.
- Virtual MyTerminal teaches **personal ownership, discovery, and repeatable payment identity**.
- ARTM teaches **cash-out UX, trusted-display patterns, and hardware-binding via dispenser identity**.

### C) The long-term moat: agentic commerce on top of rails

Once payments are natively embedded in AR:

- AI agents can sell services and charge per interaction
- Agent-to-agent coordination becomes natural (routing, splitting, settlement)
- Merchants can deploy “AR-native POS endpoints” rather than building per-platform payment UX

---

## 7) Suggested investor deck framing (copy/paste)

- **“Stripe for the Spatial Web.”** (Infrastructure + SDK, not a one-off app)
- **“AR-native terminals.”** (POS, personal terminal, teller machine)
- **“One interface, many rails.”** (TradFi and crypto abstraction)
- **“Trusted display for AR finance.”** (proof surfaces + auditability)
- **“Agentic commerce-ready.”** (agents that can earn, pay, coordinate)

---

## 8) Roadmap (high-confidence next steps)

- Production-grade bank/card rails behind the same terminal UX (beyond simulation)
- Hardware-integrated cash dispenser binding for ARTM (attestation + audit logs)
- Expand cross-chain USDC settlement rails and make proofs first-class objects
- Merchant SDK packaging: drop-in redirect + terminal selection + receipts
- More device targets: AR glasses / headset-first experiences



Add this paragraph to your "What is your company going to make?" section:

"Why these three products matter strategically: Each one teaches us a different layer of AR finance that nobody else is building. Virtual POS teaches merchant-grade checkout and multi-rail abstraction. MyTerminal teaches personal payment identity and peer-to-peer patterns. ARTM teaches the hardest part—cash-out and hardware-binding for physical settlement. Building all three at the TradFi/crypto intersection gives us the complete knowledge stack to become the first AR-native financial infrastructure layer. When AR becomes the computing interface, we'll be the only team that's already solved spatial payments, rail abstraction, trusted display patterns, and agentic commerce primitives."