import React, { useRef, useState, useCallback, Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Box, Sphere, Cylinder, Torus, useGLTF } from "@react-three/drei";
import * as THREE from "three";

// Preload 3D models for better performance
useGLTF.preload("/models/terminals/humanoid_robot_face.glb");
useGLTF.preload("/models/terminals/my_personal_terminal.glb");
useGLTF.preload("/models/terminals/payment_terminal_test.glb");
useGLTF.preload("/models/terminals/p-o-s_terminal.glb");
useGLTF.preload("/models/terminals/atm_6_mb.glb");

// Preload agent 3D models
useGLTF.preload("/models/agents/bus_agent.glb");
useGLTF.preload("/models/agents/train_agent.glb");
useGLTF.preload("/models/agents/hotel_agent.glb");
useGLTF.preload("/models/agents/flight_agent.glb");
useGLTF.preload("/models/agents/restarurant_agent.glb");
useGLTF.preload("/models/agents/travel_agent.glb");

// 3D Model Components
const RoboticFaceModel = ({ hovered }) => {
  const { scene } = useGLTF("/models/terminals/humanoid_robot_face.glb");
  return <primitive object={scene.clone()} scale={0.05} />;
};

const MyPersonalTerminalModel = ({ hovered }) => {
  const { scene } = useGLTF("/models/terminals/payment_terminal_test.glb");
  return (
    <primitive
      object={scene.clone()}
      scale={0.015}
      position={[0, -0.1, 0]}
      rotation={[-Math.PI / 2 - 0.45, 0, Math.PI]}
    />
  );
};

const PaymentTerminalPOSModel = ({ hovered }) => {
  const { scene } = useGLTF("/models/terminals/my_personal_terminal.glb");
  return (
    <primitive
      object={scene.clone()}
      scale={0.05}
      position={[0, -0.5, 0]}
      rotation={[0, Math.PI / 4, 0]}
    />
  );
};

const VirtualATMModel = ({
  hovered,
  scale = 0.4,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) => {
  console.log("🏧 VirtualATMModel: Loading ATM model...");
  const { scene } = useGLTF("/models/terminals/atm_6_mb.glb");
  console.log("🏧 VirtualATMModel: ATM model loaded successfully!");
  return (
    <primitive
      object={scene.clone()}
      scale={scale}
      position={position}
      rotation={rotation}
    />
  );
};

// Agent GLB Model Loader with error handling
const AgentGLBModel = ({ modelPath, meshRef, targetSize = 1.5 }) => {
  try {
    console.log("🔄 useGLTF attempting to load:", modelPath);
    const gltf = useGLTF(modelPath);
    console.log("📦 useGLTF returned:", gltf);
    console.log("📦 Scene children count:", gltf?.scene?.children?.length);

    if (!gltf || !gltf.scene) {
      console.error("❌ useGLTF returned invalid data:", gltf);
      throw new Error("Invalid GLTF data");
    }

    const clonedScene = gltf.scene.clone();

    // Calculate bounding box to understand model size
    const box = new THREE.Box3().setFromObject(clonedScene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    console.log("📏 Model dimensions:", {
      width: size.x.toFixed(3),
      height: size.y.toFixed(3),
      depth: size.z.toFixed(3),
      center: {
        x: center.x.toFixed(3),
        y: center.y.toFixed(3),
        z: center.z.toFixed(3),
      },
    });

    // Log mesh information for debugging
    let meshCount = 0;
    clonedScene.traverse((child) => {
      if (child.isMesh) {
        meshCount++;
        console.log(
          "🔷 Mesh found:",
          child.name,
          "Material:",
          child.material?.type,
        );
      }
    });

    console.log(
      "🎨 AgentGLBModel loaded successfully:",
      modelPath,
      "Meshes:",
      meshCount,
    );

    // Calculate appropriate scale based on model size
    const maxDimension = Math.max(size.x, size.y, size.z);
    // targetSize is passed as prop (default 1.5)
    const autoScale = maxDimension > 0 ? targetSize / maxDimension : 1.0;

    console.log(
      "🎯 Auto-calculated scale:",
      autoScale,
      "for max dimension:",
      maxDimension,
    );

    return (
      <group ref={meshRef}>
        <primitive
          object={clonedScene}
          scale={autoScale}
          position={[0, -center.y * autoScale, 0]}
        />
        {/* Add strong lighting to ensure visibility */}
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 5, 5]} intensity={2} />
        <directionalLight position={[-5, 5, -5]} intensity={2} />
        <pointLight position={[0, 3, 0]} intensity={3} color="#ffffff" />
      </group>
    );
  } catch (error) {
    console.error("💥 AgentGLBModel error:", error);
    console.error("💥 Error stack:", error.stack);
    // Return error fallback sphere (red indicates error)
    return (
      <group ref={meshRef}>
        <Sphere args={[2]}>
          <meshStandardMaterial
            color="#ff0000"
            emissive="#ff0000"
            emissiveIntensity={1.0}
          />
        </Sphere>
      </group>
    );
  }
};

