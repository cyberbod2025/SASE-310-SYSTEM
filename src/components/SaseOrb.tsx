import React, { useEffect, useRef, useState } from "react";
import { NeuralCorePanel } from "./NeuralCorePanel";
import type { SystemState } from "../types/systemState";

export type { SystemState } from "../types/systemState";

interface SaseOrbProps {
  state: SystemState;
  className?: string;
  enablePanel?: boolean;
  panelData?: {
    incidents: number;
    connectedUsers: number;
    lastEvent: string;
    message?: string;
    version?: string;
  };
}

const stateConfig: Record<
  SystemState,
  {
    gradient: string;
    glow: string;
    glowStrong: string;
    pulse: boolean;
    fast: boolean;
  }
> = {
  normal: {
    gradient:
      "radial-gradient(circle at 30% 30%, rgba(209, 250, 229, 0.95) 0%, rgba(16, 185, 129, 0.95) 40%, rgba(6, 78, 59, 0.95) 100%)",
    glow: "rgba(16, 185, 129, 0.35)",
    glowStrong: "rgba(16, 185, 129, 0.6)",
    pulse: false,
    fast: false,
  },
  warning: {
    gradient:
      "radial-gradient(circle at 30% 30%, rgba(254, 243, 199, 0.95) 0%, rgba(245, 158, 11, 0.95) 40%, rgba(120, 53, 15, 0.95) 100%)",
    glow: "rgba(245, 158, 11, 0.4)",
    glowStrong: "rgba(245, 158, 11, 0.7)",
    pulse: true,
    fast: false,
  },
  alert: {
    gradient:
      "radial-gradient(circle at 30% 30%, rgba(254, 226, 226, 0.95) 0%, rgba(220, 38, 38, 0.95) 40%, rgba(127, 29, 29, 0.95) 100%)",
    glow: "rgba(220, 38, 38, 0.5)",
    glowStrong: "rgba(220, 38, 38, 0.85)",
    pulse: true,
    fast: true,
  },
  thinking: {
    gradient:
      "radial-gradient(circle at 30% 30%, rgba(219, 234, 254, 0.95) 0%, rgba(59, 130, 246, 0.95) 40%, rgba(30, 58, 138, 0.95) 100%)",
    glow: "rgba(59, 130, 246, 0.25)",
    glowStrong: "rgba(59, 130, 246, 0.45)",
    pulse: false,
    fast: false,
  },
};

