import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, MapPin, ArrowLeft, Target } from "lucide-react";
import { useDatabase } from "../hooks/useDatabase";
import CameraView from "../components/CameraView";
import rtkLocationService from "../services/rtkLocation";

// Preload 3D models
useGLTF.preload("/models/terminals/human_head.glb");
useGLTF.preload("/models/terminals/pax-a920_highpoly.glb");

// 3D Human Head Model Component
const HumanHead3D = ({ color, position, scale = 1 }) => {
  const { scene } = useGLTF("/models/terminals/human_head.glb");
  const groupRef = useRef();

  // Animate the head
  useEffect(() => {
    let animationId;
    let time = 0;

    const animate = () => {
      time += 0.01;
      if (groupRef.current) {
        // Gentle floating animation
        groupRef.current.position.y = position[1] + Math.sin(time) * 0.1;
        // Slow rotation
        groupRef.current.rotation.y += 0.005;
      }
      animationId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationId);
  }, [position]);

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <primitive object={scene.clone()} />
      {/* Add glow effect */}
      <pointLight color={color} intensity={2} distance={3} />
    </group>
  );
};

// 3D Payment Terminal Model Component
const PaymentTerminal3D = ({ position, scale = 1, rotation = [0, 0, 0] }) => {
  const { scene } = useGLTF("/models/terminals/pax-a920_highpoly.glb");
  const groupRef = useRef();

  // Gentle idle animation
  useEffect(() => {
    let animationId;
    let time = 0;

    const animate = () => {
      time += 0.01;
      if (groupRef.current) {
        // Very subtle floating
        groupRef.current.position.y = position[1] + Math.sin(time * 0.5) * 0.05;
      }
      animationId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationId);
  }, [position]);

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      <primitive object={scene.clone()} />
      {/* Subtle lighting for the terminal */}
      <pointLight color="#4ade80" intensity={1.5} distance={2} />
    </group>
  );
};

// Dummy agents with 3D heads and terminals to display in AR space
const DUMMY_AGENTS = [
  {
    id: "agent-1",
    name: "Study Helper Bot",
    x: 30, // % from left
    y: 45, // % from top
    color: "#22c55e", // green
    emoji: "📚",
    headPosition: [0, 0.5, -4], // 3D position for head (centered)
    leftHandTerminalPosition: [-1.2, -0.3, -3.8], // Terminal in left hand
    rightHandTerminalPosition: [1.2, -0.3, -3.8], // Terminal in right hand
  },
];

/**
 * AR Placement HMR Page
 * Dedicated page for tap-to-place agent positioning
 * Accessed from Port 5178 deployment page via /hmr route
 */
