/**
 * Travel Agent API Service
 * Handles flight queries via Flightradar24 x402 MCP integration
 */

/**
 * Query the Travel Agent with MCP integration
 * @param {Object} params - Query parameters
 * @param {string} params.agentAccountId - Agent Hedera account ID
 * @param {string} params.query - User query
 * @param {string} params.origin - Origin airport code
 * @param {string} params.destination - Destination airport code
 * @param {string} params.date - Travel date
 * @returns {Promise<Object>} Query response
 */
export const queryTravelAgent = async ({
  agentAccountId,
  query,
  origin,
  destination,
  date,
}) => {
  console.log("🌐 Querying Travel Agent API:", {
    agentAccountId,
    query,
    origin,
    destination,
    date,
  });

  // TODO: Implement real Flightradar24 x402 MCP integration
  // For now, return mock data
  return mockTravelQuery();
};

/**
 * Mock travel query response for development
 * @returns {Promise<Object>} Mock response
 */
export const mockTravelQuery = async () => {
  console.log("🧪 Using mock Travel Agent response");

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return {
    success: true,
    mcpCost: 0.00025, // MCP query cost in HBAR
    flightData: {
      flights: [
        {
          departure: {
            airport: "BUD",
            city: "Budapest",
            time: "16:05",
          },
          arrival: {
            airport: "BCN",
            city: "Barcelona",
            time: "18:30",
          },
          duration: "2h 25m",
          airline: "Ryanair",
          flightNumber: "FR8024",
          price: {
            economy: 45,
            business: 245,
          },
        },
        {
          departure: {
            airport: "BUD",
            city: "Budapest",
            time: "14:20",
          },
          arrival: {
            airport: "BCN",
            city: "Barcelona",
            time: "16:50",
          },
          duration: "2h 30m",
          airline: "Wizz Air",
          flightNumber: "W6 2447",
          price: {
            economy: 52,
            business: 280,
          },
        },
      ],
    },
    alternativePackage: {
      total: 4325,
      bus: {
        fee: 1000,
        details: "Bus to train station",
        provider: "Bus Agent",
      },
      train: {
        fee: 1500,
        details: "Train to Barcelona",
        provider: "Train Agent",
      },
      hotel: {
        fee: 1200,
        details: "Hotel (2 nights)",
        provider: "Hotel Agent",
      },
      travelAgentFee: 625,
    },
  };
};

export default {
  queryTravelAgent,
  mockTravelQuery,
};
