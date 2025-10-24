# CDP Credentials Setup Guide

## ⚠️ IMPORTANT: Missing API Key ID

You provided:

- ✅ **Project ID**: `11147d99-d330-4ab1-b342-32d5a90131e7`
- ❌ **API Key ID**: (not provided - you only showed "api key id:" label)
- ✅ **API Secret**: `rUcslyfRp0JJTCfIL3/QRTtpqZEM9+wAfLGVxB4WpuJY+WVYWHtwGW/Egjv8WC4O/WCGo2E1f5/OidnBcnpsYA==`

## How to Get Your API Key ID

1. Go to [Coinbase Developer Platform](https://portal.cdp.coinbase.com/)
2. Navigate to your project: `11147d99-d330-4ab1-b342-32d5a90131e7`
3. Click on **"API Keys"** in the left sidebar
4. Find your API key in the list
5. The **API Key ID** (or "Name") will look like:
   - `organizations/11147d99-d330-4ab1-b342-32d5a90131e7/apiKeys/XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX`
   - OR just: `XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX`

## Current .env.onramp Configuration

```bash
# Your CDP Project ID
CDP_PROJECT_ID=11147d99-d330-4ab1-b342-32d5a90131e7

# Your CDP API Key (REPLACE WITH YOUR ACTUAL API KEY ID)
CDP_API_KEY=organizations/11147d99-d330-4ab1-b342-32d5a90131e7/apiKeys/YOUR_API_KEY_ID

# Your CDP API Secret (already configured)
CDP_API_SECRET=rUcslyfRp0JJTCfIL3/QRTtpqZEM9+wAfLGVxB4WpuJY+WVYWHtwGW/Egjv8WC4O/WCGo2E1f5/OidnBcnpsYA==
```

## Steps to Complete Setup

### 1. Get API Key ID from CDP Portal

**Screenshot locations to find it:**

- On the API Keys page, you'll see columns:
  - **Name** (this is your API Key ID)
  - **Status** (Active/Inactive)
  - **Created**

### 2. Update .env.onramp File

Edit `/home/petrunix/agentsphere-full-web-man-US-qr tap/ar-agent-viewer-web-man-US/.env.onramp`

Replace this line:

```bash
CDP_API_KEY=organizations/11147d99-d330-4ab1-b342-32d5a90131e7/apiKeys/YOUR_API_KEY_ID
```

With the actual API Key ID you copied from CDP portal.

### 3. Install CDP SDK Dependency

```bash
cd "src/server"
npm install
```

This will install `@coinbase/cdp-sdk` which is needed for JWT generation.

### 4. Restart the Backend Server

Kill any running instances and start fresh:

```bash
# Kill existing processes
lsof -ti:3001 | xargs kill -9 2>/dev/null

# Start the backend with .env.onramp loaded
cd "src/server"
NODE_ENV=development node onrampAPI.js
```

### 5. Verify Configuration

Check the health endpoint:

```bash
curl http://localhost:3001/health
```

**Expected output:**

```json
{
  "status": "ok",
  "timestamp": "2025-10-24T...",
  "hasCredentials": true,
  "projectId": "11147d99-d330-4ab1-b342-32d5a90131e7"
}
```

## How Session Token Generation Works

### Frontend Request

```javascript
// From OnrampPurchaseFlow.jsx
const sessionData = await onrampService.generateSessionToken(walletAddress, [
  "base",
]);
```

### Backend Processing (onrampAPI.js)

1. **Generate JWT** using CDP SDK:

```javascript
const jwt = await generateJwt({
  apiKeyId: apiKey, // Your CDP_API_KEY
  apiKeySecret: apiSecret, // Your CDP_API_SECRET
  requestMethod: "POST",
  requestHost: "api.developer.coinbase.com",
  requestPath: "/onramp/v1/token",
  expiresIn: 120,
});
```

2. **Call CDP API** with JWT:

```javascript
const response = await fetch(
  "https://api.developer.coinbase.com/onramp/v1/token",
  {
    method: "POST",
    headers: {
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
      clientIp: "192.0.2.1",
    }),
  }
);
```

3. **Return Session Token** to frontend

4. **Frontend Uses Token** in Coinbase Pay URL:

```javascript
const url = `https://pay-sandbox.coinbase.com/buy/select-asset?sessionToken=${token}`;
window.open(url, "coinbase-pay", "width=500,height=700");
```

## Troubleshooting

### Error: "Invalid API Key"

- Double-check your `CDP_API_KEY` matches exactly from CDP portal
- Make sure there are no extra spaces or newlines

### Error: "Invalid Signature"

- Your `CDP_API_SECRET` might be malformed
- Re-copy the secret from CDP portal (should be base64 ending in `==`)

### Error: "Missing or invalid parameters"

- Session token is working! This means:
  - JWT generation is successful
  - CDP API call is successful
  - Token is being passed to Coinbase Pay
  - The error is from Coinbase Pay validating the token details

### Still Getting Mock Tokens?

- Check that `.env.onramp` is in the correct location
- Restart the backend server after editing `.env.onramp`
- Verify environment variables are loaded: `console.log(process.env.CDP_API_KEY)`

## Testing with Real Credentials

Once configured, you can test the complete flow:

1. **Start Backend** (port 3001):

```bash
cd src/server
NODE_ENV=development node onrampAPI.js
```

2. **Start Frontend** (port 5177):

```bash
npm run dev -- --port 5177
```

3. **Open Test Page**:

```
http://localhost:5177/test-crypto-onboarding
```

4. **Click "Buy Crypto"** and you should see:
   - ✅ Session token generated successfully
   - ✅ Popup opens to Coinbase Pay sandbox
   - ✅ Real transaction flow (with test card: `4242 4242 4242 4242`)

## Security Notes

- ✅ `.env.onramp` is in `.gitignore` - never commit credentials
- ✅ API secret is only used server-side (port 3001)
- ✅ Frontend only receives session tokens (time-limited, one-time use)
- ✅ Sandbox environment for testing (no real money)

## References

- [Coinbase Onramp Demo](https://github.com/coinbase/onramp-demo-application)
- [CDP API Documentation](https://docs.cdp.coinbase.com/onramp/docs/api-onramp-initializing)
- [Session Token Guide](https://docs.cdp.coinbase.com/onramp/docs/api-onramp-initializing#getting-a-session-token)
