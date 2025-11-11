/**
 * Payment Utilities for Dynamic Fee Processing
 * Handles URL parameter parsing and dynamic amount calculations
 */

/**
 * Parse payment data from URL parameters
 * Supports both e-shop (?payment=true&data=...) and on-ramp (?data=...) formats
 * Also supports ?paymentData=... format
 * @returns {Object|null} Decoded payment data or null if not found
 */
export function parsePaymentDataFromURL() {
  const urlParams = new URLSearchParams(window.location.search);

  // Try multiple parameter names for flexibility
  const encodedData = urlParams.get("paymentData") || urlParams.get("data");

  if (!encodedData) {
    console.log(
      "ℹ️ No payment data found in URL (checked 'paymentData' and 'data' parameters)"
    );
    return null;
  }

  try {
    const decoded = atob(encodedData);
    const paymentData = JSON.parse(decoded);
    console.log("📦 Parsed payment data from URL:", paymentData);
    return paymentData;
  } catch (error) {
    console.error("❌ Failed to decode payment data:", error);
    return null;
  }
}

/**
 * Get the dynamic payment amount based on fee_type and URL parameters
 * @param {Object} agent - Agent data from database
 * @param {Object} urlPaymentData - Parsed payment data from URL
 * @returns {number|null} Payment amount or null if undefined
 */
export function getDynamicPaymentAmount(agent, urlPaymentData) {
  // If agent has fixed fee, always use that
  if (agent?.fee_type === "fixed") {
    const fixedAmount =
      agent.interaction_fee_amount || agent.interaction_fee || 10.0;
    console.log("💰 Using fixed fee:", fixedAmount);
    return fixedAmount;
  }

  // If agent has dynamic fee, check URL parameters
  if (agent?.fee_type === "dynamic") {
    if (urlPaymentData && urlPaymentData.amount) {
      console.log("💰 Using dynamic amount from URL:", urlPaymentData.amount);
      return urlPaymentData.amount;
    } else {
      console.warn(
        "⚠️ Dynamic fee agent but no amount in URL. Amount will be dynamic."
      );
      return null; // Will show "Dynamic Amount" label
    }
  }

  // Fallback for agents without fee_type (backward compatibility)
  const fallbackAmount =
    agent?.interaction_fee_amount || agent?.interaction_fee || 10.0;
  console.log("💰 Using fallback fee (no fee_type defined):", fallbackAmount);
  return fallbackAmount;
}

/**
 * Validate that payment amount is reasonable
 * @param {number} amount - Payment amount to validate
 * @returns {boolean} True if amount is valid
 */
export function validatePaymentAmount(amount) {
  if (typeof amount !== "number" || isNaN(amount)) {
    return false;
  }
  if (amount <= 0) {
    console.warn("⚠️ Payment amount must be positive:", amount);
    return false;
  }
  if (amount > 1000000) {
    console.warn("⚠️ Payment amount seems unreasonably high:", amount);
    return false;
  }
  return true;
}

/**
 * Format payment amount for display
 * @param {number|null} amount - Amount to format
 * @param {string} currency - Currency symbol
 * @returns {string} Formatted amount string
 */
export function formatPaymentAmount(amount, currency = "USD") {
  if (amount === null || amount === undefined) {
    return `Dynamic Amount (${currency})`;
  }
  return `${parseFloat(amount).toFixed(2)} ${currency}`;
}

/**
 * Get payment configuration summary for logging
 * @param {Object} agent - Agent data
 * @param {Object} urlPaymentData - URL payment data
 * @param {number} finalAmount - Final calculated amount
 * @returns {Object} Payment configuration summary
 */
export function getPaymentConfigSummary(agent, urlPaymentData, finalAmount) {
  return {
    feeType: agent?.fee_type || "undefined",
    agentDefaultFee:
      agent?.interaction_fee_amount || agent?.interaction_fee || null,
    urlAmount: urlPaymentData?.amount || null,
    finalAmount: finalAmount,
    orderId: urlPaymentData?.orderId || null,
    merchantName: urlPaymentData?.merchantName || null,
    currency: urlPaymentData?.currency || agent?.interaction_fee_token || "USD",
  };
}
