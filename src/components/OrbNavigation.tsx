import React, { useState } from "react";
import { useApp } from "../store";
import { AppModule, UserRole } from "../types";
import { supabase } from "../supabase/client";
import toast from "react-hot-toast";
import { SaseIAOrb } from "./SaseIAOrb";
import { useSaseSystemState } from "../hooks/useSaseSystemState";

// Internal component for Secure Admin Login
const AdminLoginModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin !== "31416") {
      toast.error("PIN de Seguridad Inválido");
      return;
    }

    setLoading(true);
    // 1. Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      toast.error("Credenciales inválidas o error de conexión.");
      setLoading(false);
      return;
    }

    // 2. Verify Role in DB (Strict Backend Validation)
    // We check both tables to be safe as per pilot schema migration
    let role = null;
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profile) role = profile.role;
    else {
      // Fallback check
      const { data: perfil2 } = await supabase
        .from("perfiles_usuario")
        .select("rol")
        .eq("id", data.user.id)
        .single();
      if (perfil2) role = perfil2.rol;
    }

    if (role === UserRole.DEVELOPER || role === "super_admin") {
      toast.success("Acceso Super Admin Verificado. Bienvenido, Hugo.");
      window.location.assign("/"); // Clean reload without query params
    } else {
      toast.error(
        "Acceso Denegado: Este usuario no tiene privilegios de Super Admin.",
      );
      await supabase.auth.signOut();
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl w-full max-w-md shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white"
          title="Cerrar ventana de acceso"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="flex flex-col items-center mb-6">
          <span className="text-4xl mb-2">🛡️</span>
          <h2 className="text-xl font-black text-white uppercase tracking-widest">
            Acceso Restringido
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Nivel 0: Super Administración
          </p>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-slate-400 text-xs uppercase font-bold mb-1">
              ID Administrativo
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white outline-none focus:border-blue-500"
              placeholder="admin@sase..."
              title="Ingrese su correo electrónico administrativo"
            />
          </div>
          <div>
            <label className="block text-slate-400 text-xs uppercase font-bold mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white outline-none focus:border-blue-500"
              placeholder="Clave de acceso"
              title="Ingrese su contraseña institucional"
            />
          </div>
          <div>
            <label className="block text-amber-500 text-xs uppercase font-bold mb-1">
              PIN de Seguridad (Token)
            </label>
            <input
              type="password"
              value={pin}
              title="PIN de seguridad (Token)"
              onChange={(e) => setPin(e.target.value)}
              className="w-full bg-slate-800 border border-amber-500/50 rounded p-2 text-white outline-none focus:border-amber-500 text-center tracking-[0.5em] font-mono"
              maxLength={5}
              placeholder="•••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 text-white font-black uppercase tracking-widest rounded-lg mt-4 transition-all disabled:opacity-50"
          >
            {loading ? "Verificando..." : "Autenticar"}
          </button>
        </form>
      </div>
    </div>
  );
};

import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from "../components/AuthProvider";

// ... (Rest of AdminLoginModal stays the same)

export const OrbNavigation = () => {
  const { setCurrentModule, currentUserRole, setIsAssistantOpen } = useApp();
  const { user } = useAuth();
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { systemState: saseState } = useSaseSystemState(
    currentUserRole,
    user?.id,
  );

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
      <AdminLoginModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
      />

      {/* Institutional Depth Background - Enhanced */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Technical Hud Lines */}
        <div className="absolute top-0 left-[10%] w-px h-full bg-white/[0.02]"></div>
        <div className="absolute top-0 right-[10%] w-px h-full bg-white/[0.02]"></div>
        <div className="absolute left-0 top-[20%] w-full h-px bg-white/[0.02]"></div>
        <div className="absolute left-0 bottom-[20%] w-full h-px bg-white/[0.02]"></div>

        <div className="absolute inset-0 opacity-[0.05] dot-grid-bg"></div>

        {/* Ambient Pulsing Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] bg-blue-600/[0.03] rounded-full blur-[160px] animate-pulse"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-full h-full bg-indigo-900/[0.05] rounded-full blur-[180px]"></div>
      </div>

      {/* HUD Header */}
      <div className="absolute top-12 left-0 w-full px-12 flex justify-between items-center z-30 pointer-events-none">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <span className="text-[8px] font-black tracking-[0.4em] text-blue-500/60 uppercase">
              System_Status
            </span>
            <div className="h-px w-24 bg-white/10"></div>
          </div>
          <span className="text-[10px] font-bold text-white/40 tabular-nums">
            OPERATIONAL // L4_AUTH_ACTIVE
          </span>
        </div>
        <div className="flex flex-col items-end gap-1 text-right">
          <div className="flex items-center gap-3">
            <div className="h-px w-24 bg-white/10"></div>
            <span className="text-[8px] font-black tracking-[0.4em] text-cyan-500/60 uppercase">
              Neural_Core
            </span>
          </div>
          <span className="text-[10px] font-bold text-white/40 tabular-nums">
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
                onClick={() => setIsAssistantOpen(true)}
                title="Activar IA SASE"
                className="relative z-10 w-32 h-32 md:w-56 md:h-56 rounded-full overflow-hidden cursor-pointer group transition-all duration-700 hover:scale-110 active:scale-95 flex items-center justify-center bg-black/40 backdrop-blur-xl border border-white/5 shadow-2xl"
              >
                <SaseIAOrb state={saseState} className="w-full h-full" />

                <div className="absolute inset-0 rounded-full border border-white/10 group-hover:border-white/30 transition-all duration-700 pointer-events-none" />
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
                      <div className="relative size-20 md:size-24 flex flex-col items-center justify-center rounded-2xl bg-[#0b0e14]/80 backdrop-blur-xl border border-white/10 group-hover:border-blue-500 group-hover:bg-blue-600/20 transition-all duration-500 shadow-2xl">
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity`}
                        ></div>
                        <span
                          className={`material-symbols-outlined text-3xl ${item.color.replace("from-", "text-")} group-hover:scale-110 transition-transform`}
                        >
                          {item.icon}
                        </span>
                        <span className="mt-2 text-[8px] md:text-[9px] font-black text-slate-400 group-hover:text-white uppercase tracking-[0.2em] transition-colors">
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
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic leading-none mb-3 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4">
              <span>NÚCLEO</span>
              <span className="text-blue-500 drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                OPERATIVO
              </span>
            </h2>
            <div className="mb-6 flex flex-col items-center">
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] animate-pulse">
                SASE IA NUCLEUS
              </span>
              <div className="h-px w-12 bg-blue-500/30 mt-1"></div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <div className="flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-xl">
                <span className="size-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></span>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">
                  ACCESO AUTORIZADO: {currentUserRole}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secret Access π */}
      <button
        type="button"
        className="fixed bottom-6 right-6 z-50 group flex items-center gap-3 pb-safe bg-transparent border-none appearance-none cursor-pointer outline-none"
        onClick={(e) => e.ctrlKey && setShowAdminModal(true)}
        title="Acceso restringido para desarrolladores"
        aria-label="Portal secreto de administración"
      >
        <div className="flex flex-col items-end opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <span className="text-[7px] font-black text-blue-500 uppercase tracking-[0.3em]">
            SECURE_AUTH
          </span>
        </div>
        <div className="size-10 bg-slate-900/50 border border-white/5 rounded-2xl flex items-center justify-center hover:bg-blue-600/10 hover:border-blue-500/30 transition-all backdrop-blur-md">
          <span className="text-slate-600 group-hover:text-blue-500 italic text-sm">
            π
          </span>
        </div>
      </button>
    </div>
  );
};
