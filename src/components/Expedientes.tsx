import React, { useState } from "react";
import { useApp } from "../store";
import { ExpedienteInstitucional } from "../modules/expedientes/ExpedienteInstitucional";
import { DatosAlumnoExpediente } from "../modules/expedientes/types";

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
    <div className="flex-1 w-full space-y-8 animate-fade-in font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">
            Control de Expedientes
          </h2>
          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
            Consulta Integral del Alumnado • Ciclo Escolar 2024-2025
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <div className="relative">
          <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-2xl">
            search
          </span>
          <input
            type="text"
            className="w-full h-16 bg-white/[0.03] border-2 border-white/5 rounded-[1.5rem] pl-14 pr-6 text-lg font-bold text-white focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xl backdrop-blur-3xl placeholder:text-slate-500"
            placeholder="Buscar por nombre o matrícula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-3">
          {searchTerm && filteredStudents.length > 0 ? (
            filteredStudents.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedStudent({
                  id: s.id,
                  nombre: s.name,
                  grupo: s.group,
                  grado: s.group[0] || "1",
                  turno: "Matutino",
                  curp: s.curp || s.matricula,
                  fecha_nacimiento: s.birthdate,
                  edad: calcularEdad(s.birthdate),
                  tutor: s.guardianInfo?.name || "Tutor no registrado",
                  relacion_tutor: s.guardianInfo?.relationship,
                  telefono_tutor: s.guardianInfo?.phonePrimary || "No disponible",
                  telefono_tutor_secundario: s.guardianInfo?.phoneSecondary,
                  correo_tutor: s.guardianInfo?.email,
                  direccion: s.guardianInfo?.address,
                  alertas_medicas: s.medicalAlerts,
                  historial_medico: s.medicalHistory,
                  calificaciones: s.calificaciones,
                })}
                className="w-full text-left p-5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-blue-500/30 rounded-2xl flex items-center gap-5 transition-all group hover:scale-[1.01] shadow-xl backdrop-blur-2xl"
              >
                <img
                  src={s.avatar}
                  className="size-14 rounded-xl border-2 border-white/10 shadow-xl shadow-black/5 object-cover"
                  alt=""
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded uppercase tracking-wider">
                      {s.group}
                    </span>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                      {s.matricula}
                    </span>
                  </div>
                  <h4 className="text-base font-black text-white uppercase italic truncate">
                    {s.name}
                  </h4>
                </div>
                <span className="material-icons text-slate-400 group-hover:text-blue-400 transition-colors">
                  arrow_forward_ios
                </span>
              </button>
            ))
          ) : searchTerm ? (
            <div className="text-center py-20 bg-white/[0.02] border-2 border-dashed border-white/5 rounded-3xl">
              <span className="material-icons text-6xl text-slate-700 mb-4 block">
                person_search
              </span>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
                No se encontraron resultados para "{searchTerm}"
              </p>
            </div>
          ) : (
            <div className="text-center py-20">
               <div className="inline-flex size-24 bg-blue-500/10 rounded-full items-center justify-center mb-6">
                <span className="material-icons text-4xl text-blue-400">
                  folder_shared
                </span>
              </div>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-2">
                Búsqueda de Expedientes
              </p>
              <h3 className="text-slate-400 font-black text-lg max-w-sm mx-auto uppercase tracking-tighter italic">
                Escriba el nombre del alumno para consultar su historial institucional
              </h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
