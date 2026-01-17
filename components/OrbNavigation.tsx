import React, { useState } from "react";
import { useApp } from "../store";
import { AppModule, UserRole } from "../types";
import { supabase } from "../supabase/client";

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
      alert("PIN de Seguridad Inválido");
      return;
    }

    setLoading(true);
    // 1. Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      alert("Credenciales inválidas o error de conexión.");
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
      alert("Acceso Super Admin Verificado. Bienvenido, Hugo.");
      window.location.assign("/"); // Clean reload without query params
    } else {
      alert(
        "Acceso Denegado: Este usuario no tiene privilegios de Super Admin."
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
            />
          </div>
          <div>
            <label className="block text-amber-500 text-xs uppercase font-bold mb-1">
              PIN de Seguridad (Token)
            </label>
            <input
              type="password"
              value={pin}
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

export const OrbNavigation = () => {
  const { setCurrentModule, currentUserRole } = useApp();
  const [showAdminModal, setShowAdminModal] = useState(false);

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
      // Allow Developer menu ONLY if actually authenticated as such
      case UserRole.DEVELOPER:
        return [
          ...baseItems,
          {
            id: AppModule.BITACORA,
            label: "Auditoría (Caja Negra)",
            icon: "policy",
            color: "from-slate-700 to-slate-900",
            delay: "0.2s",
          },
          {
            id: AppModule.REPORTES,
            label: "Estadística Global",
            icon: "analytics",
            color: "from-blue-700 to-indigo-900",
            delay: "0.4s",
          },
          {
            id: AppModule.PROTOCOLOS,
            label: "Control Total",
            icon: "admin_panel_settings",
            color: "from-red-700 to-rose-900",
            delay: "0.6s",
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
        // Developer role removed from here to hide it
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
      case UserRole.PROMOTORA:
        return [
          ...baseItems,
          {
            id: AppModule.AGENDA,
            label: "Eventos",
            icon: "event_note",
            color: "from-pink-600 to-rose-500",
            delay: "0.2s",
          },
          {
            id: AppModule.ARCHIVO,
            label: "Evidencias",
            icon: "folder_open",
            color: "from-purple-600 to-violet-500",
            delay: "0.4s",
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
      <AdminLoginModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
      />

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
          <span className="text-[11px] font-black text-blue-700 uppercase tracking-[0.4em] mb-2">
            Plataforma Estratégica
          </span>
        </div>

        {/* Branding Logo */}
        <img
          src="/assets/branding/SASE_LOGO.png"
          alt="SASE Piloto"
          className="h-20 mx-auto mb-4"
        />

        <h1 className="text-5xl md:text-7xl font-black text-slate-800 tracking-tighter uppercase italic leading-none">
          Centro de <span className="text-blue-700">Comando</span>
        </h1>

        {/* Registro de Usuarios Button - Only for Admin Roles */}
        {(currentUserRole === UserRole.DIRECTIVO ||
          currentUserRole === UserRole.SECRETARIA ||
          currentUserRole === UserRole.DEVELOPER) && (
          <button
            onClick={() => setCurrentModule(AppModule.INSCRIPCIONES)}
            className="mt-4 px-6 py-2 bg-blue-600 text-white font-black rounded-md hover:bg-blue-700 transition"
          >
            Registro de Usuarios
          </button>
        )}

        <div className="h-1 w-24 bg-blue-700 rounded-full mx-auto mb-6"></div>
        <p className="text-slate-500 font-black text-[11px] uppercase tracking-[0.5em] flex items-center justify-center gap-4">
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
                <span className="text-base font-black text-slate-700 uppercase tracking-widest opacity-90 group-hover:opacity-100 group-hover:text-blue-700 transition-all">
                  {item.label}
                </span>
                <div className="h-1 w-0 bg-blue-600 rounded-full group-hover:w-full transition-all duration-300 mt-1"></div>
              </div>
            </button>
          </div>
        ))}
      </div>

      {/* HIDDEN SUPER ADMIN ACCESS - Rule X.B */}
      <div
        className="fixed bottom-2 right-2 opacity-30 hover:opacity-100 cursor-pointer select-none transition-opacity text-slate-400 text-[12px] p-4 z-50 font-bold"
        onClick={(e) => {
          if (e.ctrlKey) {
            setShowAdminModal(true);
          }
        }}
        title="Admin Access (Ctrl+Click)"
      >
        π
      </div>
    </div>
  );
};
