import React, { useState, useEffect } from "react";
import { supabase } from "../supabase/client";
import { useApp } from "../store";
import toast from "react-hot-toast";
import { GlassCard } from "./ui/GlassCard";
import { GlassButton } from "./ui/GlassButton";
import { GlassSelect } from "./ui/GlassSelect";
import { motion, AnimatePresence } from "framer-motion";

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

      if (!error) {
        setEntries((data as any) || []);
      }
    } catch (err) {
      console.error("Error institucional crítico:", err);
    }
    setLoading(false);
  };

  const filteredEntries = filter === "all" ? entries : entries.filter((e) => e.action_type === filter);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 min-h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-800 mb-2 tracking-tight">Bitácora de Auditoría</h1>
          <p className="text-slate-500 font-medium tracking-tight">Registro inmutable de acciones y protocolos del sistema SASE-310.</p>
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
        <StatCard label="Consultas" value={entries.filter((e) => e.action_type === "CONSULTA").length} icon="visibility" color="blue" />
        <StatCard label="Actualizaciones" value={entries.filter((e) => e.action_type === "ACTUALIZACION").length} icon="edit_note" color="orange" />
        <StatCard label="Creaciones" value={entries.filter((e) => e.action_type === "CREACION").length} icon="add_circle" color="emerald" />
        <StatCard label="Usuarios Activos" value={new Set(entries.map((e) => e.user_email)).size} icon="group" color="slate" />
      </div>

      {/* Table Section */}
      <GlassCard className="flex-1 flex flex-col overflow-hidden border border-slate-200">
        <div className="bg-slate-50/50 px-8 py-5 border-b border-slate-100 flex justify-between items-center">
           <div className="flex items-center gap-3">
              <span className="material-icons text-slate-400">history</span>
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Actividad del Plantel</h3>
           </div>
           <button onClick={() => toast.success("Iniciando exportación oficial...")}>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors">Exportar CSV</span>
           </button>
        </div>

        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/20">
                <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Fecha/Hora</th>
                <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Personal Responsable</th>
                <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Acción</th>
                <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Descripción Operativa</th>
                <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Identificador Alumno</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                       <div className="w-10 h-10 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
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
                filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5">
                       <div className="flex flex-col">
                          <span className="text-[11px] font-extrabold text-slate-700">{new Date(entry.created_at).toLocaleDateString("es-MX", { day: '2-digit', month: 'short', year: '2-digit' })}</span>
                          <span className="text-[9px] font-black text-slate-400 uppercase">{new Date(entry.created_at).toLocaleTimeString("es-MX", { hour: '2-digit', minute: '2-digit' })}</span>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 font-black text-[10px]">
                             {(entry.user_role || "S").charAt(0).toUpperCase()}
                          </div>
                          <div>
                             <p className="text-[11px] font-black text-slate-800 leading-none">{entry.user_email || "SISTEMA"}</p>
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">{entry.user_role || "AUTOMÁTICO"}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                       <ActionBadge type={entry.action_type} />
                    </td>
                    <td className="px-8 py-5">
                       <p className="text-[11px] text-slate-500 font-medium leading-relaxed max-w-[300px]">{entry.action_description}</p>
                    </td>
                    <td className="px-8 py-5">
                       {entry.target_student_name ? (
                          <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 w-fit">
                             <span className="material-icons text-[14px] text-blue-600">person</span>
                             <span className="text-[9px] font-black text-blue-700 uppercase">{entry.target_student_name}</span>
                          </div>
                       ) : <span className="text-slate-200">--</span>}
                    </td>
                  </tr>
                ))
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
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    orange: "text-orange-600 bg-orange-50 border-orange-100",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    slate: "text-slate-600 bg-slate-50 border-slate-100"
  };

  return (
    <GlassCard className="p-6 border border-slate-200 flex items-center gap-5">
       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${colorStyles[color]}`}>
          <span className="material-icons text-2xl">{icon}</span>
       </div>
       <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-3xl font-black text-slate-800 leading-none">{value}</p>
       </div>
    </GlassCard>
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
    <span className={`px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${styles[type] || "bg-slate-50 text-slate-500 border-slate-200"}`}>
      {type}
    </span>
  );
};
