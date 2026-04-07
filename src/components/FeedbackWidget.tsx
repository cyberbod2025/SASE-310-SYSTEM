import React, { useEffect, useMemo, useState } from "react";
import { useApp } from "../store";
import { supabase } from "../supabase/client";
import { toast } from "react-hot-toast";
import { AppModule, UserRole } from "../types";

export const FeedbackWidget = () => {
  // We get user directly from supabase auth when submitting

  const {
    isFeedbackOpen,
    setIsFeedbackOpen,
    currentModule,
    currentUserRole,
    addNotification,
  } = useApp();

  type IssueTag =
    | "boton"
    | "menu"
    | "datos"
    | "rendimiento"
    | "sugerencia";

  const [type, setType] = useState<"bug" | "suggestion" | "ux">("bug");
  const [issueTag, setIssueTag] = useState<IssueTag>("boton");
  const [comment, setComment] = useState("");
  const [isSending, setIsSending] = useState(false);

  const moduleLabels: Record<AppModule, string> = useMemo(
    () => ({
      [AppModule.HOME]: "Selección de módulo",
      [AppModule.WELCOME]: "Portada",
      [AppModule.DASHBOARD]: "Dashboard",
      [AppModule.AGENDA]: "Agenda",
      [AppModule.REPORTES]: "Reportes",
      [AppModule.NOTIFICATIONS]: "Centro de notificaciones",
      [AppModule.EXPEDIENTES]: "Expedientes",
      [AppModule.BITACORA]: "Bitácora de auditoría",
      [AppModule.SOLICITUDES]: "Solicitudes",
      [AppModule.REPORTES_DOCENTES]: "Reportes Docentes",
      [AppModule.INSCRIPCIONES]: "Admisión",
      [AppModule.ARCHIVO]: "Archivo",
      [AppModule.PROTOCOLOS]: "Protocolos",
      [AppModule.APROBACIONES_PERSONAL]: "Aprobaciones de personal",
      [AppModule.CALIFICACIONES]: "Calificaciones",
      [AppModule.DOCUMENTACION]: "Documentación",
      [AppModule.MIS_GRUPOS]: "Mis grupos",
      [AppModule.SUBDIRECCION]: "Subdirección",
      [AppModule.DEVELOPER]: "Panel Técnico",
      [AppModule.PLANEACION_NEM]: "Planeación NEM",
      [AppModule.ASISTENCIA]: "Asistencia",
      [AppModule.OBJETOS_RETENIDOS]: "Objetos retenidos",
      [AppModule.IA_SASE]: "Terminal IA",
      [AppModule.NOT_FOUND]: "No encontrado",
      [AppModule.REGISTRO_PERSONAL]: "Registro de personal",
      [AppModule.TRABAJO_SOCIAL_TRACKER]: "Casos Trabajo Social",
      [AppModule.SALUD]: "Salud",
      [AppModule.UDEII_TRACKER]: "Inclusión UDEII",
      [AppModule.LECTURA_TRACKER]: "Lectura",
      [AppModule.MANUAL_USUARIO]: "Manual de usuario",
    }),
    [],
  );

  const issueLabels: Record<IssueTag, string> = {
    boton: "Un botón no funciona",
    menu: "Un menú se queda abierto",
    datos: "No guarda o no muestra datos",
    rendimiento: "Lentitud o pantalla saturada",
    sugerencia: "Propuesta de mejora",
  };

  useEffect(() => {
    if (isFeedbackOpen) {
      setIssueTag("boton");
      setType("bug");
      setComment("");
    }
  }, [isFeedbackOpen]);

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

    const contextoAutomatico = [
      `Módulo/Dashboard: ${moduleLabels[currentModule] || "Sin módulo"}`,
      `Ruta: ${window.location.pathname}`,
      `Rol: ${currentUserRole}`,
      `Etiqueta rápida: ${issueLabels[issueTag]}`,
      `Pantalla: ${window.innerWidth}x${window.innerHeight}`,
    ].join(" | ");

    const comentarioConContexto = `${comment.trim()}

[Contexto automático]
${contextoAutomatico}`;

    // Persist to Supabase (bypassing strict type check for pilot)
    try {
      const { error } = await (
        supabase.from("system_feedback" as any) as any
      ).insert([
        {
          user_id: user?.id,
          email: user?.email,
          type,
          comment: comentarioConContexto,
          url: currentUrl,
          user_agent: userAgent,
          created_at: new Date().toISOString(),
        },
      ]);
<<<<<<< HEAD

      if (error) {
        console.warn("Feedback table might be missing:", error);
        toast.error("Error al enviar. Intenta de nuevo.", { duration: 4000 });
        setIsSending(false);
        return;
      } else {
        toast.success("¡Gracias! Tu sugerencia ha sido recibida.", { duration: 4000 });
      }
=======

      if (error) {
        console.warn("Feedback table might be missing:", error);
        toast.error("Error al enviar. Intenta de nuevo.", { duration: 4000 });
        setIsSending(false);
        return;
      } else {
        toast.success("¡Gracias! Tu sugerencia ha sido recibida.", { duration: 4000 });
      }
>>>>>>> 6b7cfee0048e22f3aeefd2736b20d95b3c864f6f
    } catch (err) {
      console.error(err);
      // Sin toast adicional en catch para evitar mensajes duplicados
    }

    // Notificaciones optativas: omitidas temporalmente para evitar bloquear el envío si fallan

    setIsSending(false);
    setComment("");
    setIsFeedbackOpen(false);
  };

  if (!isFeedbackOpen) return null;

  if (!isFeedbackOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0b0e14] border border-white/20 rounded-2xl shadow-2xl p-6 w-full max-w-md animate-scale-in">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/30">
              <span className="material-icons text-blue-400">
                feedback
              </span>
            </div>
            <div>
              <h4 className="text-white font-black text-sm uppercase tracking-widest">
                Sugerencias y Mejoras
              </h4>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">
                Tu visión construye SASE
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsFeedbackOpen(false)}
            title="Descartar y cerrar ventana"
            aria-label="Cerrar ventana de sugerencias"
            className="size-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all"
          >
            <span className="material-icons text-[18px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-2 text-[11px] text-slate-300 bg-white/5 border border-white/10 rounded-xl p-3">
            <div className="flex items-center gap-2">
              <span className="material-icons text-sm text-blue-400">map</span>
              <span className="font-bold">Módulo actual:</span>
              <span className="text-slate-200">{moduleLabels[currentModule] || "Sin módulo"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-icons text-sm text-amber-400">badge</span>
              <span className="font-bold">Rol:</span>
              <span className="text-slate-200">{currentUserRole}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-icons text-sm text-emerald-400">link</span>
              <span className="font-bold">Ruta:</span>
              <span className="text-slate-200 truncate">{window.location.pathname}</span>
            </div>
          </div>

          <div className="flex gap-2 p-1 bg-black/40 rounded-xl border border-white/5">
            <button
              type="button"
              onClick={() => setType("bug")}
              title="Reportar un error técnico o fallo en el sistema"
              aria-label="Tipo: Error"
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-2xl transition-all ${
                type === "bug"
                  ? "bg-red-500 text-white shadow-xl shadow-black/5 shadow-red-500/20"
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
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-2xl transition-all ${
                type === "suggestion"
                  ? "bg-blue-600 text-white shadow-xl shadow-black/5 shadow-blue-600/20"
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
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-2xl transition-all ${
                type === "ux"
                  ? "bg-purple-600 text-white shadow-xl shadow-black/5 shadow-purple-600/20"
                  : "text-slate-500 hover:text-white hover:bg-white/5"
              }`}
            >
              Diseño
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { key: "boton", label: issueLabels.boton },
                { key: "menu", label: issueLabels.menu },
                { key: "datos", label: issueLabels.datos },
                { key: "rendimiento", label: issueLabels.rendimiento },
                { key: "sugerencia", label: issueLabels.sugerencia },
              ] as { key: IssueTag; label: string }[]
            ).map((issue) => (
              <button
                key={issue.key}
                type="button"
                onClick={() => setIssueTag(issue.key)}
                className={`text-left px-3 py-2 rounded-2xl border text-[11px] transition-all ${
                  issueTag === issue.key
                    ? "bg-blue-500/20 border-blue-500/40 text-white"
                    : "bg-black/30 border-white/5 text-slate-400 hover:text-white hover:border-white/20"
                }`}
              >
                <span className="font-bold block">{issue.label}</span>
                <span className="text-[10px] text-slate-500">Se registra automáticamente</span>
              </button>
            ))}
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
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3 rounded-xl transition-all disabled:opacity-50 text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-black/5 shadow-blue-500/20 group"
          >
            {isSending ? "Enviando Sugerencia..." : "Enviar Sugerencia"}
            <span className="material-icons text-[16px] group-hover:translate-x-1 transition-transform">
              send
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};
