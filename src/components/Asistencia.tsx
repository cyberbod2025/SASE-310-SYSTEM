import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../store";
import { Student, IncidentType } from "../types";
import toast from "react-hot-toast";
import { GlassCard } from "./ui/GlassCard";
import { GlassInput } from "./ui/GlassInput";

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

      toast.success(`Registro exitoso: ${student.name.split(" ")[0]}`);
    } catch (error) {
      console.error("Error en registro:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 p-6 lg:p-8 relative z-10 w-full max-w-5xl mx-auto h-full flex flex-col"
    >
      <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 mb-1 tracking-tight">Pase de Lista</h1>
          <p className="text-slate-500 font-medium">Control de asistencia institucional diaria.</p>
        </div>

        <div className="flex gap-4">
          <GlassCard className="px-5 py-4 min-w-[120px]">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Presentes</p>
            <p className="text-2xl font-black text-emerald-600">{dailyStats.attendanceCount}</p>
          </GlassCard>
          <GlassCard className="px-5 py-4 min-w-[120px]">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Retardos</p>
            <p className="text-2xl font-black text-orange-600">{dailyStats.lateCount}</p>
          </GlassCard>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
        <div className="md:col-span-8">
          <GlassInput
            placeholder="Buscar por nombre o matrícula..."
            icon="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="md:col-span-4 relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
            <span className="material-icons text-slate-400">group</span>
          </div>
          <select
            className="w-full h-[54px] bg-white/50 backdrop-blur-xl border border-slate-200 rounded-2xl pl-12 pr-10 text-slate-700 text-sm font-bold focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all appearance-none cursor-pointer"
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
          >
            {groups.map((g) => (
              <option key={g} value={g}>
                {g === "ALL" ? "Todos los Grupos" : `Grupo ${g}`}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <span className="material-icons text-slate-400">expand_more</span>
          </div>
        </div>
      </div>

      <GlassCard className="flex-1 overflow-hidden flex flex-col p-0 border border-slate-200">
        <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-100 bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
          <div className="col-span-7 md:col-span-8">Alumno / Matrícula</div>
          <div className="col-span-5 md:col-span-4 text-center">Acción de Registro</div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-1">
          <AnimatePresence mode="popLayout">
            {filteredStudents.map((student: Student, idx: number) => (
              <motion.div
                layout
                key={student.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: Math.min(idx * 0.01, 0.2) }}
                className="grid grid-cols-12 gap-4 items-center px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                <div className="col-span-7 md:col-span-8 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    {student.name.substring(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-slate-800 font-bold text-sm tracking-tight">{student.name}</p>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{student.matricula}</p>
                  </div>
                </div>

                <div className="col-span-5 md:col-span-4 flex justify-center gap-2">
                  <button
                    onClick={() => handleRegister(student, "presente")}
                    className="w-10 h-10 rounded-xl flex items-center justify-center border font-black text-xs transition-all bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:text-white hover:shadow-lg hover:shadow-emerald-200 active:scale-95"
                    title="Presente"
                  >
                    P
                  </button>
                  <button
                    onClick={() => handleRegister(student, "retardo")}
                    className="w-10 h-10 rounded-xl flex items-center justify-center border font-black text-xs transition-all bg-orange-50 border-orange-100 text-orange-600 hover:bg-orange-600 hover:text-white hover:shadow-lg hover:shadow-orange-200 active:scale-95"
                    title="Retardo"
                  >
                    R
                  </button>
                  <button
                    onClick={() => handleRegister(student, "falta")}
                    className="w-10 h-10 rounded-xl flex items-center justify-center border font-black text-xs transition-all bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white hover:shadow-lg hover:shadow-rose-200 active:scale-95"
                    title="Falta"
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
          <div className="size-20 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
            <span className="material-icons text-4xl text-slate-300">person_off</span>
          </div>
          <div className="space-y-1">
            <h4 className="text-slate-800 font-black uppercase tracking-widest text-sm">Sin resultados</h4>
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Ajuste los criterios de búsqueda</p>
          </div>
        </div>
      )}
    </motion.div>
  );
};
