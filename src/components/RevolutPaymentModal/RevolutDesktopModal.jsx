// src/components/RevolutPaymentModal/RevolutDesktopModal.jsx
import React, { useState, useEffect } from "react";
import "./RevolutDesktopModal.css";

/**
 * Revolut Desktop Payment Modal
 *
 * Simulates Revolut web payment confirmation screen for Virtual Card payments
 * Shows countdown timer, merchant details, and manual confirm/cancel options
 *
 * 🔴 SIMULATION MODE - Replace with real Revolut API in Phase 3
 * TODO: Real Revolut Merchant API Integration
 * API: POST https://merchant.revolut.com/api/1.0/orders
 * DOCS: https://developer.revolut.com/docs/accept-payments
 * Required: REVOLUT_API_KEY, REVOLUT_MERCHANT_ID
 *
 * For cross-platform payments (fiat→crypto or crypto→fiat):
 * API: POST https://api.revolut.com/crypto/sell or /crypto/buy
 * DOCS: https://developer.revolut.com/docs/business/crypto
 * Required: REVOLUT_CRYPTO_API_KEY
 */
export function RevolutDesktopModal({
  merchantName,
  amount,
  currency,
  onConfirm,
  onCancel,
}) {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      onCancel(); // Auto-cancel if time runs out
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, onCancel]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleConfirm = async () => {
    setIsProcessing(true);

    console.log("💳 Processing Virtual Card payment...", {
      merchantName,
      amount,
      currency,
      timestamp: new Date().toISOString(),
    });

    // 🔴 SIMULATION - Simulate payment processing delay
    // TODO: Replace with real Revolut API call in Phase 3
    await new Promise((resolve) => setTimeout(resolve, 1500));

    /* REAL API CALL (Phase 3):
    try {
      const response = await fetch('https://merchant.revolut.com/api/1.0/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.REVOLUT_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Amount in cents
          currency: currency,
          merchant_order_ext_ref: generateOrderId(),
          description: `Payment to ${merchantName}`,
          customer_email: userEmail // Get from context
        })
      });
      
      const result = await response.json();
      
      if (result.state === 'COMPLETED') {
        console.log('✅ Real payment completed:', result.id);
        setShowSuccess(true);
      } else {
        throw new Error('Payment failed');
      }
    } catch (error) {
      console.error('❌ Payment error:', error);
      setIsProcessing(false);
      // Show error state
      return;
    }
    */

    console.log("✅ Simulated payment confirmed");
    setShowSuccess(true);
  };

  const handleSuccessDone = () => {
    onConfirm();
  };

  const handleCancel = () => {
    onCancel();
  };

  // Success Modal
  if (showSuccess) {
    return (
      <div className="revolut-modal-overlay">
        <div className="revolut-success-modal">
          <div className="success-revolut-logo">
            <svg width="140" height="50" viewBox="0 0 140 50">
              <text
                x="20"
                y="35"
                fill="#0075EB"
                fontSize="28"
                fontWeight="bold"
                fontFamily="Inter, -apple-system, sans-serif"
              >
                Revolut
              </text>
            </svg>
          </div>
          <div className="success-icon">
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle
                cx="40"
                cy="40"
                r="38"
                fill="none"
                stroke="#0075EB"
                strokeWidth="3"
              />
              <path
                d="M25 40 L35 50 L55 30"
                fill="none"
                stroke="#0075EB"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="success-title">Payment successful</h2>
          <div className="cubepay-success-badge">
            <span className="secured-text-success">Secured by</span>
            <span className="cubepay-logo-success">CUBEPAY GATE</span>
          </div>
          <button className="success-done-button" onClick={handleSuccessDone}>
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="revolut-modal-overlay">
      <div className="revolut-desktop-modal">
        {/* Header */}
        <div className="revolut-header">
          <div className="revolut-logo">
            <svg width="120" height="40" viewBox="0 0 120 40">
              <text
                x="10"
                y="28"
                fill="#0075EB"
                fontSize="24"
                fontWeight="bold"
                fontFamily="Inter, -apple-system, sans-serif"
              >
                Revolut
              </text>
            </svg>
          </div>
          <div className="cubepay-badge">
            <span className="secured-text">Secured by</span>
            <span className="cubepay-logo">CUBEPAY</span>
            <span className="gate-text">GATE</span>
          </div>
        </div>

        {/* Timer Circle */}
        <div className="timer-section">
          <div className="timer-circle">
            <svg width="200" height="200" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="#E5E5E5"
                strokeWidth="8"
              />
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="#0075EB"
                strokeWidth="8"
                strokeDasharray={`${(timeLeft / 300) * 565} 565`}
                strokeLinecap="round"
                transform="rotate(-90 100 100)"
                className="timer-progress"
              />
            </svg>
            <div className="timer-text">{formatTime(timeLeft)}</div>
          </div>
        </div>

        {/* Message */}
        <div className="payment-message">
          {isProcessing ? (
            <p>Processing payment...</p>
          ) : (
            <p>Check your Revolut App to authorize this payment</p>
          )}
        </div>

        {/* Payment Details */}
        <div className="payment-details">
          <div className="detail-row">
            <span className="detail-label">MERCHANT</span>
            <span className="detail-label">AMOUNT</span>
          </div>
          <div className="detail-row detail-values">
            <span className="merchant-name">{merchantName}</span>
            <span className="amount-value">
              {currency} {amount.toFixed(2)}
            </span>
          </div>
          <div className="detail-row detail-time">
            <span className="timestamp">
              Today,{" "}
              {new Date().toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        {!isProcessing && (
          <div className="action-buttons">
            <button className="confirm-payment-btn" onClick={handleConfirm}>
              Confirm Payment
            </button>
            <button className="cancel-payment" onClick={handleCancel}>
              Cancel payment
            </button>
          </div>
        )}

        {isProcessing && (
          <div className="processing-indicator">
            <div className="spinner"></div>
            <p>Processing payment...</p>
          </div>
        )}
      </div>
    </div>
  );
}
