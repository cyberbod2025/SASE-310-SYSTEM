import React, { useEffect, useState } from "react";

interface IntroProps {
  onEnter: () => void;
}

const GoldenStar = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 1L14.59 8.41L22 11L14.59 13.59L12 21L9.41 13.59L2 11L9.41 8.41L12 1Z" />
  </svg>
);

export const Intro: React.FC<IntroProps> = ({ onEnter }) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // 0ms: Pantalla negra
    const t1 = setTimeout(() => setPhase(1), 300); // Agua fluyendo al centro
    const t2 = setTimeout(() => setPhase(2), 1500); // Nace Orbe azul y flota
    const t3 = setTimeout(() => setPhase(3), 3500); // Verde, ojos arriba
    const t4 = setTimeout(() => setPhase(4), 5000); // Naranja, ojos abajo
    const t5 = setTimeout(() => setPhase(5), 6500); // Rojo, ojos diagonal
    const t6 = setTimeout(() => setPhase(6), 8000); // Sacudida, regresa a azul luminoso, estrellas
    const t7 = setTimeout(() => setPhase(7), 9500); // Textos SASE y slogan
    const t8 = setTimeout(() => {
      setPhase(8);
      setTimeout(onEnter, 1200);
    }, 12500); // Fade final hacia Login

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
      clearTimeout(t7);
      clearTimeout(t8);
    };
  }, [onEnter]);

  const handleSkip = () => {
    setPhase(8);
    setTimeout(onEnter, 400);
  };

  // Dinámica de color y posición de ojos según fase
  let orbColor = "#3b82f6"; // Azul inicial
  let orbGlow = "rgba(59,130,246,0.5)";
  let eyeX = 0;
  let eyeY = 0;

  if (phase === 3) {
    orbColor = "#00C853"; // Verde
    orbGlow = "rgba(0, 200, 83, 0.6)";
    eyeY = -12; // Arriba
  } else if (phase === 4) {
    orbColor = "#FF9800"; // Naranja
    orbGlow = "rgba(255, 152, 0, 0.6)";
    eyeY = 12; // Abajo
  } else if (phase === 5) {
    orbColor = "#D32F2F"; // Rojo
    orbGlow = "rgba(211, 47, 47, 0.7)";
    eyeX = 12; // Diagonal Derecha
    eyeY = -12; // Diagonal Arriba
  } else if (phase >= 6) {
    orbColor = "#0ea5e9"; // Azul brillante de "Poder" (cyan)
    orbGlow = "rgba(14, 165, 233, 0.9)";
  }

  return (
    <div
      className="fixed inset-0 z-[999] bg-black flex flex-col items-center justify-center transition-opacity duration-[1200ms] overflow-hidden font-sans"
      style={{ opacity: phase === 8 ? 0 : 1 }}
      onClick={handleSkip}
    >
      {/* Efecto de Agua Fluyendo hacia el centro (Phase 1) */}
      <div
        className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-500`}
        style={{ opacity: phase >= 1 && phase < 3 ? 1 : 0 }}
      >
        <div className="absolute w-[80wv] h-[80vw] sm:w-[800px] sm:h-[800px] rounded-full border-[20px] border-[#0ea5e9]/20 blur-[10px] animate-[water-in_1.2s_ease-in_forwards]"></div>
        <div className="absolute w-[60wv] h-[60vw] sm:w-[600px] sm:h-[600px] rounded-full border-[15px] border-[#3b82f6]/30 blur-[8px] animate-[water-in_1.2s_ease-in_0.2s_forwards]"></div>
        <div className="absolute w-[40wv] h-[40vw] sm:w-[400px] sm:h-[400px] rounded-full border-[10px] border-[#2563eb]/40 blur-[5px] animate-[water-in_1.2s_ease-in_0.4s_forwards]"></div>
      </div>

      <div
        className={`relative z-10 flex flex-col items-center pointer-events-none transition-transform duration-1000 ${phase >= 7 ? "-translate-y-6" : ""}`}
      >
        {/* Contenedor del Orbe para animaciones de flotar y sacudida */}
        <div
          className={`relative flex items-center justify-center ${phase === 6 ? "animate-[shake_0.6s_ease-in-out]" : ""}`}
        >
          {/* Contenedor flotante y aparición */}
          <div
            className={`relative flex items-center justify-center w-48 h-48 transition-all duration-[1500ms] ease-out ${phase >= 2 ? "opacity-100 scale-100" : "opacity-0 scale-0"} animate-[float_4s_ease-in-out_infinite]`}
          >
            {/* Halos de Luz (aparecen en phase 6) */}
            <div
              className={`absolute inset-[-40px] rounded-full bg-cyan-400/20 blur-2xl transition-all duration-1000 ${phase >= 6 ? "opacity-100 scale-125" : "opacity-0 scale-90"}`}
            ></div>
            <div
              className={`absolute inset-[-20px] rounded-full bg-blue-500/30 blur-xl transition-all duration-1000 delay-100 ${phase >= 6 ? "opacity-100 scale-110" : "opacity-0 scale-90"}`}
            ></div>

            {/* Estrellitas doradas finas (phase >= 6) */}
            <div
              className={`absolute inset-0 transition-opacity duration-1000 ${phase >= 6 ? "opacity-100" : "opacity-0"}`}
            >
              <GoldenStar className="absolute -top-12 left-1/2 -translate-x-1/2 w-8 h-8 text-[#FFD700] drop-shadow-[0_0_8px_rgba(255,215,0,0.8)] animate-[pulse-star_2s_infinite]" />
              <GoldenStar className="absolute -bottom-10 left-1/3 -translate-x-1/2 w-6 h-6 text-[#FFD700] drop-shadow-[0_0_8px_rgba(255,215,0,0.8)] animate-[pulse-star_2.5s_infinite_0.5s]" />
              <GoldenStar className="absolute top-1/2 -left-12 -translate-y-1/2 w-5 h-5 text-[#FFE066] drop-shadow-[0_0_8px_rgba(255,215,0,0.8)] animate-[pulse-star_1.5s_infinite_0.2s]" />
              <GoldenStar className="absolute top-1/4 -right-14 w-7 h-7 text-[#FFD700] drop-shadow-[0_0_8px_rgba(255,215,0,0.8)] animate-[pulse-star_2s_infinite_0.8s]" />
            </div>

            {/* El Orbe Carita */}
            <div
              className="relative w-36 h-36 rounded-full flex justify-center items-center transition-colors duration-[800ms] overflow-hidden border border-white/10"
              style={{
                backgroundColor: orbColor,
                boxShadow: `0 0 50px 15px ${orbGlow}, inset 0 0 30px rgba(0,0,0,0.4)`,
              }}
            >
              {/* Brillo interno tipo cristal líquido */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/40 mix-blend-overlay"></div>

              {/* Ojos (Dos lineas verticales) */}
              <div
                className="flex gap-5 transition-transform duration-[600ms] ease-in-out"
                style={{
                  transform: `translate(${eyeX}px, ${eyeY}px)`,
                }}
              >
                <div className="w-2 h-14 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.9)] animate-[blink_4s_infinite_1s]"></div>
                <div className="w-2 h-14 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.9)] animate-[blink_4s_infinite_1s]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Palabras SASE y Slogan "CONECTAMOS CONTIGO" */}
        <div
          className={`mt-10 flex flex-col items-center justify-center transition-all duration-1000 ease-out transform ${phase >= 7 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <h1
            className="text-6xl md:text-8xl font-black tracking-widest text-white uppercase text-center"
            style={{ textShadow: "0 4px 20px rgba(255,255,255,0.4)" }}
          >
            SASE
          </h1>
          <h2 className="mt-4 text-lg md:text-2xl font-black tracking-[0.4em] text-[#FFD700] uppercase text-center drop-shadow-[0_2px_10px_rgba(255,215,0,0.4)] px-4 animate-pulse">
            CONECTAMOS CONTIGO
          </h2>
        </div>
      </div>

      <style>{`
        @keyframes water-in {
          0% { transform: scale(2.5); opacity: 0; }
          40% { opacity: 1; filter: blur(5px); }
          100% { transform: scale(0); opacity: 0; filter: blur(0px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          15% { transform: translateX(-10px) rotate(-8deg); filter: blur(3px); }
          30% { transform: translateX(10px) rotate(8deg); filter: blur(2px); }
          45% { transform: translateX(-8px) rotate(-6deg); filter: blur(1px); }
          60% { transform: translateX(8px) rotate(6deg); filter: blur(1px); }
          75% { transform: translateX(-4px) rotate(-3deg); filter: blur(0px); }
          90% { transform: translateX(4px) rotate(3deg); filter: blur(0px); }
        }
        @keyframes pulse-star {
          0%, 100% { transform: scale(0.8); opacity: 0.6; }
          50% { transform: scale(1.3) rotate(30deg); opacity: 1; filter: brightness(1.2); }
        }
        @keyframes blink {
          0%, 94%, 100% { transform: scaleY(1); }
          97% { transform: scaleY(0.05); }
        }
      `}</style>
    </div>
  );
};
