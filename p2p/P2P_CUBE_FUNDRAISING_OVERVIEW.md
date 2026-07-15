# P2P Cube — Private, KYC-Free Peer-to-Peer Crypto Trading in AR

**By Intangible Tech · Built on the UnrealPay spatial-payments stack**
**Status:** Pre-Development / Fundraising · Last updated: June 29, 2026

---

## One-line description

**P2P Cube** lets two strangers buy and sell crypto — for cash or for other crypto — without a central exchange, without KYC, and without ever exposing their identities or wallet addresses to each other. The trade is escrowed by a smart contract and completed by tapping a **3D payment cube on an AR agent** anchored to a real-world location.

## The problem

Every "easy" way to off-ramp crypto today forces a trade-off. Centralized exchanges demand full KYC, custody your funds, freeze accounts, and report everything. Existing P2P options are either clunky desktop software (Bisq), single-asset and contact-graph-limited (Vexl), or thin-veneer escrow services that still see your data. None are mobile-native, none make the experience feel safe or modern, and none give a seller meaningful control over *where and how* a location-based settlement happens.

There is real, durable demand for a way for two consenting people to swap value privately — and it's growing as surveillance of financial activity tightens.

## The solution

P2P Cube turns a trade into a deployable **AR agent**. A seller posts an offer, picks a spot, and deploys an agent — a 3D object pinned to GPS coordinates — whose funds sit in a **per-trade escrow smart contract**, not with us and not with either party. The buyer finds the agent through their camera, taps it, and a **3D payment cube** opens the settlement flow. Funds release only on the seller's explicit on-chain confirmation. When the trade is done, the agent decays and disappears, leaving no link between the two people.

**Two settlement modes:**

- **Crypto-for-crypto (trustless) — flagship.** An atomic-swap contract exchanges, e.g., ETH for USDC the instant both sides deposit. No trust, no disputes, no intermediary — math settles it.
- **Crypto-for-cash (Revolut / bank).** The seller deposits crypto into escrow; the buyer pays fiat; the seller confirms receipt and releases. Manual confirmation by design — the battle-tested Bisq / LocalBitcoins pattern — so there is no "fake webhook" theft vector.

**Two distinctive primitives:**

- **Location safety controls.** The seller sets a radius; the buyer can reposition the meeting point within it — so neither party is forced to a fixed address, avoiding ambush spots or fixed cameras.
- **On-chain privacy.** Ephemeral wallets and an optional Railgun shielding layer keep the blockchain trail unlinkable for the crypto-native flows.

## Why it's defensible

P2P Cube is not a standalone app — it's a product on the **UnrealPay spatial-payments stack**. It reuses the same 3D cube engine, AR agent deployment, camera/GPS anchoring, multi-chain rail adapters, and Supabase data layer that already power our POS, MyTerminal, and ARTM products. So it ships faster than any from-scratch competitor and compounds the same moat: nobody else has solved *spatial payment UX, rail abstraction, and trusted-display patterns* together. The new, proprietary layer is the **per-trade escrow + matching + privacy protocol** — the trust core that turns our AR payment UI into a full P2P exchange.

## Differentiators at a glance

| | P2P Cube | Bisq | Vexl | Central exchange |
|---|---|---|---|---|
| No KYC | ✅ | ✅ | ✅ | ❌ |
| Non-custodial (contract escrow) | ✅ | ✅ | n/a | ❌ |
| Mobile + AR-native experience | ✅ | ❌ | partial | partial |
| Location-aware safety controls | ✅ | ❌ | ❌ | ❌ |
| Trustless crypto-for-crypto swaps | ✅ | partial | ❌ | ✅ |
| Built on a reusable payments SDK | ✅ | ❌ | ❌ | ❌ |

## Why now

AR is becoming a computing front-end (Vision Pro, Quest, AR glasses), financial-privacy demand is rising, and self-custody is going mainstream — but **none of these have a native P2P settlement layer**. P2P Cube is positioned at that intersection before it's contested.

## Truthful status snapshot

- **Built and reusable today:** the AR interaction layer — 3D cube payment engine, agent deployment, camera/GPS anchoring, agent filtering, multi-chain payment services (Hedera, Solana, EVM), and a simulated Revolut / cash-out (ARTM) flow. The interaction side is ~80% in place.
- **To build (the trust core):** the per-trade escrow + atomic-swap smart contracts and their on-chain toolchain, ephemeral anonymous auth, the offer/matching layer, signed location-move verification, and a real (manual-confirm) fiat path. Today's payment flows are QR-based and the fiat leg is simulated.
- **Honest on privacy:** the crypto-for-crypto mode is genuinely private and trustless end-to-end. The fiat mode is "no platform KYC," but a bank transfer inherently links the two parties *at the bank level* — so we lead with the trustless crypto swap and treat cash as an opt-in mode, not a privacy guarantee. We would rather under-claim to investors than oversell.

## What the raise unlocks

Funding takes P2P Cube from a working AR front-end to a complete protocol: smart-contract development and **third-party audit** (the gate for handling real value), the matching and privacy layers, testnet→mainnet launch, and the legal/jurisdiction work to operate a non-custodial P2P protocol responsibly. The build sequence is deliberately de-risked: ship the **trustless crypto-for-crypto swap first** (no fiat, no disputes, no custody exposure) to prove the AR-trade experience, then layer in the fiat mode.

## Positioning line

> **"Vexl meets Uniswap, with a spatial interface."** A non-custodial, KYC-free P2P exchange where the trade itself is an AR object you walk up to — built on the only payments stack designed for the spatial web.

---

## Investor summary (≤2500 characters)

**P2P Cube** (by **Intangible Tech**) is a non-custodial, KYC-free peer-to-peer crypto exchange where the trade is an **AR object you walk up to and tap**. Two strangers match an offer, and settlement happens through a **per-trade escrow smart contract** — funds are never held by us or by the counterparty — completed via our signature **3D payment cube** anchored to a GPS location.

Two modes: **crypto-for-crypto** atomic swaps (fully trustless, no disputes — our flagship) and **crypto-for-cash** via Revolut/bank (seller manually confirms receipt before release, the proven Bisq pattern). Sellers set a movement **radius** and buyers can reposition the meeting point within it for physical safety; ephemeral wallets and an optional Railgun layer keep the on-chain trail unlinkable.

Why we're fast and defensible: P2P Cube is built on the **UnrealPay spatial-payments stack**, reusing our 3D cube engine, AR agent deployment, camera/GPS anchoring, multi-chain rail adapters, and Supabase backend — the interaction layer is already ~80% built. The new proprietary layer is the escrow + matching + privacy protocol.

Honest status: the AR front-end and a simulated cash-out flow exist today; the smart-contract trust core, anonymous auth, matching, and a real manual-confirm fiat path are the build. We lead with the trustless crypto swap because a bank transfer inherently links parties at the bank — so cash is an opt-in mode, not a privacy guarantee.

The raise funds smart-contract development + **third-party audit**, the matching/privacy layers, testnet→mainnet, and jurisdiction work — sequenced to ship the trustless swap first, then fiat.

**"Vexl meets Uniswap, with a spatial interface."**
