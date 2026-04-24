import React, { useEffect, useRef } from "react";
import { motion, useSpring } from "framer-motion";
import type { SystemState } from "../types/systemState";

interface SaseSplineOrbProps {
  state: SystemState;
  className?: string;
  isInteracting?: boolean;
  accentColor?: string;
  showAura?: boolean;
  showGlow?: boolean;
}

export const SaseSplineOrb: React.FC<SaseSplineOrbProps> = ({
  state,
  className,
  accentColor,
  showAura = true,
  showGlow = true,
}) => {
  const sphereRef = useRef<HTMLDivElement>(null);

  // Map institutional states to official copilot colors

  // Map institutional states to official copilot colors
  const getStateColor = (s: string) => {
    if (accentColor) return accentColor;
    switch (s) {
      case 'warning': return '#FFB800';   // Radiant Amber
      case 'alert': return '#FF4B91';     // Pulse Pink
      case 'thinking': return '#22c55e';  // Green (Thinking/Active)
      case 'normal':
      default: return '#22c55e';          // Green Institutional (Main)
    }
  };

  const color = getStateColor(state);
  const eyeMoveFactor = state === 'alert' ? 0.14 : 0.1;

  // Softer eye tracking keeps Sasito readable even in compact placements.
  const eyeX = useSpring(0, { stiffness: 250, damping: 20 });
  const eyeY = useSpring(0, { stiffness: 250, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (sphereRef.current) {
        const rect = sphereRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        const sensitivity = state === 'alert' ? rect.width * 0.09 : rect.width * 0.12;
        const maxMove = rect.width * eyeMoveFactor;
        
        const moveX = (deltaX / (distance || 1)) * Math.min(distance / sensitivity, maxMove);
        const moveY = (deltaY / (distance || 1)) * Math.min(distance / sensitivity, maxMove);
        
        eyeX.set(moveX);
        eyeY.set(moveY);

      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [state, eyeX, eyeY]);

  // Exact 3D Gradients from source - ENHANCED for higher fidelity (Soft Radial Lavanda/Cian)
  const get3DGradient = (s: string) => {
    const baseColor = getStateColor(s);
    // Atmospheric Refraction: Professional Green with refractive depth
    return `radial-gradient(circle at 35% 35%, rgba(255,255,255,1) 0%, ${baseColor} 38%, rgba(125, 114, 147, 0.25) 75%, transparent 100%)`;
  };

  return (
    <div className={`relative flex items-center justify-center pointer-events-none [container-type:size] ${className || "w-[180px] h-[180px]"}`}>
      <svg className="hidden">
        <filter id="fractalNoise">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" result="noise" />
          <feColorMatrix type="saturate" values="1.5" />
          <feComposite operator="in" in2="SourceGraphic" />
        </filter>
        <filter id="subtleNoise">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" result="noise" />
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.05 0" />
          <feComposite operator="in" in2="SourceGraphic" />
        </filter>
      </svg>

      <motion.div
        ref={sphereRef}
        animate={{
          y: [0, -12, 0],
          rotate: state === 'thinking' ? 360 : 0,
          filter: state === 'thinking' 
            ? ['saturate(1.8) hue-rotate(0deg) contrast(1.3)', 'saturate(2) hue-rotate(45deg) contrast(1.5)', 'saturate(1.8) hue-rotate(0deg) contrast(1.3)'] 
            : 'saturate(1.4) hue-rotate(0deg) contrast(1.1)',
          scale: state === 'warning' ? 1.08 : (state === 'thinking' ? 1.04 : 1),
          background: get3DGradient(state),
          boxShadow: showGlow
            ? state === 'thinking'
              ? `0 0 60px rgba(34, 197, 94, 0.45), inset 0 0 20px rgba(255, 255, 255, 0.3)`
              : `0 0 45px ${color}33, inset 0 0 15px rgba(255, 255, 255, 0.25)`
            : 'none',
        }}
        transition={{
          y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: state === 'thinking' ? 12 : 0, repeat: Infinity, ease: "linear" },
          filter: { duration: state === 'thinking' ? 4 : 0, repeat: Infinity, ease: "easeInOut" },
          scale: { duration: 0.4 },
          background: { duration: 1 },
          boxShadow: { duration: state === 'thinking' ? 2 : 1, repeat: state === 'thinking' ? Infinity : 0 }
        }}
        className="w-full h-full rounded-full flex items-center justify-center relative overflow-hidden backdrop-blur-[8px] opacity-80 z-10 ring-2 ring-white/10"
        style={{
          filter: state === 'thinking' ? 'url(#fractalNoise)' : 'url(#subtleNoise)',
          ['--sasito-eye-width' as string]: '14cqw',
          ['--sasito-eye-height' as string]: state === 'warning' ? '28cqh' : '24cqh',
          ['--sasito-eye-gap' as string]: '22cqw',
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" viewBox="0 0 100 100">
            <motion.path
              d="M 20,50 L 40,50 L 50,40 L 60,50 L 80,50"
              stroke="white"
              strokeWidth="0.5"
              fill="none"
              animate={{ opacity: [0.1, 0.5, 0.1], pathLength: [0, 1, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </svg>
        </div>

        <motion.div 
          style={{ x: eyeX, y: eyeY }}
          className="flex -mt-[12%] gap-[var(--sasito-eye-gap)]"
        >
          {[0, 1].map((i) => (
            <div key={i} className="relative">
              <motion.div
                animate={{
                  height: state === 'rebooting' ? '4cqh' : 'var(--sasito-eye-height)',
                  scaleY: [1, 1, 0, 1, 1],
                }}
                transition={{
                  scaleY: { 
                    duration: state === 'warning' ? 1.2 : 4,
                    repeat: Infinity, 
                    times: [0, 0.85, 0.88, 0.91, 1],
                    delay: i * 0.1 
                  },
                  height: { duration: 0.3 }
                }}
                className={`w-[var(--sasito-eye-width)] min-w-2 bg-white rounded-full ${showGlow ? 'shadow-[0_0_12px_rgba(255,255,255,0.9),0_0_24px_rgba(255,255,255,0.4)]' : ''}`}
              />
            </div>
          ))}
        </motion.div>

        <div className={`absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/30 to-transparent ${showGlow ? 'opacity-40' : 'opacity-20'}`} />
      </motion.div>

      {showAura && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[...Array(2)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.08 + i * 0.06, 1],
                opacity: [0.12, 0.24 - i * 0.04, 0.12],
                rotate: i % 2 === 0 ? 360 : -360,
                boxShadow: `0 0 60px ${state === 'thinking' ? 'rgba(255,255,255,0.5)' : color + '44'}`,
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute w-[220px] h-[220px] rounded-full border border-white/12 blur-md"
              style={{
                background: state === 'thinking' 
                  ? `conic-gradient(from ${i * 90}deg, #ffffff, #22c55e, #ffffff, #7d7293)`
                  : `radial-gradient(circle, ${color}22 0%, transparent 70%)`
              }}
            />
          ))}
        </div>
      )}
    </div>
);
};
