# 🔧 Revolut Modal Hooks Error Fix

**Date:** October 15, 2025  
**Issue:** React Hooks Rules Violation  
**Status:** ✅ FIXED

---

## 🐛 The Problem

### Error Message

```
React has detected a change in the order of Hooks called by RevolutBankQRModal.
This will lead to bugs and errors if not fixed.

Previous render            Next render
------------------------------------------------------
1. useState                useState
2. useState                useState
3. useState                useState
4. undefined               useState  ❌
   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Uncaught Error: Rendered more hooks than during the previous render.
    at usePaymentStatus (usePaymentStatus.js:11:45)
    at RevolutBankQRModal (RevolutBankQRModal.jsx:32:47)
```

### Root Cause

**Violation of React's Rules of Hooks:**

The `usePaymentStatus` hook was being called **AFTER** a conditional return statement:

```javascript
// ❌ WRONG - Hook called after conditional return
const RevolutBankQRModal = ({ isOpen, ... }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [showFullUrl, setShowFullUrl] = useState(false);

  // Conditional return BEFORE hooks ❌
  if (!isOpen) return null;

  // Hook called conditionally ❌
  const { paymentStatus, isLoading, error } = usePaymentStatus(...);

  useEffect(() => { ... }, [timeLeft]); // Also conditional ❌
};
```

**Why This Breaks:**

- When `isOpen = false`: Component returns early, only 3 hooks called
- When `isOpen = true`: Component continues, 5+ hooks called
- React expects the **same number of hooks in the same order** on every render
- Conditional hook calls violate this rule

---

## ✅ The Solution

### Applied Fix

**Move ALL hooks BEFORE any conditional returns:**

```javascript
// ✅ CORRECT - All hooks before conditional return
const RevolutBankQRModal = ({ isOpen, ... }) => {
  // 1. All useState hooks
  const [isClosing, setIsClosing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [showFullUrl, setShowFullUrl] = useState(false);

  // 2. Calculate values
  const actualOrderId = orderId || orderData?.id || orderData?.order_id;
  const actualPaymentUrl = paymentUrl || orderData?.payment_url;
  const actualOrderDetails = orderDetails || orderData;

  // 3. Define handler functions with useCallback
  const handlePaymentSuccess = useCallback(() => { ... }, [deps]);
  const handlePaymentFailure = useCallback((status) => { ... }, [deps]);
  const handleTimeout = useCallback(async () => { ... }, [deps]);

  // 4. Use custom hooks
  const { paymentStatus, isLoading, error } = usePaymentStatus(
    actualOrderId,
    (status) => {
      if (status === "completed") handlePaymentSuccess();
      else if (status === "failed" || status === "cancelled") {
        handlePaymentFailure(status);
      }
    }
  );

  // 5. useEffect hooks
  useEffect(() => {
    if (!isOpen || timeLeft <= 0) {
      if (timeLeft <= 0) handleTimeout();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isOpen, handleTimeout]);

  // 6. NOW we can conditionally return (after all hooks)
  if (!isOpen) return null;

  // 7. Remaining functions and JSX
  const handleClose = async () => { ... };
  const formatTime = (seconds) => { ... };

  return <div>...</div>;
};
```

### Key Changes

1. **Moved `usePaymentStatus` hook** before the `if (!isOpen) return null` check
2. **Moved `useEffect` hook** before the conditional return
3. **Added `useCallback`** for handler functions to avoid recreating them on every render
4. **Updated `useEffect` dependency** to include `isOpen` guard
5. **Removed duplicate function definitions** that were after the conditional return

---

## 📋 Files Modified

### `/src/components/RevolutBankQRModal.jsx`

**Changes:**

1. Added `useCallback` import from React
2. Wrapped `handlePaymentSuccess`, `handlePaymentFailure`, `handleTimeout` in `useCallback`
3. Moved all hooks before `if (!isOpen) return null`
4. Added `handleTimeout` dependency to `useEffect`
5. Removed duplicate function definitions

**Lines Changed:**

- Line 2: Added `useCallback` to imports
- Lines 22-62: Moved handler functions before hooks (with `useCallback`)
- Lines 64-77: Kept hooks in correct order
- Line 92: Conditional return AFTER all hooks
- Lines 94+: Remaining helper functions and JSX

---

## 🎓 React Rules of Hooks

### The Two Rules

**Rule #1: Only Call Hooks at the Top Level**

- ❌ Don't call hooks inside loops, conditions, or nested functions
- ✅ Always call hooks at the top level of your component

