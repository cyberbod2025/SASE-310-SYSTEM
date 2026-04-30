import React from "react";
import { SecretariaDocumentType, SecretariaStudentSummary } from "./secretariaTypes";

interface SecretariaStudentDetailProps {
  student: SecretariaStudentSummary | null;
  onEdit: (student: SecretariaStudentSummary) => void;
  onAttachDocument: (student: SecretariaStudentSummary) => void;
  onGenerateDocument: (type: SecretariaDocumentType) => void;
}

const Field = ({ label, value }: { label: string; value?: string | number | null }) => (
  <div className="rounded-2xl bg-slate-950/40 p-4">
    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
    <p className="mt-1 text-sm font-black text-white">{value || "Pendiente"}</p>
  </div>
);

export const SecretariaStudentDetail: React.FC<SecretariaStudentDetailProps> = ({
  student,
  onEdit,
  onAttachDocument,
  onGenerateDocument,
}) => {
  if (!student) {
    return (
      <section className="rounded-[2rem] border border-dashed border-white/10 bg-white/[0.03] p-8 text-center">
        <p className="text-xs font-black uppercase tracking-widest text-slate-500">Selecciona un expediente para ver el detalle administrativo.</p>
      </section>
    );
  }

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-violet-200">Detalle de alumno</p>
          <h2 className="mt-1 text-2xl font-black text-white">{student.name}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Estado del expediente: <span className="font-black text-violet-100">{student.expedienteStatus}</span>
          </p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-200">
          {student.documentsCount} documentos
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Field label="Matrícula" value={student.matricula} />
        <Field label="CURP" value={student.curp} />
        <Field label="Grupo" value={student.group} />
        <Field label="Nacimiento" value={student.birthdate} />
        <Field label="Tutor" value={student.guardianName} />
        <Field label="Teléfono" value={student.guardianPhone} />
        <Field label="Documentos" value={student.documentsCount} />
        <Field label="Pendientes" value={student.missingFields.length ? student.missingFields.join(", ") : "Sin pendientes"} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <button type="button" onClick={() => onEdit(student)} className="min-h-[44px] rounded-2xl bg-violet-300 px-4 text-xs font-black uppercase tracking-widest text-slate-950">
          Editar datos
        </button>
        <button type="button" onClick={() => onAttachDocument(student)} className="min-h-[44px] rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-xs font-black uppercase tracking-widest text-white">
          Adjuntar documentos
        </button>
        <button type="button" onClick={() => onGenerateDocument("constancia")} className="min-h-[44px] rounded-2xl border border-violet-300/30 bg-violet-500/10 px-4 text-xs font-black uppercase tracking-widest text-violet-100">
          Generar documento
        </button>
      </div>
    </section>
  );
};
