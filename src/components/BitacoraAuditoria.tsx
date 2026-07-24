import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import toast from "react-hot-toast";
import {
  AuditCategory,
  AuditCursor,
  AuditEntry,
  AuditFilters,
  buildAuditCsv,
  loadAuditPage,
  registerAuditEvent,
} from "./auditoria/auditoriaPersistence";

const EMPTY_FILTERS: AuditFilters = {
  category: "",
  role: "",
  table: "",
  search: "",
  from: "",
  to: "",
};

const CATEGORY_LABELS: Record<AuditCategory, string> = {
  CONSULTA: "Consulta",
  CREACION: "Creación",
  ACTUALIZACION: "Actualización",
  ELIMINACION: "Eliminación",
  OTRA: "Otra",
};

const formatAuditDate = (value: string | null) => {
  if (!value) {
    return { date: "Sin fecha", time: "No documentada" };
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return { date: "Fecha inválida", time: value };
  }

  return {
    date: parsed.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    time: parsed.toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};

const mergeWithoutDuplicates = (
  current: AuditEntry[],
  incoming: AuditEntry[],
) => {
  const existingIds = new Set(current.map((entry) => entry.id));
  return [
    ...current,
    ...incoming.filter((entry) => !existingIds.has(entry.id)),
  ];
};

export const BitacoraAuditoria: React.FC = () => {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [filters, setFilters] = useState<AuditFilters>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<AuditFilters>(EMPTY_FILTERS);
  const [nextCursor, setNextCursor] = useState<AuditCursor | null>(null);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAuditLog = useCallback(
    async (cursor: AuditCursor | null = null, append = false) => {
      append ? setLoadingMore(true) : setLoading(true);
      setError(null);

      try {
        const page = await loadAuditPage(appliedFilters, cursor);
        setEntries((current) =>
          append
            ? mergeWithoutDuplicates(current, page.entries)
            : page.entries,
        );
        if (!append) setTotal(page.total);
        setNextCursor(page.nextCursor);
        setHasMore(page.hasMore);
      } catch (caughtError) {
        console.error("No se pudo consultar Caja Negra:", caughtError);
        if (!append) {
          setEntries([]);
          setTotal(0);
          setNextCursor(null);
          setHasMore(false);
        }
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "No se pudo confirmar el registro institucional.",
        );
      } finally {
        append ? setLoadingMore(false) : setLoading(false);
      }
    },
    [appliedFilters],
  );

  useEffect(() => {
    void fetchAuditLog();
  }, [fetchAuditLog]);

  const categoryCounts = useMemo(
    () =>
      entries.reduce<Record<AuditCategory, number>>(
        (counts, entry) => {
          counts[entry.actionCategory] += 1;
          return counts;
        },
        {
          CONSULTA: 0,
          CREACION: 0,
          ACTUALIZACION: 0,
          ELIMINACION: 0,
          OTRA: 0,
        },
      ),
    [entries],
  );

  const visibleStaff = useMemo(
    () =>
      new Set(
        entries
          .map((entry) => entry.userEmail)
          .filter((email): email is string => Boolean(email)),
      ).size,
    [entries],
  );

  const applyFilters = (event: React.FormEvent) => {
    event.preventDefault();
    setAppliedFilters({
      category: filters.category || "",
      role: filters.role?.trim() || "",
      table: filters.table?.trim() || "",
      search: filters.search?.trim() || "",
      from: filters.from || "",
      to: filters.to || "",
    });
  };

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
  };

  const downloadCsv = async () => {
    if (entries.length === 0) {
      toast.error("No hay filas autorizadas para exportar.");
      return;
    }

    setExporting(true);
    try {
      await registerAuditEvent({
        actionType: "EXPORTACION_CAJA_NEGRA",
        description: `Exportó ${entries.length} eventos visibles de Caja Negra.`,
        targetTable: "auditoria",
        targetRecordId: "FILTRO_ACTUAL",
        purpose: "Resguardo autorizado de trazabilidad institucional",
      });

      const csv = buildAuditCsv(entries);
      const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      const date = new Date().toISOString().slice(0, 10);
      anchor.href = url;
      anchor.download = `sase310-caja-negra-${date}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);

      toast.success(`CSV generado con ${entries.length} filas visibles.`);
    } catch (caughtError) {
      console.error("No se pudo exportar Caja Negra:", caughtError);
      toast.error(
        "No se descargó el CSV porque su trazabilidad no fue confirmada.",
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <section className="flex-1 w-full space-y-6 animate-fadeIn">
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="size-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 border border-blue-500/20">
            <span className="material-symbols-outlined text-3xl">policy</span>
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Caja Negra institucional
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Quién hizo qué, cuándo, sobre qué registro y con qué propósito.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => void fetchAuditLog()}
            disabled={loading}
            className="px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-slate-200 hover:bg-white/10 disabled:opacity-50 text-xs font-bold uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-base align-middle mr-2">
              refresh
            </span>
            Sincronizar
          </button>
          <button
            type="button"
            onClick={() => void downloadCsv()}
            disabled={exporting || loading || entries.length === 0}
            aria-label={`Descargar ${entries.length} filas visibles`}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl text-white text-xs font-bold uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-base align-middle mr-2">
              download
            </span>
            {exporting
              ? "Confirmando..."
              : `Descargar ${entries.length} filas visibles`}
          </button>
        </div>
      </header>

      <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 px-5 py-4 text-xs text-blue-100">
        Registro append-only para clientes. Los eventos legados pueden mostrar
        “No documentado”; SASE no completa ni adivina datos faltantes.
      </div>

      <form
        onSubmit={applyFilters}
        className="bg-[#0b121a]/70 border border-white/10 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-3"
      >
        <label className="xl:col-span-2">
          <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
            Buscar
          </span>
          <input
            value={filters.search}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                search: event.target.value,
              }))
            }
            maxLength={120}
            placeholder="Acción, correo, registro o propósito"
            className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-blue-500"
          />
        </label>

        <FilterSelect
          label="Categoría"
          value={filters.category || ""}
          onChange={(value) =>
            setFilters((current) => ({
              ...current,
              category: value as AuditCategory | "",
            }))
          }
          options={[
            ["", "Todas"],
            ["CONSULTA", "Consultas"],
            ["CREACION", "Creaciones"],
            ["ACTUALIZACION", "Actualizaciones"],
            ["ELIMINACION", "Eliminaciones"],
            ["OTRA", "Otras"],
          ]}
        />

        <FilterInput
          label="Rol exacto"
          value={filters.role || ""}
          placeholder="directivo"
          onChange={(value) =>
            setFilters((current) => ({ ...current, role: value }))
          }
        />

        <FilterInput
          label="Tabla exacta"
          value={filters.table || ""}
          placeholder="incidencias"
          onChange={(value) =>
            setFilters((current) => ({ ...current, table: value }))
          }
        />

        <FilterInput
          label="Desde"
          type="date"
          value={filters.from || ""}
          onChange={(value) =>
            setFilters((current) => ({ ...current, from: value }))
          }
        />

        <FilterInput
          label="Hasta"
          type="date"
          value={filters.to || ""}
          onChange={(value) =>
            setFilters((current) => ({ ...current, to: value }))
          }
        />

        <div className="md:col-span-2 xl:col-span-7 flex flex-wrap justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={clearFilters}
            className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
          >
            Limpiar filtros
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-blue-500/15 border border-blue-500/30 rounded-lg text-xs font-bold text-blue-300 hover:bg-blue-500/25"
          >
            Aplicar filtros
          </button>
        </div>
      </form>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard
          label="Resultados confirmados"
          value={total}
          icon="fact_check"
          color="blue"
        />
        <StatCard
          label="Consultas visibles"
          value={categoryCounts.CONSULTA}
          icon="visibility"
          color="indigo"
        />
        <StatCard
          label="Creaciones visibles"
          value={categoryCounts.CREACION}
          icon="add_circle"
          color="emerald"
        />
        <StatCard
          label="Actualizaciones visibles"
          value={categoryCounts.ACTUALIZACION}
          icon="edit_note"
          color="amber"
        />
        <StatCard
          label="Actores identificados"
          value={visibleStaff}
          icon="group"
          color="violet"
        />
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <p className="font-black">Consulta no confirmada</p>
            <p className="text-xs text-red-200/80 mt-1">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => void fetchAuditLog()}
            className="px-4 py-2 rounded-lg border border-red-400/30 text-xs font-bold"
          >
            Reintentar
          </button>
        </div>
      )}

      <div className="bg-[#0b121a]/70 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-widest">
              Eventos autorizados
            </h3>
            <p className="text-[10px] text-slate-500 mt-1">
              {entries.length} filas cargadas de {total} resultados
            </p>
          </div>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">
            Sin payloads sensibles
          </span>
        </div>

        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02] text-[9px] text-slate-500 uppercase tracking-widest">
                <th className="px-5 py-4">Fecha real</th>
                <th className="px-5 py-4">Actor</th>
                <th className="px-5 py-4">Acción</th>
                <th className="px-5 py-4">Objetivo</th>
                <th className="px-5 py-4">Alumno</th>
                <th className="px-5 py-4">Propósito</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <LoadingRow />
              ) : entries.length === 0 ? (
                <EmptyRow />
              ) : (
                entries.map((entry) => (
                  <AuditTableRow key={entry.id} entry={entry} />
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="lg:hidden divide-y divide-white/5">
          {loading ? (
            <div className="p-10 text-center text-xs text-slate-500">
              Consultando eventos autorizados...
            </div>
          ) : entries.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-500">
              No hay eventos confirmados para estos filtros.
            </div>
          ) : (
            entries.map((entry) => (
              <AuditCard key={entry.id} entry={entry} />
            ))
          )}
        </div>

        {hasMore && nextCursor && (
          <div className="p-4 border-t border-white/5 text-center">
            <button
              type="button"
              disabled={loadingMore}
              onClick={() => void fetchAuditLog(nextCursor, true)}
              className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-slate-300 hover:bg-white/10 disabled:opacity-50"
            >
              {loadingMore ? "Cargando..." : "Cargar eventos anteriores"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

const AuditTableRow: React.FC<{ entry: AuditEntry }> = ({ entry }) => {
  const timestamp = formatAuditDate(entry.createdAt);
  return (
    <tr className="hover:bg-white/[0.02] align-top">
      <td className="px-5 py-4 min-w-36">
        <p className="text-xs font-bold text-white">{timestamp.date}</p>
        <p className="text-[10px] text-slate-500 mt-1">{timestamp.time}</p>
        <p className="text-[9px] text-slate-600 mt-2 uppercase">
          {entry.origin}
        </p>
      </td>
      <td className="px-5 py-4 min-w-48">
        <p className="text-xs font-bold text-white">
          {entry.userEmail ?? "SISTEMA"}
        </p>
        <p className="text-[10px] text-blue-400 uppercase mt-1">
          {entry.userRole ?? "ROL NO DOCUMENTADO"}
        </p>
      </td>
      <td className="px-5 py-4 min-w-56">
        <ActionBadge category={entry.actionCategory} />
        <p className="text-[10px] font-bold text-slate-300 mt-2">
          {entry.actionType}
        </p>
        <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
          {entry.actionDescription ?? "Descripción no documentada"}
        </p>
      </td>
      <td className="px-5 py-4 min-w-44">
        <p className="text-xs font-bold text-slate-200">
          {entry.targetTable ?? "Tabla no documentada"}
        </p>
        <p className="text-[10px] text-slate-500 mt-1 break-all">
          {entry.targetRecordId ?? "Registro no documentado"}
        </p>
      </td>
      <td className="px-5 py-4 min-w-44">
        <p className="text-xs font-bold text-slate-200">
          {entry.studentName ?? "No documentado"}
        </p>
        <p className="text-[10px] text-slate-500 mt-1 break-all">
          {entry.studentId ?? "Sin ID de alumno"}
        </p>
      </td>
      <td className="px-5 py-4 min-w-56">
        <p className="text-[11px] text-slate-300 leading-relaxed">
          {entry.purpose ?? "Propósito no documentado"}
        </p>
        <p className="text-[9px] text-slate-600 mt-2 break-all">
          Evento {entry.id}
        </p>
      </td>
    </tr>
  );
};

const AuditCard: React.FC<{ entry: AuditEntry }> = ({ entry }) => {
  const timestamp = formatAuditDate(entry.createdAt);
  return (
    <article className="p-5 space-y-3">
      <div className="flex justify-between gap-4">
        <div>
          <p className="text-xs font-black text-white">
            {entry.userEmail ?? "SISTEMA"}
          </p>
          <p className="text-[9px] text-blue-400 uppercase">
            {entry.userRole ?? "ROL NO DOCUMENTADO"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-white">{timestamp.date}</p>
          <p className="text-[9px] text-slate-500">{timestamp.time}</p>
        </div>
      </div>
      <ActionBadge category={entry.actionCategory} />
      <p className="text-[10px] font-bold text-slate-300">
        {entry.actionType}
      </p>
      <p className="text-xs text-slate-400">
        {entry.actionDescription ?? "Descripción no documentada"}
      </p>
      <dl className="grid grid-cols-2 gap-3 text-[10px]">
        <AuditDefinition
          label="Objetivo"
          value={`${entry.targetTable ?? "No documentado"} · ${
            entry.targetRecordId ?? "Sin registro"
          }`}
        />
        <AuditDefinition
          label="Alumno"
          value={entry.studentName ?? entry.studentId ?? "No documentado"}
        />
        <AuditDefinition
          label="Propósito"
          value={entry.purpose ?? "No documentado"}
        />
        <AuditDefinition label="Origen" value={entry.origin} />
      </dl>
    </article>
  );
};

const AuditDefinition: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div>
    <dt className="text-slate-600 uppercase tracking-wider">{label}</dt>
    <dd className="text-slate-300 mt-1 break-words">{value}</dd>
  </div>
);

const ActionBadge: React.FC<{ category: AuditCategory }> = ({
  category,
}) => {
  const styles: Record<AuditCategory, string> = {
    CONSULTA: "bg-blue-500/10 text-blue-300 border-blue-500/20",
    CREACION: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    ACTUALIZACION: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    ELIMINACION: "bg-red-500/10 text-red-300 border-red-500/20",
    OTRA: "bg-slate-500/10 text-slate-300 border-slate-500/20",
  };

  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-wider ${styles[category]}`}
    >
      {CATEGORY_LABELS[category]}
    </span>
  );
};

