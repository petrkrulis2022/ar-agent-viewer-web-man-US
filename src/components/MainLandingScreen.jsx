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
  Database,
  Copy,
} from "lucide-react";
import { useDatabase } from "../hooks/useDatabase";
import NewNeARAgentsMarketplace from "./NewNeARAgentsMarketplace";
import ARQRTestRunner from "./ARQRTestRunner";
import DatabaseStatusComponent from "./DatabaseStatusComponent";
import NetworkDisplay from "./NetworkDisplay";
import WalletAddressDisplay from "./WalletAddressDisplay";

const MainLandingScreen = ({ onEnterAgentWorld, onShowWallet }) => {
  const { getNearAgents, getCurrentLocation, isLoading, refreshConnection } =
    useDatabase();
  const [agents, setAgents] = useState([]);
  const [activeAgentCount, setActiveAgentCount] = useState(0);
  const [showMarketplace, setShowMarketplace] = useState(false);
  const [showTestRunner, setShowTestRunner] = useState(false);
  const [showDatabaseStatus, setShowDatabaseStatus] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  // Initialize isMobile immediately, not in useEffect
  const [isMobile] = useState(
    () =>
      typeof navigator !== "undefined" &&
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      ),
  );
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Get current device location and fetch agents on component mount
  useEffect(() => {
    // Initialize wallet state
    const initWallet = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            setIsWalletConnected(true);
          }
        } catch (error) {
          console.error("Failed to initialize wallet:", error);
        }
      }
    };
    initWallet();

    // Setup wallet listeners
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length === 0) {
          setWalletAddress(null);
          setIsWalletConnected(false);
        } else {
          setWalletAddress(accounts[0]);
          setIsWalletConnected(true);
        }
      });
    }

    const fetchAgentsForCurrentLocation = async () => {
      try {
        console.log("📍 Getting device location and fetching agents...");
        const deviceLocation = await getCurrentLocation();
        setCurrentLocation(deviceLocation);

        console.log("🔍 Fetching agents for location:", deviceLocation);
        const agentsData = await getNearAgents(deviceLocation);

        if (agentsData && agentsData.length > 0) {
          setAgents(agentsData);
          setActiveAgentCount(agentsData.length);
          console.log(
            `✅ Found ${agentsData.length} agents near current location`,
          );
        } else {
          console.log("⚠️ No agents found near current location");
          setAgents([]);
          setActiveAgentCount(0);
        }
      } catch (error) {
        console.error("❌ Error fetching agents for current location:", error);
        setAgents([]);
        setActiveAgentCount(0);
      }
    };

    fetchAgentsForCurrentLocation();
  }, [getNearAgents, getCurrentLocation]);

  // Update active agent count when agents data changes (keep legacy behavior)
  useEffect(() => {
    // Update active agent count when agents data changes
    if (agents && agents.length > 0) {
      setActiveAgentCount(agents.length);
    }
  }, [agents]);

  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleCopyAddress = async (e) => {
    if (isMobile && isWalletConnected && walletAddress) {
      e.stopPropagation();
      try {
        await navigator.clipboard.writeText(walletAddress);
        setCopiedAddress(true);
        setTimeout(() => setCopiedAddress(false), 2000);
      } catch (error) {
        console.error("Failed to copy address:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Top Navigation Bar */}
      <header className="flex flex-col items-center justify-center p-4 sm:p-6 border-b border-white/10 space-y-4">
        {/* Row 1: Logo + CubePay + Wallet */}
        <div className="flex items-center justify-center space-x-4 sm:space-x-8">
          {/* Logo */}
          <img
            src="/cubepay_simple_cube.gif"
            alt="CubePay"
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg"
          />

          {/* CubePay Title */}
          <h1 className="text-3xl sm:text-4xl font-bold text-green-400">
            CubePay
          </h1>

          {/* Smart Wallet Button */}
          {isMobile && isWalletConnected && walletAddress ? (
            <Button
              onClick={onShowWallet}
              className="bg-purple-600 hover:bg-purple-700 text-white border border-purple-500/50 px-2 py-2"
            >
              <div className="flex items-center space-x-1">
                <Wallet className="w-4 h-4" />
                <span className="text-xs font-mono">
                  {formatAddress(walletAddress)}
                </span>
                <button
                  onClick={handleCopyAddress}
                  className="ml-1 p-1 hover:bg-purple-800 rounded touch-manipulation"
                  aria-label="Copy address"
                >
                  {copiedAddress ? (
                    <CheckCircle className="w-3 h-3 text-green-300" />
                  ) : (
                    <Copy className="w-3 h-3 opacity-70" />
                  )}
                </button>
              </div>
            </Button>
          ) : (
            <Button
              onClick={onShowWallet}
              className="bg-purple-600 hover:bg-purple-700 text-white border border-purple-500/50 px-3 sm:px-4 py-2"
            >
              <Wallet className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Wallet</span>
            </Button>
          )}
        </div>

        {/* Row 2: Network Display + Wallet Address */}
        <div className="flex items-center justify-center space-x-4">
          <NetworkDisplay />
          <div className="hidden md:block">
            <WalletAddressDisplay />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          {/* Primary CTA Buttons - 2x2 Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              onClick={onEnterAgentWorld}
              size="lg"
              className="bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-black font-semibold px-3 py-6 text-sm rounded-2xl transition-all duration-200 hover:scale-105 shadow-xl hover:shadow-2xl shadow-green-500/30 flex flex-col items-center justify-center min-h-[80px] sm:min-h-[100px] border-b-4 border-green-700"
            >
              Pay with your terminal
            </Button>

            <Button
              onClick={onEnterAgentWorld}
              size="lg"
              className="bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-black font-semibold px-3 py-6 text-sm rounded-2xl transition-all duration-200 hover:scale-105 shadow-xl hover:shadow-2xl shadow-green-500/30 flex flex-col items-center justify-center min-h-[80px] sm:min-h-[100px] border-b-4 border-green-700"
            >
              Pay with CubePay
            </Button>

            <Button
              onClick={onEnterAgentWorld}
              size="lg"
              className="bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-black font-semibold px-3 py-6 text-sm rounded-2xl transition-all duration-200 hover:scale-105 shadow-xl hover:shadow-2xl shadow-green-500/30 flex flex-col items-center justify-center min-h-[80px] sm:min-h-[100px] border-b-4 border-green-700"
            >
              Virtual ATMs
            </Button>

            <Button
              onClick={onEnterAgentWorld}
              size="lg"
              className="bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-black font-semibold px-3 py-6 text-sm rounded-2xl transition-all duration-200 hover:scale-105 shadow-xl hover:shadow-2xl shadow-green-500/30 flex flex-col items-center justify-center min-h-[80px] sm:min-h-[100px] border-b-4 border-green-700"
            >
              Deploy Terminal
            </Button>
          </div>
        </div>
      </main>

      {/* Network Status Panel */}
      <div className="px-6 pb-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-green-400 mb-4 text-center">
              CubePay Network Status
            </h3>

            <div className="grid grid-cols-1 gap-3">
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

              {/* CubePay Network Status */}
              <div className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Zap className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-green-400">
                      CubePay Network: Connected
                    </span>
                  </div>
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
                      Active Agents: {isLoading ? "..." : activeAgentCount}
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
        <div className="max-w-2xl mx-auto px-6 py-4">
          <nav className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
            <button className="flex flex-col items-center space-y-1 p-2 text-green-400 hover:text-green-300 transition-colors">
              <Camera className="w-5 h-5" />
              <span className="text-xs font-medium">CubePay</span>
            </button>

            <button
              onClick={() => setShowMarketplace(true)}
              className="flex flex-col items-center space-y-1 p-2 text-slate-400 hover:text-white transition-colors group"
            >
              <Users className="w-5 h-5 group-hover:text-green-400 transition-colors" />
              <span className="text-xs font-medium text-center">
                Agents Marketplace
              </span>
              <span className="text-xs text-green-400 opacity-75">
                {activeAgentCount}
              </span>
            </button>

            <button className="flex flex-col items-center space-y-1 p-2 text-slate-400 hover:text-white transition-colors">
              <MapPin className="w-5 h-5" />
              <span className="text-xs font-medium">Agent Map</span>
            </button>

            <button
              onClick={() => setShowDatabaseStatus(true)}
              className="flex flex-col items-center space-y-1 p-2 text-slate-400 hover:text-white transition-colors"
            >
              <Database className="w-5 h-5" />
              <span className="text-xs font-medium">Database</span>
            </button>

            <button className="flex flex-col items-center space-y-1 p-2 text-slate-400 hover:text-white transition-colors">
              <Wallet className="w-5 h-5" />
              <span className="text-xs font-medium">Wallet</span>
            </button>

            <button className="flex flex-col items-center space-y-1 p-2 text-slate-400 hover:text-white transition-colors">
              <Settings className="w-5 h-5" />
              <span className="text-xs font-medium">Settings</span>
            </button>

            <button className="flex flex-col items-center space-y-1 p-2 text-slate-400 hover:text-white transition-colors">
              <Info className="w-5 h-5" />
              <span className="text-xs font-medium">About</span>
            </button>

            {/* Test Runner Button (Development Only) */}
            {process.env.NODE_ENV === "development" && (
              <>
                <button
                  onClick={() => setShowTestRunner(true)}
                  className="flex flex-col items-center space-y-1 p-2 text-slate-400 hover:text-white transition-colors"
                >
                  <Zap className="w-5 h-5" />
                  <span className="text-xs font-medium">QR Tests</span>
                </button>

                <button
                  onClick={() => (window.location.href = "/cube-demo")}
                  className="flex flex-col items-center space-y-1 p-2 text-slate-400 hover:text-white transition-colors"
                >
                  <span className="text-base">📦</span>
                  <span className="text-xs font-medium">Cube Demo</span>
                </button>

                <button
                  onClick={() => (window.location.href = "/camera-test")}
                  className="flex flex-col items-center space-y-1 p-2 text-slate-400 hover:text-white transition-colors"
                >
                  <span className="text-base">📹</span>
                  <span className="text-xs font-medium">Camera Test</span>
                </button>
              </>
            )}
          </nav>
        </div>
      </footer>

      {/* Agents Marketplace Modal */}
      <NewNeARAgentsMarketplace
        isOpen={showMarketplace}
        onClose={() => setShowMarketplace(false)}
        userLocation={currentLocation}
      />

      {/* Database Status Modal */}
      <div
        className={`fixed inset-0 z-50 ${
          showDatabaseStatus ? "block" : "hidden"
        }`}
      >
        <div
          className="fixed inset-0 bg-black/80"
          onClick={() => setShowDatabaseStatus(false)}
        />
        <div className="fixed left-[50%] top-[50%] z-[500] grid w-[95vw] max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-4 sm:p-6 shadow-lg duration-200 sm:rounded-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Database Connection</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDatabaseStatus(false)}
            >
              ✕
            </Button>
          </div>
          <DatabaseStatusComponent
            onRefresh={async () => {
              await refreshConnection();
              // Re-fetch agents after refresh
              try {
                if (currentLocation) {
                  const refreshedAgents = await getNearAgents(currentLocation);
                  setAgents(refreshedAgents || []);
                  setActiveAgentCount(refreshedAgents?.length || 0);
                }
              } catch (error) {
                console.error("Error refreshing agents:", error);
              }
            }}
          />
        </div>
      </div>

      {/* AR QR Test Runner Modal (Development Only) */}
      {process.env.NODE_ENV === "development" && (
        <div
          className={`fixed inset-0 z-50 ${
            showTestRunner ? "block" : "hidden"
          }`}
        >
          <div
            className="fixed inset-0 bg-black/80"
            onClick={() => setShowTestRunner(false)}
          />
          <div className="fixed left-[50%] top-[50%] z-[500] grid w-[95vw] max-w-4xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-4 sm:p-6 shadow-lg duration-200 sm:rounded-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                AR QR Payment Test Runner
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTestRunner(false)}
              >
                ✕
              </Button>
            </div>
            <ARQRTestRunner />
          </div>
        </div>
      )}
    </div>
  );
};

export default MainLandingScreen;
