import React, { useEffect, useState } from "react";

interface IntroProps {
  onEnter: () => void;
}

export const Intro: React.FC<IntroProps> = ({ onEnter }) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // Fase 1: Aparece orbe lentamente
    const t1 = setTimeout(() => setPhase(1), 300);
    // Fase 2: Ojos dibujados y activados
    const t2 = setTimeout(() => setPhase(2), 2000);
    // Fase 3: Texto SASE principal
    const t3 = setTimeout(() => setPhase(3), 3500);
    // Fase 4: Slogan oficial
    const t4 = setTimeout(() => setPhase(4), 4500);
    // Fase 5: Pulso final expansivo
    const t5 = setTimeout(() => setPhase(5), 6500);
    // Fase 6: Desvanecimiento hacia Login
    const t6 = setTimeout(() => {
      setPhase(6);
      setTimeout(onEnter, 1200); // Wait for transition out
    }, 7500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
    };
  }, [onEnter]);

  // Handle manual skip
  const handleSkip = () => {
    setPhase(6);
    setTimeout(onEnter, 400);
  };

  return (
    <div
      className="fixed inset-0 z-[999] bg-[#020408] flex flex-col items-center justify-center transition-opacity duration-[1200ms] overflow-hidden font-sans"
      style={{ opacity: phase === 6 ? 0 : 1 }}
      onClick={handleSkip}
    >
      {/* Fondo estelar sutil y Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03] [background-image:radial-gradient(circle_at_center,white_1px,transparent_1px)] [background-size:24px_24px]"></div>
        <div
          className={`w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] transition-all duration-[3000ms] ease-out ${
            phase >= 1 ? "scale-100 opacity-100" : "scale-50 opacity-0"
          } ${phase >= 5 ? "scale-[1.5] bg-blue-500/20" : ""}`}
        ></div>
      </div>

      <div className="relative z-10 flex flex-col items-center pointer-events-none">
        {/* Etiqueta superior del sistema */}
        <div
          className={`mb-8 text-[9px] font-black uppercase tracking-[0.5em] text-blue-500/50 transition-all duration-[2000ms] ease-out ${
            phase >= 1
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-4"
          }`}
        >
          Secuencia de Inicialización
        </div>

        {/* Orbe SVG (IA SASE) */}
        <div
          className={`relative flex items-center justify-center w-40 h-40 transition-all duration-[2000ms] ease-out ${
            phase >= 1 ? "opacity-100 scale-100" : "opacity-0 scale-50"
          } ${phase >= 5 ? "scale-[1.1] filter brightness-125" : ""}`}
        >
          {/* Anillos de energía envolventes */}
          <div className="absolute inset-0 rounded-full border border-blue-500/10 animate-[spin_10s_linear_infinite]"></div>
          <div className="absolute inset-[-10px] rounded-full border border-blue-400/5 animate-[spin_15s_linear_infinite_reverse]"></div>

          <svg
            viewBox="0 0 100 100"
            className="w-full h-full animate-[sase-intro-breathe_4s_ease-in-out_infinite]"
          >
            {/* Halo externo */}
            <circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke="#1e3a8a"
              strokeWidth="0.5"
              className="opacity-60 object-glow"
            />

            {/* Relleno interno orgánico */}
            <circle cx="50" cy="50" r="44" fill="url(#orbGradIntro)" />

            {/* Borde interior brillante */}
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="#60a5fa"
              strokeWidth="0.8"
              className="opacity-70"
            />

            {/* Ojos minimalistas vibrantes */}
            <g
              className="transition-all duration-[1000ms] ease-out transform origin-center"
              style={{
                opacity: phase >= 2 ? 1 : 0,
                transform:
                  phase >= 2
                    ? "scale(1) translateY(0)"
                    : "scale(0.8) translateY(10px)",
              }}
            >
              <rect
                x="36"
                y="43"
                width="6"
                height="14"
                rx="3"
                fill="#ffffff"
                className="opacity-95 animate-[sase-intro-blink_5s_infinite_1s]"
                style={{
                  transformOrigin: "39px 50px",
                  filter: "drop-shadow(0px 0px 4px rgba(255,255,255,0.8))",
                }}
              />
              <rect
                x="58"
                y="43"
                width="6"
                height="14"
                rx="3"
                fill="#ffffff"
                className="opacity-95 animate-[sase-intro-blink_5s_infinite_1s]"
                style={{
                  transformOrigin: "61px 50px",
                  filter: "drop-shadow(0px 0px 4px rgba(255,255,255,0.8))",
                }}
              />
            </g>

            <defs>
              <radialGradient id="orbGradIntro" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
                <stop offset="70%" stopColor="#1e3a8a" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#020617" stopOpacity="1" />
              </radialGradient>
            </defs>
          </svg>
        </div>

        {/* Texto Principal */}
        <h1
          className={`mt-12 text-6xl md:text-7xl font-black tracking-[-0.02em] text-white uppercase italic leading-none transition-all duration-[1500ms] ease-out ${
            phase >= 3
              ? "opacity-100 translate-y-0 filter blur-0"
              : "opacity-0 translate-y-8 filter blur-sm"
          }`}
          style={{ textShadow: "0 0 30px rgba(59,130,246,0.4)" }}
        >
          SASE-310
        </h1>

        {/* Slogan Oficial Solicitado */}
        <div
          className={`mt-4 flex flex-col items-center gap-3 transition-all duration-[1500ms] ease-out ${
            phase >= 4 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
          <h2 className="text-[10px] md:text-xs font-black tracking-[0.4em] uppercase text-blue-300/80 text-center max-w-sm leading-relaxed">
            DONDE EL DEBER Y LA CONCIENCIA SE ENCUENTRAN
          </h2>
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
        </div>
      </div>

      <style>{`
        @keyframes sase-intro-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        @keyframes sase-intro-blink {
          0%, 96%, 100% { transform: scaleY(1); }
          98% { transform: scaleY(0.1); }
        }
      `}</style>
    </div>
  );
};
