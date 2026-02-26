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
  const { addInstitutionalDocument, currentUserRole } = useApp();
  const [docType, setDocType] = useState<DocumentType>("HECHOS");
  const [details, setDetails] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [title, setTitle] = useState("");

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // Mocking AI Response for now, but using the prompt logic
      let prompt = "";
      switch (docType) {
        case "HECHOS":
          prompt = PROMPTS.GENERATE_NARRATIVE_FACTS({
            studentName,
            incidentType: "Incidencia Reportada",
            details,
            date: new Date().toLocaleDateString(),
          });
          break;
        case "MINUTA":
          prompt = PROMPTS.GENERATE_MINUTA_ACUERDO({
            participants: [currentUserRole, "Padre de Familia"],
            topic: "Seguimiento Conductual",
            agreements: details.split("\n"),
          });
          break;
        case "DISTANCIA":
          prompt = PROMPTS.GENERATE_DISTANCE_LEARNING_REQUEST({
            studentName,
            reason: details,
            startDate: new Date().toLocaleDateString(),
            endDate: "A definir",
          });
          break;
        default:
          prompt = details;
      }

      console.log("AI Prompt:", prompt);

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
    await addInstitutionalDocument({
      tipo: docType,
      folio,
      titulo: title,
      contenido: generatedContent,
      firmas: [currentUserRole],
      studentId,
      creado_por: currentUserRole,
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
              <h2 className="text-xl font-black uppercase italic tracking-tighter">
                Asistente Agentivo
              </h2>
              <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">
                Generación de Documentos Oficiales
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white"
            title="Cerrar generador de documentos"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-8 space-y-6 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                Tipo de Documento
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                title="Seleccionar el tipo de documento institucional a generar"
              >
                <option value="HECHOS">Narración de Hechos</option>
                <option value="MINUTA">Minuta de Acuerdos</option>
                <option value="DISTANCIA">Solicitud a Distancia</option>
                <option value="ACUERDO">Carta Compromiso</option>
                <option value="CITATORIO">Citatorio Oficial</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                Alumno
              </label>
              <input
                type="text"
                value={studentName}
                disabled
                title="Nombre del alumno (lectura únicamente)"
                placeholder="Nombre del alumno"
                className="w-full bg-slate-100 border border-slate-200 rounded-xl p-3 text-sm font-black text-slate-500 uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
              Detalles / Puntos Clave
            </label>
            <textarea
              rows={4}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Describa brevemente lo sucedido o los acuerdos pactados..."
              title="Ingrese los detalles o puntos clave para el documento"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          {generatedContent && (
            <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl animate-fade-in">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">
                  Vista Previa Generada
                </span>
                <button
                  onClick={() => setGeneratedContent("")}
                  className="text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest"
                  title="Borrar el contenido generado"
                >
                  Borrar
                </button>
              </div>
              <div className="text-sm text-slate-700 whitespace-pre-wrap italic font-serif leading-relaxed h-48 overflow-y-auto pr-2 custom-scrollbar">
                {generatedContent}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-xs font-black text-slate-500 uppercase tracking-widest hover:bg-slate-200 rounded-xl transition-colors"
            title="Cancelar y salir del generador"
          >
            Cancelar
          </button>
          {!generatedContent ? (
            <button
              disabled={!details || isGenerating}
              onClick={handleGenerate}
              className="px-8 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50 transition-all shadow-xl shadow-slate-900/20 flex items-center gap-2"
              title="Generar la estructura del documento con inteligencia artificial"
            >
              {isGenerating ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">
                    progress_activity
                  </span>
                  Analizando...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">
                    auto_awesome
                  </span>
                  Generar con IA
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleSaveAndPrint}
              className="px-8 py-2.5 bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-800 transition-all shadow-xl shadow-blue-200 flex items-center gap-2"
              title="Firmar digitalmente, guardar en expediente e imprimir el documento"
            >
              <span className="material-symbols-outlined text-[18px]">
                print
              </span>
              Firmar, Guardar e Imprimir
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
