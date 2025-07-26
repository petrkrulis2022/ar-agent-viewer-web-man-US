import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Wallet,
  Camera,
  MapPin,
  Users,
  Settings,
  Info,
  ChevronRight,
  CheckCircle,
  Zap,
  Satellite,
} from "lucide-react";
import { useDatabase } from "../hooks/useDatabase";

const MainLandingScreen = ({ onEnterAgentWorld, onShowWallet }) => {
  const { agents, isLoading } = useDatabase();
  const [activeAgentCount, setActiveAgentCount] = useState(0);

  useEffect(() => {
    // Update active agent count when agents data changes
    if (agents && agents.length > 0) {
      setActiveAgentCount(agents.length);
    }
  }, [agents]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between p-6 border-b border-white/10">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Camera className="w-6 h-6 text-green-400" />
            <div>
              <h1 className="text-xl font-bold text-green-400">NeAR Viewer</h1>
              <p className="text-xs text-slate-400">
                Discover NEAR Agents in Your Near World
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors">
            <Bell className="w-5 h-5 text-slate-400" />
          </button>

          {/* NEAR Protocol Badge */}
          <Badge className="bg-green-500/20 text-green-400 border-green-400/30 px-3 py-1">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">NEAR Protocol</span>
            </div>
          </Badge>

          {/* Wallet Button */}
          <Button
            onClick={onShowWallet}
            className="bg-purple-600 hover:bg-purple-700 text-white border border-purple-500/50 px-4 py-2"
          >
            <Wallet className="w-4 h-4 mr-2" />
            Wallet
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* NeAR Viewer Logo */}
          <div className="flex items-center justify-center space-x-3 mb-8">
            <div className="p-3 bg-green-500/20 rounded-lg border border-green-400/30">
              <Camera className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-green-400">NeAR Viewer</h2>
          </div>

          {/* Main Title */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Intelligent NEAR Agent
              <br />
              <span className="text-green-400">Augmented Reality</span>
            </h1>

            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Chat, interact, and collaborate with NEAR-powered AI agents
              positioned at precise real-world locations using GEODNET RTK
              precision
            </p>
          </div>

          {/* Primary CTA Button */}
          <div className="space-y-4">
            <Button
              onClick={onEnterAgentWorld}
              size="lg"
              className="bg-green-500 hover:bg-green-600 text-black font-semibold px-8 py-4 text-lg rounded-full transition-all duration-200 hover:scale-105 shadow-lg shadow-green-500/25"
            >
              <ChevronRight className="w-5 h-5 mr-2" />
              Enter Agent World
              <span className="text-xs ml-2 opacity-75">powered by NEAR</span>
            </Button>

            {/* Secondary Link */}
            <div>
              <button className="text-green-400 hover:text-green-300 transition-colors text-sm font-medium group">
                View Agent Network Status
                <ChevronRight className="w-4 h-4 ml-1 inline-block group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Network Status Panel */}
      <div className="px-6 pb-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-green-400 mb-4 text-center">
              NEAR Agent Network Status
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* RTK Precision Status */}
              <div className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Satellite className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-green-400">
                      RTK Precision: Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">GEODNET Enhanced GPS</p>
                </div>
              </div>

              {/* NEAR Network Status */}
              <div className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Zap className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-green-400">
                      NEAR Network: Connected
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">BlockDAG Testnet</p>
                </div>
              </div>

              {/* Active Agents Count */}
              <div className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Users className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-green-400">
                      Active NEAR Agents: {isLoading ? "..." : activeAgentCount}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Available in network</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <footer className="border-t border-white/10 bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <nav className="flex items-center justify-center space-x-8">
            <button className="flex flex-col items-center space-y-1 p-2 text-green-400 hover:text-green-300 transition-colors">
              <Camera className="w-5 h-5" />
              <span className="text-xs font-medium">NeAR Viewer</span>
            </button>

            <button className="flex flex-col items-center space-y-1 p-2 text-slate-400 hover:text-white transition-colors">
              <Users className="w-5 h-5" />
              <span className="text-xs font-medium">NEAR Agents</span>
            </button>

            <button className="flex flex-col items-center space-y-1 p-2 text-slate-400 hover:text-white transition-colors">
              <MapPin className="w-5 h-5" />
              <span className="text-xs font-medium">NEAR Map</span>
            </button>

            <button className="flex flex-col items-center space-y-1 p-2 text-slate-400 hover:text-white transition-colors">
              <Wallet className="w-5 h-5" />
              <span className="text-xs font-medium">NEAR Wallet</span>
            </button>

            <button className="flex flex-col items-center space-y-1 p-2 text-slate-400 hover:text-white transition-colors">
              <Settings className="w-5 h-5" />
              <span className="text-xs font-medium">Settings</span>
            </button>

            <button className="flex flex-col items-center space-y-1 p-2 text-slate-400 hover:text-white transition-colors">
              <Info className="w-5 h-5" />
              <span className="text-xs font-medium">About</span>
            </button>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default MainLandingScreen;
