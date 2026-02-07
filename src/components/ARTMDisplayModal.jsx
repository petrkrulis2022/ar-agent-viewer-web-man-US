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
  "function transfer(address to, uint256 amount) returns (bool)",
];

const ARTMDisplayModal = ({ agent, onClose }) => {
  // Screen states
  const [screen, setScreen] = useState("tap_display"); // tap_display | main_menu | revolut_permission | bank_balance | wallet_permission | wallet_connecting | wallet_balance | card_flow | crypto_flow

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
        walletBalance={walletBalance}
        walletAddress={walletAddress}
        walletNetwork={walletNetwork}
        onClose={() => setScreen("main_menu")}
        onBack={() => setScreen("wallet_balance")}
      />
    );
  }

  // ─── ATM CSS animations ────────────────────────────────────
  const atmStyles = `
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes scanline {
      0% { top: 0%; }
      100% { top: 100%; }
    }
    @keyframes ledPulse {
      0%, 100% { opacity: 1; box-shadow: 0 0 6px #00ff88; }
      50% { opacity: 0.5; box-shadow: 0 0 2px #00ff88; }
    }
  `;

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
        backgroundColor: "rgba(0, 0, 0, 0.55)",
        backdropFilter: "blur(6px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && onBackdropClick) onBackdropClick();
      }}
    >
      <style>{atmStyles}</style>
      {children}
    </div>
  );

  // ─── Physical ATM body (metallic bezel + screen) ──────────
  const Card = ({ children, style = {}, screenBg }) => (
    <div
      style={{
        // Outer metallic ATM body
        background:
          "linear-gradient(170deg, #3a3a3a 0%, #1a1a1a 40%, #0d0d0d 100%)",
        borderRadius: "18px",
        padding: "14px",
        width: "92%",
        maxWidth: "440px",
        boxShadow:
          "0 30px 80px rgba(0,0,0,0.6), " +
          "0 0 0 1px rgba(255,255,255,0.08), " +
          "inset 0 1px 0 rgba(255,255,255,0.12), " +
          "inset 0 -2px 0 rgba(0,0,0,0.4)",
        position: "relative",
      }}
    >
      {/* Top bezel — brand strip + LED */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "6px 10px 10px",
        }}
      >
        <span
          style={{
            color: "rgba(255,255,255,0.35)",
            fontSize: "10px",
            fontWeight: "700",
            letterSpacing: "3px",
            textTransform: "uppercase",
          }}
        >
          ARTM
        </span>
        {/* LED indicator */}
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: "#00ff88",
            boxShadow: "0 0 6px #00ff88",
            animation: "ledPulse 2s ease-in-out infinite",
          }}
        />
      </div>

      {/* Inner screen area */}
      <div
        style={{
          background:
            screenBg || "linear-gradient(180deg, #f5f5f7 0%, #e8e8ec 100%)",
          borderRadius: "10px",
          padding: "28px 24px",
          position: "relative",
          overflow: "hidden",
          // Recessed screen bevel
          boxShadow:
            "inset 0 2px 8px rgba(0,0,0,0.25), " +
            "inset 0 0 0 1px rgba(0,0,0,0.15), " +
            "0 1px 0 rgba(255,255,255,0.06)",
          ...style,
        }}
      >
        {/* Screen gloss / reflection overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "40%",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 100%)",
            pointerEvents: "none",
            borderRadius: "10px 10px 0 0",
          }}
        />
        {/* Scan line */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            height: "1px",
            background: "rgba(255,255,255,0.06)",
            animation: "scanline 4s linear infinite",
            pointerEvents: "none",
          }}
        />
        {children}
      </div>

      {/* Bottom bezel — screw holes + card slot hint */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px 4px",
        }}
      >
        {/* Screw hole left */}
        <div
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "radial-gradient(circle, #555 30%, #222 70%)",
            boxShadow: "inset 0 1px 1px rgba(0,0,0,0.6)",
          }}
        />
        {/* Card slot */}
        <div
          style={{
            width: "50px",
            height: "4px",
            borderRadius: "2px",
            background: "linear-gradient(90deg, #222, #333, #222)",
            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5)",
          }}
        />
        {/* Screw hole right */}
        <div
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "radial-gradient(circle, #555 30%, #222 70%)",
            boxShadow: "inset 0 1px 1px rgba(0,0,0,0.6)",
          }}
        />
      </div>
    </div>
  );

  // ─── Hardware-style ATM buttons ────────────────────────────
  const CloseBtn = ({ onClick }) => (
    <button
      onClick={onClick}
      style={{
        position: "absolute",
        top: "8px",
        right: "8px",
        background: "rgba(0,0,0,0.15)",
        border: "1px solid rgba(0,0,0,0.1)",
        cursor: "pointer",
        padding: "5px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "6px",
        transition: "all 0.15s",
        boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
        zIndex: 5,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(0,0,0,0.25)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(0,0,0,0.15)";
      }}
    >
      <X size={18} color="#666" />
    </button>
  );

  const BackBtn = ({ onClick }) => (
    <button
      onClick={onClick}
      style={{
        position: "absolute",
        top: "8px",
        left: "8px",
        background: "rgba(0,0,0,0.15)",
        border: "1px solid rgba(0,0,0,0.1)",
        cursor: "pointer",
        padding: "5px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "6px",
        transition: "all 0.15s",
        boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
        zIndex: 5,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(0,0,0,0.25)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(0,0,0,0.15)";
      }}
    >
      <ArrowLeft size={18} color="#666" />
    </button>
  );

  // ═══════════════════════════════════════════════════════════
  // SCREEN 1: Tap on Display (blue ATM screen)
  // ═══════════════════════════════════════════════════════════
  if (screen === "tap_display") {
    return (
      <Overlay onBackdropClick={onClose}>
        <Card screenBg="linear-gradient(160deg, #0a1628 0%, #0d2847 50%, #0a1628 100%)">
          <CloseBtn onClick={onClose} />
          <div
            style={{
              textAlign: "center",
              marginBottom: "12px",
              position: "relative",
              zIndex: 2,
            }}
          >
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                color: "rgba(255,255,255,0.85)",
                margin: "0 0 2px 0",
                textShadow: "0 0 12px rgba(0,140,255,0.4)",
              }}
            >
              {agent?.name || "ARTM"}
            </h2>
            <p
              style={{
                fontSize: "11px",
                color: "rgba(255,255,255,0.35)",
                margin: 0,
                letterSpacing: "2px",
                textTransform: "uppercase",
              }}
            >
              AR Teller Machine
            </p>
          </div>

          {/* Blue ATM Display — tap to enter */}
          <button
            onClick={() => setScreen("main_menu")}
            style={{
              width: "100%",
              background: "linear-gradient(135deg, #0052ff 0%, #003ecb 100%)",
              border: "2px solid rgba(0,100,255,0.4)",
              borderRadius: "12px",
              padding: "44px 24px",
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              position: "relative",
              zIndex: 2,
              boxShadow:
                "inset 0 1px 20px rgba(255,255,255,0.08), 0 0 30px rgba(0,82,255,0.25)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.02)";
              e.currentTarget.style.boxShadow =
                "inset 0 2px 24px rgba(255,255,255,0.12), 0 0 40px rgba(0,82,255,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow =
                "inset 0 1px 20px rgba(255,255,255,0.08), 0 0 30px rgba(0,82,255,0.25)";
            }}
          >
            <span
              style={{
                fontSize: "36px",
                filter: "drop-shadow(0 0 8px rgba(0,140,255,0.5))",
              }}
            >
              🏧
            </span>
            <span
              style={{
                color: "#ffffff",
                fontSize: "20px",
                fontWeight: "700",
                letterSpacing: "2px",
                textShadow: "0 0 10px rgba(0,140,255,0.5)",
              }}
            >
              TAP ON DISPLAY
            </span>
            <span
              style={{
                color: "rgba(255,255,255,0.45)",
                fontSize: "11px",
                letterSpacing: "1px",
              }}
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
    const atmBtnStyle = (color1, color2, enabled = true) => ({
      background: enabled
        ? `linear-gradient(180deg, ${color1} 0%, ${color2} 100%)`
        : "linear-gradient(180deg, #3a3a3a, #252525)",
      color: enabled ? "#ffffff" : "rgba(255,255,255,0.3)",
      border: enabled
        ? `1px solid ${color1}55`
        : "1px solid rgba(255,255,255,0.06)",
      borderRadius: "10px",
      padding: "18px 10px",
      fontSize: "12px",
      fontWeight: "700",
      cursor: enabled ? "pointer" : "not-allowed",
      transition: "all 0.2s",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "6px",
      boxShadow: enabled
        ? `inset 0 1px 0 rgba(255,255,255,0.15), 0 4px 12px rgba(0,0,0,0.3), 0 0 20px ${color1}22`
        : "inset 0 1px 0 rgba(255,255,255,0.04)",
      minHeight: "100px",
      letterSpacing: "0.5px",
      textShadow: enabled ? `0 0 8px ${color1}66` : "none",
    });

    return (
      <Overlay onBackdropClick={onClose}>
        <Card screenBg="linear-gradient(180deg, #0a1628 0%, #0d2140 50%, #081422 100%)">
          <CloseBtn onClick={onClose} />
          <div
            style={{
              textAlign: "center",
              marginBottom: "16px",
              position: "relative",
              zIndex: 2,
            }}
          >
            <h2
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                color: "rgba(255,255,255,0.85)",
                margin: "0 0 2px 0",
                textShadow: "0 0 12px rgba(0,140,255,0.3)",
              }}
            >
              {agent?.name || "ARTM"}
            </h2>
            <p
              style={{
                fontSize: "11px",
                color: "rgba(255,255,255,0.35)",
                margin: 0,
                letterSpacing: "2px",
                textTransform: "uppercase",
              }}
            >
              Select an option
            </p>
          </div>

          {/* 2x2 Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
              position: "relative",
              zIndex: 2,
            }}
          >
            {/* Balance of my Bank Account */}
            <button
              onClick={handleBankBalance}
              disabled={bankIntegrations.length === 0}
              style={atmBtnStyle(
                "#0066ff",
                "#003399",
                bankIntegrations.length > 0,
              )}
            >
              <span
                style={{
                  fontSize: "24px",
                  filter: "drop-shadow(0 0 4px rgba(0,100,255,0.5))",
                }}
              >
                🏦
              </span>
              <span style={{ lineHeight: "1.2", textAlign: "center" }}>
                Balance of my
                <br />
                Bank Account
              </span>
            </button>

            {/* Balance of my Wallet */}
            <button
              onClick={() => setScreen("wallet_permission")}
              style={atmBtnStyle("#7c3aed", "#4c1d95", true)}
            >
              <span
                style={{
                  fontSize: "24px",
                  filter: "drop-shadow(0 0 4px rgba(124,58,237,0.5))",
                }}
              >
                🦊
              </span>
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
              style={atmBtnStyle(
                "#10b981",
                "#065f46",
                bankIntegrations.length > 0,
              )}
            >
              <span
                style={{
                  fontSize: "24px",
                  filter: "drop-shadow(0 0 4px rgba(16,185,129,0.5))",
                }}
              >
                💳
              </span>
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
              style={atmBtnStyle(
                "#f59e0b",
                "#92400e",
                exchangeIntegrations.length > 0,
              )}
            >
              <span
                style={{
                  fontSize: "24px",
                  filter: "drop-shadow(0 0 4px rgba(245,158,11,0.5))",
                }}
              >
                💰
              </span>
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
              marginTop: "12px",
              padding: "8px 12px",
              background: "rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "6px",
              fontSize: "10px",
              color: "rgba(255,255,255,0.35)",
              display: "flex",
              justifyContent: "space-between",
              position: "relative",
              zIndex: 2,
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
        <Card screenBg="linear-gradient(180deg, #f5f5f7 0%, #e8e8ec 100%)">
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
                background: "linear-gradient(135deg, #0066ff 0%, #003ecb 100%)",
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
              Allow <strong>Revolut</strong> to share
              <br />
              <strong>Martin Egger's</strong> account balance with
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
                  padding: "14px",
                  borderRadius: "10px",
                  border: "1px solid #ccc",
                  background:
                    "linear-gradient(180deg, #f0f0f0 0%, #d8d8d8 100%)",
                  color: "#333",
                  fontSize: "16px",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.8), 0 2px 6px rgba(0,0,0,0.1)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background =
                    "linear-gradient(180deg, #e0e0e0 0%, #c8c8c8 100%)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background =
                    "linear-gradient(180deg, #f0f0f0 0%, #d8d8d8 100%)")
                }
              >
                No
              </button>
              <button
                onClick={handleRevolutAllow}
                style={{
                  flex: 1,
                  padding: "14px",
                  borderRadius: "10px",
                  border: "1px solid rgba(0,80,255,0.4)",
                  background:
                    "linear-gradient(180deg, #0066ff 0%, #003ecb 100%)",
                  color: "#ffffff",
                  fontSize: "16px",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 12px rgba(0,80,255,0.3)",
                  letterSpacing: "0.5px",
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
          screenBg="linear-gradient(160deg, #0052ff 0%, #003ecb 60%, #001a66 100%)"
          style={{ color: "#ffffff" }}
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
              €
              {bankBalance?.toLocaleString("en", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p
              style={{
                fontSize: "15px",
                color: "rgba(255,255,255,0.8)",
                margin: "0 0 4px 0",
                fontWeight: "600",
              }}
            >
              Martin Egger
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
              <span>Shared with {agent?.name || "ARTM 1"}</span>
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
  // SCREEN 3b-permission: MetaMask permission request
  // ═══════════════════════════════════════════════════════════
  if (screen === "wallet_permission") {
    return (
      <Overlay>
        <Card screenBg="#ffffff" style={{ color: "#1a1a1a" }}>
          <BackBtn onClick={() => setScreen("main_menu")} light={false} />
          <CloseBtn onClick={onClose} light={false} />

          <div style={{ textAlign: "center", padding: "20px 20px 24px" }}>
            {/* MetaMask icon */}
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "16px",
                background: "linear-gradient(135deg, #7c3aed, #5b21b6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                fontSize: "36px",
              }}
            >
              🦊
            </div>

            <h2
              style={{
                fontSize: "24px",
                fontWeight: "800",
                margin: "0 0 12px 0",
                color: "#1a1a1a",
              }}
            >
              MetaMask
            </h2>

            <p
              style={{
                fontSize: "16px",
                color: "#444",
                margin: "0 0 8px 0",
                lineHeight: "1.4",
              }}
            >
              Allow <strong>MetaMask</strong> to share your
              <br />
              wallet balance with
            </p>

            <p
              style={{
                fontSize: "18px",
                fontWeight: "700",
                color: "#7c3aed",
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
                backgroundColor: "#f5f0ff",
                borderRadius: "12px",
                marginBottom: "28px",
                fontSize: "13px",
                color: "#555",
              }}
            >
              <div style={{ marginBottom: "8px" }}>
                ✅ View your USDC wallet balance
              </div>
              <div style={{ marginBottom: "8px" }}>
                🔒 Read-only access — no transactions without approval
              </div>
              <div style={{ marginBottom: "8px" }}>
                🌐 Reads balance on your current network
              </div>
              <div>⏱️ Access expires after this session</div>
            </div>

            {/* Yes / No buttons */}
            <div
              style={{ display: "flex", gap: "14px", justifyContent: "center" }}
            >
              <button
                onClick={() => setScreen("main_menu")}
                style={{
                  flex: 1,
                  padding: "14px",
                  borderRadius: "10px",
                  border: "1px solid #ccc",
                  background:
                    "linear-gradient(180deg, #f0f0f0 0%, #d8d8d8 100%)",
                  color: "#333",
                  fontSize: "16px",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.8), 0 2px 6px rgba(0,0,0,0.1)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background =
                    "linear-gradient(180deg, #e0e0e0 0%, #c8c8c8 100%)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background =
                    "linear-gradient(180deg, #f0f0f0 0%, #d8d8d8 100%)")
                }
              >
                No
              </button>
              <button
                onClick={handleWalletBalance}
                style={{
                  flex: 1,
                  padding: "14px",
                  borderRadius: "10px",
                  border: "1px solid rgba(124,58,237,0.4)",
                  background:
                    "linear-gradient(180deg, #7c3aed 0%, #5b21b6 100%)",
                  color: "#ffffff",
                  fontSize: "16px",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 12px rgba(124,58,237,0.3)",
                  letterSpacing: "0.5px",
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
  // SCREEN 3b-connecting: Wallet connecting (MetaMask popup open)
  // ═══════════════════════════════════════════════════════════
  if (screen === "wallet_connecting") {
    return (
      <Overlay>
        <Card screenBg="linear-gradient(180deg, #0a1628 0%, #0d2140 50%, #081422 100%)">
          <BackBtn onClick={() => setScreen("main_menu")} />
          <CloseBtn onClick={onClose} />

          <div style={{ textAlign: "center", padding: "32px 0" }}>
            {walletError ? (
              <>
                <span style={{ fontSize: "48px" }}>⚠️</span>
                <h3
                  style={{
                    fontSize: "18px",
                    color: "#ff6b6b",
                    margin: "16px 0 8px",
                    textShadow: "0 0 8px rgba(255,100,100,0.3)",
                  }}
                >
                  Connection Failed
                </h3>
                <p
                  style={{
                    fontSize: "14px",
                    color: "rgba(255,255,255,0.5)",
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
                    borderRadius: "10px",
                    border: "1px solid rgba(124,58,237,0.4)",
                    background:
                      "linear-gradient(180deg, #7c3aed 0%, #5b21b6 100%)",
                    color: "#fff",
                    fontSize: "15px",
                    fontWeight: "700",
                    cursor: "pointer",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.15), 0 4px 12px rgba(0,0,0,0.3), 0 0 20px rgba(124,58,237,0.15)",
                    letterSpacing: "0.5px",
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
                    border: "4px solid rgba(255,255,255,0.1)",
                    borderTopColor: "#7c3aed",
                    animation: "spin 1s linear infinite",
                    margin: "0 auto 20px",
                    boxShadow: "0 0 20px rgba(124,58,237,0.2)",
                  }}
                />
                <h3
                  style={{
                    fontSize: "18px",
                    color: "rgba(255,255,255,0.85)",
                    margin: "0 0 8px",
                    textShadow: "0 0 10px rgba(124,58,237,0.4)",
                  }}
                >
                  Connecting to MetaMask...
                </h3>
                <p
                  style={{
                    fontSize: "14px",
                    color: "rgba(255,255,255,0.45)",
                    margin: 0,
                  }}
                >
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
          screenBg="linear-gradient(160deg, #7c3aed 0%, #5b21b6 60%, #3b0764 100%)"
          style={{ color: "#ffffff" }}
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

          {/* Cancel button */}
          <button
            onClick={() => setScreen("main_menu")}
            style={{
              width: "100%",
              marginTop: "12px",
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.2)",
              background: "transparent",
              color: "rgba(255,255,255,0.6)",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#ffffff";
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(255,255,255,0.6)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            ← Back to Menu
          </button>
        </Card>
      </Overlay>
    );
  }

  // Fallback (should not reach here)
  return null;
};

export default ARTMDisplayModal;
