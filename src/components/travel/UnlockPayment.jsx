import React from "react";
import { CreditCard, X } from "lucide-react";

const UnlockPayment = ({
  agent,
  onUnlockComplete,
  onClose,
  connectedWallet,
}) => {
  const handleUnlock = () => {
    console.log("🔓 Unlock payment skipped - proceeding to chat");
    onUnlockComplete();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl border border-blue-500/30 w-full max-w-md overflow-hidden shadow-2xl shadow-blue-900/20">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-blue-400" />
              Unlock Travel Agent
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-4 mb-6 border border-gray-700">
            <p className="text-gray-300 text-sm mb-4">
              Start chatting with{" "}
              <span className="text-blue-400 font-semibold">{agent.name}</span>
            </p>
            <div className="text-center">
              <div className="text-3xl mb-2">✈️</div>
              <p className="text-gray-400 text-xs">
                No payment required for demo
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-lg border border-gray-600 text-gray-300 font-medium hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUnlock}
              className="flex-1 py-3 px-4 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors"
            >
              Start Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnlockPayment;
