import React, { useEffect, useState } from "react";
import { SaseSplineOrb } from "./SaseSplineOrb";

interface IntroProps {
  onEnter: () => void;
}

export const Intro: React.FC<IntroProps> = ({ onEnter }) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // 0ms: Pantalla negra
    const t1 = setTimeout(() => setPhase(1), 300); // Agua fluyendo al centro
    const t2 = setTimeout(() => setPhase(2), 1500); // Nace Orbe (esfera 3D) y flota
    const t3 = setTimeout(() => setPhase(3), 4000); // Verde, ojos arriba
    const t4 = setTimeout(() => setPhase(4), 5500); // Naranja, ojos abajo
    const t5 = setTimeout(() => setPhase(5), 7000); // Rojo, ojos diagonal
    const t6 = setTimeout(() => setPhase(6), 8500); // Sacudida, plasma, color serio
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
    orbBase = "14, 165, 233"; // Azul cielo imponente (Sky 500)
  }

  // Gradiente 3D procedural estilo metal de alta densidad
  const orbGradient = `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.9) 0%, rgba(${orbBase}, 1) 40%, rgba(30,58,138, 0.9) 80%, rgba(2,6,23,0.95) 100%)`;
  const orbGlow = `rgba(${orbBase}, 0.8)`;
  const plasmaColor = `rgba(${orbBase}, 0.8)`;

  return (
    <div
      className="fixed inset-0 z-[999] bg-black flex flex-col items-center justify-center transition-opacity duration-[1200ms] overflow-hidden font-sans"
      style={{ opacity: phase === 8 ? 0 : 1 }}
      onClick={handleSkip}
    >
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
        <div
          className={`relative flex items-center justify-center transition-transform duration-1000 ${phase >= 7 ? "-translate-y-[15vh]" : ""} ${phase === 6 ? "animate-[shake_0.6s_ease-in-out]" : ""}`}
        >
          <div
            className={`relative flex items-center justify-center w-72 h-72 sm:w-[350px] sm:h-[350px] transition-all duration-[2000ms] ease-out ${phase >= 2 ? "opacity-100 scale-100" : "opacity-0 scale-0"} animate-[float_4s_ease-in-out_infinite]`}
          >
            {/* Halos de Luz */}
            <div
              className={`absolute inset-[-60px] rounded-full bg-blue-600/10 blur-3xl transition-all duration-[1500ms] ${phase >= 6 ? "opacity-100 scale-125" : "opacity-0 scale-90"}`}
            ></div>
            <div
              className={`absolute inset-[-30px] rounded-full bg-indigo-500/20 blur-2xl transition-all duration-[1500ms] delay-100 ${phase >= 6 ? "opacity-100 scale-110" : "opacity-0 scale-90"}`}
            ></div>

            {/* Plasma rotando fino */}
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

            {/* Fluidos / Plasma Levitando Imponente (phase >= 6) */}
            <div
              className={`absolute inset-[-120px] transition-opacity duration-[1500ms] ${phase >= 6 ? "opacity-100" : "opacity-0"}`}
            >
              <div className="absolute top-[10%] left-[0%] w-32 h-32 bg-blue-500/30 rounded-full blur-[40px] animate-[levitate_3s_ease-in-out_infinite]" />
              <div className="absolute bottom-[0%] left-[80%] w-40 h-40 bg-indigo-600/30 rounded-full blur-[50px] animate-[levitate_4s_ease-in-out_infinite_0.5s]" />
              <div className="absolute top-[80%] left-[10%] w-24 h-24 bg-blue-800/40 rounded-full blur-[35px] animate-[levitate_3.5s_ease-in-out_infinite_1s]" />
              <div className="absolute top-[15%] left-[75%] w-36 h-36 bg-blue-400/20 rounded-full blur-[45px] animate-[levitate_4.5s_ease-in-out_infinite_0.2s]" />
            </div>

            {/* El Orbe 3D Esfera Spline Official */}
            <div className="relative w-full h-full rounded-full transition-all duration-[1200ms]">
              <SaseSplineOrb 
                state={
                  phase === 3 ? "normal" :
                  phase === 4 ? "warning" :
                  phase === 5 ? "alert" :
                  "thinking"
                }
                className="w-full h-full"
              />
            </div>
          </div>
        </div>

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
        @keyframes levitate {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.1); }
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
