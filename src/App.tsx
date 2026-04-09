/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { Delete, Divide, Minus, Plus, X, Equal, RotateCcw } from "lucide-react";

export default function App() {
  const [display, setDisplay] = useState("0");
  const [equation, setEquation] = useState("");
  const [isResult, setIsResult] = useState(false);

  // 3D Tilt Effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

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
      // Using Function constructor as a safer alternative to eval for simple math
      // In a real app, use a proper math parser
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

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/[0-9]/.test(e.key)) handleNumber(e.key);
      if (e.key === "+") handleOperator("+");
      if (e.key === "-") handleOperator("-");
      if (e.key === "*") handleOperator("*");
      if (e.key === "/") handleOperator("/");
      if (e.key === "Enter" || e.key === "=") handleEqual();
      if (e.key === "Backspace") handleBackspace();
      if (e.key === "Escape") handleClear();
      if (e.key === ".") handleDecimal();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [display, equation, isResult]);

  const Button = ({ 
    children, 
    onClick, 
    className = "", 
    variant = "default" 
  }: { 
    children: React.ReactNode; 
    onClick: () => void; 
    className?: string;
    variant?: "default" | "operator" | "action" | "equal";
  }) => {
    const variants = {
      default: "bg-white/10 hover:bg-white/20 border-white/10",
      operator: "bg-orange-500/20 hover:bg-orange-500/30 border-orange-500/20 text-orange-300",
      action: "bg-red-500/20 hover:bg-red-500/30 border-red-500/20 text-red-300",
      equal: "bg-blue-500/30 hover:bg-blue-500/40 border-blue-500/30 text-blue-200",
    };

    return (
      <motion.button
        whileHover={{ scale: 1.05, translateZ: 20 }}
        whileTap={{ scale: 0.95, translateZ: 0 }}
        onClick={onClick}
        className={`
          flex items-center justify-center rounded-2xl border backdrop-blur-md 
          transition-colors duration-200 text-xl font-medium h-16 w-full
          ${variants[variant]} ${className}
        `}
        style={{ transformStyle: "preserve-3d" }}
      >
        {children}
      </motion.button>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0510] flex items-center justify-center p-4 overflow-hidden font-sans text-white selection:bg-blue-500/30">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-pink-600/10 blur-[100px]" />
      </div>

      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative w-full max-w-[360px]"
      >
        {/* Calculator Body */}
        <div className="relative bg-white/5 backdrop-blur-2xl border border-white/20 rounded-[40px] p-8 shadow-2xl shadow-black/50">
          {/* Display */}
          <div className="mb-8 space-y-1">
            <div className="h-6 text-right text-white/40 text-sm font-mono tracking-wider overflow-hidden">
              {equation}
            </div>
            <div className="h-16 flex items-center justify-end text-5xl font-light tracking-tighter overflow-hidden">
              {display}
            </div>
          </div>

          {/* Buttons Grid */}
          <div className="grid grid-cols-4 gap-4">
            <Button onClick={handleClear} variant="action">
              <RotateCcw size={20} />
            </Button>
            <Button onClick={() => handleOperator("/")} variant="operator">
              <Divide size={20} />
            </Button>
            <Button onClick={() => handleOperator("*")} variant="operator">
              <X size={20} />
            </Button>
            <Button onClick={handleBackspace} variant="operator">
              <Delete size={20} />
            </Button>

            <Button onClick={() => handleNumber("7")}>7</Button>
            <Button onClick={() => handleNumber("8")}>8</Button>
            <Button onClick={() => handleNumber("9")}>9</Button>
            <Button onClick={() => handleOperator("-")} variant="operator">
              <Minus size={20} />
            </Button>

            <Button onClick={() => handleNumber("4")}>4</Button>
            <Button onClick={() => handleNumber("5")}>5</Button>
            <Button onClick={() => handleNumber("6")}>6</Button>
            <Button onClick={() => handleOperator("+")} variant="operator">
              <Plus size={20} />
            </Button>

            <Button onClick={() => handleNumber("1")}>1</Button>
            <Button onClick={() => handleNumber("2")}>2</Button>
            <Button onClick={() => handleNumber("3")}>3</Button>
            <Button onClick={handleEqual} variant="equal" className="row-span-2 h-full">
              <Equal size={24} />
            </Button>

            <Button onClick={() => handleNumber("0")} className="col-span-2">0</Button>
            <Button onClick={handleDecimal}>.</Button>
          </div>
        </div>

        {/* Decorative Glass Reflection */}
        <div className="absolute inset-0 rounded-[40px] pointer-events-none border border-white/10 bg-gradient-to-br from-white/5 to-transparent" />
      </motion.div>

      {/* Footer Info */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-white/20 text-[10px] uppercase tracking-[0.3em] font-medium">
          3D Glassmorphic Interface • v1.0
        </p>
      </div>
    </div>
  );
}
