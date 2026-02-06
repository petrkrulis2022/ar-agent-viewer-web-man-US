/**
 * Agent Type Mapping Utility
 *
 * Handles conversion between database values and display labels for agent types.
 * Updated to match the new payment-focused naming convention.
 */

// Database value to display label mapping
export const AGENT_TYPE_LABELS = {
  // Payment-focused agents (NEW CLEAN TYPES)
  my_payment_terminal: "My Payment Terminal",
  pos_terminal: "Payment Terminal - POS",
  artm_terminal: "ARTM Terminal",
  trailing_payment_terminal: "Trailing Payment Terminal",

  // Standard agent types
  intelligent_assistant: "Intelligent Assistant",
  local_services: "Local Services",
  game_agent: "Game Agent",
  "3d_world_builder": "3D World Builder",
  real_estate_broker: "Real Estate Broker",
  bus_stop_agent: "Bus Stop Agent",

  // Hedera AI Travel Agents with A2A Communication
  bus_agent: "🚌 Bus Agent (Hedera AI)",
  train_agent: "🚆 Train Agent (Hedera AI)",
  hotel_agent: "🏨 Hotel Agent (Hedera AI)",
  flight_agent: "✈️ Flight Agent (Hedera AI)",
  restaurant_agent: "🍽️ Restaurant Agent (Hedera AI)",
  travel_agent: "🌍 Travel Coordinator (Hedera AI)",

  // Other types
  my_ghost: "My Ghost",

  // Legacy support (deprecated)
  ai_agent: "AI Agent",
  study_buddy: "Study Buddy",
  tutor: "Tutor",
  landmark: "Landmark",
  building: "Building",
};

// Reverse mapping: display label to database value
export const LABEL_TO_VALUE = Object.entries(AGENT_TYPE_LABELS).reduce(
  (acc, [value, label]) => {
    acc[label.toLowerCase()] = value;
    return acc;
  },
  {},
);

/**
 * Get display label for a database value
 * @param {string} value - Database value (e.g., 'content_creator')
 * @returns {string} Display label (e.g., 'My Payment Terminal')
 */
export const getAgentTypeLabel = (value) => {
  if (!value) return "Unknown";

  // Normalize the value
  const normalizedValue = value.toLowerCase().replace(/\s+/g, "_");

  return AGENT_TYPE_LABELS[normalizedValue] || value;
};

/**
 * Get database value from display label
 * @param {string} label - Display label (e.g., 'My Payment Terminal')
 * @returns {string} Database value (e.g., 'content_creator')
 */
export const getAgentTypeValue = (label) => {
  if (!label) return "unknown";

  const normalizedLabel = label.toLowerCase();
  return (
    LABEL_TO_VALUE[normalizedLabel] || label.toLowerCase().replace(/\s+/g, "_")
  );
};

/**
 * Normalize agent type from various formats to lowercase underscore format
 * @param {string} type - Agent type in any format
 * @returns {string} Normalized agent type (database format)
 */
export const normalizeAgentType = (type) => {
  if (!type) return "unknown";

  // Remove emojis and extra spaces
  const cleaned = type
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, "") // Remove emojis
    .trim();

  // Check if it's already a known value
  const lowerType = type.toLowerCase().replace(/\s+/g, "_");
  if (AGENT_TYPE_LABELS[lowerType]) {
    return lowerType;
  }

  // Check if it's a display label
  const valueFromLabel = LABEL_TO_VALUE[cleaned.toLowerCase()];
  if (valueFromLabel) {
    return valueFromLabel;
  }

  // Convert to underscore format
  return type
    .toLowerCase()
    .replace(/[\s-]+/g, "_")
    .replace(/[()]/g, "")
    .replace(/[^\w_]/g, "")
    .trim();
};

/**
 * Check if agent type is payment-related
 * @param {string} type - Agent type (value or label)
 * @returns {boolean}
 */
export const isPaymentAgent = (type) => {
  const normalized = normalizeAgentType(type);
  return [
    "my_payment_terminal",
    "pos_terminal",
    "artm_terminal",
    "trailing_payment_terminal",
  ].includes(normalized);
};

