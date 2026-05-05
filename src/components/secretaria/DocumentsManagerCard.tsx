import React from "react";
import { DOCUMENT_OPTIONS, SecretariaDocumentType, SecretariaStudentSummary } from "./secretariaTypes";

interface DocumentsManagerCardProps {
  selectedStudent: SecretariaStudentSummary | null;
  onGenerate: (type: SecretariaDocumentType) => void;
  onDownload: (type: SecretariaDocumentType) => void;
  onPrint: (type: SecretariaDocumentType) => void;
}

export const DocumentsManagerCard: React.FC<DocumentsManagerCardProps> = ({
  selectedStudent,
  onGenerate,
  onDownload,
  onPrint,
}) => (
  <section className="rounded-[2rem] border border-white/10 bg-slate-950/45 p-5 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
    <div className="mb-5">
      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-fuchsia-200">Documentos</p>
      <h2 className="mt-1 text-xl font-black text-white">Centro documental</h2>
      <p className="mt-2 text-xs leading-5 text-slate-400">
        Plantillas administrativas sin análisis conductual. Alumno activo: {selectedStudent?.name || "selecciona un expediente"}.
      </p>
    </div>

    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {DOCUMENT_OPTIONS.map((option) => (
        <article key={option.type} className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-100">
              <span className="material-icons text-lg">{option.icon}</span>
            </div>
            <div>
              <h3 className="text-sm font-black text-white">{option.label}</h3>
              <p className="mt-1 text-xs leading-5 text-slate-400">{option.detail}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <button type="button" onClick={() => onGenerate(option.type)} disabled={!selectedStudent} className="min-h-[38px] rounded-xl bg-violet-300 px-2 text-[9px] font-black uppercase tracking-widest text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400">
              Generar
            </button>
            <button type="button" onClick={() => onDownload(option.type)} disabled={!selectedStudent} className="min-h-[38px] rounded-xl border border-white/10 bg-white/[0.06] px-2 text-[9px] font-black uppercase tracking-widest text-white disabled:cursor-not-allowed disabled:opacity-40">
              Descargar
            </button>
            <button type="button" onClick={() => onPrint(option.type)} disabled={!selectedStudent} className="min-h-[38px] rounded-xl border border-white/10 bg-white/[0.06] px-2 text-[9px] font-black uppercase tracking-widest text-white disabled:cursor-not-allowed disabled:opacity-40">
              Imprimir
            </button>
          </div>
        </article>
      ))}
    </div>
  </section>
);
