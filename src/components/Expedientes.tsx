import React, { useState } from "react";
import { useApp } from "../store";
import { ExpedienteInstitucional } from "../modules/expedientes/ExpedienteInstitucional";
import { DatosAlumnoExpediente } from "../modules/expedientes/types";
import { GlassCard } from "./ui/GlassCard";
import { GlassInput } from "./ui/GlassInput";
import { motion, AnimatePresence } from "framer-motion";

export const Expedientes: React.FC = () => {
  const { students } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<DatosAlumnoExpediente | null>(null);

  const filteredStudents = students.filter(s => {
    const nameMatch = s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
    const matriculaMatch = s.matricula?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
    return nameMatch || matriculaMatch;
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
        <h1 className="text-4xl font-extrabold text-slate-800 mb-2 tracking-tight">Archivo de Expedientes</h1>
        <p className="text-slate-500 font-medium tracking-tight">Acceso integral al historial académico y disciplinario del alumnado.</p>
      </div>

      <div className="flex-1 flex flex-col gap-8 max-w-3xl mx-auto w-full">
        <div className="relative group">
          <GlassInput
            icon="search"
            placeholder="Buscar por apellido, nombre o matrícula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-16 text-lg border-slate-200 shadow-xl focus:border-blue-500 group-hover:border-blue-300 transition-all pl-12"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">CTRL+F</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3 pb-10">
          <AnimatePresence mode="popLayout">
            {searchTerm && filteredStudents.length > 0 ? (
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
                    grado: s.group[0] || "1",
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
                    src={s.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.name}`}
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
            ) : searchTerm ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                <span className="material-icons text-6xl text-slate-200 mb-4 block">person_search</span>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Sin coincidencias para "{searchTerm}"</p>
                <p className="text-[10px] text-slate-300 uppercase mt-2">Verifique los apellidos o la matrícula</p>
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
