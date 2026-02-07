import React, { useState, useEffect, useRef, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text, Html } from "@react-three/drei";
import * as THREE from "three"; // Import THREE for DoubleSide
import morphPaymentService from "../services/morphPaymentService";
import solanaPaymentService from "../services/solanaPaymentService";
import { dynamicQRService } from "../services/dynamicQRService"; // Add dynamic QR service
import ccipConfigService from "../services/ccipConfigService"; // CCIP transaction building (default export)
import { hederaWalletService } from "../services/hederaWalletService";
import { ensService, ensServiceSepolia } from "../services/ensService"; // ENS resolution service
import ensPaymentService from "../services/ensPaymentService"; // ENS payment service
import * as revolutBankService from "../services/revolutBankService"; // Revolut Bank QR service
import * as revolutVirtualCardService from "../services/revolutVirtualCardService"; // Revolut Virtual Card service
import { supabase } from "../lib/supabase";
import QRCode from "react-qr-code";
import IntermediatePaymentModal from "./IntermediatePaymentModal"; // Transaction validation modal
import RevolutBankQRModal from "./RevolutBankQRModal"; // Revolut Bank QR modal
import { VirtualCardManager } from "./VirtualCardManager"; // NEW: Virtual Card Manager with card selector
import { usePaymentStatus } from "../hooks/usePaymentStatus"; // Real-time payment status hook
import {
  parsePaymentDataFromURL,
  getDynamicPaymentAmount,
  validatePaymentAmount,
  formatPaymentAmount,
  getPaymentConfigSummary,
} from "../utils/paymentUtils"; // Dynamic payment utilities

// AgentSphere Payment Configuration Reader
const getAgentPaymentConfig = async (agentId) => {
  try {
    console.log("🔍 Reading payment configuration for agent:", agentId);

    if (!supabase) {
      console.warn("⚠️ Supabase not configured, using default payment methods");
      return {
        enabledMethods: ["crypto_qr"],
        config: {},
      };
    }

    // Query AgentSphere database for payment configuration INCLUDING ENS fields
    const { data, error } = await supabase
      .from("deployed_objects")
      .select(
        "payment_methods, payment_config, agent_wallet_address, payment_recipient_address, fee_type, interaction_fee_amount, interaction_fee_token, ens_payment_enabled, ens_domain, ens_resolved_address, ens_resolver_network, ens_avatar_url",
      )
      .eq("id", agentId)
      .single();

    if (error) {
      console.warn(
        "⚠️ Failed to read payment config from AgentSphere:",
        error.message,
      );
      return {
        enabledMethods: ["crypto_qr"], // Fallback to crypto QR only
        config: {},
      };
    }

    if (!data) {
      console.warn("⚠️ No payment configuration found for agent");
      return {
        enabledMethods: ["crypto_qr"],
        config: {},
      };
    }

    console.log("✅ Payment configuration loaded:", data);

    // Determine recipient address (ENS or regular wallet)
    let recipientAddress =
      data.agent_wallet_address || data.payment_recipient_address;
    let ensInfo = null;

    // ENS Resolution if enabled
    if (data.ens_payment_enabled && data.ens_domain) {
      console.log("🌐 ENS payment enabled, resolving:", data.ens_domain);

      // Use cached address if available (from database)
      if (data.ens_resolved_address) {
        recipientAddress = data.ens_resolved_address;
        ensInfo = {
          domain: data.ens_domain,
          address: data.ens_resolved_address,
          network: data.ens_resolver_network || "mainnet",
          avatar: data.ens_avatar_url,
        };
        console.log("✅ Using cached ENS address:", recipientAddress);
      } else {
        // Resolve ENS domain dynamically
        const network = data.ens_resolver_network || "mainnet";
        const service = network === "mainnet" ? ensService : ensServiceSepolia;
        const result = await service.resolveENS(data.ens_domain);

        if (result.success) {
          recipientAddress = result.address;
          ensInfo = {
            domain: data.ens_domain,
            address: result.address,
            network: network,
          };
          console.log("✅ ENS resolved dynamically:", recipientAddress);
        } else {
          console.error("❌ ENS resolution failed:", result.error);
          // Fall back to regular wallet address
        }
      }
    }

    // Parse payment methods configuration
    const paymentMethods = data.payment_methods || {};
    const enabledMethods = [];

    // Check each payment method
    if (paymentMethods.crypto_qr?.enabled || !paymentMethods.crypto_qr) {
      enabledMethods.push("crypto_qr"); // Always enable crypto QR as fallback
    }

    if (
      paymentMethods.bank_virtual_card?.enabled ||
      paymentMethods.virtual_card?.enabled
    ) {
      enabledMethods.push("virtual_card");
    }

    if (paymentMethods.bank_qr?.enabled) {
      enabledMethods.push("bank_qr");
    }

    if (paymentMethods.voice_pay?.enabled) {
      enabledMethods.push("voice_pay");
    }

    if (paymentMethods.sound_pay?.enabled) {
      enabledMethods.push("sound_pay");
    }

    // ENS Payments - only show if configured in database
    if (data.ens_payment_enabled && data.ens_domain) {
      enabledMethods.push("ens_payments");
    }

    return {
      enabledMethods,
      config: {
        paymentMethods,
        paymentConfig: data.payment_config || {},
        walletAddress: recipientAddress, // Use ENS-resolved address
        recipientAddress: recipientAddress,
        ensInfo: ensInfo, // Include ENS info
        // Include raw ENS fields from database
        ens_payment_enabled: data.ens_payment_enabled,
        ens_domain: data.ens_domain,
        ens_resolved_address: data.ens_resolved_address,
        ens_resolver_network: data.ens_resolver_network,
        ens_avatar_url: data.ens_avatar_url,
      },
    };
  } catch (error) {
    console.error("❌ Error reading payment configuration:", error);
    return {
      enabledMethods: ["crypto_qr"], // Safe fallback
      config: {},
    };
  }
};

