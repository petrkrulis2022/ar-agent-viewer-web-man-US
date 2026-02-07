import React, { useState } from "react";
import {
  ArrowLeft,
  Wallet,
  Check,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { ethers } from "ethers";
import { getUSDCContractForChain } from "../services/evmNetworkService";
import Z_INDEX from "../constants/zIndexConfig";

/**
 * Crypto Withdrawal Modal — Real 4-step USDC-to-cash flow
 *
 * Steps:
 * 1. Balance Display — shows real USDC (or ETH) balance from wallet
 * 2. Amount Input — user enters amount (max = real balance)
 * 3. Confirmation — shows from/to/amount/network before signing
 * 4. Processing → Success — real ERC-20 transfer() + tx hash
 *
 * Props received from ARTMDisplayModal:
 *   walletBalance  — { amount: string, token: "USDC"|"ETH", chainId: number }
 *   walletAddress  — connected MetaMask address
 *   walletNetwork  — human-readable network name
 */

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function transfer(address to, uint256 amount) returns (bool)",
];

const CryptoWithdrawalModal = ({
  agent,
  exchangeIntegrations,
  displayConfig,
  walletBalance,
  walletAddress,
  walletNetwork,
  onClose,
  onBack,
}) => {
  const [step, setStep] = useState(1);
  const [amountInput, setAmountInput] = useState("");
  const [processing, setProcessing] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [txError, setTxError] = useState(null);
  const [dispensing, setDispensing] = useState(false);
  const [dispensed, setDispensed] = useState(false);

  // 1 USDC ≈ 0.92 EUR (mock rate for display)
  const usdcToEurRate = 0.92;

  // Deployer wallet — where USDC is sent
  const recipientAddress =
    agent?.agent_wallet_address ||
    agent?.payment_recipient_address ||
    agent?.deployer_wallet_address ||
    agent?.deployer_address ||
    null;

  // Current balance
  const balanceAmount = parseFloat(walletBalance?.amount || "0");
  const balanceToken = walletBalance?.token || "USDC";
  const chainId = walletBalance?.chainId;

  // Short address helper
  const shortAddr = (addr) =>
    addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "—";

  // Explorer URL helper
  const getExplorerUrl = (hash) => {
    const explorers = {
      1: "https://etherscan.io/tx/",
      11155111: "https://sepolia.etherscan.io/tx/",
      421614: "https://sepolia.arbiscan.io/tx/",
      84532: "https://sepolia.basescan.org/tx/",
      11155420: "https://sepolia-optimism.etherscan.io/tx/",
      43113: "https://testnet.snowtrace.io/tx/",
      296: "https://hashscan.io/testnet/transaction/",
      137: "https://polygonscan.com/tx/",
      42161: "https://arbiscan.io/tx/",
      8453: "https://basescan.org/tx/",
      10: "https://optimistic.etherscan.io/tx/",
    };
    const base = explorers[chainId] || "https://etherscan.io/tx/";
    return `${base}${hash}`;
  };

  // ─── Execute real transfer ───────────────────────────────
  const executeTransfer = async () => {
    setProcessing(true);
    setTxError(null);

    try {
      if (!window.ethereum) throw new Error("MetaMask not found");
      if (!recipientAddress)
        throw new Error("No recipient wallet configured for this terminal");

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      if (balanceToken === "USDC") {
        // ERC-20 USDC transfer
        const usdcAddress = getUSDCContractForChain(chainId);
        if (!usdcAddress)
          throw new Error(`No USDC contract for chain ${chainId}`);

        const contract = new ethers.Contract(usdcAddress, ERC20_ABI, signer);
        const decimals = await contract.decimals();
        const amountWei = ethers.utils.parseUnits(amountInput, decimals);

        const tx = await contract.transfer(recipientAddress, amountWei);
        setTxHash(tx.hash);

        // Wait for confirmation
        await tx.wait(1);
      } else {
        // Native ETH transfer
        const amountWei = ethers.utils.parseEther(amountInput);
        const tx = await signer.sendTransaction({
          to: recipientAddress,
          value: amountWei,
        });
        setTxHash(tx.hash);
        await tx.wait(1);
      }

      // Simulate cash dispensing after blockchain confirmation
      setDispensing(true);
      await new Promise((r) => setTimeout(r, 3000));
      setDispensing(false);
      setDispensed(true);
    } catch (err) {
      console.error("Transfer error:", err);
      if (err.code === 4001 || err.code === "ACTION_REJECTED") {
        setTxError("Transaction rejected by user.");
      } else if (err.code === "INSUFFICIENT_FUNDS") {
        setTxError("Insufficient funds for gas + amount.");
      } else {
        setTxError(err.reason || err.message || "Transfer failed.");
      }
    } finally {
      setProcessing(false);
    }
  };

  // ════════════════════════════════════════════════════════════
  // Shared styles
  // ════════════════════════════════════════════════════════════
  const overlayStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: Z_INDEX.ARTM_MODAL,
    backdropFilter: "blur(8px)",
  };

  const cardStyle = {
    position: "relative",
    width: "min(400px, 92vw)",
    maxHeight: "90vh",
    overflowY: "auto",
    borderRadius: "24px",
    background: "linear-gradient(180deg, #0f0f23 0%, #1a1a3e 100%)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(124,58,237,0.15)",
    color: "#ffffff",
    padding: "0",
  };

  const headerStyle = {
    display: "flex",
    alignItems: "center",
    padding: "20px 20px 0",
    gap: "12px",
  };

  const backBtnStyle = {
    background: "rgba(255,255,255,0.1)",
    border: "none",
    borderRadius: "10px",
    padding: "8px",
    color: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const primaryBtnStyle = {
    width: "100%",
    padding: "16px",
    borderRadius: "14px",
    border: "none",
    background: "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)",
    color: "#ffffff",
    fontSize: "17px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 4px 16px rgba(124,58,237,0.4)",
    letterSpacing: "0.3px",
  };

  const secondaryBtnStyle = {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "transparent",
    color: "rgba(255,255,255,0.6)",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "10px",
    transition: "all 0.15s",
  };

  // ════════════════════════════════════════════════════════════
  // STEP 1: Balance Display
  // ════════════════════════════════════════════════════════════
  if (step === 1) {
    return (
      <div style={overlayStyle}>
        <div style={cardStyle}>
          <div style={headerStyle}>
            <button style={backBtnStyle} onClick={onBack}>
              <ArrowLeft size={20} />
            </button>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>
              Cash with Wallet
            </h3>
          </div>

          <div style={{ padding: "24px 20px" }}>
            {/* Wallet icon */}
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 12px",
                  boxShadow: "0 4px 20px rgba(124,58,237,0.4)",
                }}
              >
                <Wallet size={28} color="#fff" />
              </div>
              <p
                style={{
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.5)",
                  margin: 0,
                }}
              >
                Connected: {shortAddr(walletAddress)}
              </p>
              <p
                style={{
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.3)",
                  marginTop: "4px",
                }}
              >
                {walletNetwork}
              </p>
            </div>

            {/* Balance card */}
            <div
              style={{
                background: "rgba(124,58,237,0.12)",
                borderRadius: "16px",
                padding: "24px",
                textAlign: "center",
                border: "1px solid rgba(124,58,237,0.25)",
                marginBottom: "24px",
              }}
            >
              <p
                style={{
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.5)",
                  margin: "0 0 6px",
                }}
              >
                Available Balance
              </p>
              <p
                style={{
                  fontSize: "36px",
                  fontWeight: "800",
                  margin: "0 0 4px",
                  color: "#fff",
                }}
              >
                {balanceAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
                })}{" "}
                <span
                  style={{ fontSize: "18px", color: "rgba(255,255,255,0.6)" }}
                >
                  {balanceToken}
                </span>
              </p>
              {balanceToken === "USDC" && (
                <p
                  style={{
                    fontSize: "14px",
                    color: "rgba(255,255,255,0.4)",
                    margin: 0,
                  }}
                >
                  ≈ €{(balanceAmount * usdcToEurRate).toFixed(2)} EUR
                </p>
              )}
            </div>

            {/* Recipient info */}
            {recipientAddress && (
              <div
                style={{
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "12px",
                  padding: "14px 16px",
                  marginBottom: "24px",
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.4)",
                }}
              >
                <div style={{ marginBottom: "4px" }}>
                  Terminal:{" "}
                  <strong style={{ color: "rgba(255,255,255,0.7)" }}>
                    {agent?.name || "ARTM 1"}
                  </strong>
                </div>
                <div>
                  Recipient:{" "}
                  <span
                    style={{
                      fontFamily: "monospace",
                      color: "rgba(255,255,255,0.6)",
                    }}
                  >
                    {shortAddr(recipientAddress)}
                  </span>
                </div>
              </div>
            )}

            {/* Continue button */}
            <button
              onClick={() => setStep(2)}
              disabled={balanceAmount <= 0}
              style={{
                ...primaryBtnStyle,
                opacity: balanceAmount <= 0 ? 0.5 : 1,
                cursor: balanceAmount <= 0 ? "not-allowed" : "pointer",
              }}
            >
              {balanceAmount <= 0 ? "Insufficient Balance" : "Withdraw Cash"}
            </button>

            <button
              onClick={onBack}
              style={secondaryBtnStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // STEP 2: Amount Input
  // ════════════════════════════════════════════════════════════
  if (step === 2) {
    const parsedAmount = parseFloat(amountInput) || 0;
    const isOverBalance = parsedAmount > balanceAmount;
    const isValid = parsedAmount > 0 && !isOverBalance;

    const quickAmounts =
      balanceToken === "USDC" ? [10, 20, 50, 100] : [0.01, 0.05, 0.1, 0.5];

    return (
      <div style={overlayStyle}>
        <div style={cardStyle}>
          <div style={headerStyle}>
            <button
              style={backBtnStyle}
              onClick={() => {
                setStep(1);
                setAmountInput("");
                setTxError(null);
              }}
            >
              <ArrowLeft size={20} />
            </button>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>
              Enter Amount
            </h3>
          </div>

          <div style={{ padding: "24px 20px" }}>
            {/* Amount input */}
            <div
              style={{
                background: "rgba(124,58,237,0.08)",
                borderRadius: "16px",
                padding: "24px",
                textAlign: "center",
                border: `2px solid ${
                  isOverBalance ? "#ef4444" : "rgba(124,58,237,0.25)"
                }`,
                marginBottom: "16px",
                transition: "border-color 0.2s",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <input
                  type="number"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  placeholder="0.00"
                  style={{
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: "#ffffff",
                    fontSize: "42px",
                    fontWeight: "800",
                    textAlign: "center",
                    width: "180px",
                    fontFamily: "inherit",
                  }}
                  min="0"
                  step="0.01"
                  max={balanceAmount}
                />
                <span
                  style={{
                    fontSize: "18px",
                    color: "rgba(255,255,255,0.5)",
                    fontWeight: "600",
                  }}
                >
                  {balanceToken}
                </span>
              </div>

              {balanceToken === "USDC" && parsedAmount > 0 && (
                <p
                  style={{
                    fontSize: "14px",
                    color: "rgba(255,255,255,0.4)",
                    margin: "8px 0 0",
                  }}
                >
                  ≈ €{(parsedAmount * usdcToEurRate).toFixed(2)} EUR
                </p>
              )}
            </div>

            {/* Over balance warning */}
            {isOverBalance && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  background: "rgba(239,68,68,0.12)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  marginBottom: "16px",
                  fontSize: "13px",
                  color: "#f87171",
                }}
              >
                <AlertCircle size={16} />
                Exceeds available balance ({balanceAmount} {balanceToken})
              </div>
            )}

            {/* Available balance small print */}
            <p
              style={{
                fontSize: "12px",
                color: "rgba(255,255,255,0.4)",
                textAlign: "center",
                marginBottom: "16px",
              }}
            >
              Available: {balanceAmount} {balanceToken}
            </p>

            {/* Quick amounts */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                marginBottom: "24px",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              {quickAmounts
                .filter((a) => a <= balanceAmount)
                .map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setAmountInput(String(amt))}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "20px",
                      border: "1px solid rgba(124,58,237,0.3)",
                      background:
                        amountInput === String(amt)
                          ? "rgba(124,58,237,0.25)"
                          : "rgba(255,255,255,0.05)",
                      color: "#fff",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {amt} {balanceToken}
                  </button>
                ))}
              {/* Max button */}
              <button
                onClick={() => setAmountInput(String(balanceAmount))}
                style={{
                  padding: "8px 16px",
                  borderRadius: "20px",
                  border: "1px solid rgba(124,58,237,0.5)",
                  background: "rgba(124,58,237,0.2)",
                  color: "#a78bfa",
                  fontSize: "14px",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                MAX
              </button>
            </div>

            {/* Confirm button */}
            <button
              onClick={() => setStep(3)}
              disabled={!isValid}
              style={{
                ...primaryBtnStyle,
                opacity: isValid ? 1 : 0.4,
                cursor: isValid ? "pointer" : "not-allowed",
              }}
            >
              Review Withdrawal
            </button>

            <button
              onClick={() => {
                setStep(1);
                setAmountInput("");
              }}
              style={secondaryBtnStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // STEP 3: Confirmation
  // ════════════════════════════════════════════════════════════
  if (step === 3 && !processing && !txHash) {
    const parsedAmount = parseFloat(amountInput) || 0;

    return (
      <div style={overlayStyle}>
        <div style={cardStyle}>
          <div style={headerStyle}>
            <button style={backBtnStyle} onClick={() => setStep(2)}>
              <ArrowLeft size={20} />
            </button>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>
              Confirm Withdrawal
            </h3>
          </div>

          <div style={{ padding: "24px 20px" }}>
            {/* Warning banner */}
            <div
              style={{
                background: "rgba(251,191,36,0.1)",
                border: "1px solid rgba(251,191,36,0.3)",
                borderRadius: "12px",
                padding: "14px 16px",
                marginBottom: "24px",
                fontSize: "13px",
                color: "#fbbf24",
                textAlign: "center",
              }}
            >
              ⚠️ This will execute a{" "}
              <strong>real blockchain transaction</strong>.
              <br />
              Please verify the details below.
            </div>

            {/* Details card */}
            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                borderRadius: "16px",
                padding: "20px",
                marginBottom: "24px",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {/* Amount */}
              <div style={{ marginBottom: "16px", textAlign: "center" }}>
                <p
                  style={{
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.4)",
                    margin: "0 0 4px",
                  }}
                >
                  Amount
                </p>
                <p
                  style={{
                    fontSize: "32px",
                    fontWeight: "800",
                    margin: 0,
                    color: "#fff",
                  }}
                >
                  {parsedAmount}{" "}
                  <span
                    style={{ fontSize: "16px", color: "rgba(255,255,255,0.5)" }}
                  >
                    {balanceToken}
                  </span>
                </p>
                {balanceToken === "USDC" && (
                  <p
                    style={{
                      fontSize: "13px",
                      color: "rgba(255,255,255,0.4)",
                      marginTop: "4px",
                    }}
                  >
                    ≈ €{(parsedAmount * usdcToEurRate).toFixed(2)} EUR
                  </p>
                )}
              </div>

              <div
                style={{
                  height: "1px",
                  background: "rgba(255,255,255,0.1)",
                  margin: "0 0 16px",
                }}
              />

              {/* From */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                  fontSize: "13px",
                }}
              >
                <span style={{ color: "rgba(255,255,255,0.4)" }}>From</span>
                <span style={{ color: "#fff", fontFamily: "monospace" }}>
                  {shortAddr(walletAddress)}
                </span>
              </div>

              {/* To */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                  fontSize: "13px",
                }}
              >
                <span style={{ color: "rgba(255,255,255,0.4)" }}>
                  To (Terminal)
                </span>
                <span style={{ color: "#a78bfa", fontFamily: "monospace" }}>
                  {shortAddr(recipientAddress)}
                </span>
              </div>

              {/* Network */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                  fontSize: "13px",
                }}
              >
                <span style={{ color: "rgba(255,255,255,0.4)" }}>Network</span>
                <span style={{ color: "#fff" }}>{walletNetwork}</span>
              </div>

              {/* Token */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "13px",
                }}
              >
                <span style={{ color: "rgba(255,255,255,0.4)" }}>Token</span>
                <span style={{ color: "#fff" }}>{balanceToken}</span>
              </div>
            </div>

            {/* Error display */}
            {txError && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  background: "rgba(239,68,68,0.12)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  marginBottom: "16px",
                  fontSize: "13px",
                  color: "#f87171",
                }}
              >
                <AlertCircle size={16} />
                {txError}
              </div>
            )}

            {/* Confirm button */}
            <button
              onClick={executeTransfer}
              style={{
                ...primaryBtnStyle,
                background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                boxShadow: "0 4px 16px rgba(22,163,74,0.4)",
              }}
            >
              🔐 Confirm & Send {parsedAmount} {balanceToken}
            </button>

            <button
              onClick={() => setStep(2)}
              style={secondaryBtnStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // STEP 4: Processing / Success
  // ════════════════════════════════════════════════════════════
  const parsedAmount = parseFloat(amountInput) || 0;

  // 4a — Processing (waiting for tx)
  if (processing) {
    return (
      <div style={overlayStyle}>
        <div style={cardStyle}>
          <div style={{ padding: "40px 20px", textAlign: "center" }}>
            <style>{`@keyframes cryptoSpin { to { transform: rotate(360deg); } }`}</style>
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                border: "3px solid rgba(124,58,237,0.2)",
                borderTopColor: "#7c3aed",
                animation: "cryptoSpin 1s linear infinite",
                margin: "0 auto 24px",
              }}
            />

            <h3
              style={{
                fontSize: "20px",
                fontWeight: "700",
                margin: "0 0 12px",
              }}
            >
              {txHash ? "Waiting for Confirmation…" : "Sending Transaction…"}
            </h3>

            <p
              style={{
                fontSize: "14px",
                color: "rgba(255,255,255,0.5)",
                margin: "0 0 8px",
              }}
            >
              {txHash ? "Confirming on-chain…" : "Please confirm in MetaMask"}
            </p>

            {txHash && (
              <p
                style={{
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.3)",
                  fontFamily: "monospace",
                }}
              >
                tx: {shortAddr(txHash)}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 4b — Error after tx attempt
  if (txError && !txHash) {
    return (
      <div style={overlayStyle}>
        <div style={cardStyle}>
          <div style={headerStyle}>
            <button
              style={backBtnStyle}
              onClick={() => {
                setTxError(null);
                setStep(2);
              }}
            >
              <ArrowLeft size={20} />
            </button>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>
              Transaction Failed
            </h3>
          </div>
          <div style={{ padding: "24px 20px", textAlign: "center" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "rgba(239,68,68,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              <AlertCircle size={32} color="#ef4444" />
            </div>

            <p
              style={{
                fontSize: "15px",
                color: "#f87171",
                margin: "0 0 24px",
                lineHeight: "1.5",
              }}
            >
              {txError}
            </p>

            <button
              onClick={() => {
                setTxError(null);
                setStep(3);
              }}
              style={primaryBtnStyle}
            >
              Try Again
            </button>

            <button
              onClick={onClose}
              style={secondaryBtnStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4c — Dispensing cash animation
  if (dispensing) {
    return (
      <div style={overlayStyle}>
        <div style={cardStyle}>
          <div style={{ padding: "40px 20px", textAlign: "center" }}>
            <style>{`@keyframes cashSlide { 0% { transform: translateY(-30px); opacity:0; } 50% { opacity:1; } 100% { transform: translateY(0); opacity:1; } }`}</style>
            <div
              style={{
                fontSize: "64px",
                animation: "cashSlide 0.8s ease-out",
                marginBottom: "24px",
              }}
            >
              💶
            </div>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "700",
                margin: "0 0 12px",
              }}
            >
              Dispensing Cash…
            </h3>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)" }}>
              €{(parsedAmount * usdcToEurRate).toFixed(2)} EUR
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 4d — Success with receipt
  if (dispensed && txHash) {
    return (
      <div style={overlayStyle}>
        <div style={cardStyle}>
          <div style={{ padding: "32px 20px", textAlign: "center" }}>
            {/* Success checkmark */}
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #16a34a, #22c55e)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                boxShadow: "0 4px 20px rgba(34,197,94,0.4)",
              }}
            >
              <Check size={36} color="#fff" strokeWidth={3} />
            </div>

            <h3
              style={{ fontSize: "22px", fontWeight: "800", margin: "0 0 8px" }}
            >
              Withdrawal Complete!
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "rgba(255,255,255,0.5)",
                margin: "0 0 24px",
              }}
            >
              Please collect your cash below
            </p>

            {/* Receipt */}
            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                borderRadius: "16px",
                padding: "20px",
                marginBottom: "24px",
                textAlign: "left",
                border: "1px solid rgba(255,255,255,0.1)",
                fontSize: "13px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "10px",
                }}
              >
                <span style={{ color: "rgba(255,255,255,0.4)" }}>Sent</span>
                <span style={{ color: "#fff", fontWeight: "700" }}>
                  {parsedAmount} {balanceToken}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "10px",
                }}
              >
                <span style={{ color: "rgba(255,255,255,0.4)" }}>
                  Cash Dispensed
                </span>
                <span style={{ color: "#22c55e", fontWeight: "700" }}>
                  €{(parsedAmount * usdcToEurRate).toFixed(2)} EUR
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "10px",
                }}
              >
                <span style={{ color: "rgba(255,255,255,0.4)" }}>Network</span>
                <span style={{ color: "#fff" }}>{walletNetwork}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "10px",
                }}
              >
                <span style={{ color: "rgba(255,255,255,0.4)" }}>From</span>
                <span style={{ color: "#fff", fontFamily: "monospace" }}>
                  {shortAddr(walletAddress)}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "10px",
                }}
              >
                <span style={{ color: "rgba(255,255,255,0.4)" }}>To</span>
                <span style={{ color: "#a78bfa", fontFamily: "monospace" }}>
                  {shortAddr(recipientAddress)}
                </span>
              </div>

              <div
                style={{
                  height: "1px",
                  background: "rgba(255,255,255,0.1)",
                  margin: "12px 0",
                }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ color: "rgba(255,255,255,0.4)" }}>Tx Hash</span>
                <a
                  href={getExplorerUrl(txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#7c3aed",
                    fontSize: "12px",
                    fontFamily: "monospace",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    textDecoration: "none",
                  }}
                >
                  {shortAddr(txHash)} <ExternalLink size={12} />
                </a>
              </div>
            </div>

            {/* Done button */}
            <button onClick={onClose} style={primaryBtnStyle}>
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Fallback
  return null;
};

export default CryptoWithdrawalModal;
