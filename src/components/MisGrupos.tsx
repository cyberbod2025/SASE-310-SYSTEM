import React, { useState, useEffect } from "react";
import { useApp } from "../store";
import { Student, CaseState } from "../types";
import { GlassCard } from "./ui/GlassCard";
import { GlassButton } from "./ui/GlassButton";
import { motion, AnimatePresence } from "framer-motion";

interface Grupo {
  id: string;
  nombre: string;
  alumnos: Student[];
  totalAlumnos: number;
  conIncidencias: number;
  promedioGeneral: number;
}

export const MisGrupos: React.FC = () => {
  const { students, groups } = useApp();
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarGrupos();
  }, [students]);

  const cargarGrupos = () => {
    setLoading(true);
    const gruposMap = new Map<string, Student[]>();
    students.forEach((student) => {
      const grupo = student.group;
      if (grupo) {
        if (!gruposMap.has(grupo)) {
          gruposMap.set(grupo, []);
        }
        gruposMap.get(grupo)!.push(student);
      }
    });

    const gruposArray: Grupo[] = groups.map((g) => {
      const nombre = g.nombre || g.name || "Sin Grupo";
      const alumnos = gruposMap.get(nombre) || [];
      const conIncidencias = alumnos.filter((a) => a.incidents && a.incidents.length > 0).length;
      
      const alumnosConCalif = alumnos.filter((a) => a.calificaciones && a.calificaciones.length > 0);
      const promedioGeneral = alumnosConCalif.length > 0
          ? alumnosConCalif.reduce((sum, a) => {
              const promAlumno = a.calificaciones!.reduce((s, c) => s + (c.promedioFinal || 0), 0) / a.calificaciones!.length;
              return sum + promAlumno;
            }, 0) / alumnosConCalif.length
          : 0;

      return {
        id: g.id || nombre,
        nombre,
        alumnos,
        totalAlumnos: alumnos.length,
        conIncidencias,
        promedioGeneral: Math.round(promedioGeneral * 10) / 10,
      };
    });

    setGrupos(gruposArray.sort((a, b) => a.nombre.localeCompare(b.nombre, undefined, { numeric: true })));
    setLoading(false);
  };

  const grupoActual = grupos.find((g) => g.id === grupoSeleccionado);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Sincronizando grupos escolares...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 min-h-full flex flex-col">
      <div className="mb-4">
        <h1 className="text-4xl font-extrabold text-slate-800 mb-2 tracking-tight">Gestión de Grupos</h1>
        <p className="text-slate-500 font-medium tracking-tight">Monitoreo de trayectorias académicas y desempeño grupal.</p>
      </div>

      <AnimatePresence mode="wait">
        {!grupoSeleccionado ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {grupos.map((grupo) => (
              <GlassCard
                key={grupo.id}
                className="p-6 border border-slate-200 hover:border-blue-200 transition-all cursor-pointer group flex flex-col justify-between"
                onClick={() => setGrupoSeleccionado(grupo.id)}
              >
                <div>
                   <div className="flex items-start justify-between mb-6">
                      <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                         <span className="material-icons">groups</span>
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                        {grupo.totalAlumnos} Alums.
                      </span>
                   </div>
                   <h3 className="text-3xl font-black text-slate-800 mb-2 tracking-tighter">{grupo.nombre}</h3>
                </div>

                <div className="space-y-4 pt-6 border-t border-slate-100">
                   <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Promedio General</span>
                      <span className={`text-sm font-black ${grupo.promedioGeneral >= 8 ? "text-emerald-600" : grupo.promedioGeneral >= 6 ? "text-amber-600" : "text-red-600"}`}>
                        {grupo.promedioGeneral > 0 ? grupo.promedioGeneral.toFixed(1) : "N/A"}
                      </span>
                   </div>
                   <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Incidencias Activas</span>
                      <span className={`text-sm font-black ${grupo.conIncidencias > 0 ? "text-orange-600" : "text-emerald-600"}`}>
                        {grupo.conIncidencias}
                      </span>
                   </div>
                </div>
              </GlassCard>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-4">
               <GlassButton variant="outline" onClick={() => setGrupoSeleccionado(null)} className="min-w-fit">
                  <span className="material-icons">arrow_back</span>
               </GlassButton>
               <h2 className="text-3xl font-black text-slate-800 tracking-tight">Grupo {grupoActual?.nombre}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <GlassCard className="p-6 border border-slate-200">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Población Escolar</p>
                  <div className="flex items-end justify-between">
                     <p className="text-4xl font-black text-blue-600 leading-none">{grupoActual?.totalAlumnos}</p>
                     <span className="material-icons text-slate-100 text-4xl">group</span>
                  </div>
               </GlassCard>
               <GlassCard className="p-6 border border-slate-200">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Desempeño Grupal</p>
                  <div className="flex items-end justify-between">
                     <p className="text-4xl font-black text-emerald-600 leading-none">{grupoActual?.promedioGeneral || "N/A"}</p>
                     <span className="material-icons text-slate-100 text-4xl">trending_up</span>
                  </div>
               </GlassCard>
               <GlassCard className="p-6 border border-slate-200">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Atención Prioritaria</p>
                  <div className="flex items-end justify-between">
                     <p className="text-4xl font-black text-orange-600 leading-none">{grupoActual?.conIncidencias}</p>
                     <span className="material-icons text-slate-100 text-4xl">warning</span>
                  </div>
               </GlassCard>
            </div>

            <GlassCard className="overflow-hidden border border-slate-200">
               <div className="bg-slate-50/50 border-b border-slate-100 px-8 py-5">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Trayectoria Estudiantil</h3>
               </div>
               <div className="divide-y divide-slate-100">
                  {grupoActual?.alumnos.map((alumno) => {
                    const promedio = alumno.calificaciones && alumno.calificaciones.length > 0
                        ? alumno.calificaciones.reduce((sum, c) => sum + (c.promedioFinal || 0), 0) / alumno.calificaciones.length
                        : null;

                    return (
                      <div key={alumno.id} className="px-8 py-5 hover:bg-slate-50 transition-colors flex items-center justify-between">
                        <div className="flex items-center gap-5">
                           <img src={alumno.avatar} className="w-12 h-12 rounded-2xl border border-slate-200 bg-white" alt="" />
                           <div>
                              <p className="font-extrabold text-slate-800 text-lg leading-tight uppercase">{alumno.name}</p>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">{alumno.matricula || "S/M"}</p>
                           </div>
                        </div>

                        <div className="flex items-center gap-12">
                           <div className="text-right">
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Promedio</p>
                              <p className={`text-xl font-black font-mono ${promedio ? (promedio >= 8 ? "text-emerald-600" : promedio >= 6 ? "text-amber-600" : "text-red-600") : "text-slate-300"}`}>
                                {promedio ? promedio.toFixed(1) : "--"}
                              </p>
                           </div>
                           <div className="text-right">
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Impacto</p>
                              <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
                                alumno.incidents.length === 0 ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-orange-50 text-orange-600 border-orange-100"
                              }`}>
                                {alumno.incidents.length} Casos
                              </span>
                           </div>
                        </div>
                      </div>
                    );
                  })}
               </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
