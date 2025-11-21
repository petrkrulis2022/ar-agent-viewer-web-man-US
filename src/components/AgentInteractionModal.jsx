import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  X,
  MessageCircle,
  Mic,
  Video,
  Send,
  User,
  Bot,
  Zap,
  DollarSign,
  QrCode,
  Wallet,
  Phone,
  MicOff,
  VideoOff,
} from "lucide-react";
import {
  getUSDCContractForChain,
  getNetworkInfo,
} from "../services/evmNetworkService";
import { x402MCPService } from "../services/x402MCPService";
import { hederaWalletService } from "../services/hederaWalletService";

/**
 * Extract date from natural language in user message
 * Supports: YYYY-MM-DD, "on January 15", "tomorrow", "next week"
 */
const extractDateFromMessage = (message) => {
  const msg = message.toLowerCase();

  // Match YYYY-MM-DD format
  const dateMatch = msg.match(/(\d{4}-\d{2}-\d{2})/);
  if (dateMatch) {
    return dateMatch[1];
  }

  // Match "on January 15", "on Jan 15", etc.
  const monthNames = {
    january: "01",
    jan: "01",
    february: "02",
    feb: "02",
    march: "03",
    mar: "03",
    april: "04",
    apr: "04",
    may: "05",
    june: "06",
    jun: "06",
    july: "07",
    jul: "07",
    august: "08",
    aug: "08",
    september: "09",
    sep: "09",
    october: "10",
    oct: "10",
    november: "11",
    nov: "11",
    december: "12",
    dec: "12",
  };

  for (const [name, num] of Object.entries(monthNames)) {
    const regex = new RegExp(`on\\s+${name}\\s+(\\d{1,2})`, "i");
    const match = msg.match(regex);
    if (match) {
      const day = match[1].padStart(2, "0");
      const year = new Date().getFullYear();
      return `${year}-${num}-${day}`;
    }
  }

  // Match "tomorrow"
  if (msg.includes("tomorrow")) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  }

  // Match "next week"
  if (msg.includes("next week")) {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().split("T")[0];
  }

  return null; // No date found
};

/**
 * Parse flight query from user message
 * Supports formats:
 * - "flights from BUD to BCN"
 * - "flights from BUD to BCN on 2025-01-15"
 * - "flights from BUD to BCN on January 15"
 * - "flights from BUD to BCN tomorrow"
 * - "find flights BUD BCN 2025-01-15"
 */
const parseFlightQuery = (message) => {
  const lowerMessage = message.toLowerCase();

  // Match patterns like "flights from BUD to BCN" or "get me flight BUD BCN"
  const patterns = [
    /(?:flight|flights).*?from\s+(\w+).*?to\s+(\w+)/i,
    /(?:flight|flights)\s+(\w+)\s+(?:to\s+)?(\w+)/i,
    /(\w{3})\s+to\s+(\w{3})/i,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match) {
      const origin = match[1].toUpperCase();
      const destination = match[2].toUpperCase();

      // Extract date from message
      let date = extractDateFromMessage(message);

      // If no date provided, default to TODAY (for live flight tracking)
      if (!date) {
        const today = new Date();
        date = today.toISOString().split("T")[0]; // Format: YYYY-MM-DD
      }

      return {
        origin,
        destination,
        date,
      };
    }
  }

  return null;
};

