import React, { useState, useEffect } from 'react';
import { CreditCard, ArrowLeft, ExternalLink, Check, Loader } from 'lucide-react';
import { generateSessionToken, buildOnrampUrl, openOnrampPopup, waitForPopupClose } from '../services/onrampService';

/**
 * OnrampPurchaseFlow - Integrates with Coinbase Onramp for USDC purchase
 * Opens Coinbase Pay sandbox in iframe/popup for testnet purchases
 */
const OnrampPurchaseFlow = ({ 
  amount, 
  token, 
  recipientAddress, 
  agentAddress,
  onComplete, 
  onBack 
}) => {
  const [step, setStep] = useState('preparing'); // 'preparing', 'ready', 'purchasing', 'confirming', 'complete'
  const [sessionToken, setSessionToken] = useState(null);
  const [onrampUrl, setOnrampUrl] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    prepareOnramp();
  }, []);

  // Prepare onramp session (calls backend API)
  const prepareOnramp = async () => {
    try {
      console.log('🚀 Preparing Coinbase Onramp session...');
      console.log('📍 Recipient Address:', recipientAddress);
      console.log('💰 Amount:', amount, token);
      
      // Generate session token via backend API
      const sessionData = await generateSessionToken({
        addresses: [{
          address: recipientAddress,
          blockchains: ['base']
        }],
        assets: [token],
        amount
      });

      setSessionToken(sessionData.token);

      // Build onramp URL
      const url = buildOnrampUrl({
        sessionToken: sessionData.token,
        asset: token,
        amount,
        network: 'base',
        testnet: true // Using sandbox for testing
      });
      
      setOnrampUrl(url);
      setStep('ready');
    } catch (err) {
      console.error('Failed to prepare onramp:', err);
      setError(err.message || 'Failed to initialize payment. Please try again.');
      setStep('ready');
    }
  };

  // Open Coinbase Pay in new window
  const handleStartPurchase = async () => {
    try {
      setStep('purchasing');
      
      // Open Coinbase Pay popup
      const popup = openOnrampPopup(onrampUrl);

      // Wait for user to complete purchase and close popup
      await waitForPopupClose(popup);
      
      setStep('confirming');
      simulateConfirmation();
    } catch (err) {
      console.error('Purchase failed:', err);
      setError(err.message || 'Failed to open payment window');
      setStep('ready');
    }
  };

  // Simulate transaction confirmation
  const simulateConfirmation = async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockTransaction = {
      id: 'onramp_' + Date.now(),
      status: 'success',
      amount: amount,
      token: token,
      from: recipientAddress,
      to: agentAddress,
      network: 'base-sepolia',
      txHash: '0x' + Array.from({ length: 64 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('')
    };

    setStep('complete');
    
    setTimeout(() => {
      onComplete(mockTransaction);
    }, 2000);
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 rounded-2xl p-8 shadow-2xl border border-blue-500/30">
      {/* Back button */}
      {step === 'ready' && (
        <button
          onClick={onBack}
          className="flex items-center text-gray-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
      )}

      {step === 'preparing' && (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 mb-6">
            <Loader className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Preparing Payment
          </h2>
          <p className="text-gray-400">
            Setting up secure connection to Coinbase...
          </p>
        </div>
      )}

      {step === 'ready' && (
        <div>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 mb-4">
              <CreditCard className="w-8 h-8 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Buy USDC with Card
            </h2>
            <p className="text-gray-400">
              Purchase crypto instantly via Coinbase
            </p>
          </div>

          {/* Purchase details */}
          <div className="bg-gray-800/50 rounded-xl p-6 mb-6 space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Amount to Buy</span>
              <span className="text-white font-semibold">{amount} {token}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Network</span>
              <span className="text-white font-semibold">Base Sepolia (Testnet)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Estimated Cost</span>
              <span className="text-white font-semibold">~${amount} USD</span>
            </div>
            <div className="border-t border-gray-700 pt-4">
              <div className="text-xs text-gray-500 mb-2">Recipient Wallet</div>
              <div className="font-mono text-xs text-blue-400 break-all bg-gray-900/50 p-2 rounded">
                {recipientAddress}
              </div>
            </div>
          </div>

          {/* Test card info */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">🧪</div>
              <div>
                <div className="font-semibold text-blue-400 mb-1">Testnet Mode</div>
                <div className="text-sm text-gray-400 mb-2">
                  Use this test card for sandbox purchases:
                </div>
                <div className="bg-gray-900/50 p-3 rounded font-mono text-xs space-y-1">
                  <div className="text-gray-300"><span className="text-gray-500">Card:</span> 4242 4242 4242 4242</div>
                  <div className="text-gray-300"><span className="text-gray-500">Exp:</span> 12/31 | <span className="text-gray-500">CVC:</span> 123</div>
                  <div className="text-gray-300"><span className="text-gray-500">Code:</span> 000000</div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 text-red-400">
              {error}
            </div>
          )}

          {/* Purchase button */}
          <button
            onClick={handleStartPurchase}
            disabled={!onrampUrl}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl p-4 font-semibold transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
          >
            <span>Open Coinbase Pay</span>
            <ExternalLink className="w-5 h-5" />
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            🔒 Powered by Coinbase • Secure payment processing
          </p>
        </div>
      )}

      {step === 'purchasing' && (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 mb-6 animate-pulse">
            <CreditCard className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Complete Purchase
          </h2>
          <p className="text-gray-400 mb-6">
            Follow the steps in the Coinbase window
          </p>
          <div className="bg-gray-800/50 rounded-xl p-4 text-sm text-gray-400">
            Once you've completed the purchase, close the Coinbase window to continue
          </div>
        </div>
      )}

      {step === 'confirming' && (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 mb-6">
            <Loader className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Confirming Transaction
          </h2>
          <p className="text-gray-400">
            Verifying your USDC purchase on Base network...
          </p>
        </div>
      )}

      {step === 'complete' && (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-6">
            <Check className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            USDC Received! 🎉
          </h2>
          <p className="text-gray-400 mb-6">
            {amount} {token} is now in your wallet
          </p>
          <div className="flex items-center justify-center text-blue-400 text-sm">
            <Loader className="w-5 h-5 mr-2 animate-spin" />
            Preparing to send to agent...
          </div>
        </div>
      )}
    </div>
  );
};

export default OnrampPurchaseFlow;
