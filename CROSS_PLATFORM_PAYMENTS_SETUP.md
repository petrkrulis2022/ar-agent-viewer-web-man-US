# Cross-Platform Payments Integration Guide

**Branch:** `cross-platform-payments`  
**Date:** October 24, 2025  
**Status:** ✅ Ready for Testing

## 🎯 Overview

Complete integration of crypto onboarding and fiat-to-crypto onramp for AR Agent payments. Users without crypto wallets can now:

1. Create a Base wallet
2. Buy USDC with a credit card (via Coinbase)
3. Pay crypto-only agents

## 📦 Components Created

### Frontend Components

1. **`CryptoOnboardingModal.jsx`** - Main onboarding flow orchestrator

   - Replaces Revolut confirmation screen
   - Presents "Buy Crypto" vs "Connect Wallet" options
   - Manages overall payment flow state

2. **`BaseWalletCreationFlow.jsx`** - Wallet creation UI

   - Base-branded wallet creation experience
   - Simulates wallet generation (user already has wallet)
   - Progress tracking and success confirmation

3. **`OnrampPurchaseFlow.jsx`** - Coinbase onramp integration
   - Integrates with Coinbase Pay sandbox
   - Handles USDC purchase flow
   - Test card support for sandbox testing

### Backend Services

4. **`src/server/onrampAPI.js`** - Express API server

   - Generates Coinbase session tokens
   - Handles CDP authentication
   - Secure JWT signing for API calls

5. **`src/services/onrampService.js`** - Frontend service layer
   - API client for backend calls
   - URL building and popup management
   - Transaction confirmation handling

### Configuration Files

6. **`.env.onramp`** - Backend environment variables
7. **`src/server/package.json`** - Backend dependencies

## 🚀 Installation & Setup

### Step 1: Install Backend Dependencies

```bash
cd src/server
npm install
```

### Step 2: Get Coinbase CDP Credentials

