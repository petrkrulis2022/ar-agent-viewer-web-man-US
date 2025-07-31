import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Billboard, Text } from "@react-three/drei";
import * as THREE from "three";
import QRCode from "qrcode";
import arQRManager from "../services/arQRManager";

// Enhanced 3D QR Code Object Component with persistence
const FloatingQRCode = ({
  qrData,
  position = [0, 0, -2],
  size = 1,
  onScanned,
  isActive = true,
  qrObject = null,
}) => {
  const meshRef = useRef();
  const [qrTexture, setQrTexture] = useState(null);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Generate QR code texture with enhanced error handling
  useEffect(() => {
    if (!qrData) {
      console.warn("No QR data provided for texture generation");
      setHasError(true);
      return;
    }

    console.log("🎨 Generating QR texture for AR display");
    
    const canvas = document.createElement("canvas");
    QRCode.toCanvas(
      canvas,
      qrData,
      {
        width: 512,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "M", // Better error correction for AR scanning
      },
      (error) => {
        if (error) {
          console.error("❌ Error generating QR texture:", error);
          setHasError(true);
          
          // Create fallback error texture
          const errorCanvas = document.createElement("canvas");
          errorCanvas.width = 512;
          errorCanvas.height = 512;
          const ctx = errorCanvas.getContext("2d");
          
          ctx.fillStyle = "#FF4444";
          ctx.fillRect(0, 0, 512, 512);
          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 24px Arial";
          ctx.textAlign = "center";
          ctx.fillText("QR ERROR", 256, 240);
          ctx.font = "16px Arial";
          ctx.fillText("Check console", 256, 280);
          
          const errorTexture = new THREE.CanvasTexture(errorCanvas);
          errorTexture.flipY = false;
          setQrTexture(errorTexture);
        } else {
          console.log("✅ QR texture generated successfully");
          const texture = new THREE.CanvasTexture(canvas);
          texture.flipY = false;
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
          setQrTexture(texture);
          setHasError(false);
        }
      }
    );
  }, [qrData]);

  // Enhanced animation loop with better performance
  useFrame((state) => {
    if (!meshRef.current || !isActive) return;

    const time = state.clock.getElapsedTime();

    // Smooth floating animation
    const floatAmplitude = 0.12;
    const floatSpeed = 1.2;
    meshRef.current.position.y = position[1] + Math.sin(time * floatSpeed) * floatAmplitude;

    // Gentle rotation to show it's interactive
    const rotationSpeed = 0.6;
    meshRef.current.rotation.y = Math.sin(time * rotationSpeed) * 0.15;

    // Pulsing scale for attention (more subtle)
    const pulseSpeed = 2.5;
    const pulseAmplitude = 0.03;
    const scale = size + Math.sin(time * pulseSpeed) * pulseAmplitude;
    meshRef.current.scale.setScalar(scale);

    setAnimationPhase(time);
  });

  // Enhanced click handler with visual feedback
  const handleClick = (event) => {
    if (!isActive || isScanning || hasError) return;

    event.stopPropagation();
    console.log("📱 AR QR Code clicked for scanning");
    
    setIsScanning(true);

    // Visual feedback - quick scale animation
    if (meshRef.current) {
      const originalScale = meshRef.current.scale.x;
      meshRef.current.scale.setScalar(originalScale * 1.3);
      
      // Reset scale after animation
      setTimeout(() => {
        if (meshRef.current) {
          meshRef.current.scale.setScalar(originalScale);
        }
      }, 300);
    }

    // Prepare enhanced scan data
    const scanData = {
      id: qrObject?.id || `ar_qr_${Date.now()}`,
      data: qrData,
      position: position,
      qrObject: qrObject,
      scannedAt: Date.now(),
      amount: qrObject?.amount,
      agent: qrObject?.agent,
    };

    // Call scan handler
    if (onScanned) {
      onScanned(scanData);
    }

    // Update AR QR Manager
    if (qrObject?.id) {
      arQRManager.scanQR(qrObject.id);
    }

    // Reset scanning state
    setTimeout(() => {
      setIsScanning(false);
    }, 2000);
  };

  // Loading state
  if (!qrTexture) {
    return (
      <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
        <mesh position={position}>
          <planeGeometry args={[size, size]} />
          <meshBasicMaterial color="#666666" transparent opacity={0.5} />
          <Html center position={[0, 0, 0.01]}>
            <div className="bg-black/80 text-white px-2 py-1 rounded text-xs">
              Loading QR...
            </div>
          </Html>
        </mesh>
      </Billboard>
    );
  }

  return (
    <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
      <mesh ref={meshRef} position={position} onClick={handleClick}>
        {/* Main QR Code Plane */}
        <planeGeometry args={[size, size]} />
        <meshBasicMaterial 
          map={qrTexture} 
          transparent={true} 
          opacity={isActive ? (hasError ? 0.7 : 0.95) : 0.4} 
        />

        {/* Enhanced glowing border effect */}
        <mesh position={[0, 0, -0.001]}>
          <planeGeometry args={[size * 1.15, size * 1.15]} />
          <meshBasicMaterial
            color={
              hasError ? "#FF4444" : 
              isScanning ? "#00FF00" : 
              isActive ? "#8B5CF6" : "#666666"
            }
            transparent={true}
            opacity={0.3 + Math.sin(animationPhase * 3) * 0.2}
          />
        </mesh>

        {/* Status indicator ring */}
        <mesh position={[0, 0, 0.001]}>
          <ringGeometry args={[size * 0.5, size * 0.55, 32]} />
          <meshBasicMaterial
            color={
              hasError ? "#FF4444" :
              isScanning ? "#00FF00" :
              isActive ? "#00AA00" : "#FF6600"
            }
            transparent={true}
            opacity={0.7}
          />
        </mesh>

        {/* Interactive scan instruction */}
        <Html
          position={[0, -size / 2 - 0.4, 0]}
          center
          distanceFactor={10}
          occlude
        >
          <div className={`px-3 py-2 rounded-full text-sm font-medium border ${
            hasError 
              ? "bg-red-500/90 text-white border-red-400 animate-pulse"
              : isScanning 
              ? "bg-green-500/90 text-white border-green-400 animate-pulse"
              : "bg-black/90 text-white border-purple-500/50 animate-pulse"
          }`}>
            {hasError ? (
              <span>❌ QR Error</span>
            ) : isScanning ? (
              <span>🔄 Scanning...</span>
            ) : (
              <span>📱 Tap to Scan & Pay</span>
            )}
          </div>
        </Html>

        {/* Payment amount indicator */}
        {qrObject?.amount && !hasError && (
          <Html
            position={[0, size / 2 + 0.3, 0]}
            center
            distanceFactor={10}
            occlude
          >
            <div className="bg-purple-500/90 text-white px-2 py-1 rounded text-xs font-bold border border-purple-400">
              {qrObject.amount} USBDG+
            </div>
          </Html>
        )}

        {/* Agent name indicator */}
        {qrObject?.agent?.name && !hasError && (
          <Html
            position={[size / 2 + 0.2, 0, 0]}
            center
            distanceFactor={12}
            occlude
          >
            <div className="bg-blue-500/90 text-white px-2 py-1 rounded-l text-xs font-medium">
              {qrObject.agent.name}
            </div>
          </Html>
        )}

        {/* Database status indicator (debug) */}
        {qrObject?.dbSaveStatus && (
          <Html
            position={[-size / 2 - 0.2, 0, 0]}
            center
            distanceFactor={15}
            occlude
          >
            <div className={`px-1 py-0.5 rounded text-xs ${
              qrObject.dbSaveStatus === 'saved' 
                ? "bg-green-500/80 text-white"
                : qrObject.dbSaveStatus === 'failed'
                ? "bg-red-500/80 text-white" 
                : "bg-yellow-500/80 text-black"
            }`}>
              {qrObject.dbSaveStatus === 'saved' ? '✓' : 
               qrObject.dbSaveStatus === 'failed' ? '✗' : '⏳'}
            </div>
          </Html>
        )}
      </mesh>
    </Billboard>
  );
};

