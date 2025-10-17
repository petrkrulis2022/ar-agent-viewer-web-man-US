# 🏦 Revolut Real Payments Setup Guide

**Date:** October 16, 2025  
**Current Status:** Mock mode disabled, ready for real Revolut Sandbox integration  
**Your Question:** How to test real Revolut payments?

---

## 🎯 Quick Answer

### Account Setup:

- **Merchant (AgentSphere)**: Needs Revolut **Business Sandbox Account**
- **Customer (You/Users)**: Can use **any Revolut personal account** OR **any bank account**

### Your Current Config:

```
Client ID: 96ca6a20-254d-46e7-aad1-46132e087901
Environment: sandbox
Backend URL: http://localhost:3001
Mock Mode: NOW DISABLED ✅
```

---

## 🔐 Account Types Explained

### 1. Merchant Account (Receiving Money)

**Who needs it:** AgentSphere backend  
**Account type:** Revolut Business Account  
**API Access:** Merchant API  
**Purpose:** Create payment orders, receive payments

**How to get it:**

1. Sign up at: https://business.revolut.com/
2. Choose "Business" account
3. Apply for API access (Merchant API)
4. Get sandbox credentials:
   - Client ID ✅ (you have this)
   - Client Secret ❌ (you need this)
5. Configure backend with credentials

### 2. Customer Account (Paying Money)

**Who needs it:** End users (you, customers, anyone)  
**Account type:** Any Revolut personal OR business account  
**Alternative:** Any bank account (Revolut accepts bank transfers)  
**Purpose:** Pay merchants

**How it works:**

1. User sees QR code / payment link
2. User clicks/scans → Opens Revolut payment page
3. User logs into THEIR OWN Revolut account
4. User confirms payment
5. Money goes to merchant

---

## 💡 Key Insight: You Don't Need Two Revolut Accounts!

### ❌ WRONG Understanding:

"I need a sending account AND receiving account, both Revolut Business"

### ✅ CORRECT Understanding:

- **AgentSphere Backend** = Revolut Business (Merchant) = Receives payments
- **You/Customers** = Any Revolut account OR bank account = Sends payments

**Analogy:**

- AgentSphere = Shop owner (has business account to receive money)
- You = Customer (uses your personal card/account to pay)

---

## 🧪 Testing Scenarios

### Scenario 1: Mock Mode (Current - Now Disabled)

**Status:** You just disabled this ✅

**What happened:**

- Frontend generates fake payment URLs
- No real API calls
- URL format looks real but points to nothing
- Good for UI testing only

**Result:**

- Clicking QR opens: `https://revolut.me/pay/revolut_[random]`
- Revolut shows: "This payment doesn't exist"
- Expected behavior for mock data

### Scenario 2: Sandbox Mode (Next Step)

**Requirements:**

- ✅ Backend server running on port 3001
- ✅ Backend has Revolut SDK installed
- ✅ Backend has your sandbox credentials
- ❌ You need Client Secret (missing)

**How it works:**

1. Frontend → Backend: "Create payment order"
2. Backend → Revolut API: "Create order for €1"
3. Revolut API → Backend: "Order created, here's URL"
4. Backend → Frontend: Real payment URL
5. User clicks QR → Opens real sandbox payment page
6. User logs into Revolut sandbox account
7. Uses Revolut test card to complete payment
8. Webhook confirms payment

**Testing accounts:**

- Merchant: Your Revolut Business Sandbox
- Customer: Your personal Revolut account (or test account)

### Scenario 3: Production (Real Money)

**Requirements:**

- Revolut Business Production account
- Production API credentials
- Business verification complete
- KYC/compliance approved

**How it works:**

- Same as sandbox but with real money
- Real customer accounts
- Real bank transactions
- Real funds transferred

---

## 🚀 Step-by-Step: Enable Real Payments

### Step 1: Get Revolut Client Secret

**Where to find it:**

1. Log into Revolut Business Dashboard
2. Go to: Developer → API
3. Find your sandbox application
4. Copy Client Secret

