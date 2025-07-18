import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  MessageCircle, 
  Zap, 
  MapPin,
  User,
  Briefcase,
  GraduationCap,
  Gamepad2,
  Wrench
} from 'lucide-react';

const ARAgentOverlay = ({ 
  agents = [], 
  onAgentClick, 
  userLocation,
  cameraViewSize = { width: 1280, height: 720 }
}) => {
  const [visibleAgents, setVisibleAgents] = useState([]);

  // Agent type icons
  const getAgentIcon = (agentType) => {
    const icons = {
      'Intelligent Assistant': Bot,
      'Content Creator': User,
      'Local Services': Wrench,
      'Tutor/Teacher': GraduationCap,
      'Game Agent': Gamepad2
    };
    return icons[agentType] || Bot;
  };

  // Agent type colors
  const getAgentColor = (agentType) => {
    const colors = {
      'Intelligent Assistant': 'from-blue-500 to-purple-500',
      'Content Creator': 'from-pink-500 to-red-500',
      'Local Services': 'from-green-500 to-teal-500',
      'Tutor/Teacher': 'from-yellow-500 to-orange-500',
      'Game Agent': 'from-purple-500 to-indigo-500'
    };
    return colors[agentType] || 'from-blue-500 to-purple-500';
  };

  // Calculate agent position on screen based on GPS coordinates
  const calculateAgentPosition = (agent, userLoc) => {
    if (!userLoc || !agent.latitude || !agent.longitude) {
      // Improved distributed positioning if no GPS data
      const index = agents.indexOf(agent);
      const totalAgents = agents.length;
      
      // Create a grid-like distribution with some randomness
      const gridCols = Math.ceil(Math.sqrt(totalAgents));
      const gridRows = Math.ceil(totalAgents / gridCols);
      
      const col = index % gridCols;
      const row = Math.floor(index / gridCols);
      
      // Distribute across camera view (avoid edges)
      const baseX = 15 + (col / Math.max(1, gridCols - 1)) * 70; // 15-85% width
      const baseY = 15 + (row / Math.max(1, gridRows - 1)) * 70; // 15-85% height
      
      // Add randomness to avoid perfect grid
      const randomX = (Math.random() - 0.5) * 20;
      const randomY = (Math.random() - 0.5) * 20;
      
      return {
        x: Math.max(10, Math.min(90, baseX + randomX)),
        y: Math.max(10, Math.min(90, baseY + randomY)),
        distance: agent.distance_meters || (Math.random() * 100 + 10)
      };
    }

    // GPS-based positioning with improved scaling
    const latDiff = agent.latitude - userLoc.latitude;
    const lonDiff = agent.longitude - userLoc.longitude;
    
    // Better scaling for GPS coordinates to screen positions
    const scaleFactor = 5000; // Adjusted for better distribution
    
    let x = 50 + (lonDiff * scaleFactor);
    let y = 50 - (latDiff * scaleFactor); // Invert Y for screen coordinates
    
    // Ensure agents stay within visible camera bounds
    x = Math.max(10, Math.min(90, x));
    y = Math.max(10, Math.min(90, y));
    
    return {
      x,
      y,
      distance: agent.distance_meters || 
        Math.sqrt(Math.pow(latDiff * 111000, 2) + Math.pow(lonDiff * 111000, 2))
    };
  };

  // Update visible agents with positions
  useEffect(() => {
    console.log('🤖 ARAgentOverlay received agents:', agents);
    console.log('📍 User location:', userLocation);
    
    const agentsWithPositions = agents.map(agent => ({
      ...agent,
      position: calculateAgentPosition(agent, userLocation)
    }));
    
    console.log('🎯 Agents with positions:', agentsWithPositions);
    
    // Sort by distance (closest first)
    agentsWithPositions.sort((a, b) => a.position.distance - b.position.distance);
    
    // Show up to 15 closest agents (increased from 5)
    const limitedAgents = agentsWithPositions.slice(0, 15);
    setVisibleAgents(limitedAgents);
    
    console.log(`👁️ Visible agents set: ${limitedAgents.length}`, limitedAgents);
  }, [agents, userLocation]);

  // Handle agent click
  const handleAgentClick = (agent) => {
    if (onAgentClick) {
      onAgentClick(agent);
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {visibleAgents.map((agent, index) => {
        const IconComponent = getAgentIcon(agent.agent_type);
        const colorClass = getAgentColor(agent.agent_type);
        
        return (
          <div
            key={agent.id}
            className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
            style={{
              left: `${agent.position.x}%`,
              top: `${agent.position.y}%`,
              animationDelay: `${index * 0.2}s`
            }}
          >
            {/* Agent Marker */}
            <div
              onClick={() => handleAgentClick(agent)}
              className="relative cursor-pointer group"
            >
              {/* Pulsing Ring */}
              <div className={`absolute inset-0 w-16 h-16 bg-gradient-to-r ${colorClass} rounded-full opacity-30 animate-ping`}></div>
              
              {/* Main Agent Circle */}
              <div className={`relative w-12 h-12 bg-gradient-to-r ${colorClass} rounded-full flex items-center justify-center shadow-lg border-2 border-white/50 hover:scale-110 transition-transform duration-200`}>
                <IconComponent className="w-6 h-6 text-white" />
              </div>

              {/* Distance Badge */}
              <div className="absolute -top-2 -right-2">
                <Badge className="bg-black/70 text-white text-xs px-1 py-0.5">
                  {agent.position.distance < 1000 
                    ? `${Math.round(agent.position.distance)}m`
                    : `${(agent.position.distance / 1000).toFixed(1)}km`
                  }
                </Badge>
              </div>

              {/* Agent Info Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="bg-black/90 backdrop-blur-sm rounded-lg p-3 min-w-48 shadow-xl border border-white/20">
                  <div className="text-center">
                    <h4 className="text-white font-semibold text-sm mb-1">{agent.name}</h4>
                    <p className="text-purple-200 text-xs mb-2">{agent.agent_type}</p>
                    <p className="text-slate-300 text-xs mb-3 line-clamp-2">{agent.description}</p>
                    
                    <div className="flex items-center justify-center space-x-4 text-xs">
                      <div className="flex items-center space-x-1 text-green-400">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span>Online</span>
                      </div>
                      <div className="flex items-center space-x-1 text-blue-400">
                        <MessageCircle className="w-3 h-3" />
                        <span>Chat</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Tooltip Arrow */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
                </div>
              </div>

              {/* Interaction Hint */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="bg-purple-500/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
                  <MessageCircle className="w-3 h-3 text-white" />
                  <span className="text-white text-xs font-medium">Tap to chat</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Agent Counter */}
      {visibleAgents.length > 0 && (
        <div className="absolute top-4 right-4 pointer-events-auto">
          <Badge className="bg-black/70 text-white flex items-center space-x-2 px-3 py-2">
            <Bot className="w-4 h-4" />
            <span>{visibleAgents.length} agent{visibleAgents.length !== 1 ? 's' : ''} nearby</span>
          </Badge>
        </div>
      )}

      {/* No Agents Message */}
      {visibleAgents.length === 0 && agents.length === 0 && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 pointer-events-auto">
          <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4 text-center">
            <Bot className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-white text-sm font-medium">No agents nearby</p>
            <p className="text-slate-400 text-xs">Move around to discover NEAR agents</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {agents.length === 0 && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 pointer-events-auto">
          <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4 text-center">
            <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-white text-sm font-medium">Scanning for agents...</p>
            <p className="text-slate-400 text-xs">Connecting to NEAR network</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ARAgentOverlay;

