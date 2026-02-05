import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Camera,
  MapPin,
  Wifi,
  WifiOff,
  Users,
  Zap,
  Globe,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Satellite,
  Wallet,
  ArrowLeft,
  Home,
  Box,
  Layers,
} from "lucide-react";
import { useDatabase } from "../hooks/useDatabase";
import CameraView from "./CameraView";
import AR3DScene from "./AR3DScene";
import ARQRCodeFixed from "./ARQRCodeFixed";
import ThirdWebWalletConnect from "./ThirdWebWalletConnect";
import UnifiedWalletConnect from "./UnifiedWalletConnect";
import { autoDetectWallet } from "../utils/mobileWalletDetection";
import rtkLocationService from "../services/rtkLocation";
import {
  normalizeAgentType,
  getAgentTypeLabel,
  isPaymentAgent,
  isVirtualTerminal,
  isHederaAgent,
  getAgentTypeBadgeColor,
} from "../utils/agentTypeMapping";

const ARViewer = () => {
  const navigate = useNavigate();
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [initializationStep, setInitializationStep] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [nearAgents, setNearAgents] = useState([]);
  const [cameraActive, setCameraActive] = useState(true); // 🎥 Camera ON by default
  const [cameraFacing, setCameraFacing] = useState("environment"); // Track camera facing mode
  const [hasMultipleCameras, setHasMultipleCameras] = useState(true); // Assume multiple cameras by default
  const cameraViewRef = useRef(null); // Ref to control CameraView
  const [selectedTab, setSelectedTab] = useState("viewer");
  const [viewMode, setViewMode] = useState("3d"); // "2d" or "3d" - Default to 3D for immersive experience
  const [rtkStatus, setRtkStatus] = useState({
    isRTKEnhanced: false,
    source: "Standard GPS",
  });
  const [walletConnection, setWalletConnection] = useState({
    isConnected: false,
    address: null,
    user: null,
  });

  // 🎯 Payment Terminal Mode
  const [paymentContext, setPaymentContext] = useState(null);
  const [showOnlyTerminals, setShowOnlyTerminals] = useState(false);

  // 🌐 Network Filter State
  const [networkFilter, setNetworkFilter] = useState("all");

  // 🎛️ Filter Modal State
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  // 🔍 Agent Filtering State - Default to "My Payment Terminals"
  const [agentFilters, setAgentFilters] = useState({
    allAgents: false,
    noAgents: false,
    myAgents: false,
    myPaymentTerminals: true, // 🎯 Default to showing user's payment terminals
    allNonMyAgents: false,
    allPaymentTerminals: false,
    // Individual agent types
    intelligentAssistant: false,
    localServices: false,
    paymentTerminal: false,
    gameAgent: false,
    worldBuilder3D: false,
    virtualTerminal: false,
    contentCreator: false,
    realEstateBroker: false,
    busStopAgent: false,
    trailingPaymentTerminal: false,
    myGhost: false,
    // 🆕 Hedera AI Agent Types
    busAgent: false,
    trainAgent: false,
    hotelAgent: false,
    flightAgent: false,
    restaurantAgent: false,
    travelAgent: false,
    allHederaAgents: false, // Filter for all Hedera agents at once
  });

  console.log("🎨 ARViewer component rendered. URL:", window.location.href);

  const {
    isLoading,
    error: dbError,
    connectionStatus,
    getNearAgents,
    refreshConnection,
  } = useDatabase();

  const isMountedRef = useRef(true);

  // 🎯 Check for pending payment on mount
  useEffect(() => {
    // Check URL parameters for payment data
    const urlParams = new URLSearchParams(window.location.search);
    const isPaymentMode = urlParams.get("payment") === "true";
    const encodedData = urlParams.get("data");
    const filterParam = urlParams.get("filter"); // Get filter from URL

    // 🔍 Apply filter from URL parameter if present
    if (filterParam) {
      console.log("🎯 Applying filter from URL:", filterParam);
      const newFilters = { ...agentFilters };

      // Reset all filters first
      Object.keys(newFilters).forEach((key) => {
        newFilters[key] = false;
      });

      // Set the requested filter
      switch (filterParam) {
        case "myPaymentTerminals":
          newFilters.myPaymentTerminals = true;
          console.log("🔒 Filter set to: My Payment Terminals");
          break;
        case "allAgents":
          newFilters.allPaymentTerminals = true; // Show all non-my payment terminals
          console.log("🌐 Filter set to: All Non-My Payment Terminals");
          break;
        case "virtualATMs":
          newFilters.virtualTerminal = true; // ARTM Virtual Terminals
          console.log("🏧 Filter set to: ARTM Virtual Terminals");
          break;
        default:
          console.log("⚠️ Unknown filter parameter:", filterParam);
      }

      setAgentFilters(newFilters);
    }

    if (isPaymentMode && encodedData) {
      try {
        const paymentData = JSON.parse(atob(encodedData));
        setPaymentContext(paymentData);
        setShowOnlyTerminals(true);
        console.log("💳 Payment mode activated with data:", paymentData);
        console.log(
          "🔒 Showing only MY Payment Terminal agents (user's own terminals)",
        );

        // 🔐 SECURITY: Update filters to show ONLY user's own payment terminals
        // Users can only process online payments through their own terminals
        setAgentFilters({
          ...agentFilters,
          allPaymentTerminals: false, // Changed from true
          myPaymentTerminals: true, // Changed from false - ONLY user's terminals
        });
      } catch (error) {
        console.error("❌ Error parsing payment data:", error);
      }
    } else {
      // Check sessionStorage for backward compatibility
      const pendingPaymentStr = sessionStorage.getItem("pendingPayment");
      const showTerminalsOnly = sessionStorage.getItem("showOnlyTerminals");

      if (pendingPaymentStr) {
        try {
          const payment = JSON.parse(pendingPaymentStr);
          setPaymentContext(payment);
          console.log("💳 Payment context loaded from session:", payment);
        } catch (error) {
          console.error("❌ Error parsing payment context:", error);
        }
      }

      if (showTerminalsOnly === "true") {
        setShowOnlyTerminals(true);
        console.log("🔒 Filtering to show only Payment Terminals");
      }
    }
  }, []);

  // 🔍 Check for existing wallet connections on mount
  useEffect(() => {
    const checkExistingWalletConnections = async () => {
      console.log("🔍 Checking for existing wallet connections...");

      const connections = {};

      // Check for mobile wallet reconnection first
      const mobileWallet = await autoDetectWallet();
      if (mobileWallet && mobileWallet.success) {
        connections.evm = {
          isConnected: true,
          address: mobileWallet.address,
        };
        console.log(
          "✅ Found mobile/desktop wallet:",
          mobileWallet.method,
          mobileWallet.address,
        );
      }

      // Check Solana/Phantom wallet
      if (window.solana && window.solana.isPhantom) {
        try {
          const response = await window.solana.connect({ onlyIfTrusted: true });
          if (response.publicKey) {
            connections.solana = {
              isConnected: true,
              address: response.publicKey.toString(),
              network: "devnet", // Or detect from connection
            };
            console.log(
              "✅ Found existing Solana connection:",
              response.publicKey.toString(),
            );
          }
        } catch (error) {
          console.log("ℹ️ No existing Solana connection");
        }
      }

      // Fallback: Check EVM/MetaMask wallet if not already detected
      if (!connections.evm && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          if (accounts && accounts.length > 0) {
            connections.evm = {
              isConnected: true,
              address: accounts[0],
            };
            console.log("✅ Found existing EVM connection:", accounts[0]);
          }
        } catch (error) {
          console.log("ℹ️ No existing EVM connection");
        }
      }

      // Update wallet connection state if any connections found
      if (Object.keys(connections).length > 0) {
        setWalletConnection({
          ...connections,
          hasAnyConnection: true,
        });
        console.log("✅ Wallet connections initialized:", connections);
      }
    };

    checkExistingWalletConnections();
  }, []);

  // Initialize RTK-enhanced location services
  const initializeLocation = async () => {
    try {
      setInitializationStep(1);
      console.log("📍 Requesting RTK-enhanced location...");

      // Use RTK location service for enhanced accuracy
      const location = await rtkLocationService.getEnhancedLocation();

      setCurrentLocation(location);
      setLocationError(null);
      setRtkStatus({
        isRTKEnhanced: location.isRTKEnhanced || false,
        source: location.source || "Standard GPS",
        accuracy: location.accuracy,
        altitude: location.altitude,
      });

      console.log("✅ RTK Location acquired:", location);
      return location;
    } catch (error) {
      console.error("❌ RTK Location error:", error);
      setLocationError(error.message);

      // Use fallback location (YOUR ACTUAL LOCATION - Czech Republic)
      const fallbackLocation = {
        latitude: 50.64741,
        longitude: 13.835543,
        altitude: 52.0,
        accuracy: 1000,
        timestamp: Date.now(),
        isFallback: true,
        source: "Fallback Location",
      };

      setCurrentLocation(fallbackLocation);
      setRtkStatus({
        isRTKEnhanced: false,
        source: "Fallback Location",
        accuracy: 1000,
        altitude: 52.0,
      });

      console.log("🔄 Using fallback location:", fallbackLocation);
      return fallbackLocation;
    }
  };

  // 📺 Screen Positioning System - Convert percentage coordinates to 3D AR space
  /**
   * Convert screen percentage coordinates (0-100%) to 3D AR space coordinates
   * @param {number} xPercent - Horizontal position (0 = left, 50 = center, 100 = right)
   * @param {number} yPercent - Vertical position (0 = top, 50 = center, 100 = bottom)
   * @param {number} index - Agent index for slight offset to prevent overlap
   * @returns {{x: number, y: number, z: number}} 3D position in AR coordinate space
   */
  const convertScreenPercentToAR = (xPercent, yPercent, index = 0) => {
    // Get current viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Convert percentage to pixel position
    const screenX = (xPercent / 100) * viewportWidth;
    const screenY = (yPercent / 100) * viewportHeight;

    // Convert to normalized device coordinates (NDC: -1 to 1)
    // X: -1 = left edge, 0 = center, 1 = right edge
    // Y: 1 = top edge, 0 = center, -1 = bottom edge (inverted for screen coords)
    const ndcX = (screenX / viewportWidth) * 2 - 1;
    const ndcY = -(screenY / viewportHeight) * 2 + 1;

    // Camera settings (matching AR camera configuration)
    const distance = 5; // Distance from camera in meters
    const fov = 60; // Field of view in degrees
    const aspect = viewportWidth / viewportHeight;

    // Calculate visible dimensions at the given distance
    const vFOV = (fov * Math.PI) / 180; // Vertical FOV in radians
    const hFOV = 2 * Math.atan(Math.tan(vFOV / 2) * aspect); // Horizontal FOV

    // Project NDC coordinates into 3D space
    const x = ndcX * distance * Math.tan(hFOV / 2);
    const y = ndcY * distance * Math.tan(vFOV / 2);
    const z = -distance;

    // Add small offset per agent to prevent exact overlap
    const offset = index * 0.05;

    const position = {
      x: x + offset,
      y: y + offset * 0.5,
      z: z - offset,
    };

    console.log(
      `📺 Screen → AR conversion: (${xPercent.toFixed(1)}%, ${yPercent.toFixed(
        1,
      )}%) → 3D(${position.x.toFixed(2)}, ${position.y.toFixed(
        2,
      )}, ${position.z.toFixed(2)})`,
    );

    return position;
  };

  // 📱 Responsive resize handler for screen-positioned agents
  const [viewportDimensions, setViewportDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    let resizeTimeout;

    const handleResize = () => {
      // Debounce resize events for performance
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const newDimensions = {
          width: window.innerWidth,
          height: window.innerHeight,
        };
        setViewportDimensions(newDimensions);
        console.log("📱 Viewport resized:", newDimensions);

        // Force re-render of screen-positioned agents
        const screenAgents = nearAgents.filter(
          (agent) => agent.positioning_mode === "screen",
        );
        if (screenAgents.length > 0) {
          console.log(
            `🔄 Recalculating positions for ${screenAgents.length} screen-positioned agents`,
          );
        }
      }, 150); // 150ms debounce
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, [nearAgents]);

  // Handle camera switch from UI button
  const handleSwitchCamera = () => {
    if (cameraViewRef.current) {
      // Update hasMultipleCameras state
      if (cameraViewRef.current.getHasMultipleCameras) {
        setHasMultipleCameras(cameraViewRef.current.getHasMultipleCameras());
      }

      // Switch camera if available
      if (cameraViewRef.current.switchCamera) {
        cameraViewRef.current.switchCamera();
      }
    }
  };

  // Poll camera capabilities
  useEffect(() => {
    const interval = setInterval(() => {
      if (
        cameraViewRef.current &&
        cameraViewRef.current.getHasMultipleCameras
      ) {
        setHasMultipleCameras(cameraViewRef.current.getHasMultipleCameras());
      }
    }, 2000); // Check every 2 seconds

    return () => clearInterval(interval);
  }, []);

  // Initialize camera
  const initializeCamera = async () => {
    try {
      setInitializationStep(2);
      console.log("📷 Initializing camera...");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      // Stop the stream immediately as we just needed permission
      stream.getTracks().forEach((track) => track.stop());

      setCameraActive(true);
      console.log("✅ Camera permission granted");
      return true;
    } catch (error) {
      console.error("❌ Camera error:", error);
      setCameraActive(false);
      return false;
    }
  };

  // Load NeAR agents
  const loadNearAgents = async (location) => {
    try {
      setInitializationStep(3);
      console.log("🔍 Loading NeAR agents for location:", location);

      const objects = await getNearAgents({
        latitude: location.latitude,
        longitude: location.longitude,
        radius_meters: 200, // Increased search radius
        limit: 20, // Increased limit
      });

      console.log(`📊 Raw objects received:`, objects);
      console.log(`📊 Objects length: ${objects?.length || 0}`);

      if (objects && objects.length > 0) {
        console.log(`📊 First object details:`, objects[0]);
        console.log(
          `📊 Object types:`,
          objects.map((o) => o.agent_type || o.object_type).join(", "),
        );
      }

      // 🎯 OLD Payment Terminal Mode filter - DISABLED
      // Now using the agentFilters system instead (lines 485-545)
      let filteredObjects = objects || [];
      // Legacy showOnlyTerminals mode is deprecated - use agentFilters.myPaymentTerminals instead
      /*
      if (showOnlyTerminals && walletConnection.address) {
        console.log("🔒 Payment Terminal Mode: Filtering agents...");
        console.log("👤 Connected wallet:", walletConnection.address);

        filteredObjects = objects.filter((agent) => {
          const agentType = agent.agent_type || agent.object_type;
          const isPaymentTerminal = agentType === "Payment Terminal";
          const isTrailingTerminal = agentType === "Trailing Payment Terminal";

          // ✅ Check multiple wallet fields for both EVM and Solana
          const agentWallet =
            agent.wallet_address ||
            agent.owner_wallet ||
            agent.deployer_address;
          const connectedWallet = walletConnection.address;

          const isOwnedByUser =
            agentWallet &&
            connectedWallet &&
            agentWallet.toLowerCase() === connectedWallet.toLowerCase();

          const shouldShow =
            (isPaymentTerminal || isTrailingTerminal) && isOwnedByUser;

          if (shouldShow) {
            console.log("✅ Showing terminal:", {
              name: agent.name,
              type: agentType,
              wallet: agentWallet,
              matched: connectedWallet,
            });
          }

          return shouldShow;
        });

        console.log(
          `🎯 Filtered to ${filteredObjects.length} payment terminals`
        );
      }
      */

      // 🌐 Network Filter moved to getFilteredAgents() function
      // This ensures it works together with agent type/ownership filters

      setNearAgents(filteredObjects || []);
      console.log(
        `✅ Set nearAgents state with ${filteredObjects?.length || 0} agents`,
      );
      console.log("🎯 Setting nearAgents to:", filteredObjects);

      // Additional debug for 3D rendering
      if (filteredObjects && filteredObjects.length > 0) {
        console.log("🔍 Object properties check:");
        filteredObjects.forEach((obj, i) => {
          console.log(`Agent ${i + 1}:`, {
            id: obj.id,
            name: obj.name,
            type: obj.agent_type || obj.object_type,
            lat: obj.latitude,
            lng: obj.longitude,
            distance: obj.distance_meters,
            wallet: obj.wallet_address,
          });
        });
      }

      return filteredObjects;
    } catch (error) {
      console.error("❌ Error loading objects:", error);
      setNearAgents([]);
      return [];
    }
  };

  // 🔍 Agent Filter Handler
  const handleFilterChange = (filterName) => {
    setAgentFilters((prev) => {
      const newFilters = { ...prev };

      // Handle "All Agents" - overrides everything
      if (filterName === "allAgents") {
        if (!prev.allAgents) {
          // Selecting "All Agents" - turn everything else off
          Object.keys(newFilters).forEach((key) => {
            newFilters[key] = key === "allAgents";
          });
        }
        return newFilters;
      }

      // Handle "No Agents" - clears everything
      if (filterName === "noAgents") {
        Object.keys(newFilters).forEach((key) => {
          newFilters[key] = key === "noAgents" && !prev.noAgents;
        });
        return newFilters;
      }

      // Any other filter deselects "All Agents" and "No Agents"
      newFilters.allAgents = false;
      newFilters.noAgents = false;
      newFilters[filterName] = !prev[filterName];

      // Handle mutual exclusivity for user-based filters
      if (filterName === "myAgents" && newFilters.myAgents) {
        newFilters.allNonMyAgents = false;
      }
      if (filterName === "allNonMyAgents" && newFilters.allNonMyAgents) {
        newFilters.myAgents = false;
        newFilters.myPaymentTerminals = false;
      }
      if (
        filterName === "myPaymentTerminals" &&
        newFilters.myPaymentTerminals
      ) {
        newFilters.allNonMyAgents = false;
      }

      return newFilters;
    });
  };

  // 🔍 Apply Agent Filters
  const getFilteredAgents = () => {
    const filters = agentFilters;

    // If "No Agents" is selected, return empty array
    if (filters.noAgents) {
      return [];
    }

    // If "All Agents" is selected, return all (but still apply network filter)
    let agentsToFilter = nearAgents;

    if (!filters.allAgents) {
      // Debug: Log the full walletConnection structure
      console.log(
        "🔍 WalletConnection Structure:",
        JSON.stringify(walletConnection, null, 2),
      );

      // Get connected wallet address from EVM, Solana, or Hedera
      const userWalletRaw =
        walletConnection?.evm?.address ||
        walletConnection?.solana?.address ||
        walletConnection?.hedera?.address ||
        walletConnection?.address; // Fallback for old structure

      // ⚠️ IMPORTANT: Don't lowercase Solana/Hedera addresses (case-sensitive)
      // Only lowercase EVM addresses (0x...)
      const userWallet = userWalletRaw?.startsWith("0x")
        ? userWalletRaw.toLowerCase()
        : userWalletRaw;

      // Debug logging
      console.log("🔍 Filter Debug:", {
        userWallet,
        userWalletRaw,
        walletConnectionKeys: Object.keys(walletConnection || {}),
        totalAgents: nearAgents.length,
        filters,
        sampleAgent: nearAgents[0]
          ? {
              name: nearAgents[0].name,
              agent_wallet: nearAgents[0].agent_wallet_address,
              owner_wallet: nearAgents[0].owner_wallet,
              wallet_address: nearAgents[0].wallet_address,
              deployer_address: nearAgents[0].deployer_address,
              type: nearAgents[0].agent_type,
              object_type: nearAgents[0].object_type,
            }
          : null,
      });

      console.log(
        "📊 All nearAgents:",
        nearAgents.map((a) => ({
          name: a.name,
          owner_wallet: a.owner_wallet,
          type: a.agent_type || a.object_type,
        })),
      );

      agentsToFilter = nearAgents.filter((agent) => {
        // ✅ Check ALL possible wallet fields for both EVM and Solana
        const agentWalletRaw =
          agent.agent_wallet_address ||
          agent.owner_wallet ||
          agent.wallet_address ||
          agent.deployer_address;

        // Normalize agent type using the new mapping utility
        // Handle string "null", actual null, and convert legacy home_security to virtual_terminal
        const agentType = normalizeAgentType(
          agent.agent_type &&
            agent.agent_type !== "null" &&
            agent.agent_type !== null
            ? agent.agent_type
            : agent.object_type === "home_security"
            ? "virtual_terminal"
            : agent.object_type,
        );

        // ⚠️ IMPORTANT: Solana addresses are case-sensitive (base58)
        // Only lowercase for EVM addresses (0x...)
        const agentWallet = agentWalletRaw?.startsWith("0x")
          ? agentWalletRaw.toLowerCase()
          : agentWalletRaw;

        const userWalletNormalized = userWallet?.startsWith("0x")
          ? userWallet.toLowerCase()
          : userWallet;

        // Check if it's user's agent
        const isMyAgent =
          userWalletNormalized && agentWallet === userWalletNormalized;

        // Debug log for ownership filters
        if (filters.myAgents || filters.allNonMyAgents) {
          console.log(
            `🔍 Agent: ${agent.name}, AgentWallet: ${agentWallet}, UserWallet: ${userWalletNormalized}, IsMyAgent: ${isMyAgent}, Type: ${agentType}`,
          );
        }

        // User-based filters
        if (filters.myAgents && !isMyAgent) return false;
        if (filters.allNonMyAgents && isMyAgent) return false;

        // Payment terminal filters using new utility functions
        const isAnyPaymentTerminal = isPaymentAgent(agentType);
        const isVirtualTerminalType = isVirtualTerminal(agentType);

        // Check for "All Hedera Agents" filter FIRST (before payment terminal filters)
        const isHederaAgentType = isHederaAgent(agentType);

        if (filters.allHederaAgents && isHederaAgentType) {
          return true; // Always show Hedera agents when filter is active
        }

        if (filters.myPaymentTerminals) {
          // ONLY show content_creator type (My Personal Terminal)
          return isMyAgent && agentType === "content_creator";
        }

        if (filters.allPaymentTerminals) {
          // Show payment terminals but EXCLUDE Virtual Terminals (they have their own ARTM system)
          return !isMyAgent && isAnyPaymentTerminal && !isVirtualTerminalType;
        }

        // Individual type filters - now using normalized values
        const typeFilters = [
          { key: "intelligentAssistant", value: "intelligent_assistant" },
          { key: "localServices", value: "local_services" },
          { key: "paymentTerminal", value: "payment_terminal" },
          { key: "gameAgent", value: "game_agent" },
          { key: "worldBuilder3D", value: "3d_world_builder" },
          { key: "virtualTerminal", value: "virtual_terminal" },
          { key: "contentCreator", value: "content_creator" },
          { key: "realEstateBroker", value: "real_estate_broker" },
          { key: "busStopAgent", value: "bus_stop_agent" },
          {
            key: "trailingPaymentTerminal",
            value: "trailing_payment_terminal",
          },
          { key: "myGhost", value: "my_ghost" },
          // 🆕 Hedera AI Agent Types
          { key: "busAgent", value: "bus_agent" },
          { key: "trainAgent", value: "train_agent" },
          { key: "hotelAgent", value: "hotel_agent" },
          { key: "flightAgent", value: "flight_agent" },
          { key: "restaurantAgent", value: "restaurant_agent" },
          { key: "travelAgent", value: "travel_agent" },
        ];

        // Check if any type filter is active
        const hasActiveTypeFilter = typeFilters.some((f) => filters[f.key]);

        if (!hasActiveTypeFilter) {
          // No type filters active - show all (respecting user filters)
          return true;
        }

        // Check if agent matches any active type filter
        const matchesFilter = typeFilters.some((f) => {
          if (filters[f.key]) {
            const matches = agentType === f.value;
            // Debug Virtual Terminal specifically
            if (
              f.key === "virtualTerminal" ||
              agentType === "virtual_terminal"
            ) {
              console.log("🏧 Virtual Terminal Filter Check:", {
                agentName: agent.name,
                rawAgentType: agent.agent_type,
                normalizedAgentType: agentType,
                filterValue: f.value,
                filterActive: filters[f.key],
                matches: matches,
              });
            }
            return matches;
          }
          return false;
        });
        return matchesFilter;
      });
    }

    // 🌐 Apply Network Filter (after agent type/ownership filters)
    if (networkFilter !== "all") {
      console.log(
        "🌐 Applying network filter:",
        networkFilter,
        "to",
        agentsToFilter.length,
        "agents",
      );
      console.log(
        "🌐 Agents before network filter:",
        agentsToFilter.map((a) => ({
          name: a.name,
          type: a.agent_type || a.object_type,
          deployment_chain_id: a.deployment_chain_id,
          chain_id: a.chain_id,
          network: a.deployment_network_name,
          owner: a.owner_wallet,
        })),
      );
      const beforeNetworkFilter = agentsToFilter.length;

      agentsToFilter = agentsToFilter.filter((agent) => {
        // Get network info from multiple sources with proper priority
        const deploymentChainId = agent.deployment_chain_id;
        const chainId = agent.chain_id;
        const networkName = (
          agent.deployment_network_name ||
          agent.payment_config?.network_info?.name ||
          ""
        ).toLowerCase();

        // For Solana (null chain_id), check deployment_network_name
        if (networkFilter === "solana-devnet") {
          const isSolana =
            networkName.includes("solana") && networkName.includes("devnet");

          if (isSolana) {
            console.log("✅ Solana Devnet match:", {
              name: agent.name,
              network: networkName,
            });
          }
          return isSolana;
        }

        // For Hedera (chain ID 296)
        if (networkFilter === "296") {
          // Match by deployment_chain_id, chain_id, OR network name
          const matchesByDeployment = deploymentChainId === 296;
          const matchesByChainId = chainId === 296;
          const matchesByName = networkName.includes("hedera");

          const isHedera =
            matchesByDeployment || matchesByChainId || matchesByName;

          if (isHedera) {
            console.log("✅ Hedera Testnet match:", {
              name: agent.name,
              deploymentChainId,
              chainId,
              network: networkName,
              matchedBy: matchesByDeployment
                ? "deployment_chain_id"
                : matchesByChainId
                ? "chain_id"
                : "network_name",
            });
          }
          return isHedera;
        }

        // For EVM networks (Ethereum, Polygon, Arbitrum, etc.)
        const filterChainId = parseInt(networkFilter);

        // Match by deployment_chain_id OR chain_id
        const matchesByDeployment = deploymentChainId === filterChainId;
        const matchesByChainId = chainId === filterChainId;

        // IMPORTANT: Reject if network name clearly indicates a different network
        // (e.g., Hedera agent shouldn't appear in Ethereum filter even if chain_id matches)
        const isHederaAgent = networkName.includes("hedera");
        const isSolanaAgent = networkName.includes("solana");
        const hasWrongNetwork =
          (isHederaAgent && filterChainId !== 296) ||
          (isSolanaAgent && networkFilter !== "solana-devnet");

        // Match if deployment_chain_id OR chain_id matches, AND network name doesn't contradict
        const matchesFilter =
          (matchesByDeployment || matchesByChainId) && !hasWrongNetwork;

        if (matchesFilter) {
          console.log("✅ EVM Network match:", {
            name: agent.name,
            deploymentChainId,
            chainId,
            networkName,
            filter: networkFilter,
            matchedBy: matchesByDeployment ? "deployment_chain_id" : "chain_id",
          });
        } else if (
          (matchesByDeployment || matchesByChainId) &&
          hasWrongNetwork
        ) {
          console.warn(
            "⚠️ Agent chain_id matches but network name contradicts - FILTERED OUT:",
            {
              name: agent.name,
              chainId,
              networkName,
              filter: networkFilter,
            },
          );
        }

        return matchesFilter;
      });

      console.log(
        `🌐 Network filtered: ${beforeNetworkFilter} → ${agentsToFilter.length} agents`,
      );
      console.log(
        "🌐 Agents after network filter:",
        agentsToFilter.map((a) => ({
          name: a.name,
          type: a.agent_type || a.object_type,
          owner: a.owner_wallet,
        })),
      );
    }

    console.log(
      "✅ Final filtered agents:",
      agentsToFilter.length,
      agentsToFilter.map((a) => ({
        name: a.name,
        type: a.agent_type || a.object_type,
        owner: a.owner_wallet,
      })),
    );

    return agentsToFilter;
  };

  // Full initialization sequence
  const initializeApp = async () => {
    try {
      if (!isMountedRef.current) return;

      console.log("🚀 Starting AR Viewer initialization...");

      // Step 1: Location
      const location = await initializeLocation();
      if (!isMountedRef.current) return;

      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Step 2: Camera - SKIP MANUAL INITIALIZATION
      // Camera is now handled automatically by CameraView component
      console.log("📷 Camera initialization delegated to CameraView component");
      if (!isMountedRef.current) return;

      await new Promise((resolve) => setTimeout(resolve, 500));

      // Step 3: Database and objects
      if (isMountedRef.current) {
        await refreshConnection();
        await loadNearAgents(location);
      }
      if (!isMountedRef.current) return;

      await new Promise((resolve) => setTimeout(resolve, 800));

      // Step 4: Complete
      if (isMountedRef.current) {
        setInitializationStep(4);
        setIsInitialized(true);
        console.log("🎉 AR Viewer initialization complete!");
      }
    } catch (error) {
      console.error("❌ Initialization error:", error);
      if (isMountedRef.current) {
        setIsInitialized(true); // Allow app to continue with fallbacks
      }
    }
  };

  // Initialize on mount
  useEffect(() => {
    isMountedRef.current = true;
    initializeApp();

    // Auto-detect already connected wallet
    const detectConnectedWallet = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });

          if (accounts && accounts.length > 0) {
            console.log("🔗 Auto-detected connected wallet:", accounts[0]);
            setWalletConnection({
              isConnected: true,
              address: accounts[0],
              evm: {
                isConnected: true,
                address: accounts[0],
              },
              hasAnyConnection: true,
            });
          }
        } catch (error) {
          console.log("No wallet auto-detected:", error);
        }
      }
    };

    detectConnectedWallet();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Debug: Log filter state changes
  useEffect(() => {
    console.log("📊 Filter state changed:", agentFilters);
  }, [agentFilters]);

  // Render initialization screen
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-black/50 border-purple-500/30 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">
              CubePay
            </CardTitle>
            <CardDescription className="text-purple-200">
              Initializing AR Experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div
                className={`flex items-center space-x-3 p-3 rounded-lg ${
                  initializationStep >= 1
                    ? "bg-green-500/20 text-green-300"
                    : "bg-slate-700/50 text-slate-400"
                }`}
              >
                <MapPin className="w-5 h-5" />
                <span>Location Services</span>
                {initializationStep >= 1 && (
                  <Badge variant="secondary" className="ml-auto">
                    ✓
                  </Badge>
                )}
              </div>

              <div
                className={`flex items-center space-x-3 p-3 rounded-lg ${
                  initializationStep >= 2
                    ? "bg-green-500/20 text-green-300"
                    : "bg-slate-700/50 text-slate-400"
                }`}
              >
                <Camera className="w-5 h-5" />
                <span>Camera Access</span>
                {initializationStep >= 2 && (
                  <Badge variant="secondary" className="ml-auto">
                    ✓
                  </Badge>
                )}
              </div>

              <div
                className={`flex items-center space-x-3 p-3 rounded-lg ${
                  initializationStep >= 3
                    ? "bg-green-500/20 text-green-300"
                    : "bg-slate-700/50 text-slate-400"
                }`}
              >
                <Globe className="w-5 h-5" />
                <span>Database Connection</span>
                {initializationStep >= 3 && (
                  <Badge variant="secondary" className="ml-auto">
                    ✓
                  </Badge>
                )}
              </div>

              <div
                className={`flex items-center space-x-3 p-3 rounded-lg ${
                  initializationStep >= 4
                    ? "bg-green-500/20 text-green-300"
                    : "bg-slate-700/50 text-slate-400"
                }`}
              >
                <Zap className="w-5 h-5" />
                <span>AR Ready</span>
                {initializationStep >= 4 && (
                  <Badge variant="secondary" className="ml-auto">
                    ✓
                  </Badge>
                )}
              </div>
            </div>

            {locationError && (
              <div className="p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-200 text-sm">
                  Location: {locationError}
                </p>
                <p className="text-yellow-300 text-xs mt-1">
                  Using fallback location for demo
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main AR Viewer interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-sm border-b border-purple-500/30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Back Button */}
            <button
              onClick={() => navigate("/")}
              className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors text-slate-400 hover:text-white"
              title="Back to Main"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">CubePay</h1>
              <p className="text-sm text-purple-200">AR Agent Network</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Badge
              variant={
                connectionStatus === "connected" ? "default" : "destructive"
              }
              className="flex items-center space-x-1"
            >
              {connectionStatus === "connected" ? (
                <Wifi className="w-3 h-3" />
              ) : (
                <WifiOff className="w-3 h-3" />
              )}
              <span>
                {connectionStatus === "connected" ? "Connected" : "Offline"}
              </span>
            </Badge>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-purple-500/20">
        <div className="flex">
          {[
            { id: "viewer", label: "CubePay", icon: Camera },
            { id: "agents", label: "NEAR Agents", icon: Users },
            { id: "map", label: "NEAR Map", icon: MapPin },
            { id: "wallet", label: "Wallet", icon: Wallet },
            { id: "settings", label: "Settings", icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 p-4 transition-colors ${
                selectedTab === tab.id
                  ? "bg-purple-500/30 text-white border-b-2 border-purple-400"
                  : "text-purple-200 hover:bg-purple-500/10"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 space-y-4">
        {selectedTab === "viewer" && (
          <div className="space-y-4">
            {/* 3D/2D Mode Toggle */}
            <div className="flex justify-between items-center p-4 bg-black/30 rounded-lg border border-purple-500/30">
              <div>
                <h2 className="text-xl font-bold text-white">AR Experience</h2>
                <p className="text-sm text-purple-200">
                  {viewMode === "3d"
                    ? "🚀 Immersive 3D mode with spinning & floating agents"
                    : "📱 Traditional 2D overlay mode"}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Badge
                  variant={viewMode === "2d" ? "default" : "outline"}
                  className={`text-xs transition-all ${
                    viewMode === "2d"
                      ? "bg-blue-500"
                      : "bg-slate-700 text-slate-400"
                  }`}
                >
                  2D Overlay
                </Badge>
                <button
                  onClick={() => {
                    const newMode = viewMode === "2d" ? "3d" : "2d";
                    console.log(
                      `🔄 Switching AR view mode from ${viewMode} to ${newMode}`,
                    );
                    setViewMode(newMode);
                  }}
                  className={`p-3 rounded-lg transition-all shadow-lg ${
                    viewMode === "3d"
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      : "bg-purple-500 hover:bg-purple-600"
                  }`}
                  title={`Switch to ${viewMode === "2d" ? "3D" : "2D"} mode`}
                >
                  {viewMode === "2d" ? (
                    <Box className="w-6 h-6 text-white" />
                  ) : (
                    <Layers className="w-6 h-6 text-white" />
                  )}
                </button>
                <Badge
                  variant={viewMode === "3d" ? "default" : "outline"}
                  className={`text-xs transition-all ${
                    viewMode === "3d"
                      ? "bg-gradient-to-r from-purple-500 to-pink-500"
                      : "bg-slate-700 text-slate-400"
                  }`}
                >
                  🚀 3D Immersive
                </Badge>
              </div>
            </div>

            {/* Status Cards & Filters - Reorganized layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Left Side - 3 Info Tiles */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-6 h-6 text-purple-400" />
                        {rtkStatus.isRTKEnhanced && (
                          <Satellite className="w-3 h-3 text-green-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-1">
                          <p className="text-xs text-purple-200">Location</p>
                          {rtkStatus.isRTKEnhanced && (
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1 bg-green-500/20 border-green-500 text-green-300"
                            >
                              RTK
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-white truncate">
                          {currentLocation
                            ? `${currentLocation.latitude.toFixed(
                                4,
                              )}, ${currentLocation.longitude.toFixed(4)}`
                            : "Unknown"}
                        </p>
                        {currentLocation && (
                          <div className="text-[10px] text-purple-300">
                            ±{(rtkStatus.accuracy || 10).toFixed(1)}m
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-2">
                      <Users className="w-6 h-6 text-purple-400" />
                      <div>
                        <p className="text-xs text-purple-200">NeAR Agents</p>
                        <p className="text-lg font-semibold text-white">
                          {getFilteredAgents().length}/{nearAgents.length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-2">
                      <Globe className="w-6 h-6 text-purple-400" />
                      <div>
                        <p className="text-xs text-purple-200">Database</p>
                        <p className="text-sm font-semibold text-white">
                          {connectionStatus === "connected"
                            ? "Connected"
                            : "Offline"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Side - Compact Filter Button + Camera Controls */}
              <div
                className={`grid gap-2 ${
                  hasMultipleCameras ? "grid-cols-3" : "grid-cols-2"
                }`}
              >
                <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
                  <CardContent className="p-2">
                    <button
                      onClick={() => setShowFiltersModal(true)}
                      className="w-full py-2 px-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-lg text-white text-xs font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex flex-col items-center justify-center"
                    >
                      <Settings className="w-4 h-4 mb-1" />
                      <span className="text-[10px]">Filters</span>
                    </button>
                    <div className="mt-1 text-center">
                      <p className="text-[9px] text-purple-300">
                        {getFilteredAgents().length}/{nearAgents.length}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
                  <CardContent className="p-2 flex items-center justify-center h-full">
                    <Badge
                      variant="secondary"
                      className="bg-black/70 text-white border border-white/20 px-3 py-1"
                    >
                      <Camera className="w-4 h-4 mr-1" />
                      <span className="text-xs">
                        {cameraFacing === "environment" ? "Back" : "Front"}
                      </span>
                    </Badge>
                  </CardContent>
                </Card>

                {hasMultipleCameras && (
                  <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
                    <CardContent className="p-2 flex items-center justify-center h-full">
                      <button
                        onClick={handleSwitchCamera}
                        className="w-full py-2 px-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-xs font-semibold shadow-lg transition-all duration-200 flex flex-col items-center justify-center"
                      >
                        <RotateCcw className="w-5 h-5 mb-1" />
                        <span className="text-[10px]">Switch</span>
                      </button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* 🎛️ Filters Modal */}
            {showFiltersModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
                <Card className="bg-gradient-to-br from-purple-900/95 to-indigo-900/95 border-2 border-purple-500/50 backdrop-blur-md shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
                  <CardHeader className="pb-3 border-b border-purple-500/30">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-bold text-white flex items-center space-x-2">
                        <span>🔍</span>
                        <span>Filter Agents</span>
                      </CardTitle>
                      <button
                        onClick={() => setShowFiltersModal(false)}
                        className="w-10 h-10 bg-red-500/80 hover:bg-red-600/90 rounded-full flex items-center justify-center text-white text-2xl font-bold transition-all duration-200 shadow-lg"
                      >
                        ×
                      </button>
                    </div>
                    <CardDescription className="text-purple-200">
                      Customize which agents appear in your AR view
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
                    <div className="space-y-4">
                      {/* Primary Filters */}
                      <div className="grid grid-cols-2 gap-2">
                        <label className="flex items-center space-x-2 cursor-pointer hover:bg-purple-500/10 p-1.5 rounded transition-colors">
                          <input
                            type="checkbox"
                            checked={agentFilters.allAgents}
                            onChange={() => handleFilterChange("allAgents")}
                            className="w-4 h-4 text-purple-500 border-purple-400 rounded focus:ring-purple-500"
                          />
                          <span className="text-xs text-white font-medium">
                            All agents
                          </span>
                        </label>

                        <label className="flex items-center space-x-2 cursor-pointer hover:bg-red-500/10 p-1.5 rounded transition-colors">
                          <input
                            type="checkbox"
                            checked={agentFilters.noAgents}
                            onChange={() => handleFilterChange("noAgents")}
                            className="w-4 h-4 text-red-500 border-red-400 rounded focus:ring-red-500"
                          />
                          <span className="text-xs text-white font-medium">
                            No Agents
                          </span>
                        </label>
                      </div>

                      {/* User-Based Filters */}
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-purple-500/20">
                        <label className="flex items-center space-x-2 cursor-pointer hover:bg-blue-500/10 p-1.5 rounded transition-colors">
                          <input
                            type="checkbox"
                            checked={agentFilters.myAgents}
                            onChange={() => handleFilterChange("myAgents")}
                            className="w-4 h-4 text-blue-500 border-blue-400 rounded focus:ring-blue-500"
                          />
                          <span className="text-xs text-white">My agents</span>
                        </label>

                        <label className="flex items-center space-x-2 cursor-pointer hover:bg-green-500/10 p-1.5 rounded transition-colors">
                          <input
                            type="checkbox"
                            checked={agentFilters.myPaymentTerminals}
                            onChange={() =>
                              handleFilterChange("myPaymentTerminals")
                            }
                            className="w-4 h-4 text-green-500 border-green-400 rounded focus:ring-green-500"
                          />
                          <span className="text-xs text-white">
                            My Payment terminals
                          </span>
                        </label>

                        <label className="flex items-center space-x-2 cursor-pointer hover:bg-orange-500/10 p-1.5 rounded transition-colors">
                          <input
                            type="checkbox"
                            checked={agentFilters.allNonMyAgents}
                            onChange={() =>
                              handleFilterChange("allNonMyAgents")
                            }
                            className="w-4 h-4 text-orange-500 border-orange-400 rounded focus:ring-orange-500"
                          />
                          <span className="text-xs text-white">
                            All non-my agents
                          </span>
                        </label>

                        <label className="flex items-center space-x-2 cursor-pointer hover:bg-yellow-500/10 p-1.5 rounded transition-colors">
                          <input
                            type="checkbox"
                            checked={agentFilters.allPaymentTerminals}
                            onChange={() =>
                              handleFilterChange("allPaymentTerminals")
                            }
                            className="w-4 h-4 text-yellow-500 border-yellow-400 rounded focus:ring-yellow-500"
                          />
                          <span className="text-xs text-white">
                            All Non-My Payment Terminals
                          </span>
                        </label>
                      </div>

                      {/* 🌐 Network Filter */}
                      <div className="pt-2 border-t border-purple-500/20">
                        <label className="flex flex-col space-y-1.5">
                          <span className="text-xs text-purple-200 font-medium">
                            🌐 Filter by Network
                          </span>
                          <select
                            value={networkFilter}
                            onChange={(e) => setNetworkFilter(e.target.value)}
                            className="w-full px-2 py-1.5 text-xs bg-purple-900/30 border border-purple-500/30 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          >
                            <option value="all">All Networks</option>
                            <optgroup label="🔮 Non-EVM Testnets">
                              <option value="solana-devnet">
                                Solana Devnet
                              </option>
                              <option value="296">Hedera Testnet (296)</option>
                            </optgroup>
                            <optgroup label="⛓️ EVM Testnets">
                              <option value="11155111">
                                Ethereum Sepolia (11155111)
                              </option>
                              <option value="11155420">
                                Optimism Sepolia (11155420)
                              </option>
                              <option value="84532">
                                Base Sepolia (84532)
                              </option>
                              <option value="421614">
                                Arbitrum Sepolia (421614)
                              </option>
                              <option value="80002">
                                Polygon Amoy (80002)
                              </option>
                            </optgroup>
                          </select>
                        </label>
                      </div>

                      {/* Individual Agent Types */}
                      <div className="grid grid-cols-2 gap-1 pt-1 border-t border-purple-500/20 max-h-32 overflow-y-auto">
                        {[
                          {
                            key: "intelligentAssistant",
                            label: "Intelligent Assistant",
                          },
                          { key: "localServices", label: "Local Services" },
                          { key: "paymentTerminal", label: "Payment Terminal" },
                          { key: "gameAgent", label: "Game Agent" },
                          { key: "worldBuilder3D", label: "3D World Builder" },
                          { key: "virtualTerminal", label: "Virtual Terminal" },
                          { key: "contentCreator", label: "Content Creator" },
                          {
                            key: "realEstateBroker",
                            label: "Real Estate Broker",
                          },
                          { key: "busStopAgent", label: "Bus Stop Agent" },
                          {
                            key: "trailingPaymentTerminal",
                            label: "Trailing Payment Terminal",
                          },
                          { key: "myGhost", label: "My Ghost" },
                        ].map((filter) => (
                          <label
                            key={filter.key}
                            className="flex items-center space-x-1.5 cursor-pointer hover:bg-purple-500/10 p-1 rounded transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={agentFilters[filter.key]}
                              onChange={() => handleFilterChange(filter.key)}
                              className="w-3 h-3 text-purple-500 border-purple-400 rounded focus:ring-purple-500"
                            />
                            <span className="text-[10px] text-purple-200">
                              {filter.label}
                            </span>
                          </label>
                        ))}
                      </div>

                      {/* 🆕 Hedera AI Agents Section */}
                      <div className="pt-2 border-t border-green-500/30">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-xs text-green-300 font-semibold">
                            🌟 Hedera AI Agents
                          </span>
                        </div>

                        {/* All Hedera Agents Toggle */}
                        <label className="flex items-center space-x-2 cursor-pointer hover:bg-green-500/10 p-1.5 rounded transition-colors mb-2">
                          <input
                            type="checkbox"
                            checked={agentFilters.allHederaAgents}
                            onChange={() =>
                              handleFilterChange("allHederaAgents")
                            }
                            className="w-4 h-4 text-green-500 border-green-400 rounded focus:ring-green-500"
                          />
                          <span className="text-xs text-green-200 font-medium">
                            All Hedera Agents
                          </span>
                        </label>

                        {/* Individual Hedera Agent Types */}
                        <div className="grid grid-cols-2 gap-1">
                          {[
                            { key: "busAgent", label: "🚌 Bus", emoji: "🚌" },
                            {
                              key: "trainAgent",
                              label: "🚆 Train",
                              emoji: "🚆",
                            },
                            {
                              key: "hotelAgent",
                              label: "🏨 Hotel",
                              emoji: "🏨",
                            },
                            {
                              key: "flightAgent",
                              label: "✈️ Flight",
                              emoji: "✈️",
                            },
                            {
                              key: "restaurantAgent",
                              label: "🍽️ Restaurant",
                              emoji: "🍽️",
                            },
                            {
                              key: "travelAgent",
                              label: "🌍 Travel",
                              emoji: "🌍",
                            },
                          ].map((filter) => (
                            <label
                              key={filter.key}
                              className="flex items-center space-x-1.5 cursor-pointer hover:bg-green-500/10 p-1 rounded transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={agentFilters[filter.key]}
                                onChange={() => handleFilterChange(filter.key)}
                                className="w-3 h-3 text-green-500 border-green-400 rounded focus:ring-green-500"
                              />
                              <span className="text-[10px] text-green-200">
                                {filter.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* AR View Container */}
            <div className="relative">
              {viewMode === "2d" ? (
                /* Traditional 2D Camera View */
                <CameraView
                  ref={cameraViewRef}
                  isActive={cameraActive}
                  onToggle={setCameraActive}
                  onError={(err) => console.error("Camera error:", err)}
                  onCameraFacingChange={setCameraFacing}
                  agents={getFilteredAgents()}
                  userLocation={currentLocation}
                  onAgentInteraction={(agent, action, data) => {
                    console.log("Agent interaction:", agent.name, action, data);
                    // Handle agent interactions here
                  }}
                  showControls={true}
                  connectedWallet={walletConnection.address}
                />
              ) : (
                /* New 3D Immersive View */
                <div className="relative" style={{ minHeight: "500px" }}>
                  {/* Background Camera Feed for 3D AR - Lower priority */}
                  <div className="absolute inset-0 z-0">
                    <CameraView
                      ref={cameraViewRef}
                      isActive={cameraActive}
                      onToggle={setCameraActive}
                      onError={(err) => console.error("Camera error:", err)}
                      onCameraFacingChange={setCameraFacing}
                      agents={(() => {
                        const allFiltered = getFilteredAgents();
                        console.log(
                          "🔍 ALL agents before filter:",
                          allFiltered.map((a) => ({
                            name: a.name,
                            agent_type: a.agent_type,
                            object_type: a.object_type,
                            positioning_mode: a.positioning_mode,
                            positioning_mode_type: typeof a.positioning_mode,
                            screen_position_x: a.screen_position_x,
                            screen_position_y: a.screen_position_y,
                          })),
                        );
                        const screenAgents = allFiltered.filter(
                          (agent) => agent.positioning_mode === "screen",
                        );
                        console.log(
                          "🖥️ Screen-positioned agents for 2D overlay:",
                          {
                            total: allFiltered.length,
                            screenAgents: screenAgents.length,
                            agents: screenAgents.map((a) => ({
                              name: a.name,
                              mode: a.positioning_mode,
                              x: a.screen_position_x,
                              y: a.screen_position_y,
                            })),
                          },
                        );
                        return screenAgents;
                      })()} // Show screen-positioned agents in 2D overlay
                      userLocation={currentLocation}
                      onAgentInteraction={(agent, action, data) => {
                        console.log(
                          "Agent interaction:",
                          agent.name,
                          action,
                          data,
                        );
                        // Handle agent interactions here
                      }}
                      showControls={false} // Hide 2D controls
                      connectedWallet={walletConnection.address}
                    />
                  </div>
                  {/* 3D Scene Overlay - Higher priority */}
                  <div
                    className="absolute inset-0 z-20"
                    style={{ pointerEvents: "auto" }}
                  >
                    <AR3DScene
                      agents={getFilteredAgents()}
                      onAgentClick={(agent) => {
                        console.log("3D Agent clicked:", agent.name);
                        // Handle 3D agent interactions - same as 2D
                        // This maintains all existing interaction functionality
                      }}
                      userLocation={currentLocation}
                      cameraViewSize={{ width: 1280, height: 720 }}
                      connectedWallet={walletConnection.address}
                      paymentContext={paymentContext}
                      isPaymentMode={showOnlyTerminals}
                    />
                  </div>
                  {/* 3D Mode Controls - Highest priority */}
                  <div className="absolute top-6 sm:top-4 right-6 sm:right-4 z-[50]">
                    <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3 text-white">
                      <p className="text-sm font-medium mb-1">
                        🚀 3D AR Mode ACTIVE
                      </p>
                      <p className="text-xs text-gray-300">
                        {nearAgents.length} spinning agents loaded • Tap to
                        interact
                      </p>
                      <p className="text-xs text-green-400 mt-1">
                        ✅ Enhanced3DAgent components rendering
                      </p>
                    </div>
                  </div>{" "}
                  {/* Camera View Toggle - Switch between AR Camera and Blue Background */}
                  <div className="absolute bottom-20 sm:bottom-4 right-4 z-[50]">
                    <button
                      onClick={() => setCameraActive(!cameraActive)}
                      className={`flex items-center space-x-2 px-4 py-3 rounded-full ${
                        cameraActive
                          ? "bg-blue-500 hover:bg-blue-600 shadow-blue-500/50"
                          : "bg-gray-600 hover:bg-gray-700 shadow-gray-600/50"
                      } transition-all shadow-lg backdrop-blur-sm border-2 border-white/20`}
                      title={
                        cameraActive
                          ? "Switch to Blue Background"
                          : "Switch to Camera View"
                      }
                    >
                      {cameraActive ? (
                        <>
                          <Camera className="w-5 h-5 text-white" />
                          <span className="text-white text-sm font-medium">
                            AR View
                          </span>
                        </>
                      ) : (
                        <>
                          <Box className="w-5 h-5 text-white" />
                          <span className="text-white text-sm font-medium">
                            Non-AR
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {selectedTab === "agents" && (
          <div className="space-y-4">
            <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>NEAR Agents</span>
                </CardTitle>
                <CardDescription className="text-purple-200">
                  NeAR AI agents available for interaction
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {nearAgents.length > 0 ? (
                  nearAgents.map((obj, index) => (
                    <div
                      key={obj.id}
                      className="p-4 bg-slate-800/50 rounded-lg border border-purple-500/20"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-white">
                            {obj.name}
                          </h4>
                          <p className="text-sm text-purple-200">
                            {obj.description}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            {obj.distance_meters?.toFixed(1)}m away •{" "}
                            {getAgentTypeLabel(
                              obj.agent_type || obj.object_type,
                            )}
                          </p>
                        </div>
                        <Badge variant="secondary">Active</Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-400">No agents found nearby</p>
                    <Button
                      onClick={() => loadNearAgents(currentLocation)}
                      variant="outline"
                      className="mt-4"
                      disabled={isLoading}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {selectedTab === "map" && (
          <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>NEAR Map</span>
              </CardTitle>
              <CardDescription className="text-purple-200">
                Interactive map view of NeAR agents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-slate-800 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-16 h-16 text-purple-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Interactive Map
                  </h3>
                  <p className="text-purple-200">
                    Map view would be implemented here
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedTab === "wallet" && (
          <div className="space-y-4">
            <UnifiedWalletConnect onOpenChange={setWalletConnection} />

            {/* Wallet Status Summary */}
            {walletConnection.hasAnyConnection && (
              <Card className="bg-black/50 border-green-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-green-400" />
                    <span>Wallet Features</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 bg-green-500/20 rounded-lg">
                      <p className="text-green-300 text-sm font-medium">
                        Agent Payments
                      </p>
                      <p className="text-white text-xs">
                        Pay agents with USDFC tokens
                      </p>
                    </div>
                    <div className="p-3 bg-blue-500/20 rounded-lg">
                      <p className="text-blue-300 text-sm font-medium">
                        Premium Features
                      </p>
                      <p className="text-white text-xs">
                        Access exclusive AR content
                      </p>
                    </div>
                    <div className="p-3 bg-purple-500/20 rounded-lg">
                      <p className="text-purple-300 text-sm font-medium">
                        NFT Agents
                      </p>
                      <p className="text-white text-xs">
                        Own and trade agent NFTs
                      </p>
                    </div>
                    <div className="p-3 bg-yellow-500/20 rounded-lg">
                      <p className="text-yellow-300 text-sm font-medium">
                        DAO Voting
                      </p>
                      <p className="text-white text-xs">
                        Participate in governance
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {selectedTab === "settings" && (
          <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </CardTitle>
              <CardDescription className="text-purple-200">
                Configure your AR experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <span className="text-white">Database Connection</span>
                  <Button
                    onClick={refreshConnection}
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <span className="text-white">Camera Permission</span>
                  <Badge variant={cameraActive ? "default" : "destructive"}>
                    {cameraActive ? "Granted" : "Denied"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <span className="text-white">Location Services</span>
                  <Badge variant={currentLocation ? "default" : "destructive"}>
                    {currentLocation ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              {dbError && (
                <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <p className="text-red-200 text-sm font-medium">
                    Database Error
                  </p>
                  <p className="text-red-300 text-xs mt-1">{dbError.message}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ARViewer;
