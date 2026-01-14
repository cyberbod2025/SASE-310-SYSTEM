import React from "react";
import { useApp } from "../store";
import { AppModule, UserRole } from "../types";

export const OrbNavigation = () => {
  const { setCurrentModule, currentUserRole } = useApp();

  const getMenuItems = () => {
    const baseItems = [
      {
        id: AppModule.DASHBOARD,
        label: "Tablero",
        icon: "dashboard",
        color: "from-blue-600 to-cyan-500",
        delay: "0s",
      },
    ];

    switch (currentUserRole) {
      case UserRole.DOCENTE:
      case UserRole.DOCENTE_TUTOR:
        return [
          ...baseItems,
          {
            id: AppModule.AGENDA,
            label: "Agenda",
            icon: "calendar_month",
            color: "from-indigo-600 to-blue-500",
            delay: "0.2s",
          },
          {
            id: AppModule.REPORTES,
            label: "Reportes",
            icon: "analytics",
            color: "from-amber-600 to-orange-500",
            delay: "0.4s",
          },
          {
            id: AppModule.PROTOCOLOS,
            label: "Protocolos",
            icon: "policy",
            color: "from-emerald-600 to-green-500",
            delay: "0.6s",
          },
          {
            id: AppModule.ARCHIVO,
            label: "Archivo",
            icon: "folder_special",
            color: "from-rose-600 to-red-500",
            delay: "0.8s",
          },
        ];
      case UserRole.SECRETARIA:
        return [
          ...baseItems,
          {
            id: AppModule.INSCRIPCIONES,
            label: "Admisión",
            icon: "badge",
            color: "from-purple-600 to-pink-500",
            delay: "0.2s",
          },
          {
            id: AppModule.ARCHIVO,
            label: "Archivo",
            icon: "folder_special",
            color: "from-indigo-600 to-blue-500",
            delay: "0.4s",
          },
          {
            id: AppModule.AGENDA,
            label: "Eventos",
            icon: "calendar_month",
            color: "from-emerald-600 to-green-500",
            delay: "0.6s",
          },
        ];
      case UserRole.DIRECTIVO:
      case UserRole.DEVELOPER:
        return [
          ...baseItems,
          {
            id: AppModule.BITACORA,
            label: "Auditoría",
            icon: "policy",
            color: "from-slate-700 to-slate-900",
            delay: "0.2s",
          },
          {
            id: AppModule.REPORTES,
            label: "Estadística",
            icon: "analytics",
            color: "from-blue-700 to-indigo-900",
            delay: "0.4s",
          },
          {
            id: AppModule.PROTOCOLOS,
            label: "Jurídico",
            icon: "gavel",
            color: "from-amber-700 to-orange-900",
            delay: "0.6s",
          },
          {
            id: AppModule.ARCHIVO,
            label: "Archivo Gral",
            icon: "history_edu",
            color: "from-emerald-600 to-teal-900",
            delay: "0.8s",
          },
        ];
      case UserRole.PREFECTURA:
        return [
          ...baseItems,
          {
            id: AppModule.REPORTES,
            label: "Disciplina",
            icon: "description",
            color: "from-rose-600 to-red-500",
            delay: "0.2s",
          },
          {
            id: AppModule.PROTOCOLOS,
            label: "Seguridad",
            icon: "security",
            color: "from-blue-600 to-indigo-500",
            delay: "0.4s",
          },
          {
            id: AppModule.AGENDA,
            label: "Guardias",
            icon: "schedule",
            color: "from-amber-600 to-orange-500",
            delay: "0.6s",
          },
        ];
      default:
        return [
          ...baseItems,
          {
            id: AppModule.AGENDA,
            label: "Agenda",
            icon: "calendar_month",
            color: "from-indigo-600 to-blue-500",
            delay: "0.2s",
          },
          {
            id: AppModule.PROTOCOLOS,
            label: "Protocolos",
            icon: "policy",
            color: "from-emerald-600 to-green-500",
            delay: "0.4s",
          },
        ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center relative overflow-hidden p-8 font-sans">
      {/* Dynamic Background (Technical/Executive) */}
      <div className="absolute inset-0 bg-[#f8fafc]">
        {/* Subtle Mesh Grid */}
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(#0f172a 1px, transparent 1px), linear-gradient(90deg, #0f172a 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        ></div>
        {/* Soft Radial Depth */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8),transparent)]"></div>
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/[0.02] rounded-full blur-[120px]"></div>
      </div>

      <div className="text-center relative z-20 mb-20 animate-fade-in">
        <div className="flex flex-col items-center gap-2 mb-4">
          <span className="text-[10px] font-black text-blue-700 uppercase tracking-[0.4em] mb-2">
            Plataforma Estratégica
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-slate-800 tracking-tighter uppercase italic leading-none">
            Centro de <span className="text-blue-700">Comando</span>
          </h1>
        </div>
        <div className="h-1 w-24 bg-blue-700 rounded-full mx-auto mb-6"></div>
        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.5em] flex items-center justify-center gap-4">
          MÓDULOS DE GESTIÓN :: {currentUserRole}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-12 md:gap-16 max-w-6xl relative z-10 perspective-1000">
        {menuItems.map((item) => (
          <div key={item.id} className="flex flex-col items-center">
            <button
              onClick={() => setCurrentModule(item.id)}
              className="group relative flex flex-col items-center justify-center transition-all duration-500 ease-out"
              style={{
                animation: `float 6s ease-in-out infinite`,
                animationDelay: item.delay,
              }}
            >
              {/* Institutional Orb */}
              <div
                className={`relative size-28 md:size-36 rounded-[2.5rem] bg-gradient-to-br ${item.color} 
                            shadow-xl shadow-blue-900/10 border border-white/20
                            group-hover:scale-110 group-hover:rounded-full transition-all duration-500 ease-in-out
                            flex items-center justify-center overflow-hidden`}
              >
                {/* Visual Polish */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.4),transparent)]"></div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250%_250%] animate-shine-sweep"></div>

                <span className="material-symbols-outlined text-4xl md:text-5xl text-white drop-shadow-lg group-hover:scale-110 transition-transform">
                  {item.icon}
                </span>
              </div>

              {/* Modern Label */}
              <div className="absolute -bottom-10 flex flex-col items-center">
                <span className="text-sm font-black text-slate-700 uppercase tracking-widest opacity-80 group-hover:opacity-100 group-hover:text-blue-700 transition-all">
                  {item.label}
                </span>
                <div className="h-1 w-0 bg-blue-600 rounded-full group-hover:w-full transition-all duration-300 mt-1"></div>
              </div>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
