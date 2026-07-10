# RUNDOWN — DEMO Build Prompt (for a coding assistant)

> Copy everything inside the fence below and give it to the coding agent in the **new, empty repo**.
> Companion reference: `rundown-tech-build-spec.md` (full architecture), `rundown.md` (product),
> `rundown-visual-mock.html` (exact AR look).

---

```
# ROLE
You are building the DEMO for RUNDOWN — a real-world augmented-reality pursuit show. Build it in THIS
new, empty repo. Work incrementally, milestone by milestone, and stop for review at each milestone.

# WHAT RUNDOWN IS (context)
An autonomous AI runner (a "Rungent") travels on foot from a start point to an end point along real
streets. Real people ("Hunters") use their phones to find it in AR and CATCH (touch) or SHOOT it for an
on-chain crypto prize. The Rungent is only visible through the phone camera, in AR. This DEMO is a
throwaway "magic slice" that proves the core loop and must be SCREEN-RECORDABLE / STREAMABLE — it will
be used for a livestream and for live investor demos.

# THE MONEY SHOT (the demo's whole purpose — optimize for this)
"I walk down my street with my phone. The glowing runner is there. It turns, looks at me, and speaks to
me. I aim, I fire. It goes down. Testnet USDC lands in my wallet. All on camera."

# HARD CONSTRAINTS (non-negotiable)
- TESTNET ONLY. Sepolia + testnet USDC. Never wire real funds. Never commit private keys/secrets.
- SERVER-AUTHORITATIVE: the server owns the Rungent's true position and decides every catch/shot.
  Clients may only REQUEST a takedown; they never assert one.
- The Rungent's movement is HUMAN-BOUNDED: walk 6 km/h, run 10 km/h (it may go slower by choice).
  No teleporting, no flying, no leaving the route bounds. Altitude is clamped to ground level.
- The leg's rules are COMMITTED ON-CHAIN and IMMUTABLE after commit (even the admin cannot change
  them): name, story, start point, end point, skills config, prize wallet, rules hash.
- Ask me before doing anything that costs money at scale (Google Maps quota, TTS/STT volume, buying 3D
  assets, any paid service tier).

# STACK (use exactly this)
- Frontend: React 19 + Vite, built as an installable PWA. Mobile-first (phone), also works on tablet.
- AR/3D: React Three Fiber (r3f) + Three.js + @react-three/drei (useGLTF, useAnimations, Billboard).
  Camera background via getUserMedia. Anchoring via the Geolocation API + DeviceOrientation API.
  DO NOT use WebXR (it does not work on iOS Safari and we must support iPhones).
- Backend/DB: a NEW standalone Supabase project — Postgres (+ PostGIS), Realtime, Auth, Storage,
  Edge Functions.
- AI brain + dialogue: Anthropic API, model `claude-sonnet-5`, using tool use. (Anthropic is
  text+vision only — it has NO audio; see Voice.)
- Voice: Google Cloud Speech-to-Text + Text-to-Speech, bridged through Claude, over a WebRTC channel.
- Maps/Geo: Google Maps Platform — Directions API (walking routes), Roads API (snap-to-road),
  Elevation API (clamp altitude to ground).
- Chain: Sepolia. ethers v5. MetaMask login. Contracts in Solidity + Hardhat.
- Lang: TypeScript everywhere.

# ARCHITECTURE
- `apps/web` — the PWA: Hunter view (AR + map) and a simple Admin view.
- `services/rungent-ai` — the Rungent brain: a strategy loop (Claude, tool use) + a deterministic
  movement simulator. Writes the server-authoritative true position.
- `services/api` — Supabase Edge Functions (or a small Node service): catch/shoot adjudication,
  voice bridge, escrow settlement trigger.
- `contracts` — Hardhat: LegCommit.sol, PrizeEscrow.sol + deploy scripts.
- `packages/shared` — shared TS types.

# DATA MODEL (Supabase; minimal for the demo)
legs(id, name, story, start_lat, start_lng, start_alt, end_lat, end_lng, end_alt, skills jsonb,
     rules_hash, prize_escrow_addr, operating_wallet_addr, prize_amount, onchain_commit_tx, status)
rungent_state(leg_id, true_lat, true_lng, true_alt, mode, speed_kmh, heading_deg, status, updated_at)
hunters(leg_id, wallet_addr, display_name, avatar_glb, last_lat, last_lng, last_alt, last_seen_at)
items(leg_id, kind, lat, lng, alt, status, owner_wallet)     -- demo needs only kind='gun'
catches(leg_id, hunter_wallet, method, claimed_lat, claimed_lng, ts, verify_status, settled_tx)
events(leg_id, type, payload jsonb, ts)

RLS: clients must NEVER be able to read `rungent_state.true_*` directly. Expose the Rungent's position
to a hunter ONLY via a server-side check that they are within engagement range.

# CONTRACTS (Sepolia, Hardhat)
LegCommit.sol
  - commit(legId, rulesHash, operatingWallet, prizeEscrow, startAt, deadline) onlyAdmin
  - fields immutable once committed; emits LegCommitted
PrizeEscrow.sol   (ERC-20/USDC; oracle = our server for the demo)
  - fund(amount)
  - settleCatch(address catcher) onlyOracle   -> transfers prize to the catcher
  - settleArrival(address rungentPayout) onlyOracle
  - funds can ONLY ever go to a catcher or the Rungent payout address — never back to the admin.
Write unit tests (Hardhat + Chai) for: commit immutability, fund, settleCatch, settleArrival,
onlyOracle/onlyAdmin guards, double-settle prevention.

# THE RUNGENT AI (two layers — keep them separate)
1) STRATEGY (Claude `claude-sonnet-5`, tool use). Every ~30–60s of the run, given: true position,
   distance+bearing to the end point, nearby hunter avatars, energy, and the leg's committed
   personality/skills — return an INTENT (direction, walk vs run, whether to speak).
   Tools: get_route(from,to), list_nearby_hunters(radius), set_intent({heading, mode}), say(text).
   Cache the static system prompt (personality + rules) to cut cost per tick.
2) MOVEMENT (deterministic TypeScript — this enforces fairness, not the LLM):
   intent -> real walking route (Directions API, snapped via Roads API) -> advance position at the
   capped speed -> clamp altitude via Elevation API -> write `rungent_state`. Enforce no-teleport,
   speed caps, and route bounds here. The LLM can never move the Rungent directly.

# AR CLIENT — the important details
Geo→scene anchoring (do this carefully; it is the crux):
  - Compute the Rungent's offset from the hunter using an equirectangular approximation:
      east  = (lngR - lngH) * cos(latH) * 111320
      north = (latR - latH) * 110540
    Place the model in the Three.js scene at x = east, z = -north, y = (altR - altH) - eyeHeight.
  - Rotate the whole scene by the device's compass heading (DeviceOrientation `webkitCompassHeading` on
    iOS, `alpha` on Android) so world-north lines up. Smooth heading with a low-pass filter — raw
    compass is noisy.
  - iOS requires a user gesture to request DeviceOrientation + camera permission. Handle that.
  - GPS is ~5–15 m accurate. Do NOT fight it: use generous radii (below) and smooth positions.

Rungent rendering:
  - A RIGGED GLB humanoid with `walk` and `run` animation clips (source a free rigged+animated model,
    e.g. Mixamo, or ask me to buy one). Play the clip that matches `mode`; rotate the model to
    `heading_deg`.
  - Style it as a glowing hologram: bright green emissive (#00FF6A), fresnel/rim light in cyan
    (#00E5FF), outer bloom, motion-trail streaks, subtle scanline shimmer, soft contact shadow.
    Match `rundown-visual-mock.html` exactly — open it as the visual reference.
  - Render order: camera feed (back) -> Rungent + avatars + items (middle) -> HUD (front). Never hide
    the Rungent behind the HUD.

Hunter avatar:
  - A GLB avatar anchored to the hunter's live GPS, visible in AR to other hunters AND "seen" by the
    Rungent. Push the hunter's position to Supabase continuously.

Engagement + interaction:
  - ENGAGEMENT RANGE ~75 m: the Rungent becomes visible in the hunter's AR camera.
  - When a hunter enters range: notify the Rungent AI -> it TURNS TO LOOK at that hunter's avatar and
    may `say()` a line in character. This "it noticed me" beat is essential to the demo.
  - The Rungent is TAPPABLE (raycast on the model) -> opens an interaction panel (inspect / talk).
  - VOICE (two-way, only for an in-range hunter): mic -> Google STT -> Claude (in character, with the
    leg's story/personality) -> Google TTS -> played back over WebRTC. Target < 2s round trip.

Takedown:
  - SHOOT: requires possessing the `gun` item (place one on the map that the hunter walks to and picks
    up). Aim reticle; must hold lock on the Rungent within ~60–75 m for ~1s; then FIRE. Infinite ammo,
    no reload in the demo. The reticle may ONLY lock onto the Rungent — never onto a real person.
  - CATCH: hunter's GPS within ~20–25 m of the true position AND holds an AR tag on it for ~3s.
  - Both are REQUESTS to the server. The server validates distance/bearing/lock against its own truth,
    then calls PrizeEscrow.settleCatch(hunterWallet). Show the tx hash in the UI.

HUD (match the visual mock): reticle, distance readout, HOLD-TO-CATCH ring, FIRE button, prize pool,
"TARGET LOCKED — RUNGENT", and a "RUNGENT DOWN" result state with a green particle burst.

# INSTANT LOCAL RUNGENT (must-have)
An admin action that drops a Rungent at ANY given lat/lng immediately, with no full leg setup — used to
let an investor share their location and hunt one within minutes. Make this a first-class code path.

# BUILD ORDER (stop for review after each milestone)
M0. Repo scaffold: pnpm workspace, Vite+React+TS PWA, Supabase project + schema + RLS, Hardhat.
    Acceptance: `pnpm dev` runs; schema applied; empty contracts compile + tests pass.
M1. Contracts: LegCommit + PrizeEscrow, deployed to Sepolia, with tests.
    Acceptance: admin can commit a leg and fund the escrow; settleCatch pays a test address.
M2. AR foundation: camera feed + a static GLB anchored at a hard-coded lat/lng, correct compass
    alignment, holographic shader.
    Acceptance: on a phone (HTTPS via ngrok), I walk toward a fixed point and the glowing figure stays
    put in the world and grows as I approach.
M3. Movement: Directions route + speed-capped simulator + elevation clamp + Supabase realtime.
    Acceptance: the Rungent walks my street start->end at 6 km/h, animated, and I can follow it in AR.
M4. Hunter identity: MetaMask login, located hunter avatar, engagement-range reveal, the "turn and
    look at me" beat.
    Acceptance: it notices me and faces me when I get within 75 m.
M5. Voice + tap: two-way voice with the in-range Rungent; tappable interaction panel.
    Acceptance: I speak, it answers in character, in under ~2s.
M6. Takedown + payout: gun item pickup, aim/lock/FIRE and touch-to-catch, server adjudication,
    PrizeEscrow.settleCatch, "RUNGENT DOWN" + tx hash in the UI.
    Acceptance: THE MONEY SHOT, recorded end to end on one phone.
M7. Instant-local-Rungent admin mode + a clean README for running the demo on a phone.

# OUT OF SCOPE (do NOT build these — they are v1, not the demo)
Betting / prediction markets. Delayed breadcrumbs + map radar. Streaming, the curated director channel,
the Rungent map-cam. Multi-hunter legs. The full items economy (only the gun). Camera-verified catches.
The daily AI recap video. The week-long journey. Geofencing. Teams, ammo/reload, gear store.
Leave clean interfaces/stubs where these will slot in later.

# STYLE + WORKING AGREEMENT
- Brand: dark neon-cyberpunk. green #00FF6A, cyan #00E5FF, magenta #FF2E9A, amber #FFB020,
  near-black #07090C. The show/logo is "RUNDOWN"; the runner character is a "Rungent".
- TypeScript strict. Small, reviewable commits. Tests for the contracts and the movement simulator
  (the two places where a bug costs money or breaks fairness).
- Secrets in .env (never committed). Provide .env.example.
- Mobile testing needs HTTPS: document the ngrok flow in the README.
- Tell me immediately if a constraint above turns out to be technically impossible, rather than
  silently working around it.

Start with M0. Show me the plan before you write code.
```

---

## Notes for you (not part of the prompt)

- **Assets to line up:** a rigged GLB humanoid with `walk`/`run` clips (Mixamo is free and works), a
  hunter avatar GLB, and a simple gun/pickup model.
- **The two riskiest bits** are (1) **compass/heading stability** — raw device compass is noisy and will
  make the Rungent "swim"; budget time for filtering — and (2) **voice latency**. Everything else is
  well-trodden.
- **iOS caveats:** no WebXR (hence the `getUserMedia` approach), and DeviceOrientation + camera both
  need an explicit user gesture to request permission.
- **GPS reality:** ~5–15 m accuracy on a phone. The generous 20–25 m catch radius and 75 m engagement
  range are deliberate — don't tighten them for the demo.
