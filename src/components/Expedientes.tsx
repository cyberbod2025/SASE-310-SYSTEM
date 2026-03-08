import React, { useState } from "react";
import { useApp } from "../store";
import { ExpedienteInstitucional } from "../modules/expedientes/ExpedienteInstitucional";
import { DatosAlumnoExpediente } from "../modules/expedientes/types";

export const Expedientes: React.FC = () => {
  const { students } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<DatosAlumnoExpediente | null>(null);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.matricula.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <h2 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter">
            Control de Expedientes
          </h2>
          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
            Consulta Integral del Alumnado • Ciclo Escolar 2024-2025
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-2xl">
            search
          </span>
          <input
            type="text"
            className="w-full h-16 bg-white border-2 border-slate-100 rounded-[1.5rem] pl-14 pr-6 text-lg font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-xl shadow-slate-200/50 placeholder:text-slate-300"
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
                  turno: "Matutino", // Default
                  curp: s.matricula, // Using matricula as fallback for display
                  tutor: "Tutor no registrado",
                  telefono_tutor: "No disponible"
                })}
                className="w-full text-left p-5 bg-white hover:bg-blue-50/50 border border-slate-100 hover:border-blue-200 rounded-2xl flex items-center gap-5 transition-all group hover:scale-[1.01] shadow-sm"
              >
                <img
                  src={s.avatar}
                  className="size-14 rounded-xl border-2 border-white shadow-md object-cover"
                  alt=""
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">
                      {s.group}
                    </span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      {s.matricula}
                    </span>
                  </div>
                  <h4 className="text-base font-black text-slate-800 uppercase italic truncate">
                    {s.name}
                  </h4>
                </div>
                <span className="material-symbols-outlined text-slate-300 group-hover:text-blue-500 transition-colors">
                  arrow_forward_ios
                </span>
              </button>
            ))
          ) : searchTerm ? (
            <div className="text-center py-20 bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-3xl">
              <span className="material-symbols-outlined text-6xl text-slate-200 mb-4 block">
                person_search
              </span>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                No se encontraron resultados para "{searchTerm}"
              </p>
            </div>
          ) : (
            <div className="text-center py-20">
               <div className="inline-flex size-24 bg-blue-50 rounded-full items-center justify-center mb-6">
                <span className="material-symbols-outlined text-4xl text-blue-500">
                  folder_shared
                </span>
              </div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-2">
                Búsqueda de Expedientes
              </p>
              <h3 className="text-slate-600 font-black text-lg max-w-sm mx-auto">
                Escriba el nombre del alumno para consultar su historial institucional
              </h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
