import type { BehaviorDriftLevel, BehaviorMetric, Student } from "../types";

const driftConfig: Record<
  BehaviorDriftLevel,
  {
    label: string;
    message: string;
    icon: string;
    tone: string;
    dot: string;
    border: string;
  }
> = {
  estable: {
    label: "Estable",
    message: "Comportamiento estable",
    icon: "check_circle",
    tone: "text-emerald-300",
    dot: "bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.55)]",
    border: "border-emerald-400/25 bg-emerald-400/8",
  },
  leve: {
    label: "Leve",
    message: "Ligera desviación detectada",
    icon: "error",
    tone: "text-yellow-300",
    dot: "bg-yellow-300 shadow-[0_0_16px_rgba(253,224,71,0.55)]",
    border: "border-yellow-300/25 bg-yellow-300/8",
  },
  media: {
    label: "Media",
    message: "Patrón negativo emergente",
    icon: "warning",
    tone: "text-orange-300",
    dot: "bg-orange-400 shadow-[0_0_16px_rgba(251,146,60,0.55)]",
    border: "border-orange-400/25 bg-orange-400/8",
  },
  critica: {
    label: "Crítica",
    message: "Fallo silencioso detectado",
    icon: "dangerous",
    tone: "text-rose-300",
    dot: "bg-rose-400 shadow-[0_0_16px_rgba(251,113,133,0.55)]",
    border: "border-rose-400/30 bg-rose-400/10",
  },
  "sin datos suficientes": {
    label: "Sin datos",
    message: "Se requieren más registros para calcular deriva",
    icon: "hourglass_empty",
    tone: "text-slate-400",
    dot: "bg-slate-400 shadow-[0_0_16px_rgba(148,163,184,0.35)]",
    border: "border-slate-400/20 bg-slate-400/5",
  },
};

const getLatestMetric = (student: Student): BehaviorMetric | null => {
  return student.behaviorMetrics?.[0] || null;
};

const normalizeSparkValue = (metric: BehaviorMetric) => {
  const value = metric.calidad + metric.consistencia;
  return Math.max(12, Math.min(100, Math.round((value / 10) * 100)));
};

export const BehaviorDriftCard = ({ students }: { students: Student[] }) => {
  const trackedStudents = students
    .map((student) => ({ student, metric: getLatestMetric(student) }))
    .filter((entry): entry is { student: Student; metric: BehaviorMetric } => Boolean(entry.metric))
    .sort((left, right) => left.metric.derivaScore - right.metric.derivaScore)
    .slice(0, 4);

  return (
    <section className="card-sase p-6 border-[var(--sase-border-ghost)] relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sase-info/30 to-transparent" />
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.28em] text-[var(--sase-text-muted)]">
            Behavior Drift Engine
          </p>
          <h3 className="mt-2 text-lg font-black tracking-tight text-white">
            Deriva de comportamiento
          </h3>
        </div>
        <div className="rounded-2xl border border-sase-info/20 bg-sase-info/10 p-2 text-sase-info">
          <span className="material-icons text-xl">monitor_heart</span>
        </div>
      </div>

      {trackedStudents.length === 0 ? (
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-[var(--sase-text-muted)]">
          Aún no hay métricas persistidas. El motor se activará al registrar incidencias o actualizar expedientes.
        </div>
      ) : (
        <div className="space-y-3">
          {trackedStudents.map(({ student, metric }) => {
            const level = metric.nivelDeriva || "estable";
            const config = driftConfig[level];
            const series = [...(student.behaviorMetrics || [])].slice(0, 6).reverse();

            return (
              <article
                key={`${student.id}-${metric.id}`}
                className={`rounded-2xl border p-4 ${config.border}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`size-2.5 rounded-full ${config.dot}`} />
                      <p className="truncate text-sm font-black text-white">{student.name}</p>
                    </div>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--sase-text-muted)]">
                      {student.group} · Deriva {config.label}
                    </p>
                  </div>
                  <span className={`material-icons ${config.tone}`}>{config.icon}</span>
                </div>

                <div className="mt-4 flex h-12 items-end gap-1.5" aria-label="Últimos registros de deriva">
                  {series.map((item) => (
                    <div
                      key={item.id}
                      className="flex-1 rounded-t-lg bg-white/12 overflow-hidden"
                      title={`Deriva ${item.derivaScore.toFixed(2)}`}
                    >
                      <div
                        className={`w-full rounded-t-lg ${config.dot}`}
                        style={{ height: `${normalizeSparkValue(item)}%` }}
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-xl border border-white/8 bg-black/10 p-3">
                  <p className={`text-xs font-black ${config.tone}`}>Sasito: {config.message}</p>
                  <p className="mt-1 text-[10px] text-[var(--sase-text-muted)]">
                    Score {metric.derivaScore.toFixed(2)} · tendencia {metric.tendencia.toFixed(2)}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
