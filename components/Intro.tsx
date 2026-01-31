import React, { useEffect, useState, useRef } from "react";

interface IntroProps {
  onEnter: () => void;
}

const PHRASES = [
  "La escuela no solo enseña.",
  "También cuida, acompaña y protege.",
  "Cada alumno importa.",
  "Cada situación deja huella.",
  "SASE convierte los hechos en seguimiento.",
  "Y el seguimiento en decisiones justas.",
];

export const Intro: React.FC<IntroProps> = ({ onEnter }) => {
  const [scrollY, setScrollY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const requestRef = useRef<number | null>(null);

  // Synchronize video currentTime with scroll progress
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateVideoFrame = () => {
      if (video.duration && video.readyState >= 2) {
        const h = window.innerHeight * 8;
        const maxScroll = h - window.innerHeight;
        const p = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
        const targetTime = p * (video.duration - 0.1);

        if (Math.abs(video.currentTime - targetTime) > 0.01) {
          video.currentTime = targetTime;
        }
      }
    };

    // Use scroll event for real-time tracking
    window.addEventListener("scroll", updateVideoFrame, { passive: true });

    // Initial sync and unlock
    const metadataHandler = () => {
      video.playbackRate = 0;
      video.pause();
      updateVideoFrame();
    };
    video.addEventListener("loadedmetadata", metadataHandler);
    video.addEventListener("canplay", metadataHandler);

    // Some browsers need a tiny play/pause to enable seeking
    const unlockVideo = () => {
      video
        .play()
        .then(() => {
          video.pause();
          updateVideoFrame();
        })
        .catch(() => {
          /* Autoplay block is fine, seeking might still work */
        });
      window.removeEventListener("touchstart", unlockVideo);
      window.removeEventListener("mousedown", unlockVideo);
    };
    window.addEventListener("touchstart", unlockVideo);
    window.addEventListener("mousedown", unlockVideo);

    return () => {
      window.removeEventListener("scroll", updateVideoFrame);
      video.removeEventListener("loadedmetadata", metadataHandler);
      video.removeEventListener("canplay", metadataHandler);
      window.removeEventListener("touchstart", unlockVideo);
      window.removeEventListener("mousedown", unlockVideo);
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleStart = () => {
    window.scrollTo({ top: 0, behavior: "instant" });
    onEnter();
  };

  const totalHeight = window.innerHeight * 8;
  const progress = Math.min(
    Math.max(scrollY / (totalHeight - window.innerHeight), 0),
    1,
  );

  // Keep video visible throughout the sequence, only blur slightly at the end
  const videoOpacity = 1;
  const videoBlur = progress > 0.8 ? (progress - 0.8) * 15 : 0;

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-[#020617] text-white font-['Inter',sans-serif]"
      style={{ height: `${totalHeight}px` }}
    >
      <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            opacity: Math.max(0, videoOpacity),
            filter: `blur(${Math.min(videoBlur, 8)}px) brightness(0.5)`,
          }}
        >
          <video
            ref={videoRef}
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover grayscale opacity-60"
          >
            <source
              src="/assets/videos/intro_sase_parallax.mp4"
              type="video/mp4"
            />
          </video>
          {/* MASKING GRADIENT - Stronger at bottom to hide video errors */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/90 via-transparent via-70% to-[#020617]"></div>
        </div>

        <div
          className="absolute inset-0 bg-[#020617] transition-opacity duration-1000"
          style={{ opacity: progress > 0.85 ? 1 : 0 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#020617]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-900/10 blur-[150px] animate-pulse"></div>
        </div>
      </div>

      {PHRASES.map((phrase, index) => {
        const start = index / 8;
        const end = (index + 1) / 8;
        let opacity = 0;
        let translateY = 30;

        if (progress > start && progress < end) {
          const sectionProgress = (progress - start) / (end - start);
          if (sectionProgress < 0.2) {
            opacity = sectionProgress / 0.2;
            translateY = 40 * (1 - opacity);
          } else if (sectionProgress < 0.8) {
            opacity = 1;
            translateY = 0;
          } else {
            opacity = 1 - (sectionProgress - 0.8) / 0.2;
            translateY = -40 * (1 - opacity);
          }
        }

        return (
          <section
            key={index}
            className="fixed inset-0 flex items-center justify-center p-8 pointer-events-none z-10"
            style={{
              opacity,
              transform: `translateY(${translateY}px)`,
              display: opacity <= 0 ? "none" : "flex",
            }}
          >
            <h2 className="text-2xl md:text-5xl font-light text-center tracking-tight leading-snug max-w-4xl text-slate-100 drop-shadow-2xl px-4">
              {phrase}
            </h2>
          </section>
        );
      })}

      <section
        className="fixed inset-0 flex flex-col items-center justify-center p-6 z-20 transition-all duration-1000"
        style={{
          opacity: progress > 7.2 / 8 ? (progress - 7.2 / 8) * 10 : 0,
          transform: `translateY(${progress > 7.2 / 8 ? (1 - progress) * 60 : 60}px)`,
          display: progress > 6.8 / 8 ? "flex" : "none",
          pointerEvents: progress > 0.92 ? "auto" : "none",
          background: `radial-gradient(circle at center, rgba(30, 58, 138, ${(progress - 0.85) * 0.4}) 0%, transparent 70%)`,
        }}
      >
        <div className="mb-10 flex flex-col items-center text-center">
          <div className="relative mb-6 group">
            <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full animate-pulse group-hover:bg-blue-500/40 transition-all"></div>
            <img
              src="/assets/branding/SASE.png"
              alt="SASE Logo"
              className="relative w-40 md:w-56 drop-shadow-2xl animate-pulse-subtle"
            />
          </div>
          <h1 className="text-4xl md:text-7xl font-bold tracking-tighter text-white uppercase leading-none drop-shadow-2xl">
            Conectamos contigo
          </h1>
          <p className="mt-4 text-blue-400 font-bold uppercase tracking-[0.4em] text-[10px] md:text-sm drop-shadow-lg">
            Sistema de Acompañamiento y Seguimiento Escolar
          </p>
          <p className="mt-2 text-white/30 font-black uppercase tracking-[0.6em] text-[8px]">
            ESD 310 • CIUDAD DE MÉXICO
          </p>
        </div>

        <button
          onClick={handleStart}
          className="group relative inline-flex items-center justify-center px-12 py-5 overflow-hidden rounded-full transition-all duration-500 hover:scale-105 active:scale-95 border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span className="relative z-10 text-base md:text-lg font-bold tracking-[0.2em] uppercase text-white group-hover:text-blue-300 transition-colors">
            Entrar al Sistema
          </span>
          <span className="material-symbols-outlined ml-3 text-white transition-transform group-hover:translate-x-1">
            login
          </span>
        </button>
      </section>

      <div
        className="fixed bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 transition-opacity duration-700 pointer-events-none"
        style={{ opacity: progress > 0.05 ? 0 : 1 }}
      >
        <div className="w-6 h-10 border-2 border-slate-500 rounded-full flex justify-center p-1">
          <div className="w-1 h-2 bg-slate-500 rounded-full animate-bounce"></div>
        </div>
        <p className="text-[9px] uppercase tracking-[0.5em] text-slate-500 font-bold">
          Desliza
        </p>
      </div>
    </div>
  );
};
