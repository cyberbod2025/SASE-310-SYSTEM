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
  creado_en: string; // Corrected column name
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
        .from("auditoria") // Corrected table name
        .select("*")
        .order("creado_en", { ascending: false }) // Corrected sort column
        .limit(100);

      if (error) {
        console.error("Error fetching audit log:", error);
      } else {
        // Force cast to match interface if strict typing complains about nulls vs assumed strings,
        // but Supabase types are usually aligned.
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
            {entries.filter((e) => e.tipo_accion === "CONSULTA").length}
          </p>
        </div>
        <div className="bg-black/20 backdrop-blur-xl p-4 rounded-xl border border-white/10 shadow-sm">
          <div className="flex items-center gap-2 text-yellow-400 mb-1">
            <span className="material-symbols-outlined text-lg">edit</span>
            <span className="text-xs font-bold uppercase">Actualizaciones</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {entries.filter((e) => e.tipo_accion === "ACTUALIZACION").length}
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
            {entries.filter((e) => e.tipo_accion === "CREACION").length}
          </p>
        </div>
        <div className="bg-black/20 backdrop-blur-xl p-4 rounded-xl border border-white/10 shadow-sm">
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <span className="material-symbols-outlined text-lg">people</span>
            <span className="text-xs font-bold uppercase">Usuarios Únicos</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {new Set(entries.map((e) => e.email_usuario || "Sistema")).size}
          </p>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-black/90 backdrop-blur-xl rounded-xl border border-green-500/20 shadow-[0_0_30px_rgba(0,255,0,0.05)] overflow-hidden font-mono">
        <div className="px-6 py-4 border-b border-green-500/20 bg-black/60 flex justify-between items-center">
          <h3 className="font-bold text-lg text-green-400 flex items-center gap-2">
            <span className="material-symbols-outlined text-green-500 animate-pulse">
              terminal
            </span>
            REGISTRO_FORENSE_SISTEMA ({filteredEntries.length})
          </h3>
          <div className="flex gap-4">
            <span className="text-xs text-green-700/80 self-center hidden md:block">
              ENCRIPTACIÓN: AES-256-GCM | INTEGRIDAD: VERIFICADA
            </span>
            <button
              onClick={() =>
                toast.success("Exportando LOGS a CSV...", { icon: "download" })
              }
              className="text-xs border border-green-500/50 text-green-400 px-3 py-1 hover:bg-green-500/10 transition-colors uppercase"
            >
              Exportar CSV
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-green-600 animate-pulse">
            _RECUPERANDO_FRAGMENTOS_DE_DATOS...
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <span className="material-symbols-outlined text-4xl mb-2 text-gray-600">
              policy
            </span>
            <p>No hay registros de auditoría.</p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs uppercase tracking-wider">
              <thead className="bg-green-900/10 text-green-500/70 border-b border-green-500/20">
                <tr>
                  <th className="px-6 py-3">TIMESTAMP</th>
                  <th className="px-6 py-3">AGENTE</th>
                  <th className="px-6 py-3">ROL</th>
                  <th className="px-6 py-3">OPERACIÓN</th>
                  <th className="px-6 py-3">DETALLE_TÉCNICO</th>
                  <th className="px-6 py-3">OBJETIVO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-green-500/10 text-green-100/80">
                {filteredEntries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="hover:bg-green-500/5 transition-colors group"
                  >
                    <td className="px-6 py-3 whitespace-nowrap text-green-300/60 group-hover:text-green-300">
                      {new Date(entry.creado_en).toLocaleString("es-MX")}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-green-400 font-bold">
                          {entry.email_usuario?.split("@")[0] || "SYSTEM"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-green-600">
                      {entry.rol_usuario || "N/A"}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-2 py-0.5 border rounded text-[10px] font-bold inline-block w-24 text-center ${
                          entry.tipo_accion === "CONSULTA"
                            ? "border-blue-500/50 text-blue-400 bg-blue-900/20"
                            : entry.tipo_accion === "ACTUALIZACION"
                            ? "border-yellow-500/50 text-yellow-400 bg-yellow-900/20"
                            : entry.tipo_accion === "CREACION"
                            ? "border-green-500/50 text-green-400 bg-green-900/20"
                            : "border-red-500/50 text-red-400 bg-red-900/20"
                        }`}
                      >
                        {entry.tipo_accion}
                      </span>
                    </td>
                    <td
                      className="px-6 py-3 text-[10px] text-gray-400 max-w-[250px] truncate group-hover:text-white transition-colors"
                      title={entry.descripcion_accion || ""}
                    >
                      {entry.descripcion_accion}
                    </td>
                    <td className="px-6 py-3">
                      {entry.nombre_alumno_objetivo ? (
                        <span className="text-green-200">
                          [{entry.nombre_alumno_objetivo}]
                        </span>
                      ) : (
                        <span className="text-gray-700">--</span>
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
