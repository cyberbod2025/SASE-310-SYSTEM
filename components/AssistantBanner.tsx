import React from "react";
import { useApp } from "../store";
import { AppModule, UserRole } from "../types";

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
      className={`mb-8 p-6 rounded-2xl border backdrop-blur-md shadow-xl animate-fade-in transition-all duration-500 overflow-hidden relative group ${
        hasUrgent
          ? "bg-red-500/10 border-red-500/30 ring-4 ring-red-500/5 shadow-red-900/10"
          : "bg-white border-slate-200 shadow-slate-200/50"
      }`}
    >
      {/* Decorative Background Element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110"></div>

      <div className="flex items-start gap-5 relative z-10">
        {/* SASE Agent Avatar with Animated Reflections */}
        <div className="relative size-16 shrink-0 flex items-center justify-center">
          {/* Agent Avatar Image with Overlay Effects */}
          <div className="relative size-full rounded-full overflow-hidden bg-gradient-to-br from-amber-900/30 to-blue-900/30 animate-[float_3s_ease-in-out_infinite]">
            {/* Base Image */}
            <img
              src="/assets/branding/IA-SASE.png"
              alt="SASE Agent"
              className="w-full h-full object-cover"
            />

            {/* Animated Golden Reflections Moving Over the Logo */}
            <div className="absolute inset-0 overflow-hidden">
              {/* Diagonal sweep reflection 1 */}
              <div
                className="absolute inset-0 bg-gradient-to-br from-transparent via-amber-300/40 to-transparent"
                style={{
                  animation: "sweep-diagonal 4s ease-in-out infinite",
                  transform:
                    "translateX(-100%) translateY(-100%) rotate(45deg)",
                  width: "200%",
                  height: "200%",
                }}
              ></div>

              {/* Diagonal sweep reflection 2 (opposite direction) */}
              <div
                className="absolute inset-0 bg-gradient-to-tl from-transparent via-amber-400/30 to-transparent"
                style={{
                  animation:
                    "sweep-diagonal-reverse 5s ease-in-out infinite 1s",
                  transform: "translateX(100%) translateY(100%) rotate(-45deg)",
                  width: "200%",
                  height: "200%",
                }}
              ></div>

              {/* Circular pulse glow overlay */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at center, rgba(251, 191, 36, 0.2) 0%, transparent 70%)",
                  animation: "pulse-glow-overlay 3s ease-in-out infinite",
                }}
              ></div>

              {/* Rotating shimmer spots */}
              <div
                className="absolute top-1/4 left-1/4 w-2 h-2 bg-amber-200/60 rounded-full blur-sm"
                style={{
                  animation: "orbit-shimmer 6s linear infinite",
                  transformOrigin: "100% 100%",
                }}
              ></div>
              <div
                className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-amber-300/50 rounded-full blur-sm"
                style={{
                  animation: "orbit-shimmer 6s linear infinite 3s",
                  transformOrigin: "-100% -100%",
                }}
              ></div>
            </div>

            {/* Subtle border glow */}
            <div className="absolute inset-0 rounded-full ring-1 ring-amber-400/30 animate-pulse"></div>
          </div>
        </div>

        {/* Custom animations */}
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-6px); }
          }
          
          @keyframes sweep-diagonal {
            0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
            50% { transform: translateX(100%) translateY(100%) rotate(45deg); }
            100% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          }
          
          @keyframes sweep-diagonal-reverse {
            0% { transform: translateX(100%) translateY(100%) rotate(-45deg); }
            50% { transform: translateX(-100%) translateY(-100%) rotate(-45deg); }
            100% { transform: translateX(100%) translateY(100%) rotate(-45deg); }
          }
          
          @keyframes pulse-glow-overlay {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(1.1); }
          }
          
          @keyframes orbit-shimmer {
            0% { transform: rotate(0deg) translateX(20px) rotate(0deg); opacity: 0.4; }
            50% { opacity: 0.8; }
            100% { transform: rotate(360deg) translateX(20px) rotate(-360deg); opacity: 0.4; }
          }
        `}</style>

        <div className="flex-1 min-w-0">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 text-blue-600/80 flex justify-between items-center">
            <span>Asistente IA SASE • Inteligencia Operativa</span>
          </h4>

          {/* Main message */}
          {assistantMessage && (
            <p
              className={`text-sm font-bold leading-relaxed mb-4 ${
                hasUrgent ? "text-red-900" : "text-slate-700"
              }`}
            >
              {assistantMessage}
            </p>
          )}

          {/* Pending actions */}
          {pendingActions.length > 0 && (
            <div className="space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Sugerencias para tu rol:
              </p>
              <div className="flex flex-wrap gap-2">
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
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all border hover:scale-[1.02] active:scale-[0.98] shadow-sm uppercase tracking-tight ${
                      action.priority === "urgent"
                        ? "bg-red-600 border-red-500 text-white hover:bg-red-700 shadow-red-200"
                        : action.priority === "warning"
                          ? "bg-amber-500 border-amber-400 text-white hover:bg-amber-600 shadow-amber-200"
                          : "bg-white border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-700 shadow-slate-100"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {action.priority === "urgent"
                        ? "priority_high"
                        : action.priority === "warning"
                          ? "schedule"
                          : "bolt"}
                    </span>
                    {action.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
