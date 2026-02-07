import React, { useState, useCallback } from "react";
import { X, ArrowLeft } from "lucide-react";
import { ethers } from "ethers";
import Z_INDEX from "../constants/zIndexConfig";
import { getUSDCContractForChain } from "../services/evmNetworkService";
import CardWithdrawalModal from "./CardWithdrawalModal";
import CryptoWithdrawalModal from "./CryptoWithdrawalModal";

/**
 * ARTM Display Modal - Main interface for Virtual Terminal agents
 *
 * Flow:
 *  1. "Tap on Display" blue ATM screen
 *  2. 2x2 grid: Bank Balance | Wallet Balance | Cash with Card | Cash with Wallet
 *  3a. Bank Balance → Revolut permission screen → mock balance shown on ATM display
 *  3b. Wallet Balance → MetaMask connect → real USDC balance on connected network
 *  3c. Cash with Card → CardWithdrawalModal (existing 6-step Revolut flow)
 *  3d. Cash with Wallet → CryptoWithdrawalModal (existing 8-step crypto flow)
 */

// Minimal ERC-20 ABI for balanceOf + decimals
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

const ARTMDisplayModal = ({ agent, onClose }) => {
  // Screen states
  const [screen, setScreen] = useState("tap_display"); // tap_display | main_menu | revolut_permission | bank_balance | wallet_connecting | wallet_balance | card_flow | crypto_flow

  // Wallet state
  const [walletAddress, setWalletAddress] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);
  const [walletNetwork, setWalletNetwork] = useState(null);
  const [walletError, setWalletError] = useState(null);

  // Bank balance state (mock Revolut)
  const [bankBalance, setBankBalance] = useState(null);

  // Agent config
  const bankIntegrations = agent?.bank_integrations || [];
  const exchangeIntegrations = agent?.exchange_integrations || [];
  const displayConfig = agent?.terminal_display_config || {
    mock_balance_eur: 2450.67,
    mock_wallet_usdc: 1250.0,
    ui_theme: "revolut",
  };

  // ─── Revolut bank balance flow ────────────────────────────
  const handleBankBalance = () => {
    setScreen("revolut_permission");
  };

  const handleRevolutAllow = () => {
    // Simulate Revolut sharing balance
    const balance = displayConfig.mock_balance_eur || 2450.67;
    setBankBalance(balance);
    setScreen("bank_balance");
  };

  const handleRevolutDeny = () => {
    setScreen("main_menu");
  };

  // ─── Real MetaMask wallet balance flow ────────────────────
  const handleWalletBalance = useCallback(async () => {
    setScreen("wallet_connecting");
    setWalletError(null);

    try {
      if (!window.ethereum) {
        setWalletError("MetaMask not found. Please install MetaMask.");
        return;
      }

      // Request accounts (triggers MetaMask popup)
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const address = accounts[0];
      setWalletAddress(address);

      // Get current chain
      const chainIdHex = await window.ethereum.request({
        method: "eth_chainId",
      });
      const chainId = parseInt(chainIdHex, 16);

      // Map chain ID to network name
      const networkNames = {
        1: "Ethereum Mainnet",
        11155111: "Ethereum Sepolia",
        421614: "Arbitrum Sepolia",
        84532: "Base Sepolia",
        11155420: "OP Sepolia",
        43113: "Avalanche Fuji",
        296: "Hedera Testnet",
        137: "Polygon",
        10: "Optimism",
        42161: "Arbitrum One",
        8453: "Base",
      };
      setWalletNetwork(networkNames[chainId] || `Chain ${chainId}`);

      // Get USDC contract for this chain
      const usdcAddress = getUSDCContractForChain(chainId);

      if (!usdcAddress) {
        // No known USDC contract — show native balance instead
        const balanceHex = await window.ethereum.request({
          method: "eth_getBalance",
          params: [address, "latest"],
        });
        const balanceEth = parseFloat(
          ethers.utils.formatEther(balanceHex),
        ).toFixed(6);
        setWalletBalance({ amount: balanceEth, token: "ETH", chainId });
        setScreen("wallet_balance");
        return;
      }

      // Read USDC balance via ERC-20 balanceOf
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(usdcAddress, ERC20_ABI, provider);
      const decimals = await contract.decimals();
      const rawBalance = await contract.balanceOf(address);
      const formatted = parseFloat(
        ethers.utils.formatUnits(rawBalance, decimals),
      ).toFixed(2);

      setWalletBalance({ amount: formatted, token: "USDC", chainId });
      setScreen("wallet_balance");
    } catch (err) {
      console.error("MetaMask connection error:", err);
      if (err.code === 4001) {
        // User rejected
        setWalletError("Connection rejected by user.");
      } else {
        setWalletError(err.message || "Failed to connect wallet.");
      }
    }
  }, []);

  // ─── Cash flows (existing modals) ────────────────────────
  const handleCashWithCard = () => {
    if (bankIntegrations.length === 0) {
      alert("No bank integrations enabled for this terminal");
      return;
    }
    setScreen("card_flow");
  };

  const handleCashWithWallet = () => {
    if (exchangeIntegrations.length === 0) {
      alert("No exchange integrations enabled for this terminal");
      return;
    }
    setScreen("crypto_flow");
  };

  // ─── Render sub-flow modals ───────────────────────────────
  if (screen === "card_flow") {
    return (
      <CardWithdrawalModal
        agent={agent}
        bankIntegrations={bankIntegrations}
        displayConfig={displayConfig}
        onClose={() => setScreen("main_menu")}
        onBack={() => setScreen("main_menu")}
      />
    );
  }

  if (screen === "crypto_flow") {
    return (
      <CryptoWithdrawalModal
        agent={agent}
        exchangeIntegrations={exchangeIntegrations}
        displayConfig={displayConfig}
        onClose={() => setScreen("main_menu")}
        onBack={() => setScreen("main_menu")}
      />
    );
  }

  // ─── Shared overlay wrapper ───────────────────────────────
  const Overlay = ({ children, onBackdropClick }) => (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: Z_INDEX.ARTM_DISPLAY,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        backdropFilter: "blur(4px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && onBackdropClick) onBackdropClick();
      }}
    >
      {children}
    </div>
  );

  const Card = ({ children, style = {} }) => (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "20px",
        padding: "32px",
        width: "90%",
        maxWidth: "420px",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
        position: "relative",
        ...style,
      }}
    >
      {children}
    </div>
  );

  const CloseBtn = ({ onClick }) => (
    <button
      onClick={onClick}
      style={{
        position: "absolute",
        top: "12px",
        right: "12px",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "6px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        transition: "background-color 0.2s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.backgroundColor = "#f0f0f0")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.backgroundColor = "transparent")
      }
    >
      <X size={22} color="#333" />
    </button>
  );

  const BackBtn = ({ onClick }) => (
    <button
      onClick={onClick}
      style={{
        position: "absolute",
        top: "12px",
        left: "12px",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "6px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        transition: "background-color 0.2s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.backgroundColor = "#f0f0f0")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.backgroundColor = "transparent")
      }
    >
      <ArrowLeft size={22} color="#333" />
    </button>
  );

  // ═══════════════════════════════════════════════════════════
  // SCREEN 1: Tap on Display (blue ATM screen)
  // ═══════════════════════════════════════════════════════════
  if (screen === "tap_display") {
    return (
      <Overlay onBackdropClick={onClose}>
        <Card>
          <CloseBtn onClick={onClose} />
          <div style={{ textAlign: "center", marginBottom: "16px" }}>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#1a1a1a",
                margin: "0 0 4px 0",
              }}
            >
              {agent?.name || "ARTM"}
            </h2>
            <p style={{ fontSize: "13px", color: "#888", margin: 0 }}>
              AR Teller Machine
            </p>
          </div>

          {/* Blue ATM Display — tap to enter */}
          <button
            onClick={() => setScreen("main_menu")}
            style={{
              width: "100%",
              background: "linear-gradient(135deg, #0052ff 0%, #003ecb 100%)",
              border: "3px solid #001f7a",
              borderRadius: "16px",
              padding: "48px 24px",
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              boxShadow:
                "inset 0 2px 20px rgba(255,255,255,0.1), 0 4px 20px rgba(0,82,255,0.35)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.02)";
              e.currentTarget.style.boxShadow =
                "inset 0 2px 20px rgba(255,255,255,0.15), 0 6px 28px rgba(0,82,255,0.45)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow =
                "inset 0 2px 20px rgba(255,255,255,0.1), 0 4px 20px rgba(0,82,255,0.35)";
            }}
          >
            <span style={{ fontSize: "40px" }}>🏧</span>
            <span
              style={{
                color: "#ffffff",
                fontSize: "22px",
                fontWeight: "700",
                letterSpacing: "1px",
              }}
            >
              TAP ON DISPLAY
            </span>
            <span
              style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px" }}
            >
              Touch to start
            </span>
          </button>
        </Card>
      </Overlay>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // SCREEN 2: Main Menu — 2x2 grid of 4 buttons
  // ═══════════════════════════════════════════════════════════
  if (screen === "main_menu") {
    const btnStyle = (bg, enabled = true) => ({
      background: enabled ? bg : "#d1d5db",
      color: "#ffffff",
      border: "none",
      borderRadius: "16px",
      padding: "20px 12px",
      fontSize: "14px",
      fontWeight: "700",
      cursor: enabled ? "pointer" : "not-allowed",
      transition: "all 0.2s",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      boxShadow: enabled ? "0 4px 14px rgba(0,0,0,0.15)" : "none",
      minHeight: "110px",
    });

    return (
      <Overlay onBackdropClick={onClose}>
        <Card>
          <CloseBtn onClick={onClose} />
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <h2
              style={{
                fontSize: "22px",
                fontWeight: "bold",
                color: "#1a1a1a",
                margin: "0 0 4px 0",
              }}
            >
              {agent?.name || "ARTM"}
            </h2>
            <p style={{ fontSize: "13px", color: "#888", margin: 0 }}>
              Select an option
            </p>
          </div>

          {/* 2x2 Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "14px",
            }}
          >
            {/* Balance of my Bank Account */}
            <button
              onClick={handleBankBalance}
              disabled={bankIntegrations.length === 0}
              style={btnStyle(
                "linear-gradient(135deg, #0066ff, #004ecb)",
                bankIntegrations.length > 0,
              )}
            >
              <span style={{ fontSize: "28px" }}>🏦</span>
              <span style={{ lineHeight: "1.2", textAlign: "center" }}>
                Balance of my
                <br />
                Bank Account
              </span>
            </button>

            {/* Balance of my Wallet */}
            <button
              onClick={handleWalletBalance}
              style={btnStyle(
                "linear-gradient(135deg, #7c3aed, #5b21b6)",
                true,
              )}
            >
              <span style={{ fontSize: "28px" }}>🦊</span>
              <span style={{ lineHeight: "1.2", textAlign: "center" }}>
                Balance of my
                <br />
                Wallet
              </span>
            </button>

            {/* Cash with Card */}
            <button
              onClick={handleCashWithCard}
              disabled={bankIntegrations.length === 0}
              style={btnStyle(
                "linear-gradient(135deg, #10b981, #059669)",
                bankIntegrations.length > 0,
              )}
            >
              <span style={{ fontSize: "28px" }}>💳</span>
              <span style={{ lineHeight: "1.2", textAlign: "center" }}>
                Cash with
                <br />
                Card
              </span>
            </button>

            {/* Cash with Wallet */}
            <button
              onClick={handleCashWithWallet}
              disabled={exchangeIntegrations.length === 0}
              style={btnStyle(
                "linear-gradient(135deg, #f59e0b, #d97706)",
                exchangeIntegrations.length > 0,
              )}
            >
              <span style={{ fontSize: "28px" }}>💰</span>
              <span style={{ lineHeight: "1.2", textAlign: "center" }}>
                Cash with
                <br />
                Wallet
              </span>
            </button>
          </div>

          {/* Integration status bar */}
          <div
            style={{
              marginTop: "16px",
              padding: "10px 14px",
              backgroundColor: "#f8f9fa",
              borderRadius: "10px",
              fontSize: "12px",
              color: "#666",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>
              🏦{" "}
              {bankIntegrations.length > 0
                ? bankIntegrations.join(", ")
                : "No banks"}
            </span>
            <span>
              🪙{" "}
              {exchangeIntegrations.length > 0
                ? exchangeIntegrations.join(", ")
                : "No exchanges"}
            </span>
          </div>
        </Card>
      </Overlay>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // SCREEN 3a: Revolut Permission — "Allow Revolut to share..."
  // ═══════════════════════════════════════════════════════════
  if (screen === "revolut_permission") {
    return (
      <Overlay>
        <Card>
          <BackBtn onClick={() => setScreen("main_menu")} />
          <CloseBtn onClick={onClose} />

          <div
            style={{
              textAlign: "center",
              padding: "16px 0",
            }}
          >
            {/* Revolut-style blue header */}
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "16px",
                background:
                  "linear-gradient(135deg, #0066ff 0%, #003ecb 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                boxShadow: "0 4px 16px rgba(0,102,255,0.3)",
              }}
            >
              <span style={{ fontSize: "36px" }}>💳</span>
            </div>

            <h2
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                color: "#1a1a1a",
                margin: "0 0 12px 0",
              }}
            >
              Revolut
            </h2>

            <p
              style={{
                fontSize: "16px",
                color: "#444",
                margin: "0 0 8px 0",
                lineHeight: "1.4",
              }}
            >
              Allow <strong>Revolut</strong> to share your
              <br />
              account balance with
            </p>

            <p
              style={{
                fontSize: "18px",
                fontWeight: "700",
                color: "#0066ff",
                margin: "0 0 32px 0",
              }}
            >
              {agent?.name || "ARTM 1"} ?
            </p>

            {/* Info items */}
            <div
              style={{
                textAlign: "left",
                padding: "16px",
                backgroundColor: "#f0f7ff",
                borderRadius: "12px",
                marginBottom: "28px",
                fontSize: "13px",
                color: "#555",
              }}
            >
              <div style={{ marginBottom: "8px" }}>
                ✅ View your account balance
              </div>
              <div style={{ marginBottom: "8px" }}>
                🔒 Read-only access — no transactions
              </div>
              <div>⏱️ Access expires after this session</div>
            </div>

            {/* Yes / No buttons */}
            <div
              style={{ display: "flex", gap: "14px", justifyContent: "center" }}
            >
              <button
                onClick={handleRevolutDeny}
                style={{
                  flex: 1,
                  padding: "16px",
                  borderRadius: "14px",
                  border: "2px solid #e5e7eb",
                  background: "#ffffff",
                  color: "#333",
                  fontSize: "17px",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f3f4f6")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#ffffff")
                }
              >
                No
              </button>
              <button
                onClick={handleRevolutAllow}
                style={{
                  flex: 1,
                  padding: "16px",
                  borderRadius: "14px",
                  border: "none",
                  background:
                    "linear-gradient(135deg, #0066ff 0%, #004ecb 100%)",
                  color: "#ffffff",
                  fontSize: "17px",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  boxShadow: "0 4px 14px rgba(0,102,255,0.3)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "translateY(-1px)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "translateY(0)")
                }
              >
                Yes, Allow
              </button>
            </div>
          </div>
        </Card>
      </Overlay>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // SCREEN 3a-result: Revolut Balance on ATM display
  // ═══════════════════════════════════════════════════════════
  if (screen === "bank_balance") {
    return (
      <Overlay>
        <Card
          style={{
            background:
              "linear-gradient(160deg, #0052ff 0%, #003ecb 60%, #001a66 100%)",
            color: "#ffffff",
          }}
        >
          <BackBtn onClick={() => setScreen("main_menu")} />
          <CloseBtn onClick={onClose} />

          <div style={{ textAlign: "center", padding: "20px 0" }}>
            {/* Revolut logo area */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                marginBottom: "32px",
              }}
            >
              <span style={{ fontSize: "28px" }}>💳</span>
              <span
                style={{
                  fontSize: "22px",
                  fontWeight: "700",
                  letterSpacing: "1px",
                }}
              >
                Revolut
              </span>
            </div>

            {/* Balance */}
            <p
              style={{
                fontSize: "14px",
                color: "rgba(255,255,255,0.6)",
                margin: "0 0 8px 0",
                textTransform: "uppercase",
                letterSpacing: "2px",
              }}
            >
              Account Balance
            </p>
            <p
              style={{
                fontSize: "48px",
                fontWeight: "800",
                margin: "0 0 8px 0",
                letterSpacing: "-1px",
              }}
            >
              €{bankBalance?.toLocaleString("en", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p
              style={{
                fontSize: "13px",
                color: "rgba(255,255,255,0.5)",
                margin: "0 0 32px 0",
              }}
            >
              Revolut Personal • EUR
            </p>

            {/* Divider */}
            <div
              style={{
                borderTop: "1px solid rgba(255,255,255,0.15)",
                margin: "0 0 20px 0",
              }}
            />

            {/* Terminal info */}
            <div
              style={{
                fontSize: "12px",
                color: "rgba(255,255,255,0.4)",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>
                Shared with {agent?.name || "ARTM 1"}
              </span>
              <span>Session only</span>
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={handleCashWithCard}
            style={{
              width: "100%",
              marginTop: "16px",
              padding: "16px",
              borderRadius: "14px",
              border: "2px solid rgba(255,255,255,0.3)",
              background: "rgba(255,255,255,0.1)",
              color: "#ffffff",
              fontSize: "16px",
              fontWeight: "700",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.2)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.1)")
            }
          >
            💶 Cash with Card
          </button>
        </Card>
      </Overlay>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // SCREEN 3b-connecting: Wallet connecting (MetaMask popup open)
  // ═══════════════════════════════════════════════════════════
  if (screen === "wallet_connecting") {
    return (
      <Overlay>
        <Card>
          <BackBtn onClick={() => setScreen("main_menu")} />
          <CloseBtn onClick={onClose} />

          <div style={{ textAlign: "center", padding: "32px 0" }}>
            {walletError ? (
              <>
                <span style={{ fontSize: "48px" }}>⚠️</span>
                <h3
                  style={{
                    fontSize: "18px",
                    color: "#ef4444",
                    margin: "16px 0 8px",
                  }}
                >
                  Connection Failed
                </h3>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#666",
                    margin: "0 0 24px 0",
                  }}
                >
                  {walletError}
                </p>
                <button
                  onClick={() => {
                    setWalletError(null);
                    handleWalletBalance();
                  }}
                  style={{
                    padding: "12px 32px",
                    borderRadius: "12px",
                    border: "none",
                    background: "#7c3aed",
                    color: "#fff",
                    fontSize: "15px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Try Again
                </button>
              </>
            ) : (
              <>
                {/* Pulsing spinner */}
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    border: "4px solid #e5e7eb",
                    borderTopColor: "#7c3aed",
                    animation: "spin 1s linear infinite",
                    margin: "0 auto 20px",
                  }}
                />
                <style>
                  {`@keyframes spin { to { transform: rotate(360deg); } }`}
                </style>
                <h3
                  style={{
                    fontSize: "18px",
                    color: "#1a1a1a",
                    margin: "0 0 8px",
                  }}
                >
                  Connecting to MetaMask...
                </h3>
                <p style={{ fontSize: "14px", color: "#888", margin: 0 }}>
                  Please confirm in your wallet
                </p>
              </>
            )}
          </div>
        </Card>
      </Overlay>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // SCREEN 3b-result: Real wallet USDC balance on ATM display
  // ═══════════════════════════════════════════════════════════
  if (screen === "wallet_balance") {
    const shortAddr = walletAddress
      ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
      : "";

    return (
      <Overlay>
        <Card
          style={{
            background:
              "linear-gradient(160deg, #7c3aed 0%, #5b21b6 60%, #3b0764 100%)",
            color: "#ffffff",
          }}
        >
          <BackBtn onClick={() => setScreen("main_menu")} />
          <CloseBtn onClick={onClose} />

          <div style={{ textAlign: "center", padding: "20px 0" }}>
            {/* Wallet header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                marginBottom: "8px",
              }}
            >
              <span style={{ fontSize: "28px" }}>🦊</span>
              <span
                style={{
                  fontSize: "22px",
                  fontWeight: "700",
                  letterSpacing: "1px",
                }}
              >
                MetaMask
              </span>
            </div>

            <p
              style={{
                fontSize: "12px",
                color: "rgba(255,255,255,0.5)",
                margin: "0 0 24px 0",
                fontFamily: "monospace",
              }}
            >
              {shortAddr}
            </p>

            {/* Balance */}
            <p
              style={{
                fontSize: "14px",
                color: "rgba(255,255,255,0.6)",
                margin: "0 0 8px 0",
                textTransform: "uppercase",
                letterSpacing: "2px",
              }}
            >
              {walletBalance?.token} Balance
            </p>
            <p
              style={{
                fontSize: "48px",
                fontWeight: "800",
                margin: "0 0 8px 0",
                letterSpacing: "-1px",
              }}
            >
              {walletBalance?.amount}{" "}
              <span style={{ fontSize: "24px", fontWeight: "600" }}>
                {walletBalance?.token}
              </span>
            </p>
            <p
              style={{
                fontSize: "13px",
                color: "rgba(255,255,255,0.5)",
                margin: "0 0 32px 0",
              }}
            >
              {walletNetwork}
            </p>

            {/* Divider */}
            <div
              style={{
                borderTop: "1px solid rgba(255,255,255,0.15)",
                margin: "0 0 20px 0",
              }}
            />

            {/* Terminal info */}
            <div
              style={{
                fontSize: "12px",
                color: "rgba(255,255,255,0.4)",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>Connected to {agent?.name || "ARTM 1"}</span>
              <span>Live balance</span>
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={handleCashWithWallet}
            disabled={exchangeIntegrations.length === 0}
            style={{
              width: "100%",
              marginTop: "16px",
              padding: "16px",
              borderRadius: "14px",
              border: "2px solid rgba(255,255,255,0.3)",
              background:
                exchangeIntegrations.length > 0
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(255,255,255,0.05)",
              color:
                exchangeIntegrations.length > 0
                  ? "#ffffff"
                  : "rgba(255,255,255,0.4)",
              fontSize: "16px",
              fontWeight: "700",
              cursor:
                exchangeIntegrations.length > 0 ? "pointer" : "not-allowed",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (exchangeIntegrations.length > 0)
                e.currentTarget.style.background = "rgba(255,255,255,0.2)";
            }}
            onMouseLeave={(e) => {
              if (exchangeIntegrations.length > 0)
                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
            }}
          >
            💰 Cash with Wallet
          </button>
        </Card>
      </Overlay>
    );
  }

  // Fallback (should not reach here)
  return null;
};

export default ARTMDisplayModal;