1. Visit [Coinbase Developer Platform](https://portal.cdp.coinbase.com/)
2. Create a new project (or select existing)
3. Navigate to **API Keys** section
4. Click **"Create API Key"**
5. Select **Onramp/Offramp** permissions
6. Download the API key JSON file

### Step 3: Configure Environment Variables

Copy `.env.onramp` and fill in your credentials:

```bash
cp .env.onramp .env
```

Edit `.env`:

```env
# Your CDP API Key Name (from downloaded JSON)
CDP_API_KEY_NAME=organizations/abc-123/apiKeys/xyz-789

# Your CDP Private Key (from downloaded JSON - PEM format)
CDP_API_PRIVATE_KEY=-----BEGIN EC PRIVATE KEY-----
MHcCAQEEIBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
...
-----END EC PRIVATE KEY-----

# Server configuration
PORT=3001
NODE_ENV=development
```

**Important:** Keep your private key secure! Never commit `.env` to git.

### Step 4: Start Backend Server

```bash
cd src/server
npm run dev
```

You should see:

```
🚀 Onramp API server running on port 3001
📍 Health check: http://localhost:3001/health
📍 Session token: POST http://localhost:3001/api/onramp/session-token
✅ CDP credentials configured
```

### Step 5: Configure Frontend Environment

Add to your main `.env` file:

```env
VITE_ONRAMP_API_URL=http://localhost:3001
```

### Step 6: Start Frontend Development Server

```bash
# From project root
npm run dev
```

## 🧪 Testing the Integration

### Test Flow Walkthrough

1. **Select an Agent**

   - Choose any agent deployed on Base Sepolia
   - Agent must have a fixed interaction fee (e.g., 3 USDC)

2. **Initiate Chat/Interaction**

   - Start chatting with the agent
   - Agent requests payment for interaction

3. **Open Payment Modal**

   - Click "Pay Agent" button
   - Payment cube appears

4. **Select Virtual Card**

   - Choose "Virtual Card" payment method
   - Select existing card or create new one

5. **Crypto Onboarding Modal Appears** ✨

   - Instead of Revolut screen, see onboarding options
   - Choose **"Buy Crypto with Card"**

6. **Wallet Creation Flow**

   - See Base-branded wallet creation
   - Watch progress: "Generating secure keys..."
   - Wallet created successfully

7. **Onramp Purchase Flow**

   - Review purchase details (3 USDC on Base Sepolia)
   - See test card instructions
   - Click **"Open Coinbase Pay"**

8. **Coinbase Pay Sandbox**

   - Popup window opens to Coinbase Pay
   - Use test card: `4242 4242 4242 4242`
   - Expiry: `12/31`, CVC: `123`
   - Verification code: `000000`
   - Complete purchase

9. **Confirmation & Transfer**
   - "USDC Received!" confirmation
   - Automatic transfer to agent
   - Payment complete! 🎉

### Test Card Details

**Sandbox Environment Only:**

```
Card Number:    4242 4242 4242 4242
Expiry Date:    12/31 (any future date)
CVC:            123 (any 3 digits)
Billing:        Any US address
Phone:          Any 10-digit number
Email:          Any valid email
Verification:   000000 (any 6 digits)
```

### Health Check

```bash
# Check backend API status
curl http://localhost:3001/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2025-10-24T...",
  "hasCredentials": true
}
```

## 🔄 Payment Flow Diagram

```
┌─────────────────────────────────────────────┐
│  User clicks "Pay Agent"                    │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  Payment Cube Opens                         │
│  └─ Virtual Card                           │
│  └─ Voice Pay                              │
│  └─ Sound Pay                              │
│  └─ BTC Payments                           │
└──────────────┬──────────────────────────────┘
               │
               ▼ (User selects Virtual Card)
┌─────────────────────────────────────────────┐
│  CryptoOnboardingModal                      │
│  ┌─────────────────────────────────────┐  │
│  │ 💎 This Agent Only Accepts Crypto   │  │
│  │                                     │  │
│  │ [💳 Buy Crypto with Card]          │  │
│  │ [👛 Connect Existing Wallet]       │  │
│  └─────────────────────────────────────┘  │
└──────────────┬──────────────────────────────┘
               │
               ▼ (User clicks Buy Crypto)
┌─────────────────────────────────────────────┐
│  BaseWalletCreationFlow                     │
│  ┌─────────────────────────────────────┐  │
│  │ Create Your Base Wallet             │  │
│  │ [Progress: 60%] Generating keys...  │  │
│  └─────────────────────────────────────┘  │
└──────────────┬──────────────────────────────┘
               │
               ▼ (Wallet created)
┌─────────────────────────────────────────────┐
│  OnrampPurchaseFlow                         │
│  ┌─────────────────────────────────────┐  │
│  │ Buy 3 USDC with Card                │  │
│  │ Test Card: 4242 4242 4242 4242      │  │
│  │ [Open Coinbase Pay] ──┐             │  │
│  └─────────────────────────│─────────────┘  │
└────────────────────────────┼─────────────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │  Coinbase Pay Popup  │
                  │  (Sandbox)           │
                  │  - Enter card info   │
                  │  - Complete purchase │
                  └──────────┬───────────┘
                             │
                             ▼ (Purchase complete)
┌─────────────────────────────────────────────┐
│  Transaction Confirmation                   │
│  ┌─────────────────────────────────────┐  │
│  │ ✅ USDC Received!                   │  │
│  │ Sending 3 USDC to agent...          │  │
│  └─────────────────────────────────────┘  │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  Payment Complete! 🎉                       │
│  Agent interaction unlocked                 │
└─────────────────────────────────────────────┘
```

## 📝 Integration with Existing Code

### Where to Integrate

Find the Revolut confirmation screen in your payment flow (likely in `CubePaymentEngine.jsx` or similar) and replace with:

```jsx
import CryptoOnboardingModal from './components/CryptoOnboardingModal';

// In your payment handler
const [showCryptoOnboarding, setShowCryptoOnboarding] = useState(false);

// When user selects Virtual Card payment
const handleVirtualCardPayment = (cardData, agentData) => {
  // Check if agent only accepts crypto
  if (agentData.acceptsCryptoOnly) {
    setShowCryptoOnboarding(true);
  } else {
    // Show existing Revolut flow
    handleRevolutPayment(cardData, agentData);
  }
};

// Render
return (
  <>
    {/* Existing payment cube */}
    <CubePaymentEngine ... />

    {/* New crypto onboarding */}
    <CryptoOnboardingModal
      isOpen={showCryptoOnboarding}
      onClose={() => setShowCryptoOnboarding(false)}
      agentFee={agentData.interactionFee}
      agentToken="USDC"
      agentName={agentData.name}
      agentAddress={agentData.walletAddress}
      onPaymentComplete={(result) => {
        console.log('Payment complete:', result);
        setShowCryptoOnboarding(false);
        // Handle successful payment
      }}
    />
  </>
);
```

## 🔐 Security Considerations

### Production Checklist

- [ ] **Never expose CDP private keys** in frontend code
- [ ] Use environment variables for all sensitive data
- [ ] **Validate all inputs** in backend API
- [ ] Implement **rate limiting** on session token endpoint
- [ ] Add **CORS whitelist** for production domains
- [ ] Use **HTTPS** for all API communication
- [ ] **Verify client IP** in session token requests
- [ ] Implement **webhook verification** for transaction confirmations
- [ ] Add **transaction monitoring** and fraud detection
- [ ] **Log all API calls** for audit trail

### Backend Security

The backend API implements:

- ✅ JWT authentication for Coinbase API
- ✅ Client IP validation
- ✅ Secure key storage in environment
- ✅ CORS protection
- ✅ Input validation

## 🚨 Troubleshooting

### Backend server won't start

**Error:** "CDP credentials not configured"

**Solution:**

1. Check `.env` file exists in `src/server/`
2. Verify `CDP_API_KEY_NAME` is set correctly
3. Ensure `CDP_API_PRIVATE_KEY` includes BEGIN/END markers
4. Check for newline characters in private key

### Session token generation fails

**Error:** "Failed to generate session token"

**Solution:**

1. Verify CDP API key has Onramp permissions
2. Check API key is not expired
3. Ensure backend server is running on port 3001
4. Check network connectivity to Coinbase API

### Popup blocked

**Error:** "Popup blocked. Please allow popups..."

**Solution:**

1. Enable popups for localhost in browser settings
2. User must click button to trigger popup (not automatic)
3. Check browser console for security errors

### Mock session token in production

**Warning:** "Development mode: Returning mock session token"

**Solution:**

1. Set `NODE_ENV=production` in `.env`
2. Ensure CDP credentials are configured
3. Restart backend server

## 📊 Monitoring & Analytics

### Logging

All components log to console:

- 🚀 Initialization events
- 📍 Address and amount details
- ✅ Success confirmations
- ❌ Error conditions

### Recommended Analytics Events

Track these for insights:

- `crypto_onboarding_modal_opened`
- `wallet_creation_started`
- `wallet_creation_completed`
- `onramp_purchase_started`
- `onramp_purchase_completed`
- `agent_payment_sent`
- `full_flow_completed`

## 🎨 Customization

### Styling

All components use Tailwind CSS with:

- Base blue theme (`blue-500`, `blue-600`)
- Gradient backgrounds
- Smooth transitions and animations
- Responsive design

### Base Branding

The wallet creation flow includes official Base logo (SVG path). Update colors in `BaseWalletCreationFlow.jsx` to match your brand.

### Payment Amounts

Configure default amounts and limits:

```jsx
const MIN_AMOUNT = 5; // Coinbase minimum
const MAX_AMOUNT = 500; // Guest checkout weekly limit
```

## 🔄 Next Steps

### Phase 1 (Current) ✅

- [x] Crypto onboarding modal
- [x] Base wallet creation flow
- [x] Onramp purchase integration
- [x] Backend session token API
- [x] Sandbox testing

### Phase 2 (Recommended)

- [ ] Real wallet integration with Base Account SDK
- [ ] Webhook verification for transaction confirmations
- [ ] Transaction history tracking
- [ ] Multi-token support (ETH, other tokens)
- [ ] Production CDP credentials

### Phase 3 (Advanced)

- [ ] Gas sponsorship for first transaction
- [ ] Batch payment support
- [ ] Subscription payments
- [ ] Cross-chain bridge integration

## 📚 Resources

- [Coinbase Onramp Docs](https://docs.cdp.coinbase.com/onramp-&-offramp/)
- [Base Account SDK](https://docs.base.org/base-account/)
- [Sandbox Testing Guide](https://docs.cdp.coinbase.com/onramp-&-offramp/integration/sandbox-testing)
- [CDP Portal](https://portal.cdp.coinbase.com/)

## 🎉 Success Criteria

You'll know the integration is working when:

1. ✅ Backend API health check returns `200 OK`
2. ✅ Crypto onboarding modal appears after Virtual Card selection
3. ✅ Wallet creation completes with address display
4. ✅ Coinbase Pay opens in popup window
5. ✅ Test card purchase succeeds
6. ✅ USDC confirmation appears
7. ✅ Payment flows to agent wallet
8. ✅ Agent interaction unlocks

## 🐛 Known Issues

- **Popup blockers:** Some browsers aggressively block popups - user must click to trigger
- **Sandbox limitations:** Only USD fiat currency in sandbox
- **Session token expiry:** Tokens expire after 2 minutes - regenerate if needed
- **Testnet delays:** Base Sepolia transactions may take 1-2 minutes to confirm

## 📞 Support

If you encounter issues:

1. Check browser console for errors
2. Verify backend API is running (`curl http://localhost:3001/health`)
3. Test with mock credentials first
4. Review Coinbase API error responses
5. Check Base Sepolia network status

---

**Built with ❤️ for AgentSphere AR Viewer**  
**Powered by Coinbase, Base, and Web3**
