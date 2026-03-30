import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../store";
import { 
  EstadoObjetoRetenido,
  ObjetoRetenido 
} from "../types";
import toast from "react-hot-toast";
import { GlassCard } from "./ui/GlassCard";

export const ObjetosRetenidos: React.FC = () => {
  const { 
    students, 
    addObjetoRetenido, 
    registrarDevolucion,
  } = useApp();

  const [isRegistering, setIsRegistering] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const [selectedObj, setSelectedObj] = useState<ObjetoRetenido | null>(null);

  // Estados para Registro
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [objeto, setObjeto] = useState("");
  const [motivo, setMotivo] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [categoria, setCategoria] = useState("Electrónico");
  const [lugarRetencion, setLugarRetencion] = useState("Caja de Seguridad Prefectura");
  const [observaciones, setObservaciones] = useState("");

  // Estados para Devolución
  const [tipoEntrega, setTipoEntrega] = useState<"alumno" | "padre_tutor">("alumno");
  const [nombreReceptor, setNombreReceptor] = useState("");
  const [observacionesEntrega, setObservacionesEntrega] = useState("");
  const [nuevoEstado, setNuevoEstado] = useState<EstadoObjetoRetenido>(EstadoObjetoRetenido.DEVUELTO_ALUMNO);
  const [fechaDevolucion, setFechaDevolucion] = useState(new Date().toISOString().split("T")[0]);

  // Obtener todos los objetos retenidos de todos los alumnos
  const allObjetos = useMemo(() => {
    return students.flatMap((s: any) => s.objetosRetenidos || []);
  }, [students]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !objeto || !motivo) {
      toast.error("Por favor completa todos los campos");
      return;
    }
    await addObjetoRetenido(selectedStudentId, objeto, motivo, fecha, categoria, lugarRetencion, observaciones);
    setIsRegistering(false);
    resetForm();
  };

  const handleDevolucion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedObj) {
      toast.error("Seleccione un objeto para devolución");
      return;
    }
    if (tipoEntrega === "padre_tutor" && !nombreReceptor.trim()) {
      toast.error("Indique el nombre de quien recibe");
      return;
    }
    const receptor = tipoEntrega === "alumno"
      ? `Alumno: ${selectedObj.studentName || "Alumno"}`
      : `Padre/Madre/Tutor: ${nombreReceptor.trim()}`;
    const notaEntrega = observacionesEntrega.trim();
    const observacionesFinal = selectedObj.observaciones
      ? `${selectedObj.observaciones}\n${notaEntrega ? `Entrega: ${notaEntrega}` : "Entrega registrada"}`
      : (notaEntrega ? `Entrega: ${notaEntrega}` : "Entrega registrada");
    const fechaIso = fechaDevolucion
      ? new Date(`${fechaDevolucion}T12:00:00`).toISOString()
      : new Date().toISOString();
    await registrarDevolucion(selectedObj.id, receptor, observacionesFinal, nuevoEstado, fechaIso);
    setIsReturning(false);
    setSelectedObj(null);
    setTipoEntrega("alumno");
    setNombreReceptor("");
    setObservacionesEntrega("");
    setFechaDevolucion(new Date().toISOString().split("T")[0]);
  };

  const resetForm = () => {
    setObjeto("");
    setMotivo("");
    setSelectedStudentId("");
    setObservaciones("");
  };

  const getStatusColor = (estado: EstadoObjetoRetenido) => {
    switch (estado) {
      case EstadoObjetoRetenido.RETENIDO: return "text-amber-500 border-amber-500/40 bg-amber-500/5";
      case EstadoObjetoRetenido.DEVUELTO_ALUMNO: return "text-emerald-500 border-emerald-500/40 bg-emerald-500/5";
      case EstadoObjetoRetenido.ENTREGADO_PADRE: return "text-indigo-500 border-indigo-500/40 bg-indigo-500/5";
      default: return "text-slate-500 border-slate-500/40 bg-slate-500/5";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 p-6 lg:p-8 relative z-10 w-full max-w-6xl mx-auto h-full flex flex-col"
    >
      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">Objetos Retenidos</h1>
          <p className="text-slate-400 text-sm">Control y resguardo de articulos en prefectura.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsRegistering(true)}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-blue-600/20 border border-blue-500/50 text-blue-400 hover:bg-blue-500/30 transition-colors shadow-[0_0_15px_rgba(59,130,246,0.2)] font-medium text-sm"
        >
          <span className="material-icons text-sm">add_circle</span>
          Registrar Objeto
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto custom-scrollbar pb-10 pr-2">
        {allObjetos.length === 0 ? (
          <GlassCard className="p-8 text-center text-slate-500 md:col-span-2 lg:col-span-3">
            No hay objetos retenidos registrados.
          </GlassCard>
        ) : (
          [...allObjetos]
            .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
            .map((obj: ObjetoRetenido, idx: number) => (
              <GlassCard key={obj.id} className="relative group p-5 flex flex-col justify-between">
                <div
                  className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-md ${getStatusColor(obj.estado)}`}
                >
                  {obj.estado}
                </div>

                <div className="mt-2 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4 text-slate-300">
                    <span className="material-icons">inventory_2</span>
                  </div>
                  <h3 className="text-lg font-medium text-white mb-1">{obj.objeto}</h3>
                  <p className="text-sm text-slate-400 mb-2">Retenido a: {obj.studentName || "Sin registro"}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <span className="material-icons text-[14px]">event</span>
                    {new Date(obj.fecha).toLocaleDateString()}
                  </p>
                </div>

                <div className="border-t border-white/10 pt-4 flex justify-end gap-2">
                  {obj.estado === EstadoObjetoRetenido.RETENIDO ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedObj(obj);
                        setIsReturning(true);
                        setTipoEntrega("alumno");
                        setNombreReceptor("");
                        setObservacionesEntrega("");
                        setFechaDevolucion(new Date().toISOString().split("T")[0]);
                      }}
                      className="px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors text-sm font-medium"
                    >
                      Devolver
                    </motion.button>
                  ) : (
                    <div className="text-right text-xs text-slate-400">
                      Entregado a: {obj.entregadoA || "N/A"}
                    </div>
                  )}
                </div>
              </GlassCard>
            ))
        )}
      </div>

      {/* MODAL DE REGISTRO */}
      <AnimatePresence>
        {isRegistering && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#020408]/90 backdrop-blur-md"
              onClick={() => setIsRegistering(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="relative w-full max-w-xl card-sase bg-[#0a0f18]/95 border-amber-500/30 p-10 shadow-[0_0_100px_rgba(245,158,11,0.15)] overflow-hidden"
            >
              {/* Scan effect in modal */}
              <motion.div 
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute left-0 w-full h-[1px] bg-amber-500/20 z-0"
              />

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-10 border-b border-white/5 pb-6">
                  <div className="size-14 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                    <span className="material-symbols-outlined text-3xl">add_circle</span>
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">
                      NUEVA <span className="text-amber-500">RETENCIÓN</span>
                    </h2>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1 italic">PROTOCOLO_MARCO_CONVIVENCIA</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">person</span>
                        ALUMNO / MATRÍCULA
                      </label>
                      <select 
                        required
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-sm font-bold text-white focus:border-amber-500/50 outline-none transition-all appearance-none cursor-pointer hover:bg-white/[0.05]"
                        value={selectedStudentId}
                        onChange={(e) => setSelectedStudentId(e.target.value)}
                      >
                        <option value="" className="bg-[#0a0f18] text-slate-500">SELECCIONAR SUJETO...</option>
                        {students.slice().sort((a:any, b:any) => a.name.localeCompare(b.name)).map((s: any) => (
                          <option key={s.id} value={s.id} className="bg-[#0a0f18] text-white">
                            {s.name} ({s.group})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">event</span>
                        FECHA_EJECUCIÓN
                      </label>
                      <input 
                        type="date"
                        required
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-sm font-bold font-mono text-amber-500 focus:border-amber-500/50 outline-none transition-all hover:bg-white/[0.05]"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">category</span>
                      OBJETO_IDENTIFICADO
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="EJ: SMARTPHONE, ACCESORIO NO PERMITIDO, ETC..."
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-sm font-bold text-white focus:border-amber-500/50 outline-none transition-all placeholder:text-slate-700 hover:bg-white/[0.05]"
                      value={objeto}
                      onChange={(e) => setObjeto(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">category</span>
                        CATEGORÍA
                      </label>
                      <select 
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-sm font-bold text-white focus:border-amber-500/50 outline-none transition-all appearance-none cursor-pointer"
                        value={categoria}
                        onChange={(e) => setCategoria(e.target.value)}
                      >
                        <option value="Electrónico" className="bg-[#0a0f18]">Electrónico</option>
                        <option value="Juguete/Distractor" className="bg-[#0a0f18]">Juguete/Distractor</option>
                        <option value="Prenda/Accesorio" className="bg-[#0a0f18]">Prenda/Accesorio</option>
                        <option value="Material Peligroso" className="bg-[#0a0f18]">Material Peligroso</option>
                        <option value="Otro" className="bg-[#0a0f18]">Otro</option>
                      </select>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        LUGAR DE RESGUARDO
                      </label>
                      <input 
                        type="text" 
                        placeholder="Ej: Caja fuerte, Gaveta 3..."
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-sm font-bold text-white focus:border-amber-500/50 outline-none transition-all"
                        value={lugarRetencion}
                        onChange={(e) => setLugarRetencion(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">description</span>
                      MOTIVO DE RETENCIÓN
                    </label>
                    <textarea 
                      required
                      rows={3}
                      placeholder="DESCRIBA EL MOTIVO DE LA RETENCIÓN..."
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-sm font-bold text-white focus:border-amber-500/50 outline-none transition-all placeholder:text-slate-700 resize-none hover:bg-white/[0.05]"
                      value={motivo}
                      onChange={(e) => setMotivo(e.target.value)}
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">note_alt</span>
                      OBSERVACIONES
                    </label>
                    <textarea 
                      rows={3}
                      placeholder="CONDICIONES DEL OBJETO, DETALLES ADICIONALES..."
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-sm font-bold text-white focus:border-amber-500/50 outline-none transition-all placeholder:text-slate-700 resize-none hover:bg-white/[0.05]"
                      value={observaciones}
                      onChange={(e) => setObservaciones(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-4 pt-6">
                    <button 
                      type="button"
                      onClick={() => setIsRegistering(false)}
                      className="flex-1 py-4 border border-white/10 text-slate-500 font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl hover:bg-white/5 transition-all active:scale-95"
                    >
                      ABORTAR
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 py-4 bg-amber-500 text-black font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl hover:bg-amber-400 transition-all shadow-[0_0_30px_rgba(245,158,11,0.2)] active:scale-95"
                    >
                      CONFIRMAR_REGISTRO
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL DE DEVOLUCIÓN */}
      <AnimatePresence>
        {isReturning && selectedObj && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#020408]/90 backdrop-blur-md"
              onClick={() => setIsReturning(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="relative w-full max-w-xl card-sase bg-[#0a0f18]/95 border-emerald-500/30 p-10 shadow-[0_0_100px_rgba(16,185,129,0.15)] overflow-hidden"
            >
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-10 border-b border-white/5 pb-6">
                  <div className="size-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500">
                    <span className="material-symbols-outlined text-3xl">assignment_return</span>
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">
                      REGISTRAR <span className="text-emerald-500">DEVOLUCIÓN</span>
                    </h2>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1">OBJETO: {selectedObj.objeto}</p>
                  </div>
                </div>

                <form onSubmit={handleDevolucion} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">handshake</span>
                        ENTREGADO A
                      </label>
                      <select 
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-sm font-bold text-white focus:border-emerald-500/50 outline-none transition-all appearance-none cursor-pointer"
                        value={tipoEntrega}
                        onChange={(e) => {
                          const value = e.target.value as "alumno" | "padre_tutor";
                          setTipoEntrega(value);
                          setNuevoEstado(
                            value === "alumno"
                              ? EstadoObjetoRetenido.DEVUELTO_ALUMNO
                              : EstadoObjetoRetenido.ENTREGADO_PADRE
                          );
                        }}
                      >
                        <option value="alumno" className="bg-[#0a0f18] uppercase">Alumno</option>
                        <option value="padre_tutor" className="bg-[#0a0f18] uppercase">Padre/Madre/Tutor</option>
                      </select>
                    </div>
                  </div>

                  {tipoEntrega === "padre_tutor" && (
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">person</span>
                        NOMBRE DE QUIEN RECIBE
                      </label>
                      <input 
                        type="text" 
                        required
                        placeholder="Nombre completo..."
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-sm font-bold text-white focus:border-emerald-500/50 outline-none transition-all"
                        value={nombreReceptor}
                        onChange={(e) => setNombreReceptor(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">event</span>
                      FECHA DE DEVOLUCIÓN
                    </label>
                    <input 
                      type="date"
                      required
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-sm font-bold font-mono text-emerald-300 focus:border-emerald-500/50 outline-none transition-all"
                      value={fechaDevolucion}
                      onChange={(e) => setFechaDevolucion(e.target.value)}
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">speaker_notes</span>
                      OBSERVACIONES DE ENTREGA
                    </label>
                    <textarea 
                      rows={3}
                      placeholder="Detalles sobre la entrega o estado del objeto al devolver..."
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-sm font-bold text-white focus:border-emerald-500/50 outline-none transition-all placeholder:text-slate-700 resize-none"
                      value={observacionesEntrega}
                      onChange={(e) => setObservacionesEntrega(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-4 pt-6">
                    <button 
                      type="button"
                      onClick={() => setIsReturning(false)}
                      className="flex-1 py-4 border border-white/10 text-slate-500 font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl hover:bg-white/5 transition-all"
                    >
                      CANCELAR
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 py-4 bg-emerald-500 text-black font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl hover:bg-emerald-400 transition-all shadow-[0_0_30px_rgba(16,185,129,0.2)] active:scale-95"
                    >
                      FINALIZAR CUSTODIA
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ObjetosRetenidos;