// 3D Cube Component with Interactive Faces
const PaymentCube = ({
  agent,
  onFaceSelected,
  handleFaceClick,
  actualEnabledMethods = ["crypto_qr"],
  cubeRef,
  isVisible = true,
  isInitializing = false,
}) => {
  console.log("🎮 PaymentCube RENDERING with:", {
    actualEnabledMethods,
    isInitializing,
    handleFaceClickExists: !!handleFaceClick,
  });

  const meshRef = useRef();
  const [hoveredFace, setHoveredFace] = useState(null);
  const [selectedFace, setSelectedFace] = useState(0);
  const [isRotating, setIsRotating] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [rotationVelocity, setRotationVelocity] = useState({ x: 0, y: 0 });
  const { camera, viewport, gl } = useThree();

  // Payment method configuration - Unified green shiny metallic cube
  const paymentMethods = {
    crypto_qr: {
      icon: "�", // QR code icon
      text: "Crypto QR",
      color: "#00ff66", // Unified green for all faces
      description: "Tap to Scan",
    },
    virtual_card: {
      icon: "💳", // Card icon
      text: "Virtual Card",
      color: "#00ff66", // Unified green for all faces
      description: "Tap to Pay",
    },
    bank_qr: {
      icon: "", // No icon
      text: "Bank QR",
      color: "#00ff66", // Unified green for all faces
      description: "Tap to Scan",
    },
    voice_pay: {
      icon: "🎤", // Microphone icon
      text: "Voice Pay",
      color: "#00ff66", // Unified green for all faces
      description: "Tap to Speak",
    },
    sound_pay: {
      icon: "🎵", // Audio waves icon
      text: "Sound Pay",
      color: "#00ff66", // Unified green for all faces
      description: "Tap to Pay",
    },
    ens_payments: {
      icon: "🌐", // Globe icon for ENS
      text: "ENS Payments",
      color: "#5298ff", // ENS blue
      description: "Tap to Pay",
    },
  };

  // Get enabled payment methods
  const enabledFaces = Object.keys(paymentMethods).filter((method) =>
    actualEnabledMethods.includes(method),
  );

  // Debug logging for BTC payments visibility
  React.useEffect(() => {
    console.log("🔍 Cube Debug - actualEnabledMethods:", actualEnabledMethods);
    console.log("🔍 Cube Debug - enabledFaces:", enabledFaces);
    console.log(
      "🔍 Cube Debug - paymentMethods keys:",
      Object.keys(paymentMethods),
    );
    console.log(
      "🔍 Cube Debug - ENS payments included:",
      enabledFaces.includes("ens_payments"),
    );
    console.log(
      "🔍 Cube Debug - Number of faces to render:",
      enabledFaces.length,
    );
  }, [actualEnabledMethods, enabledFaces]);

  // Add immediate logging on every render
  console.log("🖼️ Rendering cube with methods:", actualEnabledMethods);
  console.log("🖼️ Enabled faces for rendering:", enabledFaces);

  // Calculate which face is most visible to camera
  const getFrontFace = () => {
    if (!meshRef.current) return 0;

    const rotation = meshRef.current.rotation;
    const normalizedY =
      ((rotation.y % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const faceIndex = Math.round(normalizedY / (Math.PI / 3)) % 6;
    return Math.max(0, Math.min(enabledFaces.length - 1, faceIndex));
  };

  // Enhanced auto-rotation and pulsing animation
  useFrame((state, delta) => {
    if (meshRef.current) {
      if (isRotating && !isDragging) {
        // Gentle auto-rotation with slight variation
        meshRef.current.rotation.y += delta * 0.25;
        meshRef.current.rotation.x += delta * 0.08;

        // Add subtle pulsing scale effect
        const time = state.clock.getElapsedTime();
        const scale = 1 + Math.sin(time * 2) * 0.02;
        meshRef.current.scale.setScalar(scale);
      } else if (
        !isDragging &&
        (Math.abs(rotationVelocity.x) > 0.01 ||
          Math.abs(rotationVelocity.y) > 0.01)
      ) {
        // Apply momentum after drag
        meshRef.current.rotation.y += rotationVelocity.y * delta * 2;
        meshRef.current.rotation.x += rotationVelocity.x * delta * 2;

        // Decay velocity
        setRotationVelocity({
          x: rotationVelocity.x * 0.95,
          y: rotationVelocity.y * 0.95,
        });
      }

      // Always apply subtle floating animation
      if (!isDragging) {
        const time = state.clock.getElapsedTime();
        meshRef.current.position.y = Math.sin(time * 1.5) * 0.1;
      }
    }
  });

  // Handle cube click - select front-facing payment method
  const handleCubeClick = (event) => {
    event.stopPropagation();

    // Prevent clicks during initialization or dragging
    if (isInitializing) {
      console.log("⏳ Cube initializing, ignoring cube click");
      return;
    }

    if (isDragging) return; // Don't select if we're dragging

    const frontFaceIndex = getFrontFace();
    const activeFace = enabledFaces[frontFaceIndex];

    console.log(
      "🎯 Cube clicked! Active face:",
      activeFace,
      "Index:",
      frontFaceIndex,
    );

    setSelectedFace(frontFaceIndex);
    setIsRotating(false);

    // Dispatch events for CubePaymentHandler
    if (activeFace) {
      switch (activeFace) {
        case "crypto_qr":
          console.log("📱 Dispatching crypto-qr-selected event");
          document.dispatchEvent(
            new CustomEvent("crypto-qr-selected", {
              detail: {
                method: "crypto_qr",
                agent: agent,
                face: activeFace,
                config: paymentMethods[activeFace],
              },
            }),
          );
          break;

        case "virtual_card":
          console.log("💳 Dispatching virtual-card-selected event");
          document.dispatchEvent(
            new CustomEvent("virtual-card-selected", {
              detail: {
                method: "virtual_card",
                agent: agent,
                face: activeFace,
                config: paymentMethods[activeFace],
              },
            }),
          );
          break;

        case "bank_qr":
          console.log("🔲 Dispatching bank-qr-selected event");
          document.dispatchEvent(
            new CustomEvent("bank-qr-selected", {
              detail: {
                method: "bank_qr",
                agent: agent,
                face: activeFace,
                config: paymentMethods[activeFace],
              },
            }),
          );
          break;

        case "voice_pay":
          console.log("🎤 Dispatching voice-pay-selected event");
          document.dispatchEvent(
            new CustomEvent("voice-pay-selected", {
              detail: {
                method: "voice_pay",
                agent: agent,
                face: activeFace,
                config: paymentMethods[activeFace],
              },
            }),
          );
          break;

        case "sound_pay":
          console.log("🎵 Dispatching sound-pay-selected event");
          document.dispatchEvent(
            new CustomEvent("sound-pay-selected", {
              detail: {
                method: "sound_pay",
                agent: agent,
                face: activeFace,
                config: paymentMethods[activeFace],
              },
            }),
          );
          break;

        case "ens_payments":
          console.log("🌐 Dispatching ens-payments-selected event");
          document.dispatchEvent(
            new CustomEvent("ens-payments-selected", {
              detail: {
                method: "ens_payments",
                agent: agent,
                face: activeFace,
                config: paymentMethods[activeFace],
              },
            }),
          );
          break;

        default:
          console.log("❓ Unknown payment method:", activeFace);
      }
    }

    // Call existing onFaceSelected callback for backward compatibility
    if (onFaceSelected && activeFace) {
      onFaceSelected(activeFace, paymentMethods[activeFace]);
    }
  };

  // Enhanced mouse controls with useCallback to prevent re-creation
  const handlePointerDown = useCallback(
    (event) => {
      setIsDragging(true);
      setIsRotating(false);
      setLastMousePos({ x: event.clientX, y: event.clientY });
      gl.domElement.style.cursor = "grabbing";
    },
    [gl],
  );

  const handlePointerMove = useCallback(
    (event) => {
      if (!isDragging) return;

      const deltaX = event.clientX - lastMousePos.x;
      const deltaY = event.clientY - lastMousePos.y;

      // Apply rotation
      if (meshRef.current) {
        meshRef.current.rotation.y += deltaX * 0.01;
        meshRef.current.rotation.x += deltaY * 0.01;

        // Allow full 360-degree rotation on both axes to access all 6 faces
        // No rotation limits - full freedom to view top and bottom faces
      }

      // Store velocity for momentum
      setRotationVelocity({
        x: deltaY * 0.01,
        y: deltaX * 0.01,
      });

      setLastMousePos({ x: event.clientX, y: event.clientY });
    },
    [isDragging, lastMousePos],
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    gl.domElement.style.cursor = "grab";

    // Resume auto-rotation after a delay
    setTimeout(() => {
      setIsRotating(true);
    }, 3000);
  }, [gl]);

  // Touch controls for mobile with useCallback
  const handleTouchStart = useCallback((event) => {
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      setIsDragging(true);
      setIsRotating(false);
      setLastMousePos({ x: touch.clientX, y: touch.clientY });
    }
  }, []);

  const handleTouchMove = useCallback(
    (event) => {
      if (!isDragging || event.touches.length !== 1) return;

      event.preventDefault();
      const touch = event.touches[0];
      const deltaX = touch.clientX - lastMousePos.x;
      const deltaY = touch.clientY - lastMousePos.y;

      if (meshRef.current) {
        meshRef.current.rotation.y += deltaX * 0.008;
        meshRef.current.rotation.x += deltaY * 0.008;

        // Allow full 360-degree rotation on both axes to access all 6 faces
        // No rotation limits - full freedom to view top and bottom faces
      }

      setRotationVelocity({
        x: deltaY * 0.008,
        y: deltaX * 0.008,
      });

      setLastMousePos({ x: touch.clientX, y: touch.clientY });
    },
    [isDragging, lastMousePos],
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setTimeout(() => {
      setIsRotating(true);
    }, 3000);
  }, []);

  // Add global event listeners for drag
  useEffect(() => {
    const canvas = gl.domElement;

    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd);

    canvas.style.cursor = "grab";

    return () => {
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
      canvas.style.cursor = "default";
    };
  }, [gl, handlePointerMove, handlePointerUp, handleTouchMove, handleTouchEnd]);

  if (!isVisible) return null;

  return (
    <group>
      {/* Main Payment Cube */}
      <mesh
        ref={meshRef}
        position={[0, 0, -3]}
        onClick={handleCubeClick}
        onPointerDown={handlePointerDown}
        onTouchStart={handleTouchStart}
        onPointerOver={() => {
          setHoveredFace(true);
          gl.domElement.style.cursor = "grab";
        }}
        onPointerOut={() => {
          setHoveredFace(false);
          if (!isDragging) gl.domElement.style.cursor = "default";
        }}
      >
        <boxGeometry args={[2.5, 2.5, 2.5]} />
        <meshStandardMaterial
          color={hoveredFace ? "#00ff88" : "#22ff44"}
          transparent
          opacity={0.95}
          emissive={hoveredFace ? "#00aa44" : "#004422"}
          emissiveIntensity={hoveredFace ? 1.2 : 0.9}
          roughness={0.05}
          metalness={0.7}
          envMapIntensity={1.5}
        />

        {/* Face Textures - Create faces with payment methods using Text */}
        {enabledFaces.map((method, index) => {
          const config = paymentMethods[method];
          const faceIndex = index % 6;

          const facePositions = [
            [1.24, 0, 0], // Right face
            [-1.24, 0, 0], // Left face
            [0, 1.24, 0], // Top face
            [0, -1.24, 0], // Bottom face
            [0, 0, 1.24], // Front face
            [0, 0, -1.24], // Back face
          ];

          const faceRotations = [
            [0, Math.PI / 2, 0], // Right
            [0, -Math.PI / 2, 0], // Left
            [-Math.PI / 2, 0, 0], // Top
            [Math.PI / 2, 0, 0], // Bottom
            [0, 0, 0], // Front
            [0, Math.PI, 0], // Back
          ];

          // Text positions - slightly offset from face to float in front
          const textOffsets = [
            [0.1, 0, 0], // Right face - offset in +X
            [-0.1, 0, 0], // Left face - offset in -X
            [0, 0.1, 0], // Top face - offset in +Y
            [0, -0.1, 0], // Bottom face - offset in -Y
            [0, 0, 0.1], // Front face - offset in +Z
            [0, 0, -0.1], // Back face - offset in -Z
          ];

          const basePosition = facePositions[faceIndex];
          const textOffset = textOffsets[faceIndex];
          const textPosition = [
            basePosition[0] + textOffset[0],
            basePosition[1] + textOffset[1],
            basePosition[2] + textOffset[2],
          ];
          const isActiveFace = getFrontFace() === index;

          return (
            <group key={`face-${method}`}>
              {/* 3D Extruded Button - sticks out from cube face */}
              <mesh
                position={[
                  facePositions[faceIndex][0] + textOffsets[faceIndex][0] * 2,
                  facePositions[faceIndex][1] + textOffsets[faceIndex][1] * 2,
                  facePositions[faceIndex][2] + textOffsets[faceIndex][2] * 2,
                ]}
                rotation={faceRotations[faceIndex]}
                onClick={(e) => {
                  e.stopPropagation();
                  console.log(`🔥 3D Face button clicked: ${method}`);
                  handleFaceClick(method, faceIndex);
                }}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  setHoveredFace(true);
                  gl.domElement.style.cursor = "pointer";
                }}
                onPointerOut={(e) => {
                  e.stopPropagation();
                  setHoveredFace(false);
                  gl.domElement.style.cursor = "grab";
                }}
              >
                <boxGeometry args={[2.4, 2.4, 0.15]} />
                <meshStandardMaterial
                  color={config.color}
                  transparent
                  opacity={0.3}
                  emissive={isActiveFace ? "#003300" : "#001100"}
                  emissiveIntensity={0.3}
                  roughness={0.3}
                  metalness={0.1}
                />
              </mesh>

              {/* Icon text with outline/shadow for visibility */}
              <Text
                position={[
                  facePositions[faceIndex][0] + textOffsets[faceIndex][0] * 2.2,
                  facePositions[faceIndex][1] +
                    textOffsets[faceIndex][1] * 2.2 +
                    0.4,
                  facePositions[faceIndex][2] +
                    textOffsets[faceIndex][2] * 2.2 +
                    0.02,
                ]}
                rotation={faceRotations[faceIndex]}
                fontSize={0.6}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
                fontWeight="bold"
                outlineWidth={0.05}
                outlineColor="#000000"
              >
                {config.icon}
              </Text>

              {/* Method name with outline for visibility */}
              {config.text.length > 15 ? (
                // Multi-line text for long payment method names
                <>
                  <Text
                    position={[
                      textPosition[0],
                      textPosition[1] + 0.2,
                      textPosition[2] + 0.02,
                    ]}
                    rotation={faceRotations[faceIndex]}
                    fontSize={0.22}
                    color="#ffffff"
                    anchorX="center"
                    anchorY="middle"
                    fontWeight="bold"
                    outlineWidth={0.08}
                    outlineColor="#000000"
                  >
                    {config.text.split(" ")[0]}
                  </Text>
                  <Text
                    position={[
                      textPosition[0],
                      textPosition[1] - 0.1,
                      textPosition[2] + 0.02,
                    ]}
                    rotation={faceRotations[faceIndex]}
                    fontSize={0.22}
                    color="#ffffff"
                    anchorX="center"
                    anchorY="middle"
                    fontWeight="bold"
                    outlineWidth={0.08}
                    outlineColor="#000000"
                  >
                    {config.text.split(" ").slice(1).join(" ")}
                  </Text>
                </>
              ) : (
                // Single line text for short payment method names
                <Text
                  position={[
                    textPosition[0],
                    textPosition[1] + 0.05,
                    textPosition[2] + 0.02,
                  ]}
                  rotation={faceRotations[faceIndex]}
                  fontSize={0.28}
                  color="#ffffff"
                  anchorX="center"
                  anchorY="middle"
                  fontWeight="bold"
                  outlineWidth={0.08}
                  outlineColor="#000000"
                >
                  {config.text}
                </Text>
              )}
            </group>
          );
        })}
      </mesh>

      {/* Amount Display - moved further down to avoid overlaying cube */}
    </group>
  );
};

