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
              "linear-gradient(#b8860b 1px, transparent 1px), linear-gradient(90deg, #b8860b 1px, transparent 1px)",
            backgroundSize: "50px 50px",
            transform: "perspective(500px) rotateX(60deg)",
          }}
        ></div>
      </div>

      {/* Central Content */}
      <div className="relative text-center z-10 flex flex-col items-center">
        {/* Glow Effect behind Logo */}
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500 rounded-full blur-[100px] transition-all duration-1000 ${
            phase >= 1 ? "opacity-40" : "opacity-0 scale-0"
          }`}
        ></div>

        {/* Logo Container - IMPACTANTE */}
        <div
          className={`transition-all duration-1000 transform ${
            phase >= 2
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-20 scale-75"
          }`}
        >
          <div className="relative">
            {/* Massive Glow Ring - Golden/Silver */}
            <div className="absolute inset-0 -m-20 rounded-full bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-500 opacity-40 blur-[100px] animate-pulse"></div>

            {/* Logo Image - GIGANTE */}
            <img
              src="/assets/branding/SASE.png"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
              className="w-[600px] h-[400px] object-contain drop-shadow-[0_0_80px_rgba(218,165,32,0.8)] relative z-10 animate-float"
              alt="SASE Logo"
              style={{
                filter:
                  "drop-shadow(0 0 40px rgba(218,165,32,0.6)) drop-shadow(0 0 80px rgba(192,192,192,0.4))",
              }}
            />

            {/* Decorative Ring Around Logo */}
            <div className="absolute inset-0 -m-8 border-2 border-amber-500/30 rounded-full animate-[spin_20s_linear_infinite]"></div>
          </div>

          {/* Texto del significado de SASE */}
          <h2
            className={`mt-6 text-2xl font-light tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-gray-300 via-white to-gray-400 transition-all duration-1000 ${
              phase >= 2 ? "opacity-100" : "opacity-0"
            }`}
          >
            Sistema de Acompañamiento
          </h2>
          <h3
            className={`text-lg font-light tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 transition-all duration-1000 delay-300 ${
              phase >= 2 ? "opacity-100" : "opacity-0"
            }`}
          >
            y Seguimiento Escolar
          </h3>
        </div>

        {/* Loading Bar & System Text */}
        <div
          className={`mt-12 w-64 transition-all duration-500 ${
            phase >= 3 ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="h-0.5 bg-gray-800 w-full rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 animate-[loading_2s_ease-in-out_infinite] w-full origin-left"></div>
          </div>
          <div className="mt-2 text-xs font-mono text-amber-400 h-6">
            {phase === 3 && "CARGANDO MÓDULOS...."}
            {phase === 4 && "ACCESO CONCEDIDO"}
          </div>
        </div>
      </div>

      {/* Decorative Circles - Golden */}
      <div
        className={`absolute border border-amber-500/20 rounded-full w-[600px] h-[600px] transition-all duration-[2000ms] ${
          phase >= 1 ? "scale-100 opacity-100" : "scale-0 opacity-0"
        }`}
      ></div>
      <div
        className={`absolute border border-yellow-400/10 rounded-full w-[400px] h-[400px] transition-all duration-[2000ms] delay-100 ${
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
