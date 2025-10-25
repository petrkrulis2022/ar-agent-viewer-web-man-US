import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Rotating 3D Cube Component
const RotatingCube = () => {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.005;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial
        color="#00ff66"
        metalness={0.8}
        roughness={0.2}
        emissive="#00ff66"
        emissiveIntensity={0.3}
      />
    </mesh>
  );
};

const CubePayLanding = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-green-950 to-slate-950 flex flex-col items-center justify-center p-8">
      {/* 3D Cube Logo */}
      <div className="w-64 h-64 mb-8">
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00ff66" />
          <RotatingCube />
        </Canvas>
      </div>

      {/* CubePay Title */}
      <h1 className="text-7xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
        CubePay
      </h1>

      <p className="text-xl text-gray-400 mb-12 text-center max-w-2xl">
        The Future of Private Payment Solutions
      </p>

      {/* Navigation Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-5xl">
        {/* Landing Page Button */}
        <a
          href="/"
          className="group relative overflow-hidden bg-gradient-to-br from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white rounded-2xl p-8 text-center transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/50"
        >
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="text-4xl mb-3">🏠</div>
            <h3 className="text-xl font-bold mb-2">Landing Page</h3>
            <p className="text-sm text-green-100">Main homepage</p>
          </div>
        </a>

        {/* AgentSphere Button */}
        <a
          href="/agentsphere"
          className="group relative overflow-hidden bg-gradient-to-br from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-600 text-white rounded-2xl p-8 text-center transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/50"
        >
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="text-4xl mb-3">🌐</div>
            <h3 className="text-xl font-bold mb-2">AgentSphere</h3>
            <p className="text-sm text-blue-100">AI agent platform</p>
          </div>
        </a>

        {/* AR Viewer Button */}
        <a
          href="/ar-view"
          className="group relative overflow-hidden bg-gradient-to-br from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-600 text-white rounded-2xl p-8 text-center transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/50"
        >
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="text-4xl mb-3">📱</div>
            <h3 className="text-xl font-bold mb-2">AR Viewer</h3>
            <p className="text-sm text-purple-100">Augmented reality</p>
          </div>
        </a>

        {/* GitHub Button */}
        <a
          href="https://github.com/petrkrulis2022/ar-agent-viewer-web-man-US"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative overflow-hidden bg-gradient-to-br from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-2xl p-8 text-center transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-gray-500/50"
        >
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="text-xl font-bold mb-2">GitHub</h3>
            <p className="text-sm text-gray-100">Source code</p>
          </div>
        </a>
      </div>

      {/* Footer */}
      <div className="mt-16 text-center">
        <p className="text-gray-500 text-sm">
          Powered by blockchain technology • Secure • Private • Fast
        </p>
      </div>
    </div>
  );
};

export default CubePayLanding;
