import React from "react";
import { useApp } from "../store";
import { AppModule, UserRole } from "../types";
import { useAuth } from "./AuthProvider";
import { getFechaHoy, INSTITUCION } from "../config/sase.config";

// Role-based avatars for visual integration
const roleImages: Record<UserRole, string> = {
  [UserRole.DIRECTIVO]:
    "https://ui-avatars.com/api/?name=Director&background=fecaca&color=7f1d1d",
  [UserRole.SUBDIRECCION]:
    "https://ui-avatars.com/api/?name=Subdirector&background=fed7aa&color=9a3412",
  [UserRole.DOCENTE]:
    "https://ui-avatars.com/api/?name=Docente&background=dbeafe&color=1e3a8a",
  [UserRole.DOCENTE_TUTOR]:
    "https://ui-avatars.com/api/?name=Tutor&background=dbeafe&color=1e3a8a",
  [UserRole.PREFECTURA]:
    "https://ui-avatars.com/api/?name=Prefectura&background=ffedd5&color=7c2d12",
  [UserRole.ORIENTACION]:
    "https://ui-avatars.com/api/?name=Orientacion&background=d1fae5&color=064e3b",
  [UserRole.TRABAJO_SOCIAL]:
    "https://ui-avatars.com/api/?name=Trabajo+Social&background=f3e8ff&color=581c87",
  [UserRole.MEDICO_ESCOLAR]:
    "https://ui-avatars.com/api/?name=Medico&background=fee2e2&color=991b1b",
  [UserRole.SECRETARIA]:
    "https://ui-avatars.com/api/?name=Secretaria&background=cffafe&color=083344",
  [UserRole.UDEII]:
    "https://ui-avatars.com/api/?name=UDEII&background=e0e7ff&color=312e81",
  [UserRole.PROMOTORA_LECTURA]:
    "https://ui-avatars.com/api/?name=Lectura&background=fce7f3&color=701a75",
  [UserRole.ALUMNO]:
    "https://ui-avatars.com/api/?name=Alumno&background=e0e7ff&color=312e81",
  [UserRole.GUEST]:
    "https://ui-avatars.com/api/?name=Invitado&background=f1f5f9&color=0f172a",
  [UserRole.DEVELOPER]:
    "https://ui-avatars.com/api/?name=Admin&background=000&color=fff",
  [UserRole.SYSTEM_ADMIN]:
    "https://ui-avatars.com/api/?name=SysAdmin&background=1e1b4b&color=a5b4fc",
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

    if (currentUserRole === UserRole.DIRECTIVO || 
        currentUserRole === UserRole.SYSTEM_ADMIN || 
        currentUserRole === UserRole.DEVELOPER) {
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

  const fechaHoy = getFechaHoy();

  return (
    <div
      className={`mb-8 p-6 rounded-3xl border backdrop-blur-2xl animate-fade-in transition-all duration-700 relative overflow-hidden group ${
        hasUrgent
          ? "bg-red-950/40 border-red-500/20 shadow-2xl shadow-red-500/10"
          : "bg-white/[0.03] border-white/[0.06] shadow-2xl shadow-black/80"
      }`}
    >
      {/* Ambient glow top-right */}
      {!hasUrgent && (
        <div className="absolute -top-10 right-10 w-48 h-48 bg-blue-600/10 rounded-full blur-[60px] pointer-events-none" />
      )}
      {!hasUrgent && (
        <div className="absolute bottom-0 left-20 w-64 h-24 bg-indigo-800/10 rounded-full blur-[80px] pointer-events-none" />
      )}
      {/* Decorative Background Element */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none transition-transform group-hover:scale-125 duration-1000"></div>

      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
        <div className="flex flex-col items-center gap-4 shrink-0">
          <div className="relative group/avatar">
            <div className="absolute -inset-4 bg-gradient-to-tr from-blue-400/20 to-purple-400/20 rounded-full blur-2xl opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-700"></div>
            <div className="relative size-20 rounded-full overflow-hidden border-2 border-white/20 shadow-2xl shadow-blue-900/10">
              <img
                src={
                  roleImages[currentUserRole] ||
                  "https://ui-avatars.com/api/?name=SASE"
                }
                alt="Usuario"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Animated SASE Face integration */}
            <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-slate-900 shadow-xl border border-white/20 flex items-center justify-center">
              <div
                className={`size-8 sase-assistant-face ${assistantMessage ? "thinking" : ""}`}
              ></div>
            </div>
          </div>
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
              <span className="size-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-cyan-400/70">
                SASE Activo
              </span>
            </div>
          </div>

          {assistantMessage && (
            <h1
              className={`text-lg md:text-xl font-bold tracking-tight leading-tight mb-2 ${
                hasUrgent ? "text-red-400" : "text-white"
              }`}
            >
              {assistantMessage}
            </h1>
          )}

          <div className="flex flex-col md:flex-row md:items-center gap-4 mt-5">
            {/* Botón Dashboard siempre visible */}
            <button
              onClick={() => setCurrentModule(AppModule.DASHBOARD)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black transition-all border bg-blue-600/20 border-blue-500/40 text-blue-400 hover:bg-blue-600/30 hover:border-blue-400 uppercase tracking-widest hover:translate-y-[-1px] active:translate-y-[0px] shadow-xl shadow-black/5 shadow-blue-500/10"
            >
              <span className="material-icons text-[16px]">
                dashboard
              </span>
              IR AL TABLERO
            </button>

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
                    className={`flex items-center gap-3 px-4 py-2 rounded-xl text-[11px] font-black transition-all border shadow-sm uppercase tracking-widest hover:translate-y-[-2px] active:translate-y-[0px] ${
                      action.priority === "urgent"
                        ? "bg-red-600 border-red-500 text-white hover:bg-red-700"
                        : action.priority === "warning"
                          ? "bg-amber-500 border-amber-400 text-white hover:bg-amber-600"
                          : "bg-white/[0.04] border-white/10 text-slate-300 hover:border-blue-400/40 hover:text-blue-400"
                    }`}
                  >
                    <span className="material-icons text-[16px]">
                      {action.priority === "urgent" ? "priority_high" : "bolt"}
                    </span>
                    {action.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
