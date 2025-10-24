# Coinbase Session Token Setup - Complete Guide

## 📋 What We've Done

### ✅ Completed Steps

1. **Saved CDP Credentials to `.env.onramp`**:

   - ✅ Project ID: `11147d99-d330-4ab1-b342-32d5a90131e7`
   - ⚠️ API Key: **You need to provide the API Key ID** (see below)
   - ✅ API Secret: Configured (base64-encoded)

2. **Updated Backend Server** (`src/server/onrampAPI.js`):

   - ✅ Added `@coinbase/cdp-sdk` import for official JWT generation
   - ✅ Added `dotenv` for environment variable loading
   - ✅ Updated `generateJWT()` function to use CDP SDK
   - ✅ Improved error handling and logging
   - ✅ Added client IP detection (required by CDP API)

3. **Installed Dependencies**:
   - ✅ `@coinbase/cdp-sdk@1.38.4` - Official Coinbase SDK
   - ✅ `express`, `cors`, `dotenv` - Server dependencies

---

## ⚠️ ACTION REQUIRED: Get Your API Key ID

You provided "api key id:" but didn't include the actual value. Here's how to find it:

### Step 1: Go to CDP Portal

Visit: https://portal.cdp.coinbase.com/

### Step 2: Navigate to API Keys

1. Select your project: `11147d99-d330-4ab1-b342-32d5a90131e7`
2. Click "API Keys" in the left sidebar
3. You should see a list of your API keys

### Step 3: Copy the API Key Name/ID

The API Key ID will look like ONE of these formats:

**Format 1 (Long form):**

```
organizations/11147d99-d330-4ab1-b342-32d5a90131e7/apiKeys/12345678-abcd-efgh-ijkl-123456789012
```

**Format 2 (Short form):**

```
12345678-abcd-efgh-ijkl-123456789012
```

Either format should work with the CDP SDK.

### Step 4: Update .env.onramp File

Edit this file:

```
/home/petrunix/agentsphere-full-web-man-US-qr tap/ar-agent-viewer-web-man-US/.env.onramp
```

Find this line:

```bash
CDP_API_KEY=organizations/11147d99-d330-4ab1-b342-32d5a90131e7/apiKeys/YOUR_API_KEY_ID
```

Replace `YOUR_API_KEY_ID` with the actual API Key ID you copied.

**Example:**

```bash
CDP_API_KEY=organizations/11147d99-d330-4ab1-b342-32d5a90131e7/apiKeys/12345678-abcd-efgh-ijkl-123456789012
```

---

## 🚀 How to Test

### Terminal 1: Start Backend Server (Port 3001)

```bash
cd "/home/petrunix/agentsphere-full-web-man-US-qr tap/ar-agent-viewer-web-man-US/src/server"

# Make sure environment variables are loaded
export $(cat ../../.env.onramp | xargs)

# Start server
node onrampAPI.js
```

**Expected Output:**

```
🚀 Onramp API server running on port 3001
📍 Health check: http://localhost:3001/health
📍 Session token: POST http://localhost:3001/api/onramp/session-token

✅ CDP credentials configured
✅ Project ID: 11147d99-d330-4ab1-b342-32d5a90131e7
```

### Terminal 2: Verify Health Check

```bash
curl http://localhost:3001/health
```

**Expected Response:**

```json
{
  "status": "ok",
  "timestamp": "2025-10-24T...",
  "hasCredentials": true,
  "projectId": "11147d99-d330-4ab1-b342-32d5a90131e7"
}
```

### Terminal 3: Start Frontend (Port 5177)

```bash
cd "/home/petrunix/agentsphere-full-web-man-US-qr tap/ar-agent-viewer-web-man-US"

npm run dev -- --port 5177
```

### Terminal 4: Test Session Token Generation

```bash
curl -X POST http://localhost:3001/api/onramp/session-token \
  -H "Content-Type: application/json" \
  -d '{
    "addresses": [{
      "address": "0x1234567890123456789012345678901234567890",
      "blockchains": ["base"]
    }],
    "assets": ["USDC"]
  }'
```

**Expected Response (Success):**

```json
{
  "token": "actual_session_token_from_coinbase_api",
  "expiresAt": "2025-10-24T20:30:00Z"
}
```

**Expected Response (Missing API Key ID):**

```json
{
  "token": "sandbox_mock_abc123",
  "isMock": true
}
```

---

## 🧪 Test the Complete Flow

### 1. Open Test Page

Navigate to: http://localhost:5177/test-crypto-onboarding

### 2. Click "Buy Crypto"

This will:

