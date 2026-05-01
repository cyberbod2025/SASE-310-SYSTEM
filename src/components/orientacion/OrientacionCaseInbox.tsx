import { GlassCard } from "../ui/GlassCard";
import { NeoButton } from "../ui/NeoButton";
import {
  ORIENTACION_CASE_LABELS,
  ORIENTACION_PRIORITY_LABELS,
  ORIENTACION_PRIORITY_STYLES,
  ORIENTACION_STATE_STYLES,
  type OrientacionCaseSummary,
  type OrientacionStudentSummary,
} from "./orientacionTypes";

interface Props {
  cases: OrientacionCaseSummary[];
  students: OrientacionStudentSummary[];
  selectedCaseId: string | null;
  onSelectCase: (caseId: string) => void;
  onOpenStudentCase: (studentId: string) => void;
}

export function OrientacionCaseInbox({ cases, students, selectedCaseId, onSelectCase, onOpenStudentCase }: Props) {
  return (
    <GlassCard className="border border-white/5 bg-slate-950/55">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">Bandeja de casos</h2>
          <p className="text-sm text-slate-400">Casos persistidos y sugerencias para abrir nuevos expedientes de Orientación.</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {cases.length === 0 ? (
          <EmptyState title="Sin casos persistidos" description="Aún no hay casos abiertos; usa la bandeja sugerida para crear el primero." />
        ) : (
          cases.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectCase(item.id)}
              className={`w-full rounded-2xl border p-4 text-left transition ${selectedCaseId === item.id ? "border-violet-400/40 bg-violet-500/10" : "border-white/5 bg-white/[0.03] hover:bg-white/[0.06]"}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-base font-semibold text-white">{item.alumnoNombre}</div>
                  <div className="text-xs text-slate-400">{item.grupo ?? "Sin grupo"} · {item.matricula ?? "Sin matrícula"}</div>
                  <div className="mt-2 text-sm text-slate-300">{item.motivo}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge text={ORIENTACION_CASE_LABELS[item.estado]} className={ORIENTACION_STATE_STYLES[item.estado]} />
                  <Badge text={ORIENTACION_PRIORITY_LABELS[item.prioridad]} className={ORIENTACION_PRIORITY_STYLES[item.prioridad]} />
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      <div className="mt-5 border-t border-white/5 pt-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Sugeridos para abrir caso</h3>
        <div className="mt-3 grid gap-2">
          {students.slice(0, 5).map((student) => (
            <div key={student.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/5 bg-black/20 p-3">
              <div>
                <div className="text-sm font-semibold text-white">{student.nombre}</div>
                <div className="text-xs text-slate-400">{student.grupo ?? "Sin grupo"} · {student.matricula ?? "Sin matrícula"}</div>
              </div>
              <NeoButton onClick={() => onOpenStudentCase(student.id)} className="px-3 py-2 text-xs">
                Abrir
              </NeoButton>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}

function Badge({ text, className }: { text: string; className: string }) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${className}`}>{text}</span>;
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-5 text-center">
      <div className="font-semibold text-white">{title}</div>
      <div className="mt-1 text-sm text-slate-400">{description}</div>
    </div>
  );
}
