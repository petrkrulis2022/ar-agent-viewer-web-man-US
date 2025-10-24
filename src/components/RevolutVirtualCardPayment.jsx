import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreditCard, X, Lock, Calendar, User } from "lucide-react";

/**
 * RevolutVirtualCardPayment - Simplified payment component for Virtual Terminal
 * Simulates Revolut Virtual Card payment for dynamic amounts
 */
export default function RevolutVirtualCardPayment({
  amount,
  currency = "USD",
  merchantName,
  onSuccess,
  onCancel,
}) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    // Validate fields
    if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
      alert("Please fill in all card details");
      return;
    }

    try {
      setProcessing(true);

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate successful payment
      const paymentResult = {
        success: true,
        paymentId: `revolut_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        amount,
        currency,
        timestamp: new Date().toISOString(),
        cardLast4: cardNumber.slice(-4),
        merchantName,
        userWallet: "simulated_wallet_address",
        proof: "simulated_payment_proof",
      };

      console.log("✅ Simulated Revolut payment successful:", paymentResult);

      onSuccess(paymentResult);
    } catch (error) {
      console.error("❌ Payment failed:", error);
      alert("Payment failed: " + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const formatCardNumber = (value) => {
    const numbers = value.replace(/\D/g, "");
    const groups = numbers.match(/.{1,4}/g);
    return groups ? groups.join(" ") : numbers;
  };

  const formatExpiryDate = (value) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length >= 2) {
      return numbers.slice(0, 2) + "/" + numbers.slice(2, 4);
    }
    return numbers;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-gradient-to-br from-slate-900 to-purple-900 border-purple-500/30">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-white flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-purple-400" />
              Revolut Virtual Card
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
              className="text-purple-200 hover:text-white hover:bg-purple-800/50"
              disabled={processing}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Payment Amount Display */}
          <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-4 text-center">
            <p className="text-purple-200 text-sm mb-1">Payment Amount</p>
            <p className="text-white text-3xl font-bold">
              {currency} {amount.toFixed(2)}
            </p>
            <p className="text-purple-300 text-sm mt-1">to {merchantName}</p>
          </div>

          {/* Simulated Card Input Form */}
          <div className="space-y-4">
            <div>
              <label className="text-purple-200 text-sm font-medium mb-2 block flex items-center gap-2">
                <User className="w-4 h-4" />
                Cardholder Name
              </label>
              <Input
                type="text"
                placeholder="John Doe"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                className="bg-slate-800/50 border-purple-500/30 text-white placeholder:text-purple-300/50"
                disabled={processing}
              />
            </div>

            <div>
              <label className="text-purple-200 text-sm font-medium mb-2 block flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Card Number
              </label>
              <Input
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => {
                  const formatted = formatCardNumber(e.target.value);
                  if (formatted.replace(/\s/g, "").length <= 16) {
                    setCardNumber(formatted);
                  }
                }}
                className="bg-slate-800/50 border-purple-500/30 text-white placeholder:text-purple-300/50 font-mono"
                disabled={processing}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-purple-200 text-sm font-medium mb-2 block flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Expiry Date
                </label>
                <Input
                  type="text"
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChange={(e) => {
                    const formatted = formatExpiryDate(e.target.value);
                    if (formatted.replace(/\//g, "").length <= 4) {
                      setExpiryDate(formatted);
                    }
                  }}
                  className="bg-slate-800/50 border-purple-500/30 text-white placeholder:text-purple-300/50 font-mono"
                  disabled={processing}
                />
              </div>

              <div>
                <label className="text-purple-200 text-sm font-medium mb-2 block flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  CVV
                </label>
                <Input
                  type="text"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => {
                    const numbers = e.target.value.replace(/\D/g, "");
                    if (numbers.length <= 3) {
                      setCvv(numbers);
                    }
                  }}
                  className="bg-slate-800/50 border-purple-500/30 text-white placeholder:text-purple-300/50 font-mono"
                  disabled={processing}
                  maxLength={3}
                />
              </div>
            </div>
          </div>

          {/* Security Note */}
          <div className="bg-purple-900/20 border border-purple-500/20 rounded p-3 text-sm text-purple-200">
            <p className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              🔒 Secure Payment - This is a simulated payment for testing
              purposes
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={onCancel}
              disabled={processing}
              variant="outline"
              className="flex-1 bg-transparent border-purple-500/30 text-purple-200 hover:bg-purple-900/30"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={processing}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold"
            >
              {processing
                ? "Processing..."
                : `Pay ${currency} ${amount.toFixed(2)}`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
