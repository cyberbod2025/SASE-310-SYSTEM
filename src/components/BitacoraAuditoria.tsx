import React, { useState, useEffect } from "react";
import { supabase } from "../supabase/client";
import toast from "react-hot-toast";
import { GlassCard } from "./ui/GlassCard";
import { GlassButton } from "./ui/GlassButton";
import { GlassSelect } from "./ui/GlassSelect";

interface AuditEntry {
  id: string;
  usuario_id: string | null;
  email_usuario: string | null;
  rol_usuario: string | null;
  tipo_accion: string;
  descripcion_accion: string | null;
  tabla_objetivo: string | null;
  id_registro_objetivo: string | null;
  fecha?: string | null;
  creado_en?: string | null;
}

export const BitacoraAuditoria: React.FC = () => {
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
        .from("auditoria")
        .select("*")
        .order("fecha", { ascending: false })
        .limit(100);

      if (!error) {
        setEntries((data as any) || []);
      }
    } catch (err) {
      console.error("Error institucional crítico:", err);
    }
    setLoading(false);
  };

  const filteredEntries = filter === "all"
    ? entries
    : entries.filter((e) => e.tipo_accion === filter);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 min-h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Bitácora de Auditoría</h1>
          <p className="text-slate-300 font-medium tracking-tight">Registro inmutable de acciones y protocolos del sistema SASE-310.</p>
        </div>
        <div className="flex gap-4">
           <GlassButton variant="outline" onClick={fetchAuditLog} loading={loading}>
              <span className="material-icons mr-2 text-sm">sync</span>
              Sincronizar
           </GlassButton>
            <GlassSelect
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="h-[46px] w-64"
              options={[
                { value: "all", label: "Todas las Acciones" },
                { value: "CONSULTA", label: "Consultas" },
                { value: "ACTUALIZACION", label: "Actualizaciones" },
                { value: "CREACION", label: "Creaciones" },
                { value: "ELIMINACION", label: "Eliminaciones" }
              ]}
            />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Consultas" value={entries.filter((e) => e.tipo_accion === "CONSULTA").length} icon="visibility" color="blue" />
        <StatCard label="Actualizaciones" value={entries.filter((e) => e.tipo_accion === "ACTUALIZACION").length} icon="edit_note" color="orange" />
        <StatCard label="Creaciones" value={entries.filter((e) => e.tipo_accion === "CREACION").length} icon="add_circle" color="emerald" />
        <StatCard label="Usuarios Activos" value={new Set(entries.map((e) => e.email_usuario)).size} icon="group" color="slate" />
      </div>

      {/* Table Section */}
      <GlassCard className="flex-1 flex flex-col overflow-hidden border-white/10 !bg-white/5">
        <div className="bg-white/5 px-8 py-5 border-b border-white/10 flex justify-between items-center">
           <div className="flex items-center gap-3">
              <span className="material-icons text-slate-400">history</span>
              <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest">Actividad del Plantel</h3>
           </div>
           <button onClick={() => toast.success("Iniciando exportación oficial...")}>
              <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest hover:text-blue-200 transition-colors">Exportar CSV</span>
           </button>
        </div>

        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5">
                <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-white/10">Fecha/Hora</th>
                <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-white/10">Personal Responsable</th>
                <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-white/10">Acción</th>
                <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-white/10">Descripción Operativa</th>
                <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-white/10">Identificador Alumno</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-4 border-white/10 border-t-blue-400 rounded-full animate-spin"></div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Autenticando libros de auditoría...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredEntries.length === 0 ? (
                <tr>
                   <td colSpan={5} className="py-20 text-center">
                      <p className="text-slate-300 font-bold uppercase tracking-widest text-xs">No se encontraron registros en el periodo actual.</p>
                   </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => {
                  const timestamp = entry.fecha || entry.creado_en || new Date().toISOString();
                  return (
                  <tr key={entry.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-8 py-5">
                       <div className="flex flex-col">
                           <span className="text-[11px] font-extrabold text-slate-100">{new Date(timestamp).toLocaleDateString("es-MX", { day: '2-digit', month: 'short', year: '2-digit' })}</span>
                          <span className="text-[9px] font-black text-slate-400 uppercase">{new Date(timestamp).toLocaleTimeString("es-MX", { hour: '2-digit', minute: '2-digit' })}</span>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center text-slate-300 font-black text-[10px]">
                             {(entry.rol_usuario || "S").charAt(0).toUpperCase()}
                          </div>
                          <div>
                             <p className="text-[11px] font-black text-slate-100 leading-none">{entry.email_usuario || "SISTEMA"}</p>
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">{entry.rol_usuario || "AUTOMÁTICO"}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                       <ActionBadge type={entry.tipo_accion} />
                    </td>
                    <td className="px-8 py-5">
                       <p className="text-[11px] text-slate-300 font-medium leading-relaxed max-w-[300px]">{entry.descripcion_accion}</p>
                    </td>
                    <td className="px-8 py-5">
                       {entry.id_registro_objetivo ? (
                           <div className="flex items-center gap-2 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-400/20 w-fit">
                              <span className="material-icons text-[14px] text-blue-300">person</span>
                              <span className="text-[9px] font-black text-blue-200 uppercase">{entry.id_registro_objetivo}</span>
                          </div>
                        ) : <span className="text-slate-200">--</span>}
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};

const StatCard: React.FC<{ label: string, value: number, icon: string, color: string }> = ({ label, value, icon, color }) => {
  const colorStyles: any = {
    blue: "text-blue-300 bg-blue-500/10 border-blue-400/20",
    orange: "text-orange-300 bg-orange-500/10 border-orange-400/20",
    emerald: "text-emerald-300 bg-emerald-500/10 border-emerald-400/20",
    slate: "text-slate-300 bg-white/5 border-white/10"
  };

  return (
    <GlassCard className="p-6 border-white/10 !bg-white/5 flex items-center gap-5">
       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${colorStyles[color]}`}>
          <span className="material-icons text-2xl">{icon}</span>
       </div>
       <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-3xl font-black text-white leading-none">{value}</p>
       </div>
    </GlassCard>
  );
};

const ActionBadge: React.FC<{ type: string }> = ({ type }) => {
  const styles: any = {
    CONSULTA: "bg-blue-500/10 text-blue-200 border-blue-400/20",
    ACTUALIZACION: "bg-amber-500/10 text-amber-200 border-amber-400/20",
    CREACION: "bg-emerald-500/10 text-emerald-200 border-emerald-400/20",
    ELIMINACION: "bg-red-500/10 text-red-200 border-red-400/20",
  };
  return (
    <span className={`px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${styles[type] || "bg-white/5 text-slate-300 border-white/10"}`}>
      {type}
    </span>
  );
};