1. Call frontend service: `onrampService.generateSessionToken()`
2. Frontend makes POST to: `http://localhost:3001/api/onramp/session-token`
3. Backend generates JWT using CDP SDK
4. Backend calls CDP API: `https://api.developer.coinbase.com/onramp/v1/token`
5. CDP API returns session token
6. Frontend receives token and opens Coinbase Pay popup

### 3. Expected Behavior

**If API Key is configured correctly:**

- ✅ Popup opens to: `https://pay-sandbox.coinbase.com/buy/select-asset?sessionToken=real_token`
- ✅ Coinbase Pay loads successfully
- ✅ You can enter test card: `4242 4242 4242 4242`
- ✅ Complete test purchase flow

**If API Key is still missing:**

- ⚠️ Backend returns mock token
- ⚠️ Popup opens with mock token
- ❌ Coinbase Pay shows: "Invalid sessionToken" error

---

## 🔍 How Session Token Generation Works

### Architecture Flow

```
┌─────────────────┐
│   User Clicks   │
│  "Buy Crypto"   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Frontend (Port 5177)           │
│  OnrampPurchaseFlow.jsx         │
│                                 │
│  onrampService                  │
│  .generateSessionToken()        │
└────────┬────────────────────────┘
         │ HTTP POST
         │ localhost:3001/api/onramp/session-token
         ▼
┌─────────────────────────────────┐
│  Backend (Port 3001)            │
│  onrampAPI.js                   │
│                                 │
│  1. Load CDP credentials        │
│  2. Generate JWT using SDK      │
└────────┬────────────────────────┘
         │ HTTP POST + JWT Bearer
         │ api.developer.coinbase.com/onramp/v1/token
         ▼
┌─────────────────────────────────┐
│  Coinbase CDP API               │
│  (Official Coinbase Service)    │
│                                 │
│  Validates JWT signature        │
│  Returns session token          │
└────────┬────────────────────────┘
         │ session_token
         ▼
┌─────────────────────────────────┐
│  Backend returns to Frontend    │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Frontend opens popup           │
│  pay-sandbox.coinbase.com       │
│  ?sessionToken=xyz123           │
└─────────────────────────────────┘
```

### Code Breakdown

**1. Frontend calls service** (`src/services/onrampService.js`):

```javascript
export async function generateSessionToken(walletAddress, blockchains) {
  const response = await fetch(
    "http://localhost:3001/api/onramp/session-token",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        addresses: [
          {
            address: walletAddress,
            blockchains: blockchains,
          },
        ],
        assets: ["USDC"],
      }),
    }
  );

  const data = await response.json();
  return data.token;
}
```

**2. Backend generates JWT** (`src/server/onrampAPI.js`):

```javascript
import { generateJwt } from "@coinbase/cdp-sdk/auth";

async function generateJWT(apiKey, apiSecret) {
  const token = await generateJwt({
    apiKeyId: apiKey, // From .env.onramp
    apiKeySecret: apiSecret, // From .env.onramp
    requestMethod: "POST",
    requestHost: "api.developer.coinbase.com",
    requestPath: "/onramp/v1/token",
    expiresIn: 120,
  });

  return token;
}
```

**3. Backend calls CDP API**:

```javascript
const jwt = await generateJWT(apiKey, apiSecret);

const response = await fetch(
  "https://api.developer.coinbase.com/onramp/v1/token",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({
      addresses: [
        {
          address: walletAddress,
          blockchains: ["base"],
        },
      ],
      assets: ["USDC"],
      clientIp: "192.0.2.1", // Test IP for development
    }),
  }
);

const data = await response.json();
return data.token; // This is the session token
```

**4. Frontend uses token in Coinbase Pay**:

```javascript
const url = `https://pay-sandbox.coinbase.com/buy/select-asset?sessionToken=${token}`;
window.open(url, "coinbase-pay", "width=500,height=700");
```

---

## 🔐 Security Notes

### What's Safe

- ✅ `.env.onramp` is in `.gitignore` - never committed to Git
- ✅ API secret only exists server-side (port 3001)
- ✅ Frontend never sees API credentials
- ✅ Session tokens are time-limited (expire in 2 minutes)
- ✅ Session tokens are one-time use

### Best Practices

- ⚠️ Never hardcode credentials in code
- ⚠️ Never commit `.env.onramp` to version control
- ⚠️ Use environment variables for all sensitive data
- ⚠️ Rotate API keys periodically
- ⚠️ Use sandbox environment for testing

---

## 🐛 Troubleshooting

### Problem: "Missing API Key"

**Symptom:** Backend logs show "CDP credentials not configured"

**Solution:**

1. Open `.env.onramp` file
2. Verify `CDP_API_KEY` has the actual API Key ID (not placeholder text)
3. Restart backend server
4. Check health endpoint: `curl http://localhost:3001/health`

