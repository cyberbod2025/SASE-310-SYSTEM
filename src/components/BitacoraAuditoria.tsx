import React, { useState, useEffect } from "react";
import { supabase } from "../supabase/client";
import { useApp } from "../store";
import toast from "react-hot-toast";

interface AuditEntry {
  id: string;
  user_id: string | null;
  user_email: string | null;
  user_role: string | null;
  action_type: string;
  action_description: string | null;
  target_table: string | null;
  target_record_id: string | null;
  target_student_name: string | null;
  created_at: string;
}

export const BitacoraAuditoria: React.FC = () => {
  const { currentUserRole } = useApp();
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchAuditLog();
  }, []);

  const fetchAuditLog = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        console.error("Error fetching audit log:", error);
      } else {
        setEntries((data as any) || []);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    }
    setLoading(false);
  };

  const filteredEntries =
    filter === "all"
      ? entries
      : entries.filter((e) => e.action_type === filter);

  return (
    <div className="flex-1 w-full space-y-8 animate-fadeIn">
      {/* Header Institucional */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="size-16 backdrop-blur-3xl bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 shadow-lg border border-white/10">
            <span className="material-symbols-outlined text-3xl">policy</span>
          </div>
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight uppercase italic">
              Bitácora de Auditoría
            </h2>
            <p className="text-blue-500/80 font-black text-xs uppercase tracking-[0.3em] mt-1.5 flex items-center gap-2">
              <span className="size-2.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.6)]"></span>
              Seguridad y Monitoreo de Protocolos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAuditLog}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-all font-bold text-xs uppercase tracking-widest shadow-lg active:scale-95"
            title="Sincronizar y actualizar bitácora de auditoría"
          >
            <span className="material-symbols-outlined text-xl">refresh</span>
            Sincronizar
          </button>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            title="Filtrar por tipo de acción"
            className="bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 text-xs font-black text-blue-400 focus:border-blue-500/40 transition-all outline-none uppercase tracking-[0.15em] backdrop-blur-md"
          >
            <option value="all">Todas las Acciones</option>
            <option value="CONSULTA">Consultas</option>
            <option value="ACTUALIZACION">Actualizaciones</option>
            <option value="CREACION">Creaciones</option>
            <option value="ELIMINACION">Eliminaciones</option>
          </select>
        </div>
      </div>

      {/* KPI Cards Estilo Institucional */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          label="Consultas"
          value={entries.filter((e) => e.action_type === "CONSULTA").length}
          icon="visibility"
          color="blue"
        />
        <StatCard
          label="Actualiz."
          value={
            entries.filter((e) => e.action_type === "ACTUALIZACION").length
          }
          icon="edit_note"
          color="amber"
        />
        <StatCard
          label="Creaciones"
          value={entries.filter((e) => e.action_type === "CREACION").length}
          icon="add_circle"
          color="emerald"
        />
        <StatCard
          label="Personal"
          value={new Set(entries.map((e) => e.user_email)).size}
          icon="group"
          color="indigo"
        />
      </div>

      {/* Registro de Auditoría */}
      <div className="bg-[#0b121a]/60 border border-white/10 rounded-[1.5rem] md:rounded-[2rem] shadow-2xl backdrop-blur-3xl overflow-hidden">
        <div className="px-5 md:px-8 py-5 md:py-6 border-b border-white/5 bg-white/[0.02] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-[10px] md:text-xs font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
              <span className="material-symbols-outlined text-blue-500 text-sm md:text-base">
                history
              </span>
              Actividad del Plantel
            </h3>
            <p className="hidden md:block text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1.5">
              Registro inalterable de protocolos digitales
            </p>
          </div>
          <button
            onClick={() => toast.success("Exportando registro oficial...")}
            className="w-full md:w-auto text-[9px] font-black text-blue-400 uppercase tracking-widest flex items-center justify-center gap-3 px-6 py-3 md:py-2.5 bg-blue-500/10 hover:bg-blue-500/20 rounded-xl border border-blue-500/20 transition-all"
            title="Descargar reporte oficial en formato CSV"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            Descargar Reporte CSV
          </button>
        </div>

        {/* --- VISTA MÓVIL: TICKETS DE ACTIVIDAD --- */}
        <div className="md:hidden divide-y divide-white/5">
          {loading ? (
            <div className="p-10 text-center space-y-3">
              <div className="size-8 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                Validando libros...
              </p>
            </div>
          ) : (
            filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="p-5 space-y-4 active:bg-white/5 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="size-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black text-[9px]">
                      {(entry.user_role || "S").charAt(0)}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-white">
                        {entry.user_email?.split("@")[0] || "SISTEMA"}
                      </p>
                      <p className="text-[8px] font-black text-blue-500/60 uppercase tracking-widest">
                        {entry.user_role || "SISTEMA"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-white">
                      {new Date(entry.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-[8px] font-bold text-slate-500 uppercase">
                      {new Date(entry.created_at).toLocaleDateString([], {
                        day: "2-digit",
                        month: "short",
                      })}
                    </p>
                  </div>
                </div>
                <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <ActionBadge type={entry.action_type} />
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed italic">
                    "{entry.action_description}"
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* --- VISTA WEB: TABLA ROBUSTA --- */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.01]">
                <th className="px-8 py-5 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
                  Fecha y Hora
                </th>
                <th className="px-8 py-5 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
                  Personal Responsable
                </th>
                <th className="px-8 py-5 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
                  Operación
                </th>
                <th className="px-8 py-5 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
                  Detalle de Acción
                </th>
                <th className="px-8 py-5 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
                  Afectado / Alumno
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="size-10 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Validando libros de registro...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredEntries.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-8 py-20 text-center text-slate-400"
                  >
                    <span className="material-symbols-outlined text-5xl opacity-20">
                      inventory_2
                    </span>
                    <p className="text-xs font-bold uppercase mt-4">
                      Sin registros para mostrar
                    </p>
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="hover:bg-white/[0.03] transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <span className="text-[11px] font-black text-white block">
                        {new Date(entry.created_at).toLocaleDateString(
                          "es-MX",
                          {
                            day: "2-digit",
                            month: "short",
                          },
                        )}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 block mt-0.5">
                        {new Date(entry.created_at).toLocaleTimeString(
                          "es-MX",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black text-[10px]">
                          {(entry.user_role || "S").charAt(0)}
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-white truncate max-w-[150px]">
                            {entry.user_email || "SISTEMA"}
                          </p>
                          <p className="text-[9px] font-black text-blue-400/60 uppercase tracking-tight mt-0.5">
                            {entry.user_role || "PROCESO AUTO"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <ActionBadge type={entry.action_type} />
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-[11px] text-slate-400 font-medium leading-relaxed max-w-[250px] line-clamp-2">
                        {entry.action_description}
                      </p>
                    </td>
                    <td className="px-8 py-5">
                      {entry.target_student_name ? (
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm text-blue-500/40">
                            person
                          </span>
                          <span className="text-[11px] font-black text-blue-400/80 italic">
                            {entry.target_student_name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-700 text-[10px] font-black uppercase tracking-widest">
                          --
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- Helper Components ---

const StatCard: React.FC<{
  label: string;
  value: number | string;
  icon: string;
  color: string;
}> = ({ label, value, icon, color }) => {
  const colors: any = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  };

  return (
    <div className="bg-[#0b121a]/60 p-6 rounded-[2rem] border border-white/5 shadow-lg backdrop-blur-3xl flex items-center gap-5 hover:border-white/10 transition-all group">
      <div
        className={`size-12 rounded-2xl flex items-center justify-center ${colors[color]} border shadow-lg group-hover:scale-110 transition-transform duration-500`}
      >
        <span className="material-symbols-outlined text-2xl">{icon}</span>
      </div>
      <div>
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
          {label}
        </p>
        <p className="text-2xl font-black text-white tracking-tight">{value}</p>
      </div>
    </div>
  );
};

const ActionBadge: React.FC<{ type: string }> = ({ type }) => {
  const styles: any = {
    CONSULTA: "bg-blue-50 text-blue-700 border-blue-100",
    ACTUALIZACION: "bg-amber-50 text-amber-700 border-amber-100",
    CREACION: "bg-emerald-50 text-emerald-700 border-emerald-100",
    ELIMINACION: "bg-red-50 text-red-700 border-red-100",
  };

  return (
    <span
      className={`px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${
        styles[type] || "bg-slate-50 text-slate-500"
      }`}
    >
      {type}
    </span>
  );
};