// Enhanced AR Scene Container with persistent QR management
const ARQRScene = ({
  qrCodes = [],
  onQRScanned,
  cameraPosition = [0, 0, 0],
}) => {
  const [localQRCodes, setLocalQRCodes] = useState(qrCodes);

  // Listen for AR QR Manager events
  useEffect(() => {
    const handleQRAdded = (event) => {
      const qrObject = event.detail;
      console.log("🎯 AR QR Manager: QR added", qrObject);
      
      setLocalQRCodes(prev => {
        const exists = prev.find(qr => qr.id === qrObject.id);
        if (exists) return prev;
        return [...prev, qrObject];
      });
    };

    const handleQRRemoved = (event) => {
      const { qrId } = event.detail;
      console.log("🗑️ AR QR Manager: QR removed", qrId);
      
      setLocalQRCodes(prev => prev.filter(qr => qr.id !== qrId));
    };

    const handleQRCleared = () => {
      console.log("🧹 AR QR Manager: All QRs cleared");
      setLocalQRCodes([]);
    };

    // Add event listeners
    window.addEventListener('arQRAdded', handleQRAdded);
    window.addEventListener('arQRRemoved', handleQRRemoved);
    window.addEventListener('arQRCleared', handleQRCleared);

    return () => {
      window.removeEventListener('arQRAdded', handleQRAdded);
      window.removeEventListener('arQRRemoved', handleQRRemoved);
      window.removeEventListener('arQRCleared', handleQRCleared);
    };
  }, []);

  // Update local QR codes when props change
  useEffect(() => {
    setLocalQRCodes(qrCodes);
  }, [qrCodes]);

  return (
    <Canvas
      camera={{
        position: cameraPosition,
        fov: 75,
        near: 0.1,
        far: 1000,
      }}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "auto",
        zIndex: 20,
      }}
      gl={{ 
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: true 
      }}
    >
      {/* Enhanced lighting for better QR visibility */}
      <ambientLight intensity={0.9} />
      <pointLight position={[10, 10, 10]} intensity={0.6} />
      <pointLight position={[-10, -10, -10]} intensity={0.3} />

      {/* Render all QR codes with enhanced data */}
      {localQRCodes.map((qrCode, index) => (
        <FloatingQRCode
          key={qrCode.id || `qr-${index}`}
          qrData={qrCode.data}
          position={
            qrCode.position || [(index - localQRCodes.length / 2) * 2.5, 1, -3]
          }
          size={qrCode.size || 1.5}
          onScanned={(scanData) => {
            console.log("🎯 QR Scan in AR Scene:", scanData);
            if (onQRScanned) {
              onQRScanned(scanData);
            }
          }}
          isActive={qrCode.status === "active"}
          qrObject={qrCode}
        />
      ))}

      {/* Debug information display */}
      {localQRCodes.length > 0 && (
        <Html position={[0, 3, -5]} center>
          <div className="bg-black/70 text-white px-2 py-1 rounded text-xs">
            {localQRCodes.length} AR QR{localQRCodes.length !== 1 ? 's' : ''} Active
          </div>
        </Html>
      )}
    </Canvas>
  );
};