const StatCard: React.FC<{
  label: string;
  value: number;
  icon: string;
  color: "blue" | "indigo" | "emerald" | "amber" | "violet";
}> = ({ label, value, icon, color }) => {
  const styles = {
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    indigo: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    violet: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  };

  return (
    <div className="bg-[#0b121a]/70 p-4 rounded-2xl border border-white/5 flex items-center gap-3">
      <div
        className={`size-10 rounded-xl border flex items-center justify-center ${styles[color]}`}
      >
        <span className="material-symbols-outlined text-xl">{icon}</span>
      </div>
      <div>
        <p className="text-[9px] text-slate-500 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-xl font-black text-white">{value}</p>
      </div>
    </div>
  );
};

const FilterInput: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "date";
  placeholder?: string;
}> = ({ label, value, onChange, type = "text", placeholder }) => (
  <label>
    <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
      {label}
    </span>
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-blue-500"
    />
  </label>
);

const FilterSelect: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
}> = ({ label, value, onChange, options }) => (
  <label>
    <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
      {label}
    </span>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-blue-500"
    >
      {options.map(([optionValue, optionLabel]) => (
        <option key={optionValue || "all"} value={optionValue}>
          {optionLabel}
        </option>
      ))}
    </select>
  </label>
);

const LoadingRow = () => (
  <tr>
    <td colSpan={6} className="px-8 py-16 text-center text-xs text-slate-500">
      Consultando eventos autorizados...
    </td>
  </tr>
);

const EmptyRow = () => (
  <tr>
    <td colSpan={6} className="px-8 py-16 text-center text-xs text-slate-500">
      No hay eventos confirmados para estos filtros.
    </td>
  </tr>
);
