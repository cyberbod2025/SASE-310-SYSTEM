import React from "react";
import { TeacherStudentSummary } from "./docenteTypes";

interface StudentQuickListProps {
  students: TeacherStudentSummary[];
  selectedStudentId: string;
  onSelectStudent: (studentId: string) => void;
  onOpenReport: () => void;
}

export const StudentQuickList: React.FC<StudentQuickListProps> = ({
  students,
  selectedStudentId,
  onSelectStudent,
  onOpenReport,
}) => (
  <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
    <div className="mb-5">
      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-emerald-200">Alumnos</p>
      <h2 className="mt-1 text-xl font-black text-white">Lista rápida</h2>
    </div>
    <div className="space-y-2">
      {students.slice(0, 12).map((student) => {
        const active = selectedStudentId === student.id;
        return (
          <button
            key={student.id}
            type="button"
            onClick={() => {
              onSelectStudent(student.id);
              onOpenReport();
            }}
            className={`w-full rounded-[1.25rem] border p-4 text-left transition ${active ? "border-emerald-300/70 bg-emerald-500/15" : "border-white/10 bg-slate-950/35 hover:border-emerald-300/35"}`}
          >
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/10 text-xs font-black text-white">
                {student.avatar ? <img src={student.avatar} alt="" className="h-full w-full object-cover" /> : student.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-white">{student.name}</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">{student.group} · {student.matricula}</p>
              </div>
            </div>
          </button>
        );
      })}
      {students.length === 0 && <p className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-xs font-bold uppercase tracking-widest text-slate-500">Sin alumnos para este filtro</p>}
    </div>
  </section>
);
