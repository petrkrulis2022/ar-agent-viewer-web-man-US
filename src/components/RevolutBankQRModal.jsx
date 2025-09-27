// src/components/RevolutBankQRModal.jsx
import React, { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { usePaymentStatus } from "../hooks/usePaymentStatus";
import { cancelRevolutOrder } from "../services/revolutBankService";

const RevolutBankQRModal = ({
  paymentUrl,
  orderId,
  orderDetails,
  onClose,
  onPaymentComplete,
  onPaymentFailed,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes countdown
  const [showFullUrl, setShowFullUrl] = useState(false);

  // Use payment status hook for real-time updates
  const { paymentStatus, isLoading, error } = usePaymentStatus(
    orderId,
    (status) => {
      if (status === "completed") {
        handlePaymentSuccess();
      } else if (status === "failed" || status === "cancelled") {
        handlePaymentFailure(status);
      }
    }
  );

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handlePaymentSuccess = () => {
    setIsClosing(true);
    setTimeout(() => {
      onPaymentComplete &&
        onPaymentComplete({
          status: "completed",
          orderId,
          orderDetails,
        });
    }, 500);
  };

  const handlePaymentFailure = (status) => {
    setIsClosing(true);
    setTimeout(() => {
      onPaymentFailed &&
        onPaymentFailed({
          status,
          orderId,
          orderDetails,
          error: error || `Payment ${status}`,
        });
    }, 500);
  };

  const handleTimeout = async () => {
    try {
      await cancelRevolutOrder(orderId);
      handlePaymentFailure("timeout");
    } catch (error) {
      console.error("Error canceling expired order:", error);
      handlePaymentFailure("timeout");
    }
  };

  const handleClose = async () => {
    setIsClosing(true);

    if (paymentStatus === "pending" || paymentStatus === "processing") {
      try {
        await cancelRevolutOrder(orderId);
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
              {orderDetails?.currency} {orderDetails?.amount?.toFixed(2)}
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
          <div className="bg-white p-4 rounded-lg shadow-sm border-2 border-gray-100">
            <QRCode
              value={paymentUrl}
              size={200}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="text-center mb-6">
          <p className="text-gray-700 mb-2 font-medium">
            Scan with your banking app
          </p>
          <p className="text-sm text-gray-500">
            Use your phone's camera or Revolut app to scan this QR code and
            complete the payment.
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
              {paymentUrl}
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
