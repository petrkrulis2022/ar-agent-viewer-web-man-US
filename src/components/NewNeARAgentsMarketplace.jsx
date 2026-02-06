import React, { useState, useEffect } from "react";
import { Search, Filter, MapPin, Zap, Clock, Star } from "lucide-react";
import AgentService from "../services/marketplace/agentService";
import NeARAgentsList from "./NeARAgentsList";
import AgentDetailModal from "./AgentDetailModal";

const NewNeARAgentsMarketplace = ({ isOpen, onClose, userLocation }) => {
  const [agents, setAgents] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [showOnlyVerified, setShowOnlyVerified] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [error, setError] = useState(null);

  // Enhanced agent type filters matching AgentSphere deployment types
  const agentFilters = [
    { id: "all", label: "All Agents", count: 0 },
    // Enhanced AgentSphere Agent Types (Phase 1)
    {
      id: "intelligent_assistant",
      label: "🤖 Intelligent Assistant",
      count: 0,
    },
    { id: "local_services", label: "🏪 Local Services", count: 0 },
    { id: "pos_terminal", label: "💳 Payment Terminal", count: 0 },
    {
      id: "trailing_payment_terminal",
      label: "📱 Trailing Payment Terminal",
      count: 0,
    },
    { id: "my_ghost", label: "👻 My Ghost", count: 0 },
    { id: "game_agent", label: "🎮 Game Agent", count: 0 },
    { id: "world_builder_3d", label: "🏗️ 3D World Builder", count: 0 },
    { id: "my_payment_terminal", label: "💰 My Payment Terminal", count: 0 },
    { id: "artm_terminal", label: "🏧 ARTM Terminal", count: 0 },
    { id: "real_estate_broker", label: "🏠 Real Estate Broker", count: 0 },
    { id: "bus_stop_agent", label: "🚌 Bus Stop Agent", count: 0 },
    // Legacy types for backward compatibility
    { id: "tutor", label: "📚 Tutor", count: 0 },
    { id: "study_buddy", label: "👥 Study Buddy", count: 0 },
    { id: "landmark", label: "📍 Landmark", count: 0 },
    { id: "building", label: "🏢 Building", count: 0 },
  ];

  // Load agents using the new AgentService with correct data
  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    console.log("🔄 NewNeARAgentsMarketplace: Loading agents...");
    setLoading(true);
    setError(null);
    try {
      // Use the new AgentService with correct data
      const agentsData = await AgentService.fetchAllAgents();
      console.log(
        "📦 NewNeARAgentsMarketplace: Received agents:",
        agentsData?.length,
      );

      if (agentsData && agentsData.length > 0) {
        console.log("✅ NewNeARAgentsMarketplace: First agent:", agentsData[0]);
      }

      setAgents(agentsData || []);
    } catch (err) {
      console.error("❌ NewNeARAgentsMarketplace: Error loading agents:", err);
      setError(err.message);
      setAgents([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Apply search and filter logic
  useEffect(() => {
    let filtered = [...agents];

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (agent) =>
          agent.name?.toLowerCase().includes(searchLower) ||
          agent.description?.toLowerCase().includes(searchLower) ||
          agent.agent_type?.toLowerCase().includes(searchLower) ||
          agent.deployment_network_name?.toLowerCase().includes(searchLower),
      );
    }

    // Apply type filter
    if (selectedFilter !== "all") {
      filtered = filtered.filter(
        (agent) => agent.agent_type === selectedFilter,
      );
    }

    // Apply verified filter
    if (showOnlyVerified) {
      filtered = filtered.filter((agent) => agent.agent_identity);
    }

    setFilteredAgents(filtered);
  }, [agents, searchTerm, selectedFilter, showOnlyVerified]);

  // Calculate filter counts
  const filtersWithCounts = agentFilters.map((filter) => ({
    ...filter,
    count:
      filter.id === "all"
        ? agents.length
        : agents.filter((agent) => agent.agent_type === filter.id).length,
  }));

  const handleAgentSelect = (agent) => {
    console.log("🎯 NewNeARAgentsMarketplace: Selected agent:", agent);
    setSelectedAgent(agent);
    setShowDetailModal(true);
  };

  const formatDistance = (distance) => {
    if (distance === null || distance === undefined) return "Unknown";
    if (distance < 1000) return `${Math.round(distance)}m`;
    return `${(distance / 1000).toFixed(1)}km`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl border border-green-500/20 w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header - EXACT copy from old marketplace */}
        <div className="flex items-center justify-between p-6 border-b border-green-500/20">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                NeAR Agents Marketplace
              </h2>
              <p className="text-green-400">
                {loading
                  ? "Loading..."
                  : error
                  ? "Error loading agents"
                  : `${filteredAgents.length} agents available`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Search and Filters - EXACT copy from old marketplace */}
        <div className="p-6 border-b border-green-500/20">
          {/* Search Bar */}
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search agents by name, type, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
              />
            </div>
            <label className="flex items-center gap-2 px-4 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
              <input
                type="checkbox"
                checked={showOnlyVerified}
                onChange={(e) => setShowOnlyVerified(e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 text-green-500 focus:ring-green-500 bg-gray-700"
              />
              <span className="text-sm text-white font-medium flex items-center gap-1">
                <span>🆔</span> Verified Only
              </span>
            </label>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {filtersWithCounts.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedFilter === filter.id
                    ? "bg-green-500 text-black"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-6 bg-red-900/20 border-b border-red-500/20">
            <div className="text-red-400 text-sm">❌ Error: {error}</div>
            <button
              onClick={loadAgents}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
            >
              🔄 Retry
            </button>
          </div>
        )}

        {/* Agents List - Uses same component but with NEW DATA */}
        <div className="flex-1 overflow-hidden">
          <NeARAgentsList
            agents={filteredAgents}
            loading={loading}
            onAgentSelect={handleAgentSelect}
            userLocation={userLocation}
            formatDistance={formatDistance}
          />
        </div>

        {/* Stats Footer - EXACT copy from old marketplace */}
        <div className="p-4 border-t border-green-500/20 bg-gray-800/50">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>Real-time locations</span>
              </span>
              <span className="flex items-center space-x-1">
                <Zap className="w-4 h-4" />
                <span>Instant connections</span>
              </span>
            </div>
            <div className="text-right">
              <span>Powered by AgentSphere Network</span>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Detail Modal */}
      {showDetailModal && selectedAgent && (
        <AgentDetailModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedAgent(null);
          }}
          agent={selectedAgent}
        />
      )}
    </div>
  );
};

export default NewNeARAgentsMarketplace;
