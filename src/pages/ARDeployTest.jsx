import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Camera, MapPin, CheckCircle, Crosshair } from "lucide-react";
import CameraView from "../components/CameraView";
import { useDatabase } from "../hooks/useDatabase";

const ARDeployTest = () => {
  const [searchParams] = useSearchParams();
  const [agentData, setAgentData] = useState(null);
  const [location, setLocation] = useState(null);
  const [deployed, setDeployed] = useState(false);
  const [placementPosition, setPlacementPosition] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [deploymentError, setDeploymentError] = useState(null);

  // Initialize database hook
  const { deployAgent } = useDatabase();

  useEffect(() => {
    // Parse agent data from URL
    const agentDataParam = searchParams.get("agentData");
    if (agentDataParam) {
      try {
        const parsed = JSON.parse(decodeURIComponent(agentDataParam));
        setAgentData(parsed);
        console.log("Agent data received:", parsed);
      } catch (error) {
        console.error("Error parsing agent data:", error);
      }
    }

    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, [searchParams]);

  const handleScreenTap = (e) => {
    if (deployed || deploying) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setPlacementPosition({ x, y });
  };

  // Get agent icon based on type
  const getAgentIcon = (type) => {
    const icons = {
      intelligent_assistant: "🤖",
      payment_terminal: "💳",
      content_creator: "✍️",
      local_services: "🏪",
      tutor_teacher: "👨‍🏫",
      game_agent: "🎮",
      data_analyst: "📊",
      customer_support: "💬",
    };
    return icons[type] || "🤖";
  };

  const handleDeploy = async () => {
    if (!placementPosition || !location || deploying) return;

    setDeploying(true);
    setDeploymentError(null);

    try {
      console.log("🚀 Deploying agent to Supabase:", {
        ...agentData,
        location,
        placementPosition,
      });

      // Prepare deployment data
      const deploymentData = {
        name: agentData.name,
        type: agentData.type,
        description: agentData.description,
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        interaction_fee: parseFloat(agentData.interactionFee) || 0,
        fee_currency: agentData.token || "USDC",
        network: agentData.network || "Polygon Amoy",
        chain_id: agentData.chainId || "80002",
        wallet_address: agentData.wallet,
        ar_placement_x: placementPosition.x,
        ar_placement_y: placementPosition.y,
        deployed_via: "ar-camera",
        status: "active",
      };

      console.log("📦 Deployment payload:", deploymentData);

      // Deploy to Supabase
      const result = await deployAgent(deploymentData);

      if (result.success) {
        console.log("✅ Agent deployed successfully to database!", result.data);
        setDeployed(true);

        // Show success message
        setTimeout(() => {
          alert(
            `Agent deployed successfully!\n\n` +
              `Name: ${agentData.name}\n` +
              `Type: ${agentData.type}\n` +
              `Location: ${location.latitude.toFixed(
                6
              )}, ${location.longitude.toFixed(6)}\n` +
              `Network: ${agentData.network}\n\n` +
              `✅ Saved to database with ID: ${result.data?.id || "N/A"}`
          );
        }, 500);
      } else {
        throw new Error(result.error || "Failed to deploy agent");
      }
    } catch (error) {
      console.error("❌ Deployment error:", error);
      setDeploymentError(error.message);
      alert(`Deployment failed: ${error.message}\n\nPlease try again.`);
    } finally {
      setDeploying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900 text-white">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-sm p-4 border-b border-white/20">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Camera className="w-6 h-6" />
          AR Deployment Test
        </h1>
        {agentData && (
          <p className="text-sm text-blue-200 mt-1">
            Agent: {agentData.name} ({agentData.type})
          </p>
        )}
      </div>

      {/* Main Content */}
      <div className="p-6 max-w-4xl mx-auto">
        {/* Agent Info Card */}
        {agentData && (
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 mb-6 border border-white/20">
            <h2 className="text-xl font-bold mb-4">Agent Details</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-200">Name:</span>
                <p className="font-semibold">{agentData.name}</p>
              </div>
              <div>
                <span className="text-blue-200">Type:</span>
                <p className="font-semibold">{agentData.type}</p>
              </div>
              <div>
                <span className="text-blue-200">Network:</span>
                <p className="font-semibold">{agentData.network}</p>
              </div>
              <div>
                <span className="text-blue-200">Fee:</span>
                <p className="font-semibold">
                  {agentData.interactionFee} {agentData.token}
                </p>
              </div>
              <div className="col-span-2">
                <span className="text-blue-200">Description:</span>
                <p className="font-semibold">{agentData.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Location Info */}
        {location && (
          <div className="bg-green-500/20 backdrop-blur-md rounded-lg p-4 mb-6 border border-green-400/30">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-green-400" />
              <h3 className="font-bold">Location Acquired</h3>
            </div>
            <p className="text-sm">
              Lat: {location.latitude.toFixed(6)}, Lon:{" "}
              {location.longitude.toFixed(6)}
            </p>
            <p className="text-xs text-green-200">
              Accuracy: ±{location.accuracy.toFixed(1)}m
            </p>
          </div>
        )}

        {/* AR Camera - REAL CAMERA FEED */}
        <div className="relative bg-black/50 rounded-lg overflow-hidden border-2 border-purple-500/50 mb-6">
          <div
            className="relative w-full aspect-video bg-black flex items-center justify-center"
            style={{ minHeight: "400px" }}
          >
            {/* Real Camera Feed */}
            {!cameraActive ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10">
                <Camera className="w-24 h-24 text-white/20" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCameraActive(true);
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg"
                >
                  Start Camera
                </button>
              </div>
            ) : (
              <div className="absolute inset-0">
                <CameraView
                  isActive={cameraActive}
                  onToggle={() => setCameraActive(!cameraActive)}
                  showControls={false}
                  className="w-full h-full"
                />
              </div>
            )}

            {/* Tap capture overlay - sits above camera */}
            {cameraActive && !deployed && (
              <div
                className="absolute inset-0 z-20 cursor-crosshair"
                onClick={handleScreenTap}
              />
            )}

            {/* Crosshair overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
              <Crosshair className="w-12 h-12 text-blue-400/50" />
            </div>

            {/* Placement marker with 3D preview */}
            {placementPosition && (
              <div
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-40"
                style={{
                  left: `${placementPosition.x}%`,
                  top: `${placementPosition.y}%`,
                }}
              >
                {/* 3D Model Preview */}
                <div className="relative mb-2">
                  {/* Simple 3D representation - placeholder for actual 3D model */}
                  <div className="relative w-16 h-20">
                    {/* Agent icon/model with type-specific emoji */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-500 via-blue-500 to-purple-600 rounded-xl shadow-2xl flex items-center justify-center text-3xl animate-bounce border-2 border-white/30">
                        {getAgentIcon(agentData?.type)}
                      </div>
                    </div>
                    {/* Shadow */}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-10 h-2 bg-black/40 rounded-full blur-sm" />
                  </div>
                </div>

                {/* Placement dot */}
                <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg animate-pulse mx-auto" />

                {/* Label */}
                <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-black/90 px-3 py-1.5 rounded-lg text-xs font-semibold">
                  <div className="text-green-400">{agentData?.name}</div>
                  <div className="text-gray-300 text-[10px]">
                    {placementPosition.x.toFixed(1)}%,{" "}
                    {placementPosition.y.toFixed(1)}%
                  </div>
                </div>
              </div>
            )}

            {/* Instructions */}
            {cameraActive && !placementPosition && !deployed && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 px-4 py-2 rounded-lg text-center z-40">
                <p className="text-sm font-semibold">
                  <Crosshair className="inline w-4 h-4 mr-1" />
                  Tap anywhere to place agent
                </p>
              </div>
            )}

            {/* Success overlay */}
            {deployed && (
              <div className="absolute inset-0 bg-green-500/30 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white text-green-900 px-8 py-6 rounded-lg text-center">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold">Deployed!</h3>
                  <p className="text-sm mt-2">Agent placed successfully</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Deploy Button */}
        {placementPosition && !deployed && (
          <button
            onClick={handleDeploy}
            disabled={deploying}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg shadow-lg transform hover:scale-105 disabled:hover:scale-100 transition-all duration-200 flex items-center justify-center gap-2"
          >
            {deploying ? (
              <>
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Deploying to Database...
              </>
            ) : (
              <>
                <CheckCircle className="w-6 h-6" />
                Deploy Agent Here
              </>
            )}
          </button>
        )}

        {/* Deployment Error */}
        {deploymentError && !deployed && (
          <div className="mt-4 bg-red-500/20 border border-red-500/30 rounded-lg p-4">
            <p className="text-sm text-red-200">
              <strong>❌ Deployment Error:</strong> {deploymentError}
            </p>
          </div>
        )}

        {/* Debug Info */}
        <div className="mt-6 bg-black/30 rounded-lg p-4 border border-white/10">
          <details>
            <summary className="cursor-pointer font-semibold mb-2">
              Debug Info
            </summary>
            <pre className="text-xs bg-black/50 p-3 rounded overflow-auto">
              {JSON.stringify(
                { agentData, location, placementPosition, deployed },
                null,
                2
              )}
            </pre>
          </details>
        </div>

        {/* Implementation Status */}
        <div className="mt-4 bg-green-500/20 border border-green-500/30 rounded-lg p-4">
          <p className="text-sm text-green-200">
            <strong>✅ AR Deployment Active</strong>
          </p>
          <ul className="text-xs text-green-300 mt-2 space-y-1">
            <li>✅ Real camera feed enabled</li>
            <li>✅ Live GPS positioning</li>
            <li>✅ Supabase database integration</li>
            <li>✅ 3D agent preview on placement</li>
            <li>✅ Tap-to-place deployment ready</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ARDeployTest;
