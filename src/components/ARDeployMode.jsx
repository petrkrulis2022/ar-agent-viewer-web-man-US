import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  MapPin,
  Crosshair,
  CheckCircle,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import CameraView from "./CameraView";
import { useDatabase } from "../hooks/useDatabase";

const ARDeployMode = () => {
  const navigate = useNavigate();
  const { deployAgent } = useDatabase();

  const [agentData, setAgentData] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [deployed, setDeployed] = useState(false);
  const [cameraActive, setCameraActive] = useState(true);
  const [tapPosition, setTapPosition] = useState(null);

  // Parse agent data from URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const agentDataParam = urlParams.get("agentData");

    if (agentDataParam) {
      try {
        const parsed = JSON.parse(decodeURIComponent(agentDataParam));
        setAgentData(parsed);
        console.log("📦 Agent data from AgentSphere:", parsed);
      } catch (error) {
        console.error("❌ Failed to parse agent data:", error);
      }
    }
  }, []);

  // Get user's current location
  useEffect(() => {
    if (!location) {
      getCurrentLocation();
    }
  }, [location]);

  const getCurrentLocation = () => {
    setLocationLoading(true);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            altitude: position.coords.altitude,
            accuracy: position.coords.accuracy,
          };
          setLocation(loc);
          setLocationLoading(false);
          console.log("📍 Location acquired:", loc);
        },
        (error) => {
          console.error("❌ Location error:", error);
          setLocationLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    }
  };

  // Handle screen tap to place agent
  const handleScreenTap = (event) => {
    if (deployed || deploying) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    setTapPosition({ x, y });
    console.log(
      `📍 Agent placement position: ${x.toFixed(2)}%, ${y.toFixed(2)}%`
    );
  };

  // Deploy agent at current location
  const handleDeploy = async () => {
    if (!location || !agentData || !tapPosition) {
      alert("Please tap on the screen to select a placement position");
      return;
    }

    setDeploying(true);

    try {
      const deploymentData = {
        user_id: agentData.wallet,
        name: agentData.name,
        description:
          agentData.description || `A ${agentData.type} agent deployed via AR`,
        object_type: agentData.type,
        latitude: location.latitude,
        longitude: location.longitude,
        altitude: location.altitude,
        accuracy: location.accuracy,
        range_meters: 50,
        deployment_network_name: agentData.network,
        deployment_chain_id: agentData.chainId,
        interaction_fee_amount: parseFloat(agentData.interactionFee),
        interaction_fee_token: agentData.token,
        owner_wallet: agentData.wallet,
        // Store tap position for AR placement
        ar_placement_x: tapPosition.x,
        ar_placement_y: tapPosition.y,
      };

      console.log("🚀 Deploying agent:", deploymentData);

      // TODO: Call actual deployment API
      // await deployAgent(deploymentData);

      // Simulate deployment for now
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setDeployed(true);

      // Redirect back to AgentSphere after 3 seconds
      setTimeout(() => {
        window.location.href = "http://localhost:5178/deploy";
      }, 3000);
    } catch (error) {
      console.error("❌ Deployment failed:", error);
      alert("Deployment failed: " + error.message);
      setDeploying(false);
    }
  };

  if (!agentData) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p>Loading agent data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-black">
      {/* Camera View Background */}
      {cameraActive && (
        <div
          className="absolute inset-0"
          onClick={handleScreenTap}
          style={{ cursor: deployed || deploying ? "default" : "crosshair" }}
        >
          <CameraView autoStart={true} />
        </div>
      )}

      {/* Tap Position Marker */}
      {tapPosition && !deployed && (
        <div
          className="absolute w-16 h-16 -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-pulse"
          style={{
            left: `${tapPosition.x}%`,
            top: `${tapPosition.y}%`,
          }}
        >
          <Crosshair className="w-full h-full text-green-400 drop-shadow-lg" />
        </div>
      )}

      {/* Top Bar - Agent Info */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 z-10">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Cancel
          </Button>
          <div className="text-center">
            <h2 className="text-white font-bold text-lg">{agentData.name}</h2>
            <p className="text-white/70 text-sm">{agentData.type}</p>
          </div>
          <div className="w-24" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Center Instructions */}
      {!tapPosition && !deployed && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-center">
          <div className="bg-black/70 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <Crosshair className="h-16 w-16 text-white mx-auto mb-4 animate-pulse" />
            <h3 className="text-white font-bold text-xl mb-2">
              Tap to Place Agent
            </h3>
            <p className="text-white/80 text-sm">
              Move your camera around and tap anywhere on the screen
              <br />
              to deploy your agent at the current location
            </p>
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6 z-10">
        <div className="space-y-4">
          {/* Location Info */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-green-400" />
                <span className="text-sm">
                  {locationLoading
                    ? "Getting location..."
                    : location
                    ? `${location.latitude.toFixed(
                        6
                      )}, ${location.longitude.toFixed(6)}`
                    : "Location unavailable"}
                </span>
              </div>
              {location && (
                <span className="text-xs text-white/60">
                  Accuracy: ±{location.accuracy?.toFixed(1)}m
                </span>
              )}
            </div>
          </div>

          {/* Deploy Button */}
          {tapPosition && !deployed && (
            <Button
              onClick={handleDeploy}
              disabled={deploying || !location}
              className="w-full h-14 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-lg rounded-xl"
            >
              {deploying ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  Deploying Agent...
                </>
              ) : (
                <>
                  <CheckCircle className="h-6 w-6 mr-2" />
                  Deploy Agent Here
                </>
              )}
            </Button>
          )}

          {/* Success Message */}
          {deployed && (
            <div className="bg-green-500/20 backdrop-blur-md rounded-xl p-6 border-2 border-green-400 text-center">
              <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-white font-bold text-xl mb-2">
                Agent Deployed!
              </h3>
              <p className="text-white/80 text-sm">
                Returning to Agent Sphere...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Crosshair overlay when camera active and no tap yet */}
      {cameraActive && !tapPosition && !deployed && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-5">
          <div className="relative">
            {/* Animated rings */}
            <div className="absolute inset-0 animate-ping">
              <Crosshair className="h-12 w-12 text-green-400/50" />
            </div>
            <Crosshair className="h-12 w-12 text-green-400" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ARDeployMode;
