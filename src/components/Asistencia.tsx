import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../store";
import { Student, IncidentType } from "../types";
import toast from "react-hot-toast";
import { GlassCard } from "./ui/GlassCard";

export const Asistencia: React.FC = () => {
  const { 
    students, 
    registerAttendance, 
    dailyStats, 
    addIncident,
    logAudit,
    userCreatedAt,
  } = useApp();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("ALL");

  const groups = useMemo<string[]>(() => {
    const list: string[] = Array.from(new Set(students.map((s: Student) => s.group)));
    return ["ALL", ...list.sort()];
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter((s: Student) => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           s.matricula.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGroup = selectedGroup === "ALL" || s.group === selectedGroup;
      return matchesSearch && matchesGroup;
    });
  }, [students, searchTerm, selectedGroup]);

  const handleRegister = async (student: Student, estado: "presente" | "retardo" | "falta") => {
    try {
      await registerAttendance(student.id, estado);
      
      if (estado === "retardo") {
        await addIncident(student.id, IncidentType.RETARDO, "Retardo registrado en control de asistencia");
      } else if (estado === "falta") {
        await addIncident(student.id, IncidentType.ASISTENCIA, "Inasistencia registrada en control de asistencia");
      }

      await logAudit(
        "CREACION",
        `Asistencia: ${estado.toUpperCase()} para ${student.name}`,
        "attendance_logs",
        student.id,
        student.name,
        null,
        { estado }
      );

      const medirKPIProductividad = (tipoAccion: string) => {
        const kpiRegistrado = localStorage.getItem(`kpi_primer_${tipoAccion}`);
        if (!kpiRegistrado && userCreatedAt) {
          const diffTime = Math.abs(
            new Date().getTime() - new Date(userCreatedAt).getTime(),
          );
          const diasTardados = Math.floor(diffTime / (1000 * 60 * 60 * 24));

          console.log(
            `[KPI LOG] Tiempo a Productividad (${tipoAccion}): ${diasTardados} dias`,
          );

          localStorage.setItem(`kpi_primer_${tipoAccion}`, "true");
        }
      };

      medirKPIProductividad("pase_lista");
      toast.success(`Registro exitoso para ${student.name.split(" ")[0]}`);
    } catch (error) {
      console.error("Error en registro:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 p-6 lg:p-8 relative z-10 w-full max-w-5xl mx-auto h-full flex flex-col"
    >
      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">Pase de Lista</h1>
          <p className="text-slate-400 text-sm">Registro de asistencia y retardos del grupo.</p>
        </div>

        <div className="flex gap-3">
          <GlassCard className="px-4 py-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Presentes</p>
            <p className="text-xl font-black text-white">{dailyStats.attendanceCount}</p>
          </GlassCard>
          <GlassCard className="px-4 py-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Retardos</p>
            <p className="text-xl font-black text-amber-400">{dailyStats.lateCount}</p>
          </GlassCard>
        </div>
      </div>

      <GlassCard className="mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8 relative">
            <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">search</span>
            <input
              type="text"
              placeholder="Buscar por nombre o matricula..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all duration-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="md:col-span-4 relative">
            <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">filter_list</span>
            <select
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-blue-400 transition-all appearance-none"
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
            >
              {groups.map((g) => (
                <option key={g} value={g} className="bg-[#0f1117]">
                  {g === "ALL" ? "Todos los grupos" : `Grupo ${g}`}
                </option>
              ))}
            </select>
            <span className="material-icons absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">expand_more</span>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="flex-1 overflow-hidden flex flex-col p-0">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 bg-white/[0.02] text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <div className="col-span-6 md:col-span-8">Alumno</div>
          <div className="col-span-6 md:col-span-4 text-center">Estado</div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
          <AnimatePresence mode="popLayout">
            {filteredStudents.slice(0, 30).map((student: Student, idx: number) => (
              <motion.div
                layout
                key={student.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ delay: idx * 0.02 }}
                className="grid grid-cols-12 gap-4 items-center p-3 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.04] transition-colors"
              >
                <div className="col-span-6 md:col-span-8 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                    {student.name.substring(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-slate-200 font-medium text-sm">{student.name}</p>
                    <p className="text-slate-500 text-xs">{student.matricula}</p>
                  </div>
                </div>

                <div className="col-span-6 md:col-span-4 flex justify-center gap-2">
                  <button
                    onClick={() => handleRegister(student, "presente")}
                    className="w-10 h-10 rounded-2xl flex items-center justify-center border transition-all duration-300 font-medium text-sm bg-emerald-500/10 border-emerald-400/30 text-emerald-400 hover:bg-emerald-500/20"
                  >
                    P
                  </button>
                  <button
                    onClick={() => handleRegister(student, "retardo")}
                    className="w-10 h-10 rounded-2xl flex items-center justify-center border transition-all duration-300 font-medium text-sm bg-amber-500/10 border-amber-400/30 text-amber-400 hover:bg-amber-500/20"
                  >
                    R
                  </button>
                  <button
                    onClick={() => handleRegister(student, "falta")}
                    className="w-10 h-10 rounded-2xl flex items-center justify-center border transition-all duration-300 font-medium text-sm bg-rose-500/10 border-rose-400/30 text-rose-400 hover:bg-rose-500/20"
                  >
                    F
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </GlassCard>

      {filteredStudents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="size-20 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
            <span className="material-symbols-outlined text-4xl text-slate-700">search_off</span>
          </div>
          <div className="space-y-1">
            <h4 className="text-white font-black uppercase tracking-widest text-sm italic">Sin resultados</h4>
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-[0.2em]">Verifique los criterios de busqueda</p>
          </div>
        </div>
      )}
    </motion.div>
  );
};
