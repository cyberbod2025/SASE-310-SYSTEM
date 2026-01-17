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
  const [isVisible, setIsVisible] = React.useState(true);
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
      (s) => s.incidents.length >= 3
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
  const hasWarning = pendingActions.some((a) => a.priority === "warning");

  // Auto-hide logic
  React.useEffect(() => {
    // Don't auto-hide if there are urgent actions
    if (hasUrgent) return;

    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 8000); // 8 seconds

    return () => clearTimeout(timer);
  }, [hasUrgent, assistantMessage, pendingActions.length]);

  if (!isVisible) return null;
  if (!assistantMessage && pendingActions.length === 0) return null;

  return (
    <div
      className={`mx-6 mt-6 mb-0 p-5 rounded-2xl border backdrop-blur-md shadow-lg animate-fade-in transition-all duration-300 ${
        hasUrgent
          ? "bg-red-900/40 border-red-500/30 shadow-red-900/20"
          : "bg-black/30 border-white/10 shadow-blue-900/20"
      }`}
    >
      <div className="flex items-start gap-4">
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
          <h4 className="text-xs font-bold uppercase tracking-widest mb-1 text-blue-300/80 flex justify-between items-center">
            <span>Asistente IA SASE</span>
            <button
              onClick={() => setIsVisible(false)}
              className="text-white/40 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </h4>

          {/* Main message */}
          {assistantMessage && (
            <p
              className={`text-sm font-medium mb-3 leading-relaxed ${
                hasUrgent ? "text-red-200" : "text-gray-100"
              }`}
            >
              {assistantMessage}
            </p>
          )}

          {/* Pending actions */}
          {pendingActions.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Sugerencias de acción:
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
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border hover:scale-105 active:scale-95 ${
                      action.priority === "urgent"
                        ? "bg-red-500/20 border-red-500/50 text-red-200 hover:bg-red-500/30"
                        : action.priority === "warning"
                        ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-200 hover:bg-yellow-500/30"
                        : "bg-white/5 border-white/10 text-blue-200 hover:bg-white/10 hover:border-blue-400/30"
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {action.priority === "urgent"
                        ? "priority_high"
                        : action.priority === "warning"
                        ? "schedule"
                        : "arrow_forward"}
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
