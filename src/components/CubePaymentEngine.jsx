import React, { useState, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text, Html } from "@react-three/drei";
import morphPaymentService from "../services/morphPaymentService";
import solanaPaymentService from "../services/solanaPaymentService";
import { hederaWalletService } from "../services/hederaWalletService";
import { supabase } from "../lib/supabase";
import QRCode from "react-qr-code";

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

    // Query AgentSphere database for payment configuration
    const { data, error } = await supabase
      .from("deployed_objects")
      .select(
        "payment_methods, payment_config, agent_wallet_address, payment_recipient_address"
      )
      .eq("id", agentId)
      .single();

    if (error) {
      console.warn(
        "⚠️ Failed to read payment config from AgentSphere:",
        error.message
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

    // Parse payment methods configuration
    const paymentMethods = data.payment_methods || {};
    const enabledMethods = [];

    // Check each payment method
    if (paymentMethods.crypto_qr?.enabled || !paymentMethods.crypto_qr) {
      enabledMethods.push("crypto_qr"); // Always enable crypto QR as fallback
    }

    if (paymentMethods.virtual_card?.enabled) {
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

    // Always show onboarding for new users
    enabledMethods.push("onboard_crypto");

    return {
      enabledMethods,
      config: {
        paymentMethods,
        paymentConfig: data.payment_config || {},
        walletAddress: data.agent_wallet_address,
        recipientAddress: data.payment_recipient_address,
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
  actualEnabledMethods = ["crypto_qr"],
  cubeRef,
  isVisible = true,
}) => {
  const meshRef = useRef();
  const [hoveredFace, setHoveredFace] = useState(null);
  const [selectedFace, setSelectedFace] = useState(0);
  const [isRotating, setIsRotating] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [rotationVelocity, setRotationVelocity] = useState({ x: 0, y: 0 });
  const { camera, viewport, gl } = useThree();

  // Payment method configuration
  const paymentMethods = {
    crypto_qr: {
      icon: "📱", // QR code icon will be added in text
      text: "Crypto QR",
      color: "#00ff00",
      description: "",
    },
    virtual_card: {
      icon: "💳",
      text: "Virtual Card",
      color: "#0080ff",
      description: "",
    },
    bank_qr: {
      icon: "🔲", // QR code icon instead of bank
      text: "Bank QR",
      color: "#004080",
      description: "",
    },
    voice_pay: {
      icon: "🎤", // Microphone icon for voice
      text: "Voice Pay",
      color: "#8000ff",
      description: "",
    },
    sound_pay: {
      icon: "🎵",
      text: "Sound Pay",
      color: "#ff8000",
      description: "",
    },
    onboard_crypto: {
      icon: "🚀",
      text: "On / Off Ramp - Onboard User / Merchant",
      color: "#ffff00",
      description: "",
    },
  };

  // Get enabled payment methods
  const enabledFaces = Object.keys(paymentMethods).filter((method) =>
    actualEnabledMethods.includes(method)
  );

  // Calculate which face is most visible to camera
  const getFrontFace = () => {
    if (!meshRef.current) return 0;

    const rotation = meshRef.current.rotation;
    const normalizedY =
      ((rotation.y % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const faceIndex = Math.round(normalizedY / (Math.PI / 3)) % 6;
    return Math.max(0, Math.min(enabledFaces.length - 1, faceIndex));
  };

  // Auto-rotation and manual rotation with momentum
  useFrame((state, delta) => {
    if (meshRef.current) {
      if (isRotating && !isDragging) {
        // Gentle auto-rotation
        meshRef.current.rotation.y += delta * 0.2;
        meshRef.current.rotation.x += delta * 0.05;
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
    }
  });

  // Handle cube click - select front-facing payment method
  const handleCubeClick = (event) => {
    event.stopPropagation();

    if (isDragging) return; // Don't select if we're dragging

    const frontFaceIndex = getFrontFace();
    const activeFace = enabledFaces[frontFaceIndex];

    console.log(
      "🎯 Cube clicked! Active face:",
      activeFace,
      "Index:",
      frontFaceIndex
    );

    setSelectedFace(frontFaceIndex);
    setIsRotating(false);

    if (onFaceSelected && activeFace) {
      onFaceSelected(activeFace, paymentMethods[activeFace]);
    }
  };

  // Enhanced mouse controls
  const handlePointerDown = (event) => {
    setIsDragging(true);
    setIsRotating(false);
    setLastMousePos({ x: event.clientX, y: event.clientY });
    gl.domElement.style.cursor = "grabbing";
  };

  const handlePointerMove = (event) => {
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
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    gl.domElement.style.cursor = "grab";

    // Resume auto-rotation after a delay
    setTimeout(() => {
      if (!isDragging) setIsRotating(true);
    }, 3000);
  };

  // Touch controls for mobile
  const handleTouchStart = (event) => {
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      setIsDragging(true);
      setIsRotating(false);
      setLastMousePos({ x: touch.clientX, y: touch.clientY });
    }
  };

  const handleTouchMove = (event) => {
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
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setTimeout(() => {
      if (!isDragging) setIsRotating(true);
    }, 3000);
  };

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
  }, [isDragging, lastMousePos]);

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
          color={hoveredFace ? "#00ff88" : "#00ff00"}
          transparent
          opacity={0.85}
          emissive={hoveredFace ? "#004400" : "#002200"}
          emissiveIntensity={0.6}
          roughness={0.1}
          metalness={0.3}
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
              {/* Face background plane */}
              <mesh
                position={facePositions[faceIndex]}
                rotation={faceRotations[faceIndex]}
              >
                <planeGeometry args={[2, 2]} />
                <meshBasicMaterial
                  color={config.color}
                  transparent
                  opacity={isActiveFace ? 0.3 : 0.15}
                />
              </mesh>

              {/* Icon text - positioned much higher to avoid overlap */}
              <Text
                position={[
                  textPosition[0],
                  textPosition[1] + 0.5,
                  textPosition[2],
                ]}
                rotation={faceRotations[faceIndex]}
                fontSize={0.3}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.02}
                outlineColor="#000000"
                fontWeight="bold"
              >
                {config.icon}
              </Text>

              {/* Method name - with multi-line support for long text */}
              {config.text.length > 15 ? (
                // Multi-line text for long payment method names
                <>
                  <Text
                    position={[
                      textPosition[0],
                      textPosition[1] + 0.05,
                      textPosition[2],
                    ]}
                    rotation={faceRotations[faceIndex]}
                    fontSize={0.15}
                    color="#ffffff"
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.02}
                    outlineColor="#000000"
                    fontWeight="bold"
                  >
                    {config.text.split(" - ")[0]}
                  </Text>
                  <Text
                    position={[
                      textPosition[0],
                      textPosition[1] - 0.15,
                      textPosition[2],
                    ]}
                    rotation={faceRotations[faceIndex]}
                    fontSize={0.15}
                    color="#ffffff"
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.02}
                    outlineColor="#000000"
                    fontWeight="bold"
                  >
                    {config.text.split(" - ")[1] || ""}
                  </Text>
                </>
              ) : (
                // Single line text for short payment method names
                <Text
                  position={[
                    textPosition[0],
                    textPosition[1] + 0.05,
                    textPosition[2],
                  ]}
                  rotation={faceRotations[faceIndex]}
                  fontSize={0.15}
                  color="#ffffff"
                  anchorX="center"
                  anchorY="middle"
                  outlineWidth={0.02}
                  outlineColor="#000000"
                  fontWeight="bold"
                >
                  {config.text}
                </Text>
              )}

              {/* Method-specific action text with larger font and better contrast */}
              <Text
                position={[
                  textPosition[0],
                  textPosition[1] - 0.4,
                  textPosition[2],
                ]}
                rotation={faceRotations[faceIndex]}
                fontSize={0.1}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.02}
                outlineColor="#000000"
                fontWeight="bold"
              >
                {method === "virtual_card"
                  ? "Tap To Pay"
                  : method === "voice_pay"
                  ? "Tap To Speak"
                  : method === "sound_pay"
                  ? "Tap To Pay"
                  : method.includes("qr")
                  ? "Tap To Scan"
                  : "Tap To Select"}
              </Text>
            </group>
          );
        })}
      </mesh>

      {/* Floating "Pay With" Text - moved right above cube */}
      <Html position={[2, 2, -3]} transform>
        <div
          style={{
            color: "#00ff00",
            fontSize: "28px",
            fontWeight: "bold",
            textAlign: "center",
            textShadow: "0 0 25px #00ff00a0, 0 0 40px #00ff0060",
            animation: "float 3s ease-in-out infinite",
            transform: "translate(-50%, -50%)",
            fontFamily: "'Segoe UI', Arial, sans-serif",
          }}
        >
          💎 Pay With
        </div>
      </Html>

      {/* Amount Display - moved further down to avoid overlaying cube */}
      <Html position={[2, -3.5, -3]} transform>
        <div
          style={{
            color: "white",
            fontSize: "28px",
            fontWeight: "bold",
            textAlign: "center",
            textShadow: "0 0 25px #00ff00a0",
            border: "3px solid #00ff00a0",
            borderRadius: "20px",
            padding: "12px 20px",
            background: "rgba(0, 255, 0, 0.15)",
            backdropFilter: "blur(15px)",
            transform: "translate(-50%, -50%)",
            fontFamily: "'Segoe UI', Arial, sans-serif",
            boxShadow: "0 0 30px rgba(0, 255, 0, 0.3)",
          }}
        >
          ${agent?.interaction_fee || "10.00"} USD
        </div>
      </Html>

      {/* Enhanced Lighting */}
      <pointLight
        position={[0, 0, -1]}
        color="#00ff00"
        intensity={0.8}
        distance={12}
      />
      <pointLight
        position={[3, 3, -3]}
        color="#ffffff"
        intensity={0.4}
        distance={8}
      />
      <pointLight
        position={[-3, -3, -3]}
        color="#0080ff"
        intensity={0.3}
        distance={8}
      />
    </group>
  );
};