**Add to `.env.local`:**

```bash
VITE_REVOLUT_CLIENT_SECRET_SANDBOX=your_actual_secret_here
```

### Step 2: Verify Backend Has Revolut Integration

Your backend needs this code (example):

```javascript
// backend/routes/revolut.js
const Revolut = require("revolut-merchant");

const revolutClient = new Revolut({
  environment: "sandbox",
  clientId: process.env.REVOLUT_CLIENT_ID,
  clientSecret: process.env.REVOLUT_CLIENT_SECRET,
});

app.post("/api/revolut/create-bank-order", async (req, res) => {
  try {
    const { amount, currency, merchantOrderId } = req.body;

    // Create order via Revolut API
    const order = await revolutClient.orders.create({
      amount: amount * 100, // Convert to cents
      currency: currency,
      merchantOrderExtRef: merchantOrderId,
      description: "AgentSphere Agent Interaction Fee",
    });

    res.json({
      success: true,
      order: {
        id: order.id,
        status: order.state,
        amount: amount,
        currency: currency,
      },
      paymentUrl: order.checkoutUrl, // Real Revolut payment URL
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

### Step 3: Start Backend Server

```bash
cd /path/to/agentsphere-backend
npm start
```

**Verify it's running:**

```bash
curl http://localhost:3001/api/health
```

### Step 4: Test Payment Flow

1. Open AR viewer: http://localhost:5173
2. Select an agent
3. Click "Generate Payment"
4. Click "Bank QR" face
5. Modal opens with **real** QR code
6. Click QR code
7. Opens real Revolut payment page (sandbox)
8. Log into your Revolut account
9. Complete payment with test card
10. Payment confirmed via webhook

---

## 💳 Payment Methods for Customers

When you click the payment URL, Revolut accepts:

### 1. Revolut Account

- Personal Revolut account
- Business Revolut account
- Any country, any currency
- Instant payment

### 2. Bank Transfer

- Any bank account
- Via bank transfer to Revolut
- May take 1-3 days
- Revolut provides bank details

### 3. Card Payment

- Credit card
- Debit card
- Through Revolut payment page
- Instant payment

**You can test with:**

- ✅ Your personal Revolut account on your phone
- ✅ Revolut sandbox test account
- ✅ Revolut test cards (in sandbox)

---

## 🔍 Current Payment URL Analysis

**Your URL:** `https://revolut.me/pay/revolut_1760627374962_uet4qh4x3?amount=1&currency=EUR`

**Breakdown:**

- `revolut.me/pay/` = Revolut payment page
- `revolut_1760627374962_uet4qh4x3` = Mock order ID (generated by frontend)
- `amount=1` = €1 payment
- `currency=EUR` = Euros

**Why it doesn't work:**

- This is MOCK data (generated locally)
- Order ID doesn't exist in Revolut's system
- Revolut redirects to generic page

**With real backend:**

- Order ID created by Revolut API
- URL points to real payment page
- Payment can be completed

---

## 🧪 Revolut Sandbox Test Cards

When testing in sandbox, use these test cards:

### Successful Payment:

```
Card Number: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
```

### Failed Payment:

```
Card Number: 4000 0000 0000 0002
Expiry: Any future date
CVC: Any 3 digits
```

### Requires 3D Secure:

```
Card Number: 4000 0027 6000 3184
Expiry: Any future date
CVC: Any 3 digits
```

---

## 📊 Payment Flow Diagram

### Mock Mode (Current - Disabled):

```
Frontend
   ↓
Generates fake order ID
   ↓
Creates mock payment URL
   ↓
User clicks QR
   ↓
Opens: revolut.me/pay/fake_id
   ↓
❌ Revolut: "Payment not found"
```

### Real Sandbox Mode (Next):

