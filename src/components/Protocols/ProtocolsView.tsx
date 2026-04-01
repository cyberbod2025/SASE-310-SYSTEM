import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../../supabase/client";
import { Protocol, ProtocolType } from "../../types";
import { ProtocolDetailModal } from "./ProtocolDetailModal";
import { toast } from "react-hot-toast";
import { GlassCard } from "../ui/GlassCard";

export const ProtocolsView: React.FC = () => {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(
    null,
  );
  const [filterType, setFilterType] = useState<ProtocolType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchProtocols();
  }, []);

  const fetchProtocols = async () => {
    try {
      const { data, error } = await supabase
        .from("protocolos" as any)
        .select("*")
        .order("titulo");

      if (error) throw error;

      const dbProtocols = (data as any[]) || [];

      // Protocolos Críticos Estáticos (Aseguran cumplimiento normativo incluso sin DB)
      const builtinProtocols: Protocol[] = [
        {
          id: "built-in-asi",
          titulo: "Abuso Sexual Infantil (ASI)",
          tipo: "seguridad",
          objetivo:
            "Protección inmediata, no revictimización y denuncia obligatoria.",
          activacion:
            "Relato del alumno o indicadores físicos/psicológicos detectados.",
          fuente: "Lineamientos SEP 2025",
          roles_responsables: ["Directivo", "Trabajador Social"],
          icono: "shield_person",
        },
        {
          id: "built-in-drogas",
          titulo: "Prevención de Adicciones",
          tipo: "legal",
          objetivo:
            "Contención de riesgos y canalización ante consumo de sustancias.",
          activacion:
            "Sospecha o detección de consumo/posesión de sustancias psicoactivas.",
          fuente: "Estrategia: Si te drogas te dañas",
          roles_responsables: ["Prefectura", "Orientación"],
          icono: "medication",
        },
        {
          id: "built-in-maltrato",
          titulo: "Maltrato Infantil",
          tipo: "seguridad",
          objetivo:
            "Detección y atención de violencia física o emocional doméstica.",
          activacion: "Observación de marcas de violencia o negligencia grave.",
          fuente: "Marco de Convivencia Escolar",
          roles_responsables: ["Docente", "Dirección"],
          icono: "favorite",
        },
        {
          id: "built-in-ciberacoso",
          titulo: "Ciberacoso / Grooming",
          tipo: "seguridad",
          objetivo:
            "Atención a la violencia digital y protección de la identidad.",
          activacion:
            "Evidencia de hostigamiento en redes sociales o mensajería.",
          fuente: "Ley Olimpia y Protocolo SEP",
          roles_responsables: ["Orientación", "Dirección"],
          icono: "devices",
        },
      ];

      // Combinar y evitar duplicados por título
      const combined = [...builtinProtocols];
      dbProtocols.forEach((p) => {
        if (!combined.some((c) => c.titulo === p.titulo)) {
          combined.push(p);
        }
      });

      setProtocols(combined);
    } catch (err) {
      console.error("Error fetching protocols:", err);
      toast.error("Error al cargar protocolos");
    } finally {
      setLoading(false);
    }
  };

  const filteredProtocols = protocols.filter((p) => {
    if (filterType !== "all" && p.tipo !== filterType) return false;
    if (
      searchQuery &&
      !p.titulo.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !p.activacion?.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const stats = {
    all: protocols.length,
    convivencia: protocols.filter((p) => p.tipo === "convivencia").length,
    salud: protocols.filter((p) => p.tipo === "salud").length,
    pc: protocols.filter((p) => p.tipo === "proteccion_civil").length,
    apoyo: protocols.filter((p) => p.tipo === "apoyo").length,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 p-6 lg:p-8 relative z-10 w-full max-w-7xl mx-auto h-full flex flex-col"
    >
      {/* ENCABEZADO */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">
          Protocolos de Actuacion
        </h1>
        <p className="text-slate-400 text-sm">
          Consulta los lineamientos y normativas institucionales.
        </p>
      </div>

      {/* BUSCADOR */}
      <GlassCard className="mb-6 p-4">
        <div className="relative">
          <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">search</span>
          <input
            type="text"
            placeholder="Buscar protocolo..."
            title="Buscar protocolos por titulo o situacion de activacion"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all duration-300"
          />
        </div>
      </GlassCard>

      {/* FILTROS */}
      <GlassCard className="mb-6 p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterType("all")}
            className={`px-4 py-2 rounded-2xl text-sm font-bold transition-all ${
              filterType === "all"
                ? "bg-white text-black shadow-xl shadow-black/5"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
            title="Mostrar todos los protocolos disponibles"
          >
            Todos ({stats.all})
          </button>
          <button
            onClick={() => setFilterType("convivencia")}
            className={`px-4 py-2 rounded-2xl text-sm font-bold transition-all ${
              filterType === "convivencia"
                ? "bg-red-500 text-white shadow-xl shadow-black/5"
                : "text-slate-400 hover:text-red-300 hover:bg-white/5"
            }`}
            title="Filtrar por protocolos de convivencia escolar"
          >
            Convivencia ({stats.convivencia})
          </button>
          <button
            onClick={() => setFilterType("salud")}
            className={`px-4 py-2 rounded-2xl text-sm font-bold transition-all ${
              filterType === "salud"
                ? "bg-orange-500 text-white shadow-xl shadow-black/5"
                : "text-slate-400 hover:text-orange-300 hover:bg-white/5"
            }`}
            title="Filtrar por protocolos de salud y primeros auxilios"
          >
            Salud ({stats.salud})
          </button>
          <button
            onClick={() => setFilterType("proteccion_civil")}
            className={`px-4 py-2 rounded-2xl text-sm font-bold transition-all ${
              filterType === "proteccion_civil"
                ? "bg-blue-500 text-white shadow-xl shadow-black/5"
                : "text-slate-400 hover:text-blue-300 hover:bg-white/5"
            }`}
            title="Filtrar por protocolos de proteccion civil y emergencias"
          >
            Proteccion Civil ({stats.pc})
          </button>
          <button
            onClick={() => setFilterType("apoyo")}
            className={`px-4 py-2 rounded-2xl text-sm font-bold transition-all ${
              filterType === "apoyo"
                ? "bg-purple-600 text-white shadow-xl shadow-black/5"
                : "text-slate-400 hover:text-purple-300 hover:bg-white/5"
            }`}
            title="Filtrar por protocolos de apoyo socioemocional"
          >
            Apoyo ({stats.apoyo})
          </button>
        </div>
      </GlassCard>

      {/* GRID DE PROTOCOLOS */}
      {loading ? (
        <div className="flex-1 flex justify-center items-center">
          <span className="material-symbols-outlined animate-spin text-4xl text-blue-500">
            sync
          </span>
        </div>
      ) : filteredProtocols.length === 0 ? (
        <div className="flex-1 flex flex-col justify-center items-center text-slate-500 opacity-70">
          <span className="material-symbols-outlined text-6xl mb-4">find_in_page</span>
          <p>No se encontraron protocolos con estos criterios</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 content-start">
          {filteredProtocols.map((proto) => (
            <GlassCard key={proto.id} className="flex flex-col justify-between h-full group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4 text-blue-400">
                  <span className="material-icons">{proto.icono || "menu_book"}</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-200 mb-2 group-hover:text-white transition-colors">
                  {proto.titulo}
                </h3>
                <p className="text-sm text-slate-400 line-clamp-3">
                  {proto.objetivo}
                </p>
              </div>
              <div className="mt-6 flex justify-end gap-2 border-t border-white/10 pt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedProtocol(proto)}
                  className="px-4 py-2 rounded-2xl bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors text-sm font-medium"
                >
                  Ver detalle
                </motion.button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {selectedProtocol && (
        <ProtocolDetailModal
          protocol={selectedProtocol}
          onClose={() => setSelectedProtocol(null)}
        />
      )}
    </motion.div>
  );
};