const ARPlacementHMR = () => {
  const navigate = useNavigate();
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [cameraActive, setCameraActive] = useState(true);
  const [placementPosition, setPlacementPosition] = useState(null);
  const [rtkStatus, setRtkStatus] = useState({
    isRTKEnhanced: false,
    accuracy: 10,
  });

  const isMountedRef = useRef(true);

  // Initialize location on mount
  useEffect(() => {
    isMountedRef.current = true;
    initializeLocation();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const initializeLocation = async () => {
    try {
      console.log("📍 HMR Mode: Initializing GPS location...");

      // Get standard GPS location
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          if (!isMountedRef.current) return;

          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            altitude: position.coords.altitude || 0,
            accuracy: position.coords.accuracy || 10,
          };

          console.log("✅ GPS Location acquired:", location);
          setCurrentLocation(location);

          // Try RTK enhancement
          try {
            const rtkLocation = await rtkLocationService.getEnhancedLocation();
            if (isMountedRef.current && rtkLocation) {
              console.log("🎯 RTK Enhancement successful:", rtkLocation);
              setCurrentLocation(rtkLocation);
              setRtkStatus({
                isRTKEnhanced: true,
                accuracy: rtkLocation.accuracy || 0.05,
              });
            }
          } catch (rtkError) {
            console.log("⚠️ RTK unavailable, using standard GPS");
          }

          setIsInitialized(true);
        },
        (error) => {
          console.error("❌ GPS Error:", error);
          setLocationError(
            "Unable to get GPS location. Please enable location services."
          );
          setIsInitialized(true); // Allow app to continue
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } catch (error) {
      console.error("❌ Location initialization error:", error);
      setLocationError(error.message);
      setIsInitialized(true);
    }
  };

  // Handle screen tap for placement
  const handleScreenTap = (event) => {
    if (!currentLocation) {
      console.warn("⚠️ Cannot place - no GPS location yet");
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    setPlacementPosition({ x, y });
    console.log(`🎯 Placement position: ${x.toFixed(1)}%, ${y.toFixed(1)}%`);
  };

  // Confirm placement and return to deployment page
  const handleConfirmPlacement = () => {
    if (!currentLocation || !placementPosition) {
      console.error("❌ Missing location or placement position");
      return;
    }

    console.log("✅ Placement confirmed - saving data...");

    // Store placement data in sessionStorage
    const placementData = {
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      altitude: currentLocation.altitude || 0,
      accuracy: currentLocation.accuracy || 10,
      rtkEnhanced: rtkStatus.isRTKEnhanced,
      placement_x: placementPosition.x,
      placement_y: placementPosition.y,
      timestamp: new Date().toISOString(),
    };

    sessionStorage.setItem("agentPlacementData", JSON.stringify(placementData));
    console.log("💾 Placement data saved to sessionStorage:", placementData);

    // Redirect back to Port 5178 deployment page
    window.location.href = "http://localhost:5178/deploy?placed=true";
  };

  // Cancel and go back
  const handleCancel = () => {
    window.location.href = "http://localhost:5178/deploy";
  };

  // Loading screen
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-black/50 border-blue-500/30 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">
              🎯 AR Placement Mode
            </CardTitle>
            <CardDescription className="text-blue-200">
              Initializing GPS & Camera...
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center space-x-3 p-4 rounded-lg bg-blue-500/20">
              <MapPin className="w-6 h-6 text-blue-300 animate-pulse" />
              <span className="text-blue-200">Getting location...</span>
            </div>
            <div className="flex items-center justify-center space-x-3 p-4 rounded-lg bg-slate-700/50">
              <Camera className="w-6 h-6 text-slate-400 animate-pulse" />
              <span className="text-slate-300">Initializing camera...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main HMR placement view
  return (
    <>
      <style>{`
        @keyframes float-0 {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px); }
          50% { transform: translate(-50%, -50%) translateY(-15px); }
        }
        @keyframes float-1 {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px); }
          50% { transform: translate(-50%, -50%) translateY(-12px); }
        }
        @keyframes scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>

      <div className="relative min-h-screen bg-black overflow-hidden">
        {/* Camera Background */}
        <div className="absolute inset-0">
          <CameraView isActive={cameraActive} />
        </div>
        {/* 3D Canvas Layer for Agent Heads & Terminals - Behind UI but above camera */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          <Canvas
            camera={{ position: [0, 0, 5], fov: 50 }}
            style={{ background: "transparent" }}
          >
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={1} />
            <directionalLight position={[-5, 3, -5]} intensity={0.5} />

            {DUMMY_AGENTS.map((agent) => (
              <React.Fragment key={agent.id}>
                {/* Human Head */}
                <HumanHead3D
                  color={agent.color}
                  position={agent.headPosition}
                  scale={0.6}
                />
                {/* Payment Terminal - Left Hand */}
                <PaymentTerminal3D
                  position={agent.leftHandTerminalPosition}
                  rotation={[0.3, 0, 0.2]} // Tilted up to face camera
                  scale={0.7}
                />
                {/* Payment Terminal - Right Hand - Upright, screen facing camera */}
                <PaymentTerminal3D
                  position={agent.rightHandTerminalPosition}
                  rotation={[0, 0, 0]} // Upright position, screen forward
                  scale={0.7}
                />
              </React.Fragment>
            ))}
          </Canvas>
        </div>

        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={handleCancel}
              variant="ghost"
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Cancel
            </Button>
            <Badge className="bg-blue-500/90 text-white">
              🎯 Placement Mode
            </Badge>
          </div>
        </div>
        {/* Location Status Badge */}
        {currentLocation && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30">
            <Badge
              className={
                rtkStatus.isRTKEnhanced ? "bg-green-500" : "bg-blue-500"
              }
            >
              📍 GPS Active {rtkStatus.isRTKEnhanced && "• RTK Enhanced"}
            </Badge>
          </div>
        )}
        {/* Error Message */}
        {locationError && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
            ⚠️ {locationError}
          </div>
        )}
        {/* Crosshair & Instructions (before tap) */}
        {!placementPosition && (
          <div className="absolute inset-0 z-20 pointer-events-none">
            {/* Crosshair */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <Target className="w-16 h-16 text-blue-400 animate-pulse drop-shadow-lg" />
            </div>

            {/* Instruction */}
            <div className="absolute bottom-32 left-1/2 -translate-x-1/2 bg-blue-500/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
              <p className="text-white font-semibold text-center">
                👆 Tap anywhere to place agent
              </p>
            </div>

            {/* Tap overlay (clickable) */}
            <div
              className="absolute inset-0 pointer-events-auto cursor-crosshair"
              onClick={handleScreenTap}
            />
          </div>
        )}
        {/* Placement Marker (after tap) */}
        {placementPosition && (
          <div
            className="absolute w-12 h-12 -translate-x-1/2 -translate-y-1/2 z-25 pointer-events-none"
            style={{
              left: `${placementPosition.x}%`,
              top: `${placementPosition.y}%`,
            }}
          >
            <div className="absolute inset-0 bg-green-500 rounded-full opacity-30 animate-ping"></div>
            <div className="absolute inset-0 bg-green-500 rounded-full opacity-50"></div>
            <div className="absolute inset-0 flex items-center justify-center text-white text-2xl">
              📍
            </div>
          </div>
        )}
        {/* Confirm Button (after tap) */}
        {placementPosition && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex space-x-4">
            <Button
              onClick={handleCancel}
              variant="outline"
              className="bg-white/10 text-white border-white/30 hover:bg-white/20"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmPlacement}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg font-bold shadow-2xl"
            >
              <span className="mr-2">🎯</span>
              Confirm Placement
            </Button>
          </div>
        )}
        {/* GPS Info (bottom) */}
        {currentLocation && placementPosition && (
          <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-30 bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg">
            <div className="text-xs text-white/80 font-mono">
              📍 {currentLocation.latitude.toFixed(6)},{" "}
              {currentLocation.longitude.toFixed(6)}
              <br />±
              {rtkStatus.isRTKEnhanced
                ? "0.05"
                : currentLocation.accuracy?.toFixed(1) || "10"}
              m
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ARPlacementHMR;