/**
 * Check if agent type is a Virtual Terminal (ARTM)
 * @param {string} type - Agent type (value or label)
 * @returns {boolean}
 */
export const isVirtualTerminal = (type) => {
  const normalized = normalizeAgentType(type);
  return normalized === "artm_terminal";
};

/**
 * Check if agent type is Hedera AI related
 * @param {string} type - Agent type (value or label)
 * @returns {boolean}
 */
export const isHederaAgent = (type) => {
  const normalized = normalizeAgentType(type);
  return [
    "bus_agent",
    "train_agent",
    "hotel_agent",
    "flight_agent",
    "restaurant_agent",
    "travel_agent",
  ].includes(normalized);
};

/**
 * Get badge color based on agent type category
 * @param {string} type - Agent type
 * @returns {string} Tailwind CSS classes for badge
 */
export const getAgentTypeBadgeColor = (type) => {
  const normalized = normalizeAgentType(type);

  // Payment agents - green
  if (isPaymentAgent(normalized)) {
    return "bg-green-500 text-white";
  }

  // Hedera AI agents - purple
  if (isHederaAgent(normalized)) {
    return "bg-purple-500 text-white";
  }

  // Default - blue
  return "bg-blue-500 text-white";
};

/**
 * Get icon/emoji for agent type
 * @param {string} type - Agent type
 * @returns {string} Emoji or icon identifier
 */
export const getAgentTypeIcon = (type) => {
  const normalized = normalizeAgentType(type);

  const iconMap = {
    my_payment_terminal: "💳",
    pos_terminal: "🏪",
    artm_terminal: "🏧",
    trailing_payment_terminal: "📱",
    intelligent_assistant: "🤖",
    local_services: "🏘️",
    game_agent: "🎮",
    "3d_world_builder": "🏗️",
    real_estate_broker: "🏠",
    bus_stop_agent: "🚏",
    bus_agent: "🚌",
    train_agent: "🚆",
    hotel_agent: "🏨",
    flight_agent: "✈️",
    restaurant_agent: "🍽️",
    travel_agent: "🌍",
    my_ghost: "👻",
  };

  return iconMap[normalized] || "📍";
};

/**
 * Get search keywords for agent type
 * @param {string} type - Agent type
 * @returns {string[]} Array of search keywords
 */
export const getAgentTypeKeywords = (type) => {
  const normalized = normalizeAgentType(type);

  const keywordMap = {
    my_payment_terminal: ["my", "payment", "terminal", "personal", "wallet"],
    pos_terminal: ["payment", "terminal", "pos", "point", "sale"],
    artm_terminal: ["artm", "atm", "cash", "withdrawal", "terminal", "revolut"],
    intelligent_assistant: ["ai", "assistant", "help", "intelligent"],
    local_services: ["local", "services", "neighborhood", "community"],
    game_agent: ["game", "gaming", "play", "entertainment"],
    "3d_world_builder": ["3d", "world", "builder", "construction", "vr"],
    real_estate_broker: ["real", "estate", "broker", "property", "house"],
    bus_stop_agent: ["bus", "stop", "transit", "public", "transport"],
    bus_agent: ["bus", "hedera", "travel", "transport"],
    train_agent: ["train", "hedera", "travel", "rail"],
    hotel_agent: ["hotel", "hedera", "accommodation", "lodging"],
    flight_agent: ["flight", "hedera", "airline", "aviation"],
    restaurant_agent: ["restaurant", "hedera", "dining", "food"],
    travel_agent: ["travel", "hedera", "coordinator", "trip", "vacation"],
  };

  return keywordMap[normalized] || [normalized];
};

export default {
  AGENT_TYPE_LABELS,
  getAgentTypeLabel,
  getAgentTypeValue,
  normalizeAgentType,
  isPaymentAgent,
  isHederaAgent,
  getAgentTypeBadgeColor,
  getAgentTypeIcon,
  getAgentTypeKeywords,
};