// Format flight results from backend response
const formatFlightResults = (data) => {
  if (!data.flights || data.flights.length === 0) {
    return "No flights found for this route.";
  }

  const isMockMode = data.payment && data.payment.mock === true;

  // Show mock mode warning banner
  let message = "";
  if (isMockMode) {
    message += `⚠️ **DEVELOPMENT MODE - MOCK FLIGHT DATA**\n`;
    message += `_This is simulated data for testing. Real MCP integration coming soon._\n\n`;
  }

  message += `✈️ **Found ${data.flights.length} flights:**\n\n`;

  data.flights.forEach((flight, idx) => {
    const mockBadge = isMockMode ? " 🔧 MOCK" : "";
    message += `**Flight ${idx + 1}**: ${flight.airline} ${
      flight.flightNumber
    }${mockBadge}\n`;
    message += `- Route: ${flight.origin} → ${flight.destination}\n`;
    message += `- Departure: ${flight.departure} | Arrival: ${flight.arrival}\n`;
    message += `- Duration: ${flight.duration}\n`;
    message += `- Price: ${flight.price}\n`;
    if (flight.aircraft) {
      message += `- Aircraft: ${flight.aircraft}\n`;
    }
    if (flight.status) {
      message += `- Status: ${flight.status}\n`;
    }
    message += "\n";
  });

  // Add x402 payment info with HashScan link
  if (data.payment) {
    const paymentLabel = isMockMode
      ? "Mock Transaction"
      : "View x402 payment on HashScan";
    const costNote = isMockMode ? " (SIMULATED)" : " (paid by agent)";

    message += `\n💳 **MCP Query Cost:** ${data.payment.cost_usdh} USDh${costNote}\n`;
    message += `🔗 [${paymentLabel}](${data.payment.hashscan_url})`;

    if (isMockMode) {
      message += ` _(Development only - no real payment)_`;
    }
    message += `\n\n`;
  }

  message +=
    "Would you like me to check alternative travel packages combining bus, train, and hotel? I can coordinate with other agents for you.";

  return message;
};

// Network to Chain ID mapping for consistency with ModernAgentCard
const networkToChainId = {
  "ethereum-sepolia": 11155111,
  "polygon-amoy": 80002,
  "Polygon Amoy": 80002, // ✅ CRITICAL: Handle the "Amoy 1" agent format
  "arbitrum-sepolia": 421614,
  "optimism-sepolia": 11155420,
  "base-sepolia": 84532,
  "Hedera Testnet": 296, // ✅ Hedera Testnet support
  "hedera-testnet": 296, // ✅ Hedera Testnet (lowercase variant)
  "solana-devnet": "devnet", // Special case for Solana
};

// Helper functions for dynamic agent payment data
const getServiceFeeDisplay = (agent, paymentAmount = null) => {
  // 💰 PRIORITY 0: Use dynamic payment amount from e-shop/on-ramp if available
  if (
    paymentAmount !== null &&
    paymentAmount !== undefined &&
    paymentAmount > 0
  ) {
    console.log("💰 Using dynamic payment amount:", paymentAmount);
    return `${paymentAmount} USDC`;
  }

  // ✅ CHECK FOR DYNAMIC FEE TYPE FIRST!
  if (agent?.fee_type === "dynamic") {
    console.log("💰 Agent has dynamic fee_type - showing Dynamic Amount", {
      agent: agent?.name,
      fee_type: agent?.fee_type,
    });
    return "Dynamic Amount";
  }

  // Use the same priority logic as resolveInteractionFee to ensure consistency
  console.log("🔍 AgentInteractionModal: Full agent data for fee:", {
    name: agent?.name,
    id: agent?.id,
    fee_type: agent?.fee_type,
    interaction_fee_amount: agent?.interaction_fee_amount,
    interaction_fee_usdfc: agent?.interaction_fee_usdfc,
    interaction_fee: agent?.interaction_fee,
    interaction_fee_token: agent?.interaction_fee_token,
    allKeys: agent
      ? Object.keys(agent).filter(
          (k) => k.includes("fee") || k.includes("amount")
        )
      : [],
    TRACKING:
      "CUBE DYNAMIC 1 DISCREPANCY - Expected ID: f911cc7d-244c-4916-9612-71b3904e9424",
  });

  // 🔧 CRITICAL: Use EXACT same priority as database schema (NO fee_usdc/fee_usdt)
  let fee = 1; // fallback
  let token = "USDC"; // default
  let source = "fallback";

  // PRIORITY 1: interaction_fee_amount (authoritative field for new deployments)
  if (
    agent?.interaction_fee_amount !== undefined &&
    agent?.interaction_fee_amount !== null &&
    !isNaN(agent?.interaction_fee_amount) &&
    agent?.interaction_fee_amount > 0
  ) {
    fee = parseFloat(agent.interaction_fee_amount);
    // Determine token based on network if not explicitly set
    if (agent?.interaction_fee_token) {
      token = agent.interaction_fee_token;
    } else {
      // Auto-detect token from network name
      const networkName = agent?.deployment_network_name || agent?.network;
      if (networkName && networkName.toLowerCase().includes("hedera")) {
        token = "USDh"; // Use USDh stablecoin for Hedera (not native HBAR)
      } else {
        token = "USDC";
      }
    }
    source = "interaction_fee_amount";
  }
  // PRIORITY 2: interaction_fee_usdfc (legacy field)
  else if (
    agent?.interaction_fee_usdfc !== undefined &&
    agent?.interaction_fee_usdfc !== null &&
    !isNaN(agent?.interaction_fee_usdfc) &&
    agent?.interaction_fee_usdfc > 0
  ) {
    fee = parseFloat(agent.interaction_fee_usdfc);
    token = "USDC";
    source = "interaction_fee_usdfc";
  }
  // PRIORITY 3: interaction_fee (fallback legacy field)
  else if (
    agent?.interaction_fee !== undefined &&
    agent?.interaction_fee !== null &&
    !isNaN(agent?.interaction_fee) &&
    agent?.interaction_fee > 0
  ) {
    fee = parseFloat(agent.interaction_fee);
    token = "USDC";
    source = "interaction_fee";
  }

  console.log("🔍 AgentInteractionModal: Service fee display:", {
    fee,
    token,
    agent: agent?.name,
    source,
    note: "Using database schema aligned priority logic",
  });
  return `${fee} ${token}`;
};

