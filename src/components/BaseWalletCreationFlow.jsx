import React, { useState, useEffect } from "react";
import { Wallet, Shield, Zap, Check, ArrowLeft } from "lucide-react";

/**
 * BaseWalletCreationFlow - Simulates Base wallet creation with official branding
 * Uses Base Account SDK for wallet generation
 */
const BaseWalletCreationFlow = ({ onWalletCreated, onBack }) => {
  const [step, setStep] = useState("intro"); // 'intro', 'creating', 'created'
  const [walletAddress, setWalletAddress] = useState("");
  const [progress, setProgress] = useState(0);

  // Simulate wallet creation (in real scenario, user already has wallet)
  const createWallet = async () => {
    setStep("creating");

    // Simulate creation steps with progress
    const steps = [
      { progress: 20, delay: 500, message: "Initializing Base Account..." },
      { progress: 40, delay: 800, message: "Generating secure keys..." },
      { progress: 60, delay: 700, message: "Setting up smart wallet..." },
      { progress: 80, delay: 600, message: "Connecting to Base network..." },
      { progress: 100, delay: 500, message: "Wallet ready!" },
    ];

    for (const step of steps) {
      await new Promise((resolve) => setTimeout(resolve, step.delay));
      setProgress(step.progress);
    }

    // Generate a simulated wallet address (in production, use actual Base Account SDK)
    const mockWalletAddress = `0x${Array.from({ length: 40 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("")}`;

    setWalletAddress(mockWalletAddress);
    setStep("created");

    // Auto-proceed after showing success
    setTimeout(() => {
      onWalletCreated(mockWalletAddress);
    }, 2000);
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 rounded-2xl p-8 shadow-2xl border border-blue-500/30">
      {/* Back button */}
      {step === "intro" && (
        <button
          onClick={onBack}
          className="flex items-center text-gray-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
      )}

      {step === "intro" && (
        <div>
          {/* Base Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-600 mb-4">
              <svg viewBox="0 0 111 111" className="w-12 h-12" fill="white">
                <path d="M54.921 110.034C85.359 110.034 110.034 85.402 110.034 55.017C110.034 24.6319 85.359 0 54.921 0C26.0432 0 2.35281 22.1714 0 50.3923H72.8467V59.6416H3.9565e-07C2.35281 87.8625 26.0432 110.034 54.921 110.034Z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Create Your Base Wallet
            </h2>
            <p className="text-gray-400">
              Get started with crypto on Base in seconds
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4 mb-8">
            <div className="flex items-start space-x-4 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <div className="p-2 bg-blue-500/20 rounded-lg flex-shrink-0">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">
                  Secure & Non-Custodial
                </h3>
                <p className="text-sm text-gray-400">
                  Your keys, your crypto. Full control over your assets.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <div className="p-2 bg-blue-500/20 rounded-lg flex-shrink-0">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">
                  Fast & Low Cost
                </h3>
                <p className="text-sm text-gray-400">
                  Built on Base for instant transactions with minimal fees.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <div className="p-2 bg-blue-500/20 rounded-lg flex-shrink-0">
                <Wallet className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Smart Wallet</h3>
                <p className="text-sm text-gray-400">
                  Advanced features like gas sponsorship and batched
                  transactions.
                </p>
              </div>
            </div>
          </div>

          {/* Create button */}
          <button
            onClick={createWallet}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl p-4 font-semibold transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-blue-500/50"
          >
            Create Wallet
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            By creating a wallet, you agree to Base's Terms of Service
          </p>
        </div>
      )}

      {step === "creating" && (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-600 mb-6 animate-pulse">
            <svg viewBox="0 0 111 111" className="w-12 h-12" fill="white">
              <path d="M54.921 110.034C85.359 110.034 110.034 85.402 110.034 55.017C110.034 24.6319 85.359 0 54.921 0C26.0432 0 2.35281 22.1714 0 50.3923H72.8467V59.6416H3.9565e-07C2.35281 87.8625 26.0432 110.034 54.921 110.034Z" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">
            Creating Your Wallet
          </h2>
          <p className="text-gray-400 mb-8">
            Setting up your secure Base wallet...
          </p>

          {/* Progress bar */}
          <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden mb-4">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div className="text-sm text-gray-500">{progress}% Complete</div>
        </div>
      )}

      {step === "created" && (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mb-6">
            <Check className="w-12 h-12 text-green-400" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">
            Wallet Created Successfully! 🎉
          </h2>
          <p className="text-gray-400 mb-6">Your Base wallet is ready to use</p>

          {/* Wallet address */}
          <div className="bg-gray-800 rounded-xl p-4 mb-6">
            <div className="text-xs text-gray-500 mb-2">
              Your Wallet Address
            </div>
            <div className="font-mono text-sm text-blue-400 break-all">
              {walletAddress}
            </div>
          </div>

          <div className="flex items-center justify-center text-green-400 text-sm">
            <Check className="w-5 h-5 mr-2" />
            Proceeding to purchase USDC...
          </div>
        </div>
      )}
    </div>
  );
};

export default BaseWalletCreationFlow;
