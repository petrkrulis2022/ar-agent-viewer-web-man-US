# 🚀 Crypto Onboarding AR Viewer Integration

**Branch:** `cross-platform-payments`  
**Date:** October 24, 2025  
**Status:** ✅ INTEGRATED - Ready for Testing

---

## 📋 Overview

Successfully integrated the crypto onboarding flow into the AR viewer, replacing the Revolut Virtual Card flow **only in the cross-platform-payments branch**.

### What Changed

When a user selects "Pay with Virtual Card" in the 3D cube payment engine, they now get:

- ✅ **Crypto Onboarding Modal** (instead of Revolut Virtual Card Manager)
- ✅ 4-step flow: Onboarding → Wallet Creation → Onramp Purchase → Payment Sending
- ✅ Real Coinbase CDP integration with session tokens
- ✅ Base wallet creation simulation
- ✅ USDC purchase through Coinbase Pay

---

## 🔧 Integration Points

### 1. **CubePaymentEngine.jsx**

- **Import Added:** `CryptoOnboardingModal` component
- **Replacement:** `VirtualCardManager` → `CryptoOnboardingModal`
- **State:** Uses existing `showVirtualCardModal` state
- **Payment Flow:** User clicks "Virtual Card" face → Crypto onboarding modal opens

### 2. **Component Props**

```javascript
<CryptoOnboardingModal
  isOpen={showVirtualCardModal}
  onClose={handleVirtualCardClose}
  agentName={agent?.name || "AgentSphere Agent"}
  agentFee={
    paymentAmount ||
    agent?.interaction_fee_amount ||
    agent?.interaction_fee ||
    10.0
  }
  agentToken="USDC"
  onPaymentComplete={(result) => {
    console.log("✅ Crypto onboarding payment completed:", result);
    handleVirtualCardSuccess(result);
  }}
/>
```

### 3. **Payment Amount**

Dynamic fee calculation using priority:

1. `paymentAmount` (from e-shop/on-ramp)
2. `agent.interaction_fee_amount` (authoritative field)
3. `agent.interaction_fee` (legacy field)
4. Fallback: `10.0 USDC`

---

## 🎯 User Flow

### Complete AR Payment Journey

1. **User opens AR viewer** → Sees nearby agents
2. **User taps agent** → Agent Interaction Modal opens
3. **User clicks "Pay"** → 3D Cube Payment Engine launches
4. **User rotates cube to "Virtual Card"** → Crypto Onboarding Modal opens

### Crypto Onboarding Steps

**Step 1: Welcome Screen**

- Title: "Get Started with Crypto Payments"
- Description: Explains wallet creation and onramp
- Button: "Buy with Card" → Proceeds to wallet creation

**Step 2: Base Wallet Creation**

- Simulated wallet creation with Base branding
- Progress animation 0-100%
- Generates mock wallet address
- Auto-proceeds to onramp after completion

**Step 3: Coinbase Onramp**

- Opens Coinbase Pay in popup window
- Real session token from CDP API
- Test card: `4242 4242 4242 4242`
- User completes USDC purchase
- Popup closes automatically on completion

**Step 4: Sending Payment**

- Shows "Sending Payment to Agent..." animation
- 2-second countdown with progress bar
- Calls `onPaymentComplete()` → Returns to AR viewer

---

## 🏗️ Backend Integration

### Onramp API Server

- **Port:** 3001
- **File:** `src/server/onrampAPI.js`
- **Endpoint:** `POST /api/onramp/session-token`
- **Health Check:** `GET /health`

### CDP Credentials (.env.onramp)

```env
CDP_PROJECT_ID=11147d99-d330-4ab1-b342-32d5a90131e7
CDP_API_KEY=organizations/.../apiKeys/71883d66-a78e-4529-b89b-62ee54deddb5
CDP_API_SECRET=rUcslyfRp0JJTCfIL3/QRTtpqZEM9+wAfLGVxB4WpuJY+...
```

---

## 🧪 Testing the Integration

### Start Servers

```bash
# Terminal 1: Backend API (Port 3001)
cd "/home/petrunix/agentsphere-full-web-man-US-qr tap/ar-agent-viewer-web-man-US/src/server"
export $(cat ../../.env.onramp | grep -v '^#' | xargs)
node onrampAPI.js

# Terminal 2: Frontend (Port 5177 or 5178)
cd "/home/petrunix/agentsphere-full-web-man-US-qr tap/ar-agent-viewer-web-man-US"
npm run dev
```

### Test Flow

