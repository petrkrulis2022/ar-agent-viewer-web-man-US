// src/services/revolutPayment.js
// Real Virtual Card Payment Integration
// Supports both mock (testing) and real (production) modes

const API_URL = import.meta.env.VITE_AGENTSPHERE_API_URL || "http://localhost:3001";
const USE_MOCK_CARD = import.meta.env.VITE_USE_MOCK_CARD === "true";

/**
 * Process real Virtual Card payment
 * Charges agent's virtual card with real money
 * @param {Object} params - Payment parameters
 * @param {string} params.agentId - Agent ID
 * @param {number} params.amount - Amount in cents
 * @param {string} params.currency - Currency code (USD, EUR, etc.)
 * @param {string} params.orderId - Order ID for tracking
 * @returns {Promise<Object>} Payment result
 */
export async function processRealCardPayment({
  agentId,
  amount,
  currency,
  orderId,
}) {
  console.log("💳 Processing real Virtual Card payment:", {
    agentId,
    amount,
    currency,
    orderId,
  });

  try {
    const response = await fetch(
      `${API_URL}/api/revolut/process-virtual-card-payment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agentId,
          orderId,
          amount,
          currency,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    console.log("✅ Real payment processed successfully:", result);

    return {
      success: true,
      order_id: result.order_id,
      amount: result.amount,
      currency: result.currency,
      remaining_balance: result.remaining_balance,
      transaction_id: result.transaction_id,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("❌ Real card payment failed:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get agent's primary virtual card
 * @param {string} agentId - Agent ID
 * @returns {Promise<Object|null>} Card data or null
 */
export async function getAgentCard(agentId) {
  console.log("🔍 Fetching agent's virtual card:", agentId);

  try {
    const endpoint = USE_MOCK_CARD
      ? `${API_URL}/api/revolut/mock/virtual-card/agent/${agentId}/primary`
      : `${API_URL}/api/revolut/virtual-card/agent/${agentId}/primary`;

    const response = await fetch(endpoint);
    const data = await response.json();

    if (data.card) {
      console.log("✅ Card fetched successfully:", {
        card_id: data.card.card_id,
        balance: data.card.balance,
        currency: data.card.currency,
        state: data.card.state,
      });
      return data.card;
    } else {
      console.log("⚠️ No virtual card found for agent:", agentId);
      return null;
    }
  } catch (error) {
    console.error("❌ Failed to fetch card:", error);
    return null;
  }
}

/**
 * Simulate card payment (for testing/mock mode)
 * @param {Object} params - Payment parameters
 * @param {string} params.agentId - Agent ID
 * @param {number} params.amount - Amount in cents
 * @param {string} params.currency - Currency code
 * @returns {Promise<Object>} Simulated payment result
 */
export async function simulateCardPayment({ agentId, amount, currency }) {
  console.log("🎭 Simulating card payment (mock mode):", {
    agentId,
    amount,
    currency,
  });

  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const mockResult = {
    success: true,
    order_id: `mock_order_${Date.now()}`,
    amount,
    currency,
    remaining_balance: 10000 - amount, // Mock balance (100.00 - amount)
    transaction_id: `mock_tx_${Date.now()}`,
    timestamp: new Date().toISOString(),
  };

  console.log("✅ Mock payment completed:", mockResult);

  return mockResult;
}

/**
 * Validate payment parameters
 * @param {Object} params - Payment parameters
 * @returns {Object} Validation result
 */
export function validatePayment({ amount, cardBalance, currency }) {
  const errors = [];

  if (!amount || amount <= 0) {
    errors.push("Amount must be greater than 0");
  }

  if (amount > cardBalance) {
    errors.push(
      `Insufficient balance. Available: ${(cardBalance / 100).toFixed(2)} ${currency}`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Format amount for display
 * @param {number} amountInCents - Amount in cents
 * @param {string} currency - Currency code
 * @returns {string} Formatted amount
 */
export function formatAmount(amountInCents, currency = "USD") {
  const amount = amountInCents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Check if running in mock mode
 * @returns {boolean} True if mock mode enabled
 */
export function isMockMode() {
  return USE_MOCK_CARD;
}
