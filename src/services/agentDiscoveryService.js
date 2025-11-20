/**
 * Agent Discovery Service
 * Fetches nearby agents from the agentsphere backend based on user location
 */

const AGENTSPHERE_API_URL =
  import.meta.env.VITE_AGENTSPHERE_API_URL || "http://localhost:3000";

/**
 * Discover agents near a given location
 * @param {number} latitude - User's latitude
 * @param {number} longitude - User's longitude
 * @param {number} radius - Search radius in meters (default: 1000m)
 * @returns {Promise<Array>} - Array of agent objects
 */
export async function discoverAgents(latitude, longitude, radius = 1000) {
  try {
    const response = await fetch(
      `${AGENTSPHERE_API_URL}/api/agents/discover?lat=${latitude}&lon=${longitude}&radius=${radius}`
    );

    if (!response.ok) {
      throw new Error(`Failed to discover agents: ${response.statusText}`);
    }

    const agents = await response.json();
    console.log(`Discovered ${agents.length} agents near location:`, {
      latitude,
      longitude,
    });

    return agents;
  } catch (error) {
    console.error("Error discovering agents:", error);
    throw error;
  }
}

/**
 * Get specific agent details by ID
 * @param {string} agentId - Agent ID
 * @returns {Promise<Object>} - Agent object
 */
export async function getAgentDetails(agentId) {
  try {
    const response = await fetch(
      `${AGENTSPHERE_API_URL}/api/agents/${agentId}`
    );

    if (!response.ok) {
      throw new Error(`Failed to get agent details: ${response.statusText}`);
    }

    const agent = await response.json();
    return agent;
  } catch (error) {
    console.error("Error getting agent details:", error);
    throw error;
  }
}

/**
 * Get agents by type
 * @param {string} type - Agent type (e.g., 'bus', 'train', 'hotel')
 * @param {number} latitude - User's latitude (optional)
 * @param {number} longitude - User's longitude (optional)
 * @returns {Promise<Array>} - Array of agent objects
 */
export async function getAgentsByType(type, latitude = null, longitude = null) {
  try {
    let url = `${AGENTSPHERE_API_URL}/api/agents/type/${type}`;

    if (latitude && longitude) {
      url += `?lat=${latitude}&lon=${longitude}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to get agents by type: ${response.statusText}`);
    }

    const agents = await response.json();
    return agents;
  } catch (error) {
    console.error("Error getting agents by type:", error);
    throw error;
  }
}
