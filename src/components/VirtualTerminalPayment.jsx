import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

/**
 * Virtual Terminal Payment Gateway
 *
 * Handles payment redirections from E-shop and On/Off Ramp websites
 * Filters and displays only user's own Payment Terminal agents
 * Processes simulated Revolut card payments
 * Redirects back to originating website with success status
 */
const VirtualTerminalPayment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Extract payment parameters from URL
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");
  const merchantName = searchParams.get("merchant") || "CubePay";
  const currency = searchParams.get("currency") || "USD";
  const returnUrl = searchParams.get("returnUrl");
  const paymentType = searchParams.get("type") || "eshop"; // eshop | onofframp

  // Additional params for crypto
  const cryptoType = searchParams.get("crypto");
  const cryptoQuantity = searchParams.get("quantity");

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Validate required parameters
    if (!orderId || !amount || !returnUrl) {
      setError("Missing required payment parameters");
      console.error("❌ Missing parameters:", { orderId, amount, returnUrl });
      return;
    }

    console.log("🎯 Virtual Terminal Payment Initiated:", {
      orderId,
      amount,
      merchantName,
      currency,
      paymentType,
      cryptoType,
      cryptoQuantity,
      returnUrl,
    });

    // Store payment context in sessionStorage for AR Viewer to access
    sessionStorage.setItem(
      "pendingPayment",
      JSON.stringify({
        orderId,
        amount: parseFloat(amount),
        merchantName,
        currency,
        returnUrl,
        paymentType,
        cryptoType,
        cryptoQuantity,
        timestamp: new Date().toISOString(),
      })
    );

    // Set flag to filter agents
    sessionStorage.setItem("showOnlyTerminals", "true");

    // Redirect to AR View after brief delay
    const timer = setTimeout(() => {
      navigate("/ar-view");
    }, 2000);

    return () => clearTimeout(timer);
  }, [
    orderId,
    amount,
    merchantName,
    currency,
    returnUrl,
    paymentType,
    cryptoType,
    cryptoQuantity,
    navigate,
  ]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Payment Error</h2>
          <p className="text-red-300 mb-6">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-md w-full text-center">
        {/* Loading Spinner */}
        <div className="relative mb-6">
          <div className="w-20 h-20 mx-auto">
            <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-2">
          Redirecting to CubePay Virtual Terminal...
        </h2>

        {/* Description */}
        <p className="text-slate-300 mb-6">
          You will be redirected to your personal payment terminal
        </p>

        {/* Payment Details Card */}
        <div className="bg-white/5 rounded-lg p-4 mb-6 text-left">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-400 text-sm">Order ID:</span>
            <span className="text-white font-mono text-sm">{orderId}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-400 text-sm">Amount:</span>
            <span className="text-white font-bold text-lg">
              {currency} ${parseFloat(amount).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Merchant:</span>
            <span className="text-white text-sm">{merchantName}</span>
          </div>

          {paymentType === "onofframp" && cryptoType && (
            <>
              <div className="border-t border-white/10 my-3"></div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-400 text-sm">Crypto:</span>
                <span className="text-white font-bold">{cryptoType}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Quantity:</span>
                <span className="text-white">{cryptoQuantity}</span>
              </div>
            </>
          )}
        </div>

        {/* Footer Note */}
        <p className="text-xs text-slate-500">
          [This will redirect to AR Viewer virtual terminal in production]
        </p>
      </div>
    </div>
  );
};

export default VirtualTerminalPayment;
