import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../store";
import { UserRole, AppModule } from "../types";
import { VoiceInput } from "./VoiceInput";
import toast from "react-hot-toast";

export const FloatingAssistant: React.FC = () => {
  const { currentUserRole, setCurrentModule, setQuickRegisterOpen } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const getRoleActions = () => {
    switch (currentUserRole) {
      case UserRole.DOCENTE:
        return [
          {
            icon: "add",
            label: "Nueva Incidencia",
            action: () => setQuickRegisterOpen(true),
          },
          {
            icon: "calendar_month",
            label: "Mi Agenda",
            action: () => setCurrentModule(AppModule.AGENDA),
          },
          {
            icon: "group",
            label: "Mis Grupos",
            action: () => setCurrentModule(AppModule.DASHBOARD),
          },
          {
            icon: "assignment_turned_in",
            label: "Evaluaciones",
            action: () => setCurrentModule(AppModule.REPORTES),
          },
        ];
      case UserRole.PREFECTURA:
        return [
          {
            icon: "fact_check",
            label: "Pase de Lista",
            action: () => setCurrentModule(AppModule.DASHBOARD),
          },
          {
            icon: "warning",
            label: "Reporte Disciplina",
            action: () => setQuickRegisterOpen(true),
          },
          {
            icon: "directions_run",
            label: "Rondines",
            action: () => setCurrentModule(AppModule.DASHBOARD),
          },
        ];
      case UserRole.ENFERMERIA:
        return [
          {
            icon: "medical_services",
            label: "Consulta",
            action: () => setQuickRegisterOpen(true),
          },
          {
            icon: "medication",
            label: "Inventario",
            action: () => setCurrentModule(AppModule.DASHBOARD),
          },
          {
            icon: "history",
            label: "Historial Clínico",
            action: () => setCurrentModule(AppModule.ARCHIVO),
          },
        ];
      case UserRole.ORIENTACION:
        return [
          {
            icon: "psychology",
            label: "Citar Padre",
            action: () => setQuickRegisterOpen(true),
          },
          {
            icon: "edit_note",
            label: "Bitácora",
            action: () => setCurrentModule(AppModule.REPORTES),
          },
          {
            icon: "folder_shared",
            label: "Expedientes",
            action: () => setCurrentModule(AppModule.ARCHIVO),
          },
        ];
      case UserRole.TRABAJO_SOCIAL:
        return [
          {
            icon: "family_restroom",
            label: "Seguimiento",
            action: () => setCurrentModule(AppModule.DASHBOARD),
          },
          {
            icon: "description",
            label: "Justificante",
            action: () => setQuickRegisterOpen(true),
          },
          { icon: "call", label: "Llamada Tutor", action: () => {} },
        ];
      case UserRole.DIRECTIVO:
        return [
          {
            icon: "analytics",
            label: "Indicadores",
            action: () => setCurrentModule(AppModule.REPORTES),
          },
          {
            icon: "download",
            label: "Exportar Reporte",
            action: () => setCurrentModule(AppModule.REPORTES),
          },
          {
            icon: "campaign",
            label: "Emitir Aviso",
            action: () => setCurrentModule(AppModule.DASHBOARD),
          },
          {
            icon: "admin_panel_settings",
            label: "Aprobaciones",
            action: () => setCurrentModule(AppModule.APROBACIONES_PERSONAL),
          },
        ];
      case UserRole.DEVELOPER:
        return [
          {
            icon: "terminal",
            label: "Gestión de Núcleo",
            action: () => setCurrentModule(AppModule.DASHBOARD),
          },
          {
            icon: "policy",
            label: "Auditoría Total",
            action: () => setCurrentModule(AppModule.REPORTES),
          },
          {
            icon: "database",
            label: "Integridad de Datos",
            action: () => setCurrentModule(AppModule.INSCRIPCIONES),
          },
        ];
      default:
        return [];
    }
  };

  const handleVoiceCommand = (text: string) => {
    processInput(text);
  };

  const processInput = (text: string) => {
    const input = text.toLowerCase();
    setChatInput("");

    if (
      input.includes("alumnos") ||
      input.includes("lista") ||
      input.includes("grupos")
    ) {
      setCurrentModule(AppModule.DASHBOARD);
      toast.success("Abriendo sección de alumnos...");
    } else if (
      input.includes("reporte") ||
      input.includes("estadistica") ||
      input.includes("grafica")
    ) {
      setCurrentModule(AppModule.REPORTES);
      toast.success("Generando reporte de sistema...");
    } else if (input.includes("inscripcion") || input.includes("alta")) {
      setCurrentModule(AppModule.INSCRIPCIONES);
      toast.success("Módulo de inscripciones activado.");
    } else if (input.includes("ayuda") || input.includes("manual")) {
      window.open("/docs/SASE_Manual_Integral.html", "_blank");
      toast("Abriendo manual de usuario", { icon: "📖" });
    } else if (input.includes("aprob") || input.includes("validar")) {
      setCurrentModule(AppModule.APROBACIONES_PERSONAL);
      toast.success("Módulo de aprobaciones de personal.");
    } else {
      toast("Comando recibido. Analizando datos...", { icon: "🧠" });
    }
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      {/* Assistant Panel */}
      <div
        ref={panelRef}
        className={`bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-4 w-80 sm:w-96 transition-all duration-300 transform origin-bottom-right ${
          isOpen
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-90 opacity-0 translate-y-10 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-3">
          <div className="relative size-12 shrink-0 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 animate-[spin_3s_linear_infinite] blur-sm opacity-50"></div>
            <div className="absolute inset-0.5 rounded-full bg-black/90 flex items-center justify-center">
              <img
                src="/assets/branding/IA-SASE.png"
                alt="IA SASE"
                className="w-8 h-8 object-contain drop-shadow-lg"
              />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">
              Asistente Virtual SASE
            </h3>
            <p className="text-xs text-blue-200 font-bold uppercase tracking-widest mt-0.5">
              ¿En qué puedo ayudarte hoy?
            </p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="ml-auto text-gray-400 hover:text-white"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Quick Actions Grid */}
        <div className="mb-4">
          <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">
            Acciones Rápidas ({currentUserRole})
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {getRoleActions().map((action, idx) => (
              <button
                key={idx}
                onClick={() => {
                  action.action();
                  setIsOpen(false);
                }}
                className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-colors text-left group"
              >
                <span className="material-symbols-outlined text-blue-400 group-hover:text-blue-300 text-sm bg-blue-500/10 p-1.5 rounded-md">
                  {action.icon}
                </span>
                <span className="text-xs font-bold text-gray-200 group-hover:text-white">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Chat / Voice Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (chatInput.trim()) processInput(chatInput);
          }}
          className="relative"
        >
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Escribe comandos ej: 'Ir a grupos'..."
            className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors placeholder:text-gray-500"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {chatInput.trim() && (
              <button
                type="submit"
                className="text-blue-500 hover:text-blue-400 p-1"
              >
                <span className="material-symbols-outlined text-[20px]">
                  send
                </span>
              </button>
            )}
            <VoiceInput
              onTranscript={handleVoiceCommand}
              className="!bg-transparent !text-blue-400 hover:!text-blue-300"
            />
          </div>
        </form>
      </div>

      {/* Floating Toggle Button - Now with Trigger ID for Banner Integration */}
      <button
        id="btn-asistente-trigger"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative size-16 group outline-none transition-opacity duration-500 ${!isOpen && !isHovered ? "opacity-20" : "opacity-100"}`}
      >
        {/* Glow Effect */}
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 blur-md transition-opacity duration-300 ${
            isHovered || isOpen ? "opacity-80" : "opacity-40"
          }`}
        ></div>

        {/* Ring Animation */}
        <div className="absolute inset-0 rounded-full border border-white/20 animate-[spin_8s_linear_infinite]"></div>

        {/* Main Button Body */}
        <div className="absolute inset-1 rounded-full bg-black/90 backdrop-blur-md border border-white/10 flex items-center justify-center z-10 transition-transform duration-300 group-hover:scale-105 active:scale-95">
          {isOpen ? (
            <span className="material-symbols-outlined text-white text-3xl animate-in fade-in zoom-in duration-200">
              close
            </span>
          ) : (
            <div className="relative size-full flex items-center justify-center">
              {/* Inner Orb Animation */}
              <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 opacity-20 animate-pulse"></div>
              <div className="absolute inset-2 rounded-full bg-black/80 flex items-center justify-center">
                <img
                  src="/assets/branding/IA-SASE.png"
                  alt="IA"
                  className="w-8 h-8 object-contain drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Tooltip - Clearer Feedback */}
        {!isOpen && (
          <div
            className={`absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-black/80 backdrop-blur text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl border border-white/10 whitespace-nowrap transition-all duration-300 ${
              isHovered
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-4 pointer-events-none"
            }`}
          >
            Inteligencia SASE
          </div>
        )}
      </button>
    </div>
  );
};
