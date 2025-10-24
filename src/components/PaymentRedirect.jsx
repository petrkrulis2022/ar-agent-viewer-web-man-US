import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Store, ArrowRight, Clock, Loader2, ShoppingBag } from "lucide-react";

export default function PaymentRedirect() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [countdown, setCountdown] = useState(5);
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Decode payment data from URL
    const encodedData = searchParams.get("data");
    if (!encodedData) {
      setError("No payment data provided");
      return;
    }

    try {
      const decoded = JSON.parse(atob(encodedData));
      setPaymentData(decoded);
    } catch (err) {
      console.error("Failed to decode payment data:", err);
      setError("Invalid payment data");
    }
  }, [searchParams]);

  useEffect(() => {
    if (!paymentData || error) return;

    // Countdown timer
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Redirect to AR Viewer camera view with payment data
      const arViewerUrl = `http://localhost:5173/ar-view?payment=true&data=${searchParams.get(
        "data"
      )}`;
      window.location.href = arViewerUrl;
    }
  }, [countdown, paymentData, error]);

  const handleContinueNow = () => {
    const arViewerUrl = `http://localhost:5173/ar-view?payment=true&data=${searchParams.get(
      "data"
    )}`;
    window.location.href = arViewerUrl;
  };

  const handleCancel = () => {
    if (paymentData?.redirectUrl) {
      window.location.href = `${paymentData.redirectUrl}?status=cancelled`;
    } else {
      navigate(-1);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-black/50 border-red-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center text-white text-2xl">
              ❌ Error
            </CardTitle>
            <CardDescription className="text-center text-red-200">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => navigate(-1)}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-black/50 border-purple-500/30 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
            <p className="text-purple-200">Loading payment details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-green-950 to-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Curves */}
      <div className="absolute inset-0 opacity-20">
        {/* Parabolic curves */}
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className="absolute w-full h-full"
            style={{
              animation: `rotate ${15 + i * 5}s linear infinite`,
              animationDelay: `${i * 2}s`,
            }}
          >
            <path
              d={`M ${100 + i * 150} 0 Q ${300 + i * 100} ${400 + i * 50} ${
                100 + i * 150
              } 800`}
              stroke="#10b981"
              strokeWidth="2"
              fill="none"
              opacity="0.3"
            />
          </svg>
        ))}
        {/* Hyperbolic curves */}
        {[...Array(5)].map((_, i) => (
          <svg
            key={`hyper-${i}`}
            className="absolute w-full h-full"
            style={{
              animation: `rotate ${20 + i * 3}s linear infinite reverse`,
              animationDelay: `${i * 1.5}s`,
            }}
          >
            <path
              d={`M 0 ${200 + i * 100} Q ${400 + i * 80} ${300 + i * 60} ${
                800 + i * 100
              } ${200 + i * 100}`}
              stroke="#22c55e"
              strokeWidth="2"
              fill="none"
              opacity="0.2"
            />
          </svg>
        ))}
      </div>

      <style>
        {`
          @keyframes rotate {
            from {
              transform: rotate(0deg) scale(1);
            }
            50% {
              transform: rotate(180deg) scale(1.2);
            }
            to {
              transform: rotate(360deg) scale(1);
            }
          }
        `}
      </style>

      <div className="max-w-2xl w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-[0_0_20px_rgba(34,197,94,0.5)]">
            🚀 Redirecting to Payment Terminal
          </h1>
          <p className="text-green-300 text-lg drop-shadow-[0_0_10px_rgba(34,197,94,0.3)]">
            You'll be redirected to AR Viewer to complete your payment
          </p>
        </div>

        {/* Payment Info Card */}
        <Card className="bg-black/70 border-green-500/40 backdrop-blur-sm mb-6 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
          <CardHeader>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.5)]">
                <Store className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-white text-xl">
                  Payment Request
                </CardTitle>
                <CardDescription className="text-green-300 text-lg">
                  {paymentData.merchantName}
                </CardDescription>
              </div>
            </div>

            {/* Amount Display */}
            <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg p-6 text-center shadow-[0_0_30px_rgba(34,197,94,0.4)]">
              <p className="text-green-100 text-sm uppercase tracking-wide mb-2">
                Total Amount
              </p>
              <p className="text-white text-5xl font-bold drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                {paymentData.currency} {paymentData.amount.toFixed(2)}
              </p>
            </div>
          </CardHeader>

          <CardContent>
            {/* Order Items */}
            {paymentData.items && paymentData.items.length > 0 && (
              <>
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <ShoppingBag className="w-5 h-5 text-green-400" />
                    <h3 className="text-white font-semibold">Order Items</h3>
                  </div>
                  <div className="space-y-2">
                    {paymentData.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center text-green-200 bg-green-900/20 p-3 rounded border border-green-500/20"
                      >
                        <div>
                          <p className="font-medium text-white">{item.name}</p>
                          <p className="text-sm">Quantity: {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-white">
                          ${item.price.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator className="bg-green-500/30 mb-4" />
              </>
            )}

            {/* Countdown Timer */}
            <div className="bg-green-900/30 border border-green-500/40 rounded-lg p-6 text-center mb-6 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
              <Clock className="w-12 h-12 text-green-400 mx-auto mb-3 animate-pulse" />
              <p className="text-green-200 mb-2">
                Redirecting to AR Payment Terminal in
              </p>
              <div className="text-6xl font-bold text-white mb-2 drop-shadow-[0_0_20px_rgba(34,197,94,0.6)]">
                {countdown}
              </div>
              <p className="text-green-300 text-sm">
                Choose your preferred payment terminal agent
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={handleCancel}
                variant="outline"
                className="flex-1 bg-transparent border-green-500/30 text-green-200 hover:bg-green-900/30"
              >
                Cancel
              </Button>
              <Button
                onClick={handleContinueNow}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-[0_0_20px_rgba(34,197,94,0.4)]"
              >
                Continue Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Banner */}
        <div className="text-center">
          <p className="text-green-300 text-sm drop-shadow-[0_0_10px_rgba(34,197,94,0.3)]">
            🔒 Secure payment processing through AR Agent Terminal
          </p>
          <p className="text-green-400 text-xs mt-2">
            You'll be able to choose from multiple payment methods: Crypto QR,
            Bank QR, Virtual Card, and more
          </p>
        </div>
      </div>
    </div>
  );
}
