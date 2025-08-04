// AgentSphere Configuration
// Enhanced configuration for AgentSphere integration with AR Viewer

// Supported Stablecoins and Tokens
export const SUPPORTED_TOKENS = [
  {
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
    networks: ["morph-holesky-testnet", "ethereum", "polygon"],
    color: "text-green-400",
    icon: "💵",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    networks: ["morph-holesky-testnet", "ethereum", "polygon"],
    color: "text-blue-400",
    icon: "💰",
  },
  {
    symbol: "USDs",
    name: "Stablecoin USD",
    decimals: 18,
    networks: ["morph-holesky-testnet"],
    color: "text-purple-400",
    icon: "💎",
  },
  {
    symbol: "USDBG+",
    name: "BlockDAG USD+",
    decimals: 18,
    networks: ["blockdag-primordial-testnet"],
    color: "text-orange-400",
    icon: "🟨",
  },
  {
    symbol: "USDe",
    name: "Ethena USD",
    decimals: 18,
    networks: ["ethereum"],
    color: "text-indigo-400",
    icon: "⚡",
  },
  {
    symbol: "LSTD+",
    name: "Liquid Staked Token Dollar+",
    decimals: 18,
    networks: ["ethereum"],
    color: "text-cyan-400",
    icon: "🌊",
  },
  {
    symbol: "AIX",
    name: "AI Exchange Token",
    decimals: 18,
    networks: ["ethereum", "polygon"],
    color: "text-pink-400",
    icon: "🤖",
  },
  {
    symbol: "PYUSD",
    name: "PayPal USD",
    decimals: 6,
    networks: ["ethereum"],
    color: "text-blue-500",
    icon: "💳",
  },
  {
    symbol: "RLUSD",
    name: "Ripple USD",
    decimals: 6,
    networks: ["ethereum"],
    color: "text-blue-600",
    icon: "🌐",
  },
  {
    symbol: "USDD",
    name: "Decentralized USD",
    decimals: 18,
    networks: ["ethereum", "polygon"],
    color: "text-red-400",
    icon: "🔥",
  },
  {
    symbol: "GHO",
    name: "Aave GHO",
    decimals: 18,
    networks: ["ethereum"],
    color: "text-purple-500",
    icon: "👻",
  },
  {
    symbol: "USDx",
    name: "dForce USD",
    decimals: 18,
    networks: ["ethereum"],
    color: "text-yellow-400",
    icon: "⭐",
  },
];

// Supported Blockchain Networks
export const SUPPORTED_NETWORKS = [
  {
    id: 2810,
    name: "Morph Holesky Testnet",
    shortName: "morph-holesky",
    rpcUrl: "https://rpc-holesky.morphl2.io",
    explorerUrl: "https://explorer-holesky.morphl2.io",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    isTestnet: true,
    color: "text-purple-400",
    icon: "🔮",
  },
  {
    id: 1,
    name: "Ethereum Mainnet",
    shortName: "ethereum",
    rpcUrl: "https://mainnet.infura.io/v3/YOUR_INFURA_KEY",
    explorerUrl: "https://etherscan.io",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    isTestnet: false,
    color: "text-blue-400",
    icon: "⚡",
  },
  {
    id: 137,
    name: "Polygon",
    shortName: "polygon",
    rpcUrl: "https://polygon-rpc.com",
    explorerUrl: "https://polygonscan.com",
    nativeCurrency: {
      name: "Polygon",
      symbol: "MATIC",
      decimals: 18,
    },
    isTestnet: false,
    color: "text-purple-500",
    icon: "🟣",
  },
  {
    id: 1043,
    name: "BlockDAG Primordial Testnet",
    shortName: "blockdag-primordial",
    rpcUrl: "https://test-rpc.primordial.bdagscan.com/",
    explorerUrl: "https://test.bdagscan.com",
    nativeCurrency: {
      name: "BlockDAG",
      symbol: "BDAG",
      decimals: 18,
    },
    isTestnet: true,
    color: "text-orange-400",
    icon: "🟨",
  },
];

