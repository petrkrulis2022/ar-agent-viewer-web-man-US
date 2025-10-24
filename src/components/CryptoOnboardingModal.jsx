import React, { useState } from 'react';
import { X, Wallet, CreditCard, Sparkles, ArrowRight } from 'lucide-react';
import BaseWalletCreationFlow from './BaseWalletCreationFlow';
import OnrampPurchaseFlow from './OnrampPurchaseFlow';

/**
 * CryptoOnboardingModal - Replaces Revolut confirmation screen
 * Guides users through crypto wallet creation and USDC purchase
 */
const CryptoOnboardingModal = ({ 
  isOpen, 
  onClose, 
  agentFee, 
  agentToken = 'USDC',
  agentName,
  agentAddress,
  onPaymentComplete 
}) => {
  const [step, setStep] = useState('onboarding'); // 'onboarding', 'wallet-creation', 'onramp', 'sending'
  const [userWallet, setUserWallet] = useState(null);

  if (!isOpen) return null;

  const handleBuyWithCard = () => {
    setStep('wallet-creation');
  };

  const handleWalletCreated = (walletAddress) => {
    setUserWallet(walletAddress);
    setStep('onramp');
  };

  const handleOnrampComplete = (transactionData) => {
    setStep('sending');
    // Proceed to send crypto to agent
    setTimeout(() => {
      onPaymentComplete({
        method: 'crypto-onramp',
        wallet: userWallet,
        amount: agentFee,
        token: agentToken,
        onrampTx: transactionData
      });
    }, 2000);
  };

  const handleConnectExisting = () => {
    // Trigger existing wallet connection flow
    console.log('Connect existing wallet');
    onClose();
    // This would trigger your existing Web3 connection
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg mx-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-800/80 hover:bg-gray-700 transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Content based on step */}
        {step === 'onboarding' && (
          <div className="bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 rounded-2xl p-8 shadow-2xl border border-blue-500/30">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 mb-4">
                <Sparkles className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                💎 This Agent Only Accepts Crypto
              </h2>
              <p className="text-gray-400">
                {agentName} requires payment in {agentToken} on Base network
              </p>
            </div>

            {/* Payment amount */}
            <div className="bg-blue-500/10 rounded-xl p-6 mb-6 border border-blue-500/20">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Agent Fee</span>
                <span className="text-2xl font-bold text-white">
                  {agentFee} {agentToken}
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                On Base Sepolia Network
              </div>
            </div>

            {/* Options */}
            <div className="space-y-4">
              <button
                onClick={handleBuyWithCard}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl p-6 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-blue-500/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white/20 rounded-lg">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-lg">Buy Crypto with Card</div>
                      <div className="text-sm text-blue-100">
                        Get a wallet & buy USDC instantly
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              <button
                onClick={handleConnectExisting}
                className="w-full group relative overflow-hidden bg-gray-800 hover:bg-gray-700 text-white rounded-xl p-6 transition-all duration-300 border border-gray-700 hover:border-blue-500/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gray-700 rounded-lg">
                      <Wallet className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-lg">Connect Existing Wallet</div>
                      <div className="text-sm text-gray-400">
                        I already have a crypto wallet
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>

            {/* Info */}
            <div className="mt-6 text-center text-sm text-gray-500">
              <p>🔒 Secure payment powered by Coinbase & Base</p>
            </div>
          </div>
        )}

        {step === 'wallet-creation' && (
          <BaseWalletCreationFlow
            onWalletCreated={handleWalletCreated}
            onBack={() => setStep('onboarding')}
          />
        )}

        {step === 'onramp' && (
          <OnrampPurchaseFlow
            amount={agentFee}
            token={agentToken}
            recipientAddress={userWallet}
            agentAddress={agentAddress}
            onComplete={handleOnrampComplete}
            onBack={() => setStep('wallet-creation')}
          />
        )}

        {step === 'sending' && (
          <div className="bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 rounded-2xl p-8 shadow-2xl border border-blue-500/30">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4 animate-pulse">
                <Sparkles className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Sending Payment to Agent
              </h2>
              <p className="text-gray-400 mb-6">
                Transferring {agentFee} {agentToken} to {agentName}...
              </p>
              <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-green-500 animate-pulse" style={{ width: '75%' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CryptoOnboardingModal;
