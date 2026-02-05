import React, { useState } from "react";
import { X } from "lucide-react";
import Z_INDEX from "../constants/zIndexConfig";
import CardWithdrawalModal from "./CardWithdrawalModal";
import CryptoWithdrawalModal from "./CryptoWithdrawalModal";

/**
 * ARTM Display Modal - Main interface for Virtual Terminal agents
 *
 * Features:
 * - Camera feed visible behind modal (transparent overlay)
 * - Two main action buttons: Card Withdrawal & Crypto Withdrawal
 * - Shows enabled bank integrations from agent configuration
 * - Opens appropriate flow modal based on user selection
 */
const ARTMDisplayModal = ({ agent, onClose }) => {
  const [showCardFlow, setShowCardFlow] = useState(false);
  const [showCryptoFlow, setShowCryptoFlow] = useState(false);

  // Get bank and exchange integrations from agent
  const bankIntegrations = agent?.bank_integrations || [];
  const exchangeIntegrations = agent?.exchange_integrations || [];

  // Get terminal display config
  const displayConfig = agent?.terminal_display_config || {
    mock_balance_eur: 2450.67,
    mock_wallet_usdc: 1250.0,
    ui_theme: "revolut",
  };

  const handleCardWithdrawal = () => {
    if (bankIntegrations.length === 0) {
      alert("No bank integrations enabled for this terminal");
      return;
    }
    setShowCardFlow(true);
  };

  const handleCryptoWithdrawal = () => {
    if (exchangeIntegrations.length === 0) {
      alert("No exchange integrations enabled for this terminal");
      return;
    }
    setShowCryptoFlow(true);
  };

  // If showing a flow modal, render it instead
  if (showCardFlow) {
    return (
      <CardWithdrawalModal
        agent={agent}
        bankIntegrations={bankIntegrations}
        displayConfig={displayConfig}
        onClose={() => setShowCardFlow(false)}
        onBack={() => setShowCardFlow(false)}
      />
    );
  }

  if (showCryptoFlow) {
    return (
      <CryptoWithdrawalModal
        agent={agent}
        exchangeIntegrations={exchangeIntegrations}
        displayConfig={displayConfig}
        onClose={() => setShowCryptoFlow(false)}
        onBack={() => setShowCryptoFlow(false)}
      />
    );
  }

  return (
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
        // Transparent overlay - camera feed visible behind
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        backdropFilter: "blur(4px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          padding: "40px",
          width: "90%",
          maxWidth: "500px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          position: "relative",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "8px",
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
          <X size={24} color="#333" />
        </button>

        {/* Terminal header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h2
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              color: "#1a1a1a",
              marginBottom: "8px",
            }}
          >
            {agent?.name || "Virtual Terminal"}
          </h2>
          <p
            style={{
              fontSize: "14px",
              color: "#666",
              marginTop: "0",
            }}
          >
            AR Teller Machine
          </p>
        </div>

        {/* Main action buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Card Withdrawal Button */}
          <button
            onClick={handleCardWithdrawal}
            disabled={bankIntegrations.length === 0}
            style={{
              backgroundColor:
                bankIntegrations.length > 0 ? "#0066ff" : "#cccccc",
              color: "#ffffff",
              border: "none",
              borderRadius: "16px",
              padding: "24px",
              fontSize: "20px",
              fontWeight: "bold",
              cursor: bankIntegrations.length > 0 ? "pointer" : "not-allowed",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              boxShadow: "0 4px 12px rgba(0, 102, 255, 0.2)",
            }}
            onMouseEnter={(e) => {
              if (bankIntegrations.length > 0) {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 16px rgba(0, 102, 255, 0.3)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(0, 102, 255, 0.2)";
            }}
          >
            <span style={{ fontSize: "32px" }}>🏦</span>
            <span>TAP ON CARD</span>
          </button>

          {/* Crypto Withdrawal Button */}
          <button
            onClick={handleCryptoWithdrawal}
            disabled={exchangeIntegrations.length === 0}
            style={{
              backgroundColor:
                exchangeIntegrations.length > 0 ? "#10b981" : "#cccccc",
              color: "#ffffff",
              border: "none",
              borderRadius: "16px",
              padding: "24px",
              fontSize: "20px",
              fontWeight: "bold",
              cursor:
                exchangeIntegrations.length > 0 ? "pointer" : "not-allowed",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)",
            }}
            onMouseEnter={(e) => {
              if (exchangeIntegrations.length > 0) {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 16px rgba(16, 185, 129, 0.3)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(16, 185, 129, 0.2)";
            }}
          >
            <span style={{ fontSize: "32px" }}>💰</span>
            <span>TAP ON WALLET</span>
          </button>
        </div>

        {/* Integration status */}
        <div
          style={{
            marginTop: "24px",
            padding: "16px",
            backgroundColor: "#f8f9fa",
            borderRadius: "12px",
            fontSize: "13px",
            color: "#666",
          }}
        >
          <div style={{ marginBottom: "8px" }}>
            <strong>Enabled Banks:</strong>{" "}
            {bankIntegrations.length > 0 ? bankIntegrations.join(", ") : "None"}
          </div>
          <div>
            <strong>Enabled Exchanges:</strong>{" "}
            {exchangeIntegrations.length > 0
              ? exchangeIntegrations.join(", ")
              : "None"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ARTMDisplayModal;
