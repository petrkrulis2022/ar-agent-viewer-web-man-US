// src/components/RevolutPaymentModal/RevolutMobileModal.jsx
import React, { useState, useEffect } from "react";
import "./RevolutMobileModal.css";

export function RevolutMobileModal({
  merchantName,
  amount,
  currency,
  onConfirm,
  onCancel,
}) {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      onCancel();
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
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleConfirm = async () => {
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setShowSuccess(true);
  };

  const handleSuccessDone = () => {
    onConfirm();
  };

  const handleReject = () => {
    onCancel();
  };

  // Success Modal
  if (showSuccess) {
    return (
      <div className="revolut-modal-overlay mobile">
        <div className="revolut-success-modal-mobile">
          <div className="success-revolut-logo-mobile">Revolut</div>
          <div className="success-icon-mobile">
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
          <h2 className="success-title-mobile">Payment successful</h2>
          <div className="cubepay-success-badge-mobile">
            <span className="secured-text-success-mobile">Secured by</span>
            <span className="cubepay-logo-success-mobile">CUBEPAY GATE</span>
          </div>
          <button
            className="success-done-button-mobile"
            onClick={handleSuccessDone}
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="revolut-modal-overlay mobile">
      <div className="revolut-mobile-modal">
        {/* Header */}
        <div className="mobile-header">
          <button className="reject-button" onClick={handleReject}>
            Reject
          </button>
          <div className="mobile-branding">
            <div className="revolut-logo-mobile">Revolut</div>
            <div className="cubepay-badge-mobile">
              <span className="secured-text">Secured by</span>
              <span className="cubepay-logo">CUBEPAY GATE</span>
            </div>
          </div>
        </div>

        {/* Timer Circle */}
        <div className="timer-section-mobile">
          <div className="timer-circle-mobile">
            <svg width="160" height="160" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="#E5E5E5"
                strokeWidth="6"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="#0075EB"
                strokeWidth="6"
                strokeDasharray={`${(timeLeft / 300) * 440} 440`}
                strokeLinecap="round"
                transform="rotate(-90 80 80)"
                className="timer-progress"
              />
            </svg>
            <div className="timer-text-mobile">{formatTime(timeLeft)}</div>
          </div>
        </div>

        {/* Message */}
        <div className="payment-message-mobile">
          {isProcessing ? (
            <h2>Processing payment...</h2>
          ) : (
            <h2>Confirm your online payment</h2>
          )}
        </div>

        {/* Payment Card */}
        <div className="payment-card-mobile">
          <div className="card-icon">
            <svg width="48" height="48" viewBox="0 0 48 48">
              <rect x="8" y="16" width="32" height="24" rx="4" fill="#E5E5E5" />
              <rect x="8" y="20" width="32" height="6" fill="#999" />
            </svg>
          </div>
          <div className="card-details">
            <div className="merchant-name-mobile">{merchantName}</div>
            <div className="timestamp-mobile">
              {new Date().toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
          <div className="amount-mobile">
            - {amount.toFixed(2)} {currency.toLowerCase()}
          </div>
        </div>

        {/* Confirm Button */}
        {!isProcessing && (
          <button className="confirm-button-mobile" onClick={handleConfirm}>
            Confirm
          </button>
        )}

        {isProcessing && (
          <div className="processing-indicator-mobile">
            <div className="spinner-mobile"></div>
          </div>
        )}
      </div>
    </div>
  );
}
