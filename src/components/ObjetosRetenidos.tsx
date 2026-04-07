import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../store";
import { 
  EstadoObjetoRetenido,
  ObjetoRetenido 
} from "../types";
import toast from "react-hot-toast";
import { GlassCard } from "./ui/GlassCard";
import { GlassButton } from "./ui/GlassButton";
import { GlassInput } from "./ui/GlassInput";

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
      toast.error("Por favor completa todos los campos institucionales");
      return;
    }
    await addObjetoRetenido(selectedStudentId, objeto, motivo, fecha, categoria, lugarRetencion, observaciones);
    setIsRegistering(false);
    resetForm();
    toast.success("Objeto bajo resguardo institucional");
  };

  const handleDevolucion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedObj) {
      toast.error("Seleccione un objeto para devolución");
      return;
    }
    if (tipoEntrega === "padre_tutor" && !nombreReceptor.trim()) {
      toast.error("Indique el nombre de quien recibe el artículo");
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
    toast.success("Devolución registrada correctamente");
  };

  const resetForm = () => {
    setObjeto("");
    setMotivo("");
    setSelectedStudentId("");
    setObservaciones("");
  };

  const getStatusStyle = (estado: EstadoObjetoRetenido) => {
    switch (estado) {
      case EstadoObjetoRetenido.RETENIDO: 
        return "text-orange-600 bg-orange-50 border-orange-100";
      case EstadoObjetoRetenido.DEVUELTO_ALUMNO: 
        return "text-emerald-600 bg-emerald-50 border-emerald-100";
      case EstadoObjetoRetenido.ENTREGADO_PADRE: 
        return "text-blue-600 bg-blue-50 border-blue-100";
      default: 
        return "text-slate-500 bg-slate-50 border-slate-100";
    }
  };

  return (
    <div className="flex-1 p-6 lg:p-10 relative z-10 w-full max-w-7xl mx-auto h-full flex flex-col">
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-800 mb-2 tracking-tight">Objetos Retenidos</h1>
          <p className="text-slate-500 font-medium tracking-tight">Control administrativo de artículos bajo resguardo en Prefectura.</p>
        </div>
        <GlassButton
          onClick={() => setIsRegistering(true)}
          className="shadow-xl"
        >
          <span className="material-icons mr-2">add_circle</span>
          Registrar Retención
        </GlassButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto pb-10">
        {allObjetos.length === 0 ? (
          <GlassCard className="p-12 text-center col-span-full border border-slate-200">
            <span className="material-icons text-slate-200 text-6xl mb-4">inventory_2</span>
            <p className="text-slate-400 font-medium">No se encuentran artículos bajo custodia actualmente.</p>
          </GlassCard>
        ) : (
          [...allObjetos]
            .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
            .map((obj: ObjetoRetenido) => (
              <GlassCard key={obj.id} className="p-6 flex flex-col justify-between border border-slate-200 hover:border-blue-200 transition-all group">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                      <span className="material-icons">inventory_2</span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(obj.estado)}`}>
                      {obj.estado}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1 leading-tight">{obj.objeto}</h3>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter mb-4">Alumno: {obj.studentName || "N/A"}</p>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-slate-400">
                      <span className="material-icons text-sm">event</span>
                      <span className="text-xs font-medium">{new Date(obj.fecha).toLocaleDateString("es-MX", { dateStyle: "long" })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <span className="material-icons text-sm">category</span>
                      <span className="text-xs font-medium">{obj.categoria}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  {obj.estado === EstadoObjetoRetenido.RETENIDO ? (
                    <button
                      onClick={() => {
                        setSelectedObj(obj);
                        setIsReturning(true);
                      }}
                      className="text-emerald-600 text-xs font-black uppercase tracking-widest hover:text-emerald-700 transition-colors flex items-center gap-1"
                    >
                      <span className="material-icons text-sm">assignment_return</span>
                      Devolver
                    </button>
                  ) : (
                    <div className="text-[10px] text-slate-400 font-bold uppercase truncate max-w-[150px]">
                      Recibe: {obj.entregadoA?.split(":")[1] || obj.entregadoA || "N/A"}
                    </div>
                  )}
                  <span className="material-icons text-slate-200 group-hover:text-blue-200 transition-colors">arrow_forward</span>
                </div>
              </GlassCard>
            ))
        )}
      </div>

      {/* MODAL REGISTRO (SOFT GLASS) */}
      <AnimatePresence>
        {isRegistering && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsRegistering(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-2xl">
              <GlassCard className="p-10 border border-slate-200 shadow-2xl">
                <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-6">
                  <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
                    <span className="material-icons text-3xl">add_circle</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Nueva Retención</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Protocolo de Resguardo de Pertenencias</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Estudiante / Matrícula</label>
                       <select 
                          required
                          title="Seleccionar Estudiante"
                          aria-label="Seleccionar Estudiante"
                          className="h-[46px] bg-slate-50 border border-slate-100 rounded-xl px-4 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500"
                          value={selectedStudentId}
                          onChange={(e) => setSelectedStudentId(e.target.value)}
                        >
                          <option value="">Seleccionar...</option>
                          {students.slice().sort((a:any, b:any) => a.name.localeCompare(b.name)).map((s: any) => (
                            <option key={s.id} value={s.id}>{s.name} ({s.group})</option>
                          ))}
                        </select>
                    </div>
                    <GlassInput label="Fecha de Registro" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
                  </div>

                  <GlassInput label="Artículo / Descripción Corta" placeholder="Ej: Smartphone Samsung G23" value={objeto} onChange={(e) => setObjeto(e.target.value)} required />
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Categoría</label>
                      <select 
                        title="Categoría del Objeto"
                        aria-label="Categoría del Objeto"
                        className="h-[46px] bg-slate-50 border border-slate-100 rounded-xl px-4 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500"
                        value={categoria}
                        onChange={(e) => setCategoria(e.target.value)}
                      >
                        <option value="Electrónico">Electrónico</option>
                        <option value="Juguete/Distractor">Juguete/Distractor</option>
                        <option value="Prenda/Accesorio">Prenda/Accesorio</option>
                        <option value="Material Peligroso">Material Peligroso</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>
                    <GlassInput label="Lugar de Resguardo" value={lugarRetencion} onChange={(e) => setLugarRetencion(e.target.value)} />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Motivo de Retención</label>
                    <textarea 
                      required
                      title="Motivo de Retención"
                      aria-label="Motivo de Retención"
                      placeholder="Describa por qué se retiró el artículo..."
                      className="w-full h-24 bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500 transition-all"
                      value={motivo}
                      onChange={(e) => setMotivo(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-4 pt-6">
                    <GlassButton type="button" variant="outline" onClick={() => setIsRegistering(false)} className="flex-1">Cancelar</GlassButton>
                    <GlassButton type="submit" className="flex-1">Confirmar Resguardo</GlassButton>
                  </div>
                </form>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL DEVOLUCIÓN (SOFT GLASS) */}
      <AnimatePresence>
        {isReturning && selectedObj && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsReturning(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-xl">
              <GlassCard className="p-10 border border-slate-200 shadow-2xl">
                <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-6">
                  <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                    <span className="material-icons text-3xl">assignment_return</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Registrar Devolución</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Cierre de Folio de Custodia</p>
                  </div>
                </div>

                <form onSubmit={handleDevolucion} className="space-y-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Entregar A</label>
                    <select 
                      title="Entregar A"
                      aria-label="Entregar A"
                      className="h-[46px] bg-slate-50 border border-slate-100 rounded-xl px-4 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500"
                      value={tipoEntrega}
                      onChange={(e) => {
                        const val = e.target.value as "alumno" | "padre_tutor";
                        setTipoEntrega(val);
                        setNuevoEstado(val === "alumno" ? EstadoObjetoRetenido.DEVUELTO_ALUMNO : EstadoObjetoRetenido.ENTREGADO_PADRE);
                      }}
                    >
                      <option value="alumno">El propio Alumno/a</option>
                      <option value="padre_tutor">Padre / Madre / Tutor Legal</option>
                    </select>
                  </div>

                  {tipoEntrega === "padre_tutor" && (
                    <GlassInput label="Nombre de quien recibe" placeholder="Identificación oficial requerida..." value={nombreReceptor} onChange={(e) => setNombreReceptor(e.target.value)} required />
                  )}

                  <GlassInput label="Fecha de Devolución" type="date" value={fechaDevolucion} onChange={(e) => setFechaDevolucion(e.target.value)} required />

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Observaciones de Entrega</label>
                    <textarea 
                      placeholder="Estado del objeto al ser devuelto..."
                      className="w-full h-24 bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500 transition-all"
                      value={observacionesEntrega}
                      onChange={(e) => setObservacionesEntrega(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-4 pt-6">
                    <GlassButton type="button" variant="outline" onClick={() => setIsReturning(false)} className="flex-1">Cancelar</GlassButton>
                    <GlassButton type="submit" className="flex-1">Finalizar Custodia</GlassButton>
                  </div>
                </form>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ObjetosRetenidos;
