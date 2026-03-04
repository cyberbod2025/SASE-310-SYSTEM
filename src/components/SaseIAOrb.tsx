import React, { useEffect, useState } from "react";
import { OrbState } from "../hooks/useSaseSystemState";

interface SaseIAOrbProps {
  state: OrbState;
  className?: string;
}

const colorMap = {
  green: {
    hex: "#00C853",
    shadow: "rgba(0, 200, 83, 0.4)",
    stroke: "#00E676",
    stop1: "#00C853",
    stop2: "#004D40",
  },
  orange: {
    hex: "#FF9800",
    shadow: "rgba(255, 152, 0, 0.4)",
    stroke: "#FFB74D",
    stop1: "#FF9800",
    stop2: "#E65100",
  },
  red: {
    hex: "#D32F2F",
    shadow: "rgba(211, 47, 47, 0.4)",
    stroke: "#EF5350",
    stop1: "#D32F2F",
    stop2: "#B71C1C",
  },
};

export const SaseIAOrb: React.FC<SaseIAOrbProps> = ({ state, className }) => {
  const [isChanging, setIsChanging] = useState(false);
  const color = colorMap[state];

  // Micro-interacción: Halo se expande, ojos se enfocan y luego regresa a respiración normal.
  useEffect(() => {
    setIsChanging(true);
    const timeout = setTimeout(() => {
      setIsChanging(false);
    }, 1500); // 1.5s total duration for the transition effect
    return () => clearTimeout(timeout);
  }, [state]);

  return (
    <div
      className={`relative flex items-center justify-center ${className || "w-24 h-24 sm:w-32 sm:h-32"}`}
    >
      {/* Halo de micro-interacción de cambio de estado */}
      <div
        className="absolute inset-0 rounded-full transition-all duration-[600ms] ease-in-out pointer-events-none"
        style={{
          boxShadow: `0 0 30px 10px ${color.shadow}`,
          transform: isChanging ? "scale(1.2)" : "scale(1)",
          opacity: isChanging ? 1 : 0,
        }}
      />

      {/* Halo principal constante */}
      <div
        className="absolute inset-0 rounded-full transition-all duration-[1000ms] ease-in-out pointer-events-none"
        style={{
          boxShadow: `0 0 40px 0px ${color.shadow}`,
          opacity: 0.6,
        }}
      />

      {/* Orbe SVG */}
      <div
        className={`relative flex items-center justify-center w-full h-full transition-all duration-[600ms] ease-in-out`}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full animate-[orb-breathe_4s_ease-in-out_infinite]"
        >
          {/* Anillo externo fino */}
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke={color.stroke}
            strokeWidth="1"
            className="opacity-50 transition-colors duration-700"
          />

          {/* Relleno interno dinámico */}
          <circle cx="50" cy="50" r="44" fill="url(#dynamicOrbGrad)" />

          {/* Borde interior brillante */}
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke={color.stroke}
            strokeWidth="0.5"
            className="opacity-70 transition-colors duration-700"
          />

          {/* Ojos minimalistas (animación conjunta) */}
          <g
            className="transition-all duration-[600ms] ease-in-out transform origin-center"
            style={{
              transform: isChanging
                ? "scale(1.15) translateY(-2px)"
                : "scale(1) translateY(0)",
            }}
          >
            {/* Animación local de parpadeo individual en los ojos - CSS directo */}
            <rect
              x="38.5"
              y="47.5"
              width="2.5"
              height="5"
              rx="1.25"
              fill="#ffffff"
              className="opacity-95 animate-[orb-blink_5s_infinite]"
              style={{ transformOrigin: "40px 50px" }}
            />
            <rect
              x="59"
              y="47.5"
              width="2.5"
              height="5"
              rx="1.25"
              fill="#ffffff"
              className="opacity-95 animate-[orb-blink_5s_infinite]"
              style={{ transformOrigin: "60px 50px" }}
            />
          </g>

          {/* Definiciones de Gradiente */}
          <defs>
            <radialGradient id="dynamicOrbGrad" cx="50%" cy="50%" r="50%">
              <stop
                offset="0%"
                stopColor={color.stop1}
                stopOpacity="0.8"
                className="transition-colors duration-700"
              />
              <stop
                offset="100%"
                stopColor={color.stop2}
                stopOpacity="1"
                className="transition-colors duration-700"
              />
            </radialGradient>
          </defs>
        </svg>
      </div>

      <style>{`
        @keyframes orb-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        @keyframes orb-blink {
          0%, 96%, 100% { transform: scaleY(1); }
          98% { transform: scaleY(0.1); }
        }
      `}</style>
    </div>
  );
};
