import React, { Suspense, useState, useEffect, useMemo } from "react";
import Spline from "@splinetool/react-spline";
import { motion, AnimatePresence } from "framer-motion";

/**
 * IA-SASE NEURAL CORE - STANDALONE VERSION
 * 
 * Instructions:
 * 1. Install dependencies: npm install framer-motion @splinetool/react-spline
 * 2. Ensure you have 'sase-orb.splinecode' in your public folder (or provide a remote URL).
 * 3. Copy this file into your project.
 */

export type CoreState = "normal" | "warning" | "alert" | "thinking";

interface SaseNeuralCoreProps {
  /** The current visual state of the core */
  state?: CoreState;
  /** Custom CSS classes */
  className?: string;
  /** Triggers a visual 'pulse' or 'reaction' */
  isInteracting?: boolean;
  /** Optional: Specify a custom spline scene URL */
  splineUrl?: string;
  /** Size of the core (e.g., "w-64 h-64") */
  size?: string;
}

const stateColors: Record<CoreState, string> = {
  normal: "#fbbf24",    // Gold
  warning: "#f59e0b",   // Amber
  alert: "#ef4444",     // Red
  thinking: "#3b82f6",  // Blue
};

export const SaseNeuralCore: React.FC<SaseNeuralCoreProps> = ({ 
  state = "normal", 
  className, 
  isInteracting = false,
  splineUrl = "/sase-orb.splinecode",
  size = "w-64 h-64"
}) => {
  const color = stateColors[state] || stateColors.normal;
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);

  // 1. Mouse Tracking (Sentient Eyes Logic)
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      // Normalize position to -1 to 1 range
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  // 2. Occasional Random Blink Logic
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const triggerBlink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150); // Blink duration
      
      const nextBlink = Math.random() * 4000 + 2000; // Random interval between 2-6s
      timeout = setTimeout(triggerBlink, nextBlink);
    };

    timeout = setTimeout(triggerBlink, 3000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className={`relative flex items-center justify-center overflow-hidden rounded-full transition-all duration-700 ${size} ${className || ""}`}>
      
      {/* BACKGROUND ATMOSPHERE (Consciousness Glow) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={state}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: 1, 
            scale: isInteracting ? 1.15 : 1,
            filter: isInteracting ? "blur(100px)" : "blur(80px)"
          }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 1.2, ease: "circOut" }}
          className="absolute inset-0 rounded-full"
          style={{ 
            background: `radial-gradient(circle, ${color}55 0%, transparent 70%)` 
          }}
        />
      </AnimatePresence>

      {/* TACTICAL HUD (Institutional Overlay) */}
      <div className="absolute inset-0 z-30 pointer-events-none opacity-40">
        <svg className="w-full h-full" viewBox="0 0 200 200">
          <defs>
            <filter id="glow-core">
              <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <motion.circle 
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            style={{ originX: "100px", originY: "100px" }}
            cx="100" cy="100" r="95" fill="none" stroke={color} strokeWidth="0.5" strokeDasharray="2 10" 
          />
          <circle cx="100" cy="100" r="90" fill="none" stroke={color} strokeWidth="1" strokeDasharray="40 160" opacity="0.3" filter="url(#glow-core)" />
        </svg>
      </div>

      {/* CORE CONTAINER (Spline Model Face) */}
      <div className="relative w-[90%] h-[90%] z-10 group bg-transparent">
        <Suspense fallback={
          <div className="w-full h-full flex items-center justify-center bg-slate-900/20 rounded-full animate-pulse border border-white/5">
            <div className="w-8 h-8 border-2 border-white/5 border-t-white/40 rounded-full animate-spin" />
          </div>
        }>
          <Spline 
            scene={splineUrl}
            className={`w-full h-full transform scale-125 transition-all duration-1000 ${isInteracting ? 'brightness-125' : 'brightness-100'}`}
          />
        </Suspense>

        {/* NEURAL EYES (Sentient Layer) - Independent of 3D model geometry */}
        <div 
          className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none"
          style={{
            transform: `translate(${mousePos.x * 12}px, ${mousePos.y * 12}px)`
          }}
        >
          <div className="flex gap-16 md:gap-20">
             {/* Left Eye */}
             <motion.div 
               animate={{ 
                 scaleY: isBlinking ? 0.05 : (state === 'thinking' ? [1, 1.2, 1] : 1),
                 opacity: isBlinking ? 0.5 : 0.9
               }}
               transition={isBlinking ? { duration: 0.1 } : { duration: 0.5 }}
               className="size-2 md:size-3 bg-white rounded-full shadow-[0_0_15px_white,0_0_5px_rgba(255,255,255,0.5)]" 
             />
             {/* Right Eye */}
             <motion.div 
               animate={{ 
                 scaleY: isBlinking ? 0.05 : (state === 'thinking' ? [1, 1.2, 1] : 1),
                 opacity: isBlinking ? 0.5 : 0.9
               }}
               transition={isBlinking ? { duration: 0.1 } : { duration: 0.5 }}
               className="size-2 md:size-3 bg-white rounded-full shadow-[0_0_15px_white,0_0_5px_rgba(255,255,255,0.5)]" 
             />
          </div>
        </div>

        {/* ADAPTIVE COLOR FILTERS (Floods the 3D model with current state color) */}
        {/* Layer 1: Base Tint */}
        <motion.div
          animate={{ 
            backgroundColor: `${color}33`,
            boxShadow: `inset 0 0 100px ${color}44, 0 0 60px ${color}33`
          }}
          transition={{ duration: 1 }}
          style={{ mixBlendMode: "overlay" }}
          className="absolute inset-0 pointer-events-none rounded-full border border-white/[0.08]"
        />
        
        {/* Layer 2: Central Glow / Saturation */}
        <motion.div
           animate={{ 
             background: `radial-gradient(circle, ${color}66 0%, transparent 60%)`,
           }}
           transition={{ duration: 1 }}
           style={{ mixBlendMode: "screen" }}
           className="absolute inset-0 pointer-events-none rounded-full opacity-60"
        />

        {/* VITAL HEARTBEAT (Horizontal Scan Line) */}
        <motion.div 
          animate={{ 
            top: ["15%", "85%", "15%"], 
            opacity: [0, 0.4, 0],
            backgroundColor: color
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-[25%] right-[25%] h-[1px] z-50 blur-[1.5px]"
        />
      </div>

      {/* Hide Spline Watermark locally */}
      <style>{`
        .spline-watermark { display: none !important; }
      `}</style>
    </div>
  );
};
