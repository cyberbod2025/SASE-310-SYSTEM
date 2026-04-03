import React, { useState } from "react";
import { useApp } from "../store";
import { AppModule, UserRole } from "../types";
import { supabase } from "../supabase/client";
import toast from "react-hot-toast";
import { SaseSplineOrb } from "./SaseSplineOrb";




import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from "../components/AuthProvider";

// ... (Rest of AdminLoginModal stays the same)

export const OrbNavigation = () => {
  const {
    setCurrentModule,
    currentUserRole,
    setIsAssistantOpen,
    isAssistantOpen,
    aiSystemState: saseState,
  } = useApp();
  const { user } = useAuth();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);


  const getMenuItems = () => {
    const baseItems = [
      {
        id: AppModule.DASHBOARD,
        label: "Tablero",
        icon: "dashboard",
        color: "from-blue-600 to-cyan-500",
      },
    ];

    switch (currentUserRole) {
      case UserRole.DEVELOPER:
        return [
          ...baseItems,
          {
            id: AppModule.EXPEDIENTES,
            label: "Expedientes",
            icon: "folder_shared",
            color: "from-blue-600 to-cyan-500",
          },
          {
            id: AppModule.APROBACIONES_PERSONAL,
            label: "Aprobaciones",
            icon: "group_add",
            color: "from-cyan-600 to-blue-700",
          },
          {
            id: AppModule.BITACORA,
            label: "Auditoría",
            icon: "policy",
            color: "from-slate-700 to-slate-900",
          },
          {
            id: AppModule.REPORTES,
            label: "Estadística",
            icon: "analytics",
            color: "from-blue-700 to-indigo-900",
          },
          {
            id: AppModule.PROTOCOLOS,
            label: "Control",
            icon: "admin_panel_settings",
            color: "from-red-700 to-rose-900",
          },
        ];
      case UserRole.DOCENTE:
      case UserRole.DOCENTE_TUTOR:
        return [
          ...baseItems,
          {
            id: AppModule.EXPEDIENTES,
            label: "Expedientes",
            icon: "folder_shared",
            color: "from-blue-600 to-cyan-500",
          },
          {
            id: AppModule.AGENDA,
            label: "Agenda",
            icon: "calendar_month",
            color: "from-indigo-600 to-blue-500",
          },
          {
            id: AppModule.REPORTES,
            label: "Reportes",
            icon: "analytics",
            color: "from-amber-600 to-orange-500",
          },
          {
            id: AppModule.PROTOCOLOS,
            label: "Protocolos",
            icon: "policy",
            color: "from-emerald-600 to-green-500",
          },
          {
            id: AppModule.ARCHIVO,
            label: "Archivo",
            icon: "folder_special",
            color: "from-rose-600 to-red-500",
          },
        ];
      case UserRole.PREFECTURA:
        return [
          ...baseItems,
          {
            id: AppModule.AGENDA,
            label: "Asistencia",
            icon: "how_to_reg",
            color: "from-orange-600 to-amber-500",
          },
          {
            id: AppModule.PROTOCOLOS,
            label: "Incidencias",
            icon: "report_medical",
            color: "from-red-600 to-rose-500",
          },
        ];
      case UserRole.ORIENTACION:
        return [
          ...baseItems,
          {
            id: AppModule.EXPEDIENTES,
            label: "Expedientes",
            icon: "folder_shared",
            color: "from-blue-600 to-cyan-500",
          },
          {
            id: AppModule.AGENDA,
            label: "Citas",
            icon: "event_available",
            color: "from-teal-600 to-emerald-500",
          },
          {
            id: AppModule.REPORTES,
            label: "Seguimiento",
            icon: "troubleshoot",
            color: "from-blue-600 to-indigo-500",
          },
        ];
      case UserRole.TRABAJO_SOCIAL:
        return [
          ...baseItems,
          {
            id: AppModule.TRABAJO_SOCIAL_TRACKER,
            label: "Casos TS",
            icon: "diversity_3",
            color: "from-purple-600 to-indigo-500",
          },
          {
            id: AppModule.AGENDA,
            label: "Visitas",
            icon: "home_pin",
            color: "from-amber-600 to-orange-500",
          },
        ];
      case UserRole.MEDICO_ESCOLAR:
        return [
          ...baseItems,
          {
            id: AppModule.SALUD,
            label: "Clínica",
            icon: "emergency",
            color: "from-red-600 to-rose-500",
          },
          {
            id: AppModule.REPORTES,
            label: "Expedientes",
            icon: "clinical_notes",
            color: "from-emerald-600 to-teal-500",
          },
        ];
      case UserRole.UDEII:
        return [
          ...baseItems,
          {
            id: AppModule.UDEII_TRACKER,
            label: "Inclusión",
            icon: "accessibility_new",
            color: "from-indigo-600 to-violet-500",
          },
          {
            id: AppModule.PROTOCOLOS,
            label: "Ajustes",
            icon: "psychology",
            color: "from-blue-600 to-cyan-500",
          },
        ];
      case UserRole.PROMOTORA_LECTURA:
        return [
          ...baseItems,
          {
            id: AppModule.LECTURA_TRACKER,
            label: "Lectura",
            icon: "menu_book",
            color: "from-pink-600 to-rose-500",
          },
          {
            id: AppModule.AGENDA,
            label: "Círculos",
            icon: "auto_stories",
            color: "from-fuchsia-600 to-purple-500",
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
          },
          {
            id: AppModule.ARCHIVO,
            label: "Archivo",
            icon: "folder_special",
            color: "from-indigo-600 to-blue-500",
          },
          {
            id: AppModule.AGENDA,
            label: "Eventos",
            icon: "calendar_month",
            color: "from-emerald-600 to-green-500",
          },
        ];
      case UserRole.SUBDIRECCION:
        return [
          ...baseItems,
          {
            id: AppModule.EXPEDIENTES,
            label: "Expedientes",
            icon: "folder_shared",
            color: "from-blue-600 to-cyan-500",
          },
          {
            id: AppModule.APROBACIONES_PERSONAL,
            label: "Aprobaciones",
            icon: "group_add",
            color: "from-cyan-600 to-blue-700",
          },
          {
            id: AppModule.AGENDA,
            label: "Agenda",
            icon: "calendar_month",
            color: "from-indigo-600 to-blue-500",
          },
          {
            id: AppModule.PROTOCOLOS,
            label: "Protocolos",
            icon: "policy",
            color: "from-emerald-600 to-green-500",
          },
          {
            id: AppModule.REPORTES,
            label: "Reportes",
            icon: "analytics",
            color: "from-amber-600 to-orange-500",
          },
        ];
      case UserRole.DIRECTIVO:
        return [
          ...baseItems,
          {
            id: AppModule.EXPEDIENTES,
            label: "Expedientes",
            icon: "folder_shared",
            color: "from-blue-600 to-cyan-500",
          },
          {
            id: AppModule.APROBACIONES_PERSONAL,
            label: "Aprobaciones",
            icon: "group_add",
            color: "from-cyan-600 to-blue-700",
          },
          {
            id: AppModule.INSCRIPCIONES,
            label: "Admisión",
            icon: "badge",
            color: "from-purple-600 to-pink-500",
          },
          {
            id: AppModule.BITACORA,
            label: "Auditoría",
            icon: "policy",
            color: "from-slate-700 to-slate-900",
          },
          {
            id: AppModule.REPORTES,
            label: "Estadística",
            icon: "analytics",
            color: "from-blue-700 to-indigo-900",
          },
          {
            id: AppModule.PROTOCOLOS,
            label: "Jurídico",
            icon: "gavel",
            color: "from-amber-700 to-orange-900",
          },
          {
            id: AppModule.ARCHIVO,
            label: "Archivo",
            icon: "history_edu",
            color: "from-emerald-600 to-teal-900",
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
          },
          {
            id: AppModule.PROTOCOLOS,
            label: "Protocolos",
            icon: "policy",
            color: "from-emerald-600 to-green-500",
          },
        ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4 py-8 font-sans bg-transparent">


      {/* Institutional Depth Background - Enhanced */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Technical Hud Lines */}
        <div className="absolute top-0 left-[10%] w-px h-full bg-white/[0.02]"></div>
        <div className="absolute top-0 right-[10%] w-px h-full bg-white/[0.02]"></div>
        <div className="absolute left-0 top-[20%] w-full h-px bg-white/[0.02]"></div>
        <div className="absolute left-0 bottom-[20%] w-full h-px bg-white/[0.02]"></div>

        <div className="absolute inset-0 opacity-[0.05] dot-grid-bg"></div>

        {/* Ambient Pulsing Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] bg-blue-600/[0.02] rounded-full blur-[180px] animate-pulse"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-full h-full bg-indigo-900/[0.03] rounded-full blur-[200px]"></div>
      </div>

      {/* HUD Header */}
      <div className="absolute top-12 left-0 w-full px-12 flex justify-between items-center z-30 pointer-events-none">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <span className="text-[8px] font-black tracking-[0.4em] text-blue-500/60 uppercase">
              Estado_del_Sistema
            </span>
            <div className="h-px w-24 bg-white/10"></div>
          </div>
          <span className="text-[10px] font-bold text-white/40 tabular-nums title-sase">
            OPERATIVO // AUTENTICACIÓN_L4
          </span>
        </div>
        <div className="flex flex-col items-end gap-1 text-right">
          <div className="flex items-center gap-3">
            <div className="h-px w-24 bg-white/10"></div>
            <span className="text-[8px] font-black tracking-[0.4em] text-cyan-500/60 uppercase">
              Núcleo_Neuronal
            </span>
          </div>
          <span className="text-[10px] font-bold text-white/40 tabular-nums title-sase">
            VESPERTINO_SEC_310
          </span>
        </div>
      </div>

      <div className="relative z-20 flex flex-col items-center justify-center w-full max-w-6xl">
        {/* Central Orb & Hero Content */}
        <div className="relative flex flex-col items-center justify-center min-h-[600px] w-full">
          {/* Central Hero Section with Orbital Menu */}
          <div className="relative flex items-center justify-center">
            {/* The actual Core Orb — Pure Plasma IA SASE */}
            {/* The actual Core Orb — Pure Plasma IA SASE */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1 }}
              className="relative size-64 md:size-80 flex items-center justify-center z-10"
            >
              <div className="absolute inset-0 rounded-full bg-blue-500/5 border border-white/5 animate-pulse-slow"></div>
              <div className="absolute inset-4 rounded-full border border-blue-500/10 animate-spin-slow"></div>
              <div className="absolute inset-8 rounded-full border-t-2 border-l-2 border-cyan-500/20 animate-spin-reverse-slow"></div>

              <button
                onClick={() => setIsAssistantOpen(!isAssistantOpen)}
                title="Interactuar con Núcleo IA SASE"
                className="relative z-10 w-32 h-32 md:w-56 md:h-56 rounded-full overflow-hidden cursor-pointer group transition-all duration-700 hover:scale-110 active:scale-90 flex items-center justify-center bg-black/40 backdrop-blur-xl border border-white/5 shadow-2xl"
              >
                <SaseSplineOrb state={saseState as any} className="w-full h-full" />

                <div className="absolute inset-0 rounded-full border border-white/10 group-hover:border-blue-500/30 transition-all duration-700 pointer-events-none" />
                {/* Visual pulse indicator when in normal state */}
                {saseState === "normal" && (
                  <motion.div 
                    animate={{ opacity: [0, 0.2, 0], scale: [1, 1.2, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-0 bg-amber-500 rounded-full"
                  />
                )}
              </button>
            </motion.div>

            {/* Rotating Orbital Menu Items */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              className="absolute size-[480px] flex items-center justify-center pointer-events-none"
            >
              {menuItems.map((item, index) => {
                const angle =
                  (index * (360 / menuItems.length) - 90) * (Math.PI / 180);
                const isMobile =
                  typeof window !== "undefined" && window.innerWidth < 768;
                const radius = isMobile ? 140 : 240;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                return (
                  <motion.div
                    key={item.id}
                    className="absolute pointer-events-auto"
                    style={{
                      left: "50%",
                      top: "50%",
                      marginLeft: -40,
                      marginTop: -40,
                      x,
                      y,
                    }}
                  >
                    <motion.button
                      animate={{ rotate: -360 }}
                      transition={{
                        duration: 60,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      whileHover={{ scale: 1.5, zIndex: 50 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setCurrentModule(item.id)}
                      className="group"
                    >
                      <div className="relative size-20 md:size-24 flex flex-col items-center justify-center rounded-2xl glass-card-quantum !bg-[#0b0e14]/80 !backdrop-blur-xl border border-white/10 group-hover:border-blue-500 group-hover:bg-blue-600/20 transition-all duration-500 shadow-2xl">
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity`}
                        ></div>
                        <span
                          className={`material-icons text-3xl ${item.color.replace("from-", "text-")} group-hover:scale-110 transition-transform`}
                        >
                          {item.icon}
                        </span>
                        <span className="mt-2 text-[10px] md:text-[11px] font-black text-slate-300 group-hover:text-white uppercase tracking-[0.2em] transition-colors title-sase">
                          {item.label}
                        </span>
                        <div className="absolute -top-1 -right-1 size-3 bg-blue-500 rounded-full scale-0 group-hover:scale-100 transition-transform origin-center flex items-center justify-center">
                          <div className="size-1 bg-white rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    </motion.button>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Tactical Ring Backgrounds */}
            <div className="absolute size-[300px] md:size-[480px] border border-white/5 rounded-full pointer-events-none animate-spin-slow"></div>
            <div className="absolute size-[400px] md:size-[580px] border border-white/[0.02] rounded-full pointer-events-none animate-spin-reverse-slow"></div>
          </div>

          <div className="mt-24 text-center animate-fade-in relative z-10 w-full">
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic leading-none mb-3 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 title-sase">
              <span>NÚCLEO</span>
              <span className="text-blue-500 drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                OPERATIVO
              </span>
            </h2>
            <div className="mb-6 flex flex-col items-center">
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] animate-pulse">
                NÚCLEO IA SASE
              </span>
              <div className="h-px w-12 bg-blue-500/30 mt-1"></div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <div className="flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-xl">
                <span className="size-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></span>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 title-sase">
                  ACCESO AUTORIZADO: {currentUserRole}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