const getNetworkDisplay = (agent) => {
  // Log the full agent object for debugging network info
  console.log("🔍 AgentInteractionModal: Full agent data for network:", {
    name: agent?.name,
    deployment_network_name: agent?.deployment_network_name,
    network: agent?.network,
    chain_id: agent?.chain_id,
    deployment_chain_id: agent?.deployment_chain_id,
    networkToChainIdKeys: Object.keys(networkToChainId),
    networkFieldType: typeof agent?.network,
    networkFieldValue: agent?.network,
    networkMappingExists: agent?.network
      ? networkToChainId[agent.network]
      : "N/A",
    allKeys: agent
      ? Object.keys(agent).filter(
          (k) => k.includes("network") || k.includes("chain")
        )
      : [],
  });

  // 🔧 CRITICAL: Use same logic as agent card for network detection
  // Agent card uses agent.network (string like "polygon-amoy")
  // Payment modal was using agent.chain_id (which has wrong values)
  let chainId = null;
  let networkSource = "unknown";

  // 1. Try agent.network (string) - same as agent card
  if (agent?.network && networkToChainId[agent.network]) {
    chainId = networkToChainId[agent.network];
    networkSource = "agent.network";
  }

  // 2. Fallback to agent.chain_id (has wrong values but better than nothing)
  if (!chainId) {
    chainId = agent?.chain_id || agent?.deployment_chain_id;
    networkSource = "agent.chain_id";
  }

  console.log(
    "🎯 AgentInteractionModal: Chain ID for network (UPDATED FOR POLYGON AMOY):",
    {
      agentName: agent?.name,
      agentNetwork: agent?.network,
      deployment_chain_id: agent?.deployment_chain_id,
      chain_id: agent?.chain_id,
      finalChainId: chainId,
      networkSource: networkSource,
      note: "Now using agent.network like agent card - includes Polygon Amoy support",
    }
  ); // 🔧 CRITICAL: Database network names are WRONG - always use chain_id
  // Don't trust: agent?.deployment_network_name || agent?.network
  let network = "Unknown Network";

  // ✅ NEW: Check for Solana or other non-EVM networks first
  if (
    agent?.deployment_network_name &&
    agent?.deployment_network_name !== "Unknown Network"
  ) {
    network = agent.deployment_network_name;
    console.log("✅ Using deployment_network_name:", network);
  }
  // Try payment_config.network_info.name as secondary source
  else if (agent?.payment_config?.network_info?.name) {
    network = agent.payment_config.network_info.name;
    console.log("✅ Using payment_config.network_info.name:", network);
  }
  // Use the chainId for EVM networks
  else if (chainId) {
    const networkInfo = getNetworkInfo(chainId);
    network = networkInfo?.name || "Unknown Network";
    console.log(
      "🔍 AgentInteractionModal: Using chain_id for network (bypassing DB):",
      {
        chainId,
        networkInfo: networkInfo?.name,
        agent: agent?.name,
        skipped_db_network: agent?.deployment_network_name,
        note: "Database network names are incorrect",
      }
    );
  }

  console.log("🔍 AgentInteractionModal: Final network display:", {
    network,
    agent: agent?.name,
    source: agent?.deployment_network_name
      ? "deployment_network_name"
      : agent?.network
      ? "network"
      : "evm_service",
  });
  return network;
};

