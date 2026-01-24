import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text, Box } from "@react-three/drei";

// Lightweight rotating cube component for logo/branding
const RotatingPaymentCube = ({ size = 1 }) => {
  const meshRef = useRef();
  const [isRotating] = useState(true);

  // Auto-rotation animation
  useFrame((state, delta) => {
    if (meshRef.current && isRotating) {
      meshRef.current.rotation.y += delta * 0.3;
      meshRef.current.rotation.x += delta * 0.1;
    }
  });

  const paymentMethods = {
    crypto_qr: { icon: "📱", text: "Crypto QR", color: "#00ff00" },
    virtual_card: { icon: "💳", text: "Virtual Card", color: "#0080ff" },
    bank_qr: { icon: "🔲", text: "Bank QR", color: "#004080" },
    voice_pay: { icon: "🎤", text: "Voice Pay", color: "#8000ff" },
    sound_pay: { icon: "🎵", text: "Sound Pay", color: "#ff8000" },
    onboard: { icon: "🚀", text: "On/Off Ramp", color: "#ffff00" },
  };

  const enabledFaces = Object.keys(paymentMethods);

  const facePositions = [
    [1.24, 0, 0], // Right
    [-1.24, 0, 0], // Left
    [0, 1.24, 0], // Top
    [0, -1.24, 0], // Bottom
    [0, 0, 1.24], // Front
    [0, 0, -1.24], // Back
  ];

  const faceRotations = [
    [0, Math.PI / 2, 0], // Right
    [0, -Math.PI / 2, 0], // Left
    [-Math.PI / 2, 0, 0], // Top
    [Math.PI / 2, 0, 0], // Bottom
    [0, 0, 0], // Front
    [0, Math.PI, 0], // Back
  ];

  return (
    <group>
      {/* Main Cube */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <boxGeometry args={[2.5 * size, 2.5 * size, 2.5 * size]} />
        <meshStandardMaterial
          color="#00ff00"
          transparent
          opacity={0.85}
          emissive="#004400"
          emissiveIntensity={0.6}
          roughness={0.1}
          metalness={0.3}
        />
      </mesh>

      {/* Face Labels */}
      {enabledFaces.map((method, index) => {
        const config = paymentMethods[method];
        const faceIndex = index % 6;
        const position = facePositions[faceIndex].map((p) => p * size);
        const rotation = faceRotations[faceIndex];

        return (
          <group key={`face-${method}`}>
            {/* Face background */}
            <mesh position={position} rotation={rotation}>
              <planeGeometry args={[2 * size, 2 * size]} />
              <meshBasicMaterial
                color={config.color}
                transparent
                opacity={0.2}
              />
            </mesh>

            {/* Icon */}
            <Text
              position={[position[0], position[1] + 0.3 * size, position[2]]}
              rotation={rotation}
              fontSize={0.25 * size}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.02 * size}
              outlineColor="#000000"
              fontWeight="bold"
            >
              {config.icon}
            </Text>

            {/* Method Name */}
            <Text
              position={position}
              rotation={rotation}
              fontSize={0.15 * size}
              color="#000000"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.01 * size}
              outlineColor="#ffffff"
              fontWeight="bold"
            >
              {config.text}
            </Text>
          </group>
        );
      })}

      {/* Lighting */}
      <pointLight
        position={[0, 0, size * 2]}
        color="#00ff00"
        intensity={0.8}
        distance={12}
      />
    </group>
  );
};

// Wrapper component for easy embedding
const CubePayLogo = ({ width = 200, height = 200, cubeSize = 1 }) => {
  return (
    <div style={{ width, height }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ width: "100%", height: "100%", background: "transparent" }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.3} color="#0080ff" />
        <RotatingPaymentCube size={cubeSize} />
      </Canvas>
    </div>
  );
};

export default CubePayLogo;
