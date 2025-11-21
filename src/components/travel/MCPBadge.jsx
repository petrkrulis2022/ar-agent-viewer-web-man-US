import React from "react";
import { Cloud, Zap } from "lucide-react";

const MCPBadge = ({ services = [] }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-full">
        <Cloud className="w-3 h-3 text-blue-400" />
        <Zap className="w-3 h-3 text-yellow-400" />
        <span className="text-[10px] font-medium text-blue-300">
          MCP Enabled
        </span>
      </div>
      {services.includes("flightradar24") && (
        <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-gray-800/50 border border-gray-700 rounded-full">
          <span className="text-[10px] text-gray-400">✈️ Flightradar24</span>
        </div>
      )}
    </div>
  );
};

export default MCPBadge;
