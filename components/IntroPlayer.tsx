import React, { useState, useRef } from "react";

interface IntroPlayerProps {
  onComplete: () => void;
}

export const IntroPlayer: React.FC<IntroPlayerProps> = ({ onComplete }) => {
  const [hasStarted, setHasStarted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startSequence = () => {
    setHasStarted(true);
    // Short delay to ensure video element is rendered
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play().catch((err) => {
          console.error("Autoplay prevented:", err);
          // If autoplay fails, we might need to show a play button again or just skip
        });
      }
    }, 100);
  };

  const handleVideoEnd = () => {
    // Optional fade out effect could go here
    onComplete();
  };

  if (!hasStarted) {
    return (
      <div
        onClick={startSequence}
        className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center cursor-pointer font-mono text-center select-none"
      >
        {/* Ambient Background Effect */}
        {/* Ambient Background Effect */}
        <div className="absolute inset-0 bg-black"></div>

        <style>{`
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes mystery-shimmer {
            0% { background-position: 200% center; opacity: 0.5; }
            100% { background-position: -200% center; opacity: 1; }
          }
          @keyframes pulse-glow {
            0%, 100% { text-shadow: 0 0 15px rgba(37,99,235,0.5); transform: scale(1); }
            50% { text-shadow: 0 0 40px rgba(37,99,235,0.9), 0 0 80px rgba(147,51,234,0.6); transform: scale(1.02); }
          }
          @keyframes logo-shine {
            0% { transform: translateX(-150%) skewX(-25deg); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: translateX(150%) skewX(-25deg); opacity: 0; }
          }
          @keyframes float-bubble {
            0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
            50% { transform: translateY(-100px) scale(1.1); opacity: 0.8; }
          }
        `}</style>

        {/* Dynamic Moving Light Beams - MYSTERY ATMOSPHERE */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Deep Blue Mist */}
          <div className="absolute inset-0 bg-blue-900/10 mix-blend-overlay"></div>

          {/* Rotating Searchlight 1 (Blue) */}
          <div
            className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] opacity-60 mix-blend-screen"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0deg, transparent 320deg, rgba(37, 99, 235, 0.4) 360deg)",
              animation: "spin-slow 10s linear infinite",
            }}
          ></div>

          {/* Rotating Searchlight 2 (Purple) */}
          <div
            className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] opacity-50 mix-blend-screen"
            style={{
              background:
                "conic-gradient(from 180deg, transparent 0deg, transparent 320deg, rgba(168, 85, 247, 0.3) 360deg)",
              animation: "spin-slow 15s linear infinite reverse",
            }}
          ></div>

          {/* Central Breathing Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vh] h-[50vh] bg-blue-500/10 rounded-full blur-[80px] animate-pulse"></div>

          {/* Floating Purple Bubbles - ON TOP */}
          <div
            className="absolute top-[60%] left-[10%] w-64 h-64 bg-purple-500 rounded-full blur-[70px] mix-blend-screen"
            style={{
              animation: "float-bubble 8s ease-in-out infinite",
              opacity: 0.8,
            }}
          ></div>
          <div
            className="absolute top-[20%] right-[15%] w-80 h-80 bg-fuchsia-600 rounded-full blur-[90px] mix-blend-screen"
            style={{
              animation: "float-bubble 12s ease-in-out infinite",
              animationDelay: "2s",
              opacity: 0.7,
            }}
          ></div>
          <div
            className="absolute bottom-[10%] left-[30%] w-56 h-56 bg-violet-500 rounded-full blur-[60px] mix-blend-screen"
            style={{
              animation: "float-bubble 10s ease-in-out infinite",
              animationDelay: "4s",
              opacity: 0.9,
            }}
          ></div>
          <div
            className="absolute top-[10%] left-[40%] w-48 h-48 bg-indigo-500 rounded-full blur-[50px] mix-blend-screen"
            style={{
              animation: "float-bubble 15s ease-in-out infinite",
              animationDelay: "1s",
              opacity: 0.8,
            }}
          ></div>
          <div
            className="absolute bottom-[20%] right-[20%] w-72 h-72 bg-purple-600 rounded-full blur-[80px] mix-blend-screen"
            style={{
              animation: "float-bubble 9s ease-in-out infinite",
              animationDelay: "3s",
              opacity: 0.7,
            }}
          ></div>
        </div>

        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30 mix-blend-overlay"></div>

        <div className="relative z-10 p-10 md:p-12 border border-white/10 bg-black/70 backdrop-blur-xl rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.9)] max-w-3xl w-full transform transition-all hover:shadow-[0_0_80px_rgba(59,130,246,0.2)] flex flex-col items-center">
          {/* Logo or System Icon */}
          <div className="mb-6 relative inline-block">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl animate-pulse"></div>
            <span className="material-symbols-outlined text-7xl text-blue-400 relative">
              lock_clock
            </span>
          </div>

          <h1
            className="text-6xl md:text-8xl font-black tracking-[0.2em] mb-4 relative z-20 text-center"
            style={{
              background:
                "linear-gradient(90deg, #475569 0%, #ffffff 50%, #475569 100%)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              animation:
                "mystery-shimmer 4s ease-in-out infinite, pulse-glow 3s ease-in-out infinite alternate",
            }}
          >
            S.A.S.E.
          </h1>
          <p className="text-gray-300 text-xs md:text-lg tracking-[0.3em] uppercase mb-10 font-bold text-blue-100/60 shadow-black drop-shadow-lg text-center max-w-2xl leading-relaxed">
            Sistema de Acompañamiento y Seguimiento Escolar
          </p>

          <div className="w-full max-w-lg space-y-4 mb-10">
            <div className="flex items-center justify-center gap-3 text-blue-300 animate-pulse">
              <span className="material-symbols-outlined text-sm">
                wifi_tethering
              </span>
              <span className="text-xs font-bold uppercase">
                Esperando Conexión Segura...
              </span>
            </div>

            <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 w-1/3 animate-indeterminate-bar"></div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6 mb-8">
            <div className="text-sm text-blue-400/80 font-bold border border-blue-500/20 py-3 px-8 rounded-full inline-block group-hover:bg-blue-500/10 transition-colors animate-pulse tracking-widest cursor-pointer hover:bg-white/10 hover:text-white hover:border-white/40">
              [ CLIC EN PANTALLA PARA INICIAR ]
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onComplete();
              }}
              className="text-[10px] text-gray-500 hover:text-white font-mono tracking-widest uppercase transition-colors border-b border-transparent hover:border-blue-500/50 pb-0.5 z-50 cursor-pointer"
            >
              // OMITIR VIDEO E IR A LOGIN //
            </button>
          </div>

          {/* Author Logo Footer */}
          <div className="pt-8 border-t border-white/10 w-full flex flex-col items-center gap-4 relative">
            <p
              className="text-xs text-blue-400/60 font-mono tracking-[0.4em] uppercase font-bold"
              style={{ textShadow: "0 0 10px rgba(59,130,246,0.5)" }}
            >
              APP DESIGN BY:
            </p>

            <div className="relative group p-2">
              {/* The Logo - Increased significantly in size */}
              <img
                src="/assets/logo_hugo.png"
                className="h-24 md:h-32 w-auto object-contain drop-shadow-[0_0_25px_rgba(255,255,255,0.3)] transition-transform duration-500 hover:scale-105"
                alt="Hugo Logo"
              />

              {/* Shine Effect Overlay */}
              <div
                className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
                style={{ animation: "logo-shine 3s ease-in-out infinite" }}
              ></div>

              {/* Decorative Sparkles */}
              <div
                className="absolute -top-1 -right-4 w-1 h-1 bg-white rounded-full animate-ping"
                style={{ animationDuration: "2s" }}
              ></div>
              <div className="absolute top-1/2 -left-6 w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
              <div
                className="absolute -bottom-2 right-1/4 w-0.5 h-0.5 bg-purple-400 rounded-full animate-ping"
                style={{ animationDelay: "1s" }}
              ></div>
            </div>
          </div>
        </div>

        {/* Footer Technical Text */}
        <div className="absolute bottom-8 text-[10px] text-gray-700 font-mono tracking-wide">
          <p>SERVER: LOCALHOST:3000 | STATUS: STANDBY | ENCRYPTION: AES-256</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      {/* Skip Button (Safety valve) */}
      <button
        onClick={onComplete}
        className="absolute top-8 right-8 z-50 text-white/30 hover:text-white text-xs uppercase tracking-widest font-bold border border-white/10 hover:border-white/50 px-4 py-2 rounded-full transition-all"
      >
        Saltar Intro ↠
      </button>

      <video
        ref={videoRef}
        className="w-full h-full object-contain bg-black"
        onEnded={handleVideoEnd}
        controls
        // If file is missing, this handles the error gracefully by skipping
        onError={(e) => {
          console.warn("Video source failed. Skipping intro.", e);
          onComplete();
        }}
        playsInline
      >
        {/* We assume the user creates this file path */}
        <source src="/assets/intro_video.mp4" type="video/mp4" />
        su navegador no soporta video.
      </video>
    </div>
  );
};
