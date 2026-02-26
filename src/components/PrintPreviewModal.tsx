import React, { useState } from "react";
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

  const handlePrint = () => {
    printContent(title, editableHtml);
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
            className="relative w-full max-w-4xl bg-[#0b0e14] border border-white/10 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
              <div>
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-1">
                  Editor de Previsualización
                </h3>
                <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">
                  {title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="size-10 rounded-xl bg-white/5 border border-white/10 text-slate-500 hover:text-white transition-all flex items-center justify-center"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Editor Area */}
            <div className="flex-1 overflow-hidden flex flex-col p-6 space-y-4">
              <div className="flex items-center gap-4 text-[10px] font-black text-amber-500/70 border-b border-amber-500/10 pb-2 uppercase tracking-widest">
                <span className="material-symbols-outlined text-sm">
                  edit_note
                </span>
                Modifica el contenido del reporte antes de imprimir
              </div>

              <div className="flex-1 relative group">
                <textarea
                  value={editableHtml}
                  onChange={(e) => setEditableHtml(e.target.value)}
                  className="w-full h-full bg-slate-950/50 border border-white/5 rounded-2xl p-6 text-slate-300 font-mono text-sm outline-none focus:border-amber-500/30 transition-all resize-none custom-scrollbar"
                  spellCheck={false}
                />
                <div className="absolute top-4 right-4 text-[9px] font-black text-slate-700 pointer-events-none uppercase tracking-widest">
                  HTML_EDITOR_V1
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
