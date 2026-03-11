import React, { useState } from "react";
import DOMPurify from "dompurify";
import { motion, AnimatePresence } from "framer-motion";
import { printContent } from "./PrintButtons";

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  initialHtml: string;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  isOpen,
  onClose,
  title,
  initialHtml,
}) => {
  const [editableHtml, setEditableHtml] = useState(initialHtml);
  const [viewMode, setViewMode] = useState<"preview" | "editor">("preview");

  // Sincronizar el contenido si cambia el initialHtml (especialmente al abrir/cerrar)
  React.useEffect(() => {
    if (isOpen) {
      setEditableHtml(initialHtml);
    }
  }, [initialHtml, isOpen]);

  const handlePrint = () => {
    printContent(title, DOMPurify.sanitize(editableHtml));
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-5xl bg-[#0b0e14] border border-white/10 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden flex flex-col max-h-[95vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
              <div>
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-1 italic">
                  Núcleo de Impresión SASE
                </h3>
                <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">
                  {title}
                </h2>
              </div>

              <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
                <button
                  onClick={() => setViewMode("preview")}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    viewMode === "preview"
                      ? "bg-amber-600 text-white shadow-lg"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  Vista Previa
                </button>
                <button
                  onClick={() => setViewMode("editor")}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    viewMode === "editor"
                      ? "bg-amber-600 text-white shadow-lg"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  Editor HTML
                </button>
              </div>

              <button
                onClick={onClose}
                className="size-10 rounded-xl bg-white/5 border border-white/10 text-slate-500 hover:text-white transition-all flex items-center justify-center"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden flex flex-col p-6 space-y-4">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest border-b border-white/5 pb-2">
                <div className="flex items-center gap-4 text-amber-500/70">
                  <span className="material-symbols-outlined text-sm">
                    {viewMode === "preview" ? "visibility" : "edit_note"}
                  </span>
                  {viewMode === "preview"
                    ? "Previsualización del documento final"
                    : "Modifica el código fuente si es necesario"}
                </div>
                <div className="text-slate-600 font-mono">
                  {viewMode === "preview"
                    ? "RENDER_MODE_ACTIVE"
                    : "SOURCE_MODE_ACTIVE"}
                </div>
              </div>

              <div className="flex-1 relative overflow-hidden flex flex-col">
                {viewMode === "editor" ? (
                  <textarea
                    value={editableHtml}
                    onChange={(e) => setEditableHtml(e.target.value)}
                    className="w-full h-full bg-slate-950/50 border border-white/5 rounded-2xl p-6 text-slate-300 font-mono text-sm outline-none focus:border-amber-500/30 transition-all resize-none custom-scrollbar"
                    spellCheck={false}
                  />
                ) : (
                  <div className="w-full h-full bg-white rounded-2xl overflow-y-auto p-8 shadow-inner custom-scrollbar">
                    <div
                      className="print-preview-container text-black"
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(editableHtml),
                      }}
                    />
                    {/* Estilos específicos para la vista previa interna */}
                    <style
                      dangerouslySetInnerHTML={{
                        __html: `
                      .print-preview-container {
                        font-family: 'Inter', -apple-system, sans-serif;
                        color: #1a1a1a;
                        line-height: 1.5;
                      }
                      .print-preview-container h1, 
                      .print-preview-container h2, 
                      .print-preview-container h3 { 
                        color: #1e3a8a; 
                        margin-top: 1em;
                        margin-bottom: 0.5em;
                      }
                      .print-preview-container table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        margin: 15px 0; 
                      }
                      .print-preview-container th, 
                      .print-preview-container td { 
                        border: 1px solid #e2e8f0; 
                        padding: 10px; 
                        text-align: left; 
                      }
                      .print-preview-container th { 
                        background-color: #f8fafc; 
                        font-weight: 800; 
                        font-size: 11px;
                        text-transform: uppercase;
                      }
                      .print-preview-container .signature-line {
                        margin-top: 50px;
                        display: flex;
                        justify-content: space-around;
                      }
                      .print-preview-container .signature-box {
                        text-align: center;
                        width: 200px;
                      }
                      .print-preview-container .line {
                        border-top: 1px solid #333;
                        margin-bottom: 5px;
                      }
                      .print-preview-container .label {
                        font-size: 10px;
                        color: #64748b;
                        font-weight: bold;
                        text-transform: uppercase;
                      }
                    `,
                      }}
                    />
                  </div>
                )}

                <div className="absolute top-4 right-4 text-[9px] font-black text-slate-700 pointer-events-none uppercase tracking-widest bg-[#0b0e14]/50 px-2 py-1 rounded backdrop-blur-sm">
                  {viewMode === "editor" ? "CODE_V1" : "PAPER_VIEW"}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/5 bg-white/[0.01] flex items-center justify-center gap-4">
              <button
                onClick={onClose}
                className="px-8 py-3 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white hover:bg-white/5 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handlePrint}
                className="px-10 py-4 bg-amber-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-amber-600/20 hover:bg-amber-500 transition-all active:scale-95 flex items-center gap-3"
              >
                <span className="material-symbols-outlined text-lg">print</span>
                Confirmar e Imprimir
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
