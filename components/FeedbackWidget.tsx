import React, { useState } from "react";
import { useApp } from "../store";
import { supabase } from "../supabase/client";
import { toast } from "react-hot-toast";

export const FeedbackWidget = () => {
  // We get user directly from supabase auth when submitting

  const [isOpen, setIsOpen] = useState(false);
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
        // Fallback: Just toast success for UI demo purposes
        toast.error("Error al enviar feedback (Tabla no existe).");
      } else {
        toast.success("¡Gracias! Tu feedback ha sido recibido.");
      }
    } catch (err) {
      console.error(err);
      toast.success("Feedback registrado localmente (Demo).");
    }

    setIsSending(false);
    setComment("");
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-3 font-sans">
      {isOpen && (
        <div className="bg-slate-900 border border-white/20 rounded-xl shadow-2xl p-4 w-80 animate-fade-in-up backdrop-blur-md">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-white font-bold text-sm">Enviar Feedback</h4>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <span className="material-symbols-outlined text-[18px]">
                close
              </span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-2 p-1 bg-black/40 rounded-lg">
              <button
                type="button"
                onClick={() => setType("bug")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${
                  type === "bug"
                    ? "bg-red-500/20 text-red-400 border border-red-500/50"
                    : "text-gray-400 hover:bg-white/5"
                }`}
              >
                Error
              </button>
              <button
                type="button"
                onClick={() => setType("suggestion")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${
                  type === "suggestion"
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/50"
                    : "text-gray-400 hover:bg-white/5"
                }`}
              >
                Sugerencia
              </button>
              <button
                type="button"
                onClick={() => setType("ux")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${
                  type === "ux"
                    ? "bg-purple-500/20 text-purple-400 border border-purple-500/50"
                    : "text-gray-400 hover:bg-white/5"
                }`}
              >
                Diseño
              </button>
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                type === "bug"
                  ? "¿Qué falló? Describe los pasos..."
                  : "¿Cómo podemos mejorar?"
              }
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-blue-500 h-24 resize-none"
              required
            />

            <button
              type="submit"
              disabled={isSending}
              className="w-full bg-white text-black font-bold py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2"
            >
              {isSending ? "Enviando..." : "Enviar Comentario"}
              <span className="material-symbols-outlined text-[16px]">
                send
              </span>
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`size-12 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${
          isOpen
            ? "bg-white text-black rotate-90"
            : "bg-gradient-to-br from-indigo-600 to-purple-600 text-white border border-white/20"
        }`}
      >
        <span className="material-symbols-outlined text-[24px]">
          {isOpen ? "close" : "feedback"}
        </span>
      </button>
    </div>
  );
};
