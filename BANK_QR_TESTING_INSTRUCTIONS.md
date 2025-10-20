# 🧪 Bank QR Internal Payment Testing Instructions

## 🎯 What We're Testing

The Revolut Bank QR now supports **dual payment modes** like Crypto QR:

1. **External Payment** - Scan QR with phone camera
2. **Internal Payment** - Click "Pay Now" button for instant simulation

---

## 🚀 Quick Start

### 1. Open AR Viewer

```
http://localhost:5173/
```

### 2. Select an Agent

- Any agent with payment capability
- Example: "Cube Dynamic 1" or any AR agent

### 3. Click Bank QR Face

- The AR Cube should appear
- Click on the **"bank_qr"** face (Revolut Bank QR)

### 4. Test Internal Payment

The modal should show:

- ✅ Revolut Pay header with gradient
- ✅ QR code (clickable)
- ✅ **"Pay Now (Mock)"** button (bright blue gradient)
- ✅ Copy Payment Link button
- ✅ Instructions mentioning "Click 'Pay Now' for instant payment"
- ✅ Status: "Waiting for payment..."
- ✅ Timer: "5:00" (5 minutes)

---

## ✅ Test Scenarios

### Test 1: Pay Now Button Click

**Steps:**

1. Open Bank QR modal
2. Click the **"Pay Now (Mock)"** button
3. Observe button state change to "Processing Payment..." with spinner
4. Wait ~1.5 seconds

**Expected Results:**

- ✅ Button shows spinner and "Processing Payment..."
- ✅ After 1.5s, success alert appears:

  ```
  🎉 Payment Completed!

  Order ID: revolut_[timestamp]
  Status: COMPLETED

  Transaction completed successfully!
  ```

- ✅ Click OK on alert
- ✅ Modal status updates to "Payment successful!"
- ✅ Green checkmark (✓) appears
- ✅ "Continue ✓" button appears
- ✅ Click "Continue ✓" to close modal

**Console Logs to Verify:**

```
🎭 Mock mode: Triggering internal payment simulation...
💳 Processing internal payment for order: revolut_[timestamp]...
🎭 Simulating payment completion for order: revolut_[timestamp]
✅ [MOCK] Payment completed for order revolut_[timestamp]
✅ Payment completed successfully: {success: true, ...}
```

---

### Test 2: QR Code Click (Mock Mode)

**Steps:**

1. Open Bank QR modal
2. Click directly on the **QR code** (not the button)
3. Observe same behavior as Test 1

**Expected Results:**

- ✅ Same as Test 1 (internal payment simulation)
- ✅ QR click triggers `handlePayNow()` in mock mode

**Console Logs:**

```
🔥 Revolut QR Code clicked!
🎭 Mock mode: Triggering internal payment simulation...
💳 Processing internal payment for order: revolut_[timestamp]...
```

---

### Test 3: Copy Payment Link

**Steps:**

1. Open Bank QR modal
2. Click **"Copy Payment Link"** button
3. Check button text changes to "Link Copied!" with green background
4. Paste clipboard content

**Expected Results:**

- ✅ Button text: "📋 Copy Payment Link" → "✓ Link Copied!"
- ✅ Button color: Blue → Green
- ✅ Clipboard contains: `https://revolut.me/pay/revolut_[timestamp]`
- ✅ After 2 seconds, button returns to original state

---

### Test 4: Cancel Payment

**Steps:**

1. Open Bank QR modal
2. Click **"Cancel Payment"** button
3. Observe modal close

**Expected Results:**

- ✅ Modal closes smoothly (fade out animation)
- ✅ Returns to AR Cube view
- ✅ Console log: `🧪 [MOCK] Canceling Revolut Bank order...`

---

### Test 5: Payment Timeout

**Steps:**

1. Open Bank QR modal
2. Wait for timer to count down
3. Observe behavior at 0:00

**Expected Results:**

- ✅ Timer counts down from 5:00 to 0:00
- ✅ At 0:00, order is automatically canceled
- ✅ Status changes to "Payment cancelled"
- ✅ Red X (✗) appears
- ✅ "Close" button appears

**Note:** This test takes 5 minutes - skip if testing quickly

---

### Test 6: Multiple Payment Attempts

**Steps:**

1. Open Bank QR modal
2. Click "Pay Now"
3. Complete payment
4. Click "Continue"
5. Open Bank QR modal again
6. Start new payment

**Expected Results:**

- ✅ New order created with new ID
- ✅ New QR code displayed
- ✅ Timer resets to 5:00
- ✅ Can complete second payment successfully

---

### Test 7: UI Responsiveness

**Steps:**

1. Open Bank QR modal
2. Rapidly click "Pay Now" multiple times
3. Observe button behavior

**Expected Results:**

- ✅ Button disables after first click
- ✅ Multiple clicks don't trigger multiple payments
- ✅ Spinner shows during processing
- ✅ Button re-enables after completion/error

---

### Test 8: Visual Inspection

**Checklist:**

- [ ] Modal has glassmorphism effect (frosted glass)
- [ ] Revolut brand gradient (blue → cyan) at top
- [ ] Revolut logo (R) in gradient circle
- [ ] QR code is centered and clear
- [ ] QR code has hover effect (glow)
- [ ] "Pay Now" button is prominent and gradient
- [ ] Instructions are clear and readable
- [ ] Status indicator has correct colors:
  - Pending: Blue with spinner
  - Processing: Blue with spinner
  - Completed: Green with checkmark
  - Failed: Red with X