1. **Open AR Viewer:** `http://localhost:5177` (or 5178)
2. **Interact with Agent:** Click any agent marker
3. **Trigger Payment:** Click "Pay" button in modal
4. **Open Payment Engine:** 3D cube appears
5. **Select Virtual Card:** Rotate cube to purple "Virtual Card" face
6. **Complete Onboarding:**
   - Click "Buy with Card"
   - Wait for wallet creation
   - Complete Coinbase Pay purchase
   - Return to AR viewer

### Expected Behavior

✅ Crypto onboarding modal opens (not Revolut card manager)  
✅ Base wallet creation completes with animation  
✅ Coinbase Pay popup opens with real session token  
✅ Payment completes and modal closes  
✅ Returns to AR viewer after 2-second "sending" animation

---

## 🔍 Verification Checklist

- [x] CryptoOnboardingModal imported in CubePaymentEngine.jsx
- [x] VirtualCardManager replaced with CryptoOnboardingModal
- [x] Props correctly mapped (isOpen, onClose, agentName, agentFee, etc.)
- [x] Backend server running on port 3001
- [x] CDP credentials configured in .env.onramp
- [x] Session token generation working
- [ ] Test complete flow in AR viewer
- [ ] Verify payment completion callback
- [ ] Check return to AR viewer after payment

---

## 📁 Modified Files

### Changed

- ✏️ `src/components/CubePaymentEngine.jsx`
  - Added CryptoOnboardingModal import
  - Replaced VirtualCardManager rendering with CryptoOnboardingModal

### Existing (No Changes)

- ✅ `src/components/CryptoOnboardingModal.jsx`
- ✅ `src/components/BaseWalletCreationFlow.jsx`
- ✅ `src/components/OnrampPurchaseFlow.jsx`
- ✅ `src/services/onrampService.js`
- ✅ `src/server/onrampAPI.js`
- ✅ `.env.onramp`

---

## 🌿 Branch Strategy

### Two Separate Demo Branches

**1. revolut-qr-payments-sim**

- Revolut Bank QR payments
- Revolut Virtual Card payments
- Traditional fiat payment flow
- Demo video: "Fiat Payments with Revolut"

**2. cross-platform-payments** ⭐ (Current)

- Crypto onboarding for users without wallets
- Coinbase CDP integration
- Base wallet creation
- USDC onramp
- Demo video: "Crypto Onboarding Flow"

### Git Workflow

```bash
# Current branch
git branch
# * cross-platform-payments

# Both branches independent
# No merging needed - separate demos
```

---

## 🚨 Important Notes

### Branch-Specific Feature

⚠️ **This integration ONLY exists in `cross-platform-payments` branch**  
⚠️ The `revolut-qr-payments-sim` branch still has Revolut Virtual Card flow  
⚠️ Do NOT merge these branches - they're for separate demos

### Production Considerations

- Backend runs in development mode
- Using sandbox Coinbase Pay environment
- Test card only: `4242 4242 4242 4242`
- Wallet creation is simulated (not real Base Account SDK)
- No actual blockchain transaction monitoring
- No webhook verification for payment completion

---

## 🎬 Next Steps

1. **Test Complete Flow**

   - Run both servers
   - Test in AR viewer
   - Verify payment completion
   - Check console logs

2. **Create Demo Video**

   - Show AR agent interaction
   - Demonstrate crypto onboarding
   - Highlight seamless UX
   - Compare with Revolut branch

3. **Optional Enhancements**
   - Real Base Account SDK integration
   - Blockchain transaction verification
   - Webhook payment confirmation
   - Error handling for failed onramp

---

## 📞 Support

### Logs to Check

```bash
# Backend logs
cd src/server && node onrampAPI.js

# Frontend console (browser DevTools)
# Look for:
# ✅ Crypto onboarding payment completed
# 🎯 Payment requested for agent - launching 3D cube
# 💳 Initiating payment with selected card
```

### Common Issues

**Modal doesn't open?**

- Check if backend is running on port 3001
- Verify `curl http://localhost:3001/health`
- Check browser console for errors

**Black screen?**

- Clear ports: `lsof -ti:3001,5177,5178 | xargs kill -9`
- Restart both servers

**Session token fails?**

- Verify CDP credentials in .env.onramp
- Check backend console for JWT errors
- Ensure API Key ID is correct

---

## ✅ Integration Complete

The crypto onboarding flow is now fully integrated into the AR viewer payment system, replacing the Revolut Virtual Card flow in the `cross-platform-payments` branch. Ready for testing and demo video creation!

**Last Updated:** October 24, 2025  
**Integration Status:** ✅ COMPLETE  
**Testing Status:** 🔄 PENDING USER VERIFICATION
