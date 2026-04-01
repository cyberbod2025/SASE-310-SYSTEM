import React, { useState } from "react";
import { PROMPTS } from "./prompts";
import { useApp } from "../../store";
import { DocumentType, DocumentoInstitucional } from "../../types";
import { printContent } from "../PrintButtons";
import toast from "react-hot-toast";

interface AIDocumentGeneratorProps {
  studentId: string;
  studentName: string;
  onClose: () => void;
}

export const AIDocumentGenerator: React.FC<AIDocumentGeneratorProps> = ({
  studentId,
  studentName,
  onClose,
}) => {
  const { addDocumentoInstitucional, currentUserRole } = useApp();
  const [docType, setDocType] = useState<DocumentType>("HECHOS");
  const [details, setDetails] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [title, setTitle] = useState("");

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // Mocking AI Response for now, but using the prompt logic
      let promptText = "";
      switch (docType) {
        case "HECHOS":
          promptText = PROMPTS.GENERATE_NARRATIVE_FACTS({
            studentName,
            incidentType: "Incidencia Reportada",
            details,
            date: new Date().toLocaleDateString(),
          });
          break;
        case "MINUTA":
          promptText = PROMPTS.GENERATE_MINUTA_ACUERDO({
            participants: [currentUserRole, "Padre de Familia"],
            topic: "Seguimiento Conductual",
            agreements: details.split("\n"),
          });
          break;
        case "DISTANCIA":
          promptText = PROMPTS.GENERATE_DISTANCE_LEARNING_REQUEST({
            studentName,
            reason: details,
            startDate: new Date().toLocaleDateString(),
            endDate: "A definir",
          });
          break;
        default:
          promptText = details;
      }

      // Simulate AI Latency
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const response = `[SISTEMA SASE IA AGENTIVA]\n\nEste es un documento generado automáticamente basado en sus indicaciones.\n\n${details}\n\nConcluye la narración de hechos en apego a los protocolos institucionales de la Escuela Secundaria Diurna 310.`;

      setGeneratedContent(response);
      setTitle(
        `${docType} - ${studentName} - ${new Date().toLocaleDateString()}`,
      );
      toast.success("Documento generado por IA");
    } catch (error) {
      toast.error("Error al generar documento");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAndPrint = async () => {
    const folio = `DOC-${Math.floor(Math.random() * 100000)}`;
    await addDocumentoInstitucional({
      studentId,
      tipo: docType,
      folio,
      titulo: title,
      contenido: generatedContent,
      firmas: [currentUserRole],
      creado_por: currentUserRole,
      fecha: new Date().toISOString().split('T')[0]
    });

    printContent(
      title,
      `<div style="white-space: pre-wrap;">${generatedContent}</div>`,
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-white/10">
              <span className="material-symbols-outlined text-blue-400">
                auto_awesome
              </span>
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest italic">
                Generador Legal IA
              </h2>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-tight">
                Escuela Secundaria Diurna 310 "Profr. Adolfo Cisneros"
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
            title="Cerrar generador de documentos"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {!generatedContent ? (
            <div className="space-y-6 animate-slide-up">
              <div className="grid grid-cols-2 gap-4">
                {(["HECHOS", "MINUTA", "DISTANCIA"] as DocumentType[]).map(
                  (type) => (
                    <button
                      key={type}
                      onClick={() => setDocType(type)}
                      className={`p-4 rounded-2xl border-2 transition-all text-left ${
                        docType === type
                          ? "border-blue-600 bg-blue-50 text-blue-900"
                          : "border-slate-100 bg-white text-slate-500 hover:border-blue-200"
                      }`}
                    >
                      <h4 className="text-xs font-black uppercase tracking-widest">
                        {type}
                      </h4>
                      <p className="text-[10px] opacity-60 font-medium mt-1 uppercase">
                        {type === "HECHOS"
                          ? "Narrativa de incidente"
                          : type === "MINUTA"
                            ? "Acuerdos y compromisos"
                            : "Solicitud a distancia"}
                      </p>
                    </button>
                  ),
                )}
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Detalles del incidente / acuerdos
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Escriba los puntos clave. La IA redactará el documento formal..."
                  className="w-full h-32 p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-blue-500 focus:bg-white transition-all text-sm outline-none resize-none"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={!details || isGenerating}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
              >
                {isGenerating ? (
                  <>
                    <div className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Generando Narrativa...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">
                      auto_awesome
                    </span>
                    Generar Documento con IA
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6 animate-slide-up">
              <div className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-100">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-transparent border-b border-slate-200 pb-2 text-sm font-black uppercase outline-none focus:border-blue-500 mb-4"
                />
                <div className="prose prose-slate max-w-none">
                  <textarea
                    value={generatedContent}
                    onChange={(e) => setGeneratedContent(e.target.value)}
                    className="w-full h-64 bg-white p-4 rounded-xl border border-slate-200 text-sm leading-relaxed outline-none focus:border-blue-500 resize-none font-serif"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setGeneratedContent("")}
                  className="flex-1 py-4 btn-sase-secondary"
                >
                  Regresar
                </button>
                <button
                  onClick={handleSaveAndPrint}
                  className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3"
                >
                  <span className="material-symbols-outlined">print</span>
                  Guardar e Imprimir
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