// Enhanced Agent Types (AgentSphere Schema)
export const AGENT_TYPES = [
  {
    value: "intelligent_assistant",
    label: "AI Assistant",
    description: "Advanced AI agent for general assistance and tasks",
    icon: "🤖",
    color: "bg-blue-500/20 text-blue-400 border-blue-400/30",
    capabilities: ["text_chat", "voice_chat", "analysis", "information_lookup"],
  },
  {
    value: "local_services",
    label: "Local Services",
    description: "Provides local business and service information",
    icon: "📍",
    color: "bg-green-500/20 text-green-400 border-green-400/30",
    capabilities: ["location_services", "directory", "navigation"],
  },
  {
    value: "payment_terminal",
    label: "Payment Terminal",
    description: "Handles payments and financial transactions",
    icon: "💳",
    color: "bg-yellow-500/20 text-yellow-400 border-yellow-400/30",
    capabilities: ["payment_processing", "blockchain_integration"],
  },
  {
    value: "trailing_payment_terminal",
    label: "Trailing Payment Terminal",
    description: "Mobile payment terminal that follows users",
    icon: "🚶💳",
    color: "bg-orange-500/20 text-orange-400 border-orange-400/30",
    capabilities: [
      "trailing_movement",
      "payment_processing",
      "mobile_interaction",
    ],
  },
  {
    value: "my_ghost",
    label: "My Ghost",
    description: "Personal AI companion and assistant",
    icon: "👻",
    color: "bg-purple-500/20 text-purple-400 border-purple-400/30",
    capabilities: ["personal_assistant", "memory_storage", "context_awareness"],
  },
  {
    value: "game_agent",
    label: "Game Agent",
    description: "Interactive gaming and entertainment agent",
    icon: "🎮",
    color: "bg-pink-500/20 text-pink-400 border-pink-400/30",
    capabilities: ["game_creation", "puzzles", "entertainment"],
  },
  {
    value: "world_builder_3d",
    label: "3D World Builder",
    description: "Creates and manages 3D environments",
    icon: "🏗️",
    color: "bg-cyan-500/20 text-cyan-400 border-cyan-400/30",
    capabilities: ["3d_modeling", "environment_creation", "spatial_design"],
  },
  {
    value: "home_security",
    label: "Home Security",
    description: "Monitors and manages security systems",
    icon: "🛡️",
    color: "bg-red-500/20 text-red-400 border-red-400/30",
    capabilities: ["security_monitoring", "alert_system", "access_control"],
  },
  {
    value: "content_creator",
    label: "Content Creator",
    description: "Generates and manages digital content",
    icon: "✨",
    color: "bg-indigo-500/20 text-indigo-400 border-indigo-400/30",
    capabilities: ["content_generation", "brainstorming", "writing"],
  },
  {
    value: "real_estate_broker",
    label: "Real Estate Broker",
    description: "Provides real estate information and services",
    icon: "🏠",
    color: "bg-emerald-500/20 text-emerald-400 border-emerald-400/30",
    capabilities: [
      "property_information",
      "market_analysis",
      "location_services",
    ],
  },
  {
    value: "bus_stop_agent",
    label: "Bus Stop Agent",
    description: "Public transportation information and assistance",
    icon: "🚌",
    color: "bg-teal-500/20 text-teal-400 border-teal-400/30",
    capabilities: ["transit_information", "schedule_updates", "route_planning"],
  },
];

// MCP Service Types
export const MCP_SERVICES = [
  {
    type: "Chat",
    description: "Text-based conversation capabilities",
    icon: "💬",
    color: "text-green-400",
  },
  {
    type: "Voice",
    description: "Voice interaction and speech processing",
    icon: "🎤",
    color: "text-purple-400",
  },
  {
    type: "Analysis",
    description: "Data analysis and insights generation",
    icon: "📊",
    color: "text-blue-400",
  },
  {
    type: "Information Lookup",
    description: "Real-time information retrieval",
    icon: "🔍",
    color: "text-cyan-400",
  },
  {
    type: "Educational Content",
    description: "Learning and educational resources",
    icon: "📚",
    color: "text-yellow-400",
  },
  {
    type: "Study Planning",
    description: "Educational planning and scheduling",
    icon: "📅",
    color: "text-orange-400",
  },
  {
    type: "Q&A",
    description: "Question and answer interactions",
    icon: "❓",
    color: "text-pink-400",
  },
  {
    type: "Location Services",
    description: "Geographic and location-based services",
    icon: "📍",
    color: "text-green-500",
  },
  {
    type: "Directory",
    description: "Business and service directory access",
    icon: "📋",
    color: "text-slate-400",
  },
  {
    type: "Navigation",
    description: "Route planning and navigation assistance",
    icon: "🧭",
    color: "text-blue-500",
  },
  {
    type: "Content Generation",
    description: "Creative content creation capabilities",
    icon: "✨",
    color: "text-indigo-400",
  },
  {
    type: "Brainstorming",
    description: "Idea generation and creative thinking",
    icon: "💡",
    color: "text-yellow-500",
  },
  {
    type: "Writing",
    description: "Text composition and editing assistance",
    icon: "✍️",
    color: "text-purple-500",
  },
  {
    type: "Game Creation",
    description: "Interactive game development",
    icon: "🎮",
    color: "text-pink-500",
  },
  {
    type: "Puzzles",
    description: "Puzzle generation and solving",
    icon: "🧩",
    color: "text-red-400",
  },
  {
    type: "Entertainment",
    description: "Fun and entertainment activities",
    icon: "🎭",
    color: "text-emerald-400",
  },
];

