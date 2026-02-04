import React from "react";
import { useApp } from "../store";
import { AppModule, UserRole } from "../types";
import { useAuth } from "./AuthProvider";

// Role-based avatars for visual integration
const roleImages: Record<UserRole, string> = {
  [UserRole.DIRECTIVO]:
    "https://ui-avatars.com/api/?name=Director&background=fecaca&color=7f1d1d",
  [UserRole.DOCENTE]:
    "https://ui-avatars.com/api/?name=Docente&background=dbeafe&color=1e3a8a",
  [UserRole.DOCENTE_TUTOR]:
    "https://ui-avatars.com/api/?name=Tutor&background=dbeafe&color=1e3a8a",
  [UserRole.PREFECTURA]:
    "https://ui-avatars.com/api/?name=Prefectura&background=ffedd5&color=7c2d12",
  [UserRole.ORIENTACION]:
    "https://ui-avatars.com/api/?name=Orientación&background=d1fae5&color=064e3b",
  [UserRole.TRABAJO_SOCIAL]:
    "https://ui-avatars.com/api/?name=Trabajo+Social&background=f3e8ff&color=581c87",
  [UserRole.ENFERMERIA]:
    "https://ui-avatars.com/api/?name=Enfermería&background=fee2e2&color=991b1b",
  [UserRole.SECRETARIA]:
    "https://ui-avatars.com/api/?name=Secretaría&background=cffafe&color=083344",
  [UserRole.UDEII]:
    "https://ui-avatars.com/api/?name=UDEII&background=e0e7ff&color=312e81",
  [UserRole.PROMOTORA]:
    "https://ui-avatars.com/api/?name=Enlace&background=fce7f3&color=701a75",
  [UserRole.GUEST]:
    "https://ui-avatars.com/api/?name=Invitado&background=f1f5f9&color=0f172a",
  [UserRole.DEVELOPER]:
    "https://ui-avatars.com/api/?name=Admin&background=000&color=fff",
};

interface PendingAction {
  id: string;
  title: string;
  description: string;
  module: AppModule;
  priority: "info" | "warning" | "urgent";
}