const getAgentWalletAddress = (agent) => {
  console.log("🔍 AgentInteractionModal: Wallet info for agent:", {
    name: agent?.name,
    agent_wallet_address: agent?.agent_wallet_address,
    owner_wallet: agent?.owner_wallet,
    deployer_wallet_address: agent?.deployer_wallet_address,
    user_id: agent?.user_id,
  });

  // Priority order for agent wallet address:
  // 1. agent_wallet_address (primary field for agent's wallet)
  // 2. owner_wallet (backup field)
  // 3. deployer_wallet_address (fallback)
  // 4. user_id (legacy fallback - might be wallet address)

  let walletAddress = null;
  let source = "fallback";

  if (agent?.agent_wallet_address) {
    walletAddress = agent.agent_wallet_address;
    source = "agent_wallet_address";
  } else if (agent?.owner_wallet) {
    walletAddress = agent.owner_wallet;
    source = "owner_wallet";
  } else if (agent?.deployer_wallet_address) {
    walletAddress = agent.deployer_wallet_address;
    source = "deployer_wallet_address";
  } else if (agent?.user_id && agent.user_id.startsWith("0x")) {
    // Some legacy agents might have wallet address in user_id
    walletAddress = agent.user_id;
    source = "user_id (legacy)";
  }

  console.log("🔍 AgentInteractionModal: Agent wallet resolved:", {
    walletAddress,
    source,
    agent: agent?.name,
    note: "Currently same as deployer's wallet - will change when agents get individual wallets",
  });

  return walletAddress || "No wallet configured";
};

const formatWalletAddress = (address) => {
  if (!address || address === "No wallet configured") {
    return address;
  }

  // Format as shortened address: 0x1234...5678
  if (address.length > 10) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  return address;
};

const getTokenContractDisplay = (agent) => {
  // Log the full agent object for debugging chain info
  console.log("🔍 AgentInteractionModal: Full agent data for contract:", {
    name: agent?.name,
    deployment_chain_id: agent?.deployment_chain_id,
    deployment_network_name: agent?.deployment_network_name,
    chain_id: agent?.chain_id,
    network: agent?.network,
    allKeys: agent
      ? Object.keys(agent).filter(
          (k) =>
            k.includes("chain") ||
            k.includes("contract") ||
            k.includes("network")
        )
      : [],
  });

  // 🔧 CRITICAL: Use same logic as getNetworkDisplay for consistency
  // Use agent.network field (like ModernAgentCard) instead of chain_id
  let chainId;

  if (agent?.network && networkToChainId[agent.network]) {
    chainId = networkToChainId[agent.network];
    console.log("🎯 AgentInteractionModal: Using agent.network for contract:", {
      agentName: agent?.name,
      networkField: agent.network,
      mappedChainId: chainId,
      source: "agent.network + networkToChainId mapping",
    });
  } else {
    // Fallback to chain_id if network mapping not found
    chainId = agent?.chain_id || agent?.deployment_chain_id;
    console.log(
      "🎯 AgentInteractionModal: Fallback to chain_id for contract:",
      {
        agentName: agent?.name,
        chainId: chainId,
        source: "fallback chain_id/deployment_chain_id",
      }
    );
  }

  // ✅ NEW: Check for token_address in database first (for Solana and other non-EVM)
  if (agent?.token_address && agent.token_address.length > 10) {
    const display = `${agent.token_address.substring(
      0,
      8
    )}...${agent.token_address.substring(agent.token_address.length - 8)}`;
    console.log("✅ Using agent.token_address:", {
      display,
      fullAddress: agent.token_address,
      agent: agent?.name,
      source: "database token_address field",
    });
    return display;
  }

  if (!chainId) {
    console.log(
      "⚠️ AgentInteractionModal: No chain ID found for agent:",
      agent?.name
    );
    return "Contract not available";
  }

  const usdcContract = getUSDCContractForChain(chainId);

  if (usdcContract) {
    // Format: 0x1c7D4B...79C7238
    const display = `${usdcContract.substring(0, 8)}...${usdcContract.substring(
      34
    )}`;
    console.log("✅ AgentInteractionModal: Token contract display:", {
      display,
      chainId: chainId,
      agent: agent?.name,
      fullContract: usdcContract,
    });
    return display;
  }

  console.log("⚠️ AgentInteractionModal: No USDC contract for chain:", chainId);
  return "Contract not available";
};

