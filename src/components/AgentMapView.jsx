import React, { useState, useEffect, useRef, useCallback } from "react";
import Map, {
  Marker,
  Popup,
  NavigationControl,
  GeolocateControl,
} from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Home,
  User,
  Loader2,
  Navigation,
  Filter,
  Search,
  X,
} from "lucide-react";
import { useDatabase } from "../hooks/useDatabase";
import { useNavigate } from "react-router-dom";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

// Agent type to color mapping
const AGENT_TYPE_COLORS = {
  payment_terminal: "#10b981", // green
  home_security: "#a855f7", // purple (ATMs)
  content_creator: "#f97316", // orange
  default: "#6b7280", // gray
};

// Agent type to icon mapping
const getAgentIcon = (agentType) => {
  switch (agentType) {
    case "payment_terminal":
      return DollarSign;
    case "home_security":
      return Home;
    default:
      return User;
  }
};

const AgentMapView = () => {
  const navigate = useNavigate();
  const { getNearAgents, getCurrentLocation } = useDatabase();

  const [userLocation, setUserLocation] = useState(null);
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchRadius, setSearchRadius] = useState(10000); // 10km default
  const [selectedNetwork, setSelectedNetwork] = useState("all");
  const [selectedAgentType, setSelectedAgentType] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const mapRef = useRef(null);

  // Initial data load
  useEffect(() => {
    const loadMapData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("📍 Getting user location...");
        const location = await getCurrentLocation();
        setUserLocation(location);

        console.log("🔍 Fetching nearby agents...");
        const agentsData = await getNearAgents({
          ...location,
          radius_meters: searchRadius,
        });

        setAgents(agentsData || []);
        console.log(`✅ Loaded ${agentsData?.length || 0} agents`);
      } catch (err) {
        console.error("❌ Error loading map data:", err);
        setError(err.message || "Failed to load map data");

        // Set fallback location if error
        setUserLocation({
          latitude: 50.64,
          longitude: 13.83,
          accuracy: 1000,
        });
      } finally {
        setLoading(false);
      }
    };

    loadMapData();
  }, [getCurrentLocation, getNearAgents, searchRadius]);

  // Read filter from URL parameter on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const filterParam = urlParams.get("filter");

    if (filterParam) {
      console.log("🔍 Setting agent type filter from URL:", filterParam);
      setSelectedAgentType(filterParam);
      setShowFilters(true); // Show filters panel so user can see it's filtered
    }
  }, []);

  // Filter agents based on selected filters
  const filteredAgents = agents.filter((agent) => {
    // Network filter
    if (selectedNetwork !== "all") {
      if (
        agent.deployment_network_name?.toLowerCase() !==
        selectedNetwork.toLowerCase()
      ) {
        return false;
      }
    }

    // Agent type filter
    if (selectedAgentType !== "all") {
      if (agent.agent_type !== selectedAgentType) {
        return false;
      }
    }

    return true;
  });

  // Handle map style
  const mapStyle = "mapbox://styles/mapbox/dark-v11";

  // Fly to user location
  const flyToUserLocation = useCallback(() => {
    if (mapRef.current && userLocation) {
      mapRef.current.flyTo({
        center: [userLocation.longitude, userLocation.latitude],
        zoom: 14,
        duration: 1000,
      });
    }
  }, [userLocation]);

  // Get unique networks from agents
  const availableNetworks = [
    "all",
    ...new Set(agents.map((a) => a.deployment_network_name).filter(Boolean)),
  ];

  // Get unique agent types
  const availableAgentTypes = [
    "all",
    ...new Set(agents.map((a) => a.agent_type).filter(Boolean)),
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-green-400 animate-spin mx-auto" />
          <p className="text-white text-lg">Loading Agent Map...</p>
          <p className="text-slate-400 text-sm">
            Getting your location and nearby agents
          </p>
        </div>
      </div>
    );
  }

  if (error && !userLocation) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 rounded-2xl p-8 text-center space-y-4 border border-red-500/30">
          <div className="text-red-400 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white">Unable to Load Map</h2>
          <p className="text-slate-300">{error}</p>
          <Button
            onClick={() => navigate(-1)}
            className="w-full bg-green-500 hover:bg-green-600"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-950">
      {/* Custom Popup Styles */}
      <style>{`
        .mapboxgl-popup-content {
          background: transparent !important;
          padding: 0 !important;
          box-shadow: none !important;
        }
        .mapboxgl-popup-tip {
          border-top-color: #0f172a !important;
        }
      `}</style>

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-slate-950 to-transparent p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-slate-800/50 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className="bg-slate-900/90 text-green-400 border-green-500/30"
            >
              <MapPin className="w-3 h-3 mr-1" />
              {filteredAgents.length} Agents
            </Badge>

            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="ghost"
              size="sm"
              className={`text-white hover:bg-slate-800/50 gap-2 ${
                showFilters ? "bg-slate-800/50" : ""
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 bg-slate-900/95 backdrop-blur-sm rounded-xl p-4 max-w-7xl mx-auto border border-slate-700/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Network Filter */}
              <div className="space-y-2">
                <label className="text-sm text-slate-300 font-medium">
                  Network
                </label>
                <select
                  value={selectedNetwork}
                  onChange={(e) => setSelectedNetwork(e.target.value)}
                  className="w-full bg-slate-800 text-white rounded-lg px-3 py-2 border border-slate-700 focus:border-green-500 focus:outline-none"
                >
                  {availableNetworks.map((network) => (
                    <option key={network} value={network}>
                      {network === "all" ? "All Networks" : network}
                    </option>
                  ))}
                </select>
              </div>

              {/* Agent Type Filter */}
              <div className="space-y-2">
                <label className="text-sm text-slate-300 font-medium">
                  Agent Type
                </label>
                <select
                  value={selectedAgentType}
                  onChange={(e) => setSelectedAgentType(e.target.value)}
                  className="w-full bg-slate-800 text-white rounded-lg px-3 py-2 border border-slate-700 focus:border-green-500 focus:outline-none"
                >
                  {availableAgentTypes.map((type) => (
                    <option key={type} value={type}>
                      {type === "all"
                        ? "All Types"
                        : type
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (c) => c.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Radius */}
              <div className="space-y-2">
                <label className="text-sm text-slate-300 font-medium">
                  Search Radius: {(searchRadius / 1000).toFixed(0)}km
                </label>
                <input
                  type="range"
                  min="1000"
                  max="100000"
                  step="1000"
                  value={searchRadius}
                  onChange={(e) => setSearchRadius(parseInt(e.target.value))}
                  className="w-full accent-green-500"
                />
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Map */}
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          longitude: userLocation?.longitude || 13.83,
          latitude: userLocation?.latitude || 50.64,
          zoom: 13,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle={mapStyle}
      >
        {/* Navigation Controls */}
        <NavigationControl position="top-right" />

        {/* Geolocate Control */}
        <GeolocateControl
          position="top-right"
          trackUserLocation
          showUserHeading
          onClick={flyToUserLocation}
        />

        {/* User Location Marker */}
        {userLocation && (
          <Marker
            longitude={userLocation.longitude}
            latitude={userLocation.latitude}
            anchor="center"
          >
            <div className="relative">
              <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse" />
              <div className="absolute inset-0 w-4 h-4 bg-blue-400 rounded-full opacity-30 animate-ping" />
            </div>
          </Marker>
        )}

        {/* Agent Markers */}
        {filteredAgents.map((agent) => {
          const AgentIcon = getAgentIcon(agent.agent_type);
          const color =
            AGENT_TYPE_COLORS[agent.agent_type] || AGENT_TYPE_COLORS.default;

          return (
            <Marker
              key={agent.id}
              longitude={agent.longitude}
              latitude={agent.latitude}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setSelectedAgent(agent);
              }}
            >
              <div
                className="relative cursor-pointer hover:scale-110 transition-transform"
                style={{
                  filter: `drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))`,
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-white shadow-lg"
                  style={{ backgroundColor: color }}
                >
                  <AgentIcon className="w-5 h-5 text-white" />
                </div>
                <div
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-3"
                  style={{ backgroundColor: color }}
                />
              </div>
            </Marker>
          );
        })}

        {/* Agent Popup */}
        {selectedAgent && (
          <Popup
            longitude={selectedAgent.longitude}
            latitude={selectedAgent.latitude}
            anchor="bottom"
            offset={[0, -40]}
            onClose={() => setSelectedAgent(null)}
            closeButton={false}
            closeOnClick={false}
            className="agent-popup"
          >
            <div className="p-3 min-w-[250px] bg-slate-900 rounded-lg relative">
              {/* Custom Close Button */}
              <button
                onClick={() => setSelectedAgent(null)}
                className="absolute top-2 right-2 text-slate-400 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 rounded-full p-1"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="font-bold text-white text-lg mb-2 pr-6">
                {selectedAgent.name}
              </h3>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Type:</span>
                  <Badge
                    variant="outline"
                    className="text-xs"
                    style={{
                      borderColor:
                        AGENT_TYPE_COLORS[selectedAgent.agent_type] ||
                        AGENT_TYPE_COLORS.default,
                      color:
                        AGENT_TYPE_COLORS[selectedAgent.agent_type] ||
                        AGENT_TYPE_COLORS.default,
                    }}
                  >
                    {selectedAgent.agent_type?.replace(/_/g, " ")}
                  </Badge>
                </div>

                {selectedAgent.distance_meters !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Distance:</span>
                    <span className="text-white font-medium">
                      {selectedAgent.distance_meters < 1000
                        ? `${selectedAgent.distance_meters.toFixed(0)}m`
                        : `${(selectedAgent.distance_meters / 1000).toFixed(
                            2,
                          )}km`}
                    </span>
                  </div>
                )}

                {selectedAgent.deployment_network_name && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Network:</span>
                    <span className="text-white font-medium">
                      {selectedAgent.deployment_network_name}
                    </span>
                  </div>
                )}

                {selectedAgent.interaction_fee_amount && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Fee:</span>
                    <span className="text-green-400 font-medium">
                      {selectedAgent.interaction_fee_amount}{" "}
                      {selectedAgent.currency_type || "USDC"}
                    </span>
                  </div>
                )}

                {selectedAgent.description && (
                  <div className="pt-2 border-t border-slate-700">
                    <p className="text-slate-300 text-xs line-clamp-2">
                      {selectedAgent.description}
                    </p>
                  </div>
                )}
              </div>

              <Button
                onClick={() => {
                  // Navigate to AR view with this specific agent
                  navigate(`/ar-view?agentId=${selectedAgent.id}`);
                }}
                className="w-full mt-3 bg-green-500 hover:bg-green-600 text-white"
                size="sm"
              >
                View in AR
              </Button>
            </div>
          </Popup>
        )}
      </Map>

      {/* Floating Re-center Button */}
      <button
        onClick={flyToUserLocation}
        className="absolute bottom-6 right-6 z-10 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-xl hover:scale-110 transition-all"
        title="Center on my location"
      >
        <Navigation className="w-6 h-6" />
      </button>

      {/* Agent Count Badge (Bottom Left) */}
      <div className="absolute bottom-6 left-6 z-10 bg-slate-900/95 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 shadow-xl">
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-green-400" />
          <div>
            <p className="text-white font-bold text-lg">
              {filteredAgents.length}
            </p>
            <p className="text-slate-400 text-xs">Agents Nearby</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentMapView;