// Main AR QR Code Component with enhanced state management
const ARQRCode = ({ qrCodes = [], onQRScanned, className = "" }) => {
  const [localQRCodes, setLocalQRCodes] = useState(qrCodes);
  const [stats, setStats] = useState({ active: 0, total: 0 });

  // Update local state when props change
  useEffect(() => {
    setLocalQRCodes(qrCodes);
  }, [qrCodes]);

  // Enhanced QR scan handler with persistence
  const handleQRScanned = (scanData) => {
    console.log("🎯 AR QR Scanned:", scanData);

    // Update local state to show scanning feedback
    setLocalQRCodes((prev) =>
      prev.map((qr) =>
        qr.id === scanData.id 
          ? { ...qr, status: "scanned", scannedAt: scanData.scannedAt } 
          : qr
      )
    );

    // Call parent handler with enhanced data
    if (onQRScanned) {
      onQRScanned(scanData);
    }

    // Auto-remove scanned QR after animation
    setTimeout(() => {
      setLocalQRCodes((prev) => prev.filter((qr) => qr.id !== scanData.id));
    }, 3000);
  };

  // Update stats periodically
  useEffect(() => {
    const updateStats = () => {
      const managerStats = arQRManager.getStats();
      setStats(managerStats);
    };

    updateStats();
    const interval = setInterval(updateStats, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <ARQRScene qrCodes={localQRCodes} onQRScanned={handleQRScanned} />
      
      {/* Debug stats overlay */}
      {process.env.NODE_ENV === 'development' && stats.total > 0 && (
        <div className="absolute top-2 left-2 bg-black/70 text-white p-2 rounded text-xs font-mono">
          QR Stats: {stats.active} active, {stats.total} total
          <br />
          DB: {stats.dbSaved} saved, {stats.dbFailed} failed
        </div>
      )}
    </div>
  );
};

export default ARQRCode;
