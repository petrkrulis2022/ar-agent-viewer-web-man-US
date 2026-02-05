import React, { useState } from "react";
import { ArrowLeft, Wallet, Check } from "lucide-react";
import Z_INDEX from "../constants/zIndexConfig";

/**
 * Crypto Withdrawal Modal - 8-step crypto-to-cash flow
 *
 * Steps:
 * 1. Exchange Selection
 * 2. Wallet Connection (MetaMask/Phantom)
 * 3. Spending Limit Confirmation
 * 4. Balance Display (USDC)
 * 5. Amount Input with EUR conversion
 * 6. Confirmation
 * 7. Processing (blockchain + dispenser simulation)
 * 8. Success with Receipt
 *
 * All interactions are 100% mocked - no real blockchain calls
 */
const CryptoWithdrawalModal = ({
  agent,
  exchangeIntegrations,
  displayConfig,
  onClose,
  onBack,
}) => {
  const [step, setStep] = useState(1);
  const [selectedExchange, setSelectedExchange] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [spendingLimitApproved, setSpendingLimitApproved] = useState(false);
  const [amountUSDC, setAmountUSDC] = useState("");
  const [processing, setProcessing] = useState(false);

  // Mock wallet balance from config
  const mockWalletUSDC = displayConfig?.mock_wallet_usdc || 1250.0;

  // Mock exchange rate: 1 USDC ≈ 0.92 EUR
  const usdcToEurRate = 0.92;

  // Step 1: Exchange Selection
  const renderExchangeSelection = () => (
    <div style={{ padding: "20px" }}>
      <h3 style={{ fontSize: "22px", marginBottom: "24px", color: "#1a1a1a" }}>
        Select Exchange
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {/* Binance */}
        {exchangeIntegrations.includes("Binance") && (
          <button
            onClick={() => {
              setSelectedExchange("Binance");
              setStep(2);
            }}
            style={{
              backgroundColor: "#ffffff",
              border: "2px solid #f3ba2f",
              borderRadius: "12px",
              padding: "20px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#fffbf0";
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
                backgroundColor: "#f3ba2f",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
              }}
            >
              🪙
            </div>
            <div style={{ textAlign: "left", flex: 1 }}>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#1a1a1a",
                }}
              >
                Binance
              </div>
              <div
                style={{ fontSize: "13px", color: "#666", marginTop: "4px" }}
              >
                Connect via wallet
              </div>
            </div>
          </button>
        )}

        {/* Coinbase */}
        {exchangeIntegrations.includes("Coinbase") && (
          <button
            onClick={() => {
              setSelectedExchange("Coinbase");
              setStep(2);
            }}
            style={{
              backgroundColor: "#ffffff",
              border: "2px solid #0052ff",
              borderRadius: "12px",
              padding: "20px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f0f5ff";
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
                backgroundColor: "#0052ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
              }}
            >
              💰
            </div>
            <div style={{ textAlign: "left", flex: 1 }}>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#1a1a1a",
                }}
              >
                Coinbase
              </div>
              <div
                style={{ fontSize: "13px", color: "#666", marginTop: "4px" }}
              >
                Connect via wallet
              </div>
            </div>
          </button>
        )}

        {/* No exchanges enabled */}
        {exchangeIntegrations.length === 0 && (
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
              No exchanges enabled
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Step 2: Wallet Connection
  const renderWalletConnection = () => (
    <div style={{ padding: "20px" }}>
      <h3 style={{ fontSize: "22px", marginBottom: "16px", color: "#1a1a1a" }}>
        Connect Wallet
      </h3>

      <p style={{ fontSize: "14px", color: "#666", marginBottom: "24px" }}>
        Connect your wallet to access your USDC balance
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {/* MetaMask */}
        <button
          onClick={() => {
            // Mock wallet connection
            setWalletConnected(true);
            setWalletAddress("0x742d...3f5a");
            setStep(3);
          }}
          style={{
            backgroundColor: "#ffffff",
            border: "2px solid #f6851b",
            borderRadius: "12px",
            padding: "20px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#fff8f0";
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
              backgroundColor: "#f6851b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
            }}
          >
            🦊
          </div>
          <div style={{ textAlign: "left", flex: 1 }}>
            <div
              style={{ fontSize: "18px", fontWeight: "bold", color: "#1a1a1a" }}
            >
              MetaMask
            </div>
            <div style={{ fontSize: "13px", color: "#666", marginTop: "4px" }}>
              Ethereum & ERC-20 tokens
            </div>
          </div>
        </button>

        {/* Phantom */}
        <button
          onClick={() => {
            // Mock wallet connection
            setWalletConnected(true);
            setWalletAddress("DgB2...9xKl");
            setStep(3);
          }}
          style={{
            backgroundColor: "#ffffff",
            border: "2px solid #ab9ff2",
            borderRadius: "12px",
            padding: "20px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#f8f6ff";
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
              backgroundColor: "#ab9ff2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
            }}
          >
            👻
          </div>
          <div style={{ textAlign: "left", flex: 1 }}>
            <div
              style={{ fontSize: "18px", fontWeight: "bold", color: "#1a1a1a" }}
            >
              Phantom
            </div>
            <div style={{ fontSize: "13px", color: "#666", marginTop: "4px" }}>
              Solana & SPL tokens
            </div>
          </div>
        </button>
      </div>
    </div>
  );

  // Step 3: Spending Limit Confirmation
  const renderSpendingLimit = () => (
    <div style={{ padding: "20px" }}>
      <h3 style={{ fontSize: "22px", marginBottom: "16px", color: "#1a1a1a" }}>
        Approve Spending Limit
      </h3>

      <div
        style={{
          backgroundColor: "#f0f7ff",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "24px",
          border: "2px solid #0066ff",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "12px",
          }}
        >
          <Wallet size={24} color="#0066ff" />
          <div>
            <div style={{ fontSize: "12px", color: "#666" }}>
              Connected Wallet
            </div>
            <div
              style={{ fontSize: "14px", fontWeight: "bold", color: "#1a1a1a" }}
            >
              {walletAddress}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          backgroundColor: "#fff8e6",
          border: "2px solid #fbbf24",
          borderRadius: "12px",
          padding: "16px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{ fontSize: "14px", color: "#92400e", marginBottom: "8px" }}
        >
          ⚠️ <strong>Spending Limit Request</strong>
        </div>
        <div style={{ fontSize: "13px", color: "#92400e", lineHeight: "1.5" }}>
          This terminal requests permission to spend up to{" "}
          <strong>1,000 USDC</strong> from your wallet for cash withdrawals.
        </div>
      </div>

      <button
        onClick={() => {
          setSpendingLimitApproved(true);
          setStep(4);
        }}
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
          marginBottom: "12px",
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
        Approve Spending Limit
      </button>

      <button
        onClick={() => setStep(2)}
        style={{
          backgroundColor: "#ffffff",
          color: "#666",
          border: "1px solid #e0e0e0",
          borderRadius: "12px",
          padding: "12px",
          fontSize: "14px",
          cursor: "pointer",
          width: "100%",
        }}
      >
        Cancel
      </button>
    </div>
  );

  // Step 4: Balance Display
  const renderBalanceDisplay = () => (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          backgroundColor: "#10b981",
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
          {mockWalletUSDC.toFixed(2)} USDC
        </div>
        <div style={{ fontSize: "16px", opacity: 0.9, marginTop: "8px" }}>
          ≈ €{(mockWalletUSDC * usdcToEurRate).toFixed(2)} EUR
        </div>
        <div style={{ fontSize: "13px", opacity: 0.8, marginTop: "4px" }}>
          {walletAddress}
        </div>
      </div>

      <button
        onClick={() => setStep(5)}
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
        Continue to Withdrawal
      </button>
    </div>
  );

  // Step 5: Amount Input with Conversion
  const renderAmountInput = () => {
    const parsedAmountUSDC = parseFloat(amountUSDC) || 0;
    const amountEUR = parsedAmountUSDC * usdcToEurRate;
    const isValid = parsedAmountUSDC > 0 && parsedAmountUSDC <= mockWalletUSDC;

    return (
      <div style={{ padding: "20px" }}>
        <h3
          style={{ fontSize: "22px", marginBottom: "24px", color: "#1a1a1a" }}
        >
          Enter Amount
        </h3>

        {/* USDC Input */}
        <div style={{ marginBottom: "16px" }}>
          <label
            style={{
              fontSize: "13px",
              color: "#666",
              marginBottom: "8px",
              display: "block",
            }}
          >
            Amount in USDC
          </label>
          <div style={{ position: "relative" }}>
            <input
              type="number"
              value={amountUSDC}
              onChange={(e) => setAmountUSDC(e.target.value)}
              placeholder="0.00"
              style={{
                width: "100%",
                padding: "16px",
                fontSize: "24px",
                fontWeight: "bold",
                border: "2px solid #e0e0e0",
                borderRadius: "12px",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#10b981")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#e0e0e0")}
            />
            <span
              style={{
                position: "absolute",
                right: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "16px",
                color: "#666",
                fontWeight: "bold",
              }}
            >
              USDC
            </span>
          </div>
        </div>

        {/* EUR Conversion Display */}
        <div
          style={{
            backgroundColor: "#f0f7ff",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "16px",
            border: "2px solid #0066ff",
          }}
        >
          <div style={{ fontSize: "13px", color: "#666", marginBottom: "4px" }}>
            You will receive (approx.)
          </div>
          <div
            style={{ fontSize: "32px", fontWeight: "bold", color: "#1a1a1a" }}
          >
            €{amountEUR.toFixed(2)}
          </div>
          <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
            Exchange rate: 1 USDC ≈ €{usdcToEurRate}
          </div>
        </div>

        <div
          style={{
            marginBottom: "24px",
            fontSize: "14px",
            color: parsedAmountUSDC > mockWalletUSDC ? "#ef4444" : "#666",
          }}
        >
          Available: {mockWalletUSDC.toFixed(2)} USDC
        </div>

        {/* Quick amount buttons */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
          {[50, 100, 250, 500].map((quickAmount) => (
            <button
              key={quickAmount}
              onClick={() => setAmountUSDC(quickAmount.toString())}
              style={{
                flex: 1,
                padding: "12px",
                backgroundColor: "#f0fdf4",
                border: "1px solid #10b981",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "bold",
                color: "#10b981",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#10b981";
                e.currentTarget.style.color = "#ffffff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#f0fdf4";
                e.currentTarget.style.color = "#10b981";
              }}
            >
              {quickAmount}
            </button>
          ))}
        </div>

        <button
          onClick={() => setStep(6)}
          disabled={!isValid}
          style={{
            backgroundColor: isValid ? "#10b981" : "#cccccc",
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

  // Step 6: Confirmation
  const renderConfirmation = () => {
    const parsedAmountUSDC = parseFloat(amountUSDC) || 0;
    const amountEUR = parsedAmountUSDC * usdcToEurRate;

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
              You Send
            </div>
            <div
              style={{ fontSize: "32px", fontWeight: "bold", color: "#1a1a1a" }}
            >
              {parsedAmountUSDC.toFixed(2)} USDC
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "16px 0",
            }}
          >
            <div style={{ fontSize: "24px" }}>⬇️</div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <div
              style={{ fontSize: "13px", color: "#666", marginBottom: "4px" }}
            >
              You Receive (Cash)
            </div>
            <div
              style={{ fontSize: "32px", fontWeight: "bold", color: "#10b981" }}
            >
              €{amountEUR.toFixed(2)}
            </div>
          </div>

          <div
            style={{
              borderTop: "1px solid #e0e0e0",
              paddingTop: "16px",
              fontSize: "13px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <span style={{ color: "#666" }}>From Wallet</span>
              <span style={{ fontWeight: "bold", color: "#1a1a1a" }}>
                {walletAddress}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <span style={{ color: "#666" }}>Exchange</span>
              <span style={{ fontWeight: "bold", color: "#1a1a1a" }}>
                {selectedExchange}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <span style={{ color: "#666" }}>Network Fee</span>
              <span style={{ fontWeight: "bold", color: "#10b981" }}>
                ~$0.50
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#666" }}>Terminal</span>
              <span style={{ fontWeight: "bold", color: "#1a1a1a" }}>
                {displayConfig?.dispenser_id || "ARTM-001"}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={async () => {
            setProcessing(true);
            setStep(7);
            // Simulate 4-second processing (blockchain + dispenser)
            setTimeout(() => {
              setProcessing(false);
              setStep(8);
            }, 4000);
          }}
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
          Confirm Withdrawal
        </button>
      </div>
    );
  };

  // Step 7: Processing
  const renderProcessing = () => (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <div
        style={{
          width: "80px",
          height: "80px",
          margin: "0 auto 24px",
          border: "4px solid #e0e0e0",
          borderTop: "4px solid #10b981",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />

      <h3 style={{ fontSize: "22px", marginBottom: "12px", color: "#1a1a1a" }}>
        Processing Transaction...
      </h3>

      <div style={{ fontSize: "14px", color: "#666", marginBottom: "24px" }}>
        <div style={{ marginBottom: "8px" }}>✅ Blockchain confirmation</div>
        <div style={{ marginBottom: "8px" }}>🔄 Converting USDC to EUR</div>
        <div>💵 Preparing cash dispenser</div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  // Step 8: Success
  const renderSuccess = () => {
    const parsedAmountUSDC = parseFloat(amountUSDC) || 0;
    const amountEUR = parsedAmountUSDC * usdcToEurRate;
    const transactionId = `ARTM-${Date.now().toString().slice(-8)}`;
    const blockchainTx = `0x${Math.random()
      .toString(16)
      .substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`;

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
              CRYPTO WITHDRAWAL RECEIPT
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
              <span style={{ color: "#666" }}>Sent (Crypto)</span>
              <span style={{ fontWeight: "bold", color: "#1a1a1a" }}>
                {parsedAmountUSDC.toFixed(2)} USDC
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <span style={{ color: "#666" }}>Received (Cash)</span>
              <span style={{ fontWeight: "bold", color: "#10b981" }}>
                €{amountEUR.toFixed(2)}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <span style={{ color: "#666" }}>Exchange</span>
              <span style={{ fontWeight: "bold", color: "#1a1a1a" }}>
                {selectedExchange}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <span style={{ color: "#666" }}>Wallet</span>
              <span
                style={{
                  fontWeight: "bold",
                  color: "#1a1a1a",
                  fontSize: "11px",
                }}
              >
                {walletAddress}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <span style={{ color: "#666" }}>Terminal ID</span>
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
              <span style={{ color: "#666" }}>Blockchain TX</span>
              <span
                style={{
                  fontWeight: "bold",
                  color: "#1a1a1a",
                  fontSize: "10px",
                }}
              >
                {blockchainTx}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
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
        {step > 1 && step < 8 && !processing && (
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
              Crypto Withdrawal
            </div>
          </div>
        )}

        {/* Step content */}
        {step === 1 && renderExchangeSelection()}
        {step === 2 && renderWalletConnection()}
        {step === 3 && renderSpendingLimit()}
        {step === 4 && renderBalanceDisplay()}
        {step === 5 && renderAmountInput()}
        {step === 6 && renderConfirmation()}
        {step === 7 && renderProcessing()}
        {step === 8 && renderSuccess()}
      </div>
    </div>
  );
};

export default CryptoWithdrawalModal;
