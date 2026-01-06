import React, { useEffect, useState } from "react";

export const SplashScreen: React.FC<{ onComplete: () => void }> = ({
  onComplete,
}) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // Phase 0: Initial Black
    // Phase 1: Grid & Particles Init
    // Phase 2: Logo Reveal
    // Phase 3: System Check Text
    // Phase 4: Access Granted
    // Phase 5: Fade Out

    const times = [0, 500, 1500, 2500, 4000, 5000];

    const timeouts = times.map((t, i) => setTimeout(() => setPhase(i), t));

    const finishTimeout = setTimeout(onComplete, 5500);

    return () => {
      timeouts.forEach(clearTimeout);
      clearTimeout(finishTimeout);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden transition-opacity duration-1000 ${
        phase === 5 ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Background Animated Grid */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div
          className="absolute w-[200%] h-[200%] -left-[50%] -top-[50%] animate-grid-flow"
          style={{
            backgroundImage:
              "linear-gradient(#0052cc 1px, transparent 1px), linear-gradient(90deg, #0052cc 1px, transparent 1px)",
            backgroundSize: "50px 50px",
            transform: "perspective(500px) rotateX(60deg)",
          }}
        ></div>
      </div>

      {/* Central Content */}
      <div className="relative text-center z-10 flex flex-col items-center">
        {/* Glow Effect behind Logo */}
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500 rounded-full blur-[100px] transition-all duration-1000 ${
            phase >= 1 ? "opacity-30" : "opacity-0 scale-0"
          }`}
        ></div>

        {/* Logo Container */}
        <div
          className={`transition-all duration-1000 transform ${
            phase >= 2
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-10 scale-90"
          }`}
        >
          <div className="relative mb-6">
            <div className="size-64 bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-3xl flex items-center justify-center mx-auto shadow-[0_0_40px_-5px_rgba(59,130,246,0.5)] p-4 group">
              <div className="absolute inset-0 bg-blue-500/10 rounded-3xl animate-pulse"></div>
              <img
                src="/branding/SASE.png"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.parentElement?.classList.add("fallback-icon");
                }}
                className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] relative z-10"
                alt="SASE Logo"
              />
              <span className="material-symbols-outlined text-5xl text-blue-400 hidden fallback-icon-target">
                token
              </span>
            </div>
          </div>
        </div>

        {/* Loading Bar & System Text */}
        <div
          className={`mt-12 w-64 transition-all duration-500 ${
            phase >= 3 ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="h-0.5 bg-gray-800 w-full rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 animate-[loading_2s_ease-in-out_infinite] w-full origin-left"></div>
          </div>
          <div className="mt-2 text-xs font-mono text-blue-400 h-6">
            {phase === 3 && "CARGANDO MÓDULOS...."}
            {phase === 4 && "ACCESO CONCEDIDO"}
          </div>
        </div>
      </div>

      {/* Decorative Circles */}
      <div
        className={`absolute border border-blue-500/20 rounded-full w-[600px] h-[600px] transition-all duration-[2000ms] ${
          phase >= 1 ? "scale-100 opacity-100" : "scale-0 opacity-0"
        }`}
      ></div>
      <div
        className={`absolute border border-blue-400/10 rounded-full w-[400px] h-[400px] transition-all duration-[2000ms] delay-100 ${
          phase >= 1 ? "scale-100 opacity-100" : "scale-0 opacity-0"
        }`}
      ></div>

      <style>{`
        .fallback-icon .fallback-icon-target { display: block !important; }
        @keyframes loading {
          0% { transform: scaleX(0); }
          50% { transform: scaleX(0.7); }
          100% { transform: scaleX(1); }
        }
      `}</style>
    </div>
  );
};
