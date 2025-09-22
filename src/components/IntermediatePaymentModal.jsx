import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import "./IntermediatePaymentModal.css";

/**
 * Intermediate Payment Modal - Transaction Validation & Debugging Component
 *
 * This modal intercepts CCIP transactions before they reach MetaMask to:
 * 1. Display transaction structure in human-readable format
 * 2. Validate ETH value vs Token amount separation
 * 3. Show CCIP fee breakdown and gas estimates
 * 4. Prevent incorrect transactions from being sent
 *
 * Critical for debugging the ETH vs USDC transaction issue.
 */
const IntermediatePaymentModal = ({
  isOpen,
  onClose,
  onConfirm,
  transactionData,
  agentData,
}) => {
  const [validationStatus, setValidationStatus] = useState(null);
  const [transactionBreakdown, setTransactionBreakdown] = useState(null);

  useEffect(() => {
    if (isOpen && transactionData) {
      analyzeTransaction();
    }
  }, [isOpen, transactionData]);

  const analyzeTransaction = () => {
    try {
      console.log("🔍 Analyzing transaction structure:", transactionData);

      // Extract key transaction components
      const ethValue = transactionData.value || "0";
      const ethValueFormatted = ethers.utils.formatEther(ethValue);
      const gasLimit = transactionData.gasLimit || "300000";
      const estimatedFee = transactionData.estimatedFee || "0";
      const feeFormatted = ethers.utils.formatEther(estimatedFee);

      // Analyze transaction type
      const isCCIPTransaction =
        transactionData.data && transactionData.data.length > 10;
      const isDirectTransfer =
        !isCCIPTransaction && parseFloat(ethValueFormatted) > 0;

      // Extract CCIP message details if available
      let tokenAmount = null;
      let tokenSymbol = "USDC";
      let recipientAddress = null;

      if (transactionData.amount) {
        tokenAmount = transactionData.amount;
      }

      if (transactionData.recipient) {
        recipientAddress = transactionData.recipient;
      }

      // Validation checks
      const validationResults = {
        correctStructure: isCCIPTransaction,
        separateTokenAmount: !!tokenAmount,
        reasonableEthValue: parseFloat(ethValueFormatted) < 0.01, // Should be small for fees only
        hasRecipient: !!recipientAddress,
        gasEstimateReasonable: parseInt(gasLimit) <= 500000,
      };

      const allValid = Object.values(validationResults).every(Boolean);

      // Detect common errors
      const errors = [];
      if (isDirectTransfer) {
        errors.push(
          `🚨 CRITICAL: Sending ${ethValueFormatted} ETH directly - should be USDC token transfer`
        );
      }
      if (parseFloat(ethValueFormatted) > 0.01) {
        errors.push(
          `⚠️ HIGH ETH VALUE: ${ethValueFormatted} ETH seems too high for CCIP fees`
        );
      }
      if (!isCCIPTransaction) {
        errors.push(
          `❌ Missing CCIP transaction data - not a proper cross-chain transfer`
        );
      }

      setTransactionBreakdown({
        // Transaction Structure
        ethValue: ethValueFormatted,
        ethValueWei: ethValue,
        tokenAmount: tokenAmount || "Unknown",
        tokenSymbol: tokenSymbol,
        recipient: recipientAddress || "Unknown",

        // Technical Details
        gasLimit: parseInt(gasLimit).toLocaleString(),
        estimatedFee: feeFormatted,
        isCCIPTransaction: isCCIPTransaction,
        isDirectTransfer: isDirectTransfer,

        // Validation
        validationResults: validationResults,
        allValid: allValid,
        errors: errors,

        // Raw Data
        rawTransaction: transactionData,
      });

      setValidationStatus(allValid ? "valid" : "invalid");
    } catch (error) {
      console.error("❌ Transaction analysis failed:", error);
      setValidationStatus("error");
      setTransactionBreakdown({
        errors: [`Analysis failed: ${error.message}`],
        rawTransaction: transactionData,
      });
    }
  };

  const handleConfirm = () => {
    if (validationStatus === "valid") {
      console.log("✅ Transaction validated, proceeding to MetaMask");
      onConfirm(transactionData);
    } else {
      console.warn("⚠️ User confirmed invalid transaction");
      // Still allow confirmation but with warning
      onConfirm(transactionData);
    }
  };

  const formatAddress = (address) => {
    if (!address) return "Unknown";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!isOpen) return null;

  return (
    <div className="intermediate-payment-modal-overlay">
      <div className="intermediate-payment-modal">
        {/* Header */}
        <div className="modal-header">
          <h2>🔍 Transaction Review</h2>
          <p>Review transaction details before sending to MetaMask</p>
        </div>

        {/* Agent Info */}
        {agentData && (
          <div className="agent-info-section">
            <h3>💫 Payment To</h3>
            <div className="agent-details">
              <span className="agent-name">
                {agentData.name || "Unknown Agent"}
              </span>
              <span className="agent-address">
                {formatAddress(agentData.agent_wallet_address)}
              </span>
            </div>
          </div>
        )}

        {/* Transaction Breakdown */}
        {transactionBreakdown && (
          <div className="transaction-breakdown">
            <h3>💳 Transaction Structure</h3>

            {/* Critical Values */}
            <div className="critical-values">
              <div className="value-row">
                <span className="label">ETH Value:</span>
                <span
                  className={`value ${
                    parseFloat(transactionBreakdown.ethValue) > 0.01
                      ? "warning"
                      : "normal"
                  }`}
                >
                  {transactionBreakdown.ethValue} ETH
                </span>
              </div>

              <div className="value-row">
                <span className="label">Token Amount:</span>
                <span className="value">
                  {transactionBreakdown.tokenAmount}{" "}
                  {transactionBreakdown.tokenSymbol}
                </span>
              </div>

              <div className="value-row">
                <span className="label">CCIP Fee:</span>
                <span className="value">
                  {transactionBreakdown.estimatedFee} ETH
                </span>
              </div>

              <div className="value-row">
                <span className="label">Gas Limit:</span>
                <span className="value">{transactionBreakdown.gasLimit}</span>
              </div>
            </div>

            {/* Transaction Type */}
            <div className="transaction-type">
              <h4>🔄 Transaction Type</h4>
              <div
                className={`type-indicator ${
                  transactionBreakdown.isCCIPTransaction ? "ccip" : "direct"
                }`}
              >
                {transactionBreakdown.isCCIPTransaction
                  ? "🌉 CCIP Cross-Chain Transfer"
                  : "💸 Direct Transfer"}
              </div>
            </div>

            {/* Validation Status */}
            <div className="validation-section">
              <h4>✅ Validation Status</h4>
              <div className={`validation-status ${validationStatus}`}>
                {validationStatus === "valid" &&
                  "✅ Transaction structure looks correct"}
                {validationStatus === "invalid" && "❌ Transaction has issues"}
                {validationStatus === "error" && "🚨 Analysis failed"}
              </div>

              {/* Validation Details */}
              {transactionBreakdown.validationResults && (
                <div className="validation-details">
                  {Object.entries(transactionBreakdown.validationResults).map(
                    ([check, passed]) => (
                      <div
                        key={check}
                        className={`validation-check ${
                          passed ? "pass" : "fail"
                        }`}
                      >
                        {passed ? "✅" : "❌"}{" "}
                        {check.replace(/([A-Z])/g, " $1").toLowerCase()}
                      </div>
                    )
                  )}
                </div>
              )}

              {/* Errors */}
              {transactionBreakdown.errors &&
                transactionBreakdown.errors.length > 0 && (
                  <div className="error-section">
                    <h4>🚨 Issues Detected</h4>
                    {transactionBreakdown.errors.map((error, index) => (
                      <div key={index} className="error-message">
                        {error}
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            ❌ Cancel
          </button>

          <button
            className={`btn-primary ${
              validationStatus === "invalid" ? "warning" : ""
            }`}
            onClick={handleConfirm}
          >
            {validationStatus === "valid"
              ? "✅ Send to MetaMask"
              : "⚠️ Send Anyway"}
          </button>
        </div>

        {/* Debug Section (Collapsible) */}
        <details className="debug-section">
          <summary>🔧 Debug Information</summary>
          <pre className="debug-data">
            {JSON.stringify(transactionBreakdown?.rawTransaction, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
};

export default IntermediatePaymentModal;
