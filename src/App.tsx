/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Text, 
  Float, 
  MeshTransmissionMaterial,
  Environment,
  ContactShadows
} from "@react-three/drei";
import * as THREE from "three";
import { Delete, Divide, Minus, Plus, X, Equal, RotateCcw } from "lucide-react";

// --- Calculator Logic Hook ---
function useCalculator() {
  const [display, setDisplay] = useState("0");
  const [equation, setEquation] = useState("");
  const [isResult, setIsResult] = useState(false);

  const handleNumber = (num: string) => {
    if (isResult) {
      setDisplay(num);
      setIsResult(false);
    } else {
      setDisplay(display === "0" ? num : display + num);
    }
  };

  const handleOperator = (op: string) => {
    setEquation(display + " " + op + " ");
    setDisplay("0");
    setIsResult(false);
  };

  const handleClear = () => {
    setDisplay("0");
    setEquation("");
    setIsResult(false);
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay("0");
    }
  };

  const handleEqual = () => {
    try {
      const fullEquation = equation + display;
      const result = new Function(`return ${fullEquation.replace(/×/g, "*").replace(/÷/g, "/")}`)();
      setDisplay(String(Number(result.toFixed(8))));
      setEquation("");
      setIsResult(true);
    } catch (error) {
      setDisplay("Error");
      setTimeout(handleClear, 1500);
    }
  };

  const handleDecimal = () => {
    if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  };

  return {
    display,
    equation,
    handleNumber,
    handleOperator,
    handleClear,
    handleBackspace,
    handleEqual,
    handleDecimal
  };
}

// --- 3D Components ---

const GlassMaterial = () => (
  <MeshTransmissionMaterial
    backside
    samples={16}
    thickness={0.2}
    chromaticAberration={0.05}
    anisotropy={0.1}
    distortion={0.1}
    distortionScale={0.1}
    temporalDistortion={0.1}
    clearcoat={1}
    attenuationDistance={0.5}
    attenuationColor="#ffffff"
    color="#ffffff"
    transparent
    opacity={0.5}
  />
);

const Button3D = ({ 
  position, 
  label, 
  onClick, 
  color = "#ffffff", 
  scale = [0.8, 0.8, 0.2],
  fontSize = 0.3
}: any) => {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.z = THREE.MathUtils.lerp(
        meshRef.current.position.z,
        pressed ? -0.05 : hovered ? 0.05 : 0,
        0.1
      );
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => {
          setHovered(false);
          setPressed(false);
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
          setPressed(true);
          onClick();
        }}
        onPointerUp={() => setPressed(false)}
      >
        <boxGeometry args={scale} />
        <meshPhysicalMaterial 
          color={hovered ? "#ffffff" : color} 
          transmission={0.8} 
          thickness={0.5} 
          roughness={0.1} 
          metalness={0.1}
          transparent
          opacity={0.6}
        />
        <Text
          position={[0, 0, scale[2] / 2 + 0.01]}
          fontSize={fontSize}
          color="white"
          anchorX="center"
          anchorY="middle"
          font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff"
        >
          {label}
        </Text>
      </mesh>
    </group>
  );
};

