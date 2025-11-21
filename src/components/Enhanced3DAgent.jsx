import React, { useRef, useState, useCallback, Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Box, Sphere, Cylinder, Torus, useGLTF } from "@react-three/drei";
import * as THREE from "three";

// Preload 3D models for better performance
useGLTF.preload("/models/terminals/humanoid_robot_face.glb");
useGLTF.preload("/models/terminals/pax-a920_highpoly.glb");

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

  return <primitive object={scene.clone()} scale={3.0} />;
};

const PaymentTerminalModel = ({ hovered }) => {
  const { scene } = useGLTF("/models/terminals/pax-a920_highpoly.glb");

  return (
    <primitive
      object={scene.clone()}
      scale={0.6}
      rotation={[Math.PI * 0.25, 0, 0]}
    />
  );
};

// Agent GLB Model Loader with error handling
const AgentGLBModel = ({ modelPath, meshRef }) => {
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
          child.material?.type
        );
      }
    });

    console.log(
      "🎨 AgentGLBModel loaded successfully:",
      modelPath,
      "Meshes:",
      meshCount
    );

    // Calculate appropriate scale based on model size
    const maxDimension = Math.max(size.x, size.y, size.z);
    const targetSize = 1.5; // Target size in units (reduced from 3.0 to make smaller)
    const autoScale = maxDimension > 0 ? targetSize / maxDimension : 1.0;

    console.log(
      "🎯 Auto-calculated scale:",
      autoScale,
      "for max dimension:",
      maxDimension
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
  const [hovered, setHovered] = useState(false);

  // Animation state
  const animationTime = useRef(0);
  const floatOffset = useRef(Math.random() * Math.PI * 2);
  const spinSpeed = useRef(0.05 + Math.random() * 0.05); // Reduced from 0.3 to 0.05 for slower spin

  // Animate the 3D model
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    animationTime.current += delta;

    // Slow spinning animation around Y axis
    groupRef.current.rotation.y += delta * spinSpeed.current;

    // Floating animation (gentle up/down movement)
    const floatIntensity = 0.15 * scale;
    const floatY =
      Math.sin(animationTime.current * 1.5 + floatOffset.current) *
      floatIntensity;
    groupRef.current.position.y = position[1] + floatY;

    // Subtle pulse effect when hovered (only if meshRef exists)
    if (meshRef.current && hovered) {
      const pulse = 1 + Math.sin(animationTime.current * 8) * 0.08;
      if (meshRef.current.scale) {
        meshRef.current.scale.setScalar(pulse);
      }
    } else if (meshRef.current && meshRef.current.scale) {
      meshRef.current.scale.setScalar(1);
    }
  });

  // Get agent color based on type
  const getAgentColor = (agentType) => {
    const colors = {
      // AgentSphere New Types (from deployments)
      intelligent_assistant: "#1e90ff", // Modern shining blue (DodgerBlue)
      local_services: "#32cd32", // Lime green
      payment_terminal: "#ffa500", // Orange
      trailing_payment_terminal: "#ffa500", // Orange
      my_ghost: "#9370db", // Medium purple
      game_agent: "#9370db", // Medium purple
      world_builder_3d: "#00ced1", // Dark turquoise
      home_security: "#dc143c", // Crimson
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
      "Home Security": "#dc143c", // Crimson
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
      train_agent: "/models/agents/train_agent.glb",
      hotel_agent: "/models/agents/hotel_agent.glb",
      flight_agent: "/models/agents/flight_agent.glb",
      restaurant_agent: "/models/agents/restarurant_agent.glb",
      travel_agent: "/models/agents/travel_agent.glb",
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
      return (
        <group ref={groupRef} position={position}>
          {/* Load GLB directly WITHOUT Suspense */}
          <AgentGLBModel
            modelPath={agentModelPaths[agentType]}
            meshRef={meshRef}
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

    // Check if this is a payment terminal (use payment terminal model)
    const isPaymentTerminal =
      agent.agent_type === "payment_terminal" ||
      agent.agent_type === "trailing_payment_terminal" ||
      agent.agent_type === "Payment Terminal" ||
      agent.agent_type === "Trailing Payment Terminal" ||
      agent.object_type === "payment_terminal" ||
      agent.object_type === "trailing_payment_terminal";

    console.log(`Payment terminal check:`, {
      isPaymentTerminal,
      willUseModel: isPaymentTerminal
        ? "pax-a920_highpoly"
        : "humanoid_robot_face",
    });

    // Use GLB models for all agents
    if (isPaymentTerminal) {
      // Payment Terminal - use PAX A920 model
      return (
        <group ref={meshRef}>
          <PaymentTerminalModel hovered={hovered} />

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
    } else {
      // All other agents - use Robotic Face model
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
    }
  }, [
    agent.agent_type,
    agent.object_type,
    agent.name,
    hovered,
    animationTime.current,
  ]);

  // Handle click event
  const handleClick = useCallback(
    (e) => {
      e.stopPropagation();
      if (onAgentClick) {
        onAgentClick(agent);
      }
    },
    [agent, onAgentClick]
  );

  // Distance-based scaling
  const distanceScale =
    Math.max(0.4, Math.min(2.0, 60 / Math.max(distance, 15))) * scale;

  return (
    <group
      ref={groupRef}
      position={[position[0], position[1], position[2]]}
      scale={[distanceScale, distanceScale, distanceScale]}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Enhanced 3D Model */}
      {getEnhanced3DModel()}

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
