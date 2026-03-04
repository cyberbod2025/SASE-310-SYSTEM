import React, { useEffect, useState } from "react";

interface BrandIntroProps {
  brandName?: string;
  slogan?: string;
  onEnter: () => void;
  primaryColor?: string; // Formato "R, G, B" (ej: "59, 130, 246")
}

export const BrandIntro: React.FC<BrandIntroProps> = ({
  brandName = "SASE",
  slogan = "CONECTAMOS CONTIGO",
  onEnter,
  primaryColor = "14, 165, 233", // Azul SASE / Sky-500
}) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // Tiempos ultra-acelerados para una experiencia más fluida
    const t1 = setTimeout(() => setPhase(1), 10);
    const t2 = setTimeout(() => setPhase(2), 50);
    const t3 = setTimeout(() => setPhase(3), 100);
    const t4 = setTimeout(() => setPhase(4), 180);
    const t5 = setTimeout(() => setPhase(5), 260);
    const t6 = setTimeout(() => setPhase(6), 340);
    const t7 = setTimeout(() => setPhase(7), 420);
    const t8 = setTimeout(() => {
      setPhase(8);
      setTimeout(onEnter, 100);
    }, 600);

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

  const [isClicked, setIsClicked] = useState(false);

  const handleInteraction = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 150);

    if (phase < 7) {
      setPhase((prev) => prev + 1);
    } else {
      setPhase(8);
      setTimeout(onEnter, 150);
    }
  };

  // Dinámica de color según fase
  let orbBase = primaryColor;
  let eyeX = 0;
  let eyeY = 0;

  if (phase === 3) {
    orbBase = "0, 200, 83";
    eyeY = -25;
  } else if (phase === 4) {
    orbBase = "255, 152, 0";
    eyeY = 25;
  } else if (phase === 5) {
    orbBase = "211, 47, 47";
    eyeX = 25;
    eyeY = -25;
  }

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center transition-opacity duration-[800ms] overflow-hidden font-sans"
      style={{
        opacity: phase === 8 ? 0 : 1,
        backgroundColor: isClicked ? "rgba(59, 130, 246, 0.1)" : "black",
      }}
      onClick={handleInteraction}
    >
      {/* 1. Ondas de "Agua" procedimentales */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-500"
        style={{ opacity: phase >= 1 && phase < 3 ? 1 : 0 }}
      >
        <div className="absolute w-[900px] h-[900px] rounded-full border-[20px] border-[#0ea5e9]/20 blur-[10px] animate-wave-in"></div>
        <div className="absolute w-[700px] h-[700px] rounded-full border-[15px] border-[#3b82f6]/30 blur-[8px] animate-wave-in-delayed"></div>
      </div>

      <div
        className={`relative z-10 flex flex-col items-center justify-center w-full h-full transition-all duration-1000 ${phase >= 7 ? "-translate-y-[15vh]" : ""}`}
      >
        {/* 2. El Orbe 3D Proporción Áurea */}
        <div
          className={`relative flex items-center justify-center h-72 w-72 sm:w-[350px] sm:h-[350px] transition-all duration-[2000ms] ${phase >= 2 ? "opacity-100 scale-100" : "opacity-0 scale-0"} ${phase === 6 ? "animate-shake" : ""} `}
        >
          {/* Halos de Plasma */}
          <div
            className={`absolute inset-[-60px] rounded-full bg-[#0ea5e9]/10 blur-3xl transition-opacity duration-1000 ${phase >= 6 ? "opacity-100" : "opacity-0"}`}
          ></div>
          <div className="absolute inset-[-15px] rounded-full border-[4px] border-transparent border-t-[4px] border-sky-400/40 animate-spin-fast"></div>
          <div className="absolute inset-[-25px] rounded-full border-[3px] border-transparent border-r-[3px] border-sky-500/20 animate-spin-slow"></div>

          {/* Esfera con Gradiente Generativo */}
          <div
            className="w-full h-full rounded-full flex justify-center items-center overflow-hidden transition-colors duration-[1200ms]"
            style={{
              background: isClicked
                ? `radial-gradient(circle at 35% 35%, #fff 0%, rgba(${orbBase}, 1) 40%, #000 95%)`
                : `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.95) 0%, rgba(${orbBase}, 1) 40%, rgba(15,23,42,1) 95%)`,
              boxShadow: isClicked
                ? `0 0 150px 40px rgba(${orbBase}, 0.8), inset -30px -30px 60px rgba(0,0,0,0.8), inset 30px 30px 50px rgba(255,255,255,0.6)`
                : `0 0 100px 20px rgba(${orbBase}, 0.5), inset -30px -30px 60px rgba(0,0,0,0.8), inset 30px 30px 50px rgba(255,255,255,0.4)`,
              transform: isClicked ? "scale(1.05)" : "scale(1)",
            }}
          >
            {/* Ojos Interactivos */}
            <div
              className="flex gap-10 transition-transform duration-[800ms]"
              style={{ transform: `translate(${eyeX}px, ${eyeY}px)` }}
            >
              <div className="w-2 h-4 sm:h-6 bg-white rounded-full shadow-[0_0_15px_white] animate-blink"></div>
              <div className="w-2 h-4 sm:h-6 bg-white rounded-full shadow-[0_0_15px_white] animate-blink-delayed"></div>
            </div>
          </div>
        </div>

        {/* 3. Identidad de Marca */}
        <div
          className={`absolute bottom-[15vh] flex flex-col items-center transition-all duration-1000 ${phase >= 7 ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
        >
          <h1 className="text-7xl md:text-9xl font-black tracking-widest text-white uppercase italic text-shadow-glow">
            {brandName}
          </h1>
          <h2 className="mt-4 text-xs md:text-2xl font-black tracking-[0.6em] text-yellow-400 uppercase animate-pulse">
            {slogan}
          </h2>
        </div>
      </div>

      <style>{`
        @keyframes wave-in {
          0% { transform: scale(3); opacity: 0; }
          40% { opacity: 1; }
          100% { transform: scale(0); opacity: 0; }
        }
        .animate-wave-in { animation: wave-in 1.5s ease-in forwards; }
        .animate-wave-in-delayed { animation: wave-in 1.5s ease-in 0.3s forwards; }
        
        .animate-spin-fast { animation: spin 3s linear infinite; }
        .animate-spin-slow { animation: spin 5s linear infinite reverse; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .animate-blink { animation: blink 4s infinite 1s; }
        .animate-blink-delayed { animation: blink 4s infinite 1.3s; }
        @keyframes blink { 0%, 94%, 100% { transform: scaleY(1); } 97% { transform: scaleY(0.05); } }

        .animate-shake { animation: shake 0.6s ease-in-out; }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-15px) rotate(-10deg); }
          75% { transform: translateX(15px) rotate(10deg); }
        }

        .text-shadow-glow { text-shadow: 0 10px 40px rgba(255,255,255,0.4); }
      `}</style>
    </div>
  );
};