export const SaseOrb: React.FC<SaseOrbProps> = ({
  state,
  className,
  enablePanel = false,
  panelData,
}) => {
  const config = stateConfig[state];
  const rotationDuration = config.fast ? "12s" : "24s";
  const pulseDuration = config.fast ? "1.6s" : state === "warning" ? "2.2s" : "3.4s";
  const pulseScale = state === "warning" ? 1.05 : state === "alert" ? 1.065 : 1.025;
  const haloOpacity = state === "alert" ? 0.6 : state === "warning" ? 0.45 : 0.3;
  const vibrate = state === "alert";
  const [panelOpen, setPanelOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    if (!panelOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setPanelOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [panelOpen]);

  useEffect(() => {
    let blinkTimeout: number | undefined;

    const scheduleBlink = () => {
      const nextBlink = 4000 + Math.random() * 4000;
      blinkTimeout = window.setTimeout(() => {
        setIsBlinking(true);
        const blinkDuration = state === "alert" ? 110 : 150;
        window.setTimeout(() => setIsBlinking(false), blinkDuration);
        scheduleBlink();
      }, nextBlink);
    };

    scheduleBlink();

    return () => {
      if (blinkTimeout) window.clearTimeout(blinkTimeout);
    };
  }, [state]);

  const resolvedPanelData = {
    incidents: panelData?.incidents ?? 0,
    connectedUsers: panelData?.connectedUsers ?? 0,
    lastEvent: panelData?.lastEvent ?? "Sin eventos recientes",
    message: panelData?.message,
    version: panelData?.version ?? "SASE-310",
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = event.clientX - centerX;
    const deltaY = event.clientY - centerY;
    const maxOffset = 4;
    const offsetX = Math.max(-maxOffset, Math.min(maxOffset, deltaX / 20));
    const offsetY = Math.max(-maxOffset, Math.min(maxOffset, deltaY / 20));
    setEyeOffset({ x: offsetX, y: offsetY });
  };

  const handleMouseLeave = () => {
    setEyeOffset({ x: 0, y: 0 });
  };

  const eyeBase = { width: 18, height: 8 };
  const eyeHeightMultiplier =
    state === "warning" ? 1.2 : state === "alert" ? 0.75 : 1;
  const eyeScale = 1;
  const glowStrength =
    state === "alert" ? 0.65 : state === "warning" ? 0.5 : 0.35;

  return (
    <div
      ref={containerRef}
      className={`group relative flex items-center justify-center ${className || "w-24 h-24"} ${
        enablePanel ? "cursor-pointer" : ""
      }`}
      style={{ perspective: "800px" }}
      aria-label={`SASE Neural Core ${state}`}
      title={`SASE Neural Core - ${state}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {enablePanel && panelOpen && (
        <div className="absolute bottom-full right-0 mb-4 origin-bottom-right animate-[sase-panel_180ms_ease-out]">
          <NeuralCorePanel
            state={state}
            incidents={resolvedPanelData.incidents}
            connectedUsers={resolvedPanelData.connectedUsers}
            lastEvent={resolvedPanelData.lastEvent}
            message={resolvedPanelData.message}
            version={resolvedPanelData.version}
          />
        </div>
      )}

      {enablePanel && (
        <div className="absolute -top-6 right-2 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          Neural Core
        </div>
      )}

      <div
        className="absolute inset-0 rounded-full transition-all duration-[700ms] group-hover:scale-[1.05]"
        style={{
          boxShadow: `0 0 28px ${config.glow}, 0 0 90px ${config.glowStrong}`,
        }}
      />
      <div
        className="absolute inset-0 rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{
          boxShadow: `0 0 40px ${config.glowStrong}, 0 0 120px ${config.glowStrong}`,
        }}
      />

      <div
        className={`relative w-full h-full rounded-full overflow-hidden border border-white/10 shadow-[inset_-18px_-22px_36px_rgba(0,0,0,0.6),inset_16px_14px_28px_rgba(255,255,255,0.2)] transition-all duration-[700ms] group-hover:scale-[1.05] ${
          config.pulse ? "sase-orb-pulse" : "sase-orb-breathe"
        } ${vibrate ? "sase-orb-vibrate" : ""}`}
        style={{
          background: config.gradient,
          animation: undefined,
        }}
        role={enablePanel ? "button" : undefined}
        aria-label={enablePanel ? "Abrir panel de estado" : undefined}
        onClick={() => enablePanel && setPanelOpen((prev) => !prev)}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 28% 22%, rgba(255,255,255,0.6), rgba(255,255,255,0) 45%)",
          }}
        />
        <div
          className="absolute inset-0 rounded-full opacity-70"
          style={{
            background:
              "radial-gradient(circle at 40% 70%, rgba(0,0,0,0.35), rgba(0,0,0,0) 55%)",
          }}
        />
        <div
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow:
              "inset 0 0 30px rgba(0,0,0,0.55), inset 0 -25px 35px rgba(0,0,0,0.45)",
          }}
        />
        <div
          className="absolute inset-1 rounded-full border border-white/10"
          style={{ animation: `sase-orb-halo ${rotationDuration} ease-in-out infinite`, opacity: haloOpacity }}
        />
        <div
          className="absolute inset-5 rounded-full border border-white/5"
          style={{ animation: `sase-orb-halo ${rotationDuration} ease-in-out infinite`, opacity: haloOpacity * 0.7 }}
        />

        <div className="absolute inset-0 rounded-full sase-orb-iris" />
        <div className="absolute inset-0 rounded-full sase-orb-iris-core" />

        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="sase-orb-eyes"
            style={{
              transform: `translate3d(${eyeOffset.x}px, ${eyeOffset.y}px, 0) scale(${eyeScale})`,
            }}
          >
            <span
              className={`sase-orb-eye ${isBlinking ? "sase-orb-eye-blink" : ""}`}
              style={{
                width: `${eyeBase.width}px`,
                height: `${eyeBase.height * eyeHeightMultiplier}px`,
                boxShadow: `inset 0 0 4px rgba(0,0,0,0.25), 0 0 10px rgba(255,255,255,${glowStrength})`,
              }}
            />
            <span
              className={`sase-orb-eye ${isBlinking ? "sase-orb-eye-blink" : ""}`}
              style={{
                width: `${eyeBase.width}px`,
                height: `${eyeBase.height * eyeHeightMultiplier}px`,
                boxShadow: `inset 0 0 4px rgba(0,0,0,0.25), 0 0 10px rgba(255,255,255,${glowStrength})`,
              }}
            />
          </div>
        </div>

        <div className="absolute inset-0 rounded-full sase-orb-sheen" />

        <div className="absolute inset-0 rounded-full pointer-events-none">
          <span className="sase-orb-particle left-[12%] top-[18%]" />
          <span className="sase-orb-particle left-[82%] top-[22%]" />
          <span className="sase-orb-particle left-[18%] top-[72%]" />
          <span className="sase-orb-particle left-[72%] top-[68%]" />
          <span className="sase-orb-particle left-[48%] top-[10%]" />
          <span className="sase-orb-particle left-[32%] top-[32%]" />
          <span className="sase-orb-particle left-[62%] top-[36%]" />
          <span className="sase-orb-particle left-[42%] top-[78%]" />
        </div>
      </div>

      <style>{`
        @keyframes sase-panel {
          0% {
            opacity: 0;
            transform: scale(0.98) translateY(6px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes sase-orb-rotate {
          0% {
            transform: rotate3d(0, 1, 0, 0deg) rotate3d(1, 0, 0, 12deg);
          }
          50% {
            transform: rotate3d(0, 1, 0, 180deg) rotate3d(1, 0, 0, 4deg);
          }
          100% {
            transform: rotate3d(0, 1, 0, 360deg) rotate3d(1, 0, 0, 12deg);
          }
        }

        @keyframes sase-orb-pulse {
          0% {
            transform: scale(1);
            box-shadow: 0 0 18px ${config.glow};
          }
          50% {
            transform: scale(${pulseScale});
            box-shadow: 0 0 34px ${config.glowStrong};
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 18px ${config.glow};
          }
        }

        @keyframes sase-orb-breathe {
          0% {
            transform: scale(1);
            box-shadow: 0 0 20px ${config.glow};
          }
          50% {
            transform: scale(${pulseScale});
            box-shadow: 0 0 30px ${config.glowStrong};
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 20px ${config.glow};
          }
        }

        @keyframes sase-orb-halo {
          0% {
            opacity: 0.3;
            transform: scale(0.98) rotate(0deg);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.02) rotate(180deg);
          }
          100% {
            opacity: 0.3;
            transform: scale(0.98) rotate(360deg);
          }
        }

        @keyframes sase-orb-sheen {
          0% {
            transform: translateX(-30%) translateY(-10%) rotate(8deg);
            opacity: 0.12;
          }
          50% {
            transform: translateX(20%) translateY(10%) rotate(-6deg);
            opacity: 0.2;
          }
          100% {
            transform: translateX(-30%) translateY(-10%) rotate(8deg);
            opacity: 0.12;
          }
        }

        @keyframes sase-orb-particle {
          0% {
            transform: translate3d(0, 0, 0) scale(0.9);
            opacity: 0.15;
          }
          50% {
            transform: translate3d(6px, -8px, 0) scale(1.1);
            opacity: 0.4;
          }
          100% {
            transform: translate3d(0, 0, 0) scale(0.9);
            opacity: 0.15;
          }
        }

        @keyframes sase-orb-iris {
          0% {
            transform: translate3d(0, 0, 0) rotate(0deg);
            opacity: 0.35;
          }
          50% {
            transform: translate3d(4px, -2px, 0) rotate(180deg);
            opacity: 0.55;
          }
          100% {
            transform: translate3d(0, 0, 0) rotate(360deg);
            opacity: 0.35;
          }
        }

        @keyframes sase-orb-iris-core {
          0% {
            transform: scale(0.96);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.02);
            opacity: 0.8;
          }
          100% {
            transform: scale(0.96);
            opacity: 0.5;
          }
        }

        @keyframes sase-orb-vibrate {
          0% {
            transform: translate3d(0, 0, 0);
          }
          25% {
            transform: translate3d(1px, -1px, 0);
          }
          50% {
            transform: translate3d(-1px, 1px, 0);
          }
          75% {
            transform: translate3d(1px, 1px, 0);
          }
          100% {
            transform: translate3d(0, 0, 0);
          }
        }

        .sase-orb-pulse {
          animation: sase-orb-pulse ${pulseDuration} ease-in-out infinite;
        }

        .sase-orb-breathe {
          animation: sase-orb-breathe ${pulseDuration} ease-in-out infinite;
        }

        .sase-orb-vibrate {
          animation: sase-orb-vibrate 0.9s ease-in-out infinite;
        }

        .sase-orb-sheen {
          background: linear-gradient(120deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0) 70%);
          animation: sase-orb-sheen 6s ease-in-out infinite;
          mix-blend-mode: screen;
        }

        .sase-orb-iris {
          background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 35%, rgba(255,255,255,0) 70%);
          border: 1px solid rgba(255,255,255,0.08);
          animation: sase-orb-iris 8s linear infinite;
          mix-blend-mode: screen;
        }

        .sase-orb-iris-core {
          background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.1) 40%, rgba(255,255,255,0) 70%);
          animation: sase-orb-iris-core 4.6s ease-in-out infinite;
          mix-blend-mode: screen;
        }

        .sase-orb-eyes {
          display: flex;
          gap: 12px;
          align-items: center;
          justify-content: center;
          transition: transform 120ms ease-out;
          filter: drop-shadow(0 0 10px rgba(255,255,255,0.35));
        }

        .sase-orb-eye {
          border-radius: 4px;
          background: rgba(255,255,255,0.92);
          transform-origin: center;
          transition: transform 120ms ease-out;
          mix-blend-mode: screen;
        }

        .sase-orb-eye-blink {
          transform: scaleY(0.15);
        }

        .sase-orb-particle {
          position: absolute;
          width: 2px;
          height: 2px;
          border-radius: 999px;
          background: rgba(255,255,255,0.35);
          box-shadow: 0 0 8px rgba(255,255,255,0.35);
          animation: sase-orb-particle 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
