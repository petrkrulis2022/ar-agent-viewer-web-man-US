// src/services/revolutBankService.js

const API_URL =
  import.meta.env.VITE_AGENTSPHERE_API_URL || "http://localhost:3001";

// Toggle between mock and real API
// Read from environment variable, default to false (real mode)
const USE_MOCK = import.meta.env.VITE_USE_MOCK_BANK === "true";

/**
 * Creates a Revolut payment order on the backend.
 * @param {object} orderDetails - The details of the order (amount, currency, etc.).
 * @returns {Promise<object>} - The payment order response from the backend.
 */
export const createRevolutBankOrder = async (orderDetails) => {
  try {
    // MOCK MODE: Return simulated Revolut order for testing
    if (USE_MOCK) {
      console.log("🧪 MOCK MODE: Generating simulated Revolut Bank QR order");

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      const mockOrderId = `revolut_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const mockPaymentUrl = `https://revolut.me/pay/${mockOrderId}?amount=${
        orderDetails.amount
      }&currency=${orderDetails.currency || "EUR"}`;

      return {
        success: true,
        order: {
          id: mockOrderId,
          order_id: mockOrderId,
          payment_url: mockPaymentUrl,
          qr_code_url: mockPaymentUrl,
          amount: orderDetails.amount,
          currency: orderDetails.currency || "EUR",
          status: "pending",
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
          description: orderDetails.description,
          agentId: orderDetails.agentId,
          agentName: orderDetails.agentName,
        },
      };
    }

    // PRODUCTION MODE: Call real API
    const response = await fetch(`${API_URL}/api/revolut/create-bank-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderDetails),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || "Failed to create Revolut bank order"
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating Revolut bank order:", error);
    throw error;
  }
};

/**
 * Checks the status of a Revolut payment order.
 * @param {string} orderId - The ID of the order to check.
 * @returns {Promise<object>} - The payment status response.
 */
export const checkRevolutOrderStatus = async (orderId) => {
  try {
    const response = await fetch(
      `${API_URL}/api/revolut/order-status/${orderId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to check order status");
    }

    return await response.json();
  } catch (error) {
    console.error("Error checking Revolut order status:", error);
    throw error;
  }
};

/**
 * Cancel a Revolut Bank QR order
 */
export const cancelRevolutOrder = async (orderId) => {
  if (!orderId) {
    throw new Error("Order ID is required");
  }

  // Mock mode doesn't need cancellation - instant cleanup
  if (USE_MOCK) {
    console.log(
      `🧪 [MOCK] Canceling Revolut Bank order ${orderId} (instant cleanup)`
    );
    return {
      success: true,
      message: "Order canceled successfully (mock)",
    };
  }

  // Real API call
  try {
    const response = await fetch(
      `${API_URL}/api/revolut/cancel-order/${orderId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("❌ Error canceling Revolut order:", error);
    throw error;
  }
};

/**
 * Simulate payment completion for testing (mock mode only)
 * This allows in-app payment testing without requiring external Revolut interaction
 */
export const simulatePaymentCompletion = async (orderId) => {
  if (!orderId) {
    throw new Error("Order ID is required");
  }

  console.log(`🎭 Simulating payment completion for order: ${orderId}`);

  // Mock mode: Instant success after brief delay
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`✅ [MOCK] Payment completed for order ${orderId}`);
        resolve({
          success: true,
          order: {
            id: orderId,
            state: "COMPLETED",
            updated_at: new Date().toISOString(),
          },
          message: "Payment completed successfully (mock)",
        });
      }, 1500); // 1.5 second delay to simulate processing
    });
  }

  // Real API call: Trigger payment webhook or callback
  try {
    const response = await fetch(
      `${API_URL}/api/revolut/simulate-payment/${orderId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("❌ Error simulating payment completion:", error);
    throw error;
  }
};