// Location Types
export const LOCATION_TYPES = [
  { value: "outdoor", label: "Outdoor", icon: "🌳", color: "text-green-400" },
  { value: "indoor", label: "Indoor", icon: "🏢", color: "text-blue-400" },
  {
    value: "property",
    label: "Property",
    icon: "🏠",
    color: "text-purple-400",
  },
  {
    value: "public",
    label: "Public Space",
    icon: "🏛️",
    color: "text-cyan-400",
  },
  {
    value: "commercial",
    label: "Commercial",
    icon: "🏪",
    color: "text-yellow-400",
  },
  {
    value: "residential",
    label: "Residential",
    icon: "🏘️",
    color: "text-emerald-400",
  },
  {
    value: "transport",
    label: "Transport Hub",
    icon: "🚉",
    color: "text-orange-400",
  },
];

// Interaction Methods
export const INTERACTION_METHODS = [
  {
    type: "text_chat",
    label: "Text Chat",
    description: "Text-based messaging",
    icon: "💬",
    color: "text-green-400",
  },
  {
    type: "voice_chat",
    label: "Voice Chat",
    description: "Voice-based interaction",
    icon: "🎤",
    color: "text-purple-400",
  },
  {
    type: "video_chat",
    label: "Video Chat",
    description: "Video communication",
    icon: "📹",
    color: "text-cyan-400",
  },
  {
    type: "ar_gestures",
    label: "AR Gestures",
    description: "Gesture-based AR interaction",
    icon: "👋",
    color: "text-blue-400",
  },
  {
    type: "proximity_activation",
    label: "Proximity Activation",
    description: "Automatic activation when nearby",
    icon: "📡",
    color: "text-yellow-400",
  },
];

// Default Configuration Values
export const DEFAULT_CONFIG = {
  // Default network for new agents
  defaultNetwork: "morph-holesky-testnet",
  defaultChainId: 2810,

  // Default token for payments
  defaultToken: "USDT",
  defaultTokenAddress: "0x9E12AD42c4E4d2acFBADE01a96446e48e6764B98",

  // Default interaction settings
  defaultInteractionFee: 1,
  defaultRevenueSharingPercentage: 70,
  defaultInteractionRange: 10, // meters
  defaultVisibilityRadius: 50, // meters

  // Default agent capabilities
  defaultAgentType: "intelligent_assistant",
  defaultInteractionMethods: ["text_chat"],
  defaultAgentCapabilities: ["basic_interaction"],

  // Default location settings
  defaultLocationType: "outdoor",
  defaultAltitude: 0,
};

// Utility Functions
export const getTokenBySymbol = (symbol) => {
  return SUPPORTED_TOKENS.find((token) => token.symbol === symbol);
};

export const getNetworkById = (chainId) => {
  return SUPPORTED_NETWORKS.find((network) => network.id === chainId);
};

export const getAgentTypeInfo = (agentType) => {
  return AGENT_TYPES.find((type) => type.value === agentType);
};

export const getMCPServiceInfo = (serviceType) => {
  return MCP_SERVICES.find((service) => service.type === serviceType);
};

export const formatWalletAddress = (address, startChars = 8, endChars = 6) => {
  if (!address) return "Unknown";
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

export const formatTokenAmount = (amount, token) => {
  const tokenInfo = getTokenBySymbol(token);
  if (!tokenInfo) return `${amount} ${token}`;

  // Format based on decimals
  const formatted = parseFloat(amount).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: tokenInfo.decimals <= 6 ? 2 : 4,
  });

  return `${formatted} ${token}`;
};

export const getNetworkExplorerUrl = (chainId, type = "tx", hash = "") => {
  const network = getNetworkById(chainId);
  if (!network) return null;

  const baseUrl = network.explorerUrl;
  switch (type) {
    case "tx":
      return `${baseUrl}/tx/${hash}`;
    case "address":
      return `${baseUrl}/address/${hash}`;
    case "token":
      return `${baseUrl}/token/${hash}`;
    default:
      return baseUrl;
  }
};