```
Frontend
   ↓
POST to Backend: Create order
   ↓
Backend → Revolut API: Create order
   ↓
Revolut API → Backend: Order created
   ↓
Backend → Frontend: Real payment URL
   ↓
User clicks QR
   ↓
Opens: Real Revolut payment page
   ↓
User logs into Revolut account
   ↓
Completes payment
   ↓
Revolut → Backend: Webhook confirmation
   ↓
Backend → Frontend: Payment success
   ↓
✅ Complete!
```

---

## ✅ Checklist: Enable Real Payments

### Frontend (Current):

- [x] Revolut Client ID in .env
- [ ] Revolut Client Secret in .env (add this!)
- [x] Mock mode disabled
- [x] Backend URL configured
- [x] QR click functionality working

### Backend (Required):

- [ ] Backend server running on port 3001
- [ ] Revolut SDK installed (`npm install revolut-merchant`)
- [ ] Environment variables configured
- [ ] `/api/revolut/create-bank-order` endpoint created
- [ ] Webhook handler implemented
- [ ] CORS configured for localhost:5173

### Revolut Account (Required):

- [ ] Revolut Business Sandbox account created
- [ ] API access approved
- [ ] Client ID obtained ✅
- [ ] Client Secret obtained ❌
- [ ] Sandbox credentials tested

### Testing (Ready When Above Complete):

- [ ] Test order creation
- [ ] Test QR code with real URL
- [ ] Test payment completion
- [ ] Test webhook delivery
- [ ] Test error handling

---

## 🎯 Your Next Steps

### 1. Get Client Secret

Log into Revolut Business Dashboard → API → Copy Client Secret

### 2. Update .env.local

```bash
VITE_REVOLUT_CLIENT_SECRET_SANDBOX=your_secret_here
```

### 3. Ensure Backend Running

```bash
# Check if backend is running
curl http://localhost:3001/api/health

# If not, start it
cd /path/to/backend
npm start
```

### 4. Test Real Payment

1. Refresh AR viewer
2. Generate Bank QR payment
3. Click QR code
4. Should open real Revolut sandbox page
5. Log in with your Revolut account
6. Complete payment

---

## 💡 Important Notes

### About Accounts:

- ✅ You can pay with your **personal Revolut account**
- ✅ You don't need two business accounts
- ✅ Merchant = Business account (AgentSphere)
- ✅ Customer = Any account (you, users)

### About Testing:

- In sandbox: Use test cards or your real Revolut account (no real money charged)
- In production: Real money, real accounts
- Sandbox and production are separate environments

### About Payment URLs:

- Mock URLs: Don't work (fake order IDs)
- Sandbox URLs: Work in sandbox (real Revolut test environment)
- Production URLs: Work with real money (real Revolut environment)

---

## 🆘 Troubleshooting

### "Payment not found" Error

**Cause:** Mock mode generating fake order IDs  
**Fix:** Ensure backend is running and USE_MOCK = false ✅

### "Connection refused" Error

**Cause:** Backend not running on port 3001  
**Fix:** Start backend server

### "Invalid credentials" Error

**Cause:** Missing or incorrect Client Secret  
**Fix:** Add correct secret to .env.local

### "CORS error" Error

**Cause:** Backend not allowing requests from localhost:5173  
**Fix:** Configure CORS in backend

---

## 📚 Resources

- **Revolut Business:** https://business.revolut.com/
- **Revolut API Docs:** https://developer.revolut.com/docs/merchant-api
- **Revolut Sandbox:** https://sandbox-business.revolut.com/
- **Test Cards:** https://developer.revolut.com/docs/merchant-api/#test-cards

---

## 🎉 Summary

**Your Understanding (Corrected):**

- ✅ AgentSphere backend = Merchant (Revolut Business account)
- ✅ You/customers = Payers (any Revolut account or bank account)
- ✅ You can test with your personal Revolut account
- ✅ No need for two business accounts

**Current Status:**

- ✅ Mock mode disabled
- ✅ Frontend ready for real integration
- ❌ Need Client Secret
- ❌ Need backend running
- 🎯 Once backend ready → real payments work!

**Next Action:** Get your Revolut Client Secret and configure backend! 🚀