// QR Code Display Component (replaces cube when crypto QR is selected)
const ARQRDisplay = ({
  qrData,
  onBack,
  agent,
  position = [0, 0, -3],
  transactionHash,
  paymentAmount,
  urlPaymentData,
  onPaymentComplete,
  ensPaymentInfo, // ENS payment details
  selectedMethod, // Payment method type
}) => {
  const [selectedNetwork, setSelectedNetwork] = useState("11155111"); // Default to Ethereum Sepolia
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [currentQRData, setCurrentQRData] = useState(qrData);
  const [walletBalance, setWalletBalance] = useState(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  // CCIP Cross-Chain State
  const [userNetwork, setUserNetwork] = useState(null);
  const [agentNetwork, setAgentNetwork] = useState(null);
  const [crossChainOptions, setCrossChainOptions] = useState([]);
  const [showCrossChainUI, setShowCrossChainUI] = useState(false);
  const [crossChainFeeEstimate, setCrossChainFeeEstimate] = useState(null);
  const [paymentMode, setPaymentMode] = useState("same-chain"); // 'same-chain', 'cross-chain', 'switch-network'

  // Update currentQRData when qrData prop changes (for Hedera transactions)
  useEffect(() => {
    if (qrData) {
      setCurrentQRData(qrData);
    }
  }, [qrData]);

  // Network configuration for dropdown
  const supportedNetworks = {
    1: { name: "Ethereum Mainnet", color: "#627EEA", symbol: "ETH" }, // ENS Mainnet
    11155111: { name: "Ethereum Sepolia", color: "#627EEA", symbol: "USDC" },
    421614: { name: "Arbitrum Sepolia", color: "#28A0F0", symbol: "USDC" },
    84532: { name: "Base Sepolia", color: "#0052FF", symbol: "USDC" },
    11155420: { name: "OP Sepolia", color: "#FF0420", symbol: "USDC" },
    43113: { name: "Avalanche Fuji", color: "#E84142", symbol: "USDC" },
    80002: { name: "Polygon Amoy", color: "#8247E5", symbol: "USDC" },
    296: { name: "Hedera Testnet", color: "#00D4AA", symbol: "USDh" },
    "solana-devnet": {
      name: "Solana Devnet",
      color: "#9945FF",
      symbol: "USDC",
    },
    "ens-mainnet": { name: "ENS (Mainnet)", color: "#5298ff", symbol: "ETH" },
    "ens-sepolia": { name: "ENS (Sepolia)", color: "#5298ff", symbol: "ETH" },
  };

  // Initialize network based on agent deployment and detect cross-chain needs
  useEffect(() => {
    const initializeNetworkAndCrossChain = async () => {
      if (!agent) return;

      let detectedNetwork = "11155111"; // Default fallback

      // Debug: Log agent data
      console.log("🔍 Agent data for network detection:", agent);

      // Network detection logic based on agent name or properties
      const agentName = (agent.name || "").toLowerCase();
      console.log("🔍 Agent name for detection:", agentName);

      if (agentName.includes("amoy") || agentName.includes("polygon")) {
        detectedNetwork = "80002"; // Polygon Amoy
        console.log("🌐 Detected Polygon Amoy network for agent:", agent.name);
      } else if (agentName.includes("arbitrum")) {
        detectedNetwork = "421614"; // Arbitrum Sepolia
      } else if (agentName.includes("base")) {
        detectedNetwork = "84532"; // Base Sepolia
      } else if (agentName.includes("optimism") || agentName.includes("op")) {
        detectedNetwork = "11155420"; // OP Sepolia
      } else if (
        agentName.includes("avalanche") ||
        agentName.includes("fuji")
      ) {
        detectedNetwork = "43113"; // Avalanche Fuji
      } else if (agentName.includes("hedera")) {
        detectedNetwork = "296"; // Hedera Testnet
        console.log(
          "🌐 Detected Hedera Testnet network for agent:",
          agent.name,
        );
      } else if (agentName.includes("solana")) {
        detectedNetwork = "solana-devnet"; // Solana Devnet
      } else if (agent.ens_payment_enabled && agent.ens_resolver_network) {
        // ENS payment detection
        detectedNetwork =
          agent.ens_resolver_network === "mainnet"
            ? "ens-mainnet"
            : "ens-sepolia";
        console.log(
          "🌐 Detected ENS payment network for agent:",
          agent.name,
          "Network:",
          detectedNetwork,
        );
      }

      // 🔧 CRITICAL: Check deployment_chain_id but OVERRIDE if network name contradicts it
      // This handles agents with wrong deployment_chain_id in database
      if (agent.deployment_chain_id) {
        const deploymentChainId = String(agent.deployment_chain_id);

        // ⚠️ VALIDATION: If network name says "Hedera" but deployment_chain_id is NOT 296, override it!
        const networkName = (
          agent.deployment_network_name ||
          agent.network ||
          ""
        ).toLowerCase();
        const isHederaByName = networkName.includes("hedera");
        const isPolygonByName =
          networkName.includes("polygon") || networkName.includes("amoy");
        const isSolanaByName = networkName.includes("solana");

        if (isHederaByName && deploymentChainId !== "296") {
          console.warn(
            `⚠️ Agent has deployment_chain_id=${deploymentChainId} but network name="${agent.deployment_network_name}" - OVERRIDING to 296`,
          );
          detectedNetwork = "296";
        } else if (isPolygonByName && deploymentChainId !== "80002") {
          console.warn(
            `⚠️ Agent has deployment_chain_id=${deploymentChainId} but network name="${agent.deployment_network_name}" - OVERRIDING to 80002`,
          );
          detectedNetwork = "80002";
        } else if (isSolanaByName) {
          console.warn(
            `⚠️ Agent has deployment_chain_id=${deploymentChainId} but network name="${agent.deployment_network_name}" - OVERRIDING to solana-devnet`,
          );
          detectedNetwork = "solana-devnet";
        } else if (supportedNetworks[deploymentChainId]) {
          detectedNetwork = deploymentChainId;
          console.log(
            "🌐 Using agent's deployment_chain_id (authoritative):",
            deploymentChainId,
          );
        }
      } else if (
        agent.chain_id &&
        !agentName.includes("hedera") &&
        !agentName.includes("polygon") &&
        !agentName.includes("solana")
      ) {
        // Only use chain_id if no deployment_chain_id AND name didn't detect specific network
        const chainId = String(agent.chain_id);
        if (supportedNetworks[chainId]) {
          detectedNetwork = chainId;
          console.log("🌐 Using agent's chain_id for network:", chainId);
        }
      }

      setAgentNetwork(detectedNetwork);

      // Detect user's current network
      let currentUserNetwork = null;
      try {
        if (typeof window !== "undefined" && window.ethereum) {
          const chainId = await window.ethereum.request({
            method: "eth_chainId",
          });
          currentUserNetwork = parseInt(chainId, 16).toString();
          console.log("🌐 Detected user network:", currentUserNetwork);
        }
      } catch (error) {
        console.warn("⚠️ Could not detect user network:", error);
      }

      setUserNetwork(currentUserNetwork);

      // Check if agent is on Solana - skip cross-chain detection for Solana
      const agentIsSolana =
        agent?.network === "Solana Devnet" ||
        agent?.deployment_network_name === "Solana Devnet" ||
        agent?.chain_id === "devnet" ||
        agent?.chain_id === "solana-devnet" ||
        (typeof agent?.chain_id === "string" &&
          agent?.chain_id.toLowerCase().includes("solana"));

      const isSolanaWallet =
        typeof window !== "undefined" && window.solana?.isConnected;

      console.log("🔍 Agent/Wallet Detection in init:", {
        agentIsSolana,
        isSolanaWallet,
        agentNetwork: agent?.network,
        agentChainId: agent?.chain_id,
      });

      // Skip cross-chain logic entirely for Solana
      if (agentIsSolana || isSolanaWallet) {
        console.log("🌟 Solana detected → Skipping EVM cross-chain logic");
        setShowCrossChainUI(false);
        setPaymentMode("same-chain");
      } else if (currentUserNetwork && dynamicQRService.getCCIPService) {
        // Check for cross-chain opportunities (EVM only)
        try {
          const ccipService = dynamicQRService.getCCIPService();
          const crossChainDetection =
            await dynamicQRService.detectCrossChainNeed(
              agent,
              currentUserNetwork,
            );

          console.log("🌉 Cross-chain detection result:", crossChainDetection);

          if (crossChainDetection.needsCrossChain) {
            setShowCrossChainUI(true);
            const paymentOptions = dynamicQRService.getAvailablePaymentOptions(
              agent,
              currentUserNetwork,
            );
            setCrossChainOptions(paymentOptions.options || []);
            console.log("💳 Available payment options:", paymentOptions);

            // Set default payment mode
            if (crossChainDetection.supportedRoute) {
              setPaymentMode("cross-chain");
            } else {
              setPaymentMode("switch-network");
            }
          } else {
            setShowCrossChainUI(false);
            setPaymentMode("same-chain");
          }
        } catch (error) {
          console.error("❌ Cross-chain detection failed:", error);
          setShowCrossChainUI(false);
        }
      }

      // Update selected network if different from current
      console.log(
        `🔍 Current network: ${selectedNetwork}, Detected: ${detectedNetwork}`,
      );
      if (detectedNetwork !== selectedNetwork) {
        console.log(
          `🔄 Auto-switching from ${supportedNetworks[selectedNetwork]?.name} to ${supportedNetworks[detectedNetwork]?.name}`,
        );
        setSelectedNetwork(detectedNetwork);
      }
    };

    initializeNetworkAndCrossChain();
  }, [agent]); // Removed selectedNetwork dependency to prevent infinite loop

  // Load wallet balance when network changes
  useEffect(() => {
    const loadBalance = async () => {
      setIsLoadingBalance(true);
      try {
        // For cross-chain payments, use user's current network for balance check
        const networkForBalance = showCrossChainUI
          ? userNetwork
          : selectedNetwork;
        console.log(
          `💰 Loading balance for network: ${networkForBalance} (cross-chain: ${showCrossChainUI})`,
        );

        const balance = await dynamicQRService.getCurrentWalletBalance(
          networkForBalance,
        );
        setWalletBalance(balance);
      } catch (error) {
        console.error("Balance load error:", error);
        setWalletBalance(null);
      } finally {
        setIsLoadingBalance(false);
      }
    };

    loadBalance();
  }, [selectedNetwork, showCrossChainUI, userNetwork]);

  // Handle network change
  const handleNetworkChange = async (newNetwork) => {
    setSelectedNetwork(newNetwork);
    setIsGeneratingQR(true);

    try {
      console.log(`🔄 Switching to ${supportedNetworks[newNetwork].name}...`);

      // Generate new QR for selected network
      const result = await dynamicQRService.generateDynamicQR(
        { ...agent, preferred_network: newNetwork },
        agent?.interaction_fee_amount || "1.00",
      );

      if (result.success) {
        setCurrentQRData(result.eip681URI || result.qrData);
        console.log(
          `✅ QR generated for ${supportedNetworks[newNetwork].name}`,
        );
      } else {
        console.error("❌ QR generation failed:", result.error);
        alert(
          `Failed to generate QR for ${supportedNetworks[newNetwork].name}: ${result.error}`,
        );
      }
    } catch (error) {
      console.error("❌ Network switch error:", error);
      alert(
        `Error switching to ${supportedNetworks[newNetwork].name}: ${error.message}`,
      );
    } finally {
      setIsGeneratingQR(false);
    }
  };

  // CCIP Cross-Chain Payment Mode Handlers
  const handlePaymentModeChange = async (newMode) => {
    setPaymentMode(newMode);
    setIsGeneratingQR(true);

    try {
      console.log(`🌉 Switching to payment mode: ${newMode}`);

      switch (newMode) {
        case "same-chain":
          await handleSameChainMode();
          break;
        case "cross-chain":
          await handleCrossChainMode();
          break;
        case "switch-network":
          await handleNetworkSwitchMode();
          break;
        default:
          throw new Error(`Unknown payment mode: ${newMode}`);
      }
    } catch (error) {
      console.error(`❌ Payment mode switch error:`, error);
      alert(`Error switching to ${newMode} mode: ${error.message}`);
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const handleSameChainMode = async () => {
    console.log("📱 Generating same-chain payment QR");
    const result = await dynamicQRService.generateDynamicQR(
      agent,
      agent?.interaction_fee_amount || "1.00",
    );

    if (result.success) {
      setCurrentQRData(result.eip681URI || result.qrData);
      setCrossChainFeeEstimate(null);
      console.log("✅ Same-chain QR generated");
    } else {
      throw new Error(result.error);
    }
  };

  const handleNetworkSwitchMode = async () => {
    console.log("🔄 Suggesting network switch to agent network");
    // This mode just shows a message to switch networks
    // The actual QR will be generated once user switches
    setCurrentQRData(null);
    setCrossChainFeeEstimate(null);
  };

  const handleCrossChainFeeEstimate = async () => {
    if (!userNetwork || !agentNetwork || !dynamicQRService.getCCIPService) {
      return;
    }

    try {
      const ccipService = dynamicQRService.getCCIPService();
      const feeEstimate = await ccipService.estimateCCIPFees(
        userNetwork,
        agentNetwork,
        agent?.interaction_fee_amount || "1.00",
        agent.agent_wallet_address || agent.payment_recipient_address,
        "native",
      );

      if (feeEstimate.success) {
        setCrossChainFeeEstimate(feeEstimate.estimatedFee);
      }
    } catch (error) {
      console.error("❌ Fee estimation failed:", error);
    }
  };

  const handleQRClick = async () => {
    console.log("🔥 QR Code clicked! Triggering transaction...");

    try {
      // Handle ENS payments
      if (selectedMethod === "ens_payments" && ensPaymentInfo) {
        console.log("🌐 Handling ENS payment:", ensPaymentInfo);

        const paymentResult = await ensPaymentService.sendENSPayment({
          ...ensPaymentInfo,
          networkKey:
            ensPaymentInfo.network === "Ethereum Mainnet"
              ? "mainnet"
              : "sepolia",
        });

        if (paymentResult.success) {
          console.log("✅ ENS payment successful:", paymentResult.txHash);
          alert(
            `🎉 ENS Payment Sent Successfully!\n\n` +
              `🌐 ENS Domain: ${
                ensPaymentInfo.domain || paymentResult.ensDomain
              }\n` +
              `💳 Resolved Address: ${paymentResult.resolvedAddress.slice(
                0,
                10,
              )}...${paymentResult.resolvedAddress.slice(-8)}\n` +
              `💰 Amount: ${paymentResult.amount} ${
                paymentResult.token || ensPaymentInfo.token || "USDC"
              }\n` +
              `🔗 Transaction Hash:\n${paymentResult.txHash}\n\n` +
              `Network: ${paymentResult.network}\n\n` +
              `You can view this transaction on the blockchain explorer.`,
          );

          if (onPaymentComplete) {
            onPaymentComplete(agent, {
              success: true,
              transactionHash: paymentResult.txHash,
              network: paymentResult.network,
              method: "ens_payments",
              amount: paymentResult.amount,
              ensDomain: paymentResult.ensDomain,
            });
          }
        } else {
          throw new Error("ENS payment failed");
        }
        return;
      }

      // Check if this is a cross-chain transaction
      if (
        paymentMode === "cross-chain" &&
        currentQRData?.type === "ccip-cross-chain"
      ) {
        console.log("🌉 Handling cross-chain CCIP transaction");

        const transactionResult =
          await dynamicQRService.handleCrossChainQRClick(currentQRData);

        if (transactionResult.success) {
          console.log(
            "✅ Cross-chain transaction successful:",
            transactionResult.transactionHash,
          );
          alert(
            `✅ Cross-chain payment initiated!\n\n` +
              `Transaction: ${transactionResult.transactionHash}\n` +
              `From: ${transactionResult.sourceChain}\n` +
              `To: ${transactionResult.destinationChain}\n\n` +
              `The transaction will be processed across chains. Please check the destination network for completion.`,
          );
        } else {
          throw new Error(transactionResult.error);
        }
        return;
      }

      // For switch-network mode, show instructions
      if (paymentMode === "switch-network") {
        alert(
          `🔄 Network Switch Required\n\n` +
            `Please switch your wallet to ${supportedNetworks[agentNetwork]?.name} ` +
            `to complete this payment.\n\n` +
            `Once switched, the QR code will be generated automatically.`,
        );
        return;
      }

      // Continue with existing Phase 1 logic for same-chain transactions
      let transactionData;

      if (
        typeof currentQRData === "string" &&
        currentQRData.startsWith("data:image")
      ) {
        // Data URL format - regenerate transaction data
        console.log(
          "📱 QR data URL detected, regenerating transaction data...",
        );
        const qrResult = await dynamicQRService.generateDynamicQR(
          agent,
          paymentAmount || 1,
        );
        if (!qrResult.success) {
          throw new Error(qrResult.error);
        }
        transactionData = qrResult.transactionData;
      } else if (typeof currentQRData === "string") {
        // Legacy string format
        transactionData = {
          to: agent.agent_wallet_address || agent.payment_recipient_address,
          value: "0",
          data: "0x",
          amount: paymentAmount
            ? paymentAmount.toString()
            : agent.interaction_fee_amount || "1.00",
          token: agent.interaction_fee_token || "USDC",
          chainId: selectedNetwork,
        };
      } else {
        // Already parsed transaction data
        transactionData = currentQRData;
      }

      // 🌟 CRITICAL FIX: Override chainId for Solana agents
      const agentIsSolana =
        agent?.network === "Solana Devnet" ||
        agent?.deployment_network_name === "Solana Devnet" ||
        (typeof agent?.chain_id === "string" &&
          agent?.chain_id.toLowerCase().includes("solana"));

      if (agentIsSolana && transactionData) {
        console.log("🔧 Overriding chainId for Solana agent");
        transactionData.chainId = "devnet";
        transactionData.chainType = "SVM";
      }

      console.log("📤 Transaction data:", transactionData);

      // Use the click handler from dynamic service
      const transactionResult = await dynamicQRService.handleQRClick(
        { ...agent, preferred_network: selectedNetwork },
        transactionData,
      );

      if (transactionResult.success) {
        console.log(
          "✅ Transaction successful:",
          transactionResult.transactionHash,
        );
        alert(
          `🎉 Payment Sent Successfully!\n\n💳 Transaction Hash:\n${transactionResult.transactionHash}\n\n🔗 Network: ${supportedNetworks[selectedNetwork].name}\n\nYou can view this transaction on the blockchain explorer.`,
        );

        // Refresh balance after successful transaction
        setTimeout(async () => {
          const newBalance = await dynamicQRService.getCurrentWalletBalance(
            selectedNetwork,
          );
          setWalletBalance(newBalance);
        }, 2000);

        // Call onPaymentComplete to return to modal with unlocked interactions
        if (onPaymentComplete) {
          onPaymentComplete(agent, {
            success: true,
            transactionHash: transactionResult.transactionHash,
            network: supportedNetworks[selectedNetwork].name,
            method: "crypto_qr",
            amount: transactionData.amount || paymentAmount,
          });
        }
      } else {
        console.error("❌ Transaction failed:", transactionResult.error);
        alert(
          `❌ Transaction Failed:\n${transactionResult.error}\n\nPlease check your wallet connection and try again.`,
        );
      }
    } catch (error) {
      console.error("❌ QR click error:", error);
      alert(
        `⚠️ Payment Error:\n${error.message}\n\nPlease ensure your wallet is installed and connected.`,
      );
    }
  };

  // Determine QR display value
  const qrDisplayValue = (() => {
    if (!currentQRData) return "https://example.com"; // Fallback to valid URL instead of empty string

    // Handle cross-chain CCIP QR data
    if (
      typeof currentQRData === "object" &&
      currentQRData.type === "ccip-cross-chain"
    ) {
      return currentQRData.uri || JSON.stringify(currentQRData);
    }

    // Handle data URL images
    if (
      typeof currentQRData === "string" &&
      currentQRData.startsWith("data:image")
    ) {
      return currentQRData;
    }

    // Handle string URIs
    if (typeof currentQRData === "string") {
      return currentQRData;
    }

    // Fallback to JSON representation
    return JSON.stringify(currentQRData);
  })();

  return (
    <group>
      {/* QR Code Background Plane */}
      <mesh position={position}>
        <planeGeometry args={[4.5, 4.5]} />
        <meshStandardMaterial
          color="white"
          transparent
          opacity={0.95}
          emissive="#ffffff"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Network Selection & QR Code - ARTM Metallic Style */}
      <Html
        position={position}
        center
        distanceFactor={10}
        style={{
          transform: "translate(-50%, -50%)",
          pointerEvents: "auto",
        }}
      >
        {/* Outer metallic ATM body */}
        <div
          style={{
            background:
              "linear-gradient(170deg, #3a3a3a 0%, #1a1a1a 40%, #0d0d0d 100%)",
            borderRadius: "18px",
            padding: "14px",
            width: "440px",
            boxShadow:
              "0 30px 80px rgba(0,0,0,0.6), " +
              "0 0 0 1px rgba(255,255,255,0.08), " +
              "inset 0 1px 0 rgba(255,255,255,0.12), " +
              "inset 0 -2px 0 rgba(0,0,0,0.4)",
            position: "relative",
          }}
        >
          {/* Top bezel — brand strip + LED */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "6px 10px 10px",
            }}
          >
            <span
              style={{
                color: "rgba(255,255,255,0.35)",
                fontSize: "10px",
                fontWeight: "700",
                letterSpacing: "3px",
                textTransform: "uppercase",
              }}
            >
              {selectedMethod === "ens_payments"
                ? "ENS PAYMENT"
                : "CRYPTO PAYMENT"}
            </span>
            {/* LED indicator */}
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor:
                  selectedMethod === "ens_payments" ? "#5298ff" : "#00ff66",
                boxShadow:
                  selectedMethod === "ens_payments"
                    ? "0 0 6px #5298ff"
                    : "0 0 6px #00ff66",
                animation: "ledPulse 2s ease-in-out infinite",
              }}
            />
          </div>

          {/* Inner screen area */}
          <div
            style={{
              background: "linear-gradient(180deg, #f5f5f7 0%, #e8e8ec 100%)",
              borderRadius: "10px",
              padding: "24px 20px",
              position: "relative",
              overflow: "hidden",
              maxHeight: "75vh",
              overflowY: "auto",
              // Recessed screen bevel
              boxShadow:
                "inset 0 2px 8px rgba(0,0,0,0.25), " +
                "inset 0 0 0 1px rgba(0,0,0,0.15), " +
                "0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            {/* Screen gloss / reflection overlay */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "40%",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 100%)",
                pointerEvents: "none",
                borderRadius: "10px 10px 0 0",
                zIndex: 1,
              }}
            />
            {/* Scan line */}
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                height: "1px",
                background: "rgba(0,0,0,0.06)",
                animation: "scanline 4s linear infinite",
                pointerEvents: "none",
                zIndex: 1,
              }}
            />

            {/* Content wrapper with relative positioning */}
            <div style={{ position: "relative", zIndex: 2 }}>
              {/* Close/Cancel Button */}
              <button
                onClick={onBack}
                style={{
                  position: "absolute",
                  top: "0px",
                  right: "0px",
                  background: "rgba(0,0,0,0.15)",
                  border: "1px solid rgba(0,0,0,0.1)",
                  cursor: "pointer",
                  padding: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "6px",
                  transition: "all 0.15s",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                  zIndex: 10,
                  fontSize: "18px",
                  width: "28px",
                  height: "28px",
                  lineHeight: "1",
                  color: "#666",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(0,0,0,0.25)";
                  e.currentTarget.style.color = "#333";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(0,0,0,0.15)";
                  e.currentTarget.style.color = "#666";
                }}
                title="Cancel Payment"
              >
                ×
              </button>

              {/* Network Selection Dropdown */}
              <div style={{ marginBottom: "15px", width: "100%" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    color: "#333",
                    marginBottom: "8px",
                    fontWeight: "bold",
                  }}
                >
                  🌐 Select Network:
                </label>
                <select
                  value={selectedNetwork}
                  onChange={(e) => handleNetworkChange(e.target.value)}
                  disabled={isGeneratingQR}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "2px solid #00ff00",
                    backgroundColor: "#f8f9fa",
                    fontSize: "14px",
                    fontWeight: "bold",
                    color: "#333",
                    cursor: isGeneratingQR ? "wait" : "pointer",
                  }}
                >
                  {Object.entries(supportedNetworks).map(
                    ([chainId, network]) => (
                      <option key={chainId} value={chainId}>
                        {network.name} ({network.symbol})
                      </option>
                    ),
                  )}
                </select>
              </div>

              {/* CCIP Cross-Chain Payment Options */}
              {showCrossChainUI && (
                <div style={{ marginBottom: "15px", width: "100%" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      color: "#333",
                      marginBottom: "8px",
                      fontWeight: "bold",
                    }}
                  >
                    🌉 Payment Mode:
                  </label>

                  {/* Payment Mode Selection */}
                  <div style={{ marginBottom: "10px" }}>
                    {Array.isArray(crossChainOptions) &&
                      crossChainOptions.map((option, index) => (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "6px",
                            padding: "8px",
                            backgroundColor:
                              paymentMode === option.type
                                ? "#e8f5e8"
                                : "#f8f9fa",
                            borderRadius: "6px",
                            border:
                              paymentMode === option.type
                                ? "2px solid #00ff00"
                                : "1px solid #ddd",
                            cursor: "pointer",
                          }}
                          onClick={() => handlePaymentModeChange(option.type)}
                        >
                          <input
                            type="radio"
                            name="paymentMode"
                            value={option.type}
                            checked={paymentMode === option.type}
                            onChange={() =>
                              handlePaymentModeChange(option.type)
                            }
                            style={{ marginRight: "8px" }}
                          />
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontSize: "13px",
                                fontWeight: "bold",
                                color: "#333",
                              }}
                            >
                              {option.type === "same-chain" &&
                                "📱 Same Network"}
                              {option.type === "cross-chain" &&
                                "🌉 Cross-Chain"}
                              {option.type === "switch-network" &&
                                "🔄 Switch Network"}
                              {option.recommended && (
                                <span
                                  style={{ color: "#00aa00", fontSize: "11px" }}
                                >
                                  {" "}
                                  (Recommended)
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: "11px", color: "#666" }}>
                              {option.description}
                            </div>
                            <div style={{ fontSize: "10px", color: "#888" }}>
                              Fee: {option.fee}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Cross-Chain Route Info */}
                  {paymentMode === "cross-chain" &&
                    userNetwork &&
                    agentNetwork && (
                      <div
                        style={{
                          padding: "10px",
                          backgroundColor: "#fff3cd",
                          borderRadius: "6px",
                          border: "1px solid #ffc107",
                          fontSize: "12px",
                          color: "#856404",
                        }}
                      >
                        <div
                          style={{ fontWeight: "bold", marginBottom: "4px" }}
                        >
                          🌉 Cross-Chain Route:
                        </div>
                        <div>
                          {supportedNetworks[userNetwork]?.name} →{" "}
                          {supportedNetworks[agentNetwork]?.name}
                        </div>
                        {crossChainFeeEstimate && (
                          <div style={{ marginTop: "4px", fontSize: "11px" }}>
                            Estimated Fee:{" "}
                            {parseFloat(crossChainFeeEstimate) / 1e18} ETH
                          </div>
                        )}
                      </div>
                    )}

                  {/* Network Switch Prompt */}
                  {paymentMode === "switch-network" && agentNetwork && (
                    <div
                      style={{
                        padding: "10px",
                        backgroundColor: "#d1ecf1",
                        borderRadius: "6px",
                        border: "1px solid #bee5eb",
                        fontSize: "12px",
                        color: "#0c5460",
                      }}
                    >
                      <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
                        🔄 Network Switch Required:
                      </div>
                      <div>
                        Please switch to {supportedNetworks[agentNetwork]?.name}{" "}
                        in your wallet to continue.
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Wallet Balance Display */}
              <div
                style={{
                  marginBottom: "10px",
                  width: "100%",
                  textAlign: "center",
                  padding: "8px",
                  backgroundColor: "#f0f8ff",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    marginBottom: "4px",
                  }}
                >
                  💰 Your Wallet Balance:
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "bold",
                    color: walletBalance !== null ? "#00aa00" : "#666",
                  }}
                >
                  {isLoadingBalance
                    ? "Loading..."
                    : walletBalance !== null
                    ? `${parseFloat(walletBalance).toFixed(4)} ${
                        supportedNetworks[selectedNetwork]?.symbol || "tokens"
                      }`
                    : "Connect wallet to view"}
                </div>
              </div>

              {/* ENS Payment Info Display */}
              {selectedMethod === "ens_payments" && ensPaymentInfo && (
                <div
                  style={{
                    marginBottom: "15px",
                    width: "100%",
                    padding: "12px",
                    backgroundColor: "#f0f7ff",
                    borderRadius: "10px",
                    border: "2px solid #5298ff",
                  }}
                >
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "bold",
                      color: "#5298ff",
                      marginBottom: "8px",
                      textAlign: "center",
                    }}
                  >
                    🌐 ENS Payment
                  </div>
                  <div style={{ fontSize: "12px", color: "#333" }}>
                    <div style={{ marginBottom: "4px" }}>
                      <strong>Domain:</strong> {ensPaymentInfo.domain}
                    </div>
                    <div style={{ marginBottom: "4px" }}>
                      <strong>Resolves to:</strong>{" "}
                      {ensPaymentInfo.resolvedAddress.slice(0, 10)}...
                      {ensPaymentInfo.resolvedAddress.slice(-8)}
                    </div>
                    <div style={{ marginBottom: "4px" }}>
                      <strong>Amount:</strong> {ensPaymentInfo.amount} ETH
                    </div>
                    <div>
                      <strong>Network:</strong> {ensPaymentInfo.network}
                    </div>
                  </div>
                </div>
              )}

              {/* Agent Payment Info */}
              <div
                style={{
                  marginBottom: "15px",
                  fontSize: "16px",
                  color: "#333",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                💳 Pay {agent?.name || "Agent"}
              </div>

              <div
                style={{
                  marginBottom: "15px",
                  fontSize: "14px",
                  color: "#666",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  {(() => {
                    // Check if agent has dynamic fee type
                    const isDynamicFee = agent?.fee_type === "dynamic";

                    // Use the paymentAmount prop that was passed to this component
                    // It already has the final calculated amount from getFinalPaymentAmount()
                    const finalAmount = paymentAmount;

                    // For dynamic fee agents without payment amount, show "Dynamic Amount"
                    if (isDynamicFee && !finalAmount) {
                      return (
                        <span style={{ color: "#ff9500" }}>Dynamic Amount</span>
                      );
                    }

                    // Otherwise show the amount
                    return (
                      <>
                        {finalAmount}{" "}
                        {supportedNetworks[selectedNetwork]?.symbol || "USDC"}
                      </>
                    );
                  })()}
                </div>
                <span
                  style={{
                    fontSize: "12px",
                    color: supportedNetworks[selectedNetwork]?.color,
                  }}
                >
                  on {supportedNetworks[selectedNetwork]?.name}
                </span>

                {/* Show URL payment data if available */}
                {urlPaymentData && (
                  <div
                    style={{
                      marginTop: "10px",
                      padding: "8px",
                      backgroundColor: "#e8f5e8",
                      borderRadius: "6px",
                      fontSize: "11px",
                      color: "#333",
                    }}
                  >
                    {urlPaymentData.orderId && (
                      <div>📝 Order: {urlPaymentData.orderId}</div>
                    )}
                    {urlPaymentData.merchantName && (
                      <div>🏪 From: {urlPaymentData.merchantName}</div>
                    )}
                  </div>
                )}
              </div>

              {/* QR Code Display */}
              {isGeneratingQR ? (
                <div
                  style={{
                    width: "200px",
                    height: "200px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#f0f0f0",
                    borderRadius: "10px",
                    fontSize: "14px",
                    color: "#666",
                  }}
                >
                  🔄 Generating QR...
                </div>
              ) : paymentMode === "switch-network" ? (
                <div
                  style={{
                    width: "200px",
                    height: "200px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "10px",
                    border: "2px dashed #007bff",
                    fontSize: "14px",
                    color: "#007bff",
                    textAlign: "center",
                    padding: "20px",
                  }}
                >
                  <div style={{ fontSize: "24px", marginBottom: "10px" }}>
                    🔄
                  </div>
                  <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
                    Switch Network
                  </div>
                  <div style={{ fontSize: "12px" }}>
                    Please switch to {supportedNetworks[agentNetwork]?.name} in
                    your wallet
                  </div>
                </div>
              ) : currentQRData ? (
                <div onClick={handleQRClick}>
                  {typeof currentQRData === "string" &&
                  (currentQRData.startsWith("data:image") ||
                    currentQRData.startsWith("http")) ? (
                    <img
                      src={currentQRData}
                      alt="Payment QR Code"
                      style={{
                        width: "200px",
                        height: "200px",
                        borderRadius: "10px",
                        cursor: "pointer",
                        border:
                          paymentMode === "cross-chain"
                            ? "2px solid #ff9500"
                            : "2px solid #00ff00",
                      }}
                    />
                  ) : (
                    <div style={{ position: "relative" }}>
                      {qrDisplayValue && qrDisplayValue.length > 0 ? (
                        <QRCode
                          value={qrDisplayValue}
                          size={200}
                          style={{
                            background: "white",
                            padding: "10px",
                            borderRadius: "10px",
                            cursor: "pointer",
                            border:
                              paymentMode === "cross-chain"
                                ? "2px solid #ff9500"
                                : "2px solid #00ff00",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "200px",
                            height: "200px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#f0f0f0",
                            borderRadius: "10px",
                            fontSize: "14px",
                            color: "#666",
                          }}
                        >
                          No QR Data Available
                        </div>
                      )}
                      {paymentMode === "cross-chain" && (
                        <div
                          style={{
                            position: "absolute",
                            top: "-5px",
                            right: "-5px",
                            backgroundColor: "#ff9500",
                            color: "white",
                            borderRadius: "50%",
                            width: "30px",
                            height: "30px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "16px",
                            fontWeight: "bold",
                          }}
                        >
                          🌉
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    width: "200px",
                    height: "200px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#f0f0f0",
                    borderRadius: "10px",
                    fontSize: "14px",
                    color: "#666",
                  }}
                >
                  No QR Code Available
                </div>
              )}

              {/* Payment Instructions */}
              <div
                style={{
                  marginTop: "15px",
                  fontSize: "12px",
                  color: "#333",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                {transactionHash ? (
                  <>
                    ✅ PAYMENT SUCCESSFUL!
                    <br />
                    <a
                      href={`https://hashscan.io/testnet/transaction/${transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#00D4AA",
                        textDecoration: "underline",
                        cursor: "pointer",
                        fontSize: "11px",
                        marginTop: "8px",
                        display: "inline-block",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      🔗 View on HashScan
                    </a>
                    <br />
                    <span
                      style={{
                        fontSize: "9px",
                        color: "#666",
                        marginTop: "4px",
                        display: "block",
                      }}
                    >
                      TX: {transactionHash.slice(0, 10)}...
                      {transactionHash.slice(-8)}
                    </span>
                  </>
                ) : paymentMode === "cross-chain" ? (
                  <>
                    🌉 CROSS-CHAIN PAYMENT
                    <br />
                    🖱️ CLICK to Pay from {supportedNetworks[userNetwork]?.name}
                    <br />
                    📱 SCAN with Mobile Wallet
                    {crossChainFeeEstimate && (
                      <div
                        style={{
                          fontSize: "10px",
                          color: "#ff9500",
                          marginTop: "4px",
                        }}
                      >
                        Additional cross-chain fee applies
                      </div>
                    )}
                  </>
                ) : paymentMode === "switch-network" ? (
                  <>
                    🔄 NETWORK SWITCH REQUIRED
                    <br />
                    Switch to {supportedNetworks[agentNetwork]?.name} first
                  </>
                ) : (
                  <>
                    🖱️ CLICK to Pay with{" "}
                    {selectedNetwork === "solana-devnet"
                      ? "Phantom"
                      : "MetaMask"}
                    <br />
                    📱 SCAN with Mobile Wallet
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Bottom bezel — screw holes + card slot hint */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px 4px",
            }}
          >
            {/* Screw hole left */}
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "radial-gradient(circle, #555 30%, #222 70%)",
                boxShadow: "inset 0 1px 1px rgba(0,0,0,0.6)",
              }}
            />
            {/* Card slot / payment indicator */}
            <div
              style={{
                width: "50px",
                height: "4px",
                borderRadius: "2px",
                background: "linear-gradient(90deg, #222, #333, #222)",
                boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5)",
              }}
            />
            {/* Screw hole right */}
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "radial-gradient(circle, #555 30%, #222 70%)",
                boxShadow: "inset 0 1px 1px rgba(0,0,0,0.6)",
              }}
            />
          </div>

          {/* Cancel Payment Button - Hardware style */}
          <div
            style={{
              padding: "12px 14px 8px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <button
              onClick={onBack}
              style={{
                background: "linear-gradient(145deg, #e63946, #c62937)",
                border: "1px solid rgba(0,0,0,0.2)",
                borderRadius: "8px",
                padding: "10px 24px",
                color: "white",
                fontWeight: "700",
                cursor: "pointer",
                fontSize: "13px",
                letterSpacing: "0.5px",
                boxShadow:
                  "0 4px 12px rgba(230, 57, 70, 0.4), " +
                  "inset 0 1px 0 rgba(255,255,255,0.2), " +
                  "inset 0 -2px 0 rgba(0,0,0,0.2)",
                transition: "all 0.15s",
                textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                width: "100%",
                maxWidth: "200px",
              }}
              onMouseOver={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow =
                  "0 6px 16px rgba(230, 57, 70, 0.5), " +
                  "inset 0 1px 0 rgba(255,255,255,0.2), " +
                  "inset 0 -2px 0 rgba(0,0,0,0.2)";
              }}
              onMouseOut={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow =
                  "0 4px 12px rgba(230, 57, 70, 0.4), " +
                  "inset 0 1px 0 rgba(255,255,255,0.2), " +
                  "inset 0 -2px 0 rgba(0,0,0,0.2)";
              }}
            >
              ✕ Cancel Payment
            </button>
          </div>
        </div>

        {/* CSS Animations */}
        <style>{`
          @keyframes scanline {
            0% { top: 0%; }
            100% { top: 100%; }
          }
          @keyframes ledPulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </Html>

      {/* QR Code Lighting */}
      <pointLight
        position={[position[0], position[1], position[2] + 1]}
        color="#ffffff"
        intensity={0.8}
        distance={5}
      />
    </group>
  );
};

// Main Cube Payment Engine Component
const CubePaymentEngine = ({
  agent,
  isOpen,
  onClose,
  onPaymentComplete,
  paymentAmount = 10.0,
  enabledMethods = [
    "crypto_qr", // Front face
    "virtual_card", // Right face
    "ens_payments", // Top face (ENS payments)
    "sound_pay", // Bottom face (switched with voice_pay)
    "voice_pay", // Back face (switched with sound_pay)
    "bank_qr", // Left face (switched with ens_payments)
  ],
}) => {
  const [currentView, setCurrentView] = useState("cube"); // 'cube' or 'qr'
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [qrData, setQRData] = useState(null);
  const [transactionHash, setTransactionHash] = useState(null); // For Hedera transaction links
  const [isGenerating, setIsGenerating] = useState(false);
  const [ensPaymentInfo, setEnsPaymentInfo] = useState(null); // ENS payment details
  const [agentPaymentConfig, setAgentPaymentConfig] = useState(null);
  const [actualEnabledMethods, setActualEnabledMethods] =
    useState(enabledMethods);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const cubeRef = useRef();

  // Dynamic Payment Amount State
  const [urlPaymentData, setUrlPaymentData] = useState(null);
  const [dynamicPaymentAmount, setDynamicPaymentAmount] = useState(null);

  // Intermediate Payment Modal State
  const [showIntermediateModal, setShowIntermediateModal] = useState(false);
  const [intermediateTransactionData, setIntermediateTransactionData] =
    useState(null);

  // Revolut Payment State
  const [showRevolutBankModal, setShowRevolutBankModal] = useState(false);
  const [revolutOrderData, setRevolutOrderData] = useState(null);
  const [revolutPaymentStatus, setRevolutPaymentStatus] = useState("idle"); // 'idle', 'processing', 'completed', 'failed', 'cancelled'

  // Revolut Virtual Card State
  const [showVirtualCardModal, setShowVirtualCardModal] = useState(false);
  const [virtualCardAgentId, setVirtualCardAgentId] = useState(null);

  const [isInitializing, setIsInitializing] = useState(true); // Prevent auto-clicks on load

  // Prevent immediate face selection when cube loads
  useEffect(() => {
    if (isOpen) {
      setIsInitializing(true);
      console.log(
        "🔒 Cube initializing - blocking all interactions for 1500ms",
      );
      const timer = setTimeout(() => {
        setIsInitializing(false);
        console.log("✅ Cube ready - interactions enabled");
      }, 1500); // Increased to 1500ms delay before allowing face selection

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Parse URL parameters and calculate dynamic payment amount
  useEffect(() => {
    if (!isOpen || !agent) return;

    console.log(
      "📋 Parsing URL payment data and calculating dynamic amount...",
    );

    // Parse URL parameters
    const paymentData = parsePaymentDataFromURL();
    setUrlPaymentData(paymentData);

    // Determine final payment amount based on fee_type and URL data
    const finalAmount = getDynamicPaymentAmount(agent, paymentData);
    setDynamicPaymentAmount(finalAmount);

    // Log payment configuration for debugging
    const configSummary = getPaymentConfigSummary(
      agent,
      paymentData,
      finalAmount,
    );
    console.log("💳 Payment configuration:", configSummary);

    // Validate the amount if it's defined
    if (finalAmount !== null && !validatePaymentAmount(finalAmount)) {
      console.error("❌ Invalid payment amount detected:", finalAmount);
      alert("Invalid payment amount. Please check the payment details.");
    }
  }, [isOpen, agent]);

  // Load payment configuration from AgentSphere when component opens
  useEffect(() => {
    const loadPaymentConfig = async () => {
      if (!isOpen || !agent?.id) {
        setIsLoadingConfig(false);
        return;
      }

      console.log("🔄 Loading payment configuration for agent:", agent.id);
      setIsLoadingConfig(true);

      try {
        const config = await getAgentPaymentConfig(agent.id);
        setAgentPaymentConfig(config);
        // Use the database-configured enabledMethods from the config
        setActualEnabledMethods(config.enabledMethods);

        console.log("✅ Payment configuration loaded:", {
          enabledMethods: config.enabledMethods,
          hasWallet: !!config.config.walletAddress,
        });
      } catch (error) {
        console.error("❌ Failed to load payment configuration:", error);
        // Use passed enabledMethods as fallback when database config fails
        setActualEnabledMethods(enabledMethods);
      } finally {
        setIsLoadingConfig(false);
      }
    };

    loadPaymentConfig();
  }, [isOpen, agent?.id]);

  // Debug: Track rendering state
  useEffect(() => {
    console.log("🎲 RENDER STATE UPDATE:", {
      currentView,
      isLoadingConfig,
      isInitializing,
      isOpen,
      cubeWillRender: currentView === "cube" && !isLoadingConfig,
    });
  }, [currentView, isLoadingConfig, isInitializing, isOpen]);

  // Helper function to get the final payment amount to use
  const getFinalPaymentAmount = useCallback(() => {
    // Priority 1: Use dynamic amount from URL if available and valid
    if (dynamicPaymentAmount !== null && dynamicPaymentAmount !== undefined) {
      console.log(
        "💰 getFinalPaymentAmount: Using dynamic amount from URL",
        dynamicPaymentAmount,
      );
      return dynamicPaymentAmount;
    }

    // Check if agent has dynamic fee type
    const isDynamicFee = agent?.fee_type === "dynamic";

    // For dynamic fee agents WITHOUT URL data, return null for display
    // (this shows "Dynamic Amount" label)
    if (isDynamicFee) {
      console.log(
        "💰 getFinalPaymentAmount: Agent has dynamic fee_type, but no URL data - returning null",
        {
          agent: agent?.name,
          fee_type: agent?.fee_type,
        },
      );
      return null; // This will trigger "Dynamic Amount" display
    }

    // For FIXED fee agents, use standard priority chain:

    // Priority 2: Use prop paymentAmount if provided
    if (paymentAmount && paymentAmount !== 10.0) {
      // 10.0 is the default
      console.log(
        "💰 getFinalPaymentAmount: Using prop paymentAmount",
        paymentAmount,
      );
      return paymentAmount;
    }

    // Priority 3: Use agent's interaction_fee_amount
    if (agent?.interaction_fee_amount) {
      console.log(
        "💰 getFinalPaymentAmount: Using agent.interaction_fee_amount",
        agent.interaction_fee_amount,
      );
      return agent.interaction_fee_amount;
    }

    // Priority 4: Use legacy interaction_fee
    if (agent?.interaction_fee) {
      console.log(
        "💰 getFinalPaymentAmount: Using agent.interaction_fee",
        agent.interaction_fee,
      );
      return agent.interaction_fee;
    }

    // Fallback: 10.0
    console.log("💰 getFinalPaymentAmount: Using fallback 10.0");
    return 10.0;
  }, [dynamicPaymentAmount, paymentAmount, agent]);

  // Handle face selection
  const handleFaceSelected = async (methodKey, methodConfig) => {
    console.log("🔵 handleFaceSelected ENTERED:", methodKey, methodConfig);

    // Prevent auto-selection during initialization
    if (isInitializing) {
      console.log("⏳ Cube initializing, ignoring face selection");
      return;
    }

    console.log("🎯 Payment method selected:", methodKey, methodConfig);
    setSelectedMethod({ key: methodKey, config: methodConfig });

    if (methodKey === "crypto_qr") {
      console.log("📍 Routing to: handleCryptoQRSelection");
      await handleCryptoQRSelection();
    } else if (methodKey === "ens_payments") {
      console.log("📍 Routing to: handleENSPayments");
      handleENSPayments();
    } else if (methodKey === "bank_qr") {
      console.log("📍 Routing to: handleBankQRSelection");
      await handleBankQRSelection();
    } else if (methodKey === "virtual_card") {
      console.log("📍 Routing to: handleVirtualCardSelection");
      await handleVirtualCardSelection();
    } else {
      console.log("📍 Showing Coming Soon alert for:", methodKey);
      // Show "Coming Soon" for other methods (voice_pay, sound_pay)
      alert(
        `${methodConfig.text} - Coming Soon!\n\nThis payment method will be available in the next update.\n\nFor now, please use Crypto QR, Bank QR, or Virtual Card payments.`,
      );
    }
  };

  // Handle Crypto QR selection - integrate with existing system
  const handleCryptoQRSelection = async () => {
    // Prevent execution during initialization
    if (isInitializing) {
      console.log("⏳ Cube initializing, ignoring crypto QR selection");
      return;
    }

    setIsGenerating(true);

    try {
      console.log("🔄 Generating crypto QR payment...");
      console.log("📊 Agent data for QR generation:", agent);

      // STEP 1: Detect network configuration for cross-chain vs same-chain
      // Check if user is on Solana or EVM wallet
      // CRITICAL FIX: Check if Ethereum wallet is ACTIVELY being used (has chainId set)
      const isEVMWallet = window.ethereum && window.ethereum.chainId;
      const isSolanaWallet = !isEVMWallet && window.solana?.isConnected;

      const userNetwork =
        isEVMWallet && window.ethereum?.chainId
          ? parseInt(window.ethereum.chainId, 16)
          : null;

      // Get agent network - check multiple possible fields (same as ARViewer.jsx)
      const agentNetwork =
        agent?.deployment_chain_id ||
        agent?.chain_id ||
        agent?.network_id ||
        agent?.payment_config?.chainId;

      // 🔧 CRITICAL FIX: Override chain ID if network name indicates Hedera but database has wrong value
      let agentNetworkNum = agentNetwork ? parseInt(agentNetwork) : null;
      const networkName = agent?.deployment_network_name || agent?.network;
      if (networkName && networkName.toLowerCase().includes("hedera")) {
        // Database has wrong chain_id, override with correct Hedera chain ID
        console.log(
          "🔧 Hedera network detected from name - overriding chain ID to 296",
        );
        agentNetworkNum = 296;
      }

      // Detect if agent is on Solana
      const agentIsSolana =
        agent?.network === "Solana Devnet" ||
        agent?.deployment_network_name === "Solana Devnet" ||
        agentNetwork === "devnet" ||
        agentNetwork === "solana-devnet" ||
        (typeof agentNetwork === "string" &&
          agentNetwork.toLowerCase().includes("solana"));

      // 🔄 CACHE BUSTER v2024-10-31-19:15 - HEDERA FIX
      console.log("═══════════════════════════════════════════════");
      console.log("🔍 NETWORK DETECTION [v19:20]");
      console.log("═══════════════════════════════════════════════");
      console.table({
        "User Network (parsed)": userNetwork,
        "Agent Network (raw)": agentNetwork,
        "Agent Network (parsed)": agentNetworkNum,
        "Is Solana Wallet": isSolanaWallet,
        "Is EVM Wallet": isEVMWallet,
        "Agent is Solana": agentIsSolana,
      });
      console.log("Agent Fields:");
      console.table({
        deployment_chain_id: agent?.deployment_chain_id,
        chain_id: agent?.chain_id,
        network_id: agent?.network_id,
        "payment_config.chainId": agent?.payment_config?.chainId,
      });
      console.log("═══════════════════════════════════════════════");

      console.log("🌐 Network Detection:", {
        userNetwork,
        agentNetwork,
        agentNetworkNum,
        isSolanaWallet,
        agentIsSolana,
        needsCrossChain:
          userNetwork && agentNetworkNum && userNetwork !== agentNetworkNum,
      });

      // VALIDATION: Check if user is on a supported network (ONLY FOR EVM)
      // Skip network validation for Solana wallets
      if (isEVMWallet && !agentIsSolana) {
        const SUPPORTED_TESTNETS = [
          11155111, 421614, 84532, 11155420, 80002, 43113, 296,
        ]; // Sepolia, Arb, Base, OP, Polygon, Avalanche, Hedera
        const MAINNET_CHAINS = [1, 137, 42161, 8453, 10, 43114]; // ETH, Polygon, Arb, Base, OP, Avalanche mainnets

        if (userNetwork && MAINNET_CHAINS.includes(userNetwork)) {
          console.error("❌ User is on MAINNET but agent requires TESTNET");
          alert(
            `⚠️ Network Mismatch\n\n` +
              `You're connected to a MAINNET network.\n` +
              `This agent requires a TESTNET connection.\n\n` +
              `Please switch to one of these testnets:\n` +
              `• Sepolia (11155111)\n` +
              `• Base Sepolia (84532)\n` +
              `• Arbitrum Sepolia (421614)\n` +
              `• OP Sepolia (11155420)\n` +
              `• Hedera Testnet (296)\n\n` +
              `Then try again.`,
          );
          setIsGenerating(false);
          return;
        }

        if (
          userNetwork &&
          !SUPPORTED_TESTNETS.includes(userNetwork) &&
          !MAINNET_CHAINS.includes(userNetwork)
        ) {
          console.error("❌ User network not supported:", userNetwork);
          alert(
            `⚠️ Unsupported Network\n\n` +
              `Your current network (${userNetwork}) is not supported.\n\n` +
              `Please switch to one of these testnets:\n` +
              `• Sepolia (11155111)\n` +
              `• Base Sepolia (84532)\n` +
              `• Arbitrum Sepolia (421614)\n` +
              `• OP Sepolia (11155420)\n` +
              `• Hedera Testnet (296)`,
          );
          setIsGenerating(false);
          return;
        }
      } // End of EVM-only validation block

      // STEP 2: Route to appropriate flow
      console.log("🚦 ROUTING DECISION:");
      console.log(
        `  - userNetwork: ${userNetwork} (type: ${typeof userNetwork})`,
      );
      console.log(
        `  - agentNetworkNum: ${agentNetworkNum} (type: ${typeof agentNetworkNum})`,
      );
      console.log(
        `  - Is agentNetworkNum valid? ${
          agentNetworkNum !== null && !isNaN(agentNetworkNum)
        }`,
      );
      console.log(
        `  - Comparison result: ${userNetwork} !== ${agentNetworkNum} = ${
          userNetwork !== agentNetworkNum
        }`,
      );
      console.log(`  - isSolanaWallet: ${isSolanaWallet}`);
      console.log(`  - agentIsSolana: ${agentIsSolana}`);

      // For Solana wallets, always use direct QR generation (no cross-chain)
      if (isSolanaWallet && agentIsSolana) {
        console.log(
          "🌟 Solana-to-Solana detected → Direct Solana QR generation",
        );

        const finalAmount = getFinalPaymentAmount();
        console.log("💰 Using payment amount:", finalAmount);

        const result = await dynamicQRService.generateDynamicQR(
          agent,
          finalAmount,
        );

        console.log("✅ Solana QR generated:", result);
        setQRData(result.paymentUri);
        setCurrentView("qr");
      } else if (
        userNetwork &&
        agentNetworkNum &&
        String(userNetwork) !== String(agentNetworkNum)
      ) {
        // 🌉 CROSS-CHAIN (EVM only): Show intermediate modal first
        console.log("🌉 Cross-chain detected → Triggering intermediate modal");
        console.log(
          `  - User on chain ${userNetwork}, agent on chain ${agentNetworkNum}`,
        );
        await handleCrossChainMode();
        return; // Exit here - modal will handle QR generation after confirmation
      } else {
        // 📱 SAME-CHAIN (EVM): Direct QR generation
        console.log("📱 Same-chain EVM detected → Direct QR generation");
        console.log(`  - Both user and agent on chain ${userNetwork}`);

        const finalAmount = getFinalPaymentAmount();
        console.log("💰 Using payment amount:", finalAmount);

        // Generate QR code for payment (supports USDh and all custom stablecoins)
        const result = await dynamicQRService.generateDynamicQR(
          agent,
          finalAmount,
        );

        console.log("✅ Same-chain QR generated:", result);

        // Simple flow that works for Sepolia - just set QR data and show it
        setQRData(result.qrData);
        setCurrentView("qr");
      }
    } catch (error) {
      console.error("❌ Error generating QR:", error);
      alert("Error generating payment QR. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle BTC Payments
  const handleENSPayments = async () => {
    console.log("🌐 Launching ENS payments...");

    // Prevent execution during initialization
    if (isInitializing) {
      console.log("⏳ Cube initializing, ignoring ENS payment");
      return;
    }

    setIsGenerating(true);

    try {
      // Build agent object with ENS fields from config
      const agentWithENS = {
        ...agent,
        ens_domain: agentPaymentConfig?.config?.ens_domain,
        ens_resolved_address: agentPaymentConfig?.config?.ens_resolved_address,
        ens_resolver_network: agentPaymentConfig?.config?.ens_resolver_network,
        // Include fee info for USDC payments
        interaction_fee_amount:
          agentPaymentConfig?.config?.interaction_fee_amount ||
          agent?.interaction_fee_amount ||
          10,
        interaction_fee_token:
          agentPaymentConfig?.config?.interaction_fee_token ||
          agent?.interaction_fee_token ||
          "USDC",
      };

      // Generate ENS payment data with fresh resolution
      const ensPaymentData = await ensPaymentService.generateENSAgentPayment(
        agentWithENS,
        null, // Use agent's interaction_fee
      );

      console.log("✅ ENS payment data generated:", ensPaymentData);

      // Generate EIP-681 QR code URI
      const qrData = ensPaymentService.generateENSPaymentQRData(ensPaymentData);

      console.log("📱 ENS payment QR data:", qrData);

      // Set QR data and show modal (reuse existing ARQRDisplay)
      setQRData(qrData);
      setCurrentView("qr");
      setSelectedMethod("ens_payments");

      // Store ENS payment info for display
      setEnsPaymentInfo({
        domain: ensPaymentData.ensDomain,
        resolvedAddress: ensPaymentData.resolvedAddress,
        amount: ensPaymentData.amount,
        token: ensPaymentData.token,
        network: ensPaymentData.network,
        chainId: ensPaymentData.chainId,
        isTokenPayment: ensPaymentData.isTokenPayment,
        tokenContract: ensPaymentData.tokenContract,
      });
    } catch (error) {
      console.error("❌ ENS payment generation failed:", error);
      alert(
        `Failed to generate ENS payment:\n${error.message}\n\nPlease ensure:\n• ENS domain is configured\n• Network is accessible\n• MetaMask is installed`,
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Revolut Bank QR Selection
  const handleBankQRSelection = async () => {
    console.log("🚨 handleBankQRSelection called!");
    console.log("🚨 isInitializing value:", isInitializing);
    console.log("🚨 Call stack:", new Error().stack);

    // Prevent execution during initialization
    if (isInitializing) {
      console.log("⏳ Cube initializing, ignoring bank QR selection");
      return;
    }

    console.log("🔲 Handling Revolut Bank QR payment...");
    setIsGenerating(true);

    try {
      // 💰 Use dynamic payment amount from e-shop/on-ramp OR agent's fee OR default
      const amount = getFinalPaymentAmount();

      console.log(
        "💰 Creating Revolut Bank QR order for amount:",
        amount,
        "USD",
      );
      console.log("💰 Payment amount source:", {
        fromDynamicAmount: dynamicPaymentAmount,
        fromPaymentContext: paymentAmount,
        fromAgentFeeAmount: agent?.interaction_fee_amount,
        fromAgentFee: agent?.interaction_fee,
        finalAmount: amount,
        urlPaymentData: urlPaymentData,
      });

      // Create Revolut Bank QR order
      const orderResult = await revolutBankService.createRevolutBankOrder({
        agentId: agent?.id,
        agentName: agent?.name,
        amount: amount,
        currency: "USD",
        description: `Payment to ${agent?.name || "AgentSphere Agent"}`,
      });

      if (orderResult.success) {
        console.log("✅ Revolut Bank QR order created:", orderResult.order);
        setRevolutOrderData(orderResult.order);
        setShowRevolutBankModal(true);
        setRevolutPaymentStatus("processing");
      } else {
        throw new Error(orderResult.error);
      }
    } catch (error) {
      console.error("❌ Error creating Revolut Bank QR order:", error);
      alert(`Error creating Bank QR payment: ${error.message}`);
      setRevolutPaymentStatus("failed");
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Revolut Virtual Card Selection
  const handleVirtualCardSelection = async () => {
    // Prevent execution during initialization
    if (isInitializing) {
      console.log("⏳ Cube initializing, ignoring virtual card selection");
      return;
    }

    console.log("💳💳💳 VIRTUAL CARD SELECTION TRIGGERED!");
    console.log("💳 Opening Virtual Card Manager...");
    console.log("💳 showVirtualCardModal before:", showVirtualCardModal);

    // 💰 Calculate dynamic payment amount
    const amount = getFinalPaymentAmount();

    console.log("💰 Payment amount:", {
      fromDynamicAmount: dynamicPaymentAmount,
      fromPaymentContext: paymentAmount,
      fromAgentFeeAmount: agent?.interaction_fee_amount,
      fromAgentFee: agent?.interaction_fee,
      finalAmount: amount,
      urlPaymentData: urlPaymentData,
    });

    try {
      // Set the agent ID for the Virtual Card component
      setVirtualCardAgentId(agent?.id || "unknown_agent");

      // Open the Virtual Card modal with new manager
      setShowVirtualCardModal(true);
      console.log("💳 showVirtualCardModal set to TRUE");
      setRevolutPaymentStatus("processing");
    } catch (error) {
      console.error("❌ Error opening Virtual Card Manager:", error);
      alert(`Error opening Virtual Card: ${error.message}`);
      setRevolutPaymentStatus("failed");
    }
  };

  // Intermediate Payment Modal Handlers
  const handleModalConfirm = async (validatedTransactionData) => {
    try {
      console.log(
        "✅ User confirmed transaction, proceeding with QR generation...",
      );
      setShowIntermediateModal(false);

      // Generate final cross-chain QR using the validated transaction data
      const result = await dynamicQRService.generateCrossChainQR(
        agent,
        validatedTransactionData.sourceChain,
        validatedTransactionData.destinationChain,
        validatedTransactionData.amount,
        "native", // Fee token
      );

      if (result.success) {
        setQRData(result.qrData);
        console.log(
          "✅ Cross-chain QR generated after modal confirmation",
          result,
        );
        setCurrentView("qr");
        setSelectedMethod("crypto_qr");
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error(
        "❌ Failed to generate QR after modal confirmation:",
        error,
      );
      alert(`Error generating payment QR: ${error.message}`);
    }
  };

  const handleModalCancel = () => {
    console.log("❌ User cancelled transaction in intermediate modal");
    setShowIntermediateModal(false);
    setIntermediateTransactionData(null);
  };

  // Revolut Bank QR Modal Handlers
  const handleRevolutBankQRClose = () => {
    console.log("🔲 Closing Revolut Bank QR modal");
    setShowRevolutBankModal(false);
    setRevolutOrderData(null);
    setRevolutPaymentStatus("idle");
  };

  const handleRevolutBankQRCancel = async () => {
    console.log("❌ User cancelled Revolut Bank QR payment");

    if (revolutOrderData?.orderId) {
      try {
        const cancelResult = await revolutBankService.cancelRevolutOrder(
          revolutOrderData.orderId,
        );
        if (cancelResult.success) {
          console.log("✅ Revolut order cancelled successfully");
        } else {
          console.warn(
            "⚠️ Failed to cancel Revolut order:",
            cancelResult.error,
          );
        }
      } catch (error) {
        console.error("❌ Error cancelling Revolut order:", error);
      }
    }

    setRevolutPaymentStatus("cancelled");
    handleRevolutBankQRClose();
  };

  const handleRevolutBankQRSuccess = (paymentData) => {
    console.log("✅ Revolut Bank QR payment successful:", paymentData);
    setRevolutPaymentStatus("completed");

    alert(
      `✅ Bank QR Payment Successful!\n\n` +
        `💳 Payment ID: ${paymentData.paymentId}\n` +
        `💰 Amount: ${paymentData.amount} ${paymentData.currency}\n` +
        `🏪 Merchant: ${agent?.name}\n\n` +
        `Payment has been processed successfully via Revolut Bank QR.`,
    );

    // Call onPaymentComplete callback if provided
    if (onPaymentComplete) {
      onPaymentComplete({
        method: "bank_qr",
        amount: paymentData.amount,
        currency: paymentData.currency,
        paymentId: paymentData.paymentId,
        status: "completed",
      });
    }

    handleRevolutBankQRClose();
  };

  // Revolut Virtual Card Modal Handlers
  const handleVirtualCardClose = () => {
    console.log("💳 Closing Revolut Virtual Card modal");
    setShowVirtualCardModal(false);
    setVirtualCardAgentId(null);
    setRevolutPaymentStatus("idle");
  };

  const handleVirtualCardSuccess = (cardData) => {
    console.log("✅ Virtual Card action successful:", cardData);

    // If this was a payment, mark as completed
    if (cardData.action === "payment") {
      setRevolutPaymentStatus("completed");

      alert(
        `✅ Virtual Card Payment Successful!\n\n` +
          `💳 Card: ****${cardData.cardNumber?.slice(-4) || "****"}\n` +
          `💰 Amount: $${cardData.amount}\n` +
          `🏪 Merchant: ${cardData.merchant || agent?.name}\n\n` +
          `Payment has been processed successfully via Revolut Virtual Card.`,
      );

      // Call onPaymentComplete callback if provided
      if (onPaymentComplete) {
        onPaymentComplete({
          method: "virtual_card",
          amount: cardData.amount,
          currency: "USD",
          cardId: cardData.cardId,
          status: "completed",
        });
      }
    }

    // Keep modal open for other actions (card created, topped up, etc.)
    // User can manually close it when done
  };

  const handleVirtualCardError = (error) => {
    console.error("❌ Virtual Card error:", error);
    setRevolutPaymentStatus("failed");
    alert(`❌ Virtual Card Error: ${error.message || "Unknown error"}`);
  };

  // Handle Cross-Chain Mode - Shows intermediate modal for transaction review
  const handleCrossChainMode = async () => {
    // Get current network info from crypto QR selection context
    const userNetwork = window.ethereum?.chainId
      ? parseInt(window.ethereum.chainId, 16)
      : null;

    const agentNetworkRaw = agent?.network_id || agent?.chain_id;
    const agentNetwork = agentNetworkRaw ? parseInt(agentNetworkRaw) : null;

    if (!userNetwork || !agentNetwork) {
      throw new Error("Network information not available");
    }

    console.log(
      `🌉 Cross-chain transaction detected: ${userNetwork} → ${agentNetwork}`,
    );

    // STEP 1: Build CCIP transaction data for inspection
    try {
      console.log("🔧 Building CCIP transaction for intermediate modal...");

      const finalAmount = getFinalPaymentAmount();
      console.log("💰 Using payment amount for cross-chain:", finalAmount);

      const ccipTransactionData = await ccipConfigService.buildCCIPTransaction(
        userNetwork, // Source chain
        agentNetwork, // Destination chain
        finalAmount.toString(), // USDC amount
        agent?.agent_wallet_address || agent?.payment_recipient_address, // Recipient
        "native", // Fee token (ETH)
      );

      if (!ccipTransactionData.success) {
        // Check if it's an allowance issue that can be fixed in the modal
        const isAllowanceIssue =
          ccipTransactionData.simulationError &&
          (ccipTransactionData.simulationError.revertReason
            ?.toLowerCase()
            .includes("allowance") ||
            ccipTransactionData.simulationError.error
              ?.toLowerCase()
              .includes("allowance"));

        const isBalanceIssue =
          ccipTransactionData.simulationError &&
          (ccipTransactionData.simulationError.revertReason
            ?.toLowerCase()
            .includes("balance") ||
            ccipTransactionData.simulationError.error
              ?.toLowerCase()
              .includes("balance"));

        const isGenericSimulationFailure =
          ccipTransactionData.simulationError &&
          ccipTransactionData.simulationError.errorCode === "CALL_EXCEPTION";

        if (isAllowanceIssue) {
          console.log(
            "🔧 Allowance issue detected - showing modal for user to approve:",
            ccipTransactionData.simulationError,
          );
          // Continue to show modal for allowance approval
        } else if (isBalanceIssue) {
          console.log(
            "💰 Insufficient balance detected - showing modal with balance error:",
            ccipTransactionData.simulationError,
          );
          // Continue to show modal with balance information
        } else if (isGenericSimulationFailure) {
          console.log(
            "🚨 Generic simulation failure detected - showing modal with detailed error info:",
            ccipTransactionData.simulationError,
          );
          // Continue to show modal with generic simulation error details
        } else {
          throw new Error(
            `CCIP transaction build failed: ${ccipTransactionData.error}`,
          );
        }
      }

      console.log(
        ccipTransactionData.success
          ? "✅ CCIP transaction built successfully:"
          : "⚠️ CCIP transaction has simulation issues (showing modal for review):",
        ccipTransactionData,
      );

      // STEP 2: Show Intermediate Payment Modal for Cross-Chain Review
      setIntermediateTransactionData({
        ...ccipTransactionData,
        // Add cross-chain specific metadata for the modal
        sourceChain: userNetwork,
        destinationChain: agentNetwork,
        amount: agent?.interaction_fee_amount || "1.00",
        recipient:
          agent?.agent_wallet_address || agent?.payment_recipient_address,
        isCrossChain: true,
        transactionType: "CCIP Cross-Chain",
        // Enhanced debugging information
        ccipMessage: ccipTransactionData.message,
        rawFee: ccipTransactionData.estimatedFee,
        rawFeeETH: ccipTransactionData.estimatedFeeETH,
        feeBuffer: "20%",
        finalFeeETH: ccipTransactionData.valueETH,
        feeSource: "CCIP Router Contract",
        debugInfo: {
          userChainId: userNetwork,
          agentChainId: agentNetwork,
          needsCrossChain: true,
          ccipRouter: ccipTransactionData.to,
          chainSelector: ccipTransactionData.destinationChain,
          extraArgs: ccipTransactionData.data
            ? ccipTransactionData.data.substring(0, 100) + "..."
            : "N/A",
          transactionValue: ccipTransactionData.value,
          gasLimit: ccipTransactionData.gasLimit,
        },
      });

      setShowIntermediateModal(true);
      console.log(
        "🔍 Intermediate modal opened for cross-chain transaction review",
      );
    } catch (error) {
      console.error("❌ Failed to build CCIP transaction for modal:", error);
      throw error;
    }
  };

  // Handle back to cube
  const handleBackToCube = () => {
    setCurrentView("cube");
    setSelectedMethod(null);
    setQRData(null);
  };

  // Handle individual face clicks - for button-style interactions
  const handleFaceClick = async (method, faceIndex) => {
    console.log(`🎯🎯🎯 handleFaceClick CALLED: ${method} (face ${faceIndex})`);
    console.log(`   - isInitializing: ${isInitializing}`);

    // Prevent auto-selection during initialization
    if (isInitializing) {
      console.log(`⏳ Cube initializing, ignoring face click: ${method}`);
      return;
    }

    console.log(`🎯 Face clicked directly: ${method} (face ${faceIndex})`);

    // Handle QR generation for crypto_qr method with cross-chain detection
    if (method === "crypto_qr") {
      console.log("🔗 Generating QR code for crypto payment");

      // Use our updated crypto QR selection logic that includes modal
      await handleCryptoQRSelection();
      return;
    }

    console.log(`➡️ Calling handleFaceSelected for: ${method}`);
    // For other methods, use existing handleFaceSelected logic
    await handleFaceSelected(method, { text: method });
  };

  // Handle close
  const handleClose = () => {
    setCurrentView("cube");
    setSelectedMethod(null);
    setQRData(null);
    setAgentPaymentConfig(null);
    setActualEnabledMethods(enabledMethods);
    setIsLoadingConfig(false);

    // Reset Revolut state
    setShowRevolutBankModal(false);
    setRevolutOrderData(null);
    setRevolutPaymentStatus("idle");

    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background:
          "radial-gradient(circle at center, rgba(0, 30, 15, 0.15) 0%, rgba(0, 0, 0, 0.2) 100%)",
        backdropFilter: "blur(1px)",
      }}
    >
      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-8 right-8 z-60 w-12 h-12 bg-red-500/80 hover:bg-red-600/90 rounded-full flex items-center justify-center text-white text-xl font-bold backdrop-blur-sm border-2 border-red-400/50 shadow-lg transition-all duration-200"
      >
        ×
      </button>

      {/* AgentSphere Integration Status */}
      {agentPaymentConfig && (
        <div className="absolute top-8 left-8 z-60 bg-green-500/90 backdrop-blur-sm px-4 py-2 rounded-lg text-white text-sm font-bold border border-green-400/50">
          ✅ AgentSphere Connected
        </div>
      )}

      {/* 3D Canvas for the cube */}
      <div className="w-full h-full relative">
        <Canvas
          camera={{
            position: [0, 0, 5],
            fov: 75,
            near: 0.1,
            far: 100,
          }}
          style={{
            background: "transparent",
            width: "100%",
            height: "100%",
          }}
        >
          {/* Soft ambient lighting for visibility without glare */}
          <ambientLight intensity={0.6} color="#ffffff" />
          <directionalLight
            position={[10, 10, 5]}
            intensity={0.4}
            color="#ffffff"
          />

          {/* Render current view */}
          {(() => {
            console.log("🎲 CUBE RENDER CHECK:", {
              currentView,
              isLoadingConfig,
              shouldRender: currentView === "cube" && !isLoadingConfig,
            });
            return currentView === "cube" && !isLoadingConfig;
          })() && (
            <PaymentCube
              agent={agent}
              onFaceSelected={handleFaceSelected}
              handleFaceClick={handleFaceClick}
              actualEnabledMethods={actualEnabledMethods}
              cubeRef={cubeRef}
              isVisible={true}
              isInitializing={isInitializing}
            />
          )}

          {currentView === "qr" && qrData && (
            <ARQRDisplay
              qrData={qrData}
              agent={agent}
              onBack={handleBackToCube}
              position={[0, 0, -3]}
              transactionHash={transactionHash}
              paymentAmount={getFinalPaymentAmount()}
              urlPaymentData={urlPaymentData}
              onPaymentComplete={onPaymentComplete}
              ensPaymentInfo={ensPaymentInfo}
              selectedMethod={selectedMethod}
            />
          )}

          {/* Loading indicator */}
          {(isGenerating || isLoadingConfig) && (
            <Html center>
              <div
                style={{
                  color: "#00ff00",
                  fontSize: "18px",
                  fontWeight: "bold",
                  textAlign: "center",
                  background: "rgba(0, 0, 0, 0.8)",
                  padding: "20px",
                  borderRadius: "10px",
                  border: "2px solid #00ff00",
                  animation: "pulse 2s infinite",
                }}
              >
                {isLoadingConfig
                  ? "Loading AgentSphere Config..."
                  : "Generating Payment QR..."}
              </div>
            </Html>
          )}
        </Canvas>

        {/* CSS for animations */}
        <style>{`
          @keyframes float {
            0%,
            100% {
              transform: translate(-50%, -50%) translateY(0px);
            }
            50% {
              transform: translate(-50%, -50%) translateY(-10px);
            }
          }

          @keyframes pulse {
            0%,
            100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.7;
              transform: scale(1.05);
            }
          }

          @keyframes glow {
            0%,
            100% {
              box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
            }
            50% {
              box-shadow: 0 0 40px rgba(0, 255, 0, 0.6);
            }
          }
        `}</style>

        {/* Intermediate Payment Modal - For Cross-Chain Transaction Review */}
        <IntermediatePaymentModal
          isOpen={showIntermediateModal}
          onClose={handleModalCancel}
          onConfirm={handleModalConfirm}
          transactionData={intermediateTransactionData}
          agentData={agent}
        />

        {/* Revolut Bank QR Modal - For Bank QR Payments */}
        <RevolutBankQRModal
          isOpen={showRevolutBankModal}
          onClose={handleRevolutBankQRClose}
          onCancel={handleRevolutBankQRCancel}
          onSuccess={handleRevolutBankQRSuccess}
          orderData={revolutOrderData}
          agentData={agent}
        />

        {/* Virtual Card Manager - Real Virtual Card Payment System */}
        {(() => {
          console.log(
            "🔍 RENDER CHECK - showVirtualCardModal:",
            showVirtualCardModal,
          );
          return showVirtualCardModal;
        })() && (
          <VirtualCardManager
            isOpen={showVirtualCardModal}
            onClose={handleVirtualCardClose}
            agentName={agent?.name || "AgentSphere Agent"}
            paymentAmount={getFinalPaymentAmount()}
            agentId={agent?.id}
            onPaymentComplete={(result) => {
              console.log("✅ Virtual card payment completed:", result);
              // Close virtual card modal
              setShowVirtualCardModal(false);

              // If closeAgentModal flag is set, close everything and return to AR viewer
              if (result.closeAgentModal) {
                console.log(
                  "🔄 Closing cube payment engine and returning to AR viewer",
                );
                // Close the cube entirely
                if (onClose) {
                  onClose();
                }
              }

              // Call parent's onPaymentComplete to close cube and return to AR viewer
              if (onPaymentComplete) {
                onPaymentComplete({
                  method: "virtual-card",
                  amount: result.amount,
                  token: result.token,
                  wallet: result.wallet,
                  status: "completed",
                  closeAgentModal: result.closeAgentModal, // Pass the flag up
                });
              }
            }}
            onSwitchToCubePay={() => {
              console.log("🔄 Switching from virtual card to CubePay...");
              // Close virtual card modal
              setShowVirtualCardModal(false);
              // Close the entire cube payment engine to return to AR viewer
              // AR viewer will show the transaction result
              if (onPaymentComplete) {
                onPaymentComplete({
                  method: "cubepay-terminal",
                  switchToCubePay: true,
                  amount: getFinalPaymentAmount(),
                  status: "pending_cubepay",
                });
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

export default CubePaymentEngine;