export const AssistantBanner: React.FC<{
  onOpenNotifications?: () => void;
}> = ({ onOpenNotifications }) => {
  const {
    assistantMessage,
    currentUserRole,
    students,
    notifications,
    setCurrentModule,
  } = useApp();
  const { user } = useAuth();

  // Generate pending actions based on role and data
  const getPendingActions = (): PendingAction[] => {
    const actions: PendingAction[] = [];

    // Check for pattern alerts (orientation, direction)
    const patternAlerts = students.filter(
      (s) => s.incidents.length >= 3,
    ).length;
    if (patternAlerts > 0) {
      actions.push({
        id: "pattern-alert",
        title: `${patternAlerts} alumno(s) con patrón detectado`,
        description: "Requieren intervención inmediata",
        module: AppModule.REPORTES,
        priority: "urgent",
      });
    }

    // Check unread notifications
    const unread = notifications.filter((n) => !n.read).length;
    if (unread > 0) {
      actions.push({
        id: "unread-notif",
        title: `${unread} notificación(es) sin leer`,
        description: "Revisa tus avisos pendientes",
        module: AppModule.DASHBOARD,
        priority: "info",
      });
    }

    // Role-specific actions
    if (currentUserRole === UserRole.SECRETARIA) {
      actions.push({
        id: "inscripciones",
        title: "Período de inscripciones activo",
        description: "Revisar documentos pendientes",
        module: AppModule.INSCRIPCIONES,
        priority: "info",
      });
    }

    if (currentUserRole === UserRole.DIRECTIVO) {
      actions.push({
        id: "bitacora",
        title: "Bitácora de auditoría disponible",
        description: "Consulta las acciones del personal",
        module: AppModule.BITACORA,
        priority: "info",
      });
    }

    if (currentUserRole === UserRole.ORIENTACION) {
      actions.push({
        id: "reportes-docentes",
        title: "Solicitar reportes docentes",
        description: "Obtén información académica y conductual",
        module: AppModule.REPORTES_DOCENTES,
        priority: "info",
      });
    }

    return actions;
  };

  const pendingActions = getPendingActions();

  // Determine urgency
  const hasUrgent = pendingActions.some((a) => a.priority === "urgent");

  if (!assistantMessage && pendingActions.length === 0) return null;

  return (
    <div
      className={`mb-12 p-8 rounded-[3rem] border backdrop-blur-xl animate-fade-in transition-all duration-700 relative overflow-hidden group ${
        hasUrgent
          ? "bg-red-500/5 border-red-500/10 ring-8 ring-red-500/5 shadow-2xl shadow-red-900/5"
          : "bg-white/40 border-slate-200/40 shadow-2xl shadow-slate-200/20"
      }`}
    >
      {/* Decorative Background Element - Softer and larger */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none transition-transform group-hover:scale-125 duration-1000"></div>

      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
        {/* User Interaction Hub - Avatar and Status */}
        <div className="flex flex-col items-center gap-4 shrink-0">
          <div className="relative group/avatar">
            <div className="absolute -inset-4 bg-gradient-to-tr from-blue-400/20 to-purple-400/20 rounded-full blur-2xl opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-700"></div>
            <div className="relative size-24 rounded-full overflow-hidden border-4 border-white shadow-2xl shadow-blue-900/10">
              <img
                src={roleImages[currentUserRole]}
                alt="Usuario"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Subtle IA Identity Tag */}
            <div className="absolute -bottom-2 -right-2 size-10 rounded-full bg-white shadow-lg border border-slate-100 flex items-center justify-center animate-bounce">
              <img
                src="/assets/branding/IA-SASE.png"
                alt="IA"
                className="size-6 object-contain opacity-80"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100/50 border border-slate-200/50 mb-6">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">
              Acompañamiento SASE Activo
            </span>
          </div>

          {/* Main Greeting - THE PRIMARY ELEMENT (H1) */}
          {assistantMessage && (
            <h1
              className={`text-3xl md:text-4xl font-black tracking-tight leading-tight mb-4 ${
                hasUrgent ? "text-red-900" : "text-slate-800"
              }`}
            >
              {assistantMessage}
            </h1>
          )}

          {/* Secondary Information & Actions */}
          <div className="flex flex-col md:flex-row md:items-center gap-6 mt-8">
            {pendingActions.length > 0 && (
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                {pendingActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => {
                      if (action.id === "unread-notif" && onOpenNotifications) {
                        onOpenNotifications();
                      } else {
                        setCurrentModule(action.module);
                      }
                    }}
                    className={`flex items-center gap-3 px-6 py-2.5 rounded-2xl text-[11px] font-black transition-all border shadow-sm uppercase tracking-widest hover:translate-y-[-2px] active:translate-y-[0px] ${
                      action.priority === "urgent"
                        ? "bg-red-600 border-red-500 text-white hover:bg-red-700 shadow-red-200"
                        : action.priority === "warning"
                          ? "bg-amber-500 border-amber-400 text-white hover:bg-amber-600 shadow-amber-200"
                          : "bg-white border-slate-200 text-slate-500 hover:border-blue-400 hover:text-blue-600"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {action.priority === "urgent" ? "priority_high" : "bolt"}
                    </span>
                    {action.title}
                  </button>
                ))}

                {/* New: Humanized AI Assistant Trigger - Explains usage */}
                <button
                  id="btn-asistente-banner"
                  onClick={() => {
                    const btn = document.getElementById(
                      "btn-asistente-trigger",
                    );
                    if (btn) btn.click();
                  }}
                  className="flex items-center gap-3 px-6 py-2.5 rounded-2xl text-[11px] font-black transition-all border shadow-lg border-blue-600 bg-blue-700 text-white hover:bg-blue-800 hover:shadow-blue-500/20 uppercase tracking-widest hover:translate-y-[-2px] animate-fade-in"
                >
                  <span className="material-symbols-outlined text-[18px] animate-pulse">
                    psychology
                  </span>
                  Consultar al Asistente
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
