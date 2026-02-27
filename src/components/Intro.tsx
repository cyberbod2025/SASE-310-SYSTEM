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
    // Retrasar un poco la aparición del orbe para que luzca colosal
    const t2 = setTimeout(() => setPhase(2), 1500); // Nace Orbe (esfera 3D) y flota, empiezan a encenderse ojos
    const t3 = setTimeout(() => setPhase(3), 4000); // Verde, ojos arriba
    const t4 = setTimeout(() => setPhase(4), 5500); // Naranja, ojos abajo
    const t5 = setTimeout(() => setPhase(5), 7000); // Rojo, ojos diagonal
    const t6 = setTimeout(() => setPhase(6), 8500); // Sacudida, regresa a azul luminoso, estrellas
    const t7 = setTimeout(() => setPhase(7), 10000); // Textos SASE y slogan
    const t8 = setTimeout(() => {
      setPhase(8);
      setTimeout(onEnter, 1200);
    }, 13000); // Fade final hacia Login

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
  let orbBase = "59, 130, 246"; // Azul inicial (#3b82f6)
  let eyeX = 0;
  let eyeY = 0;

  if (phase === 3) {
    orbBase = "0, 200, 83"; // Verde
    eyeY = -25; // Arriba
  } else if (phase === 4) {
    orbBase = "255, 152, 0"; // Naranja
    eyeY = 25; // Abajo
  } else if (phase === 5) {
    orbBase = "211, 47, 47"; // Rojo
    eyeX = 25; // Diagonal
    eyeY = -25;
  } else if (phase >= 6) {
    orbBase = "14, 165, 233"; // Azul de "Poder" (cyan)
  }

  // Gradiente 3D procedural usando the base color
  const orbGradient = `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.8) 0%, rgba(${orbBase}, 1) 30%, rgba(${orbBase}, 0.6) 70%, rgba(0,0,0,0.8) 100%)`;
  const orbGlow = `rgba(${orbBase}, 0.6)`;
  const plasmaColor = `rgba(${orbBase}, 0.8)`;

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
        <div className="absolute w-[90vw] h-[90vw] sm:w-[900px] sm:h-[900px] rounded-full border-[20px] border-[#0ea5e9]/20 blur-[10px] animate-[water-in_1.2s_ease-in_forwards]"></div>
        <div className="absolute w-[70vw] h-[70vw] sm:w-[700px] sm:h-[700px] rounded-full border-[15px] border-[#3b82f6]/30 blur-[8px] animate-[water-in_1.2s_ease-in_0.2s_forwards]"></div>
        <div className="absolute w-[50vw] h-[50vw] sm:w-[500px] sm:h-[500px] rounded-full border-[10px] border-[#2563eb]/40 blur-[5px] animate-[water-in_1.2s_ease-in_0.4s_forwards]"></div>
      </div>

      <div
        className={`relative z-10 flex flex-col items-center justify-center w-full h-full pointer-events-none transition-transform duration-1000`}
      >
        {/* Contenedor del Orbe para animaciones de flotar y sacudida */}
        <div
          className={`relative flex items-center justify-center transition-transform duration-1000 ${phase >= 7 ? "-translate-y-[15vh]" : ""} ${phase === 6 ? "animate-[shake_0.6s_ease-in-out]" : ""}`}
        >
          {/* Contenedor flotante y fade in original */}
          <div
            className={`relative flex items-center justify-center w-72 h-72 sm:w-[350px] sm:h-[350px] transition-all duration-[2000ms] ease-out ${phase >= 2 ? "opacity-100 scale-100" : "opacity-0 scale-0"} animate-[float_4s_ease-in-out_infinite]`}
          >
            {/* Halos de Luz (aparecen en phase 6) */}
            <div
              className={`absolute inset-[-60px] rounded-full bg-cyan-400/20 blur-3xl transition-all duration-1000 ${phase >= 6 ? "opacity-100 scale-125" : "opacity-0 scale-90"}`}
            ></div>
            <div
              className={`absolute inset-[-30px] rounded-full bg-blue-500/30 blur-2xl transition-all duration-1000 delay-100 ${phase >= 6 ? "opacity-100 scale-110" : "opacity-0 scale-90"}`}
            ></div>

            {/* Plasma rotando */}
            <div
              className="absolute inset-[-15px] rounded-full border-[4px] border-transparent border-t-[4px] transition-colors duration-[800ms] animate-[spin_3s_linear_infinite]"
              style={{ borderTopColor: plasmaColor }}
            ></div>
            <div
              className="absolute inset-[-25px] rounded-full border-[4px] border-transparent border-r-[4px] transition-colors duration-[800ms] animate-[spin_5s_linear_infinite_reverse]"
              style={{ borderRightColor: plasmaColor, opacity: 0.6 }}
            ></div>
            <div
              className="absolute inset-[-35px] rounded-full border-[2px] border-transparent border-b-[2px] transition-colors duration-[800ms] animate-[spin_7s_linear_infinite]"
              style={{ borderBottomColor: plasmaColor, opacity: 0.3 }}
            ></div>

            {/* Estrellitas doradas de poder (phase >= 6) */}
            <div
              className={`absolute inset-[-50px] transition-opacity duration-1000 ${phase >= 6 ? "opacity-100" : "opacity-0"}`}
            >
              <GoldenStar className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 text-[#FFD700] drop-shadow-[0_0_12px_rgba(255,215,0,0.8)] animate-[pulse-star_2s_infinite]" />
              <GoldenStar className="absolute bottom-4 left-1/4 -translate-x-1/2 w-8 h-8 text-[#FFD700] drop-shadow-[0_0_10px_rgba(255,215,0,0.8)] animate-[pulse-star_2.5s_infinite_0.5s]" />
              <GoldenStar className="absolute top-1/2 -left-8 -translate-y-1/2 w-6 h-6 text-[#FFE066] drop-shadow-[0_0_8px_rgba(255,215,0,0.8)] animate-[pulse-star_1.5s_infinite_0.2s]" />
              <GoldenStar className="absolute top-1/4 -right-8 w-9 h-9 text-[#FFD700] drop-shadow-[0_0_12px_rgba(255,215,0,0.8)] animate-[pulse-star_2s_infinite_0.8s]" />
            </div>

            {/* El Orbe 3D Esfera */}
            <div
              className="relative w-full h-full rounded-full flex justify-center items-center transition-all duration-[800ms] overflow-hidden"
              style={{
                background: orbGradient,
                boxShadow: `0 0 60px 20px ${orbGlow}, inset -30px -30px 50px rgba(0,0,0,0.7), inset 15px 15px 30px rgba(255,255,255,0.6)`,
              }}
            >
              {/* Ojos - Se encienden poco a poco (crecen en altura y opacidad) */}
              <div
                className="flex gap-10 transition-transform duration-[800ms] ease-in-out"
                style={{
                  transform: `translate(${eyeX}px, ${eyeY}px)`,
                }}
              >
                <div
                  className={`w-3 sm:w-4 bg-white rounded-full shadow-[0_0_25px_rgba(255,255,255,1)] transition-all duration-[3000ms] ease-out animate-[blink_4s_infinite_1s]`}
                  style={{
                    height: phase >= 2 ? "100px" : "0px",
                    opacity: phase >= 2 ? 1 : 0,
                  }}
                ></div>
                <div
                  className={`w-3 sm:w-4 bg-white rounded-full shadow-[0_0_25px_rgba(255,255,255,1)] transition-all duration-[3000ms] ease-out delay-300 animate-[blink_4s_infinite_1s]`}
                  style={{
                    height: phase >= 2 ? "100px" : "0px",
                    opacity: phase >= 2 ? 1 : 0,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Palabras SASE y Slogan "CONECTAMOS CONTIGO" */}
        <div
          className={`flex flex-col items-center justify-center transition-all duration-[1200ms] ease-out absolute bottom-[15vh] w-full ${phase >= 7 ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
        >
          <h1
            className="text-7xl md:text-9xl font-black tracking-widest text-white uppercase text-center leading-none"
            style={{ textShadow: "0 10px 40px rgba(255,255,255,0.4)" }}
          >
            SASE
          </h1>
          <h2 className="mt-6 text-sm md:text-2xl font-black tracking-[0.5em] text-[#FFD700] uppercase text-center drop-shadow-[0_2px_15px_rgba(255,215,0,0.6)] px-4 animate-[pulse-text_2s_ease-in-out_infinite]">
            CONECTAMOS CONTIGO
          </h2>
        </div>
      </div>

      <style>{`
        @keyframes water-in {
          0% { transform: scale(3); opacity: 0; }
          40% { opacity: 1; filter: blur(5px); }
          100% { transform: scale(0); opacity: 0; filter: blur(0px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          10% { transform: translateX(-15px) rotate(-10deg); filter: blur(6px); }
          20% { transform: translateX(15px) rotate(10deg); filter: blur(4px); }
          30% { transform: translateX(-15px) rotate(-10deg); filter: blur(2px); }
          40% { transform: translateX(15px) rotate(10deg); filter: blur(1px); }
          50% { transform: translateX(-10px) rotate(-8deg); filter: blur(0px); }
          60% { transform: translateX(10px) rotate(8deg); }
          70% { transform: translateX(-5px) rotate(-4deg); }
          80% { transform: translateX(5px) rotate(4deg); }
          90% { transform: translateX(-2px) rotate(-2deg); }
        }
        @keyframes pulse-star {
          0%, 100% { transform: scale(0.8); opacity: 0.6; }
          50% { transform: scale(1.5) rotate(45deg); opacity: 1; filter: brightness(1.4); }
        }
        @keyframes pulse-text {
          0%, 100% { opacity: 0.8; transform: scale(1); filter: brightness(1); }
          50% { opacity: 1; transform: scale(1.02); filter: brightness(1.3); }
        }
        @keyframes blink {
          0%, 94%, 100% { transform: scaleY(1); }
          97% { transform: scaleY(0.05); }
        }
      `}</style>
    </div>
  );
};
