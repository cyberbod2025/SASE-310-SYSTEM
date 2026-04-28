import React from "react";
import { useApp } from "../../store";
import type {
  SecurityDashboardFinding,
  SecurityDashboardSnapshot,
  SecurityDashboardStatus,
} from "../../types";

const STATUS_COPY: Record<SecurityDashboardStatus, { label: string; icon: string; className: string }> = {
  ok: {
    label: "Blindaje estable",
    icon: "verified_user",
    className: "bg-emerald-500/15 text-emerald-200 border-emerald-300/20",
  },
  warning: {
    label: "Revisión requerida",
    icon: "shield_lock",
    className: "bg-amber-500/15 text-amber-100 border-amber-300/20",
  },
  critical: {
    label: "Atención crítica",
    icon: "gpp_maybe",
    className: "bg-red-500/15 text-red-100 border-red-300/20",
  },
  unauthorized: {
    label: "Acceso restringido",
    icon: "lock",
    className: "bg-slate-500/15 text-slate-200 border-slate-300/20",
  },
};

const SEVERITY_CLASS: Record<string, string> = {
  critical: "bg-red-500/15 text-red-100 border-red-300/20",
  high: "bg-red-500/15 text-red-100 border-red-300/20",
  warning: "bg-amber-500/15 text-amber-100 border-amber-300/20",
  medium: "bg-amber-500/15 text-amber-100 border-amber-300/20",
  info: "bg-blue-500/15 text-blue-100 border-blue-300/20",
  low: "bg-blue-500/15 text-blue-100 border-blue-300/20",
};

