import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { motion } from "framer-motion";
import { useInstitutionalActions } from "../../hooks/useInstitutionalActions";
import { useApp } from "../../store";
import { AppModule, IncidentType, UserRole } from "../../types";
import {
  PERMISOS_POR_ROL,
  type PermisosSASE,
} from "../../utils/permisos";
import {
  loadDirectionPanorama,
  type DirectionPanoramaItem,
} from "../direccion/direccionPersistence";
import { RoleHeader } from "../direccion/RoleHeader";
import { SasitoInsights } from "../direccion/SasitoInsights";
import { PrintPreviewModal } from "../PrintPreviewModal";

type PanoramaFilter = "all" | "attention" | "overdue";
type LoadState = "loading" | "ready" | "error";

const getPermissions = (role: UserRole, profile: any): PermisosSASE => {
  const base =
    PERMISOS_POR_ROL[String(role).toLowerCase()] ||
    PERMISOS_POR_ROL.guest;
  return {
    ...base,
    ...(profile?.alcances || {}),
  };
};

const schoolDateKey = (value: Date = new Date()) =>
  new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "America/Mexico_City",
  }).format(value);

const isOverdue = (date: string | null) =>
  Boolean(date && date < schoolDateKey());

const formatDate = (value: string | null) => {
  if (!value) return "No programada";
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T12:00:00`)
    : new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha no documentada";
  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const humanize = (value: string | null) =>
  value
    ? value.replaceAll("_", " ").replace(/\b\w/g, (letter) =>
        letter.toUpperCase(),
      )
    : "No documentado";

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const sumBy = (
  items: DirectionPanoramaItem[],
  selector: (item: DirectionPanoramaItem) => number,
) => items.reduce((total, item) => total + selector(item), 0);

export const DashboardDireccion = () => {
  const {
    currentUserRole,
    currentUserProfile,
    notifications,
    setCurrentModule,
    setIsAssistantOpen,
    setIsFeedbackOpen,
    openQuickRegister,
  } = useApp();
  const { sosAlert } = useInstitutionalActions();
  const [panorama, setPanorama] = useState<DirectionPanoramaItem[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<PanoramaFilter>("all");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null,
  );
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState("");

  const permissions = useMemo(
    () =>
      getPermissions(
        currentUserRole as UserRole,
        currentUserProfile,
      ),
    [currentUserProfile, currentUserRole],
  );

  const refreshPanorama = useCallback(async () => {
    setLoadState("loading");
    setLoadError("");
    setPanorama([]);
    setSelectedStudentId(null);
    try {
      const confirmedPanorama = await loadDirectionPanorama();
      setPanorama(confirmedPanorama);
      setLoadState("ready");
    } catch (error: any) {
      console.error("No se pudo cargar el panorama de Dirección:", error);
      setPanorama([]);
      setLoadError(
        error?.message ||
          "No se pudo confirmar el panorama institucional.",
      );
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    void refreshPanorama();
  }, [refreshPanorama]);

  const visibleItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return panorama.filter((item) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          item.studentName,
          item.enrollment,
          item.group,
          item.semaphoreState,
          item.orientationState,
          ...item.activeSources,
          ...item.attentionReasons,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);
      const matchesFilter =
        filter === "all" ||
        (filter === "attention" && item.requiresAttention) ||
        (filter === "overdue" && isOverdue(item.nextActionDate));
      return matchesSearch && matchesFilter;
    });
  }, [filter, panorama, search]);

  const selectedItem = useMemo(
    () =>
      panorama.find((item) => item.studentId === selectedStudentId) ||
      null,
    [panorama, selectedStudentId],
  );

  const overdueCount = useMemo(
    () =>
      panorama.filter((item) => isOverdue(item.nextActionDate)).length,
    [panorama],
  );
  const attentionCount = useMemo(
    () => panorama.filter((item) => item.requiresAttention).length,
    [panorama],
  );
  const totalPending = useMemo(
    () => sumBy(panorama, (item) => item.totalPendingItems),
    [panorama],
  );

  const areaLoad = useMemo(
    () =>
      [
        {
          area: "Incidencias",
          value: sumBy(panorama, (item) => item.openIncidents),
          module: AppModule.EXPEDIENTES,
        },
        {
          area: "Orientación",
          value: panorama.filter((item) => item.orientationCaseId).length,
          module: AppModule.EXPEDIENTES,
        },
        {
          area: "Trabajo Social",
          value: sumBy(panorama, (item) => item.openSocialWorkItems),
          module: AppModule.TRABAJO_SOCIAL_TRACKER,
        },
        {
          area: "UDEII",
          value: sumBy(panorama, (item) => item.pendingBapItems),
          module: AppModule.UDEII_TRACKER,
        },
        {
          area: "Salud",
          value: sumBy(
            panorama,
            (item) => item.pendingHealthFollowUps,
          ),
          module: AppModule.SALUD,
        },
      ].sort((a, b) => b.value - a.value),
    [panorama],
  );

  const groupLoad = useMemo(() => {
    const totals = panorama.reduce<Record<string, number>>((acc, item) => {
      acc[item.group] =
        (acc[item.group] || 0) + item.totalPendingItems;
      return acc;
    }, {});
    return Object.entries(totals)
      .map(([group, value]) => ({ group, value }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [panorama]);

  const insights = useMemo(() => {
    const busiestArea = areaLoad.find((item) => item.value > 0);
    const busiestGroup = groupLoad[0];
    return [
      `${attentionCount} alumnos requieren revisión con reglas institucionales explícitas.`,
      overdueCount > 0
        ? `${overdueCount} alumnos tienen una próxima acción con fecha vencida.`
        : "No hay próximas acciones vencidas en las fechas documentadas.",
      busiestArea
        ? `${busiestArea.area} concentra ${busiestArea.value} pendientes abiertos.`
        : "Las áreas no reportan pendientes abiertos en este corte.",
      busiestGroup
        ? `El grupo ${busiestGroup.group} concentra ${busiestGroup.value} pendientes; conviene revisar distribución y apoyos.`
        : "No hay concentración de pendientes por grupo.",
    ];
  }, [areaLoad, attentionCount, groupLoad, overdueCount]);

  const unreadNotifications = (notifications || []).filter(
    (notification: any) => !notification.read,
  ).length;

  const handleCreateReport = () => {
    const rows = visibleItems
      .map(
        (item) => `
          <tr>
            <td>${escapeHtml(item.studentName)}</td>
            <td>${escapeHtml(item.group)}</td>
            <td>${item.riskScore}</td>
            <td>${item.totalPendingItems}</td>
            <td>${escapeHtml(item.activeSources.join(", ") || "Sin pendientes")}</td>
            <td>${escapeHtml(formatDate(item.nextActionDate))}</td>
          </tr>
        `,
      )
      .join("");
    setPreviewContent(`
      <div style="font-family: Arial, sans-serif; color: #0f172a;">
        <h1 style="color:#1e3a8a;">Panorama institucional de Dirección</h1>
        <p>Fuente: RPC institucional confirmado. No incluye contenido clínico ni notas sensibles.</p>
        <ul>
          <li>Alumnos visibles: <strong>${panorama.length}</strong></li>
          <li>Revisión prioritaria: <strong>${attentionCount}</strong></li>
          <li>Próximas acciones vencidas: <strong>${overdueCount}</strong></li>
          <li>Pendientes abiertos: <strong>${totalPending}</strong></li>
        </ul>
        <table style="width:100%; border-collapse: collapse; margin-top: 20px; font-size: 11px;">
          <thead>
            <tr style="background:#eff6ff;">
              <th>Alumno</th>
              <th>Grupo</th>
              <th>Riesgo</th>
              <th>Pendientes</th>
              <th>Fuentes</th>
              <th>Próxima acción</th>
            </tr>
          </thead>
          <tbody>
            ${
              rows ||
              "<tr><td colspan='6'>Sin registros para el filtro actual.</td></tr>"
            }
          </tbody>
        </table>
      </div>
    `);
    setShowPrintPreview(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto flex h-full w-full max-w-7xl flex-1 flex-col overflow-y-auto px-4 pb-8 pt-3 md:px-6 lg:px-8"
    >
      <RoleHeader
        searchValue={search}
        notificationsCount={unreadNotifications}
        onSearchChange={setSearch}
        onOpenSasito={() => setIsAssistantOpen(true)}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
        onSOS={async () => {
          await sosAlert(
            undefined,
            undefined,
            "SOS activado desde Dashboard Dirección",
          );
        }}
      />
      <p className="sr-only">Visión sistémica institucional verificable</p>

      {loadState === "loading" && (
        <section
          role="status"
          className="rounded-[2rem] border border-blue-200/20 bg-blue-500/10 p-8 text-center text-blue-50"
        >
          Consultando memoria institucional confirmada…
        </section>
      )}

      {loadState === "error" && (
        <section
          role="alert"
          className="rounded-[2rem] border border-rose-300/30 bg-rose-500/10 p-6 text-rose-50"
        >
          <h2 className="text-lg font-black">
            Panorama no disponible
          </h2>
          <p className="mt-2 text-sm">{loadError}</p>
          <p className="mt-2 text-xs text-rose-100/70">
            No se conservaron datos anteriores ni se generaron indicadores
            sustitutos.
          </p>
          <button
            type="button"
            onClick={() => void refreshPanorama()}
            className="mt-4 min-h-11 rounded-2xl bg-white px-4 text-xs font-black uppercase tracking-widest text-rose-950"
          >
            Reintentar
          </button>
        </section>
      )}

      {loadState === "ready" && selectedItem && (
        <DirectionStudentDetail
          item={selectedItem}
          onBack={() => setSelectedStudentId(null)}
          onOpenModule={setCurrentModule}
        />
      )}

      {loadState === "ready" && !selectedItem && (
        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <KpiCard
                label="Alumnos visibles"
                value={panorama.length}
                icon="groups"
              />
              <KpiCard
                label="Revisión prioritaria"
                value={attentionCount}
                icon="priority_high"
                tone="danger"
              />
              <KpiCard
                label="Fechas vencidas"
                value={overdueCount}
                icon="event_busy"
                tone="warning"
              />
              <KpiCard
                label="Pendientes abiertos"
                value={totalPending}
                icon="fact_check"
                tone="success"
              />
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 md:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-200">
                    Decisión informada
                  </p>
                  <h2 className="mt-1 text-xl font-black text-white">
                    Seguimientos institucionales
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <FilterButton
                    active={filter === "all"}
                    label="Todos"
                    onClick={() => setFilter("all")}
                  />
                  <FilterButton
                    active={filter === "attention"}
                    label="Prioritarios"
                    onClick={() => setFilter("attention")}
                  />
                  <FilterButton
                    active={filter === "overdue"}
                    label="Vencidos"
                    onClick={() => setFilter("overdue")}
                  />
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {visibleItems.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center text-sm text-slate-300">
                    No hay alumnos que coincidan con el filtro actual.
                  </div>
                ) : (
                  visibleItems.map((item) => (
                    <PanoramaRow
                      key={item.studentId}
                      item={item}
                      onView={() =>
                        setSelectedStudentId(item.studentId)
                      }
                    />
                  ))
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-4">
            <SasitoInsights insights={insights} />

            <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 md:p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-100">
                Carga abierta por área
              </p>
              <div className="mt-4 space-y-2">
                {areaLoad.map((item) => (
                  <button
                    type="button"
                    key={item.area}
                    onClick={() => setCurrentModule(item.module)}
                    className="flex min-h-12 w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.05] px-4 text-left text-sm text-white hover:bg-white/10"
                  >
                    <span className="font-bold">{item.area}</span>
                    <span className="font-black">{item.value}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 md:p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-200">
                Concentración por grupo
              </p>
              <div className="mt-4 space-y-2">
                {groupLoad.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    Sin pendientes agrupables.
                  </p>
                ) : (
                  groupLoad.map((item) => (
                    <div
                      key={item.group}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white"
                    >
                      <span>Grupo {item.group}</span>
                      <span className="font-black">
                        {item.value} pendientes
                      </span>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 md:p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-100">
                Acciones con fuente real
              </p>
              <div className="mt-4 grid gap-2">
                {permissions.can_register && (
                  <ActionButton
                    label="Registrar incidencia"
                    icon="add_alert"
                    onClick={() =>
                      openQuickRegister(IncidentType.CONDUCTA)
                    }
                  />
                )}
                <ActionButton
                  label="Consultar expediente institucional"
                  icon="folder_open"
                  onClick={() =>
                    setCurrentModule(AppModule.EXPEDIENTES)
                  }
                />
                <ActionButton
                  label="Generar reporte del corte"
                  icon="print"
                  onClick={handleCreateReport}
                />
                <ActionButton
                  label="Supervisar fechas vencidas"
                  icon="event_busy"
                  onClick={() => setFilter("overdue")}
                />
              </div>
            </section>
          </aside>
        </div>
      )}

      <PrintPreviewModal
        isOpen={showPrintPreview}
        onClose={() => setShowPrintPreview(false)}
        title="PANORAMA INSTITUCIONAL DE DIRECCIÓN"
        initialHtml={previewContent}
      />
    </motion.div>
  );
};

const PanoramaRow = ({
  item,
  onView,
}: {
  item: DirectionPanoramaItem;
  onView: () => void;
}) => (
  <article className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-black text-white">
            {item.studentName} — {item.group}
          </h3>
          {item.requiresAttention && (
            <span className="rounded-full border border-rose-300/30 bg-rose-500/15 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-rose-100">
              Revisión prioritaria
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-slate-300">
          Riesgo persistido: {item.riskScore} · Pendientes:{" "}
          {item.totalPendingItems}
        </p>
        <p className="mt-2 text-xs text-blue-100/70">
          Fuentes: {item.activeSources.join(", ") || "Sin pendientes abiertos"}
        </p>
        <p
          className={`mt-1 text-xs ${
            isOverdue(item.nextActionDate)
              ? "text-rose-200"
              : "text-slate-400"
          }`}
        >
          Próxima acción: {formatDate(item.nextActionDate)}
        </p>
      </div>
      <button
        type="button"
        onClick={onView}
        className="min-h-11 rounded-2xl bg-white px-4 text-xs font-black uppercase tracking-widest text-slate-950"
      >
        Ver fuentes
      </button>
    </div>
    {item.attentionReasons.length > 0 && (
      <ul className="mt-3 space-y-1 border-t border-white/10 pt-3 text-xs text-rose-100">
        {item.attentionReasons.map((reason) => (
          <li key={reason}>• {reason}</li>
        ))}
      </ul>
    )}
  </article>
);

const DirectionStudentDetail = ({
  item,
  onBack,
  onOpenModule,
}: {
  item: DirectionPanoramaItem;
  onBack: () => void;
  onOpenModule: (module: AppModule) => void;
}) => (
  <section className="space-y-4">
    <button
      type="button"
      onClick={onBack}
      className="min-h-11 rounded-2xl border border-white/10 bg-white/10 px-4 text-xs font-black uppercase tracking-widest text-white"
    >
      Volver al panorama
    </button>

    <div className="rounded-[2rem] border border-blue-200/20 bg-blue-950/50 p-5">
      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-200">
        Fuentes institucionales agregadas
      </p>
      <h2 className="mt-2 text-2xl font-black text-white">
        {item.studentName}
      </h2>
      <p className="mt-1 text-sm text-blue-100/80">
        {item.group} · {item.enrollment} · Riesgo persistido{" "}
        {item.riskScore} · {humanize(item.semaphoreState)}
      </p>
      <p className="mt-3 text-xs text-blue-100/60">
        Este resumen no contiene diagnósticos BAP, notas sociales ni contenido
        clínico.
      </p>
    </div>

    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <SourceCard
        label="Incidencias abiertas"
        value={item.openIncidents}
        date={item.lastIncidentAt}
      />
      <SourceCard
        label="Orientación"
        value={item.orientationCaseId ? 1 : 0}
        date={item.nextOrientationReview}
      />
      <SourceCard
        label="Trabajo Social"
        value={item.openSocialWorkItems}
        date={item.socialWorkUpdatedAt}
      />
      <SourceCard
        label="UDEII"
        value={item.pendingBapItems}
        date={item.nextBapReview}
      />
      <SourceCard
        label="Salud"
        value={item.pendingHealthFollowUps}
        date={item.nextHealthReview}
      />
    </div>

    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
        <h3 className="font-black text-white">Orientación</h3>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <DataPoint
            label="Estado"
            value={humanize(item.orientationState)}
          />
          <DataPoint
            label="Prioridad"
            value={humanize(item.orientationPriority)}
          />
          <DataPoint
            label="Seguimientos"
            value={String(item.orientationFollowUps)}
          />
          <DataPoint
            label="Diagnósticos docentes"
            value={String(item.teacherDiagnoses)}
          />
          <DataPoint
            label="Planes activos"
            value={String(item.activeOrientationPlans)}
          />
          <DataPoint
            label="Próxima revisión"
            value={formatDate(item.nextOrientationReview)}
          />
        </dl>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
        <h3 className="font-black text-white">
          Razones para revisión
        </h3>
        {item.attentionReasons.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">
            No se activó ninguna regla prioritaria.
          </p>
        ) : (
          <ul className="mt-4 space-y-2 text-sm text-rose-100">
            {item.attentionReasons.map((reason) => (
              <li
                key={reason}
                className="rounded-xl border border-rose-300/20 bg-rose-500/10 p-3"
              >
                {reason}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>

    <div className="grid gap-2 sm:grid-cols-4">
      <ActionButton
        label="Expediente"
        icon="folder_open"
        onClick={() => onOpenModule(AppModule.EXPEDIENTES)}
      />
      <ActionButton
        label="Trabajo Social"
        icon="diversity_3"
        onClick={() =>
          onOpenModule(AppModule.TRABAJO_SOCIAL_TRACKER)
        }
      />
      <ActionButton
        label="UDEII"
        icon="accessibility_new"
        onClick={() => onOpenModule(AppModule.UDEII_TRACKER)}
      />
      <ActionButton
        label="Salud"
        icon="medical_services"
        onClick={() => onOpenModule(AppModule.SALUD)}
      />
    </div>
  </section>
);

const SourceCard = ({
  label,
  value,
  date,
}: {
  label: string;
  value: number;
  date: string | null;
}) => (
  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
      {label}
    </p>
    <p className="mt-2 text-2xl font-black text-white">{value}</p>
    <p className="mt-1 text-[10px] text-slate-500">
      Fecha: {formatDate(date)}
    </p>
  </div>
);

const DataPoint = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div>
    <dt className="text-[10px] font-black uppercase tracking-widest text-slate-500">
      {label}
    </dt>
    <dd className="mt-1 text-white">{value}</dd>
  </div>
);

const FilterButton = ({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    aria-pressed={active}
    onClick={onClick}
    className={`min-h-10 rounded-xl px-3 text-[10px] font-black uppercase tracking-widest ${
      active
        ? "bg-white text-slate-950"
        : "border border-white/10 bg-white/[0.05] text-white"
    }`}
  >
    {label}
  </button>
);

const KpiCard = ({
  label,
  value,
  icon,
  tone = "info",
}: {
  label: string;
  value: number;
  icon: string;
  tone?: "info" | "danger" | "warning" | "success";
}) => {
  const toneClass = {
    info: "border-blue-300/20 bg-blue-500/10 text-blue-100",
    danger: "border-rose-300/20 bg-rose-500/10 text-rose-100",
    warning: "border-amber-300/20 bg-amber-500/10 text-amber-100",
    success:
      "border-emerald-300/20 bg-emerald-500/10 text-emerald-100",
  }[tone];

  return (
    <div className={`rounded-[1.75rem] border p-4 ${toneClass}`}>
      <span className="material-icons text-xl">{icon}</span>
      <p className="mt-3 text-2xl font-black text-white">{value}</p>
      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] opacity-75">
        {label}
      </p>
    </div>
  );
};

const ActionButton = ({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    aria-label={label}
    onClick={onClick}
    className="flex min-h-[48px] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-left text-xs font-black uppercase tracking-widest text-white hover:bg-white/10"
  >
    <span className="material-icons text-base text-amber-100">
      {icon}
    </span>
    {label}
  </button>
);

export default DashboardDireccion;