const AgentInteractionModal = ({
  agent,
  isOpen,
  onClose,
  onPayment,
  onQRScan = null,
  paymentAmount = null, // 💰 Dynamic payment amount from e-shop/on-ramp
  isPaid = false, // 🔓 Whether user has paid for this agent (controlled by parent)
}) => {
  const [activeTab, setActiveTab] = useState("chat");
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [showPaymentRequired, setShowPaymentRequired] = useState(false); // Show payment required message
  const messagesEndRef = useRef(null);

  // Reset payment required message when agent changes or paid status changes
  useEffect(() => {
    if (agent) {
      setShowPaymentRequired(false);

      // If just got paid, show success message
      if (isPaid) {
        const unlockMessage = {
          id: Date.now(),
          type: "agent",
          content:
            "🔓 Payment received! All interactions are now unlocked. Feel free to chat, call, or video chat with me anytime!",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, unlockMessage]);
      }
    }
  }, [agent?.id, isPaid]);

  // Initialize conversation when agent changes
  useEffect(() => {
    if (agent && isOpen) {
      const welcomeMessage = {
        id: Date.now(),
        type: "agent",
        content: `Hello! I'm ${agent.name}. ${agent.description} How can I help you today?`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [agent, isOpen]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Check if this is Travel Agent with MCP integration
    const isTravelAgent =
      agent.name === "Travel Agent" ||
      agent.agent_type === "travel_agent" ||
      (agent.name && agent.name.toLowerCase().includes("travel"));

    if (isTravelAgent && isPaid) {
      // ✈️ Travel Agent with MCP - SERVER-SIDE x402 payment via backend
      console.log(
        "✈️ Travel Agent MCP query (server-side x402):",
        inputMessage
      );

      // Call backend API - agent pays x402 from its own wallet
      (async () => {
        try {
          // Show querying message
          const queryingMessage = {
            id: Date.now() + 1,
            type: "agent",
            content: "🔍 Querying Flightradar24 MCP (agent paying x402 fee)...",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, queryingMessage]);

          // Parse flight query from user message
          const query = parseFlightQuery(inputMessage);

          if (!query) {
            throw new Error(
              "❌ I couldn't understand your flight query. Please use this format:\n\n" +
                '"flights from [ORIGIN] to [DESTINATION]"\n\n' +
                "Examples:\n" +
                '• "flights from BUD to BCN" (shows live flights today)\n' +
                '• "flights from JFK to LAX" (current flights)\n' +
                '• "flights from LHR to CDG"\n\n' +
                "Note: I search for LIVE flights currently in the air or departing today."
            );
          }

          console.log("📍 Parsed flight query:", query);

          // Prepare request payload
          const requestPayload = {
            origin: query.origin,
            destination: query.destination,
            date: query.date,
            maxResults: 5,
          };

          console.log("📤 Sending to backend:", requestPayload);

          // Show user what we're searching for
          const searchingMessage = {
            id: Date.now() + 0.5,
            type: "agent",
            content: `🔍 Searching flights from ${query.origin} to ${query.destination} on ${query.date}...`,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, searchingMessage]);

          // Call Travel Agent backend API (SERVER-SIDE x402 payment)
          const response = await fetch(
            "http://localhost:4001/api/agents/travel/query",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(requestPayload),
            }
          );

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `Backend API error: ${response.status} - ${errorText}`
            );
          }

          const data = await response.json();
          console.log("✈️ Backend response:", data);

          // Format and display results
          const flightData = formatFlightResults(data);

          const resultMessage = {
            id: Date.now() + 2,
            type: "agent",
            content: flightData,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, resultMessage]);
        } catch (error) {
          console.error("❌ Backend MCP query failed:", error);

          const errorMessage = {
            id: Date.now() + 3,
            type: "agent",
            content: `❌ Failed to query flights:\n\n${error.message}\n\nPlease ensure:\n1. Travel Agent backend is running (http://localhost:4001)\n2. Agent has sufficient USDh balance for x402 payment\n3. Query format: "flights from [ORIGIN] to [DEST]"\n\nExamples:\n• "flights from BUD to BCN" (live flights today)\n• "flights from JFK to LAX" (current flights)\n• "flights from LHR to CDG"\n\nNote: I search for LIVE flights currently in the air or departing today.`,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorMessage]);
        } finally {
          setIsTyping(false);
        }
      })();
    } else {
      // Standard agent response
      setTimeout(() => {
        const agentResponse = {
          id: Date.now() + 1,
          type: "agent",
          content: generateAgentResponse(inputMessage, agent),
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, agentResponse]);
        setIsTyping(false);
      }, 1000 + Math.random() * 2000);
    }
  };

  // Generate contextual agent response
  const generateAgentResponse = (userInput, agent) => {
    // Check for Travel Agent package/alternative queries
    const isTravelAgent =
      agent.name === "Travel Agent" ||
      agent.agent_type === "travel_agent" ||
      (agent.name && agent.name.toLowerCase().includes("travel"));

    const input = userInput.toLowerCase();

    if (isTravelAgent && isPaid) {
      // Handle package/alternative queries
      if (
        input.includes("package") ||
        input.includes("alternative") ||
        input.includes("bus") ||
        input.includes("train") ||
        input.includes("hotel")
      ) {
        return `🚌🚆🏨 Coordinating with Bus, Train, and Hotel agents...\n\n**Alternative Travel Package:**\n- Bus to station: $1000 (Bus Agent)\n- Train to Barcelona: $1500 (Train Agent)\n- Hotel (2 nights): $1200 (Hotel Agent)\n- Travel Agent fee: $625\n\n**Total: $4325**\n\nThis saves you $150 compared to direct flight + hotel!\n\nWould you like to proceed with this package? I'll handle the payments to all three agents for you.`;
      }

      // Handle payment confirmation
      if (
        input.includes("yes") ||
        input.includes("proceed") ||
        input.includes("book") ||
        input.includes("confirm")
      ) {
        return `✅ Perfect! Please proceed to the Payment tab to pay $4325.\n\nOnce paid, I will automatically split and send:\n- $1000 to Bus Agent\n- $1500 to Train Agent  \n- $1200 to Hotel Agent\n- $625 to my account (coordination fee)\n\nYour package will be confirmed immediately!`;
      }
    }

    const responses = {
      "Intelligent Assistant": [
        "I can help you with analysis, research, and problem-solving. What would you like to explore?",
        "Based on your question, I'd recommend looking into the latest developments in that area.",
        "That's an interesting point. Let me provide some insights on that topic.",
        "I can assist you with data analysis and strategic planning for that challenge.",
      ],
      "Content Creator": [
        "I can help you create engaging content for your project. What type of content are you looking for?",
        "That sounds like a great content opportunity! I can help you develop that idea.",
        "For content creation, I'd suggest focusing on storytelling and audience engagement.",
        "I can help you craft compelling narratives and visual content for your needs.",
      ],
      "Local Services": [
        "I can connect you with local service providers in your area. What services do you need?",
        "Based on your location, I can recommend the best local options for that service.",
        "I have access to a network of trusted local professionals who can help with that.",
        "Let me find the most suitable local services for your specific requirements.",
      ],
      "Tutor/Teacher": [
        "I'm here to help you learn! What subject or skill would you like to explore?",
        "That's a great question for learning. Let me break that down for you step by step.",
        "I can provide personalized tutoring on that topic. Would you like to start with the basics?",
        "Learning is a journey, and I'm here to guide you through each step of the process.",
      ],
      "Game Agent": [
        "Ready for some fun? I can create interactive games and challenges for you!",
        "That sounds like it could be turned into an exciting game! Want to try?",
        "I love gamifying experiences. Let me design something engaging for you.",
        "Games are a great way to learn and have fun. What type of game interests you?",
      ],
    };

    const agentResponses =
      responses[agent.agent_type || agent.object_type] ||
      responses["Intelligent Assistant"];
    return agentResponses[Math.floor(Math.random() * agentResponses.length)];
  };

  // Handle payment request
  const handlePayment = () => {
    if (onPayment) {
      onPayment(agent);
    }
  };

  // 🔓 Handle locked interaction click - show payment requirement message
  const handleLockedInteractionClick = (interactionType) => {
    console.log(`🔒 Locked interaction clicked: ${interactionType}`);

    // Add agent message requiring payment
    const paymentRequiredMessage = {
      id: Date.now(),
      type: "agent",
      content: `I require a fee for my services before we can ${
        interactionType === "chat"
          ? "chat"
          : interactionType === "voice"
          ? "start a voice call"
          : "start a video call"
      }. Please proceed to the Payment tab to unlock all interactions.`,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, paymentRequiredMessage]);
    setShowPaymentRequired(true);

    // Auto-hide the message after 5 seconds
    setTimeout(() => {
      setShowPaymentRequired(false);
    }, 5000);
  };

  // Handle QR scan request
  const handleQRScan = () => {
    if (onQRScan) {
      onQRScan(agent);
    }
  };

  // Toggle voice recording
  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // In a real implementation, this would start/stop voice recording
  };

  // Toggle video call
  const toggleVideoCall = () => {
    setIsVideoCall(!isVideoCall);
    // In a real implementation, this would start/stop video call
  };

  if (!isOpen || !agent) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] bg-slate-900 border-purple-500/30 text-white overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl text-white">
                  {agent.name}
                </CardTitle>
                <CardDescription className="text-purple-100">
                  {agent.agent_type || agent.object_type} •{" "}
                  {agent.distance_meters?.toFixed(0)}m away
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-500 text-white">
                <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
                Online
              </Badge>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <div className="flex border-b border-slate-700">
          {[
            {
              id: "chat",
              label: "Chat",
              icon: MessageCircle,
              requiresPayment: true,
            },
            { id: "voice", label: "Voice", icon: Mic, requiresPayment: true },
            { id: "video", label: "Video", icon: Video, requiresPayment: true },
            {
              id: "payment",
              label: "Payment",
              icon: Wallet,
              requiresPayment: false,
            },
          ].map((tab) => {
            const isLocked = tab.requiresPayment && !isPaid;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (isLocked) {
                    // 🔒 Show payment required message instead of switching tab
                    handleLockedInteractionClick(tab.id);
                    setActiveTab("payment"); // Auto-switch to payment tab
                  } else {
                    setActiveTab(tab.id);
                  }
                }}
                className={`flex-1 flex items-center justify-center space-x-2 p-3 transition-colors relative ${
                  activeTab === tab.id
                    ? "bg-purple-500/30 text-white border-b-2 border-purple-400"
                    : isLocked
                    ? "text-slate-500 hover:bg-slate-800/50 hover:text-slate-400 cursor-not-allowed"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <tab.icon
                  className={`w-4 h-4 ${isLocked ? "opacity-50" : ""}`}
                />
                <span
                  className={`text-sm font-medium ${
                    isLocked ? "opacity-50" : ""
                  }`}
                >
                  {tab.label}
                </span>
                {isLocked && (
                  <span className="absolute top-1 right-1 text-xs">🔒</span>
                )}
              </button>
            );
          })}
        </div>

        <CardContent className="p-0 h-96 overflow-hidden">
          {activeTab === "chat" && (
            <div className="h-full flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.type === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.type === "user"
                          ? "bg-purple-500 text-white"
                          : "bg-slate-700 text-white"
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        {message.type === "user" ? (
                          <User className="w-4 h-4" />
                        ) : (
                          <Bot className="w-4 h-4" />
                        )}
                        <span className="text-xs opacity-70">
                          {message.type === "user" ? "You" : agent.name}
                        </span>
                      </div>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-slate-700 text-white px-4 py-2 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Bot className="w-4 h-4" />
                        <span className="text-xs opacity-70">
                          {agent.name} is typing...
                        </span>
                      </div>
                      <div className="flex space-x-1 mt-1">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-slate-700 p-4">
                <div className="flex space-x-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    placeholder={`Message ${agent.name}...`}
                    className="flex-1 bg-slate-800 border-slate-600 text-white placeholder-slate-400"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim()}
                    className="bg-purple-500 hover:bg-purple-600"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "voice" && (
            <div className="h-full flex flex-col items-center justify-center p-8">
              <div className="text-center space-y-6">
                <div
                  className={`w-24 h-24 rounded-full flex items-center justify-center ${
                    isRecording ? "bg-red-500 animate-pulse" : "bg-slate-700"
                  }`}
                >
                  {isRecording ? (
                    <MicOff className="w-12 h-12 text-white" />
                  ) : (
                    <Mic className="w-12 h-12 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Voice Chat
                  </h3>
                  <p className="text-slate-400">
                    {isRecording
                      ? "Recording... Tap to stop"
                      : "Tap to start voice conversation"}
                  </p>
                </div>
                <Button
                  onClick={toggleRecording}
                  className={`${
                    isRecording
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-purple-500 hover:bg-purple-600"
                  }`}
                >
                  {isRecording ? "Stop Recording" : "Start Recording"}
                </Button>
              </div>
            </div>
          )}

          {activeTab === "video" && (
            <div className="h-full flex flex-col items-center justify-center p-8">
              <div className="text-center space-y-6">
                <div
                  className={`w-24 h-24 rounded-full flex items-center justify-center ${
                    isVideoCall ? "bg-green-500 animate-pulse" : "bg-slate-700"
                  }`}
                >
                  {isVideoCall ? (
                    <VideoOff className="w-12 h-12 text-white" />
                  ) : (
                    <Video className="w-12 h-12 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Video Call
                  </h3>
                  <p className="text-slate-400">
                    {isVideoCall
                      ? "Video call active... Tap to end"
                      : "Start video conversation with agent"}
                  </p>
                </div>
                <Button
                  onClick={toggleVideoCall}
                  className={`${
                    isVideoCall
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-green-500 hover:bg-green-600"
                  }`}
                >
                  {isVideoCall ? "End Call" : "Start Video Call"}
                </Button>
              </div>
            </div>
          )}

          {activeTab === "payment" && (
            <div className="h-full flex flex-col items-center justify-center p-8">
              <div className="text-center space-y-6 max-w-sm">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Wallet className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Agent Payment
                  </h3>
                  <p className="text-slate-400 mb-4">
                    Pay for premium interactions with {agent.name}
                  </p>
                  <div className="bg-slate-800 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-400">Service Fee:</span>
                      <span className="text-white font-semibold">
                        {getServiceFeeDisplay(agent, paymentAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-400">Network:</span>
                      <span className="text-purple-400">
                        {getNetworkDisplay(agent)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-400">Receiving Wallet:</span>
                      <span
                        className="text-blue-400 font-mono text-sm"
                        title={getAgentWalletAddress(agent)}
                      >
                        {formatWalletAddress(getAgentWalletAddress(agent))}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Token Contract:</span>
                      <span className="text-green-400 font-mono text-sm">
                        {getTokenContractDisplay(agent)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <Button
                    onClick={handlePayment}
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    Generate Payment
                  </Button>
                  {onQRScan && (
                    <Button
                      onClick={handleQRScan}
                      variant="outline"
                      className="w-full border-green-600 text-green-400 hover:bg-green-500/20 hover:border-green-500"
                    >
                      <QrCode className="w-4 h-4 mr-2" />
                      Scan QR to Pay
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="w-full border-slate-600 text-slate-300 hover:bg-slate-800"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentInteractionModal;