// QR Code Display Component (replaces cube when crypto QR is selected)
const ARQRDisplay = ({ qrData, onBack, position = [0, 0, -3] }) => {
  return (
    <group>
      {/* QR Code Background Plane */}
      <mesh position={position}>
        <planeGeometry args={[3, 3]} />
        <meshStandardMaterial
          color="white"
          transparent
          opacity={0.95}
          emissive="#ffffff"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* QR Code */}
      <Html position={position} transform>
        <div
          style={{
            width: "250px",
            height: "250px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "white",
            borderRadius: "20px",
            padding: "20px",
            border: "3px solid #00ff00",
            boxShadow: "0 0 30px #00ff0080",
            transform: "translate(-50%, -50%)",
          }}
        >
          <QRCode
            value={qrData}
            size={180}
            style={{
              background: "white",
              padding: "10px",
              borderRadius: "10px",
            }}
          />
          <div
            style={{
              marginTop: "15px",
              fontSize: "14px",
              color: "#333",
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            Scan to Pay
          </div>
        </div>
      </Html>

      {/* Back Button */}
      <Html position={[0, position[1] - 2.5, position[2]]} transform>
        <button
          onClick={onBack}
          style={{
            background: "linear-gradient(135deg, #00ff00, #00cc00)",
            border: "none",
            borderRadius: "25px",
            padding: "10px 20px",
            color: "black",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "16px",
            boxShadow: "0 5px 15px rgba(0, 255, 0, 0.3)",
            transform: "translate(-50%, -50%)",
            transition: "all 0.3s ease",
          }}
          onMouseOver={(e) => {
            e.target.style.transform = "translate(-50%, -50%) scale(1.1)";
            e.target.style.boxShadow = "0 8px 25px rgba(0, 255, 0, 0.5)";
          }}
          onMouseOut={(e) => {
            e.target.style.transform = "translate(-50%, -50%) scale(1)";
            e.target.style.boxShadow = "0 5px 15px rgba(0, 255, 0, 0.3)";
          }}
        >
          ← Back to Cube
        </button>
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
    "onboard_crypto", // Top face (switched with bank_qr)
    "sound_pay", // Bottom face (switched with voice_pay)
    "voice_pay", // Back face (switched with sound_pay)
    "bank_qr", // Left face (switched with onboard_crypto)
  ],
}) => {
  const [currentView, setCurrentView] = useState("cube"); // 'cube' or 'qr'
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [agentPaymentConfig, setAgentPaymentConfig] = useState(null);
  const [actualEnabledMethods, setActualEnabledMethods] =
    useState(enabledMethods);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const cubeRef = useRef();

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
        // Use the passed enabledMethods prop instead of database config
        setActualEnabledMethods(enabledMethods);

        console.log("✅ Payment configuration loaded:", {
          enabledMethods: enabledMethods,
          hasWallet: !!config.config.walletAddress,
        });
      } catch (error) {
        console.error("❌ Failed to load payment configuration:", error);
        // Use passed enabledMethods as fallback instead of limited subset
        setActualEnabledMethods(enabledMethods);
      } finally {
        setIsLoadingConfig(false);
      }
    };

    loadPaymentConfig();
  }, [isOpen, agent?.id]);

  // Handle face selection
  const handleFaceSelected = async (methodKey, methodConfig) => {
    console.log("🎯 Payment method selected:", methodKey, methodConfig);
    setSelectedMethod({ key: methodKey, config: methodConfig });

    if (methodKey === "crypto_qr") {
      await handleCryptoQRSelection();
    } else if (methodKey === "onboard_crypto") {
      handleCryptoOnboarding();
    } else {
      // Show "Coming Soon" for other methods
      alert(
        `${methodConfig.text} - Coming Soon!\n\nThis payment method will be available in the next update.\n\nFor now, please use Crypto QR payment.`
      );
    }
  };

  // Handle Crypto QR selection - integrate with existing system
  const handleCryptoQRSelection = async () => {
    setIsGenerating(true);

    try {
      console.log("🔄 Generating crypto QR payment...");

      // Use wallet address from AgentSphere config if available
      const walletAddress =
        agentPaymentConfig?.config?.walletAddress ||
        agentPaymentConfig?.config?.recipientAddress ||
        agent?.agent_wallet_address ||
        agent?.payment_recipient_address;

      if (walletAddress) {
        console.log("💼 Using configured wallet address:", walletAddress);
      }

      // Use existing Morph payment service (primary blockchain)
      const morphPayment = await morphPaymentService.generateMorphAgentPayment(
        agent,
        paymentAmount || agent?.interaction_fee || 1
      );
      const qrPaymentData =
        morphPaymentService.generateMorphPaymentQRData(morphPayment);

      console.log("✅ QR data generated:", qrPaymentData);

      setQrData(qrPaymentData);
      setCurrentView("qr");
    } catch (error) {
      console.error("❌ Error generating QR:", error);
      alert("Error generating payment QR. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Crypto Onboarding
  const handleCryptoOnboarding = () => {
    console.log("🚀 Launching crypto onboarding...");

    // Create onboarding message
    const onboardingInfo = {
      title: "Get Started with Crypto Payments",
      steps: [
        "1. Install a crypto wallet (MetaMask, Trust Wallet, or Coinbase Wallet)",
        "2. Buy some USDT or ETH on Morph Network",
        "3. Return to scan QR codes for instant payments",
        "4. Enjoy seamless AR agent interactions!",
      ],
      networks: [
        "Morph Network (Primary)",
        "Ethereum",
        "Polygon",
        "Solana",
        "Hedera",
      ],
    };

    alert(
      `🚀 ${onboardingInfo.title}\n\n` +
        onboardingInfo.steps.join("\n") +
        "\n\n" +
        `Supported Networks:\n${onboardingInfo.networks.join("\n")}\n\n` +
        `Once you have a wallet, use the "Crypto QR" payment method to pay instantly!`
    );
  };

  // Handle back to cube
  const handleBackToCube = () => {
    setCurrentView("cube");
    setSelectedMethod(null);
    setQrData(null);
  };

  // Handle close
  const handleClose = () => {
    setCurrentView("cube");
    setSelectedMethod(null);
    setQrData(null);
    setAgentPaymentConfig(null);
    setActualEnabledMethods(enabledMethods);
    setIsLoadingConfig(false);
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: "rgba(0, 0, 0, 0.3)",
        backdropFilter: "blur(5px)",
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
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[0, 0, 10]} intensity={0.5} color="#00ff00" />

          {/* Render current view */}
          {currentView === "cube" && !isLoadingConfig && (
            <PaymentCube
              agent={agent}
              onFaceSelected={handleFaceSelected}
              actualEnabledMethods={actualEnabledMethods}
              cubeRef={cubeRef}
              isVisible={true}
            />
          )}

          {currentView === "qr" && qrData && (
            <ARQRDisplay
              qrData={qrData}
              onBack={handleBackToCube}
              position={[0, 0, -3]}
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
        <style jsx>{`
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
      </div>
    </div>
  );
};

export default CubePaymentEngine;
