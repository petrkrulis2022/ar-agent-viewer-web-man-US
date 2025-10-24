import React, { useState } from "react";
import CryptoOnboardingModal from "../components/CryptoOnboardingModal";

/**
 * Test page for Crypto Onboarding flow
 * Simulates the payment flow from AR viewer
 */
const TestCryptoOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);

  // Mock agent data
  const mockAgent = {
    name: "Test AI Agent",
    fee: 3.0,
    token: "USDC",
    walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    network: "base-sepolia",
  };

  const handlePaymentComplete = (result) => {
    console.log("✅ Payment completed:", result);
    setPaymentResult(result);
    setShowOnboarding(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            🧪 Crypto Onboarding Test
          </h1>
          <p className="text-gray-400">
            Test the complete fiat-to-crypto payment flow
          </p>
        </div>

        {/* Agent Card */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 mb-8 border border-gray-700">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {mockAgent.name}
              </h2>
              <p className="text-gray-400">Deployed on {mockAgent.network}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Interaction Fee</div>
              <div className="text-3xl font-bold text-blue-400">
                {mockAgent.fee} {mockAgent.token}
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-xl p-4 mb-6">
            <div className="text-xs text-gray-500 mb-2">Agent Wallet</div>
            <div className="font-mono text-sm text-gray-300 break-all">
              {mockAgent.walletAddress}
            </div>
          </div>

          {/* Pay Button */}
          <button
            onClick={() => setShowOnboarding(true)}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl p-4 font-semibold transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-blue-500/50"
          >
            💳 Pay with Virtual Card
          </button>
        </div>

        {/* Backend Status */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">
            Backend API Status
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">API Server</span>
              <span className="text-green-400">✅ Running on :3001</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">CDP Credentials</span>
              <span className="text-yellow-400">⚠️ Mock Mode (Dev)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Environment</span>
              <span className="text-blue-400">🧪 Sandbox</span>
            </div>
          </div>
        </div>

        {/* Test Instructions */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-400 mb-3">
            📝 Test Instructions
          </h3>
          <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
            <li>Click "Pay with Virtual Card" button above</li>
            <li>In the modal, click "Buy Crypto with Card"</li>
            <li>Watch the Base wallet creation animation</li>
            <li>Review purchase details (3 USDC)</li>
            <li>Click "Open Coinbase Pay" to launch sandbox</li>
            <li>
              Use test card:{" "}
              <code className="bg-gray-900 px-2 py-1 rounded">
                4242 4242 4242 4242
              </code>
            </li>
            <li>Complete the purchase and close the popup</li>
            <li>Watch the confirmation and agent payment flow</li>
          </ol>
        </div>

        {/* Payment Result */}
        {paymentResult && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-green-400 mb-3">
              ✅ Payment Successful!
            </h3>
            <div className="bg-gray-900/50 rounded-lg p-4">
              <pre className="text-xs text-gray-300 overflow-auto">
                {JSON.stringify(paymentResult, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-gray-800/50 rounded-xl p-6 text-center">
          <p className="text-sm text-gray-400 mb-2">
            This is a complete simulation of the crypto onboarding flow
          </p>
          <p className="text-xs text-gray-500">
            Backend running in development mode with mock session tokens
          </p>
        </div>
      </div>

      {/* Crypto Onboarding Modal */}
      <CryptoOnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        agentFee={mockAgent.fee}
        agentToken={mockAgent.token}
        agentName={mockAgent.name}
        agentAddress={mockAgent.walletAddress}
        onPaymentComplete={handlePaymentComplete}
      />
    </div>
  );
};

export default TestCryptoOnboarding;
