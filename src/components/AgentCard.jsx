import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  DollarSign,
  Zap,
  Users,
  Star,
  Navigation,
  Clock,
  Wifi,
  Eye,
  ChevronRight,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const AgentCard = ({ agent, onRetrieveCard, formatDistance }) => {
  const getAgentTypeIcon = (type) => {
    const iconMap = {
      // New AgentSphere schema types
      intelligent_assistant: Zap,
      local_services: MapPin,
      payment_terminal: DollarSign,
      trailing_payment_terminal: Navigation,
      my_ghost: Users,
      game_agent: Star,
      world_builder_3d: Users,
      home_security: Users,
      content_creator: Users,
      real_estate_broker: Users,
      bus_stop_agent: MapPin,
      // Legacy compatibility
      "Intelligent Assistant": Zap,
      "Local Services": MapPin,
      "Payment Terminal": DollarSign,
      "Trailing Payment Terminal": Navigation,
      "My Ghost": Users,
      "Game Agent": Star,
      "3D World Builder": Users,
      "Home Security": Users,
      "Content Creator": Users,
      "Real Estate Broker": Users,
      "Bus Stop Agent": MapPin,
    };
    const Icon = iconMap[type] || Users;
    return <Icon className="w-4 h-4" />;
  };

  const getAgentTypeColor = (type) => {
    const colorMap = {
      // New AgentSphere schema types
      intelligent_assistant: "bg-blue-500/20 text-blue-400 border-blue-400/30",
      local_services: "bg-green-500/20 text-green-400 border-green-400/30",
      payment_terminal: "bg-yellow-500/20 text-yellow-400 border-yellow-400/30",
      trailing_payment_terminal:
        "bg-orange-500/20 text-orange-400 border-orange-400/30",
      my_ghost: "bg-purple-500/20 text-purple-400 border-purple-400/30",
      game_agent: "bg-pink-500/20 text-pink-400 border-pink-400/30",
      world_builder_3d: "bg-cyan-500/20 text-cyan-400 border-cyan-400/30",
      home_security: "bg-red-500/20 text-red-400 border-red-400/30",
      content_creator: "bg-indigo-500/20 text-indigo-400 border-indigo-400/30",
      real_estate_broker:
        "bg-emerald-500/20 text-emerald-400 border-emerald-400/30",
      bus_stop_agent: "bg-teal-500/20 text-teal-400 border-teal-400/30",
      // Legacy compatibility
      "Intelligent Assistant":
        "bg-blue-500/20 text-blue-400 border-blue-400/30",
      "Local Services": "bg-green-500/20 text-green-400 border-green-400/30",
      "Payment Terminal":
        "bg-yellow-500/20 text-yellow-400 border-yellow-400/30",
      "Trailing Payment Terminal":
        "bg-orange-500/20 text-orange-400 border-orange-400/30",
      "My Ghost": "bg-purple-500/20 text-purple-400 border-purple-400/30",
      "Game Agent": "bg-pink-500/20 text-pink-400 border-pink-400/30",
      "3D World Builder": "bg-cyan-500/20 text-cyan-400 border-cyan-400/30",
      "Home Security": "bg-red-500/20 text-red-400 border-red-400/30",
      "Content Creator":
        "bg-indigo-500/20 text-indigo-400 border-indigo-400/30",
      "Real Estate Broker":
        "bg-emerald-500/20 text-emerald-400 border-emerald-400/30",
      "Bus Stop Agent": "bg-teal-500/20 text-teal-400 border-teal-400/30",
    };
    return (
      colorMap[type] || "bg-slate-500/20 text-slate-400 border-slate-400/30"
    );
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Unknown";
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Just deployed";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getStatusIndicator = (agent) => {
    if (!agent.is_active) {
      return {
        icon: AlertCircle,
        text: "Inactive",
        className: "text-red-400",
      };
    }
    return {
      icon: CheckCircle,
      text: "Active",
      className: "text-green-400",
    };
  };

  const status = getStatusIndicator(agent);
  const StatusIcon = status.icon;

  return (
    <div className="bg-slate-800/30 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-green-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10 group">
      {/* Agent Image/Avatar */}
      <div className="relative h-48 bg-gradient-to-br from-slate-700 to-slate-800">
        {agent.agent_image_url ? (
          <img
            src={agent.agent_image_url}
            alt={agent.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-16 h-16 bg-slate-600/50 rounded-full flex items-center justify-center">
              {getAgentTypeIcon(agent.agent_type)}
            </div>
          </div>
        )}

        {/* Status Overlay */}
        <div className="absolute top-3 right-3 flex items-center space-x-2">
          <Badge
            className={getAgentTypeColor(agent.agent_type)}
            variant="outline"
          >
            {getAgentTypeIcon(agent.agent_type)}
            <span className="ml-1 text-xs">{agent.agent_type}</span>
          </Badge>
        </div>

        {/* Distance Badge */}
        <div className="absolute bottom-3 left-3">
          <Badge className="bg-black/50 text-white border-white/20">
            <MapPin className="w-3 h-3 mr-1" />
            {formatDistance(agent.distance_meters)}
          </Badge>
        </div>
      </div>

      {/* Agent Details */}
      <div className="p-5">
        {/* Header */}
        <div className="mb-3">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-white group-hover:text-green-400 transition-colors">
              {agent.name || "Unnamed Agent"}
            </h3>
            <div className="flex items-center space-x-1">
              <StatusIcon className={`w-4 h-4 ${status.className}`} />
            </div>
          </div>

          <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
            {agent.description || "No description available"}
          </p>
        </div>

        {/* Key Info */}
        <div className="space-y-2 mb-4">
          {/* Payment Info with Enhanced Stablecoin Support */}
          {agent.payment_enabled && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-yellow-400" />
                <span className="text-slate-300">Interaction Fee</span>
              </div>
              <div className="text-yellow-400 font-medium">
                {agent.interaction_fee || agent.payment_amount}{" "}
                {agent.token_symbol || "USDT"}
              </div>
            </div>
          )}

          {/* Wallet Address (Real Address from AgentSphere) */}
          {(agent.deployer_wallet_address ||
            agent.payment_recipient_address ||
            agent.agent_wallet_address) && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <Wifi className="w-4 h-4 text-cyan-400" />
                <span className="text-slate-300">Wallet</span>
              </div>
              <div className="text-cyan-400 font-mono text-xs">
                {(
                  agent.deployer_wallet_address ||
                  agent.payment_recipient_address ||
                  agent.agent_wallet_address
                )?.slice(0, 8)}
                ...
              </div>
            </div>
          )}

          {/* MCP Services */}
          {agent.mcp_services && agent.mcp_services.length > 0 && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-purple-400" />
                <span className="text-slate-300">MCP Services</span>
              </div>
              <div className="text-purple-400">
                {agent.mcp_services.length} services
              </div>
            </div>
          )}

          {/* Range */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4 text-blue-400" />
              <span className="text-slate-300">Range</span>
            </div>
            <div className="text-blue-400">
              {formatDistance(agent.range_meters)}
            </div>
          </div>

          {/* Capabilities */}
          {agent.agent_capabilities && agent.agent_capabilities.length > 0 && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-purple-400" />
                <span className="text-slate-300">Capabilities</span>
              </div>
              <div className="text-purple-400">
                {agent.agent_capabilities.length} features
              </div>
            </div>
          )}

          {/* Deployment Time */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <span className="text-slate-300">Deployed</span>
            </div>
            <div className="text-slate-400">
              {formatTimestamp(agent.created_at)}
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        {(agent.interaction_count > 0 || agent.revenue_generated > 0) && (
          <div className="bg-slate-700/30 rounded-lg p-3 mb-4">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="text-center">
                <div className="text-green-400 font-semibold">
                  {agent.interaction_count || 0}
                </div>
                <div className="text-slate-400">Interactions</div>
              </div>
              <div className="text-center">
                <div className="text-yellow-400 font-semibold">
                  ${(agent.revenue_generated || 0).toLocaleString()}
                </div>
                <div className="text-slate-400">Revenue</div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Feature Tags with Interaction Methods */}
        <div className="flex flex-wrap gap-1 mb-4">
          {agent.trailing_agent && (
            <Badge
              variant="outline"
              className="text-xs border-orange-400/30 text-orange-400"
            >
              Trailing
            </Badge>
          )}
          {agent.ar_notifications && (
            <Badge
              variant="outline"
              className="text-xs border-blue-400/30 text-blue-400"
            >
              AR Alerts
            </Badge>
          )}
          {agent.text_chat && (
            <Badge
              variant="outline"
              className="text-xs border-green-400/30 text-green-400"
            >
              Text Chat
            </Badge>
          )}
          {agent.voice_chat && (
            <Badge
              variant="outline"
              className="text-xs border-purple-400/30 text-purple-400"
            >
              Voice Chat
            </Badge>
          )}
          {agent.video_chat && (
            <Badge
              variant="outline"
              className="text-xs border-cyan-400/30 text-cyan-400"
            >
              Video Chat
            </Badge>
          )}
          {agent.token_symbol && agent.token_symbol !== "USDT" && (
            <Badge
              variant="outline"
              className="text-xs border-yellow-400/30 text-yellow-400"
            >
              {agent.token_symbol}
            </Badge>
          )}
        </div>

        {/* Retrieve Card Button */}
        <Button
          onClick={onRetrieveCard}
          className="w-full bg-green-500 hover:bg-green-600 text-black font-medium py-2.5 rounded-lg transition-all duration-200 hover:scale-105 group-hover:shadow-lg group-hover:shadow-green-500/25"
        >
          <Eye className="w-4 h-4 mr-2" />
          Retrieve the Card
          <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
};

export default AgentCard;
