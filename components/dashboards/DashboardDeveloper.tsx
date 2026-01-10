import React, { useEffect, useState } from "react";
import { supabase } from "../../supabase/client";
import { useApp } from "../../store";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { InvitationGenerator } from "../onboarding/InvitationGenerator";

interface FeedbackItem {
  id: number;
  created_at: string;
  type: "bug" | "suggestion" | "ux";
  comment: string;
  email?: string;
  url?: string;
  user_agent?: string;
}

interface AuditItem {
  id: number;
  created_at: string;
  usuario_id: string;
  email_usuario: string;
  tipo_accion: string;
  descripcion_accion: string;
  tabla_objetivo: string;
  rol_usuario: string;
}

export const DashboardDeveloper: React.FC = () => {
  const { currentUserRole } = useApp();
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [auditLog, setAuditLog] = useState<AuditItem[]>([]);
  const [activeTab, setActiveTab] = useState<
    "feedback" | "audit" | "onboarding"
  >("feedback");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    // Fetch Feedback
    const { data: fbData } = await (
      supabase.from("system_feedback" as any) as any
    )
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (fbData) setFeedback(fbData as any);

    // Fetch Audit (Caja Negra)
    const { data: auditData } = await supabase
      .from("auditoria")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (auditData) setAuditLog(auditData as any);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // Real-time subscription could go here
    const channel = supabase
      .channel("dev_dashboard")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "system_feedback" },
        (payload) => {
          setFeedback((prev) => [payload.new as FeedbackItem, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="p-6 min-h-screen bg-gray-900 text-white font-sans">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-yellow-200">
            <span className="material-symbols-outlined align-bottom mr-2 text-3xl text-amber-500">
              admin_panel_settings
            </span>
            Centro de Comando (Modo Dios)
          </h1>
          <p className="text-gray-400 mt-1">
            Supervisión global del sistema SASE-310 y Feedback de Piloto.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
          title="Recargar Datos"
        >
          <span className="material-symbols-outlined">refresh</span>
        </button>
      </header>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-white/10">
        <button
          onClick={() => setActiveTab("feedback")}
          className={`pb-3 px-4 text-sm font-bold transition-all relative ${
            activeTab === "feedback"
              ? "text-amber-400"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          Feedback de Usuarios
          {activeTab === "feedback" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-400 shadow-[0_0_10px_#fbbf24]"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab("audit")}
          className={`pb-3 px-4 text-sm font-bold transition-all relative ${
            activeTab === "audit"
              ? "text-blue-400"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          Caja Negra (Auditoría)
          {activeTab === "audit" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-400 shadow-[0_0_10px_#60a5fa]"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab("onboarding")}
          className={`pb-3 px-4 text-sm font-bold transition-all relative ${
            activeTab === "onboarding"
              ? "text-green-400"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          Material Onboarding
          {activeTab === "onboarding" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-400 shadow-[0_0_10px_#4ade80]"></div>
          )}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in-up">
          {activeTab === "onboarding" && <InvitationGenerator />}

          {activeTab === "feedback" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                  <h3 className="text-gray-400 text-xs uppercase tracking-widest font-bold">
                    Total Feedback
                  </h3>
                  <p className="text-2xl font-bold">{feedback.length}</p>
                </div>
                <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                  <h3 className="text-gray-400 text-xs uppercase tracking-widest font-bold">
                    Bugs Reportados
                  </h3>
                  <p className="text-2xl font-bold text-red-400">
                    {feedback.filter((f) => f.type === "bug").length}
                  </p>
                </div>
                <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                  <h3 className="text-gray-400 text-xs uppercase tracking-widest font-bold">
                    Sugerencias
                  </h3>
                  <p className="text-2xl font-bold text-blue-400">
                    {feedback.filter((f) => f.type !== "bug").length}
                  </p>
                </div>
              </div>

              <div className="bg-black/20 rounded-xl overflow-hidden border border-white/5">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/5 text-gray-300 font-medium">
                    <tr>
                      <th className="p-4">Tipo</th>
                      <th className="p-4">Comentario</th>
                      <th className="p-4">Usuario</th>
                      <th className="p-4">Contexto</th>
                      <th className="p-4">Hace...</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {feedback.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold border ${
                              item.type === "bug"
                                ? "bg-red-500/10 text-red-400 border-red-500/20"
                                : item.type === "ux"
                                ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            }`}
                          >
                            {item.type === "bug"
                              ? "error"
                              : item.type === "ux"
                              ? "brush"
                              : "lightbulb"}
                            <span className="material-symbols-outlined text-[14px]">
                              {item.type === "bug"
                                ? "bug_report"
                                : item.type === "ux"
                                ? "palette"
                                : "lightbulb"}
                            </span>
                            {item.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4 max-w-md">
                          <p className="whitespace-pre-wrap">{item.comment}</p>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="text-white font-medium">
                              {item.email || "Anonimo"}
                            </span>
                            <span className="text-xs text-gray-500">
                              {item.user_agent?.split(")")[0] + ")" ||
                                "Unknown Device"}
                            </span>
                          </div>
                        </td>
                        <td
                          className="p-4 max-w-xs truncate text-gray-400"
                          title={item.url}
                        >
                          {item.url?.replace(window.location.origin, "")}
                        </td>
                        <td className="p-4 text-gray-400 whitespace-nowrap">
                          {formatDistanceToNow(new Date(item.created_at), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </td>
                      </tr>
                    ))}
                    {feedback.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="p-10 text-center text-gray-500"
                        >
                          No hay feedback registrado aún en la base de datos.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === "audit" && (
            <div className="bg-black/20 rounded-xl overflow-hidden border border-white/5">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-gray-300 font-medium">
                  <tr>
                    <th className="p-4">Acción</th>
                    <th className="p-4">Descripción</th>
                    <th className="p-4">Usuario</th>
                    <th className="p-4">Rol</th>
                    <th className="p-4">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {auditLog.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-white/5 transition-colors font-mono text-xs"
                    >
                      <td className="p-4">
                        <span
                          className={`font-bold ${
                            log.tipo_accion === "ELIMINACION"
                              ? "text-red-400"
                              : log.tipo_accion === "CREACION"
                              ? "text-green-400"
                              : "text-blue-400"
                          }`}
                        >
                          {log.tipo_accion}
                        </span>
                      </td>
                      <td className="p-4 text-gray-300">
                        {log.descripcion_accion}
                      </td>
                      <td className="p-4 text-gray-400">{log.email_usuario}</td>
                      <td className="p-4 text-gray-500">{log.rol_usuario}</td>
                      <td className="p-4 text-gray-500">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
