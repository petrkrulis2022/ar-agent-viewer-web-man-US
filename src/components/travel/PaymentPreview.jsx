import React from "react";
import { CreditCard, ShieldCheck, Wallet } from "lucide-react";

const PaymentPreview = ({ packageData, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl border border-blue-500/30 w-full max-w-md overflow-hidden shadow-2xl shadow-blue-900/20">
        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-blue-400" />
            Confirm Payment
          </h3>

          <div className="bg-gray-800/50 rounded-xl p-4 mb-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-700">
              <span className="text-gray-400">Payment Method</span>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-400">H</span>
                </div>
                <span className="text-white font-medium">Hedera USDH</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Flight Package</span>
                <span className="text-white">${packageData.totalPrice}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Network Fee</span>
                <span className="text-green-400">&lt; $0.001 (Hedera)</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 mt-2 border-t border-gray-700">
                <span className="text-white">Total</span>
                <span className="text-blue-400">
                  ${packageData.totalPrice} USDH
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-900/20 rounded-lg p-3 mb-6 flex items-start gap-3 border border-blue-500/20">
            <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-200">
              Smart Contract Escrow: Funds are held safely until all services
              (Flight, Bus, Hotel) are confirmed.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-3 px-4 rounded-lg border border-gray-600 text-gray-300 font-medium hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3 px-4 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors flex items-center justify-center gap-2"
            >
              Pay Now <CreditCard className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPreview;
