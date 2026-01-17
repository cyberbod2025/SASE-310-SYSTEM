import React, { useEffect, useState } from "react";
import { supabase } from "../../supabase/client";
import { Protocol, ProtocolType } from "../../types";
import { ProtocolCard } from "./ProtocolCard";
import { ProtocolDetailModal } from "./ProtocolDetailModal";
import { toast } from "react-hot-toast";

export const ProtocolsView: React.FC = () => {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(
    null
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
      setProtocols((data as any[]) || []);
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
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-full flex flex-col">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <span className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg">
            <span className="material-symbols-outlined text-white text-2xl">
              local_library
            </span>
          </span>
          Protocolos Institucionales
        </h1>
        <p className="text-gray-400 max-w-2xl text-lg">
          Guías de actuación estandarizadas para situaciones escolares.
          Selecciona un protocolo para ver los pasos operativos.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-6 mb-8 justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
        {/* Type Filter */}
        <div className="flex gap-2 p-1 bg-black/20 rounded-lg overflow-x-auto max-w-full">
          <button
            onClick={() => setFilterType("all")}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all whitespace-nowrap ${
              filterType === "all"
                ? "bg-white text-black shadow-md"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Todos ({stats.all})
          </button>
          <button
            onClick={() => setFilterType("convivencia")}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              filterType === "convivencia"
                ? "bg-red-500 text-white shadow-md"
                : "text-gray-400 hover:text-red-400 hover:bg-white/5"
            }`}
          >
            <span className="size-2 rounded-full bg-red-500" />
            Convivencia ({stats.convivencia})
          </button>
          <button
            onClick={() => setFilterType("salud")}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              filterType === "salud"
                ? "bg-orange-500 text-white shadow-md"
                : "text-gray-400 hover:text-orange-400 hover:bg-white/5"
            }`}
          >
            <span className="size-2 rounded-full bg-orange-500" />
            Salud ({stats.salud})
          </button>
          <button
            onClick={() => setFilterType("proteccion_civil")}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              filterType === "proteccion_civil"
                ? "bg-blue-500 text-white shadow-md"
                : "text-gray-400 hover:text-blue-400 hover:bg-white/5"
            }`}
          >
            <span className="size-2 rounded-full bg-blue-500" />
            Protección Civil ({stats.pc})
          </button>
          <button
            onClick={() => setFilterType("apoyo")}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              filterType === "apoyo"
                ? "bg-purple-600 text-white shadow-md"
                : "text-gray-400 hover:text-purple-400 hover:bg-white/5"
            }`}
          >
            <span className="size-2 rounded-full bg-purple-600" />
            Apoyo ({stats.apoyo})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            search
          </span>
          <input
            type="text"
            placeholder="Buscar situación..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/20 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex-1 flex justify-center items-center">
          <span className="material-symbols-outlined animate-spin text-4xl text-blue-500">
            sync
          </span>
        </div>
      ) : filteredProtocols.length === 0 ? (
        <div className="flex-1 flex flex-col justify-center items-center text-gray-500 opacity-60">
          <span className="material-symbols-outlined text-6xl mb-4">
            find_in_page
          </span>
          <p>No se encontraron protocolos con estos criterios</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
          {filteredProtocols.map((proto) => (
            <ProtocolCard
              key={proto.id}
              protocol={proto}
              onClick={() => setSelectedProtocol(proto)}
            />
          ))}
        </div>
      )}

      {selectedProtocol && (
        <ProtocolDetailModal
          protocol={selectedProtocol}
          onClose={() => setSelectedProtocol(null)}
        />
      )}
    </div>
  );
};
