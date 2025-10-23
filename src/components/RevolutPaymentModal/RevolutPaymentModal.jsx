// src/components/RevolutPaymentModal/RevolutPaymentModal.jsx
import React from "react";
import { RevolutDesktopModal } from "./RevolutDesktopModal";
import { RevolutMobileModal } from "./RevolutMobileModal";

/**
 * Revolut Payment Modal Wrapper
 *
 * Routes to correct modal based on payment method (not device detection)
 *
 * Usage:
 * - type='desktop' → Virtual Card payments (web 3D Secure style)
 * - type='mobile' → Bank QR payments (mobile app style)
 *
 * Example Integration:
 *
 * // When user taps Virtual Card face on AR Cube:
 * <RevolutPaymentModal
 *   type="desktop"
 *   merchantName={agent.name}
 *   amount={50.00}
 *   currency="USD"
 *   onConfirm={handlePaymentSuccess}
 *   onCancel={handlePaymentCancel}
 * />
 *
 * // When user taps Bank QR face on AR Cube:
 * <RevolutPaymentModal
 *   type="mobile"
 *   merchantName={agent.name}
 *   amount={50.00}
 *   currency="USD"
 *   onConfirm={handlePaymentSuccess}
 *   onCancel={handlePaymentCancel}
 * />
 */
export function RevolutPaymentModal({
  type = "desktop", // 'desktop' or 'mobile'
  merchantName,
  amount,
  currency = "USD",
  onConfirm,
  onCancel,
}) {
  if (type === "mobile") {
    return (
      <RevolutMobileModal
        merchantName={merchantName}
        amount={amount}
        currency={currency}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );
  }

  return (
    <RevolutDesktopModal
      merchantName={merchantName}
      amount={amount}
      currency={currency}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
