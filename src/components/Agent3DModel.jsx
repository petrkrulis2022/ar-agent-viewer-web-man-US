import React, { useRef, useState, useCallback, Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Box, Sphere, Cylinder, Torus, useGLTF } from "@react-three/drei";
import * as THREE from "three";

// Preload agent 3D models
useGLTF.preload("/models/agents/bus_agent.glb");
useGLTF.preload("/models/agents/train_agent.glb");
useGLTF.preload("/models/agents/hotel_agent.glb");
useGLTF.preload("/models/agents/flight_agent.glb");
useGLTF.preload("/models/agents/restarurant_agent.glb");
useGLTF.preload("/models/agents/travel_agent.glb");

// Component to load and display GLB models
const GLBModel = ({ modelPath, meshRef }) => {
  const { scene } = useGLTF(modelPath);
  const clonedScene = scene.clone();

  return <primitive ref={meshRef} object={clonedScene} scale={0.5} />;
};

const Agent3DModel = ({
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
  const floatOffset = useRef(Math.random() * Math.PI * 2); // Random starting phase
  const spinSpeed = useRef(0.3 + Math.random() * 0.2); // Slight variation in spin speed

  // Animate the 3D model
  useFrame((state, delta) => {
    if (!groupRef.current || !meshRef.current) return;

    animationTime.current += delta;

    // Slow spinning animation around Y axis
    groupRef.current.rotation.y += delta * spinSpeed.current;

    // Floating animation (gentle up/down movement)
    const floatIntensity = 0.02 * scale; // Very subtle bob
    const floatY =
      Math.sin(animationTime.current * 1.5 + floatOffset.current) *
      floatIntensity;
    groupRef.current.position.y = position[1] + floatY;

    // Subtle pulse effect when hovered
    if (hovered) {
      const pulse = 1 + Math.sin(animationTime.current * 8) * 0.05;
      meshRef.current.scale.setScalar(pulse);
    } else {
      meshRef.current.scale.setScalar(1);
    }
  });

  // Get 3D model based on agent type
  const getAgentModel = useCallback(() => {
    const baseColor = getAgentColor(agent.agent_type || agent.object_type);
    const emissiveColor = new THREE.Color(baseColor).multiplyScalar(0.2);

    const commonMaterial = {
      color: baseColor,
      emissive: emissiveColor,
      emissiveIntensity: hovered ? 0.3 : 0.1,
      metalness: 0.7,
      roughness: 0.3,
    };

    const agentType = agent.agent_type || agent.object_type;

    // Debug logging
    console.log("🤖 Agent Model Loading:", {
      agentName: agent.name,
      agentType: agentType,
      object_type: agent.object_type,
      agent_type: agent.agent_type,
    });

    // Check if we have a GLB model for this agent type
    const agentModelPaths = {
      bus_agent: "/models/agents/bus_agent.glb",
      train_agent: "/models/agents/train_agent.glb",
      hotel_agent: "/models/agents/hotel_agent.glb",
      flight_agent: "/models/agents/flight_agent.glb",
      restaurant_agent: "/models/agents/restarurant_agent.glb", // Note: typo in filename
      travel_agent: "/models/agents/travel_agent.glb",
    };

    // If agent type has a 3D model, load it
    if (agentModelPaths[agentType]) {
      console.log("✅ Loading 3D model:", agentModelPaths[agentType]);
      return (
        <Suspense
          fallback={
            <Box ref={meshRef} args={[0.8, 0.8, 0.8]}>
              <meshStandardMaterial {...commonMaterial} />
            </Box>
          }
        >
          <GLBModel modelPath={agentModelPaths[agentType]} meshRef={meshRef} />
        </Suspense>
      );
    }

    console.log(
      "⚠️ No 3D model found for agent type:",
      agentType,
      "Using geometric fallback",
    );

    // Fallback to geometric shapes for other agent types
    switch (agentType) {
      case "intelligent_assistant":
      case "Intelligent Assistant":
        return (
          <group>
            {/* Main body - cube with rounded edges */}
            <Box ref={meshRef} args={[0.8, 0.8, 0.8]} position={[0, 0, 0]}>
              <meshStandardMaterial {...commonMaterial} />
            </Box>
            {/* Floating ring around the cube */}
            <Torus
              args={[0.6, 0.08, 8, 16]}
              position={[0, 0, 0]}
              rotation={[Math.PI / 4, 0, 0]}
            >
              <meshStandardMaterial
                {...commonMaterial}
                transparent
                opacity={0.7}
              />
            </Torus>
          </group>
        );

      case "my_payment_terminal":
      case "My Payment Terminal":
        return (
          <group>
            {/* Crystalline structure */}
            <Box ref={meshRef} args={[0.6, 1.2, 0.6]} position={[0, 0, 0]}>
              <meshStandardMaterial {...commonMaterial} />
            </Box>
            <Box
              args={[1.2, 0.6, 0.6]}
              position={[0, 0, 0]}
              rotation={[0, 0, Math.PI / 4]}
            >
              <meshStandardMaterial
                {...commonMaterial}
                transparent
                opacity={0.8}
              />
            </Box>
          </group>
        );

      case "local_services":
      case "Local Services":
        return (
          <group>
            {/* Cylindrical tower */}
            <Cylinder
              ref={meshRef}
              args={[0.4, 0.6, 1.2, 8]}
              position={[0, 0, 0]}
            >
              <meshStandardMaterial {...commonMaterial} />
            </Cylinder>
            {/* Top sphere */}
            <Sphere args={[0.3]} position={[0, 0.8, 0]}>
              <meshStandardMaterial {...commonMaterial} />
            </Sphere>
          </group>
        );

      case "tutor_teacher":
      case "Tutor/Teacher":
      case "study_buddy":
      case "Study Buddy":
        return (
          <group>
            {/* Book-like structure */}
            <Box ref={meshRef} args={[1.0, 0.2, 0.8]} position={[0, 0, 0]}>
              <meshStandardMaterial {...commonMaterial} />
            </Box>
            <Box
              args={[1.0, 0.2, 0.8]}
              position={[0, 0.3, 0]}
              rotation={[0, 0, -0.1]}
            >
              <meshStandardMaterial
                {...commonMaterial}
                transparent
                opacity={0.9}
              />
            </Box>
          </group>
        );

      case "game_agent":
      case "Game Agent":
        return (
          <group>
            {/* Geometric gaming shape */}
            <Box
              ref={meshRef}
              args={[0.8, 0.8, 0.8]}
              position={[0, 0, 0]}
              rotation={[Math.PI / 4, Math.PI / 4, 0]}
            >
              <meshStandardMaterial {...commonMaterial} />
            </Box>
            {/* Orbiting elements */}
            <Sphere args={[0.15]} position={[0.8, 0, 0]}>
              <meshStandardMaterial {...commonMaterial} />
            </Sphere>
          </group>
        );

      case "pos_terminal":
      case "trailing_payment_terminal":
      case "Payment Terminal":
        return (
          <group>
            {/* Payment terminal kiosk */}
            <Box ref={meshRef} args={[0.6, 1.0, 0.4]} position={[0, 0, 0]}>
              <meshStandardMaterial {...commonMaterial} />
            </Box>
            {/* Screen */}
            <Box args={[0.4, 0.3, 0.05]} position={[0, 0.2, 0.25]}>
              <meshStandardMaterial
                color="#000000"
                emissive="#00ff00"
                emissiveIntensity={0.3}
              />
            </Box>
          </group>
        );

      case "bus_stop_agent":
      case "Bus Stop Agent":
        return (
          <group>
            {/* Bus stop sign */}
            <Cylinder
              ref={meshRef}
              args={[0.1, 0.1, 1.5, 8]}
              position={[0, 0, 0]}
            >
              <meshStandardMaterial {...commonMaterial} />
            </Cylinder>
            {/* Sign board */}
            <Box args={[0.8, 0.4, 0.1]} position={[0, 0.6, 0]}>
              <meshStandardMaterial {...commonMaterial} />
            </Box>
          </group>
        );

      // home_security type removed - use my_payment_terminal instead
      case "deprecated_home_security":
      case "Home Security":
        return (
          <group>
            {/* Security camera */}
            <Sphere ref={meshRef} args={[0.4]} position={[0, 0, 0]}>
              <meshStandardMaterial {...commonMaterial} />
            </Sphere>
            {/* Camera lens */}
            <Cylinder args={[0.15, 0.2, 0.3, 8]} position={[0, 0, 0.4]}>
              <meshStandardMaterial color="#000000" />
            </Cylinder>
          </group>
        );

      case "world_builder_3d":
      case "World Builder 3D":
        return (
          <group>
            {/* 3D building blocks */}
            <Box ref={meshRef} args={[0.6, 0.6, 0.6]} position={[0, 0, 0]}>
              <meshStandardMaterial {...commonMaterial} />
            </Box>
            <Box args={[0.4, 0.4, 0.4]} position={[0.5, 0.5, 0.5]}>
              <meshStandardMaterial
                {...commonMaterial}
                transparent
                opacity={0.8}
              />
            </Box>
          </group>
        );

      case "my_ghost":
      case "My Ghost":
        return (
          <group>
            {/* Ghost-like ethereal form */}
            <Sphere ref={meshRef} args={[0.5]} position={[0, 0, 0]}>
              <meshStandardMaterial
                {...commonMaterial}
                transparent
                opacity={0.7}
              />
            </Sphere>
            {/* Floating tail */}
            <Sphere args={[0.3]} position={[0, -0.6, 0]}>
              <meshStandardMaterial
                {...commonMaterial}
                transparent
                opacity={0.5}
              />
            </Sphere>
          </group>
        );

      case "real_estate_broker":
      case "Real Estate Broker":
        return (
          <group>
            {/* House-like structure */}
            <Box ref={meshRef} args={[0.8, 0.6, 0.8]} position={[0, -0.2, 0]}>
              <meshStandardMaterial {...commonMaterial} />
            </Box>
            {/* Roof */}
            <Box
              args={[0.9, 0.3, 0.9]}
              position={[0, 0.3, 0]}
              rotation={[0, Math.PI / 4, 0]}
            >
              <meshStandardMaterial {...commonMaterial} />
            </Box>
          </group>
        );

      default:
        return (
          <Box ref={meshRef} args={[0.8, 0.8, 0.8]} position={[0, 0, 0]}>
            <meshStandardMaterial {...commonMaterial} />
          </Box>
        );
    }
  }, [agent.agent_type, agent.object_type, hovered]);

  // Get agent color based on type
  const getAgentColor = (agentType) => {
    const colors = {
      // AgentSphere New Types (from deployments)
      intelligent_assistant: "#1e90ff", // Modern shining blue (DodgerBlue)
      local_services: "#10b981", // Green
      payment_terminal: "#f59e0b", // Orange
      trailing_payment_terminal: "#f59e0b", // Orange
      my_ghost: "#8b5cf6", // Purple
      game_agent: "#8b5cf6", // Purple
      world_builder_3d: "#06b6d4", // Cyan
      home_security: "#dc2626", // Red
      content_creator: "#ec4899", // Pink
      real_estate_broker: "#10b981", // Green
      bus_stop_agent: "#22c55e", // Green
      tutor_teacher: "#f59e0b", // Orange
      social_media_manager: "#d946ef", // Purple
      data_analyst: "#4f46e5", // Indigo
      customer_support: "#059669", // Emerald
      marketplace_vendor: "#dc2626", // Red
      study_buddy: "#fbbf24", // Yellow

      // Legacy object_type compatibility
      "Intelligent Assistant": "#1e90ff", // Modern shining blue (DodgerBlue)
      "Content Creator": "#ec4899", // Pink
      "Local Services": "#10b981", // Green
      "Tutor/Teacher": "#f59e0b", // Orange
      "Game Agent": "#8b5cf6", // Purple
      "Bus Stop Agent": "#22c55e", // Green
      "Study Buddy": "#fbbf24", // Yellow
      "Home Security": "#dc2626", // Red
      "Real Estate Broker": "#10b981", // Green
      "Payment Terminal": "#f59e0b", // Orange
      "World Builder 3D": "#06b6d4", // Cyan
      "My Ghost": "#8b5cf6", // Purple
    };
    return colors[agentType] || "#3b82f6";
  };

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

  // Distance-based scaling (closer = larger)
  const distanceScale =
    Math.max(0.3, Math.min(1.5, 50 / Math.max(distance, 10))) * scale;

  return (
    <group
      ref={groupRef}
      position={[position[0], position[1], position[2]]}
      scale={[distanceScale, distanceScale, distanceScale]}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* 3D Model */}
      {getAgentModel()}

      {/* Distance label */}
      <Text
        position={[0, 1.2, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="black"
      >
        {distance < 1000
          ? `${Math.round(distance)}m`
          : `${(distance / 1000).toFixed(1)}km`}
      </Text>

      {/* Agent name on hover */}
      {hovered && (
        <Text
          position={[0, -0.8, 0]}
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="black"
          maxWidth={2}
        >
          {agent.name}
        </Text>
      )}

      {/* Glow effect */}
      <pointLight
        position={[0, 0, 0]}
        color={getAgentColor(agent.agent_type || agent.object_type)}
        intensity={hovered ? 0.5 : 0.2}
        distance={2}
      />
    </group>
  );
};

export default Agent3DModel;