- [ ] Timer is monospace font (0:00 format)
- [ ] All text is legible
- [ ] Buttons have hover effects

---

## 🎨 Expected UI States

### Initial State

```
┌─────────────────────────────────┐
│ [R] Revolut Pay          [×]    │
│ EUR 10.00                        │
├─────────────────────────────────┤
│                                  │
│         ╔════════╗              │
│         ║ QR CODE║              │
│         ║  IMAGE ║              │
│         ╚════════╝              │
│                                  │
│   [📋 Copy Payment Link]        │
│                                  │
├─────────────────────────────────┤
│   Quick Payment Options          │
│   💳 Click 'Pay Now'...         │
│   🖱️ Click QR for simulation    │
│   📱 Scan with phone camera      │
│   🔗 Copy and share link         │
├─────────────────────────────────┤
│  [💳 Pay Now (Mock)]            │
│  🎭 Testing mode...             │
├─────────────────────────────────┤
│ Status: Waiting...      5:00    │
│ [    Cancel Payment    ]        │
└─────────────────────────────────┘
```

### Processing State

```
┌─────────────────────────────────┐
│ [R] Revolut Pay          [×]    │
│ EUR 10.00                        │
├─────────────────────────────────┤
│         ╔════════╗              │
│         ║ QR CODE║              │
│         ╚════════╝              │
│   [📋 Copy Payment Link]        │
├─────────────────────────────────┤
│  [⟳ Processing Payment...]      │
│  🎭 Testing mode...             │
├─────────────────────────────────┤
│ ⟳ Processing payment... 4:58    │
│ [    Cancel Payment    ]        │
└─────────────────────────────────┘
```

### Success State

```
┌─────────────────────────────────┐
│ [R] Revolut Pay          [×]    │
│ EUR 10.00                        │
├─────────────────────────────────┤
│         ╔════════╗              │
│         ║ QR CODE║              │
│         ╚════════╝              │
│   [✓ Link Copied!]              │
├─────────────────────────────────┤
│ ✓ Payment successful!           │
│ [      Continue ✓      ]        │
└─────────────────────────────────┘
```

---

## 🐛 Troubleshooting

### Issue: "Pay Now" button not visible

**Solution:**

1. Check `.env.local`:
   ```bash
   VITE_USE_MOCK_BANK=true  # ← Must be "true"
   ```
2. Restart Vite server:

   ```bash
   # Kill existing server
   lsof -ti:5173 | xargs kill -9

   # Start fresh
   npm run dev
   ```

### Issue: Payment doesn't complete

**Check:**

1. Console logs for errors
2. Order ID is valid (not undefined)
3. `simulatePaymentCompletion()` is called
4. Network tab shows no failed requests

### Issue: Modal shows wrong instructions

**Solution:**

1. Verify `VITE_USE_MOCK_BANK=true` in `.env.local`
2. Hard refresh browser (Ctrl+Shift+R)
3. Clear browser cache

### Issue: QR code doesn't appear

**Check:**

1. Order data has `payment_url` or `qr_code_url`
2. Console shows order creation success
3. `actualPaymentUrl` is not empty
4. React QRCode component is rendering

---

## 📊 Success Criteria

### ✅ All Tests Pass

- [ ] Test 1: Pay Now button works
- [ ] Test 2: QR code click works
- [ ] Test 3: Copy link works
- [ ] Test 4: Cancel payment works
- [ ] Test 5: Timeout works (optional)
- [ ] Test 6: Multiple payments work
- [ ] Test 7: UI responsive
- [ ] Test 8: Visual inspection passes

### ✅ Console Logs Clean

- No errors in console
- All logs show expected flow
- Mock mode indicators present

### ✅ UI Polish

- Smooth animations
- Correct colors and gradients
- Clear instructions
- Proper spacing and alignment

---

## 🎯 Comparison: Crypto QR vs Bank QR

| Feature              | Crypto QR              | Bank QR (Now)            |
| -------------------- | ---------------------- | ------------------------ |
| **Scannable QR**     | ✅ Yes                 | ✅ Yes                   |
| **Internal Payment** | ✅ Yes (MetaMask)      | ✅ Yes (Mock/Backend)    |
| **Click QR to Pay**  | ✅ Yes                 | ✅ Yes                   |
| **Payment Button**   | ✅ Implicit (QR click) | ✅ Explicit ("Pay Now")  |
| **Mock Mode**        | ✅ Yes                 | ✅ Yes                   |
| **Real Mode**        | ✅ Yes (On-chain)      | ✅ Yes (Revolut API)     |
| **Status Updates**   | ✅ Yes (Blockchain)    | ✅ Yes (Polling/Webhook) |

**Result:** ✅ Feature parity achieved!

---

## 📚 Next Steps After Testing

1. ✅ Confirm all tests pass
2. Commit changes to Git
3. Push to GitHub
4. Update documentation
5. Test in real mode (future)
6. Deploy to production (when backend ready)

---

## 🎉 Success Message

When all tests pass, you should see:

```
✅ Bank QR Internal Payment: WORKING
✅ Dual payment modes: WORKING
✅ Mock mode simulation: WORKING
✅ UI/UX polish: COMPLETE
✅ Feature parity with Crypto QR: ACHIEVED
```

---

**Ready to test?** Open http://localhost:5173/ and follow the test scenarios above! 🚀
