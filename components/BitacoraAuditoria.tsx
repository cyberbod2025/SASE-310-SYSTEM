import React, { useState, useEffect } from "react";
import { supabase } from "../supabase/client";
import { useApp } from "../store";
import toast from "react-hot-toast";

interface AuditEntry {
  id: string;
  usuario_id: string | null;
  email_usuario: string | null;
  rol_usuario: string | null;
  tipo_accion: string;
  descripcion_accion: string | null;
  tabla_objetivo: string | null;
  id_registro_objetivo: string | null;
  nombre_alumno_objetivo: string | null;
  creado_en: string;
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
        .from("auditoria")
        .select("*")
        .order("creado_en", { ascending: false })
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
      : entries.filter((e) => e.tipo_accion === filter);

  return (
    <div className="flex-1 w-full space-y-8 animate-fadeIn">
      {/* Header Institucional */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="size-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-700 shadow-sm border border-blue-200/50">
            <span className="material-symbols-outlined text-3xl">policy</span>
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase italic">
              Bitácora <span className="text-blue-700">Institucional</span>
            </h1>
            <p className="text-emerald-700 font-black text-xs uppercase tracking-widest mt-1.5 flex items-center gap-2">
              <span className="size-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              Seguridad y Auditoría del Sistema
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAuditLog}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all font-bold text-sm shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-xl">refresh</span>
            Sincronizar
          </button>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-slate-100 border-none rounded-xl px-4 py-3 text-sm font-black text-slate-700 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none uppercase tracking-wider"
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          label="Consultas"
          value={entries.filter((e) => e.tipo_accion === "CONSULTA").length}
          icon="visibility"
          color="blue"
        />
        <StatCard
          label="Actualizaciones"
          value={
            entries.filter((e) => e.tipo_accion === "ACTUALIZACION").length
          }
          icon="edit_note"
          color="amber"
        />
        <StatCard
          label="Creaciones"
          value={entries.filter((e) => e.tipo_accion === "CREACION").length}
          icon="add_circle"
          color="emerald"
        />
        <StatCard
          label="Personal Activo"
          value={new Set(entries.map((e) => e.email_usuario)).size}
          icon="group"
          color="indigo"
        />
      </div>

      {/* Tabla Institucional de Auditoría */}
      <div className="bg-white border border-slate-200 rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">
                history
              </span>
              Historial de Actividad del Plantel
            </h3>
            <p className="text-xs text-slate-500 font-black uppercase tracking-widest mt-1.5">
              Registro inalterable de protocolos digitales
            </p>
          </div>
          <button
            onClick={() => toast.success("Exportando registro oficial...")}
            className="text-[10px] font-black text-blue-700 uppercase tracking-widest flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            Descargar Reporte CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">
                  Fecha y Hora
                </th>
                <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">
                  Personal Responsable
                </th>
                <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">
                  Operación
                </th>
                <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">
                  Detalle de Acción
                </th>
                <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">
                  Afectado / Alumno
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
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
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <span className="text-xs font-black text-slate-600 block">
                        {new Date(entry.creado_en).toLocaleDateString("es-MX", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </span>
                      <span className="text-xs font-bold text-slate-400 block mt-0.5">
                        {new Date(entry.creado_en).toLocaleTimeString("es-MX", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-black text-[10px]">
                          {(entry.rol_usuario || "S").charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-800 truncate max-w-[150px]">
                            {entry.email_usuario || "SISTEMA"}
                          </p>
                          <p className="text-[10px] font-black text-blue-700 uppercase tracking-tight mt-0.5">
                            {entry.rol_usuario || "PROCESO AUTO"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <ActionBadge type={entry.tipo_accion} />
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-[250px] line-clamp-2">
                        {entry.descripcion_accion}
                      </p>
                    </td>
                    <td className="px-8 py-5">
                      {entry.nombre_alumno_objetivo ? (
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm text-slate-300">
                            person
                          </span>
                          <span className="text-xs font-bold text-slate-700 italic">
                            {entry.nombre_alumno_objetivo}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-300 text-[10px] font-black uppercase">
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
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
  };

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-all">
      <div
        className={`size-12 rounded-2xl flex items-center justify-center ${colors[color]} border shadow-sm`}
      >
        <span className="material-symbols-outlined text-2xl">{icon}</span>
      </div>
      <div>
        <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
          {label}
        </p>
        <p className="text-2xl font-black text-slate-800 tracking-tight">
          {value}
        </p>
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
