import React, { useEffect, useState } from "react";

interface IntroProps {
  onEnter: () => void;
}

export const Intro: React.FC<IntroProps> = ({ onEnter }) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // Fase 1: Aparece orbe (0.1s)
    // Fase 2: Ojos dibujados (1s)
    // Fase 3: Texto SASE (2.5s)
    // Fase 4: Subtexto (3.5s)
    // Fase 5: Pulso final (5s)
    // Fase 6: Fade a login (6s)

    const t1 = setTimeout(() => setPhase(1), 100);
    const t2 = setTimeout(() => setPhase(2), 1000);
    const t3 = setTimeout(() => setPhase(3), 2500);
    const t4 = setTimeout(() => setPhase(4), 3500);
    const t5 = setTimeout(() => setPhase(5), 5000);
    const t6 = setTimeout(() => {
      setPhase(6);
      setTimeout(onEnter, 1000); // Wait for transition out
    }, 6000); // 6 segundos total

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
    setTimeout(onEnter, 300);
  };

  return (
    <div
      className="fixed inset-0 z-[999] bg-[#020617] flex flex-col items-center justify-center transition-opacity duration-1000 overflow-hidden font-sans"
      style={{ opacity: phase === 6 ? 0 : 1 }}
      onClick={handleSkip}
    >
      {/* Fondo azul profundo - Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className={`w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] transition-transform duration-[1500ms] ${
            phase >= 1 ? "scale-100 opacity-100" : "scale-50 opacity-0"
          } ${phase === 5 ? "scale-125 bg-blue-500/20" : ""}`}
        ></div>
      </div>

      <div className="relative z-10 flex flex-col items-center pointer-events-none">
        {/* Orbe SVG */}
        <div
          className={`relative flex items-center justify-center w-32 h-32 transition-all duration-[600ms] ease-in-out ${
            phase >= 1 ? "opacity-100 scale-100" : "opacity-0 scale-90"
          } ${phase === 5 ? "scale-[1.15]" : ""}`}
        >
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full animate-[sase-breathe_4s_ease-in-out_infinite]"
          >
            {/* Halo externo */}
            <circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke="#1e3a8a"
              strokeWidth="1"
              className="opacity-50"
            />

            {/* Relleno interno orgánico */}
            <circle cx="50" cy="50" r="44" fill="url(#orbGrad)" />

            {/* Borde interior */}
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="#60a5fa"
              strokeWidth="0.5"
              className="opacity-60"
            />

            {/* Ojos minimalistas */}
            <g
              className="transition-all duration-1000 delay-300 ease-out"
              style={{
                opacity: phase >= 2 ? 1 : 0,
                transform: phase >= 2 ? "translateY(0)" : "translateY(5px)",
              }}
            >
              <rect
                x="36"
                y="44"
                width="6"
                height="12"
                rx="3"
                fill="#ffffff"
                className="opacity-90"
              />
              <rect
                x="58"
                y="44"
                width="6"
                height="12"
                rx="3"
                fill="#ffffff"
                className="opacity-90"
              />
            </g>

            <defs>
              <radialGradient id="orbGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.4" />
                <stop offset="70%" stopColor="#1e40af" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="1" />
              </radialGradient>
            </defs>
          </svg>
        </div>

        {/* Texto SASE */}
        <h1
          className={`mt-10 text-5xl md:text-6xl font-black tracking-[0.2em] text-white uppercase transition-all duration-[1000ms] ease-out ${
            phase >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
          style={{ textShadow: "0 0 20px rgba(59,130,246,0.3)" }}
        >
          SASE
        </h1>

        {/* Subtexto */}
        <h2
          className={`mt-5 text-xs md:text-sm font-semibold tracking-[0.4em] uppercase text-blue-400/80 transition-all duration-[1000ms] ease-out ${
            phase >= 4 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          Seguimiento con fundamento
        </h2>
      </div>

      <style>{`
        @keyframes sase-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
      `}</style>
    </div>
  );
};
