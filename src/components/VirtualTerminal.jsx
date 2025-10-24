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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Store,
  CreditCard,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { paymentSessionService } from "../services/paymentSessionService";
import RevolutVirtualCardPayment from "./RevolutVirtualCardPayment";

export default function VirtualTerminal() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  // Extract session ID from URL
  const sessionId = searchParams.get("session");

  // Fetch payment session on mount
  useEffect(() => {
    if (!sessionId) {
      setError("No payment session ID provided");
      setLoading(false);
      return;
    }

    fetchPaymentSession();
  }, [sessionId]);

  // Countdown timer for session expiry
  useEffect(() => {
    if (!session) return;

    const updateTimer = () => {
      const remaining = paymentSessionService.getRemainingTime(session);
      setRemainingTime(remaining);

      if (remaining === 0) {
        setError("Payment session has expired");
      }
    };

    updateTimer(); // Initial update
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [session]);

  const fetchPaymentSession = async () => {
    try {
      setLoading(true);
      const sessionData = await paymentSessionService.getSession(sessionId);

      // Check if session is expired
      if (paymentSessionService.isSessionExpired(sessionData)) {
        setError("Payment session has expired");
        setLoading(false);
        return;
      }

      // Check if session is not pending
      if (sessionData.status !== "pending") {
        setError(`Payment session is ${sessionData.status}`);
        setLoading(false);
        return;
      }

      setSession(sessionData);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch payment session:", err);
      setError(err.message || "Failed to load payment details");
      setLoading(false);
    }
  };

  const handlePayNow = () => {
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (paymentResult) => {
    try {
      setShowPaymentModal(false);
      setProcessing(true);

      console.log(
        "💳 Payment successful, completing session...",
        paymentResult
      );

      // Complete payment session
      const result = await paymentSessionService.completeSession(sessionId, {
        revolutPaymentId: paymentResult.paymentId || `sim_${Date.now()}`,
        userWallet: paymentResult.userWallet || "simulated_wallet",
        paymentProof: paymentResult.proof || "simulated_payment",
      });

      console.log("✅ Session completed:", result);

      // Redirect to merchant or show success
      if (result.redirectUrl) {
        window.location.href = `${result.redirectUrl}?status=success&session=${sessionId}`;
      } else {
        alert("Payment successful! ✅");
        navigate("/");
      }
    } catch (err) {
      console.error("❌ Failed to complete payment:", err);
      alert("Payment processing failed: " + err.message);
      setProcessing(false);
    }
  };

  const handlePaymentCancel = () => {
    setShowPaymentModal(false);
  };

  const handleCancelPayment = async () => {
    await paymentSessionService.cancelSession(
      sessionId,
      "User cancelled payment"
    );

    if (session?.redirectUrl) {
      window.location.href = `${session.redirectUrl}?status=cancelled`;
    } else {
      navigate("/");
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Loading state
  if (loading) {
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

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-black/50 border-red-500/30 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <AlertTriangle className="w-16 h-16 text-red-400" />
            </div>
            <CardTitle className="text-center text-white">
              Payment Error
            </CardTitle>
            <CardDescription className="text-center text-red-200">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => navigate("/")}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Return to AR Viewer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-2xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            💳 Virtual Payment Terminal
          </h1>
          <p className="text-purple-200">Secure payment processing</p>
        </div>

        {/* Session Info Badge */}
        <div className="flex justify-center gap-4 mb-6">
          <Badge
            variant="outline"
            className="bg-purple-900/50 text-purple-200 border-purple-500/30"
          >
            Session: {sessionId.substring(0, 12)}...
          </Badge>
          <Badge
            variant="outline"
            className={`${
              remainingTime < 300
                ? "bg-red-900/50 text-red-200 border-red-500/30"
                : "bg-purple-900/50 text-purple-200 border-purple-500/30"
            }`}
          >
            <Clock className="w-3 h-3 mr-1" />
            Expires: {formatTime(remainingTime)}
          </Badge>
        </div>

        {/* Merchant Info Card */}
        <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm mb-6">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Store className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-white text-xl">
                  Payment Request From
                </CardTitle>
                <CardDescription className="text-purple-200 text-lg font-semibold">
                  {session.merchantName}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Amount Card */}
        <Card className="bg-gradient-to-br from-purple-600 to-pink-600 border-0 mb-6">
          <CardContent className="p-8 text-center">
            <p className="text-purple-100 text-sm uppercase tracking-wide mb-2">
              Total Amount
            </p>
            <p className="text-white text-5xl font-bold mb-2">
              {session.currency} {session.amount.toFixed(2)}
            </p>
            {session.token && (
              <p className="text-purple-100 text-lg">
                or {session.amount.toFixed(2)} {session.token}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Cart Details */}
        {session.cartData &&
          session.cartData.items &&
          session.cartData.items.length > 0 && (
            <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm mb-6">
              <CardHeader>
                <CardTitle className="text-white">Order Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {session.cartData.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center text-purple-200"
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
                  <Separator className="bg-purple-500/30" />
                  <div className="flex justify-between items-center font-bold text-white text-lg">
                    <span>Total</span>
                    <span>${session.cartData.total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        {/* Payment Method Card */}
        <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm mb-6">
          <CardHeader>
            <CardTitle className="text-white">Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-4 flex items-center gap-4">
              <CreditCard className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-white font-semibold">Revolut Virtual Card</p>
                <p className="text-purple-200 text-sm">
                  Secure payment processing
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={handleCancelPayment}
            disabled={processing}
            variant="outline"
            className="flex-1 bg-transparent border-purple-500/30 text-purple-200 hover:bg-purple-900/30"
          >
            Cancel Payment
          </Button>
          <Button
            onClick={handlePayNow}
            disabled={processing || remainingTime === 0}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Pay {session.currency} {session.amount.toFixed(2)}
              </>
            )}
          </Button>
        </div>

        {/* Processing Overlay */}
        {processing && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <Card className="bg-black/90 border-purple-500/30 p-8">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
                <p className="text-white text-lg font-semibold">
                  Processing your payment...
                </p>
                <p className="text-purple-200 text-sm mt-2">Please wait</p>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Revolut Virtual Card Payment Modal */}
      {showPaymentModal && (
        <RevolutVirtualCardPayment
          amount={session.amount}
          currency={session.currency}
          merchantName={session.merchantName}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
        />
      )}
    </div>
  );
}
