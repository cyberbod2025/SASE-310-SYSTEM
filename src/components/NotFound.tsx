import React from "react";
import { useApp } from "../store";
import { AppModule } from "../types";

export const NotFound = () => {
  const { setCurrentModule } = useApp();

  return (
    <div className="relative min-h-screen w-full bg-black flex items-center justify-center overflow-hidden font-mono">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/assets/404.mp4" type="video/mp4" />
        </video>
        {/* Subtle Overlay to ensure button visibility */}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Content Overlay - Minimal */}
      <div className="relative z-10 text-center">
        <button
          onClick={() => setCurrentModule(AppModule.DASHBOARD)}
          className="group relative px-6 py-3 bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 text-white font-bold uppercase tracking-widest transition-all duration-300 rounded-lg overflow-hidden"
        >
          <div className="absolute inset-0 bg-blue-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          <div className="relative flex items-center gap-3">
            <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">
              arrow_back
            </span>
            Regresar al Sistema
          </div>
        </button>
      </div>
    </div>
  );
};
