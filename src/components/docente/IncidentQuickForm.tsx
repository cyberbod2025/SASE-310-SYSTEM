import React from "react";
import { QuickIncidentDraft, QuickIncidentKind, QUICK_INCIDENT_OPTIONS, TeacherStudentSummary } from "./docenteTypes";

interface IncidentQuickFormProps {
  open: boolean;
  draft: QuickIncidentDraft;
  students: TeacherStudentSummary[];
  canRegister: boolean;
  onChange: (draft: QuickIncidentDraft) => void;
  onClose: () => void;
  onSubmit: (keepOpen: boolean) => void;
  loading?: boolean;
}

export const IncidentQuickForm: React.FC<IncidentQuickFormProps> = ({
  open,
  draft,
  students,
  canRegister,
  onChange,
  onClose,
  onSubmit,
  loading = false,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-end justify-center bg-slate-950/70 p-3 backdrop-blur-sm sm:items-center">
      <section className="w-full max-w-2xl rounded-[2rem] border border-emerald-200/20 bg-slate-950 p-5 shadow-2xl shadow-emerald-950/40 animate-scale-in">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-emerald-200">Reporte rápido</p>
            <h2 className="mt-1 text-2xl font-black text-white">Guardar incidencia</h2>
            <p className="mt-2 text-xs leading-5 text-slate-400">Alumno, tipo y guardar. La evidencia es opcional.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Cerrar
          </button>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">Alumno</span>
            <select
              value={draft.studentId}
              disabled={loading}
              onChange={(event) => onChange({ ...draft, studentId: event.target.value })}
              className="min-h-[48px] w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-sm font-bold text-white outline-none focus:border-emerald-300/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Selecciona alumno</option>
              {students.map((student) => <option key={student.id} value={student.id}>{student.name} · {student.group}</option>)}
            </select>
          </label>

          <div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Tipo</p>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_INCIDENT_OPTIONS.map((option) => {
                const active = draft.kind === option.kind;
                return (
                  <button
                    key={option.kind}
                    type="button"
                    disabled={loading}
                    onClick={() => onChange({ ...draft, kind: option.kind })}
                    className={`min-h-[82px] rounded-2xl border p-3 text-left transition disabled:opacity-50 disabled:cursor-not-allowed ${active ? "border-emerald-300 bg-emerald-500/20" : "border-white/10 bg-white/[0.05] hover:border-emerald-300/40"}`}
                  >
                    <span className="material-icons text-lg text-emerald-100">{option.icon}</span>
                    <p className="mt-1 text-sm font-black text-white">{option.label}</p>
                    <p className="mt-1 text-[10px] leading-4 text-slate-400">{option.detail}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <label className="block">
            <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">Descripción opcional</span>
            <textarea
              value={draft.description}
              disabled={loading}
              onChange={(event) => onChange({ ...draft, description: event.target.value })}
              maxLength={180}
              placeholder="Ej. interrumpió la actividad, no trajo material, conflicto en equipo..."
              className="min-h-[82px] w-full resize-none rounded-2xl border border-white/10 bg-slate-900 p-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-300/50 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </label>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">Nota de evidencia</span>
              <input
                value={draft.evidenceNote}
                disabled={loading}
                onChange={(event) => onChange({ ...draft, evidenceNote: event.target.value })}
                placeholder="Opcional"
                className="min-h-[44px] w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-300/50 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">Foto opcional</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                disabled={loading}
                onChange={(event) => onChange({ ...draft, evidenceFileName: event.target.files?.[0]?.name || "" })}
                className="min-h-[44px] w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-2 text-xs text-slate-300 file:mr-3 file:rounded-xl file:border-0 file:bg-emerald-300 file:px-3 file:py-2 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:text-slate-950 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </label>
          </div>

          {!canRegister && <p className="rounded-2xl border border-rose-300/30 bg-rose-500/10 p-3 text-xs font-bold text-rose-100">No tienes permiso para crear incidencias.</p>}

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => { if (!loading) onSubmit(false); }}
              disabled={!canRegister || loading}
              className="min-h-[52px] rounded-2xl bg-emerald-300 px-4 text-sm font-black uppercase tracking-widest text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 flex items-center justify-center gap-2 transition active:scale-95"
            >
              {loading ? (
                <>
                  <span className="material-icons animate-spin text-[16px]">progress_activity</span>
                  <span>Guardando...</span>
                </>
              ) : (
                "Guardar"
              )}
            </button>
            <button
              type="button"
              onClick={() => { if (!loading) onSubmit(true); }}
              disabled={!canRegister || loading}
              className="min-h-[52px] rounded-2xl border border-emerald-300/30 bg-emerald-500/10 px-4 text-sm font-black uppercase tracking-widest text-emerald-100 disabled:cursor-not-allowed disabled:opacity-40 flex items-center justify-center gap-2 transition active:scale-95"
            >
              {loading ? (
                <>
                  <span className="material-icons animate-spin text-[16px]">progress_activity</span>
                  <span>Procesando...</span>
                </>
              ) : (
                "Guardar y continuar"
              )}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export type { QuickIncidentKind };
