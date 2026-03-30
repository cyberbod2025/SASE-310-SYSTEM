import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../store";
import { Student, IncidentType } from "../types";
import toast from "react-hot-toast";

export const Asistencia: React.FC = () => {
  const { 
    students, 
    registerAttendance, 
    dailyStats, 
    addIncident,
    logAudit 
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

      toast.success(`Registro exitoso para ${student.name.split(" ")[0]}`);
    } catch (error) {
      console.error("Error en registro:", error);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header Sección */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="h-[2px] w-12 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"></span>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] italic">
              CONTROL DE ACCESO // ASISTENCIA_V4
            </p>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic leading-none">
            REGISTRO DE{" "}
            <span className="text-indigo-500 drop-shadow-[0_0_20px_rgba(99,102,241,0.4)]">
              PRESENCIA
            </span>
          </h1>
        </div>

        {/* Stats Rápidos */}
        <div className="flex gap-4">
          <div className="card-sase p-4 border-indigo-500/20 bg-indigo-500/5 min-w-[120px]">
             <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Presentes</p>
             <p className="text-2xl font-black text-white">{dailyStats.attendanceCount}</p>
          </div>
          <div className="card-sase p-4 border-amber-500/20 bg-amber-500/5 min-w-[120px]">
             <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Retardos</p>
             <p className="text-2xl font-black text-amber-400">{dailyStats.lateCount}</p>
          </div>
        </div>
      </div>

      {/* Controles de búsqueda */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-8 relative group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-500 group-focus-within:text-indigo-400 transition-colors">
            search
          </span>
          <input
            type="text"
            placeholder="BUSCAR POR NOMBRE O MATRÍCULA..."
            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl h-14 pl-12 pr-4 text-white font-mono text-sm tracking-widest focus:border-indigo-500/50 outline-none transition-all focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-600 uppercase"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="md:col-span-4 relative group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-500 group-focus-within:text-indigo-400 transition-colors">
            filter_list
          </span>
          <select
             className="w-full bg-white/[0.03] border border-white/10 rounded-2xl h-14 pl-12 pr-4 text-white font-black text-[10px] uppercase tracking-widest focus:border-indigo-500/50 outline-none appearance-none transition-all cursor-pointer"
             value={selectedGroup}
             onChange={(e) => setSelectedGroup(e.target.value)}
          >
            {groups.map(g => (
              <option key={g} value={g} className="bg-[#0f1117]">{g === "ALL" ? "TODOS LOS GRUPOS" : `GRUPO ${g}`}</option>
            ))}
          </select>
          <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-500 pointer-events-none">
            expand_more
          </span>
        </div>
      </div>

      {/* Grid de Alumnos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
        <AnimatePresence mode="popLayout">
          {filteredStudents.slice(0, 30).map((student: Student, idx: number) => (
            <motion.div
              layout
              key={student.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: idx * 0.02 }}
              className="card-sase p-5 border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all group relative overflow-hidden"
            >
              {/* Scan Line effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/[0.03] to-transparent h-1/2 -translate-y-full group-hover:animate-scan pointer-events-none" />

              <div className="flex items-start gap-4 mb-6">
                <div className="relative">
                   <img 
                    src={student.avatar} 
                    alt={student.name}
                    className="size-16 rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all duration-500 border border-white/10 group-hover:border-indigo-500/30"
                   />
                   <div className="absolute -bottom-1 -right-1 px-2 py-0.5 bg-indigo-600 text-[8px] font-black text-white rounded-md border border-white/20">
                     {student.group}
                   </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-black text-white uppercase tracking-tight truncate group-hover:text-indigo-400 transition-colors">
                    {student.name}
                  </h3>
                  <p className="text-[10px] font-mono text-slate-500 tracking-widest mb-2">
                    ID: {student.matricula}
                  </p>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleRegister(student, "presente")}
                  className="flex flex-col items-center justify-center p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-xl mb-1">done_all</span>
                  <span className="text-[8px] font-black uppercase tracking-widest">Presente</span>
                </button>
                <button
                  onClick={() => handleRegister(student, "retardo")}
                  className="flex flex-col items-center justify-center p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-xl mb-1">schedule</span>
                  <span className="text-[8px] font-black uppercase tracking-widest">Retardo</span>
                </button>
                <button
                  onClick={() => handleRegister(student, "falta")}
                  className="flex flex-col items-center justify-center p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-xl mb-1">person_off</span>
                  <span className="text-[8px] font-black uppercase tracking-widest">Falta</span>
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredStudents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="size-20 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
             <span className="material-symbols-outlined text-4xl text-slate-700">search_off</span>
          </div>
          <div className="space-y-1">
            <h4 className="text-white font-black uppercase tracking-widest text-sm italic">Sin resultados</h4>
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-[0.2em]">Verifique los criterios de búsqueda</p>
          </div>
        </div>
      )}
    </div>
  );
};
