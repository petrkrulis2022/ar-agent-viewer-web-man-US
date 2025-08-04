import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  X,
  MapPin,
  DollarSign,
  Zap,
  Users,
  Star,
  Navigation,
  Clock,
  Wifi,
  Eye,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Copy,
  Globe,
  Settings,
  Activity,
  Shield,
  MessageSquare,
  Video,
  Mic,
  Smartphone,
  TrendingUp,
  Calendar,
  Hash,
  Layers,
} from "lucide-react";

const AgentDetailModal = ({ agent, onClose, formatDistance }) => {
  const getAgentTypeIcon = (type) => {
    const iconMap = {
      // New AgentSphere schema types
      intelligent_assistant: Zap,
      local_services: MapPin,
      payment_terminal: DollarSign,
      trailing_payment_terminal: Navigation,
      my_ghost: Users,
      game_agent: Star,
      world_builder_3d: Layers,
      home_security: Shield,
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
      "3D World Builder": Layers,
      "Home Security": Shield,
      "Content Creator": Users,
      "Real Estate Broker": Users,
      "Bus Stop Agent": MapPin,
    };
    const Icon = iconMap[type] || Users;
    return <Icon className="w-5 h-5" />;
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
    return new Date(timestamp).toLocaleString();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };

  const getInteractionIcon = (type) => {
    const iconMap = {
      text_chat: MessageSquare,
      voice_interface: Mic,
      video_interface: Video,
      defi_features: DollarSign,
    };
    const Icon = iconMap[type] || MessageSquare;
    return <Icon className="w-4 h-4" />;
  };

  const getStatusIndicator = (agent) => {
    if (!agent.is_active) {
      return {
        icon: AlertCircle,
        text: "Inactive",
        className: "text-red-400",
        bgClassName: "bg-red-500/20",
      };
    }
    return {
      icon: CheckCircle,
      text: "Active & Available",
      className: "text-green-400",
      bgClassName: "bg-green-500/20",
    };
  };

  const status = getStatusIndicator(agent);
  const StatusIcon = status.icon;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center">
              {getAgentTypeIcon(agent.agent_type)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {agent.name || "Unnamed Agent"}
              </h2>
              <div className="flex items-center space-x-2 mt-1">
                <Badge className={getAgentTypeColor(agent.agent_type)}>
                  {agent.agent_type}
                </Badge>
                <Badge
                  className={`${status.bgClassName} ${status.className} border-0`}
                >
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {status.text}
                </Badge>
              </div>
            </div>
          </div>

          <Button
            onClick={onClose}
            variant="outline"
            size="sm"
            className="border-white/20 hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Agent Overview */}
              <div className="bg-slate-800/30 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-green-400 mb-3 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Agent Overview
                </h3>

                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-1">
                      Description
                    </h4>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {agent.description || "No description available"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-slate-300 mb-1">
                        Distance
                      </h4>
                      <p className="text-white font-medium">
                        {formatDistance(agent.distance_meters)}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-300 mb-1">
                        Range
                      </h4>
                      <p className="text-white font-medium">
                        {formatDistance(agent.range_meters)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Details */}
              <div className="bg-slate-800/30 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-green-400 mb-3 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Location Details
                </h3>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-slate-300 mb-1">
                        Latitude
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-mono text-sm">
                          {agent.latitude?.toFixed(6) || "Unknown"}
                        </span>
                        {agent.latitude && (
                          <button
                            onClick={() =>
                              copyToClipboard(agent.latitude.toString())
                            }
                            className="text-slate-400 hover:text-white"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-300 mb-1">
                        Longitude
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-mono text-sm">
                          {agent.longitude?.toFixed(6) || "Unknown"}
                        </span>
                        {agent.longitude && (
                          <button
                            onClick={() =>
                              copyToClipboard(agent.longitude.toString())
                            }
                            className="text-slate-400 hover:text-white"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-slate-300 mb-1">
                        Altitude
                      </h4>
                      <p className="text-white font-mono text-sm">
                        {agent.altitude ? `${agent.altitude}m` : "Ground level"}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-300 mb-1">
                        Location Type
                      </h4>
                      <p className="text-white capitalize">
                        {agent.location_type || "outdoor"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-1">
                      Interaction Range
                    </h4>
                    <p className="text-white">
                      {formatDistance(agent.interaction_range_meters)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Capabilities */}
              <div className="bg-slate-800/30 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-green-400 mb-3 flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  Capabilities
                </h3>

                <div className="space-y-4">
                  {/* Enhanced Interaction Methods */}
                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-2">
                      Interaction Methods
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <MessageSquare className="w-4 h-4 text-green-400" />
                          <span className="text-slate-300">Text Chat</span>
                        </div>
                        <Badge
                          className={
                            agent.text_chat
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }
                        >
                          {agent.text_chat ? "Available" : "Unavailable"}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Mic className="w-4 h-4 text-purple-400" />
                          <span className="text-slate-300">Voice Chat</span>
                        </div>
                        <Badge
                          className={
                            agent.voice_chat
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }
                        >
                          {agent.voice_chat ? "Available" : "Unavailable"}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Video className="w-4 h-4 text-cyan-400" />
                          <span className="text-slate-300">Video Chat</span>
                        </div>
                        <Badge
                          className={
                            agent.video_chat
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }
                        >
                          {agent.video_chat ? "Available" : "Unavailable"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* MCP Services */}
                  {agent.mcp_services && agent.mcp_services.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-300 mb-2">
                        MCP Services
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {agent.mcp_services.map((service, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="border-cyan-400/30 text-cyan-400"
                          >
                            <Globe className="w-3 h-3 mr-1" />
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Enhanced Features */}
                  {agent.features && agent.features.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-300 mb-2">
                        Additional Features
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {agent.features.map((feature, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="border-blue-400/30 text-blue-400"
                          >
                            <Zap className="w-3 h-3 mr-1" />
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Blockchain Info */}
              <div className="bg-slate-800/30 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-green-400 mb-3 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Blockchain & Payment
                </h3>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-slate-300 mb-1">
                        Network
                      </h4>
                      <p className="text-white">
                        {agent.network || "Morph Holesky"}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-300 mb-1">
                        Chain ID
                      </h4>
                      <p className="text-white font-mono">
                        {agent.chain_id || "2810"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-2">
                      Wallet Addresses
                    </h4>
                    <div className="space-y-2">
                      {agent.deployer_wallet_address && (
                        <div>
                          <p className="text-xs text-slate-400 mb-1">
                            Deployer Wallet
                          </p>
                          <div className="flex items-center space-x-2">
                            <span className="text-white font-mono text-sm bg-slate-700/50 px-2 py-1 rounded">
                              {`${agent.deployer_wallet_address.slice(
                                0,
                                8
                              )}...${agent.deployer_wallet_address.slice(-6)}`}
                            </span>
                            <button
                              onClick={() =>
                                copyToClipboard(agent.deployer_wallet_address)
                              }
                              className="text-slate-400 hover:text-white"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}

                      {agent.payment_recipient_address && (
                        <div>
                          <p className="text-xs text-slate-400 mb-1">
                            Payment Recipient
                          </p>
                          <div className="flex items-center space-x-2">
                            <span className="text-white font-mono text-sm bg-slate-700/50 px-2 py-1 rounded">
                              {`${agent.payment_recipient_address.slice(
                                0,
                                8
                              )}...${agent.payment_recipient_address.slice(
                                -6
                              )}`}
                            </span>
                            <button
                              onClick={() =>
                                copyToClipboard(agent.payment_recipient_address)
                              }
                              className="text-slate-400 hover:text-white"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}

                      {agent.agent_wallet_address && (
                        <div>
                          <p className="text-xs text-slate-400 mb-1">
                            Agent Wallet
                          </p>
                          <div className="flex items-center space-x-2">
                            <span className="text-white font-mono text-sm bg-slate-700/50 px-2 py-1 rounded">
                              {`${agent.agent_wallet_address.slice(
                                0,
                                8
                              )}...${agent.agent_wallet_address.slice(-6)}`}
                            </span>
                            <button
                              onClick={() =>
                                copyToClipboard(agent.agent_wallet_address)
                              }
                              className="text-slate-400 hover:text-white"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}

                      {!agent.deployer_wallet_address &&
                        !agent.payment_recipient_address &&
                        !agent.agent_wallet_address && (
                          <span className="text-slate-400 text-sm">
                            No wallet addresses available
                          </span>
                        )}
                    </div>
                  </div>

                  {agent.payment_enabled && (
                    <>
                      <div>
                        <h4 className="text-sm font-medium text-slate-300 mb-1">
                          Interaction Fee
                        </h4>
                        <p className="text-yellow-400 font-semibold">
                          {agent.interaction_fee || agent.payment_amount || 1}{" "}
                          {agent.token_symbol || "USDT"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-slate-300 mb-1">
                          Token Contract
                        </h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-mono text-sm bg-slate-700/50 px-2 py-1 rounded">
                            {agent.token_address
                              ? `${agent.token_address.slice(
                                  0,
                                  8
                                )}...${agent.token_address.slice(-6)}`
                              : "0x9E12...4B98"}
                          </span>
                          <button
                            onClick={() =>
                              copyToClipboard(
                                agent.token_address ||
                                  "0x9E12AD42c4E4d2acFBADE01a96446e48e6764B98"
                              )
                            }
                            className="text-slate-400 hover:text-white"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="bg-slate-800/30 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-green-400 mb-3 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Performance
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                    <div className="text-2xl font-bold text-green-400">
                      {agent.interaction_count || 0}
                    </div>
                    <div className="text-sm text-slate-400">
                      Total Interactions
                    </div>
                  </div>
                  <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-400">
                      ${(agent.revenue_generated || 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-400">
                      Revenue Generated
                    </div>
                  </div>
                </div>

                {agent.revenue_sharing_percentage && (
                  <div className="mt-3 p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">
                        Revenue Sharing
                      </span>
                      <span className="text-white font-medium">
                        {agent.revenue_sharing_percentage}% to deployer
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Technical Details */}
              <div className="bg-slate-800/30 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-green-400 mb-3 flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Technical Details
                </h3>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-slate-300 mb-1">
                        Agent ID
                      </h4>
                      <p className="text-white font-mono text-xs bg-slate-700/50 px-2 py-1 rounded">
                        {agent.id}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-300 mb-1">
                        Trailing Agent
                      </h4>
                      <p className="text-white">
                        {agent.trailing_agent ? "Yes" : "No"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-slate-300 mb-1">
                        AR Notifications
                      </h4>
                      <p className="text-white">
                        {agent.ar_notifications ? "Enabled" : "Disabled"}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-300 mb-1">
                        Payment Status
                      </h4>
                      <p className="text-white">
                        {agent.payment_enabled ? "Enabled" : "Disabled"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-slate-300 mb-1">
                        Created
                      </h4>
                      <p className="text-slate-400 text-sm">
                        {formatTimestamp(agent.created_at)}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-300 mb-1">
                        Last Updated
                      </h4>
                      <p className="text-slate-400 text-sm">
                        {formatTimestamp(agent.updated_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-white/10 bg-slate-800/30">
          <div className="text-sm text-slate-400">
            Interactions in AR require precise positioning within{" "}
            {formatDistance(agent.interaction_range_meters)}
          </div>
          <Button
            onClick={onClose}
            className="bg-green-500 hover:bg-green-600 text-black font-medium"
          >
            Close Card
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AgentDetailModal;
