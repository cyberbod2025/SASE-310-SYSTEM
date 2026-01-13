import React from "react";
import { useApp } from "../store";
import { AppModule, UserRole } from "../types";

export const OrbNavigation = () => {
  const { setCurrentModule } = useApp();

  const menuItems = [
    {
      id: AppModule.DASHBOARD,
      label: "Tablero",
      icon: "dashboard",
      color: "from-blue-500 to-cyan-400",
      delay: "0s",
    },
    {
      id: AppModule.INSCRIPCIONES,
      label: "Inscripción",
      icon: "badge",
      color: "from-purple-500 to-pink-400",
      delay: "1s",
    },
    {
      id: AppModule.REPORTES,
      label: "Reportes",
      icon: "analytics",
      color: "from-amber-500 to-orange-400",
      delay: "0.5s",
    },
    {
      id: AppModule.PROTOCOLOS,
      label: "Protocolos",
      icon: "policy",
      color: "from-emerald-500 to-green-400",
      delay: "1.5s",
    },
    {
      id: AppModule.AGENDA,
      label: "Agenda",
      icon: "calendar_month",
      color: "from-indigo-500 to-blue-400",
      delay: "0.2s",
    },
    {
      id: AppModule.ARCHIVO,
      label: "Archivo",
      icon: "folder_special",
      color: "from-rose-500 to-red-400",
      delay: "0.8s",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center relative overflow-hidden p-8 perspective-1000">
      {/* Ambient particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-ping opacity-20"></div>
        <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-purple-400 rounded-full animate-pulse opacity-20"></div>
      </div>

      <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200 mb-12 animate-fade-in text-center drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
        Centro de Comando
      </h1>

      {/* The "Tray" of Spheres */}
      <div
        className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 relative z-10"
        style={{ transformStyle: "preserve-3d" }}
      >
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentModule(item.id)}
            className="group relative flex flex-col items-center justify-center"
            style={{
              animation: `float 4s ease-in-out infinite`,
              animationDelay: item.delay,
            }}
          >
            {/* The Sphere */}
            <div
              className={`relative size-24 md:size-32 rounded-full bg-gradient-to-br ${item.color} 
                          shadow-[0_0_30px_rgba(255,255,255,0.1),inset_0_0_20px_rgba(255,255,255,0.3)]
                          backdrop-blur-md border border-white/20
                          group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 ease-out
                          flex items-center justify-center overflow-hidden`}
            >
              {/* Shine effect */}
              <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-full pointer-events-none"></div>

              {/* Icon */}
              <span className="material-symbols-outlined text-4xl md:text-5xl text-white drop-shadow-md group-hover:animate-pulse">
                {item.icon}
              </span>
            </div>

            {/* Reflection/Shadow under sphere */}
            <div className="absolute -bottom-6 w-16 h-4 bg-black/40 blur-xl rounded-[100%] group-hover:scale-75 group-hover:opacity-70 transition-all duration-500"></div>

            {/* Label */}
            <span className="mt-6 text-lg font-bold text-white tracking-wider opacity-80 group-hover:opacity-100 group-hover:text-blue-300 transition-colors uppercase text-shadow-glow">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
