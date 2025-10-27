# Virtual Terminal Redirect Fix

## Problem

The "Place Order" button in e-shop and "Buy Now" flow in on/off ramp were navigating to local routes instead of redirecting to the AR Viewer's virtual terminal gateway.

## Solution

Updated both checkout implementations to use `window.location.href` to redirect to the AR Viewer running on localhost:5173.

## Changes Made

### 1. E-Shop Checkout (`eshop-sparkle-assets/src/pages/Checkout.tsx`)

**Before:**

```tsx
const handlePlaceOrder = () => {
  const orderId =
    "ORD-" + Math.random().toString(36).substr(2, 9).toUpperCase();
  navigate(
    `/virtual-terminal?order_id=${orderId}&amount=${total.toFixed(
      2
    )}&merchant=cubepay-merch`
  );
};
```

**After:**

```tsx
const handlePlaceOrder = () => {
  // Generate order ID and redirect to AR Viewer virtual terminal
  const orderId =
    "ORD-" + Math.random().toString(36).substr(2, 9).toUpperCase();
  const returnUrl = encodeURIComponent(
    "http://localhost:5175/order-confirmation"
  );
  const merchantName = encodeURIComponent("CubePay Merch");

  // Redirect to AR Viewer virtual terminal with payment details
  window.location.href = `http://localhost:5173/virtual-terminal?orderId=${orderId}&amount=${total.toFixed(
    2
  )}&merchant=${merchantName}&currency=USD&returnUrl=${returnUrl}&type=eshop`;
};
```

### 2. On/Off Ramp Checkout (`onofframp-cube-paygate/src/pages/Checkout.tsx`)

**Before:**

```tsx
const handleRedirectToPayment = () => {
  navigate("/confirmation", {
    state: {
      orderId: order?.id,
      success: true,
    },
  });
};

const handleSimulatePayment = () => {
  setRedirecting(true);
  setTimeout(() => {
    navigate("/confirmation", {
      state: {
        orderId: order?.id,
        success: true,
      },
    });
  }, 1500);
};
```

**After:**

```tsx
const handleRedirectToPayment = () => {
  // Redirect to AR Viewer virtual terminal with payment details
  const returnUrl = encodeURIComponent("http://localhost:5176/confirmation");
  const merchantName = encodeURIComponent("CubePay Exchange");
  const cryptoType = order?.crypto || "BTC";
  const cryptoAmount = order?.cryptoAmount || 0;

  // Build URL with all payment parameters
  window.location.href = `http://localhost:5173/virtual-terminal?orderId=${
    order?.id
  }&amount=${order?.usdAmount.toFixed(
    2
  )}&merchant=${merchantName}&currency=USD&returnUrl=${returnUrl}&type=onofframp&crypto=${cryptoType}&quantity=${cryptoAmount}`;
};

const handleSimulatePayment = () => {
  setRedirecting(true);
  // Redirect to AR Viewer virtual terminal immediately
  handleRedirectToPayment();
};
```

## Key Changes

1. **Changed from React Router `navigate()` to `window.location.href`**

   - This performs a full page redirect across different ports/applications
   - React Router's navigate only works within the same app

2. **Added proper URL encoding**

   - Merchant names and return URLs are now properly encoded
   - Prevents issues with special characters and spaces

3. **Included all required parameters**

   - E-shop: `orderId`, `amount`, `merchant`, `currency`, `returnUrl`, `type`
   - On/off ramp: All above + `crypto`, `quantity`

4. **Correct return URLs**
   - E-shop returns to: `http://localhost:5175/order-confirmation`
   - On/off ramp returns to: `http://localhost:5176/confirmation`

## Testing

### E-Shop Flow:

1. Go to http://localhost:5175/shop
2. Add items to cart
3. Go to checkout: http://localhost:5175/checkout
4. Fill in shipping and payment info
5. Click "Place Order"
6. **Should redirect to AR Viewer virtual terminal gateway**
7. After 2 seconds, should redirect to AR view with payment terminals filtered

### On/Off Ramp Flow:

1. Go to http://localhost:5176/buy
2. Select crypto to purchase
3. Go to checkout
4. **Should automatically redirect to AR Viewer virtual terminal gateway**
5. After 2 seconds, should redirect to AR view with payment terminals filtered

## Status

✅ E-shop "Place Order" button now redirects correctly
✅ On/off ramp checkout flow now redirects correctly
✅ All URL parameters properly formatted and encoded
✅ Return URLs configured for success callbacks

## Next Steps (Phase 2)

- AR3DScene needs to accept paymentContext prop
- CubePaymentEngine needs to trigger payment on terminal tap
- Implement success redirect back to origin website
