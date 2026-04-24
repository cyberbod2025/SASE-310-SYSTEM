import React, { useMemo, useState } from "react";
import { useApp } from "../store";
import { AppModule } from "../types";
import { GlassCard } from "./ui/GlassCard";
import { GeneradorDocumentos } from "../modules/documentos";

export const DocumentacionInstitucional: React.FC = () => {
  const { students, setCurrentModule } = useApp();
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || "");

  const selectedStudent = useMemo(
    () => students.find((student: any) => student.id === selectedStudentId) || students[0],
    [selectedStudentId, students],
  );

  if (!selectedStudent) {
    return (
      <div className="flex-1 p-6 lg:p-10 max-w-4xl mx-auto w-full">
        <GlassCard className="p-8 text-center space-y-4">
          <span className="material-icons text-5xl text-[var(--sase-text-muted)]">description</span>
          <h1 className="text-2xl font-black text-white">Documentación institucional</h1>
          <p className="text-sm text-slate-400">
            No hay estudiantes cargados para generar documentos. Regresa al tablero o revisa expedientes.
          </p>
          <button
            onClick={() => setCurrentModule(AppModule.DASHBOARD)}
            className="px-5 py-3 rounded-2xl bg-[rgba(129,106,184,0.22)] text-white text-[11px] font-black uppercase tracking-widest"
          >
            Volver al tablero
          </button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full space-y-5">
      <GlassCard className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[var(--sase-text-muted)] mb-1">
            Centro documental
          </p>
          <h1 className="text-3xl font-black text-white tracking-tight">Documentación institucional</h1>
        </div>
        <label className="flex flex-col gap-2 min-w-[260px]">
          <span className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
            Estudiante
          </span>
          <select
            value={selectedStudent.id}
            onChange={(event) => setSelectedStudentId(event.target.value)}
            className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-[rgba(129,106,184,0.55)]"
          >
            {students.map((student: any) => (
              <option key={student.id} value={student.id}>
                {student.name} · {student.group}
              </option>
            ))}
          </select>
        </label>
      </GlassCard>

      <GeneradorDocumentos
        studentId={selectedStudent.id}
        studentName={selectedStudent.name}
        studentGroup={selectedStudent.group}
        incidentDescription={selectedStudent.incidents?.[0]?.description || ""}
        onClose={() => setCurrentModule(AppModule.DASHBOARD)}
      />
    </div>
  );
};

export default DocumentacionInstitucional;
