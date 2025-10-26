import React, { useRef, useState, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Box, Sphere, Cylinder, Torus, useGLTF } from "@react-three/drei";
import * as THREE from "three";

// Preload 3D models for better performance
useGLTF.preload("/models/terminals/humanoid_robot_face.glb");
useGLTF.preload("/models/terminals/pax-a920_highpoly.glb");

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
  const spinSpeed = useRef(0.3 + Math.random() * 0.2);

  // Animate the 3D model
  useFrame((state, delta) => {
    if (!groupRef.current || !meshRef.current) return;

    animationTime.current += delta;

    // Slow spinning animation around Y axis
    groupRef.current.rotation.y += delta * spinSpeed.current;

    // Floating animation (gentle up/down movement)
    const floatIntensity = 0.15 * scale;
    const floatY =
      Math.sin(animationTime.current * 1.5 + floatOffset.current) *
      floatIntensity;
    groupRef.current.position.y = position[1] + floatY;

    // Subtle pulse effect when hovered
    if (hovered) {
      const pulse = 1 + Math.sin(animationTime.current * 8) * 0.08;
      meshRef.current.scale.setScalar(pulse);
    } else {
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

    // Check if this is a payment terminal (use payment terminal model)
    const isPaymentTerminal =
      agent.agent_type === "payment_terminal" ||
      agent.agent_type === "trailing_payment_terminal" ||
      agent.agent_type === "Payment Terminal" ||
      agent.agent_type === "Trailing Payment Terminal" ||
      agent.object_type === "payment_terminal" ||
      agent.object_type === "trailing_payment_terminal";

    console.log(`🤖 Enhanced3DAgent rendering for ${agent.name}:`, {
      agent_type: agent.agent_type,
      object_type: agent.object_type,
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
