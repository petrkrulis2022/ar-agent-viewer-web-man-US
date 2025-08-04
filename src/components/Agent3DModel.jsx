import React, { useRef, useState, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Box, Sphere, Cylinder, Torus } from "@react-three/drei";
import * as THREE from "three";

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
    const floatIntensity = 0.1 * scale; // Scale with distance
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

      case "content_creator":
      case "Content Creator":
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
      // Enhanced AgentSphere types
      intelligent_assistant: "#3b82f6", // Blue
      local_services: "#10b981", // Green
      payment_terminal: "#f59e0b", // Orange
      content_creator: "#ec4899", // Pink
      tutor_teacher: "#f59e0b", // Orange
      game_agent: "#8b5cf6", // Purple
      threed_world_modelling: "#06b6d4", // Cyan
      social_media_manager: "#d946ef", // Purple
      data_analyst: "#4f46e5", // Indigo
      customer_support: "#059669", // Emerald
      marketplace_vendor: "#dc2626", // Red

      // Legacy object_type compatibility
      "Intelligent Assistant": "#3b82f6", // Blue
      "Content Creator": "#ec4899", // Pink
      "Local Services": "#10b981", // Green
      "Tutor/Teacher": "#f59e0b", // Orange
      "Game Agent": "#8b5cf6", // Purple
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
    [agent, onAgentClick]
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
