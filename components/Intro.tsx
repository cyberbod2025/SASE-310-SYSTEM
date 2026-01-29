import React, { useEffect, useState } from "react";

interface IntroProps {
  onEnter: () => void;
}

export const Intro: React.FC<IntroProps> = ({ onEnter }) => {
  // Simple scroll listener only for subtle Hero fade or navbar changes if needed later.
  // For now, relies purely on CSS for the layout and parallax structure requested.
  // "NO usar: JS experimental para parallax" -> Removed all JS transform logic.

  return (
    <div className="w-full bg-[#020617] text-white font-sans selection:bg-[#ff9605] selection:text-black">
      {/* 
        1. HERO SECTION (100vh) 
        - Parallax ONLY here.
        - Desktop: background-attachment: fixed
        - Mobile: background-attachment: scroll
      */}
      <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
        {/* Background Image Container */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat bg-scroll md:bg-fixed"
          style={{
            backgroundImage:
              "url('/assets/branding/login_background_final.png')",
          }}
        >
          {/* Overlay to ensure institutional dark tone #020617 with opacity */}
          <div className="absolute inset-0 bg-[#020617]/70 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/40 via-transparent to-[#020617]"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6">
          <h1 className="text-6xl md:text-9xl font-medium tracking-tight text-white mb-2">
            SASE
          </h1>
          <p className="text-xl md:text-3xl font-light text-slate-200 tracking-wide">
            Conectamos contigo
          </p>
        </div>

        {/* Scroll Hint */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 animate-pulse text-slate-500">
          <span className="material-symbols-outlined text-4xl">
            keyboard_arrow_down
          </span>
        </div>
      </section>

      {/* 
        2. CONTENT SECTIONS (Clean Scroll, No Parallax)
        - Background: Solid Institutional #020617
        - One idea per screen (h-screen or min-h-screen with ample padding)
      */}

      {/* Section 1 */}
      <section className="relative min-h-screen w-full bg-[#020617] flex items-center justify-center px-8 py-20 border-t border-slate-900/50">
        <div className="max-w-4xl w-full">
          <h2 className="text-4xl md:text-6xl font-normal leading-tight mb-8 text-white">
            ¿Todo recae siempre en ti?
          </h2>
          <p className="text-2xl md:text-4xl font-light text-slate-300 leading-relaxed">
            Planeaciones, reportes, incidencias, seguimiento, acuerdos.
          </p>
        </div>
      </section>

      {/* Section 2 */}
      <section className="relative min-h-screen w-full bg-[#020617] flex items-center justify-center px-8 py-20 pb-32">
        <div className="max-w-4xl w-full text-right ml-auto">
          <h2 className="text-4xl md:text-6xl font-normal leading-tight mb-8 text-white">
            SASE te acompaña.
          </h2>
          <p className="text-2xl md:text-4xl font-light text-slate-300 leading-relaxed">
            Registra y organiza sin perder claridad.
          </p>
        </div>
      </section>

      {/* Section 3 + CTA */}
      <section className="relative min-h-screen w-full bg-[#020617] flex flex-col items-center justify-center px-8 py-20 text-center">
        <div className="max-w-5xl">
          <h2 className="text-4xl md:text-6xl font-normal leading-tight mb-8 text-white">
            Tu trabajo queda documentado.
          </h2>
          <p className="text-2xl md:text-4xl font-light text-slate-300 leading-relaxed mb-20">
            Con orden y respaldo.
          </p>

          <button
            onClick={onEnter}
            className="group relative inline-flex items-center justify-center px-12 py-5 overflow-hidden rounded-full transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#ff9605] focus:ring-offset-2 focus:ring-offset-[#020617]"
          >
            {/* Button Background & Border */}
            <div className="absolute inset-0 border border-slate-700 bg-slate-900/50 backdrop-blur-sm rounded-full transition-all group-hover:border-[#ff9605]/50 group-hover:bg-[#ff9605]/10"></div>

            <span className="relative z-10 text-lg md:text-xl font-medium tracking-widest uppercase text-white group-hover:text-[#ff9605] transition-colors">
              Entrar al sistema
            </span>
          </button>
        </div>
      </section>
    </div>
  );
};
