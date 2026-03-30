import React, { useState } from "react";
import { useApp } from "../store";
import { supabase } from "../supabase/client";
import { toast } from "react-hot-toast";

export const FeedbackWidget = () => {
  // We get user directly from supabase auth when submitting

  const { isFeedbackOpen, setIsFeedbackOpen } = useApp();
  const [type, setType] = useState<"bug" | "suggestion" | "ux">("bug");
  const [comment, setComment] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSending(true);

    // Get current context
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const currentUrl = window.location.href;
    const userAgent = navigator.userAgent;

    // Persist to Supabase (bypassing strict type check for pilot)
    try {
      const { error } = await (
        supabase.from("system_feedback" as any) as any
      ).insert([
        {
          user_id: user?.id,
          email: user?.email,
          type,
          comment,
          url: currentUrl,
          user_agent: userAgent,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.warn("Feedback table might be missing:", error);
        toast.error("Error al enviar. Intenta de nuevo.", { duration: 4000 });
        setIsSending(false);
        return;
      } else {
        toast.success("¡Gracias! Tu sugerencia ha sido recibida.", { duration: 4000 });
      }
    } catch (err) {
      console.error(err);
      // Sin toast adicional en catch para evitar mensajes duplicados
    }

    setIsSending(false);
    setComment("");
    setIsFeedbackOpen(false);
  };

  if (!isFeedbackOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0b0e14] border border-white/20 rounded-2xl shadow-2xl p-6 w-full max-w-md animate-scale-in">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/30">
              <span className="material-symbols-outlined text-blue-500">
                feedback
              </span>
            </div>
            <div>
              <h4 className="text-white font-black text-sm uppercase tracking-widest">
                Sugerencias y Mejoras
              </h4>
              <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">
                Tu visión construye SASE
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsFeedbackOpen(false)}
            title="Descartar y cerrar ventana"
            aria-label="Cerrar ventana de sugerencias"
            className="size-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2 p-1 bg-black/40 rounded-xl border border-white/5">
            <button
              type="button"
              onClick={() => setType("bug")}
              title="Reportar un error técnico o fallo en el sistema"
              aria-label="Tipo: Error"
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                type === "bug"
                  ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                  : "text-slate-500 hover:text-white hover:bg-white/5"
              }`}
            >
              Error
            </button>
            <button
              type="button"
              onClick={() => setType("suggestion")}
              title="Proponer una nueva funcionalidad o mejora"
              aria-label="Tipo: Sugerencia"
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                type === "suggestion"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "text-slate-500 hover:text-white hover:bg-white/5"
              }`}
            >
              Sugerencia
            </button>
            <button
              type="button"
              onClick={() => setType("ux")}
              title="Comentar sobre la interfaz o facilidad de uso (UX/UI)"
              aria-label="Tipo: Diseño"
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                type === "ux"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                  : "text-slate-500 hover:text-white hover:bg-white/5"
              }`}
            >
              Diseño
            </button>
          </div>

          <textarea
            id="feedback-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            title="Describe aquí tu hallazgo o propuesta de mejora"
            placeholder={
              type === "bug"
                ? "¿Qué no está funcionando bien? Cuéntanos el detalle..."
                : "Escribe aquí todo lo que veas: lo que te gusta, lo que cambiarías, lo que funciona y lo que no..."
            }
            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-blue-500 h-32 resize-none transition-all placeholder:text-slate-600"
            required
            aria-required="true"
          />

          <button
            type="submit"
            disabled={isSending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-xl transition-all disabled:opacity-50 text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-lg shadow-blue-600/20 group"
          >
            {isSending ? "Enviando Sugerencia..." : "Enviar Sugerencia"}
            <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
              send
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};
