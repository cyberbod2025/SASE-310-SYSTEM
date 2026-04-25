import React, { useEffect, useMemo, useState } from "react";
import { useApp } from "../store";
import { ExpedienteInstitucional } from "../modules/expedientes/ExpedienteInstitucional";
import { DatosAlumnoExpediente } from "../modules/expedientes/types";
import { GlassCard } from "./ui/GlassCard";
import { GlassInput } from "./ui/GlassInput";
import { motion, AnimatePresence } from "framer-motion";

export const Expedientes: React.FC = () => {
  const { students, setAssistantSuggestion, setIsAssistantOpen } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("todos");
  const [selectedGroup, setSelectedGroup] = useState("todos");
  const [selectedStudent, setSelectedStudent] = useState<DatosAlumnoExpediente | null>(null);

  useEffect(() => {
    setIsAssistantOpen?.(true);
    setAssistantSuggestion?.({
      text: "¡Hola! Soy Sasito. Aquí puedes gestionar los expedientes. He resaltado el plan 30/60/90 para que veas exactamente en qué fase de acompañamiento está cada alumno.",
      state: "attention",
    });
  }, [setAssistantSuggestion, setIsAssistantOpen]);

  const extractGrade = (group?: string) => {
    if (!group) return "";
    const match = group.match(/\d+/);
    return match?.[0] || group.charAt(0) || "";
  };

  const availableGroups = useMemo<string[]>(() => {
    const groups = Array.from(new Set<string>(students.map((s) => String(s.group || "")).filter(Boolean)));
    return groups.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [students]);

  const availableGrades = useMemo<string[]>(() => {
    const grades = Array.from(new Set<string>(availableGroups.map((group) => extractGrade(group)).filter(Boolean)));
    return grades.sort((a, b) => Number(a) - Number(b));
  }, [availableGroups]);

  const visibleGroups = useMemo<string[]>(() => {
    return selectedGrade === "todos"
      ? availableGroups
      : availableGroups.filter((group) => extractGrade(group) === selectedGrade);
  }, [availableGroups, selectedGrade]);

  const filteredStudents = students.filter(s => {
    const nameMatch = s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
    const matriculaMatch = s.matricula?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
    const gradeMatch = selectedGrade === "todos" || extractGrade(s.group) === selectedGrade;
    const groupMatch = selectedGroup === "todos" || s.group === selectedGroup;
    return (nameMatch || matriculaMatch) && gradeMatch && groupMatch;
  });

  const calcularEdad = (fecha?: string) => {
    if (!fecha) return undefined;
    const nacimiento = new Date(fecha);
    if (Number.isNaN(nacimiento.getTime())) return undefined;
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad -= 1;
    }
    return edad;
  };

  if (selectedStudent) {
    return (
      <ExpedienteInstitucional 
        alumno={selectedStudent} 
        onClose={() => setSelectedStudent(null)} 
      />
    );
  }

  return (
    <div className="flex-1 w-full space-y-10 p-6 md:p-10 max-w-5xl mx-auto h-full flex flex-col">
      <div className="mb-0">
        <h1 className="text-4xl font-extrabold text-[var(--sase-text-head)] mb-2 tracking-tight">Archivo de Expedientes</h1>
        <p className="text-[var(--sase-text-muted)] font-medium tracking-tight">Acceso integral al historial académico y disciplinario del alumnado.</p>
      </div>

      <div className="flex-1 flex flex-col gap-8 max-w-3xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_140px_160px] gap-4 items-end">
          <div className="relative group">
            <GlassInput
              icon="search"
              placeholder="Buscar por apellido, nombre o matrícula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-16 text-lg border-[var(--sase-border-ghost)] shadow-xl pl-12"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <span className="text-[10px] font-black text-[var(--sase-text-muted)] uppercase tracking-widest bg-[var(--sase-surface-low)] px-2 py-1 rounded-lg border border-[var(--sase-border-ghost)]">CTRL+F</span>
            </div>
          </div>

          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--sase-text-muted)] pl-1">Grado</span>
            <select
              value={selectedGrade}
              onChange={(e) => {
                const nextGrade = e.target.value;
                setSelectedGrade(nextGrade);
                setSelectedGroup("todos");
              }}
              className="h-14 rounded-2xl bg-[var(--sase-surface)] border border-[var(--sase-border-ghost)] px-6 text-sm font-bold text-[var(--sase-text-main)] outline-none backdrop-blur-xl transition-all hover:bg-[var(--sase-surface-high)] cursor-pointer"
            >
              <option value="todos">Todos</option>
              {availableGrades.map((grade: string) => (
                <option key={grade} value={grade}>{grade}°</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--sase-text-muted)] pl-1">Grupo</span>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="h-14 rounded-2xl bg-[var(--sase-surface)] border border-[var(--sase-border-ghost)] px-6 text-sm font-bold text-[var(--sase-text-main)] outline-none backdrop-blur-xl transition-all hover:bg-[var(--sase-surface-high)] cursor-pointer"
            >
              <option value="todos">Todos</option>
              {visibleGroups.map((group: string) => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3 pb-10">
          <AnimatePresence mode="popLayout">
            {(searchTerm || selectedGrade !== "todos" || selectedGroup !== "todos") && filteredStudents.length > 0 ? (
              filteredStudents.map((s) => (
                <motion.button
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={s.id}
                  onClick={() => setSelectedStudent({
                    id: s.id,
                    nombre: s.name,
                    grupo: s.group,
                    grado: String(s.group || "1").charAt(0) || "1",
                    turno: "Vespertino",
                    curp: s.curp || s.matricula,
                    fecha_nacimiento: s.birthdate,
                    edad: calcularEdad(s.birthdate),
                    tutor: s.guardianInfo?.name || "No registrado",
                    relacion_tutor: s.guardianInfo?.relationship,
                    telefono_tutor: s.guardianInfo?.phonePrimary || "No disponible",
                    telefono_tutor_secundario: s.guardianInfo?.phoneSecondary,
                    correo_tutor: s.guardianInfo?.email,
                    direccion: s.guardianInfo?.address,
                    alertas_medicas: s.medicalAlerts,
                    historial_medico: s.medicalHistory,
                    calificaciones: s.calificaciones,
                  })}
                  className="w-full text-left bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/10 p-5 rounded-[1.5rem] flex items-center gap-5 transition-all group shadow-sm active:scale-[0.98]"
                >
                  <img
                    src={s.avatar || "/SASE_ICON.png"}
                    className="w-14 h-14 rounded-2xl border border-slate-100 shadow-sm object-cover"
                    alt=""
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-widest border border-blue-100">
                        {s.group}
                      </span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono">
                        {s.matricula}
                      </span>
                    </div>
                    <h4 className="text-lg font-black text-slate-800 leading-tight uppercase truncate">
                      {s.name}
                    </h4>
                  </div>
                  <motion.span 
                    whileHover={{ x: 4 }}
                    className="material-icons text-slate-300 group-hover:text-blue-500 transition-colors"
                  >
                    arrow_forward_ios
                  </motion.span>
                </motion.button>
              ))
            ) : (searchTerm || selectedGrade !== "todos" || selectedGroup !== "todos") ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                <span className="material-icons text-6xl text-slate-200 mb-4 block">person_search</span>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Sin coincidencias para "{searchTerm}"</p>
                <p className="text-[10px] text-slate-300 uppercase mt-2">Ajusta nombre, grado o grupo</p>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 flex flex-col items-center">
                 <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                   <span className="material-icons text-4xl text-blue-300">folder_shared</span>
                 </div>
                 <p className="text-slate-400 font-black uppercase tracking-widest text-xs mb-2">Búsqueda de Expedientes</p>
                 <h3 className="text-slate-300 font-black text-xl max-w-sm mx-auto uppercase tracking-tighter leading-tight italic">
                   Ingrese el nombre del alumno para abrir su historial institucional
                 </h3>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
