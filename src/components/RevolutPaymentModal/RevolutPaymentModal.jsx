// src/components/RevolutPaymentModal/RevolutPaymentModal.jsx
import React from "react";
import { RevolutDesktopModal } from "./RevolutDesktopModal";
import { RevolutMobileModal } from "./RevolutMobileModal";

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
