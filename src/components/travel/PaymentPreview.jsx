import React, { useState } from "react";
import { CreditCard, ShieldCheck, Wallet, Loader2 } from "lucide-react";
import { transferHederaToken } from "../../utils/hederaPayments";

const PaymentPreview = ({
  packageData,
  onConfirm,
  onCancel,
  agent,
  connectedWallet,
}) => {
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState(null);

  const USDH_TOKEN_ID = "0.0.7218375";

  const handlePayment = async () => {
    if (!connectedWallet?.accountId) {
      setError("Wallet not connected");
      return;
    }

    setPaying(true);
    setError(null);

    try {
      console.log(
        `💸 Initiating package payment: ${packageData.totalPrice} USDH`
      );

      const result = await transferHederaToken({
        tokenId: USDH_TOKEN_ID,
        recipientAccountId: agent.hedera_account_id || "0.0.7301930",
        amount: packageData.totalPrice,
        memo: `Travel Package - ${agent.hedera_account_id}`,
      });

      if (result.success) {
        console.log("✅ Package payment successful:", result.transactionId);

        // Wait 2s for confirmation animation
        setTimeout(() => {
          onConfirm();
        }, 2000);
      } else {
        throw new Error(result.error || "Payment failed");
      }
    } catch (err) {
      console.error("❌ Package payment error:", err);
      setError(err.message || "Payment failed");
      setPaying(false);
    }
  };

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
              {packageData.bus && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Bus Agent Fee</span>
                  <span className="text-white">{packageData.bus.fee} USDH</span>
                </div>
              )}
              {packageData.train && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Train Agent Fee</span>
                  <span className="text-white">
                    {packageData.train.fee} USDH
                  </span>
                </div>
              )}
              {packageData.hotel && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Hotel Agent Fee</span>
                  <span className="text-white">
                    {packageData.hotel.fee} USDH
                  </span>
                </div>
              )}
              {packageData.agentFee && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Travel Agent Fee</span>
                  <span className="text-white">
                    {packageData.agentFee} USDH
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Network Fee</span>
                <span className="text-green-400">&lt; $0.001 (Hedera)</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 mt-2 border-t border-gray-700">
                <span className="text-white">Total</span>
                <span className="text-blue-400">
                  {packageData.totalPrice} USDH
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-900/20 rounded-lg p-3 mb-6 flex items-start gap-3 border border-blue-500/20">
            <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-200">
              Agent-to-Agent Coordination: Travel Agent will automatically split
              payment to Bus ({packageData.bus?.fee || 0}), Train (
              {packageData.train?.fee || 0}), and Hotel (
              {packageData.hotel?.fee || 0}) agents.
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={paying}
              className="flex-1 py-3 px-4 rounded-lg border border-gray-600 text-gray-300 font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handlePayment}
              disabled={paying || !connectedWallet?.accountId}
              className="flex-1 py-3 px-4 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {paying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Pay {packageData.totalPrice} USDH
                  <CreditCard className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {!connectedWallet?.accountId && (
            <p className="text-center text-xs text-yellow-400 mt-3">
              ⚠️ Connect HashPack wallet to proceed
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentPreview;
