/**
 * x402 MCP Service - Flightradar24 Integration
 * Handles real-time flight queries with micropayments via Hedera USDh
 */

import { hederaWalletService } from "./hederaWalletService";

const X402_CONFIG = {
  mcpEndpoint: "https://mcp.flightradar24.com/api/flights", // x402 MCP endpoint
  paymentToken: "USDh",
  paymentAmount: "0.1", // 0.1 USDh per query
  tokenAddress: "0x00000000000000000000000000000000006e24c7", // USDh on Hedera Testnet
  chainId: 296, // Hedera Testnet
  hashscanUrl: "https://hashscan.io/testnet",
};

export class X402MCPService {
  constructor() {
    this.pendingQueries = new Map();
  }

  /**
   * Query Flightradar24 via x402 MCP with USDh payment
   * @param {string} query - Flight search query (e.g., "Budapest to Barcelona")
   * @param {string} userWallet - User's connected wallet address
   * @returns {Promise<Object>} Flight data and payment receipt
   */
  async queryFlights(query, userWallet) {
    try {
      console.log("✈️ x402 MCP Query:", query);
      console.log("💰 Payment wallet:", userWallet);

      // Step 1: Generate x402 payment transaction
      const paymentTx = await this.generateX402Payment(userWallet);
      console.log("💳 x402 payment transaction:", paymentTx);

      // Step 2: Execute payment via MetaMask
      const paymentReceipt = await this.executeX402Payment(paymentTx);
      console.log("✅ x402 payment confirmed:", paymentReceipt);

      // Step 3: Query Flightradar24 MCP with payment proof
      const flightData = await this.queryMCPWithPayment(query, paymentReceipt);
      console.log("✈️ Flight data received:", flightData);

      return {
        success: true,
        flights: flightData.flights,
        payment: {
          transactionHash: paymentReceipt.transactionHash,
          amount: X402_CONFIG.paymentAmount,
          token: X402_CONFIG.paymentToken,
          hashscanUrl: `${X402_CONFIG.hashscanUrl}/transaction/${paymentReceipt.transactionHash}`,
        },
        query,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("❌ x402 MCP query failed:", error);
      throw error;
    }
  }

  /**
   * Generate x402 payment transaction for USDh
   * @param {string} fromWallet - User's wallet address
   * @returns {Promise<Object>} Transaction data
   */
  async generateX402Payment(fromWallet) {
    try {
      // USDh ERC-20 token transfer
      // transfer(address to, uint256 amount)
      const transferMethodId = "0xa9059cbb"; // transfer function selector

      // Encode recipient (x402 service address) - using token address as placeholder for now
      const recipientPadded = X402_CONFIG.tokenAddress
        .slice(2)
        .padStart(64, "0");

      // Encode amount (0.1 USDh = 0.1 * 10^6 = 100000)
      const amountInSmallestUnit = Math.floor(
        parseFloat(X402_CONFIG.paymentAmount) * 1000000
      );
      const amountHex = amountInSmallestUnit.toString(16).padStart(64, "0");

      const data = `${transferMethodId}${recipientPadded}${amountHex}`;

      return {
        from: fromWallet,
        to: X402_CONFIG.tokenAddress, // USDh contract address
        value: "0x0", // No native HBAR, only token transfer
        data,
        chainId: X402_CONFIG.chainId,
        gas: "0x186a0", // 100000 gas limit
      };
    } catch (error) {
      console.error("❌ Failed to generate x402 payment:", error);
      throw error;
    }
  }

  /**
   * Execute x402 payment transaction via MetaMask
   * @param {Object} txData - Transaction data
   * @returns {Promise<Object>} Transaction receipt
   */
  async executeX402Payment(txData) {
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask not detected");
      }

      // Ensure on Hedera Testnet
      await hederaWalletService.switchToHederaTestnet();

      console.log("📤 Sending x402 payment transaction:", txData);

      // Send transaction via MetaMask
      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [txData],
      });

      console.log("⏳ Waiting for x402 payment confirmation:", txHash);

      // Wait for transaction confirmation (simplified - real implementation would poll)
      await new Promise((resolve) => setTimeout(resolve, 3000));

      return {
        transactionHash: txHash,
        status: "confirmed",
        blockNumber: Date.now(), // Mock block number
        from: txData.from,
        to: txData.to,
        amount: X402_CONFIG.paymentAmount,
        token: X402_CONFIG.paymentToken,
      };
    } catch (error) {
      console.error("❌ x402 payment execution failed:", error);
      throw error;
    }
  }

  /**
   * Query Flightradar24 MCP with payment proof
   * @param {string} query - Flight search query
   * @param {Object} paymentReceipt - Payment transaction receipt
   * @returns {Promise<Object>} Flight data
   */
  async queryMCPWithPayment(query, paymentReceipt) {
    try {
      // Parse query for flight details
      const queryLower = query.toLowerCase();
      const isRouteQuery = queryLower.includes(" to ");

      if (isRouteQuery) {
        // Extract origin and destination
        const parts = query.split(/\s+to\s+/i);
        const origin = parts[0]?.trim() || "Budapest";
        const destination = parts[1]?.trim() || "Barcelona";

        // For MVP, return mock data
        // TODO: Replace with real MCP API call
        return {
          flights: [
            {
              flightNumber: "FR8024",
              airline: "Ryanair",
              origin,
              destination,
              departure: "16:05",
              arrival: "18:30",
              price: "$45",
              duration: "2h 25m",
              aircraft: "Boeing 737-800",
              status: "On Time",
            },
            {
              flightNumber: "W6 2447",
              airline: "Wizz Air",
              origin,
              destination,
              departure: "14:20",
              arrival: "16:50",
              price: "$52",
              duration: "2h 30m",
              aircraft: "Airbus A320",
              status: "On Time",
            },
            {
              flightNumber: "LH1432",
              airline: "Lufthansa",
              origin,
              destination,
              departure: "09:15",
              arrival: "11:45",
              price: "$89",
              duration: "2h 30m",
              aircraft: "Airbus A321",
              status: "On Time",
            },
          ],
          query,
          paymentProof: paymentReceipt.transactionHash,
          timestamp: new Date().toISOString(),
        };
      }

      // Default response for other queries
      return {
        flights: [],
        query,
        paymentProof: paymentReceipt.transactionHash,
        message: "No flights found for this query",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("❌ MCP query failed:", error);
      throw error;
    }
  }

  /**
   * Get Hashscan link for transaction
   * @param {string} transactionHash - Transaction hash
   * @returns {string} Hashscan URL
   */
  getHashscanLink(transactionHash) {
    return `${X402_CONFIG.hashscanUrl}/transaction/${transactionHash}`;
  }

  /**
   * Format flight data for display
   * @param {Array} flights - Flight data array
   * @returns {string} Formatted flight information
   */
  formatFlightData(flights) {
    if (!flights || flights.length === 0) {
      return "No flights found.";
    }

    return flights
      .map((flight, index) => {
        return `**Flight ${index + 1}**: ${flight.airline} ${
          flight.flightNumber
        }
- Route: ${flight.origin} → ${flight.destination}
- Departure: ${flight.departure} | Arrival: ${flight.arrival}
- Duration: ${flight.duration}
- Price: ${flight.price}
- Aircraft: ${flight.aircraft}
- Status: ${flight.status}`;
      })
      .join("\n\n");
  }
}

// Export singleton instance
export const x402MCPService = new X402MCPService();
