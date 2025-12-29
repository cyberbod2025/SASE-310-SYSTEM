import React, { useState, useEffect } from "react";
import { supabase } from "../supabase/client";
import { useApp } from "../store";

interface AuditEntry {
  id: string;
  user_email: string;
  user_role: string;
  action_type: string;
  action_description: string;
  target_table: string;
  target_record_id: string;
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
        setEntries(data || []);
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

  const getActionBadge = (actionType: string) => {
    switch (actionType) {
      case "CONSULTA":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "ACTUALIZACION":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "CREACION":
        return "bg-green-100 text-green-800 border-green-200";
      case "ELIMINACION":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case "CONSULTA":
        return "visibility";
      case "ACTUALIZACION":
        return "edit";
      case "CREACION":
        return "add_circle";
      case "ELIMINACION":
        return "delete";
      default:
        return "info";
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">
              policy
            </span>
            Bitácora de Auditoría
          </h2>
          <p className="text-gray-400">
            Registro de accesos y modificaciones al sistema
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchAuditLog}
            className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg text-sm font-bold hover:bg-white/10 transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            Actualizar
          </button>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-white/10 rounded-lg text-sm font-bold bg-black/40 text-white focus:outline-none focus:border-primary"
          >
            <option value="all" className="text-black">
              Todas las acciones
            </option>
            <option value="CONSULTA" className="text-black">
              Solo Consultas
            </option>
            <option value="ACTUALIZACION" className="text-black">
              Solo Actualizaciones
            </option>
            <option value="CREACION" className="text-black">
              Solo Creaciones
            </option>
          </select>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-black/20 backdrop-blur-xl p-4 rounded-xl border border-white/10 shadow-sm">
          <div className="flex items-center gap-2 text-blue-400 mb-1">
            <span className="material-symbols-outlined text-lg">
              visibility
            </span>
            <span className="text-xs font-bold uppercase">Consultas</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {entries.filter((e) => e.action_type === "CONSULTA").length}
          </p>
        </div>
        <div className="bg-black/20 backdrop-blur-xl p-4 rounded-xl border border-white/10 shadow-sm">
          <div className="flex items-center gap-2 text-yellow-400 mb-1">
            <span className="material-symbols-outlined text-lg">edit</span>
            <span className="text-xs font-bold uppercase">Actualizaciones</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {entries.filter((e) => e.action_type === "ACTUALIZACION").length}
          </p>
        </div>
        <div className="bg-black/20 backdrop-blur-xl p-4 rounded-xl border border-white/10 shadow-sm">
          <div className="flex items-center gap-2 text-green-400 mb-1">
            <span className="material-symbols-outlined text-lg">
              add_circle
            </span>
            <span className="text-xs font-bold uppercase">Creaciones</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {entries.filter((e) => e.action_type === "CREACION").length}
          </p>
        </div>
        <div className="bg-black/20 backdrop-blur-xl p-4 rounded-xl border border-white/10 shadow-sm">
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <span className="material-symbols-outlined text-lg">people</span>
            <span className="text-xs font-bold uppercase">Usuarios Únicos</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {new Set(entries.map((e) => e.user_email)).size}
          </p>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
          <h3 className="font-bold text-lg text-white">
            Registros ({filteredEntries.length})
          </h3>
          <span className="text-xs text-gray-400">
            Mostrando últimos 100 registros
          </span>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-400">
            Cargando bitácora...
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <span className="material-symbols-outlined text-4xl mb-2">
              policy
            </span>
            <p>No hay registros de auditoría.</p>
            <p className="text-xs mt-2">
              Asegúrese de que la tabla 'audit_log' exista en Supabase.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-gray-400 uppercase text-xs font-bold border-b border-white/10">
                <tr>
                  <th className="px-6 py-3">Fecha/Hora</th>
                  <th className="px-6 py-3">Usuario</th>
                  <th className="px-6 py-3">Rol</th>
                  <th className="px-6 py-3">Acción</th>
                  <th className="px-6 py-3">Descripción</th>
                  <th className="px-6 py-3">Alumno Afectado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredEntries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs font-mono text-gray-300">
                        {new Date(entry.created_at).toLocaleDateString("es-MX")}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        {new Date(entry.created_at).toLocaleTimeString("es-MX")}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="size-6 rounded-full bg-primary/20 text-blue-300 flex items-center justify-center text-[10px] font-bold">
                          {entry.user_email?.substring(0, 2).toUpperCase() ||
                            "??"}
                        </div>
                        <span
                          className="text-xs truncate max-w-[150px] text-gray-300"
                          title={entry.user_email}
                        >
                          {entry.user_email || "Sistema"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-white/10 text-gray-300 text-[10px] font-bold rounded uppercase">
                        {entry.user_role || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 border rounded text-[10px] font-bold flex items-center gap-1 w-fit ${getActionBadge(
                          entry.action_type
                        )} bg-opacity-20 border-opacity-20`}
                      >
                        <span className="material-symbols-outlined text-xs">
                          {getActionIcon(entry.action_type)}
                        </span>
                        {entry.action_type}
                      </span>
                    </td>
                    <td
                      className="px-6 py-4 text-xs text-gray-300 max-w-[200px] truncate"
                      title={entry.action_description}
                    >
                      {entry.action_description}
                    </td>
                    <td className="px-6 py-4">
                      {entry.target_student_name ? (
                        <span className="px-2 py-1 bg-blue-500/10 text-blue-300 text-xs font-medium rounded border border-blue-500/20">
                          {entry.target_student_name}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-600">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
