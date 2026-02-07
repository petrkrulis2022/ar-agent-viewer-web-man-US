import React, { useState } from "react";
import { ArrowLeft, CreditCard, Check } from "lucide-react";
import Z_INDEX from "../constants/zIndexConfig";

/**
 * Card Withdrawal Modal - 6-step Revolut flow
 *
 * Steps:
 * 1. Bank Selection (Revolut only for now)
 * 2. Revolut Balance Display
 * 3. Amount Input
 * 4. Confirmation
 * 5. Processing (3s simulation)
 * 6. Success with Receipt
 *
 * All interactions are 100% mocked - no real API calls
 */
const CardWithdrawalModal = ({
  agent,
  bankIntegrations,
  displayConfig,
  onClose,
  onBack,
}) => {
  const [step, setStep] = useState(1);
  const [selectedBank, setSelectedBank] = useState(null);
  const [amount, setAmount] = useState("");
  const [processing, setProcessing] = useState(false);

  // Mock balance from config (USD currency)
  const mockBalance =
    displayConfig?.mock_balance_usd ||
    displayConfig?.mock_balance_eur ||
    2450.67;

  // Step 1: Bank Selection
  const renderBankSelection = () => (
    <div style={{ padding: "20px" }}>
      <h3 style={{ fontSize: "22px", marginBottom: "24px", color: "#1a1a1a" }}>
        Select Your Bank
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {bankIntegrations.includes("Revolut") && (
          <button
            onClick={() => {
              setSelectedBank("Revolut");
              setStep(2);
            }}
            style={{
              backgroundColor: "#ffffff",
              border: "2px solid #0066ff",
              borderRadius: "12px",
              padding: "20px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f0f7ff";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#ffffff";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: "#0066ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
              }}
            >
              💳
            </div>
            <div style={{ textAlign: "left", flex: 1 }}>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#1a1a1a",
                }}
              >
                Revolut
              </div>
              <div
                style={{ fontSize: "13px", color: "#666", marginTop: "4px" }}
              >
                Fast & secure withdrawal
              </div>
            </div>
          </button>
        )}

        {/* Disabled banks shown in grey */}
        {!bankIntegrations.includes("Revolut") && (
          <div
            style={{
              backgroundColor: "#f5f5f5",
              border: "2px solid #e0e0e0",
              borderRadius: "12px",
              padding: "20px",
              opacity: 0.5,
            }}
          >
            <div style={{ fontSize: "16px", color: "#999" }}>
              No banks enabled
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Step 2: Revolut Balance Display
  const renderBalanceDisplay = () => (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          backgroundColor: "#0066ff",
          borderRadius: "16px",
          padding: "32px",
          color: "#ffffff",
          marginBottom: "24px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>
          Available Balance
        </div>
        <div style={{ fontSize: "48px", fontWeight: "bold" }}>
          ${mockBalance.toFixed(2)}
        </div>
        <div
          style={{
            fontSize: "15px",
            opacity: 0.9,
            marginTop: "8px",
            fontWeight: "600",
          }}
        >
          Martin Egger
        </div>
        <div style={{ fontSize: "13px", opacity: 0.8, marginTop: "4px" }}>
          Revolut USD Account
        </div>
      </div>

      <button
        onClick={() => setStep(3)}
        style={{
          backgroundColor: "#0066ff",
          color: "#ffffff",
          border: "none",
          borderRadius: "12px",
          padding: "16px",
          fontSize: "16px",
          fontWeight: "bold",
          cursor: "pointer",
          width: "100%",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 102, 255, 0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        Continue to Withdrawal
      </button>
    </div>
  );

  // Step 3: Amount Input
  const renderAmountInput = () => {
    const parsedAmount = parseFloat(amount) || 0;
    const isValid = parsedAmount > 0 && parsedAmount <= mockBalance;

    return (
      <div style={{ padding: "20px" }}>
        <h3
          style={{ fontSize: "22px", marginBottom: "24px", color: "#1a1a1a" }}
        >
          Enter Amount
        </h3>

        <div style={{ marginBottom: "24px" }}>
          <div style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "24px",
                color: "#666",
                fontWeight: "bold",
              }}
            >
              $
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              style={{
                width: "100%",
                padding: "20px 20px 20px 48px",
                fontSize: "32px",
                fontWeight: "bold",
                border: "2px solid #e0e0e0",
                borderRadius: "12px",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#0066ff")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#e0e0e0")}
            />
          </div>

          <div
            style={{
              marginTop: "12px",
              fontSize: "14px",
              color: parsedAmount > mockBalance ? "#ef4444" : "#666",
            }}
          >
            Available: ${mockBalance.toFixed(2)}
          </div>
        </div>

        {/* Quick amount buttons */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
          {[20, 50, 100, 200].map((quickAmount) => (
            <button
              key={quickAmount}
              onClick={() => setAmount(quickAmount.toString())}
              style={{
                flex: 1,
                padding: "12px",
                backgroundColor: "#f0f7ff",
                border: "1px solid #0066ff",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "bold",
                color: "#0066ff",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#0066ff";
                e.currentTarget.style.color = "#ffffff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#f0f7ff";
                e.currentTarget.style.color = "#0066ff";
              }}
            >
              ${quickAmount}
            </button>
          ))}
        </div>

        <button
          onClick={() => setStep(4)}
          disabled={!isValid}
          style={{
            backgroundColor: isValid ? "#0066ff" : "#cccccc",
            color: "#ffffff",
            border: "none",
            borderRadius: "12px",
            padding: "16px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: isValid ? "pointer" : "not-allowed",
            width: "100%",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            if (isValid) {
              e.currentTarget.style.transform = "translateY(-2px)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          Continue
        </button>
      </div>
    );
  };

  // Step 4: Confirmation
  const renderConfirmation = () => {
    const parsedAmount = parseFloat(amount) || 0;

    return (
      <div style={{ padding: "20px" }}>
        <h3
          style={{ fontSize: "22px", marginBottom: "24px", color: "#1a1a1a" }}
        >
          Confirm Withdrawal
        </h3>

        <div
          style={{
            backgroundColor: "#f8f9fa",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "24px",
          }}
        >
          <div style={{ marginBottom: "16px" }}>
            <div
              style={{ fontSize: "13px", color: "#666", marginBottom: "4px" }}
            >
              Amount
            </div>
            <div
              style={{ fontSize: "32px", fontWeight: "bold", color: "#1a1a1a" }}
            >
              ${parsedAmount.toFixed(2)}
            </div>
          </div>

          <div style={{ borderTop: "1px solid #e0e0e0", paddingTop: "16px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <span style={{ fontSize: "14px", color: "#666" }}>From</span>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "#1a1a1a",
                }}
              >
                Revolut USD
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <span style={{ fontSize: "14px", color: "#666" }}>Fee</span>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "#10b981",
                }}
              >
                $0.00
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "14px", color: "#666" }}>Dispenser</span>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "#1a1a1a",
                }}
              >
                {displayConfig?.dispenser_id || "ARTM-001"}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={async () => {
            setProcessing(true);
            setStep(5);
            // Simulate 3-second processing
            setTimeout(() => {
              setProcessing(false);
              setStep(6);
            }, 3000);
          }}
          style={{
            backgroundColor: "#0066ff",
            color: "#ffffff",
            border: "none",
            borderRadius: "12px",
            padding: "16px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
            width: "100%",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow =
              "0 4px 12px rgba(0, 102, 255, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          Confirm Withdrawal
        </button>
      </div>
    );
  };

  // Step 5: Processing
  const renderProcessing = () => (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <div
        style={{
          width: "80px",
          height: "80px",
          margin: "0 auto 24px",
          border: "4px solid #e0e0e0",
          borderTop: "4px solid #0066ff",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />

      <h3 style={{ fontSize: "22px", marginBottom: "12px", color: "#1a1a1a" }}>
        Processing Withdrawal...
      </h3>

      <p style={{ fontSize: "14px", color: "#666", margin: 0 }}>
        Please wait while we dispense your cash
      </p>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  // Step 6: Success
  const renderSuccess = () => {
    const parsedAmount = parseFloat(amount) || 0;
    const transactionId = `ARTM-${Date.now().toString().slice(-8)}`;

    return (
      <div style={{ padding: "20px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              width: "80px",
              height: "80px",
              margin: "0 auto 16px",
              backgroundColor: "#10b981",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Check size={48} color="#ffffff" strokeWidth={3} />
          </div>

          <h3
            style={{ fontSize: "24px", marginBottom: "8px", color: "#1a1a1a" }}
          >
            Withdrawal Successful!
          </h3>

          <p style={{ fontSize: "14px", color: "#666", margin: 0 }}>
            Please collect your cash from the dispenser
          </p>
        </div>

        {/* Receipt */}
        <div
          style={{
            backgroundColor: "#f8f9fa",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "24px",
            borderTop: "3px solid #10b981",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "16px" }}>
            <div
              style={{ fontSize: "16px", fontWeight: "bold", color: "#1a1a1a" }}
            >
              TRANSACTION RECEIPT
            </div>
          </div>

          <div style={{ fontSize: "13px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <span style={{ color: "#666" }}>Amount</span>
              <span style={{ fontWeight: "bold", color: "#1a1a1a" }}>
                ${parsedAmount.toFixed(2)}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <span style={{ color: "#666" }}>Bank</span>
              <span style={{ fontWeight: "bold", color: "#1a1a1a" }}>
                Revolut
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <span style={{ color: "#666" }}>Transaction ID</span>
              <span
                style={{
                  fontWeight: "bold",
                  color: "#1a1a1a",
                  fontSize: "11px",
                }}
              >
                {transactionId}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <span style={{ color: "#666" }}>Date</span>
              <span style={{ fontWeight: "bold", color: "#1a1a1a" }}>
                {new Date().toLocaleString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#666" }}>Terminal</span>
              <span style={{ fontWeight: "bold", color: "#1a1a1a" }}>
                {agent?.name || "Virtual Terminal"}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            backgroundColor: "#10b981",
            color: "#ffffff",
            border: "none",
            borderRadius: "12px",
            padding: "16px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
            width: "100%",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow =
              "0 4px 12px rgba(16, 185, 129, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          Done
        </button>
      </div>
    );
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: Z_INDEX.ARTM_FLOW_MODAL,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        backdropFilter: "blur(8px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !processing) {
          onClose();
        }
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          width: "90%",
          maxWidth: "450px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          position: "relative",
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        {/* Header with back button */}
        {step > 1 && step < 6 && !processing && (
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid #e0e0e0",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <button
              onClick={() => (step === 2 ? onBack() : setStep(step - 1))}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "8px",
                display: "flex",
                alignItems: "center",
                borderRadius: "8px",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#f0f0f0")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <ArrowLeft size={20} color="#333" />
            </button>
            <div
              style={{ fontSize: "16px", fontWeight: "bold", color: "#1a1a1a" }}
            >
              Card Withdrawal
            </div>
          </div>
        )}

        {/* Step content */}
        {step === 1 && renderBankSelection()}
        {step === 2 && renderBalanceDisplay()}
        {step === 3 && renderAmountInput()}
        {step === 4 && renderConfirmation()}
        {step === 5 && renderProcessing()}
        {step === 6 && renderSuccess()}
      </div>
    </div>
  );
};

export default CardWithdrawalModal;
