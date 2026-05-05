import React from "react";
import { SecretariaStudentSummary } from "./secretariaTypes";

interface StudentRegistryCardProps {
  students: SecretariaStudentSummary[];
  selectedId: string | null;
  canCreate: boolean;
  canEdit: boolean;
  onSelect: (studentId: string) => void;
  onCreate: () => void;
  onEdit: (student: SecretariaStudentSummary) => void;
  onValidate: (student: SecretariaStudentSummary) => void;
}

const statusClass = {
  completo: "border-emerald-300/30 bg-emerald-500/15 text-emerald-100",
  incompleto: "border-amber-300/30 bg-amber-500/15 text-amber-100",
};

export const StudentRegistryCard: React.FC<StudentRegistryCardProps> = ({
  students,
  selectedId,
  canCreate,
  canEdit,
  onSelect,
  onCreate,
  onEdit,
  onValidate,
}) => (
  <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-slate-950/20">
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-violet-200">Expedientes</p>
        <h2 className="mt-1 text-xl font-black text-white">Registro administrativo</h2>
      </div>
      <button
        type="button"
        onClick={onCreate}
        disabled={!canCreate}
        className="min-h-[44px] rounded-2xl bg-violet-300 px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
      >
        Crear expediente
      </button>
    </div>

    <div className="space-y-3">
      {students.slice(0, 8).map((student) => (
        <article
          key={student.id}
          className={`rounded-[1.5rem] border p-4 transition ${selectedId === student.id ? "border-violet-300/60 bg-violet-500/10" : "border-white/10 bg-slate-950/35"}`}
        >
          <button type="button" onClick={() => onSelect(student.id)} className="w-full text-left">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-black text-white">{student.name}</h3>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {student.group} · {student.matricula || "Sin matrícula"}
                </p>
              </div>
              <span className={`shrink-0 rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-widest ${statusClass[student.expedienteStatus]}`}>
                {student.expedienteStatus}
              </span>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-300">
              {student.missingFields.length > 0 ? `Falta: ${student.missingFields.join(", ")}` : "Datos base y documentos validados."}
            </p>
          </button>

          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <button type="button" onClick={() => onSelect(student.id)} className="min-h-[40px] rounded-xl border border-white/10 bg-white/[0.06] px-3 text-[10px] font-black uppercase tracking-widest text-white">
              Ver expediente
            </button>
            <button type="button" onClick={() => onEdit(student)} disabled={!canEdit} className="min-h-[40px] rounded-xl border border-violet-300/30 bg-violet-500/10 px-3 text-[10px] font-black uppercase tracking-widest text-violet-100 disabled:cursor-not-allowed disabled:opacity-40">
              Editar
            </button>
            <button type="button" onClick={() => onValidate(student)} disabled={!canEdit} className="min-h-[40px] rounded-xl bg-white px-3 text-[10px] font-black uppercase tracking-widest text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400">
              Validar
            </button>
          </div>
        </article>
      ))}
      {students.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-xs font-bold uppercase tracking-widest text-slate-500">
          Sin alumnos para el filtro actual
        </div>
      )}
    </div>
  </section>
);
