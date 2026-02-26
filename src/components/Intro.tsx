import React, { useEffect, useRef } from "react";

interface IntroProps {
  onEnter: () => void;
}

const PHRASES = [
  "Este sistema no nace de la necesidad de controlar, sino del compromiso de cuidar.",
  "Porque dentro de cada docente existen dos voces: la que exige orden… y la que protege con humanidad.",
  "SASE no sustituye al maestro. Lo respalda.",
  "Cada registro es memoria institucional. Cada seguimiento es presencia.",
  "Educar es sostener límites sin perder el corazón e intervenir a tiempo.",
  "Una escuela que documenta, protege. Una escuela que protege, trasciende.",
];

export const Intro: React.FC<IntroProps> = ({ onEnter }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const auraRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const finalRef = useRef<HTMLElement>(null);
  const scrollIndRef = useRef<HTMLDivElement>(null);

  const updateDynamicStyles = () => {
    const scrollY = window.scrollY;
    const innerH = window.innerHeight;
    const totalH = innerH * 8;
    const maxScroll = totalH - innerH;
    const prog = Math.min(Math.max(scrollY / maxScroll, 0), 1);

    // 1. Container height
    if (containerRef.current) {
      containerRef.current.style.height = `${totalH}px`;
    }

    // 2. Video Frame Control
    const video = videoRef.current;
    if (video && video.duration && video.readyState >= 2) {
      const targetTime = prog * (video.duration - 0.1);
      if (Math.abs(video.currentTime - targetTime) > 0.01) {
        video.currentTime = targetTime;
      }
    }

    // 3. Background Cinematic Layer
    if (bgRef.current) {
      const bgOpacity = prog > 0.9 ? "0" : "0.6";
      const bgBlur = `blur(${prog > 0.8 ? (prog - 0.8) * 40 : 0}px) grayscale(0.4) brightness(0.4)`;
      bgRef.current.style.opacity = bgOpacity;
      bgRef.current.style.filter = bgBlur;
    }

    // 4. Transition Aura
    if (auraRef.current) {
      auraRef.current.style.opacity = prog > 0.85 ? "1" : "0";
    }

    // 5. Skip Button
    if (skipRef.current) {
      skipRef.current.style.opacity = prog > 0.8 ? "0" : "1";
      skipRef.current.style.pointerEvents = prog > 0.8 ? "none" : "auto";
    }

    // 6. Phrases Animation
    if (containerRef.current) {
      const phraseElements =
        containerRef.current.querySelectorAll(".phrase-section");
      phraseElements.forEach((el, index) => {
        const htmlEl = el as HTMLElement;
        const start = index / 8;
        const end = (index + 1) / 8;
        let pOpacity = 0;
        let translateY = 40;
        let scale = 0.95;

        if (prog > start && prog < end) {
          const sectionProgress = (prog - start) / (end - start);
          if (sectionProgress < 0.2) {
            pOpacity = sectionProgress / 0.2;
            translateY = 40 * (1 - pOpacity);
            scale = 0.95 + 0.05 * pOpacity;
          } else if (sectionProgress < 0.8) {
            pOpacity = 1;
            translateY = 0;
            scale = 1;
          } else {
            pOpacity = 1 - (sectionProgress - 0.8) / 0.2;
            translateY = -40 * (1 - pOpacity);
            scale = 1 + 0.05 * (1 - pOpacity);
          }
        }
        htmlEl.style.opacity = pOpacity.toString();
        htmlEl.style.transform = `translateY(${translateY}px) scale(${scale})`;
        htmlEl.style.visibility = pOpacity <= 0 ? "hidden" : "visible";
      });
    }

    // 7. Final Interactive Section
    if (finalRef.current) {
      const fOpacity = prog > 7.1 / 8 ? (prog - 7.1 / 8) * 10 : 0;
      const fTransform = `translateY(${prog > 7.1 / 8 ? (1 - prog) * 100 : 100}px)`;
      finalRef.current.style.opacity = fOpacity.toString();
      finalRef.current.style.transform = fTransform;
      finalRef.current.style.display = prog > 6.8 / 8 ? "flex" : "none";
      finalRef.current.style.pointerEvents = prog > 0.9 ? "auto" : "none";
    }

    // 8. Scroll Indicator
    if (scrollIndRef.current) {
      scrollIndRef.current.style.opacity = prog > 0.05 ? "0" : "1";
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    const video = videoRef.current;
    if (!video) return;

    const metadataHandler = () => {
      video.playbackRate = 0;
      video.pause();
      updateDynamicStyles();
    };

    video.addEventListener("loadedmetadata", metadataHandler);
    video.addEventListener("canplay", metadataHandler);

    window.addEventListener("scroll", updateDynamicStyles, { passive: true });
    window.addEventListener("resize", updateDynamicStyles);

    // Initial Trigger
    setTimeout(updateDynamicStyles, 100);

    const unlockVideo = () => {
      video
        .play()
        .then(() => {
          video.pause();
          updateDynamicStyles();
        })
        .catch(() => {});
      window.removeEventListener("touchstart", unlockVideo);
      window.removeEventListener("mousedown", unlockVideo);
    };
    window.addEventListener("touchstart", unlockVideo);
    window.addEventListener("mousedown", unlockVideo);

    return () => {
      window.removeEventListener("scroll", updateDynamicStyles);
      window.removeEventListener("resize", updateDynamicStyles);
      video.removeEventListener("loadedmetadata", metadataHandler);
      video.removeEventListener("canplay", metadataHandler);
      window.removeEventListener("touchstart", unlockVideo);
      window.removeEventListener("mousedown", unlockVideo);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStart = () => {
    window.scrollTo({ top: 0, behavior: "instant" });
    onEnter();
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-[#05070a] text-white font-sans overflow-x-hidden min-h-screen"
    >
      {/* Cinematic Background Layer */}
      <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div
          ref={bgRef}
          className="absolute inset-0 transition-opacity duration-700"
        >
          <video
            ref={videoRef}
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover"
          >
            <source
              src="/assets/videos/intro_sase_parallax.mp4"
              type="video/mp4"
            />
          </video>
          {/* Deep Masking */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#05070a]/90 via-transparent via-50% to-[#05070a]"></div>
        </div>

        {/* Transition Aura */}
        <div
          ref={auraRef}
          className="absolute inset-0 bg-[#05070a] transition-opacity duration-1000"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#0f172a_0%,#05070a_100%)]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[60%] bg-blue-600/10 blur-[150px] animate-pulse-slow"></div>
        </div>
      </div>

      {/* Skip Action */}
      <button
        ref={skipRef}
        onClick={handleStart}
        className="fixed top-8 right-8 z-[100] px-6 py-2.5 rounded-full border border-white/5 bg-white/5 backdrop-blur-xl text-[10px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-95 flex items-center gap-2 group"
      >
        <span>Omitir Protocolo</span>
        <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
          arrow_forward
        </span>
      </button>

      {/* Cinematic Phrases */}
      {PHRASES.map((phrase, index) => (
        <section
          key={index}
          className="phrase-section fixed inset-0 flex items-center justify-center p-8 pointer-events-none z-10"
        >
          <h2 className="text-3xl md:text-6xl font-black text-center tracking-tight leading-tight max-w-5xl text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.1)] italic">
            {phrase.toUpperCase()}
          </h2>
        </section>
      ))}

      {/* Final Interface Wrapper */}
      <section
        ref={finalRef}
        className="fixed inset-0 flex flex-col items-center justify-center p-6 z-20 transition-all duration-1000"
      >
        <div className="mb-10 md:mb-14 flex flex-col items-center text-center px-4 max-w-[90vw]">
          <div className="relative size-32 md:size-52 mb-8 group">
            <div className="absolute inset-0 bg-blue-500/20 blur-[50px] rounded-full animate-pulse-slow"></div>
            <img
              src="/assets/branding/SASE.png"
              alt="SASE Logo"
              className="relative w-full h-full object-contain drop-shadow-[0_0_25px_rgba(59,130,246,0.3)] scale-125"
            />
          </div>

          <div className="h-1 w-24 bg-blue-600 my-6 md:my-8 rounded-full shadow-[0_0_25px_#3b82f6]"></div>

          <p className="text-blue-400/90 font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-[10px] md:text-sm max-w-[500px] leading-relaxed">
            SASE-310 <br />
            <span className="text-white/60">
              DONDE EL DEBER Y LA CONCIENCIA SE ENCUENTRAN
            </span>
          </p>
        </div>

        <button
          onClick={handleStart}
          className="group relative px-10 md:px-16 py-4 md:py-5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-sm md:text-lg tracking-[0.15em] md:tracking-[0.25em] uppercase shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:shadow-[0_0_50px_rgba(59,130,246,0.6)] border border-blue-400/30 hover:border-blue-400/60 transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          <div className="flex items-center gap-3 md:gap-4 relative z-10">
            <span>INGRESAR AL SISTEMA</span>
            <span className="material-symbols-outlined text-xl md:text-2xl group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </div>
        </button>
      </section>

      {/* Scroll Indicator */}
      <div
        ref={scrollIndRef}
        className="fixed bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 transition-opacity duration-700 pointer-events-none"
      >
        <div className="w-1 h-12 bg-gradient-to-b from-blue-500/0 via-blue-500 to-blue-500/0 relative overflow-hidden">
          <div className="absolute inset-0 bg-white animate-scroll-indicator"></div>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.6em] text-blue-500 ml-[0.6em] animate-pulse">
          Desliza
        </p>
      </div>
    </div>
  );
};
