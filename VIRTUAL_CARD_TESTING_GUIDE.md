# Virtual Card Testing Guide

**Date:** October 17, 2025  
**Test Page:** http://localhost:5173/test-virtual-card.html  
**Mode:** Mock (VITE_USE_MOCK_CARD=true)

---

## 🎯 Quick Testing Steps

### 1. Initial Load Test

- [ ] Page loads without errors
- [ ] Configuration panel shows:
  - Environment: development
  - Mock Mode: ENABLED ✓ (green)
  - API URL: http://localhost:3001
  - Component Status: Loaded ✓ (green)
- [ ] Virtual Card component is visible below

### 2. Create Card Test

- [ ] Click "✨ Create Virtual Card" button
- [ ] Loading spinner appears (2 seconds in mock mode)
- [ ] Card appears with:
  - Revolut gradient background (blue #0075EB → cyan #00D4FF)
  - Golden chip in top left
  - Card number: •••• •••• •••• 1111 (masked)
  - Expiry: XX/XX (masked)
  - CVV: XXX (masked)
  - Balance: $50.00
  - Status: ✅ ACTIVE (top right)

### 3. Show/Hide Details Test

- [ ] Click "👁️ Show Details" button
- [ ] Full card number appears: 4111 1111 1111 1111
- [ ] Expiry appears: 12/25
- [ ] CVV appears: 123
- [ ] Button changes to "🙈 Hide Details"
- [ ] Click "🙈 Hide Details"
- [ ] All sensitive data is masked again

### 4. Copy Card Number Test

- [ ] Details must be visible first (click Show Details)
- [ ] Click "📋 Copy Number" button
- [ ] Browser alert appears: "Card number copied to clipboard!"
- [ ] Paste in a text editor: should be "4111111111111111" (no spaces)

### 5. Refresh Card Test

- [ ] Click "🔄 Refresh" button
- [ ] Brief loading state
- [ ] Card updates (in mock mode, data stays the same)
- [ ] No errors in console

### 6. Top Up Test

- [ ] In "💰 Top Up Card" section
- [ ] Enter amount: 25.00
- [ ] Click "💰 Add Funds" button
- [ ] Loading state shows "⏳ Processing..."
- [ ] Balance updates from $50.00 to $75.00
- [ ] Input field clears
- [ ] Success logged in Event Log (if visible)

### 7. Freeze Card Test

- [ ] Click "❄️ Freeze Card" button
- [ ] Card background changes to gray
- [ ] Large snowflake (❄️) overlay appears
- [ ] Status changes to "❄️ FROZEN"
- [ ] Button changes to "🔥 Unfreeze Card"
- [ ] Card appears slightly desaturated/grayed out

### 8. Unfreeze Card Test

- [ ] Click "🔥 Unfreeze Card" button
- [ ] Card returns to blue Revolut gradient
- [ ] Snowflake overlay disappears
- [ ] Status changes back to "✅ ACTIVE"
- [ ] Button changes back to "❄️ Freeze Card"

### 9. Payment Simulation Test

- [ ] Card must be ACTIVE (unfreeze if needed)
- [ ] In "🧪 Simulate Payment" section:
  - Enter amount: 10.00
  - Enter merchant: Amazon
- [ ] Click "🧪 Make Test Payment" button
- [ ] Loading state shows "⏳ Processing..."
- [ ] Card status briefly shows "💳 PAYING"
- [ ] Balance updates from $75.00 to $65.00 (deducted $10)
- [ ] Input fields clear
- [ ] Success logged in Event Log

### 10. Transaction History Test

- [ ] In "📊 Recent Transactions" section
- [ ] Click "📜 Load Transactions" button
- [ ] Transaction list appears showing:
  - Mock transaction 1: Amazon -$25.00 (red, negative)
  - Mock transaction 2: Top Up +$50.00 (green, positive)
  - Timestamps for each transaction
- [ ] Scroll through transactions (if more than fit)

### 11. Visual & Animation Tests

- [ ] Hover over card → shadow enhances, slight lift animation
- [ ] All buttons have hover effects (shadow, slight scale)
- [ ] Transitions are smooth (0.3s easing)
- [ ] Card gradient is visible and attractive
- [ ] Golden chip has gradient effect
- [ ] Status badges have proper background blur

### 12. Error Handling Tests

- [ ] **Invalid Top Up:**
  - Leave amount empty, click "Add Funds" → button disabled
  - Enter negative amount → button should prevent or show error
- [ ] **Invalid Payment:**
  - Leave merchant empty → button disabled
  - Leave amount empty → button disabled
  - Both filled → button enabled

### 13. Browser Console Check

- [ ] Open browser DevTools (F12)
- [ ] Check Console tab
- [ ] Should see logs like:
  - "💳 Creating virtual card: {agentId, amount, currency}"
  - "🧪 MOCK: Creating virtual card"
  - "✅ Virtual card created: {card data}"
- [ ] No red error messages
- [ ] No warnings about missing dependencies

### 14. Responsive Design Test

- [ ] Resize browser window to smaller width
- [ ] Card should remain centered and readable
- [ ] Buttons should wrap properly
- [ ] Text should not overflow
- [ ] Everything should be clickable on mobile size

### 15. Card Info Panel Test

- [ ] Scroll to bottom of card component
- [ ] Card info panel visible with:
  - Card ID: mock*card*[timestamp]
  - Created: [current date/time]
  - Currency: USD
- [ ] All text is readable and formatted correctly

---

## 🐛 Common Issues & Solutions

### Issue: Component doesn't load

**Solution:** Check browser console. Make sure:

- Development server is running (npm run dev)
- No import errors
- RevolutVirtualCard.jsx exists in src/components/

### Issue: Buttons are disabled

**Solution:**

- Make sure card is created first
- For freeze: Card must be ACTIVE or FROZEN
- For topup/payment: Enter valid amounts
- Card must be ACTIVE (not frozen) for payments

### Issue: Animations not smooth

**Solution:**

- Check browser performance
- Try in Chrome/Edge for best GPU acceleration
- Disable browser extensions that might interfere

### Issue: Mock data not showing

**Solution:**

- Check .env.local has VITE_USE_MOCK_CARD=true
- Restart dev server after env changes
- Check USE_MOCK constant in revolutCardService.js

---

## ✅ Success Criteria

All tests should pass with:

- ✅ No console errors
- ✅ All animations smooth and professional
- ✅ All button states working correctly
- ✅ Balance calculations accurate
- ✅ Visual design matches Revolut branding
- ✅ Component is responsive
- ✅ Mock mode working perfectly

---

## 📝 Test Results

**Tester:**  
**Date:**  
**Browser:** Chrome / Firefox / Edge / Safari  
**Screen Size:**

**Overall Result:** ☐ PASS ☐ FAIL

**Issues Found:**

1.
2.
3.

**Notes:**

---

## 🚀 Next Steps After Testing

If all tests pass:

1. ✅ Mark Phase 3.2 Mock Testing as complete
2. Push changes to GitHub
3. Move to Phase 2.3 (AR Cube Integration)
4. Then Phase 3.3 (Real API Testing)

If tests fail:

1. Document specific failures
2. Check browser console for errors
3. Review component code
4. Fix issues and re-test