**Rule #2: Only Call Hooks from React Functions**

- ✅ Call hooks from React function components
- ✅ Call hooks from custom hooks
- ❌ Don't call hooks from regular JavaScript functions

### Why These Rules Exist

React relies on the **order in which hooks are called** to preserve state between renders:

```javascript
// First render
useState(); // Hook 1 - state[0]
useState(); // Hook 2 - state[1]
useEffect(); // Hook 3 - effect[0]

// Next render (must be same order)
useState(); // Hook 1 - state[0] ✅
useState(); // Hook 2 - state[1] ✅
useEffect(); // Hook 3 - effect[0] ✅
```

If you call hooks conditionally, the order changes and React can't match state correctly:

```javascript
// First render (isOpen = false)
useState(); // Hook 1
useState(); // Hook 2
// Early return, no more hooks

// Second render (isOpen = true)
useState(); // Hook 1 ✅
useState(); // Hook 2 ✅
usePaymentStatus(); // Hook 3 ❌ React expects this to be Hook 3, but last render had no Hook 3!
```

---

## 🧪 Testing the Fix

### Before Fix

```
❌ Error: Rendered more hooks than during the previous render
❌ Modal doesn't open
❌ Console shows hook order violation
```

### After Fix

```
✅ No hook errors
✅ Modal opens correctly
✅ QR code displays
✅ Timer counts down
✅ Payment status tracking works
✅ All hooks called in consistent order
```

### Test Steps

1. **Open browser:** http://localhost:5173
2. **Click any agent**
3. **Click "Generate Payment"**
4. **Wait 1.5 seconds**
5. **Click "Bank QR" face**
6. **Verify modal opens** without errors
7. **Check browser console** - should be clear of hook errors

---

## 🔍 Debugging Tips

### Check Hook Order

Use React DevTools to inspect hook calls:

1. Open React DevTools
2. Select `RevolutBankQRModal` component
3. Look at "hooks" section
4. Verify all hooks are listed in consistent order

### Console Debugging

Add debug logs to verify hook execution:

```javascript
const RevolutBankQRModal = ({ isOpen, ... }) => {
  console.log('🔍 Render start, isOpen:', isOpen);

  const [isClosing] = useState(false);
  console.log('✅ Hook 1: isClosing state');

  const [timeLeft] = useState(300);
  console.log('✅ Hook 2: timeLeft state');

  const { paymentStatus } = usePaymentStatus(...);
  console.log('✅ Hook 3: usePaymentStatus');

  useEffect(() => { ... }, [deps]);
  console.log('✅ Hook 4: useEffect');

  if (!isOpen) {
    console.log('⏹️ Early return (after all hooks)');
    return null;
  }

  console.log('🎨 Rendering modal');
  return <div>...</div>;
};
```

### Common Mistakes to Avoid

**❌ Don't Do This:**

```javascript
// Hook after conditional
if (condition) return null;
const [state] = useState(); // ❌
```

**✅ Do This:**

```javascript
// All hooks first
const [state] = useState();
if (condition) return null; // ✅
```

**❌ Don't Do This:**

```javascript
// Hook inside condition
if (condition) {
  useEffect(() => { ... }); // ❌
}
```

**✅ Do This:**

```javascript
// Hook at top level, condition inside
useEffect(() => {
  if (condition) {
    // logic here
  }
}, [condition]); // ✅
```

---

## 📚 Related Documentation

- **React Docs:** [Rules of Hooks](https://react.dev/link/rules-of-hooks)
- **React Docs:** [useCallback Hook](https://react.dev/reference/react/useCallback)
- **React Docs:** [useEffect Hook](https://react.dev/reference/react/useEffect)

---

## ✅ Verification Checklist

After applying the fix, verify:

- [ ] No "Rendered more hooks" error in console
- [ ] No "order of Hooks" warning in console
- [ ] Modal opens when clicking Bank QR face
- [ ] QR code displays correctly
- [ ] Countdown timer works
- [ ] Payment status updates work
- [ ] Cancel button works
- [ ] Close (X) button works
- [ ] No errors in React DevTools
- [ ] Component renders consistently

---

## 🎉 Summary

**Problem:** Hooks called after conditional return (Rules of Hooks violation)  
**Solution:** Move all hooks before conditional return, use `useCallback` for functions  
**Result:** ✅ Modal works correctly, no hook errors, consistent rendering

**The fix ensures React can maintain proper state tracking across all renders by calling hooks in the same order every time, regardless of the `isOpen` prop value.**
