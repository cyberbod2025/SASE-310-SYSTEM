import React, { useEffect, useState } from "react";
import { supabase } from "../../supabase/client";
import { useApp } from "../../store";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { InvitationGenerator } from "../onboarding/InvitationGenerator";
import { seedDatabase } from "../../utils/seedData";
import toast from "react-hot-toast";

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
    const { data: fbData } = await (
      supabase.from("system_feedback" as any) as any
    )
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (fbData) setFeedback(fbData as any);

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
    <div className="flex-1 w-full space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-5">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1 h-full bg-slate-800"></div>
            <span className="material-symbols-outlined text-4xl text-slate-700">
              settings_applications
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              Panel de Control Técnico
            </h1>
            <div className="flex items-center gap-3 mt-1 text-xs font-bold uppercase tracking-widest text-slate-500">
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="w-2 h-2 bg-slate-500 rounded-full"></span>
                Administración Global
              </span>
              <span className="text-slate-300">|</span>
              <span>Supervisión de Sistema (SASE-310)</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={async () => {
              if (
                !confirm(
                  "¿Desea sincronizar el ambiente con datos de demostración?"
                )
              )
                return;
              const loadingToast = toast.loading("Poblando Base de Datos...");
              const { success, errors } = await seedDatabase();
              toast.dismiss(loadingToast);
              if (errors.length === 0) {
                toast.success("Sincronización de Base de Datos Exitosa");
                fetchData();
              } else {
                toast.error(`Errores detectados. Revisa la consola técnica.`);
              }
            }}
            className="flex items-center gap-2 px-6 py-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
            title="Sincronizar Datos Base"
          >
            <span className="material-symbols-outlined text-[18px]">
              database
            </span>
            Sync Ambiente
          </button>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-600 uppercase tracking-widest shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">
              refresh
            </span>
            Actualizar
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1.5 rounded-2xl w-fit">
        {[
          {
            id: "feedback",
            label: "Retroalimentación",
            icon: "forum",
            color: "text-amber-700",
          },
          {
            id: "audit",
            label: "Bitácora de Auditoría",
            icon: "security",
            color: "text-blue-700",
          },
          {
            id: "onboarding",
            label: "Cuentas Institucionales",
            icon: "badge",
            color: "text-emerald-700",
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id
                ? `bg-white text-slate-800 shadow-sm ${tab.color}`
                : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {tab.icon}
            </span>
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Cargando Datos Técnicos
          </p>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
          {activeTab === "onboarding" && <InvitationGenerator />}

          {activeTab === "feedback" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatCard
                  label="Feedback Total"
                  value={feedback.length}
                  icon="chat"
                  color="bg-slate-50 text-slate-800"
                />
                <StatCard
                  label="Reportes de Falla"
                  value={feedback.filter((f) => f.type === "bug").length}
                  icon="bug_report"
                  color="bg-red-50 text-red-700"
                />
                <StatCard
                  label="Mejoras Sugeridas"
                  value={feedback.filter((f) => f.type !== "bug").length}
                  icon="tips_and_updates"
                  color="bg-blue-50 text-blue-700"
                />
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden min-h-[400px]">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Incidencia
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Comentario
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Usuario Emisor
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Ubicación
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">
                        Tiempo
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {feedback.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/50 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border uppercase ${
                              item.type === "bug"
                                ? "bg-red-50 text-red-700 border-red-100"
                                : item.type === "ux"
                                ? "bg-purple-50 text-purple-700 border-purple-100"
                                : "bg-blue-50 text-blue-700 border-blue-100"
                            }`}
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              {item.type === "bug"
                                ? "bug_report"
                                : item.type === "ux"
                                ? "palette"
                                : "lightbulb"}
                            </span>
                            {item.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs">
                          <p className="font-bold text-slate-700 italic max-w-md">
                            {item.comment}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-slate-800 uppercase italic">
                              {item.email || "Usuario Invitado"}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase truncate max-w-[200px]">
                              {item.user_agent?.split(")")[0] + ")"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                          {item.url?.replace(window.location.origin, "")}
                        </td>
                        <td className="px-6 py-4 text-right text-[10px] font-black text-slate-500 uppercase tabular-nums">
                          {formatDistanceToNow(new Date(item.created_at), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {feedback.length === 0 && <EmptyTableMessage />}
              </div>
            </>
          )}

          {activeTab === "audit" && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Acción
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Descripción Técnica
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Usuario
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Rol SASE
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">
                      Sello de Tiempo
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLog.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/50 transition-colors group text-[11px] font-bold"
                    >
                      <td className="px-6 py-4">
                        <span
                          className={`font-black uppercase italic ${
                            log.tipo_accion === "ELIMINACION"
                              ? "text-red-700"
                              : log.tipo_accion === "CREACION"
                              ? "text-emerald-700"
                              : "text-blue-700"
                          }`}
                        >
                          {log.tipo_accion}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 italic">
                        {log.descripcion_accion}
                      </td>
                      <td className="px-6 py-4 text-slate-500 lowercase">
                        {log.email_usuario}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                          {log.rol_usuario}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-slate-400 font-mono text-[10px]">
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

const StatCard = ({ label, value, icon, color }: any) => (
  <div
    className={`p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between ${color}`}
  >
    <div className="flex flex-col">
      <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">
        {label}
      </span>
      <span className="text-3xl font-black tabular-nums">{value}</span>
    </div>
    <span className="material-symbols-outlined text-4xl opacity-20">
      {icon}
    </span>
  </div>
);

const EmptyTableMessage = () => (
  <div className="p-20 text-center">
    <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">
      database_off
    </span>
    <p className="text-slate-400 font-black uppercase text-xs tracking-widest italic">
      Registros no encontrados
    </p>
  </div>
);
