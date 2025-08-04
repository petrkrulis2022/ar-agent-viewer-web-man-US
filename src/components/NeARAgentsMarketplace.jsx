import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Search,
  Filter,
  MapPin,
  Users,
  Zap,
  DollarSign,
  Clock,
  Star,
  Wifi,
  WifiOff,
  ChevronRight,
  Eye,
  Navigation,
} from "lucide-react";
import { useDatabase } from "../hooks/useDatabase";
import AgentCard from "./AgentCard";
import AgentDetailModal from "./AgentDetailModal";
import DatabaseDebugger from "./DatabaseDebugger";

const NeARAgentsMarketplace = ({ onGoBack, userLocation }) => {
  const { getNearAgents, isLoading } = useDatabase();
  const [agents, setAgents] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAgentType, setSelectedAgentType] = useState("all");
  const [selectedLocationFilter, setSelectedLocationFilter] = useState("all");
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [sortBy, setSortBy] = useState("distance");

  // Enhanced agent type categories matching what's actually in the database
  const agentTypes = [
    { value: "all", label: "All Types", icon: Users },
    // Database actual types (what we see in the debugger)
    { value: "ai_agent", label: "AI Agent", icon: Zap },
    { value: "sphere", label: "Sphere", icon: Users },
    { value: "cube", label: "Cube", icon: Users },
    { value: "agent", label: "Agent", icon: Users },
    // AgentSphere types (underscore format)
    { value: "intelligent_assistant", label: "AI Assistant", icon: Zap },
    { value: "local_services", label: "Local Services", icon: MapPin },
    { value: "payment_terminal", label: "Payment Terminal", icon: DollarSign },
    {
      value: "trailing_payment_terminal",
      label: "Trailing Payment",
      icon: Navigation,
    },
    { value: "my_ghost", label: "My Ghost", icon: Users },
    { value: "game_agent", label: "Game Agent", icon: Star },
    { value: "world_builder_3d", label: "3D World Builder", icon: Users },
    { value: "home_security", label: "Home Security", icon: Users },
    { value: "content_creator", label: "Content Creator", icon: Users },
    { value: "real_estate_broker", label: "Real Estate Broker", icon: Users },
    { value: "bus_stop_agent", label: "Bus Stop Agent", icon: MapPin },
  ];

  const locationFilters = [
    { value: "all", label: "All Locations" },
    { value: "nearby", label: "Nearby (< 100m)" },
    { value: "walking", label: "Walking Distance (< 500m)" },
    { value: "local", label: "Local Area (< 1km)" },
  ];

  const sortOptions = [
    { value: "distance", label: "Distance" },
    { value: "created_at", label: "Recently Added" },
    { value: "name", label: "Name A-Z" },
    { value: "agent_type", label: "Type" },
  ];

  // Load agents from database
  useEffect(() => {
    const loadAgents = async () => {
      try {
        const location = userLocation || {
          latitude: 37.7749,
          longitude: -122.4194,
          radius_meters: 5000, // Larger radius for marketplace
        };

        const agentData = await getNearAgents(location);

        // Enhanced agents with AgentSphere integration data
        const enhancedAgents = agentData.map((agent) => ({
          ...agent,
          // Use real wallet addresses from AgentSphere (not mock addresses)
          wallet_address:
            agent.deployer_wallet_address ||
            agent.agent_wallet_address ||
            agent.payment_recipient_address ||
            "0x" + Math.random().toString(16).substr(2, 40), // Fallback mock

          // Enhanced stablecoin and multi-blockchain support
          token_symbol: agent.token_symbol || "USDT",
          token_address:
            agent.token_address || "0x9E12AD42c4E4d2acFBADE01a96446e48e6764B98",
          chain_id: agent.chain_id || 2810, // Morph Holesky Testnet
          currency_type: agent.currency_type || agent.token_symbol || "USDT",

          // Enhanced payment and interaction data
          payment_amount: agent.interaction_fee || agent.payment_amount || 1,
          interaction_fee: agent.interaction_fee || agent.payment_amount || 1,
          payment_enabled: agent.payment_enabled !== false,

          // Enhanced interaction methods
          text_chat: agent.text_chat !== false,
          voice_chat: agent.voice_chat || false,
          video_chat: agent.video_chat || false,
          interaction_types:
            agent.interaction_types || (agent.text_chat ? ["text_chat"] : []),

          // MCP Services integration
          mcp_services: agent.mcp_services || [],
          agent_capabilities: agent.agent_capabilities || ["basic_interaction"],
          features: agent.features || [],

          // Enhanced location and range data
          range_meters: agent.range_meters || agent.visibility_radius || 50,
          interaction_range_meters: agent.interaction_range_meters || 10,
          altitude: agent.altitude, // RTK enhanced altitude
          location_type: agent.location_type || "outdoor",

          // Preserve original agent type from database (don't normalize it)
          agent_type: agent.agent_type || agent.object_type || "ai_agent",

          // Enhanced economics and revenue
          revenue_sharing_percentage: agent.revenue_sharing_percentage || 70,
          trailing_agent: agent.trailing_agent || false,
          ar_notifications: agent.ar_notifications !== false,

          // Mock data for display (replace with real analytics when available)
          interaction_count: Math.floor(Math.random() * 1000),
          revenue_generated: Math.floor(Math.random() * 10000),
        }));

        setAgents(enhancedAgents);
        console.log(
          `✅ Loaded ${enhancedAgents.length} agents for marketplace`
        );
      } catch (error) {
        console.error("Error loading agents:", error);
      }
    };

    loadAgents();
  }, [getNearAgents, userLocation]);

  // Filter and sort agents
  const processedAgents = useMemo(() => {
    let filtered = agents;

    // Filter by search term
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (agent) =>
          agent.name?.toLowerCase().includes(search) ||
          agent.description?.toLowerCase().includes(search) ||
          agent.agent_type?.toLowerCase().includes(search)
      );
    }

    // Filter by agent type - more flexible matching
    if (selectedAgentType !== "all") {
      filtered = filtered.filter((agent) => {
        const agentType = agent.agent_type || agent.object_type || "";
        // Exact match
        if (agentType === selectedAgentType) return true;
        // Fallback: check if it contains the filter term (case insensitive)
        return agentType
          .toLowerCase()
          .includes(selectedAgentType.toLowerCase());
      });
    }

    // Filter by location/distance
    if (selectedLocationFilter !== "all") {
      const distanceThresholds = {
        nearby: 100,
        walking: 500,
        local: 1000,
      };
      const maxDistance = distanceThresholds[selectedLocationFilter];
      filtered = filtered.filter(
        (agent) => (agent.distance_meters || 0) <= maxDistance
      );
    }

    // Sort agents
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "distance":
          return (a.distance_meters || 0) - (b.distance_meters || 0);
        case "created_at":
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        case "name":
          return (a.name || "").localeCompare(b.name || "");
        case "agent_type":
          return (a.agent_type || "").localeCompare(b.agent_type || "");
        default:
          return 0;
      }
    });

    return filtered;
  }, [agents, searchTerm, selectedAgentType, selectedLocationFilter, sortBy]);

  const handleRetrieveCard = (agent) => {
    setSelectedAgent(agent);
  };

  const handleCloseModal = () => {
    setSelectedAgent(null);
  };

  const formatDistance = (distanceMeters) => {
    if (!distanceMeters) return "Unknown";
    if (distanceMeters < 1000) {
      return `${Math.round(distanceMeters)}m`;
    }
    return `${(distanceMeters / 1000).toFixed(1)}km`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Database Debugger - Temporary */}
      <DatabaseDebugger />

      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={onGoBack}
                variant="outline"
                size="sm"
                className="border-white/20 hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              <div>
                <h1 className="text-2xl font-bold text-green-400">
                  NeAR Agents Marketplace
                </h1>
                <p className="text-sm text-slate-400">
                  {isLoading
                    ? "Loading..."
                    : `${processedAgents.length} agents available`}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-400/30">
                EXPERIMENTAL
              </Badge>
              <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
                <Wifi className="w-3 h-3 mr-1" />
                {agents.length} Connected
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search agents by name, type, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-800/50 border-white/20 text-white placeholder-slate-400 focus:border-green-400"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-4">
          {/* Agent Type Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedAgentType}
              onChange={(e) => setSelectedAgentType(e.target.value)}
              className="bg-slate-800/50 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:border-green-400 focus:outline-none"
            >
              {agentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-slate-400" />
            <select
              value={selectedLocationFilter}
              onChange={(e) => setSelectedLocationFilter(e.target.value)}
              className="bg-slate-800/50 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:border-green-400 focus:outline-none"
            >
              {locationFilters.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Options */}
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-800/50 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:border-green-400 focus:outline-none"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  Sort by {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-slate-800/30 rounded-xl p-6 animate-pulse"
              >
                <div className="h-48 bg-slate-700 rounded-lg mb-4"></div>
                <div className="h-4 bg-slate-700 rounded mb-2"></div>
                <div className="h-3 bg-slate-700 rounded mb-4"></div>
                <div className="h-8 bg-slate-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : processedAgents.length === 0 ? (
          <div className="text-center py-12">
            <WifiOff className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-300 mb-2">
              No Agents Found
            </h3>
            <p className="text-slate-400">
              {searchTerm ||
              selectedAgentType !== "all" ||
              selectedLocationFilter !== "all"
                ? "Try adjusting your filters or search terms"
                : "No agents are currently deployed in this area"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {processedAgents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onRetrieveCard={() => handleRetrieveCard(agent)}
                formatDistance={formatDistance}
              />
            ))}
          </div>
        )}
      </div>

      {/* Agent Detail Modal */}
      {selectedAgent && (
        <AgentDetailModal
          agent={selectedAgent}
          onClose={handleCloseModal}
          formatDistance={formatDistance}
        />
      )}
    </div>
  );
};

export default NeARAgentsMarketplace;
