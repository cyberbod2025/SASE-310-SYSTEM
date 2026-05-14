import React, { useEffect, useMemo, useState } from "react";
import { useApp } from "../store";
import { ExpedienteInstitucional } from "../modules/expedientes/ExpedienteInstitucional";
import { DatosAlumnoExpediente } from "../modules/expedientes/types";
import { GlassCard } from "./ui/GlassCard";
import { LuminousPanel } from "./ui/LuminousPanel";
import { LuminousTable } from "./ui/LuminousTable";
import { StatusChip } from "./ui/StatusChip";
import { LuminousSearchBar } from "./ui/LuminousSearchBar";
import { LuminousActionButton } from "./ui/LuminousActionButton";
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

  const isFiltering = searchTerm || selectedGrade !== "todos" || selectedGroup !== "todos";

  const columns = [
    {
      key: "avatar",
      header: "",
      render: (s: typeof students[0]) => (
        <img
          src={s.avatar || "/SASE_ICON.png"}
          className="w-12 h-12 rounded-xl border border-[rgba(167,139,250,0.1)] shadow-sm object-cover"
          alt=""
        />
      ),
      className: "shrink-0",
    },
    {
      key: "info",
      header: "Información",
      render: (s: typeof students[0]) => (
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <StatusChip label={s.group || ""} variant="lavender" />
            <span className="text-[9px] font-black text-[var(--sase-text-muted)] uppercase tracking-widest font-mono">
              {s.matricula}
            </span>
          </div>
          <h4 className="text-base font-black text-[var(--sase-text-head)] leading-tight uppercase truncate">
            {s.name}
          </h4>
        </div>
      ),
      className: "flex-1 min-w-0",
    },
    {
      key: "arrow",
      header: "",
      render: () => (
        <motion.span
          whileHover={{ x: 4 }}
          className="material-icons text-[var(--sase-text-muted)] group-hover:text-[#A78BFA] transition-colors"
        >
          arrow_forward_ios
        </motion.span>
      ),
      className: "shrink-0",
    },
  ];

  const selectBase = "h-12 rounded-2xl bg-[var(--sase-panel)] border border-[rgba(167,139,250,0.08)] px-5 text-sm font-bold text-[var(--sase-text-main)] outline-none backdrop-blur-xl transition-all hover:bg-[rgba(20,24,38,0.85)] hover:border-[rgba(167,139,250,0.15)] cursor-pointer";

  return (
    <div className="flex-1 w-full space-y-8 p-6 md:p-10 max-w-5xl mx-auto h-full flex flex-col">
      <div className="mb-0">
        <h1 className="text-4xl font-extrabold text-[var(--sase-text-head)] mb-2 tracking-tight">Archivo de Expedientes</h1>
        <p className="text-[var(--sase-text-muted)] font-medium tracking-tight">Acceso integral al historial académico y disciplinario del alumnado.</p>
      </div>

      <div className="flex-1 flex flex-col gap-6 max-w-3xl mx-auto w-full">
        <LuminousSearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por apellido, nombre o matrícula..."
        />

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--sase-text-muted)] pl-1">Grado</span>
            <select
              value={selectedGrade}
              onChange={(e) => {
                const nextGrade = e.target.value;
                setSelectedGrade(nextGrade);
                setSelectedGroup("todos");
              }}
              className={selectBase}
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
              className={selectBase}
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
            {isFiltering && filteredStudents.length > 0 ? (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <LuminousTable
                  data={filteredStudents}
                  columns={columns}
                  keyExtractor={(s) => s.id}
                  onRowClick={(s) => setSelectedStudent({
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
                />
              </motion.div>
            ) : isFiltering ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <LuminousPanel className="text-center py-16">
                  <span className="material-icons text-5xl text-[var(--sase-text-muted)]/30 mb-4 block">person_search</span>
                  <p className="text-[var(--sase-text-muted)] font-bold uppercase tracking-widest text-xs">Sin coincidencias para "{searchTerm}"</p>
                  <p className="text-[10px] text-[var(--sase-text-muted)]/60 uppercase mt-2">Ajusta nombre, grado o grupo</p>
                </LuminousPanel>
              </motion.div>
            ) : (
              <motion.div key="initial" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <LuminousPanel className="text-center py-16">
                  <div className="w-20 h-20 rounded-full bg-[rgba(167,139,250,0.08)] flex items-center justify-center mb-5 mx-auto">
                    <span className="material-icons text-3xl text-[#A78BFA]/60">folder_shared</span>
                  </div>
                  <p className="text-[var(--sase-text-muted)] font-black uppercase tracking-widest text-xs mb-2">Búsqueda de Expedientes</p>
                  <h3 className="text-[var(--sase-text-head)]/70 font-black text-xl max-w-sm mx-auto uppercase tracking-tighter leading-tight italic">
                    Ingrese el nombre del alumno para abrir su historial institucional
                  </h3>
                </LuminousPanel>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