const Calculator3D = ({ logic }: { logic: any }) => {
  const { display, equation, handleNumber, handleOperator, handleClear, handleBackspace, handleEqual, handleDecimal } = logic;

  const buttons = [
    { label: "C", action: handleClear, color: "#ff4444" },
    { label: "÷", action: () => handleOperator("/"), color: "#ffaa00" },
    { label: "×", action: () => handleOperator("*"), color: "#ffaa00" },
    { label: "⌫", action: handleBackspace, color: "#ffaa00" },

    { label: "7", action: () => handleNumber("7") },
    { label: "8", action: () => handleNumber("8") },
    { label: "9", action: () => handleNumber("9") },
    { label: "-", action: () => handleOperator("-"), color: "#ffaa00" },

    { label: "4", action: () => handleNumber("4") },
    { label: "5", action: () => handleNumber("5") },
    { label: "6", action: () => handleNumber("6") },
    { label: "+", action: () => handleOperator("+"), color: "#ffaa00" },

    { label: "1", action: () => handleNumber("1") },
    { label: "2", action: () => handleNumber("2") },
    { label: "3", action: () => handleNumber("3") },
    { label: "=", action: handleEqual, color: "#0088ff" },

    { label: "0", action: () => handleNumber("0"), wide: true },
    { label: ".", action: handleDecimal },
  ];

  return (
    <group rotation={[0.2, -0.2, 0]}>
      {/* Main Body */}
      <mesh position={[0, 0, -0.2]}>
        <boxGeometry args={[4.5, 6, 0.4]} />
        <GlassMaterial />
      </mesh>

      {/* Screen Area */}
      <mesh position={[0, 2, 0.05]}>
        <boxGeometry args={[3.8, 1.2, 0.1]} />
        <meshPhysicalMaterial color="#000000" roughness={0.1} metalness={0.8} />
        <Text
          position={[1.7, 0.2, 0.06]}
          fontSize={0.2}
          color="#ffffff"
          fillOpacity={0.5}
          anchorX="right"
          font="https://fonts.gstatic.com/s/jetbrainsmono/v18/t6q243pW6_u7433_S6S6S6S6S6S6S6S6.woff"
        >
          {equation}
        </Text>
        <Text
          position={[1.7, -0.2, 0.06]}
          fontSize={0.5}
          color="#ffffff"
          anchorX="right"
          font="https://fonts.gstatic.com/s/jetbrainsmono/v18/t6q243pW6_u7433_S6S6S6S6S6S6S6S6.woff"
        >
          {display}
        </Text>
      </mesh>

      {/* Buttons Grid */}
      <group position={[-1.5, 0.8, 0.1]}>
        {buttons.map((btn, i) => {
          const row = Math.floor(i / 4);
          const col = i % 4;
          
          if (btn.wide) {
            return (
              <Button3D
                key={i}
                position={[0.5, -row * 1, 0]}
                label={btn.label}
                onClick={btn.action}
                color={btn.color}
                scale={[1.8, 0.8, 0.2]}
              />
            );
          }
          
          if (btn.label === ".") {
            return (
              <Button3D
                key={i}
                position={[2, -row * 1, 0]}
                label={btn.label}
                onClick={btn.action}
                color={btn.color}
              />
            );
          }

          if (btn.label === "=") {
            // Special handling for the equal button which is normally row-span in 2D
            // Here we just place it in the grid for simplicity in 3D
            return (
              <Button3D
                key={i}
                position={[col * 1, -row * 1, 0]}
                label={btn.label}
                onClick={btn.action}
                color={btn.color}
              />
            );
          }

          return (
            <Button3D
              key={i}
              position={[col * 1, -row * 1, 0]}
              label={btn.label}
              onClick={btn.action}
              color={btn.color}
            />
          );
        })}
      </group>
    </group>
  );
};

// --- Main App Component ---

export default function App() {
  const logic = useCalculator();

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/[0-9]/.test(e.key)) logic.handleNumber(e.key);
      if (e.key === "+") logic.handleOperator("+");
      if (e.key === "-") logic.handleOperator("-");
      if (e.key === "*") logic.handleOperator("*");
      if (e.key === "/") logic.handleOperator("/");
      if (e.key === "Enter" || e.key === "=") logic.handleEqual();
      if (e.key === "Backspace") logic.handleBackspace();
      if (e.key === "Escape") logic.handleClear();
      if (e.key === ".") logic.handleDecimal();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [logic]);

  return (
    <div className="w-full h-screen bg-[#050505] overflow-hidden relative">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-purple-900/20 blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full bg-blue-900/20 blur-[150px]" />
      </div>

      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />
        
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
          <Calculator3D logic={logic} />
        </Float>

        <ContactShadows position={[0, -4, 0]} opacity={0.4} scale={20} blur={2} far={4.5} />
        
        <Environment preset="city" />
        <OrbitControls 
          enablePan={false} 
          minDistance={5} 
          maxDistance={15} 
          makeDefault 
        />
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute bottom-8 left-0 right-0 text-center pointer-events-none z-10">
        <p className="text-white/30 text-[10px] uppercase tracking-[0.4em] font-medium">
          Real 3D Glassmorphic Engine • Three.js + R3F
        </p>
        <p className="text-white/10 text-[9px] mt-2">
          Rotate with Mouse • Scroll to Zoom
        </p>
      </div>
    </div>
  );
}