const Enhanced3DAgent = ({
  agent,
  position,
  distance,
  onAgentClick,
  scale = 1,
}) => {
  const meshRef = useRef();
  const groupRef = useRef();
  const hovered = false; // Hover animations disabled

  // DEBUG: Log position for ARTM agents
  if (
    agent?.agent_type === "artm_terminal" ||
    agent?.object_type === "virtual_terminal"
  ) {
    console.log("🏧 ARTM Position received:", {
      agent_name: agent?.name,
      position_x: position?.[0],
      position_y: position?.[1],
      position_z: position?.[2],
      full_position: position,
    });
  }

  // Animation state
  const animationTime = useRef(0);

  // Animate the 3D model - static position, no floating, no hover pulse
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    animationTime.current += delta;

    // Keep models at their exact position - no floating
    groupRef.current.position.y = position[1];
  });

  // Get agent color based on type
  const getAgentColor = (agentType) => {
    const colors = {
      // AgentSphere New Types (from deployments)
      intelligent_assistant: "#1e90ff", // Modern shining blue (DodgerBlue)
      local_services: "#32cd32", // Lime green
      payment_terminal: "#ffa500", // Orange
      pos_terminal: "#ffa500", // Orange
      trailing_payment_terminal: "#ffa500", // Orange
      my_ghost: "#9370db", // Medium purple
      game_agent: "#9370db", // Medium purple
      world_builder_3d: "#00ced1", // Dark turquoise
      virtual_terminal: "#0066ff", // Blue for ARTM
      my_payment_terminal: "#ff1493", // Deep pink
      content_creator: "#ff1493", // Deep pink
      real_estate_broker: "#32cd32", // Lime green
      bus_stop_agent: "#00ff00", // Pure green
      tutor_teacher: "#ffa500", // Orange
      study_buddy: "#ffd700", // Gold
      social_media_manager: "#da70d6", // Orchid
      data_analyst: "#4169e1", // Royal blue
      customer_support: "#20b2aa", // Light sea green
      marketplace_vendor: "#dc143c", // Crimson

      // Legacy object_type compatibility
      "Intelligent Assistant": "#1e90ff", // Modern shining blue (DodgerBlue)
      "Content Creator": "#ff1493", // Deep pink
      "Local Services": "#32cd32", // Lime green
      "Tutor/Teacher": "#ffa500", // Orange
      "Game Agent": "#9370db", // Medium purple
      "Bus Stop Agent": "#00ff00", // Pure green
      "Study Buddy": "#ffd700", // Gold
      artm_terminal: "#0066ff", // Blue for ARTM
      "Virtual Terminal": "#0066ff", // Blue for ARTM
      "Virtual Terminal (ARTM)": "#0066ff", // Blue for ARTM
      "Real Estate Broker": "#32cd32", // Lime green
      "Payment Terminal": "#ffa500", // Orange
      "World Builder 3D": "#00ced1", // Dark turquoise
      "My Ghost": "#9370db", // Medium purple

      // Fallback
      default: "#ffffff", // White fallback
    };
    return colors[agentType] || colors.default;
  };

  // Get agent geometry based on type
  const getAgentGeometry = (agentType) => {
    const baseSize = 0.4; // Increased base size for better visibility

    switch (agentType) {
      case "Intelligent Assistant":
        return <Box args={[baseSize, baseSize, baseSize]} />;
      case "Content Creator":
        return <Sphere args={[baseSize * 0.8]} />;
      case "Local Services":
        return (
          <Cylinder args={[baseSize * 0.6, baseSize * 0.6, baseSize * 1.2]} />
        );
      case "Tutor/Teacher":
        return <Torus args={[baseSize * 0.6, baseSize * 0.3]} />;
      case "Game Agent":
        return <Box args={[baseSize * 1.2, baseSize * 0.6, baseSize * 0.8]} />;
      default:
        return <Box args={[baseSize, baseSize, baseSize]} />;
    }
  };

  // Enhanced 3D models with GLB files for professional appearance
  const getEnhanced3DModel = useCallback(() => {
    const baseColor = getAgentColor(agent.agent_type);
    const emissiveColor = new THREE.Color(baseColor).multiplyScalar(0.35);

    const agentType = agent.agent_type || agent.object_type;

    // Map agent types to GLB models
    const agentModelPaths = {
      bus_agent: "/models/agents/bus_agent.glb",
      train_agent: "/models/agents/bus_agent.glb",
      hotel_agent: "/models/agents/bus_agent.glb",
      flight_agent: "/models/agents/bus_agent.glb",
      restaurant_agent: "/models/agents/bus_agent.glb",
      travel_agent: "/models/agents/bus_agent.glb",
    };

    // Debug logging
    console.log(`🤖 Enhanced3DAgent rendering for ${agent.name}:`, {
      agent_type: agent.agent_type,
      object_type: agent.object_type,
      agentType,
      hasCustomModel: !!agentModelPaths[agentType],
      modelPath: agentModelPaths[agentType],
    });

    // Check if this agent type has a custom GLB model
    if (agentModelPaths[agentType]) {
      console.log("✅ Loading custom agent model:", agentModelPaths[agentType]);

      // All agents use the same scale (1.5) - no special sizing
      const customScale = 1.5;

      console.log(
        `📏 Scaling agent ${agent.name} (${agentType}) to ${customScale}`,
      );

      return (
        <group ref={groupRef} position={position}>
          {/* Load GLB directly WITHOUT Suspense */}
          <AgentGLBModel
            modelPath={agentModelPaths[agentType]}
            meshRef={meshRef}
            targetSize={customScale}
          />

          {/* Add ambient glow */}
          <pointLight
            position={[0, 0.5, 0]}
            color={baseColor}
            intensity={hovered ? 1.5 : 1.0}
            distance={5}
          />
        </group>
      );
    }

    // Determine which model to use based on agent type
    // My Payment Terminal (my_payment_terminal) - uses payment_terminal_test.glb
    const isMyPaymentTerminal =
      agent.agent_type === "my_payment_terminal" ||
      agent.object_type === "my_payment_terminal";

    // Payment Terminal POS (pos_terminal) - uses p-o-s_terminal.glb
    const isPaymentTerminalPOS =
      agent.agent_type === "pos_terminal" ||
      agent.agent_type === "trailing_payment_terminal" ||
      agent.object_type === "pos_terminal" ||
      agent.object_type === "trailing_payment_terminal";

    // Virtual Terminal ARTM (artm_terminal) - uses atm_6_mb.glb
    const isVirtualTerminal =
      agent.agent_type === "artm_terminal" ||
      agent.object_type === "artm_terminal";

    console.log(`Model assignment check:`, {
      agent_type: agent.agent_type,
      object_type: agent.object_type,
      isMyPaymentTerminal,
      isPaymentTerminalPOS,
      isVirtualTerminal,
    });

    // Virtual Terminal ARTM (artm_terminal) - uses atm_6_mb.glb
    if (isVirtualTerminal) {
      console.log("🏧 ARTM: Rendering ARTM Terminal model");
      return (
        <group ref={meshRef}>
          <Suspense
            fallback={
              <mesh>
                <boxGeometry args={[0.5, 0.8, 0.3]} />
                <meshStandardMaterial
                  color="#0066ff"
                  emissive="#0066ff"
                  emissiveIntensity={0.5}
                />
              </mesh>
            }
          >
            <VirtualATMModel
              hovered={hovered}
              scale={0.05}
              position={[0, 0, 0]}
              rotation={[0, Math.PI / 4, 0]}
            />
          </Suspense>

          {/* Strong ambient lighting for full visibility */}
          <ambientLight intensity={1.0} />
          <directionalLight position={[0, 2, 2]} intensity={1.5} castShadow />
          <pointLight
            position={[0, 1, 1]}
            color="#0066ff"
            intensity={hovered ? 1.5 : 0.8}
            distance={4}
          />

          {/* ARTM Terminal glow effect */}
          {hovered &&
            [...Array(12)].map((_, i) => {
              const angle =
                (i / 12) * Math.PI * 2 + animationTime.current * 1.5;
              const radius = 1.8;
              return (
                <Sphere
                  key={i}
                  args={[0.06]}
                  position={[
                    Math.cos(angle) * radius,
                    Math.sin(animationTime.current * 2 + i) * 0.4,
                    Math.sin(angle) * radius,
                  ]}
                >
                  <meshStandardMaterial
                    color="#0066ff"
                    emissive="#0066ff"
                    emissiveIntensity={2}
                  />
                </Sphere>
              );
            })}
        </group>
      );
    }

    // My Payment Terminal (my_payment_terminal) - uses payment_terminal_test.glb
    if (isMyPaymentTerminal) {
      return (
        <group ref={meshRef}>
          <Suspense
            fallback={
              <mesh>
                <sphereGeometry args={[0.5, 32, 32]} />
                <meshStandardMaterial
                  color="#00ff88"
                  emissive="#00ff88"
                  emissiveIntensity={0.5}
                />
              </mesh>
            }
          >
            <MyPersonalTerminalModel hovered={hovered} />
          </Suspense>

          {/* Add ambient glow */}
          <pointLight
            position={[0, 0.5, 0]}
            color="#00ff88"
            intensity={hovered ? 1.2 : 0.6}
            distance={3}
          />

          {/* Personal terminal particles when hovered */}
          {hovered &&
            [...Array(8)].map((_, i) => {
              const angle = (i / 8) * Math.PI * 2 + animationTime.current * 2;
              const radius = 1.5;
              return (
                <Sphere
                  key={i}
                  args={[0.05]}
                  position={[
                    Math.cos(angle) * radius,
                    Math.sin(animationTime.current * 3 + i) * 0.3,
                    Math.sin(angle) * radius,
                  ]}
                >
                  <meshStandardMaterial
                    color="#00ff88"
                    emissive="#00ff88"
                    emissiveIntensity={1.2}
                    transparent
                    opacity={0.8}
                  />
                </Sphere>
              );
            })}
        </group>
      );
    }

    // Payment Terminal - POS (pos_terminal) - uses p-o-s_terminal.glb
    if (isPaymentTerminalPOS) {
      return (
        <group ref={meshRef}>
          <Suspense
            fallback={
              <mesh>
                <sphereGeometry args={[0.5, 32, 32]} />
                <meshStandardMaterial
                  color="#ffa500"
                  emissive="#ffa500"
                  emissiveIntensity={0.5}
                />
              </mesh>
            }
          >
            <PaymentTerminalPOSModel hovered={hovered} />
          </Suspense>

          {/* Add ambient glow for payment terminals */}
          <pointLight
            position={[0, 0.5, 0]}
            color="#ffa500"
            intensity={hovered ? 1.2 : 0.6}
            distance={3}
          />

          {/* Payment indicator particles when hovered */}
          {hovered &&
            [...Array(8)].map((_, i) => {
              const angle = (i / 8) * Math.PI * 2 + animationTime.current * 2;
              const radius = 1.5;
              return (
                <Sphere
                  key={i}
                  args={[0.05]}
                  position={[
                    Math.cos(angle) * radius,
                    Math.sin(animationTime.current * 3 + i) * 0.3,
                    Math.sin(angle) * radius,
                  ]}
                >
                  <meshStandardMaterial
                    color="#ffa500"
                    emissive="#ffa500"
                    emissiveIntensity={1.2}
                    transparent
                    opacity={0.8}
                  />
                </Sphere>
              );
            })}
        </group>
      );
    }

    // Virtual ATM
    if (isVirtualATM) {
      return (
        <group ref={meshRef}>
          <Suspense
            fallback={
              <mesh>
                <sphereGeometry args={[0.5, 32, 32]} />
                <meshStandardMaterial
                  color="#00ff00"
                  emissive="#00ff00"
                  emissiveIntensity={0.5}
                />
              </mesh>
            }
          >
            <VirtualATMModel hovered={hovered} />
          </Suspense>

          {/* Add ambient glow for ATM */}
          <pointLight
            position={[0, 0.5, 0]}
            color="#00ff00"
            intensity={hovered ? 1.2 : 0.6}
            distance={3}
          />

          {/* Cash/money particles when hovered */}
          {hovered &&
            [...Array(8)].map((_, i) => {
              const angle = (i / 8) * Math.PI * 2 + animationTime.current * 2;
              const radius = 1.5;
              return (
                <Sphere
                  key={i}
                  args={[0.05]}
                  position={[
                    Math.cos(angle) * radius,
                    Math.sin(animationTime.current * 3 + i) * 0.3,
                    Math.sin(angle) * radius,
                  ]}
                >
                  <meshStandardMaterial
                    color="#00ff00"
                    emissive="#00ff00"
                    emissiveIntensity={1.2}
                    transparent
                    opacity={0.8}
                  />
                </Sphere>
              );
            })}
        </group>
      );
    }

    // Default fallback - use Robotic Face model for other agent types
    return (
      <group ref={meshRef}>
        <RoboticFaceModel hovered={hovered} />

        {/* Add ambient glow for robotic agents */}
        <pointLight
          position={[0, 0.5, 0]}
          color={baseColor}
          intensity={hovered ? 1.0 : 0.5}
          distance={3}
        />

        {/* Data particles orbiting when hovered */}
        {hovered &&
          [...Array(6)].map((_, i) => {
            const orbitAngle =
              (i / 6) * Math.PI * 2 + animationTime.current * 0.5;
            const orbitRadius = 1.2;
            return (
              <Sphere
                key={i}
                args={[0.06]}
                position={[
                  Math.cos(orbitAngle) * orbitRadius,
                  Math.sin(orbitAngle * 2) * 0.3,
                  Math.sin(orbitAngle) * orbitRadius,
                ]}
              >
                <meshStandardMaterial
                  color={baseColor}
                  emissive={baseColor}
                  emissiveIntensity={0.9}
                  transparent
                  opacity={0.7}
                />
              </Sphere>
            );
          })}
      </group>
    );
  }, [agent.agent_type, agent.object_type, agent.name, hovered]);

  // Handle click event
  const handleClick = useCallback(
    (e) => {
      e.stopPropagation();
      if (onAgentClick) {
        onAgentClick(agent);
      }
    },
    [agent, onAgentClick],
  );

  // Distance-based scaling (reduce scale for my_payment_terminal to prevent oversizing)
  const isMyPaymentTerminal =
    agent.agent_type === "my_payment_terminal" ||
    agent.object_type === "my_payment_terminal";
  const maxScale = isMyPaymentTerminal ? 0.15 : 2.0;
  const distanceScale =
    Math.max(0.2, Math.min(maxScale, 60 / Math.max(distance, 15))) * scale;

  // Determine hit box size based on agent type
  // Reduced hit box for tighter clickable areas (prevents overlap when agents are close)
  const hitBoxArgs = [1.2, 2, 1.2];

  return (
    <group
      ref={groupRef}
      position={[position[0], position[1], position[2]]}
      scale={[distanceScale, distanceScale, distanceScale]}
      onClick={handleClick}
    >
      {/* Enhanced 3D Model */}
      {getEnhanced3DModel()}

      {/* Invisible Hit Box to ensure clickability */}
      <mesh visible={false}>
        <boxGeometry args={hitBoxArgs} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Distance label */}
      <Text
        position={[0, 1.8, 0]}
        fontSize={0.25}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="black"
      >
        {distance < 1000
          ? `${Math.round(distance)}m`
          : `${(distance / 1000).toFixed(1)}km`}
      </Text>

      {/* Agent name and type on hover */}
      {hovered && (
        <group>
          <Text
            position={[0, -1.2, 0]}
            fontSize={0.18}
            color="white"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="black"
            maxWidth={3}
          >
            {agent.name}
          </Text>
          <Text
            position={[0, -1.5, 0]}
            fontSize={0.12}
            color="#a855f7"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="black"
            maxWidth={3}
          >
            {agent.agent_type}
          </Text>
        </group>
      )}

      {/* Enhanced glow effect */}
      <pointLight
        position={[0, 0, 0]}
        color={getAgentColor(agent.agent_type)}
        intensity={hovered ? 1.0 : 0.4}
        distance={4}
        decay={2}
      />

      {/* Ambient particle effect when hovered */}
      {hovered && (
        <group>
          {[...Array(12)].map((_, i) => {
            const angle = (i / 12) * Math.PI * 2 + animationTime.current * 2;
            const radius = 2.5;
            return (
              <Sphere
                key={i}
                args={[0.03]}
                position={[
                  Math.cos(angle) * radius,
                  Math.sin(animationTime.current * 3 + i) * 0.5,
                  Math.sin(angle) * radius,
                ]}
              >
                <meshStandardMaterial
                  color={getAgentColor(agent.agent_type)}
                  emissiveIntensity={1.5}
                  transparent
                  opacity={0.7}
                />
              </Sphere>
            );
          })}
        </group>
      )}
    </group>
  );
};

export default Enhanced3DAgent;
