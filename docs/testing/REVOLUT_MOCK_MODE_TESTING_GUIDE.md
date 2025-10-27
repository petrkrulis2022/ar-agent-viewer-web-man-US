# 🧪 Revolut Mock Mode Testing Guide

**Status:** ✅ Mock Mode Enabled - Ready for UI Testing  
**Date:** October 15, 2025  
**Server:** http://localhost:5173  
**Mode:** Mock Data (No Backend Required)

---

## 📋 Current Configuration

### Mock Mode Status

```javascript
// src/services/revolutBankService.js
const USE_MOCK = true; // ⚠️ MOCK MODE ENABLED
```

**Why Mock Mode?**

- Backend Express server on port 3001 is not running
- Connection error: `ERR_CONNECTION_REFUSED` when trying to connect to `localhost:3001`
- Mock mode allows you to test the complete UI flow without backend dependency

---

## 🎯 Testing Instructions

### Step 1: Open the Application

1. Navigate to: **http://localhost:5173**
2. Wait for the AR viewer to load
3. You should see the payment cube with various payment method faces

### Step 2: Test Bank QR Payment Flow

**Action Sequence:**

1. **Click any agent** to select it for payment
2. **Click "Generate Payment"** button
3. **Wait 1.5 seconds** (initialization guard period)
4. **Click the "Bank QR" face** on the payment cube

### Step 3: Verify Mock Modal Behavior

**Expected Results:**
✅ **Modal Opens:** RevolutBankQRModal should appear  
✅ **QR Code Displays:** Mock QR code generated from simulated payment URL  
✅ **Order Details Shown:**

- Mock Order ID: `revolut_[timestamp]_[random]`
- Payment URL: `https://revolut.me/pay/[orderId]?amount=[amount]&currency=EUR`
- Amount and currency from selected agent

✅ **Countdown Timer:** 5-minute countdown (300 seconds)  
✅ **Console Logs:** Check browser console for:

```
🧪 MOCK MODE: Generating simulated Revolut Bank QR order
✅ Revolut Bank QR order created successfully
```

### Step 4: Test Modal Interactions

**Test These Actions:**

- ✅ **Cancel Button:** Click "Cancel Payment" - modal should close
- ✅ **Close Icon:** Click X icon - modal should close
- ✅ **Countdown Timer:** Watch timer decrement every second
- ✅ **QR Code:** Verify QR code is readable and renders properly

---

## 🔍 Browser Console Debugging

### Expected Console Output

**Successful Mock Flow:**

```javascript
🧪 MOCK MODE: Generating simulated Revolut Bank QR order

✅ Revolut Bank QR order created successfully

📋 Order Details:
{
  success: true,
  order: {
    id: "revolut_1729000000000_abc123xyz",
    status: "pending",
    amount: 5.00,
    currency: "EUR"
  },
  paymentUrl: "https://revolut.me/pay/revolut_1729000000000_abc123xyz?amount=5&currency=EUR"
}
```

### Common Issues and Fixes

#### Issue 1: Modal Doesn't Open

**Symptoms:** Clicking Bank QR face does nothing

**Troubleshooting:**

1. Check console for errors
2. Verify you waited 1.5 seconds after "Generate Payment"
3. Look for `isInitializing` guard logs
4. Refresh page and try again

**Console Command to Check State:**

```javascript
// Paste in browser console
console.log("Current modal state:", {
  showRevolutBankModal: window.reactAppState?.showRevolutBankModal,
  isInitializing: window.reactAppState?.isInitializing,
});
```

#### Issue 2: Still Seeing Connection Errors

**Symptoms:** `ERR_CONNECTION_REFUSED` errors in console

**Cause:** Mock mode change not loaded yet

**Fix:**

1. **Hard Reload:** Press `Ctrl+Shift+R` (Linux/Windows) or `Cmd+Shift+R` (Mac)
2. **Clear Cache:** Open DevTools → Application → Clear Storage → Clear site data
3. **Check File:** Verify `revolutBankService.js` has `USE_MOCK = true`

#### Issue 3: Modal Auto-Opens on Page Load

**Symptoms:** Modal appears immediately without clicking

**Cause:** `isOpen` prop not working correctly

**Fix:**

1. Check `RevolutBankQRModal.jsx` has: `if (!isOpen) return null;`
2. Verify `showRevolutBankModal` state is `false` initially
3. Hard reload browser

---

## 📊 Mock Data Details

### Simulated Order Response

```javascript
{
  success: true,
  order: {
    id: "revolut_[unix_timestamp]_[random_9_chars]",
    status: "pending",
    amount: [agent_fee_amount],
    currency: "EUR",  // Default mock currency
    createdAt: "[ISO_timestamp]",
    expiresAt: "[ISO_timestamp_+5min]",
    merchantId: "mock_merchant_12345",
    merchantName: "AgentSphere Test"
  },
  paymentUrl: "https://revolut.me/pay/[order_id]?amount=[amount]&currency=EUR",
  qrData: "https://revolut.me/pay/[order_id]?amount=[amount]&currency=EUR"
}
```

### API Delay Simulation

- **Delay:** 800ms (simulates network latency)
- **Purpose:** Test loading states and user feedback
- **Location:** `revolutBankService.js` line ~20

---

## 🚀 Next Steps After UI Testing

### When Ready for Real Backend Integration

**Prerequisites:**

1. Backend Express server must be running on port 3001
2. CORS must be configured for `http://localhost:5173`
3. Revolut API credentials configured in backend environment

**Steps to Switch to Production Mode:**

#### Option A: Backend on Same Machine

