# AR Cube Virtual Card Integration - Testing Guide

## 🎯 Quick Test Instructions

### Prerequisites

- ✅ Vite dev server running on http://localhost:5173/
- ✅ AR Viewer loaded in browser
- ✅ Mock mode enabled: `VITE_USE_MOCK_CARD=true` (in .env.local)

---

## 📱 How to Test Virtual Card in AR Cube

### Step 1: Open AR Viewer

1. Navigate to http://localhost:5173/ in your browser
2. You should see the 3D AR Cube with payment method faces
3. Cube should be rotating with different payment icons

### Step 2: Locate Virtual Card Face

Look for the cube face with:

- 💳 Credit card icon
- "Virtual Card" label
- Purple/blue gradient background

**Cube Face Positions:**

- Top: BTC Payments
- Bottom: Crypto QR
- Front: Sound Pay
- Back: Voice Pay
- Left: Bank QR
- **Right: Virtual Card** ← This is what we want!

### Step 3: Click Virtual Card Face

1. **Click** or **tap** the Virtual Card face
2. The cube should stop rotating
3. A modal should appear with dark backdrop

**Expected Behavior:**

- ✅ Modal opens instantly
- ✅ Dark glassmorphism backdrop (70% black)
- ✅ White card container in center
- ✅ Close button (✕) in top-right corner
- ✅ "Create Virtual Card" button visible

### Step 4: Create Virtual Card

1. Click the **"Create Virtual Card"** button
2. Watch the magic happen! ✨

**Expected Results:**

- ✅ Beautiful Revolut-styled card appears
- ✅ Blue → purple gradient
- ✅ Card number hidden (dots: •••• •••• •••• ••••)
- ✅ Agent name displayed
- ✅ Balance: $50.00 (or amount from agent config)
- ✅ Smooth fade-in animation

**Console Output:**

```
💳 Opening Revolut Virtual Card modal...
💰 Virtual Card initial amount: 50 USD
💳 Creating virtual card...
🧪 MOCK: Creating virtual card for agent: your_agent_id
✅ Card created: {cardId: "card_mock_...", ...}
```

### Step 5: Test Card Features

Once the card is created, test all features:

#### A. Show Card Details

- Click **"Show Details"**
- Card flips with 3D animation
- Reveals: 4111 1111 1111 1111, CVV: 123, Expiry: 12/25

#### B. Copy Card Number

- Click **"Copy Number"**
- Should see "Copied!" confirmation
- Paste somewhere to verify

#### C. Top Up Card

- Enter amount: `25.00`
- Click **"Top Up"**
- Balance changes: $50 → $75

#### D. Freeze/Unfreeze

- Click **"Freeze Card"**
- Card turns gray with snowflake ❄️
- Click **"Unfreeze Card"**
- Card returns to blue gradient

#### E. Make Payment

- Amount: `10.00`
- Merchant: `Amazon`
- Click **"Pay"**
- Balance decreases: $75 → $65

#### F. View Transactions

- Click **"Load Transactions"**
- Transaction list appears
- Shows payment, topup, creation

### Step 6: Close Modal

**Option 1:** Click the ✕ button
**Option 2:** Click outside the modal (on dark backdrop)
**Option 3:** Press ESC (if implemented)

**Expected:**

- ✅ Modal closes smoothly
- ✅ Returns to AR Cube view
- ✅ Cube resumes rotation

---

## 🐛 Troubleshooting

### Modal Doesn't Open

**Possible Causes:**

1. Import error - Check console for "RevolutVirtualCard not found"
2. State not updating - Check `showVirtualCardModal` in React DevTools
3. Click handler not attached - Verify `handleVirtualCardSelection` is called

**Debug Steps:**

```javascript
// In browser console:
console.log(React.version); // Should be 19.1.0
console.log(window.Buffer); // Should be defined (polyfill)
```

### Card Doesn't Create

**Possible Causes:**

1. Mock mode not enabled - Check `VITE_USE_MOCK_CARD` in .env.local
2. Agent ID missing - Check `virtualCardAgentId` state
3. Service import error - Verify revolutCardService.js loads

**Debug Steps:**

- Open browser console
- Look for error messages
- Check Network tab (should see NO requests in mock mode)

### Modal Won't Close

**Possible Causes:**

1. Click event not propagating
2. State not resetting
3. Z-index issue with backdrop

**Debug Steps:**

- Try clicking directly on ✕ button
- Check if `handleVirtualCardClose` is called
- Inspect React state in DevTools

### Styling Issues

**Possible Causes:**

1. CSS conflicts
2. Z-index problems
3. Missing inline styles

**Debug Steps:**

- Check Elements tab in DevTools
- Verify modal has `zIndex: 10000`
- Ensure backdrop covers full screen

---

## ✅ Success Checklist

Mark each as you test:

- [ ] AR Cube loads and rotates
- [ ] Virtual Card face is visible
- [ ] Clicking face opens modal
- [ ] Modal has dark backdrop
- [ ] Close button (✕) visible
- [ ] "Create Virtual Card" button present
- [ ] Card creation works instantly
- [ ] Card displays with gradient
- [ ] Balance shows $50.00 (or configured amount)
- [ ] Show/hide details works
- [ ] Card flip animation smooth
- [ ] Copy number works
- [ ] Top up increases balance
- [ ] Freeze turns card gray
- [ ] Payment decreases balance
- [ ] Transactions display correctly
- [ ] Close button closes modal
- [ ] Backdrop click closes modal
- [ ] No console errors
- [ ] Mock mode logs visible (🧪 emoji)

---

## 📊 Expected Console Output

```
// When opening modal:
💳 Opening Revolut Virtual Card modal...
💰 Virtual Card initial amount: 50 USD

// When creating card:
💳 Creating virtual card...
🧪 MOCK: Creating virtual card for agent: test_agent_123
✅ Card created: {cardId: "card_mock_...", balance: 5000, status: "active"}

// When topping up:
💰 Topping up card card_mock_... with amount 2500
🧪 MOCK: Topping up virtual card card_mock_... by 2500
✅ Top up successful: {balance: 7500}

// When freezing:
🧪 MOCK: Freezing virtual card card_mock_...
✅ Card frozen

// When making payment:
💳 Processing payment of 1000 to Amazon
🧪 MOCK: Simulating card payment
✅ Payment successful: {transactionId: "txn_mock_..."}

// When loading transactions:
🧪 MOCK: Getting card transactions for card_mock_...
✅ Transactions loaded: [3 transactions]
```

---

## 🎨 Visual Verification

### Correct Card Appearance:

```
┌─────────────────────────────────────┐
│                                     │
│  💳 Revolut                         │
│                                     │
│  •••• •••• •••• ••••                │
│                                     │
│  Agent Name                         │
│  $50.00                             │
│                                     │
│  [Show Details] [Copy Number]      │
│                                     │
└─────────────────────────────────────┘
```

### Colors:

- Card background: Blue (#3b82f6) → Purple (#8b5cf6) gradient
- Text: White (#ffffff)
- Buttons: White background with blue text
- Frozen state: Gray (#6b7280) with snowflake

### Animations:

- Card appears: 0.3s fade-in
- Flip: 0.6s 3D transform
- Buttons: Hover scale (1.02x)
- Balance: Smooth number change

---

## 🔧 Advanced Testing

### Test with Different Agent Amounts

Edit the test to use different initial amounts:

```javascript
// In CubePaymentEngine.jsx, line ~2524:
initialAmount={
  (100.00) * 100  // Test with $100 instead of agent amount
}
```

### Test Error Scenarios

1. Try to pay more than balance → Should show "Insufficient funds"
2. Try to pay with frozen card → Should show "Card is frozen"
3. Try invalid top up amount (0 or negative) → Should show error

### Test State Persistence

1. Create card
2. Make some transactions
3. Close modal
4. Reopen modal
5. Card should still exist with updated balance

---

## 🚀 Next Steps After Testing

Once all tests pass:

1. **Switch to Real API Mode**

   - Update `.env.local`: `VITE_USE_MOCK_CARD=false`
   - Restart Vite server
   - Test with actual backend endpoints

2. **Test with Real Agent Data**

   - Deploy an agent in AgentSphere
   - Navigate to agent's AR viewer
   - Test Virtual Card with real interaction fees

3. **Mobile Testing**

   - Open on iPhone/Android
   - Test touch interactions
   - Verify responsive design

4. **Cross-Browser Testing**

   - Chrome ✓
   - Safari
   - Firefox
   - Edge

5. **Performance Testing**
   - Test with slow network (throttling)
   - Test with many transactions
   - Monitor memory usage

---

## 📝 Test Report Template

```markdown
# Virtual Card AR Cube Test Report

**Date:**
**Tester:**
**Environment:** Mock Mode / Real API

## Test Results

### Modal Opening

- [ ] Pass / [ ] Fail
- Notes:

### Card Creation

- [ ] Pass / [ ] Fail
- Notes:

### Card Operations

- Show/Hide: [ ] Pass / [ ] Fail
- Copy Number: [ ] Pass / [ ] Fail
- Top Up: [ ] Pass / [ ] Fail
- Freeze: [ ] Pass / [ ] Fail
- Payment: [ ] Pass / [ ] Fail
- Transactions: [ ] Pass / [ ] Fail

### UI/UX

- Animations: [ ] Smooth / [ ] Laggy
- Colors: [ ] Correct / [ ] Off
- Responsiveness: [ ] Good / [ ] Issues
- Errors: [ ] None / [ ] Found: **\_\_\_**

### Overall

- [ ] Ready for production
- [ ] Needs fixes
- [ ] Blocker issues

**Comments:**
```

---

## 🎉 Happy Testing!

The Virtual Card should work beautifully in the AR Cube! If you encounter any issues, check:

1. Console for errors
2. Network tab for failed requests (shouldn't be any in mock mode)
3. React DevTools for state issues
4. This guide's troubleshooting section

**Need Help?** Check REVOLUT_FRONTEND_BACKEND_ALIGNMENT.md for integration details.
