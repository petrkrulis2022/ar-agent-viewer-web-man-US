// src/services/revolutBankService.js

const API_URL =
  import.meta.env.VITE_AGENTSPHERE_API_URL || "http://localhost:5174";

/**
 * Creates a Revolut payment order on the backend.
 * @param {object} orderDetails - The details of the order (amount, currency, etc.).
 * @returns {Promise<object>} - The payment order response from the backend.
 */
export const createRevolutBankOrder = async (orderDetails) => {
  try {
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
 * Cancels a Revolut payment order.
 * @param {string} orderId - The ID of the order to cancel.
 * @returns {Promise<object>} - The cancellation response.
 */
export const cancelRevolutOrder = async (orderId) => {
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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to cancel order");
    }

    return await response.json();
  } catch (error) {
    console.error("Error canceling Revolut order:", error);
    throw error;
  }
};
