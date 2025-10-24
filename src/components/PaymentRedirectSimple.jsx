import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function PaymentRedirectSimple() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [countdown, setCountdown] = useState(5);
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const encodedData = searchParams.get("data");
    if (!encodedData) {
      setError("No payment data");
      return;
    }

    try {
      const decoded = JSON.parse(atob(encodedData));
      setPaymentData(decoded);
      console.log("Payment data:", decoded);
    } catch (err) {
      console.error("Decode error:", err);
      setError("Invalid data");
    }
  }, [searchParams]);

  useEffect(() => {
    if (!paymentData || error) return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      const arViewerUrl = `http://localhost:5173/ar-view?payment=true&data=${searchParams.get(
        "data"
      )}`;
      window.location.href = arViewerUrl;
    }
  }, [countdown, paymentData, error]);

  if (error) {
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
          background: "#111",
          color: "white",
          minHeight: "100vh",
        }}
      >
        <h1>Error: {error}</h1>
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
          background: "#111",
          color: "white",
          minHeight: "100vh",
        }}
      >
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #000, #064e3b, #000)",
        color: "white",
        padding: "40px",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "36px", marginBottom: "20px" }}>
        🚀 Redirecting to Payment Terminal
      </h1>

      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          background: "rgba(0,0,0,0.7)",
          border: "2px solid #10b981",
          borderRadius: "12px",
          padding: "30px",
        }}
      >
        <h2 style={{ color: "#10b981", marginBottom: "20px" }}>
          Payment Request
        </h2>
        <h3 style={{ marginBottom: "30px" }}>{paymentData.merchantName}</h3>

        <div
          style={{
            background: "linear-gradient(135deg, #059669, #10b981)",
            padding: "30px",
            borderRadius: "8px",
            marginBottom: "30px",
          }}
        >
          <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>
            TOTAL AMOUNT
          </div>
          <div style={{ fontSize: "48px", fontWeight: "bold" }}>
            {paymentData.currency} {paymentData.amount.toFixed(2)}
          </div>
        </div>

        {paymentData.items && paymentData.items.length > 0 && (
          <div style={{ marginBottom: "30px", textAlign: "left" }}>
            <h4 style={{ marginBottom: "15px", color: "#10b981" }}>
              🛍️ Order Items
            </h4>
            {paymentData.items.map((item, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(16,185,129,0.1)",
                  border: "1px solid rgba(16,185,129,0.3)",
                  padding: "12px",
                  borderRadius: "6px",
                  marginBottom: "8px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ fontWeight: "bold" }}>{item.name}</div>
                  <div style={{ fontSize: "14px", opacity: 0.8 }}>
                    Qty: {item.quantity}
                  </div>
                </div>
                <div style={{ fontWeight: "bold" }}>
                  ${item.price.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}

        <div
          style={{
            background: "rgba(16,185,129,0.2)",
            border: "2px solid #10b981",
            padding: "30px",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          <div style={{ fontSize: "16px", marginBottom: "10px" }}>
            Redirecting to AR Payment Terminal in
          </div>
          <div
            style={{ fontSize: "72px", fontWeight: "bold", color: "#10b981" }}
          >
            {countdown}
          </div>
        </div>

        <button
          onClick={() => {
            const url = `http://localhost:5173/ar-view?payment=true&data=${searchParams.get(
              "data"
            )}`;
            window.location.href = url;
          }}
          style={{
            background: "linear-gradient(135deg, #059669, #10b981)",
            color: "white",
            border: "none",
            padding: "15px 30px",
            fontSize: "18px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Continue Now →
        </button>
      </div>

      <div style={{ marginTop: "30px", fontSize: "14px", color: "#10b981" }}>
        🔒 Secure payment processing through AR Agent Terminal
      </div>
    </div>
  );
}