```bash
# 1. Navigate to backend directory
cd /path/to/agentsphere-backend

# 2. Start Express server
npm start
# OR
node server.js

# 3. Verify server is running
curl http://localhost:3001/api/health
# Should return: {"status":"ok"}

# 4. Update frontend to production mode
# Edit: src/services/revolutBankService.js
const USE_MOCK = false; // Enable production mode
```

#### Option B: Backend in GitHub Codespace

```bash
# 1. Open backend codespace
# 2. Start server in that codespace
npm start

# 3. Get forwarded port URL
# GitHub Codespaces provides URL like:
# https://your-codespace-3001.preview.app.github.dev

# 4. Update .env.local
VITE_AGENTSPHERE_API_URL=https://your-codespace-3001.preview.app.github.dev

# 5. Update revolutBankService.js
const USE_MOCK = false;
```

#### Verification Commands

```bash
# Test health endpoint
curl http://localhost:3001/api/health

# Test Revolut endpoint (should return 400 if auth missing)
curl -X POST http://localhost:3001/api/revolut/create-bank-order \
  -H "Content-Type: application/json" \
  -d '{"amount":10,"currency":"EUR"}'
```

---

## 📝 Testing Checklist

### UI Flow Testing (Mock Mode)

- [ ] Cube renders correctly
- [ ] Agent selection works
- [ ] "Generate Payment" button appears
- [ ] Initialization guard works (1.5s delay)
- [ ] Bank QR face is clickable
- [ ] Modal opens on click
- [ ] QR code displays
- [ ] Order details show correctly
- [ ] Countdown timer counts down
- [ ] Cancel button closes modal
- [ ] Close icon (X) closes modal
- [ ] No console errors (except Supabase 404s - those are unrelated)

### Mock Data Validation

- [ ] Order ID format: `revolut_[timestamp]_[random]`
- [ ] Payment URL format: `https://revolut.me/pay/[id]?amount=[num]&currency=EUR`
- [ ] Amount matches agent fee
- [ ] Currency defaults to EUR
- [ ] Console shows "🧪 MOCK MODE" message
- [ ] Console shows success message with order details

### Backend Integration (When Backend Available)

- [ ] Backend server running on port 3001
- [ ] `/api/health` endpoint returns 200
- [ ] CORS configured for localhost:5173
- [ ] `USE_MOCK = false` in revolutBankService.js
- [ ] Real Revolut API credentials configured
- [ ] Test payment creates real Revolut order
- [ ] QR code contains real payment URL
- [ ] Payment status webhooks work
- [ ] Order expiration handled correctly

---

## 🐛 Troubleshooting

### Mock Mode Not Working

**Problem:** Still seeing "Failed to fetch" errors

**Solution:**

```bash
# 1. Verify file change
cat src/services/revolutBankService.js | grep USE_MOCK
# Should show: const USE_MOCK = true;

# 2. Hard reload browser
# Press Ctrl+Shift+R

# 3. Check Vite server reloaded
# Terminal should show HMR update for revolutBankService.js
```

### QR Code Not Displaying

**Problem:** Modal opens but QR code is blank

**Solution:**

1. Check browser console for errors
2. Verify `react-qr-code` package is installed:
   ```bash
   npm list react-qr-code
   ```
3. Install if missing:
   ```bash
   npm install react-qr-code
   ```
4. Check network tab for QR library loading

### Timer Not Counting Down

**Problem:** Countdown stays at 5:00

**Solution:**

1. Check `RevolutBankQRModal.jsx` has timer interval setup
2. Look for `setInterval` in component
3. Verify state updates in React DevTools
4. Check for JavaScript errors blocking timer

---

## 📞 Support Information

### Related Documentation

- `REVOLUT_CONNECTION_SUCCESS.md` - Backend connection guide
- `REVOLUT_CORS_FIX_REQUIRED.md` - CORS troubleshooting
- `REVOLUT_FRONTEND_IMPLEMENTATION_SUMMARY.md` - Complete implementation details
- `REVOLUT_MODAL_AUTO_OPEN_FIX.md` - Modal rendering fix

### Key Files

- `src/services/revolutBankService.js` - Bank QR API service (MOCK MODE ENABLED)
- `src/services/revolutVirtualCardService.js` - Virtual Card service
- `src/hooks/usePaymentStatus.js` - Payment status tracking
- `src/components/RevolutBankQRModal.jsx` - QR modal UI
- `src/components/CubePaymentEngine.jsx` - Main payment cube (line 1909+)
- `.env.local` - Environment configuration

### Current Environment

```
VITE_AGENTSPHERE_API_URL=http://localhost:3001
VITE_REVOLUT_CLIENT_ID_SANDBOX=[your_client_id]
VITE_REVOLUT_CLIENT_SECRET_SANDBOX=[your_secret]
USE_MOCK=true (hardcoded in revolutBankService.js)
```

---

## ✅ Success Indicators

**You've successfully tested the mock flow when:**

1. ✅ Modal opens smoothly after clicking Bank QR face
2. ✅ QR code displays a mock Revolut payment URL
3. ✅ Order details show mock data with proper format
4. ✅ Countdown timer decrements every second
5. ✅ Cancel/close buttons work correctly
6. ✅ Console shows mock mode logs
7. ✅ No connection errors (since we're not hitting backend)
8. ✅ UI flow feels smooth and responsive

**When all indicators are green, the UI implementation is complete!**  
The only remaining step is connecting to a real backend when available.

---

## 🎉 Current Status

**Frontend Implementation:** ✅ COMPLETE  
**Mock Mode Testing:** ✅ READY  
**Backend Connection:** ⏸️ PENDING (Backend server not running)  
**Production Ready:** 🟡 Waiting for backend deployment

**Next Action:** Test the Bank QR payment flow in your browser at http://localhost:5173 and verify all UI elements work correctly with mock data!
