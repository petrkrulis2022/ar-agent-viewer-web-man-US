/**
 * Payment Session Service
 * Handles communication with Agentsphere backend for dynamic payment sessions
 */

const AGENTSPHERE_API =
  import.meta.env.VITE_AGENTSPHERE_API_URL || "http://localhost:3001/api";
const USE_MOCK = import.meta.env.VITE_USE_MOCK_PAYMENT_SESSIONS === "true";

// Mock payment sessions storage (temporary for testing)
const mockSessions = new Map();

export const paymentSessionService = {
  /**
   * Fetch payment session details from Agentsphere
   * @param {string} sessionId - Payment session ID
   * @returns {Promise<Object>} Payment session data
   */
  async getSession(sessionId) {
    try {
      console.log(`🔍 Fetching payment session: ${sessionId}`);

      // Mock mode for testing without backend
      if (USE_MOCK) {
        console.log(
          "🧪 Using mock payment session - reading from URL data parameter"
        );

        // Get encoded data from current URL
        const urlParams = new URLSearchParams(window.location.search);
        const encodedData = urlParams.get("data");

        if (encodedData) {
          try {
            const decodedData = JSON.parse(atob(encodedData));
            console.log("✅ Mock session decoded from URL:", decodedData);

            // Build full session object
            const mockSession = {
              id: sessionId,
              terminalAgentId: "agent_terminal_eshop_001",
              merchantId: "eshop_cubepay_merch",
              merchantName: decodedData.merchantName,
              amount: decodedData.amount,
              currency: decodedData.currency,
              paymentMethod: "revolut_card",
              cartData: {
                items: decodedData.items || [],
                total: decodedData.total,
              },
              redirectUrl: decodedData.redirectUrl,
              status: "pending",
              createdAt: new Date().toISOString(),
              expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
            };

            await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay
            return mockSession;
          } catch (e) {
            console.error("❌ Failed to decode session data from URL:", e);
            throw new Error("Failed to decode session data");
          }
        }

        throw new Error("No session data found in URL");
      }

      const response = await fetch(
        `${AGENTSPHERE_API}/payments/terminal/session/${sessionId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch payment session");
      }

      const data = await response.json();
      console.log("✅ Payment session fetched:", data.session);

      return data.session;
    } catch (error) {
      console.error("❌ Get payment session error:", error);
      throw error;
    }
  },

  /**
   * Complete payment and notify Agentsphere
   * @param {string} sessionId - Payment session ID
   * @param {Object} paymentData - Payment completion data
   * @returns {Promise<Object>} Completion result with redirect URL
   */
  async completeSession(sessionId, paymentData) {
    try {
      console.log(`✅ Completing payment session: ${sessionId}`, paymentData);

      // Mock mode for testing
      if (USE_MOCK) {
        console.log("🧪 Mock completing payment session");

        // Get redirectUrl from URL data
        const urlParams = new URLSearchParams(window.location.search);
        const encodedData = urlParams.get("data");
        let redirectUrl = "http://localhost:5175/order-confirmation";

        if (encodedData) {
          try {
            const decodedData = JSON.parse(atob(encodedData));
            redirectUrl = decodedData.redirectUrl || redirectUrl;
          } catch (e) {
            console.error("❌ Failed to get redirect URL:", e);
          }
        }

        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate processing

        return {
          success: true,
          redirectUrl,
          payment: {
            sessionId,
            status: "completed",
            ...paymentData,
          },
        };
      }

      const response = await fetch(
        `${AGENTSPHERE_API}/payments/terminal/complete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId,
            ...paymentData,
            completedAt: new Date().toISOString(),
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to complete payment");
      }

      const data = await response.json();
      console.log("✅ Payment completed:", data.payment);

      return {
        success: true,
        redirectUrl: data.payment.redirectUrl,
        payment: data.payment,
      };
    } catch (error) {
      console.error("❌ Complete payment error:", error);
      throw error;
    }
  },

  /**
   * Store mock session (for testing without backend)
   * @param {string} sessionId - Session ID
   * @param {Object} sessionData - Session data
   */
  storeMockSession(sessionId, sessionData) {
    mockSessions.set(sessionId, sessionData);
    console.log("🧪 Mock session stored:", sessionId);
  },

  /**
   * Cancel payment session
   * @param {string} sessionId - Payment session ID
   * @param {string} reason - Cancellation reason
   */
  async cancelSession(sessionId, reason = "User cancelled") {
    try {
      console.log(`❌ Cancelling payment session: ${sessionId}`);

      await fetch(`${AGENTSPHERE_API}/payments/terminal/cancel/${sessionId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      });

      console.log("✅ Payment session cancelled");
    } catch (error) {
      console.error("❌ Cancel payment error:", error);
      // Don't throw - cancellation is best-effort
    }
  },

  /**
   * Check if session is expired
   * @param {Object} session - Payment session object
   * @returns {boolean} True if expired
   */
  isSessionExpired(session) {
    if (!session || !session.expiresAt) return true;
    return new Date() > new Date(session.expiresAt);
  },

  /**
   * Get remaining time for session in seconds
   * @param {Object} session - Payment session object
   * @returns {number} Seconds remaining (0 if expired)
   */
  getRemainingTime(session) {
    if (!session || !session.expiresAt) return 0;
    const remaining = Math.floor(
      (new Date(session.expiresAt) - new Date()) / 1000
    );
    return Math.max(0, remaining);
  },
};
