// src/components/RevolutBankQRModal.jsx
import React, { useEffect, useState, useCallback } from "react";
import QRCode from "react-qr-code";
import { usePaymentStatus } from "../hooks/usePaymentStatus";
import { cancelRevolutOrder } from "../services/revolutBankService";

const RevolutBankQRModal = ({
  isOpen = false, // Add isOpen prop
  paymentUrl,
  orderId,
  orderDetails,
  onClose,
  onPaymentComplete,
  onPaymentFailed,
  orderData, // Alternative prop name
  agentData, // Alternative prop name
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes countdown
  const [showFullUrl, setShowFullUrl] = useState(false);

  // Support both prop patterns
  const actualOrderId = orderId || orderData?.id || orderData?.order_id;
  const actualPaymentUrl =
    paymentUrl || orderData?.payment_url || orderData?.qr_code_url;
  const actualOrderDetails = orderDetails || orderData;

  // ✅ Define handler functions using useCallback BEFORE they're used in hooks
  const handlePaymentSuccess = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onPaymentComplete &&
        onPaymentComplete({
          status: "completed",
          orderId: actualOrderId,
          orderDetails: actualOrderDetails,
        });
    }, 500);
  }, [actualOrderId, actualOrderDetails, onPaymentComplete]);

  const handlePaymentFailure = useCallback(
    (status) => {
      setIsClosing(true);
      setTimeout(() => {
        onPaymentFailed &&
          onPaymentFailed({
            status,
            orderId: actualOrderId,
            orderDetails: actualOrderDetails,
            error: `Payment ${status}`,
          });
      }, 500);
    },
    [actualOrderId, actualOrderDetails, onPaymentFailed]
  );

  const handleTimeout = useCallback(async () => {
    try {
      await cancelRevolutOrder(actualOrderId);
      handlePaymentFailure("timeout");
    } catch (error) {
      console.error("Error canceling expired order:", error);
      handlePaymentFailure("timeout");
    }
  }, [actualOrderId, handlePaymentFailure]);

  // ✅ CRITICAL: Call ALL hooks BEFORE any conditional returns (Rules of Hooks)
  // Use payment status hook for real-time updates
  const { paymentStatus, isLoading, error } = usePaymentStatus(
    actualOrderId,
    (status) => {
      if (status === "completed") {
        handlePaymentSuccess();
      } else if (status === "failed" || status === "cancelled") {
        handlePaymentFailure(status);
      }
    }
  );

  // Countdown timer - must be called before conditional return
  useEffect(() => {
    if (!isOpen || timeLeft <= 0) {
      if (timeLeft <= 0) {
        handleTimeout();
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isOpen, handleTimeout]);

  // Don't render if not open (AFTER all hooks are called)
  if (!isOpen) return null;

  // QR Code click handler - opens payment in-app (like crypto QR)
  const handleQRClick = () => {
    console.log("🔥 Revolut QR Code clicked! Opening payment URL...");

    if (actualPaymentUrl) {
      try {
        // Open payment URL in new window/tab for in-app payment
        window.open(actualPaymentUrl, "_blank", "noopener,noreferrer");
        console.log("✅ Payment URL opened:", actualPaymentUrl);

        // Optional: Show user feedback
        // You could add a toast notification here
      } catch (error) {
        console.error("❌ Error opening payment URL:", error);
        alert(
          "Failed to open payment link. Please try scanning the QR code instead."
        );
      }
    } else {
      console.warn("⚠️ No payment URL available");
      alert("Payment URL not available yet. Please wait...");
    }
  };

  // Additional handler functions
  const handleClose = async () => {
    setIsClosing(true);

    if (paymentStatus === "pending" || paymentStatus === "processing") {
      try {
        await cancelRevolutOrder(actualOrderId);
      } catch (error) {
        console.error("Error canceling order on close:", error);
      }
    }

    setTimeout(() => {
      onClose && onClose();
    }, 300);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case "pending":
        return "Waiting for payment...";
      case "processing":
        return "Processing payment...";
      case "completed":
        return "Payment successful!";
      case "failed":
        return "Payment failed";
      case "cancelled":
        return "Payment cancelled";
      default:
        return "Checking payment status...";
    }
  };

  const getStatusColor = () => {
    switch (paymentStatus) {
      case "completed":
        return "text-green-600";
      case "failed":
      case "cancelled":
        return "text-red-600";
      case "processing":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
    >
      <div
        className={`bg-white rounded-lg p-6 max-w-md w-full mx-4 transform transition-transform duration-300 ${
          isClosing ? "scale-95" : "scale-100"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Revolut Bank Payment
            </h2>
            <p className="text-sm text-gray-500">
              {actualOrderDetails?.currency}{" "}
              {actualOrderDetails?.amount?.toFixed(2)}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
            aria-label="Close"
            disabled={isClosing}
          >
            ×
          </button>
        </div>

        {/* QR Code */}
        <div className="flex justify-center mb-6">
          <div
            onClick={handleQRClick}
            className="bg-white p-4 rounded-lg shadow-sm border-2 border-gray-100 cursor-pointer hover:border-blue-400 hover:shadow-md transition-all duration-200"
            title="Click to open payment in browser"
          >
            {actualPaymentUrl && actualPaymentUrl.length > 0 ? (
              <QRCode
                value={actualPaymentUrl}
                size={200}
                style={{
                  height: "auto",
                  maxWidth: "100%",
                  width: "100%",
                  display: "block",
                }}
              />
            ) : (
              <div
                className="flex items-center justify-center text-gray-500"
                style={{ width: "200px", height: "200px" }}
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">⏳</div>
                  <div className="text-sm">Generating QR Code...</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="text-center mb-6">
          <p className="text-gray-700 mb-2 font-medium">
            Click QR code to pay or scan with your phone
          </p>
          <p className="text-sm text-gray-500">
            Click the QR code above to open payment in your browser, or scan it
            with your phone's camera or Revolut app.
          </p>
        </div>

        {/* Payment URL (expandable) */}
        <div className="mb-6">
          <button
            onClick={() => setShowFullUrl(!showFullUrl)}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            {showFullUrl ? "Hide" : "Show"} payment link
          </button>
          {showFullUrl && (
            <div className="mt-2 p-3 bg-gray-50 rounded text-xs font-mono break-all">
              {actualPaymentUrl}
            </div>
          )}
        </div>

        {/* Status and Timer */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center space-x-2">
              {(paymentStatus === "pending" ||
                paymentStatus === "processing") && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              )}
              {paymentStatus === "completed" && (
                <div className="text-green-500">✓</div>
              )}
              {(paymentStatus === "failed" ||
                paymentStatus === "cancelled") && (
                <div className="text-red-500">✗</div>
              )}
              <span className={`text-sm font-medium ${getStatusColor()}`}>
                {getStatusMessage()}
              </span>
            </div>

            {(paymentStatus === "pending" ||
              paymentStatus === "processing") && (
              <div className="text-sm text-gray-500">
                {formatTime(timeLeft)}
              </div>
            )}
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              Error: {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 mt-4">
            {paymentStatus === "completed" && (
              <button
                onClick={() => handlePaymentSuccess()}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Continue
              </button>
            )}

            {(paymentStatus === "failed" ||
              paymentStatus === "cancelled" ||
              error) && (
              <button
                onClick={handleClose}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            )}

            {(paymentStatus === "pending" ||
              paymentStatus === "processing") && (
              <button
                onClick={handleClose}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                disabled={isClosing}
              >
                Cancel Payment
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevolutBankQRModal;