const formatDate = (value?: string) => {
  if (!value) return "Sin sincronizar";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin sincronizar";
  return date.toLocaleString("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const getRows = (
  snapshot: SecurityDashboardSnapshot | null,
  key: keyof SecurityDashboardSnapshot["sections"],
): SecurityDashboardFinding[] => snapshot?.sections?.[key] ?? [];

const MetricCard = ({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: string;
  tone: string;
}) => (
  <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-[0_24px_70px_rgba(2,6,23,0.2)] backdrop-blur-2xl">
    <div className="flex items-center justify-between gap-4">
      <span className={`material-icons text-3xl ${tone}`}>{icon}</span>
      <span className={`text-3xl font-black ${tone}`}>{value}</span>
    </div>
    <p className="mt-4 text-[10px] font-black uppercase tracking-[0.24em] text-slate-300">
      {label}
    </p>
  </div>
);

const FindingList = ({
  title,
  subtitle,
  rows,
  emptyText = "Sin hallazgos en esta sección.",
}: {
  title: string;
  subtitle: string;
  rows: SecurityDashboardFinding[];
  emptyText?: string;
}) => (
  <section className="rounded-[2rem] border border-white/10 bg-slate-950/45 p-5 shadow-[0_24px_80px_rgba(2,6,23,0.22)] backdrop-blur-2xl">
    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="text-sm font-black uppercase tracking-[0.22em] text-white">
          {title}
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-slate-400">{subtitle}</p>
      </div>
      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
        {rows.length} items
      </span>
    </div>

    <div className="mt-5 space-y-3">
      {rows.length === 0 ? (
        <div className="rounded-2xl border border-emerald-300/15 bg-emerald-500/10 p-4 text-sm text-emerald-100">
          {emptyText}
        </div>
      ) : (
        rows.map((row, index) => {
          const severity = row.severidad ?? "info";
          const severityClass = SEVERITY_CLASS[severity] ?? SEVERITY_CLASS.info;
          return (
            <article
              key={`${row.area}-${row.objeto}-${index}`}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.2em] ${severityClass}`}>
                      {severity}
                    </span>
                    {row.area && (
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200">
                        {row.area}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-3 break-words text-sm font-black text-white">
                    {row.objeto ?? "Objeto sin nombre"}
                  </h3>
                  {row.detalle && (
                    <p className="mt-1 break-words font-mono text-[11px] text-slate-400">
                      {row.detalle}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl bg-black/20 p-3">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
                    Riesgo
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-200">
                    {row.riesgo ?? "Revisión requerida."}
                  </p>
                </div>
                <div className="rounded-xl bg-black/20 p-3">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
                    Acción
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-200">
                    {row.accion ?? "Validar con el runbook de seguridad."}
                  </p>
                </div>
              </div>
            </article>
          );
        })
      )}
    </div>
  </section>
);

export const SecurityDashboard = () => {
  const {
    securityDashboard,
    securityDashboardLoading,
    securityDashboardError,
    canViewSecurityDashboard,
    fetchSecurityDashboard,
  } = useApp();

  if (!canViewSecurityDashboard) {
    return (
      <div className="min-h-full rounded-[2rem] border border-white/10 bg-slate-950/60 p-8 text-white">
        <span className="material-icons text-5xl text-slate-400">lock</span>
        <h1 className="mt-4 text-2xl font-black uppercase tracking-[0.2em]">
          Acceso restringido
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300">
          Este tablero solo está disponible para Dirección, Soporte Nivel 3 y Desarrollo.
        </p>
      </div>
    );
  }

  const status = securityDashboard?.overallStatus ?? "warning";
  const statusCopy = STATUS_COPY[status];
  const criticalRows = [
    ...getRows(securityDashboard, "sensitiveTablesWithoutRls"),
    ...getRows(securityDashboard, "openPolicies"),
    ...getRows(securityDashboard, "storageBroadPolicies"),
    ...getRows(securityDashboard, "publicDefinerAnon"),
  ];
  const backlogRows = [
    ...getRows(securityDashboard, "publicDefinerAuthenticated"),
    ...getRows(securityDashboard, "publicTablesWithoutRls"),
    ...getRows(securityDashboard, "legacySurfaces"),
  ];
  const storageRows = [
    ...getRows(securityDashboard, "storageBuckets"),
    ...getRows(securityDashboard, "manualChecks"),
  ];

  return (
    <div className="min-h-full pb-28 text-white">
      <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.28),transparent_35%),linear-gradient(135deg,rgba(15,23,42,0.92),rgba(2,6,23,0.78))] p-6 shadow-[0_30px_100px_rgba(2,6,23,0.28)] md:p-8">
        <div className="absolute right-[-6rem] top-[-6rem] h-64 w-64 rounded-full bg-blue-500/20 blur-[90px]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] ${statusCopy.className}`}>
                <span className="material-icons text-base">{statusCopy.icon}</span>
                {statusCopy.label}
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                Snapshot Supabase / SASE
              </span>
            </div>
            <h1 className="mt-5 text-3xl font-black tracking-tight text-white md:text-5xl">
              Dashboard de Seguridad SASE
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-300">
              Monitorea RLS, Storage, funciones privilegiadas y alertas activas desde un RPC fail-closed restringido por rol institucional.
            </p>
            <p className="mt-4 text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
              Última lectura: {formatDate(securityDashboard?.generatedAt)}
            </p>
          </div>

          <button
            type="button"
            onClick={() => void fetchSecurityDashboard()}
            disabled={securityDashboardLoading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-[10px] font-black uppercase tracking-[0.24em] text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className={`material-icons text-base ${securityDashboardLoading ? "animate-spin" : ""}`}>
              {securityDashboardLoading ? "sync" : "refresh"}
            </span>
            Actualizar
          </button>
        </div>
      </div>

      {securityDashboardError && (
        <div className="mt-6 rounded-2xl border border-red-300/20 bg-red-500/10 p-4 text-sm text-red-100">
          {securityDashboardError}
        </div>
      )}

      {securityDashboard?.authorized === false && (
        <div className="mt-6 rounded-2xl border border-amber-300/20 bg-amber-500/10 p-4 text-sm text-amber-100">
          La base de datos negó el snapshot para este perfil. Verifica `perfiles_usuario` y el estado de seguridad de la cuenta.
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Hallazgos críticos"
          value={securityDashboard?.counts?.criticalFindings ?? 0}
          icon="report"
          tone="text-red-200"
        />
        <MetricCard
          label="Warnings técnicos"
          value={securityDashboard?.counts?.warningFindings ?? 0}
          icon="warning"
          tone="text-amber-200"
        />
        <MetricCard
          label="Alertas activas"
          value={securityDashboard?.counts?.activeAlerts ?? 0}
          icon="notifications_active"
          tone="text-blue-200"
        />
        <MetricCard
          label="Definer autenticados"
          value={securityDashboard?.counts?.publicDefinerAuthenticated ?? 0}
          icon="admin_panel_settings"
          tone="text-violet-200"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <FindingList
          title="Prioridad crítica"
          subtitle="Riesgos que deben permanecer en cero para CI y postura productiva."
          rows={criticalRows}
          emptyText="Sin hallazgos críticos detectados por el snapshot."
        />
        <FindingList
          title="Alertas activas"
          subtitle="Eventos de observabilidad SASE pendientes de resolución institucional."
          rows={getRows(securityDashboard, "activeAlerts")}
          emptyText="No hay alertas SASE activas."
        />
        <FindingList
          title="Backlog controlado"
          subtitle="Warnings que requieren seguimiento, justificación o refactor gradual."
          rows={backlogRows}
        />
        <FindingList
          title="Storage y checks manuales"
          subtitle="Buckets, validaciones fuera de SQL y controles que dependen del Dashboard Supabase."
          rows={storageRows}
        />
      </div>
    </div>
  );
};

export default SecurityDashboard;
