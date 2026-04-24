import React from "react";
import { useApp } from "../store";
import { GlassCard } from "./ui/GlassCard";

export const Notificaciones: React.FC = () => {
  const { notifications, markNotificationRead, setCurrentModule } = useApp();

  return (
    <div className="flex-1 p-6 lg:p-10 max-w-5xl mx-auto w-full space-y-6">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--sase-text-muted)] mb-2">
          Centro institucional
        </p>
        <h1 className="text-4xl font-black text-[var(--sase-text-head)] tracking-tight">
          Notificaciones
        </h1>
      </div>

      <GlassCard className="p-4 md:p-6 space-y-3">
        {notifications.length === 0 ? (
          <div className="py-16 text-center text-[var(--sase-text-muted)]">
            <span className="material-icons text-5xl mb-3 block">notifications_off</span>
            <p className="text-[11px] font-black uppercase tracking-[0.24em]">Sin pendientes</p>
          </div>
        ) : (
          notifications.map((notification: any) => (
            <button
              key={notification.id}
              onClick={() => {
                markNotificationRead(notification.id);
                if (notification.actionModule) setCurrentModule(notification.actionModule);
              }}
              className={`w-full text-left p-5 rounded-3xl border transition-all ${
                notification.read
                  ? "bg-white/5 border-white/5 opacity-70"
                  : "bg-[rgba(129,106,184,0.14)] border-[rgba(227,221,236,0.16)] shadow-[0_18px_50px_rgba(129,106,184,0.12)]"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="size-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-[var(--sase-tertiary)] shrink-0">
                  <span className="material-icons">
                    {notification.type === "error" ? "report" : notification.type === "warning" ? "warning" : "info"}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h2 className="text-sm font-black text-white uppercase tracking-wide truncate">
                      {notification.title}
                    </h2>
                    {!notification.read && (
                      <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[9px] font-black uppercase tracking-widest">
                        Nuevo
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{notification.message}</p>
                  <p className="text-[10px] text-slate-500 mt-3 font-bold uppercase tracking-[0.2em]">
                    {notification.time}
                  </p>
                </div>
              </div>
            </button>
          ))
        )}
      </GlassCard>
    </div>
  );
};

export default Notificaciones;