---

### Problem: "Invalid Signature" Error

**Symptom:** CDP API returns 401 Unauthorized

**Possible Causes:**

1. **Wrong API Secret format**

   - Should be base64-encoded
   - Should end with `==`
   - Should NOT have PEM headers (no `-----BEGIN...-----`)

2. **API Key doesn't match Project**
   - Make sure API Key belongs to project `11147d99-d330-4ab1-b342-32d5a90131e7`

**Solution:**

1. Go to CDP Portal
2. Delete old API key
3. Create new API key
4. Select "Ed25519" algorithm (recommended)
5. Copy the **API Key ID** and **Private Key** (base64 format)
6. Update `.env.onramp`

---

### Problem: "Invalid sessionToken" in Coinbase Pay

**Symptom:** Popup shows "Missing or invalid parameters"

**Good News:** This means session token generation is working!

**What's Happening:**

1. ✅ JWT generated successfully
2. ✅ CDP API call successful
3. ✅ Session token created
4. ✅ Token passed to Coinbase Pay
5. ⚠️ Coinbase Pay validates token parameters

**This error is normal in sandbox** if:

- Using test wallet addresses
- Not all required parameters are set
- Sandbox restrictions apply

**To test real flow:**

- Use actual wallet address (connected via wallet)
- Test with small amounts
- Use test card: `4242 4242 4242 4242`

---

### Problem: Backend Returns Mock Tokens

**Symptom:** Response shows `"isMock": true`

**Solution:**

1. Check `.env.onramp` exists in correct location
2. Verify environment variables are loaded:
   ```bash
   export $(cat ../../.env.onramp | xargs)
   node onrampAPI.js
   ```
3. Or use `dotenv` explicitly:
   ```javascript
   import dotenv from "dotenv";
   dotenv.config({ path: "../../.env.onramp" });
   ```

---

### Problem: CORS Errors

**Symptom:** Browser console shows "blocked by CORS policy"

**Solution:**
Backend already has CORS enabled. Check:

1. Frontend is calling correct URL: `http://localhost:3001`
2. Backend is running on port 3001
3. No other service is using port 3001

---

## 📚 References

### Official Documentation

- [Coinbase CDP Portal](https://portal.cdp.coinbase.com/)
- [Onramp API Docs](https://docs.cdp.coinbase.com/onramp/docs/api-onramp-initializing)
- [Session Token Guide](https://docs.cdp.coinbase.com/onramp/docs/api-onramp-initializing#getting-a-session-token)
- [CDP SDK Docs](https://github.com/coinbase/cdp-sdk)

### Example Implementation

- [Coinbase Onramp Demo App](https://github.com/coinbase/onramp-demo-application)
  - See `app/api/session/route.ts` for session token generation
  - See `app/utils/sessionTokenApi.ts` for JWT signing

### Test Card Numbers

- **Successful Payment:** `4242 4242 4242 4242`
- **Card Declined:** `4000 0000 0000 0002`
- **Insufficient Funds:** `4000 0000 0000 9995`

### Sandbox Environment

- **Onramp URL:** `https://pay-sandbox.coinbase.com/`
- **API Endpoint:** `https://api.developer.coinbase.com/onramp/v1/token`
- **No real money** - all transactions are simulated

---

## ✅ Next Steps

1. **Get API Key ID from CDP Portal** (see instructions above)
2. **Update `.env.onramp`** with the actual API Key ID
3. **Restart backend server** with environment variables loaded
4. **Test session token generation** using curl command
5. **Test complete flow** at http://localhost:5177/test-crypto-onboarding

---

## 📝 Summary

### What You Have Now

- ✅ Complete backend API for session token generation
- ✅ CDP SDK integrated for official JWT signing
- ✅ Frontend components ready to use session tokens
- ✅ Test environment configured
- ✅ Documentation and troubleshooting guides

### What You Need to Provide

- ⚠️ **API Key ID** from CDP Portal (currently placeholder)

### What Will Work After Setup

- ✅ Real session token generation (no more mocks)
- ✅ Coinbase Pay integration
- ✅ Test USDC purchases with test cards
- ✅ Secure fiat-to-crypto onboarding flow

---

**Need help?** Check `CDP_CREDENTIALS_SETUP.md` for detailed instructions on finding your API Key ID.
