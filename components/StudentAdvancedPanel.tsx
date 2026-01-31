import React, { useState } from "react";
import {
  Student,
  Calificacion,
  DocumentoInstitucional,
  UserRole,
} from "../types";
import { useApp } from "../store";
import { printContent } from "./PrintButtons";
import { AIDocumentGenerator } from "./ai/AIDocumentGenerator";
import toast from "react-hot-toast";

interface StudentAdvancedPanelProps {
  student: Student;
  onClose: () => void;
}

export const StudentAdvancedPanel: React.FC<StudentAdvancedPanelProps> = ({
  student,
  onClose,
}) => {
  const { currentUserRole, updateGrades, toggleDistanceState } = useApp();
  const [activeTab, setActiveTab] = useState<"GRADES" | "DOCS" | "SETTINGS">(
    "GRADES",
  );
  const [showAIGenerator, setShowAIGenerator] = useState(false);

  const canEditGrades =
    currentUserRole === UserRole.SECRETARIA ||
    currentUserRole === UserRole.DEVELOPER;

  const handleUpdateGrades = (
    materia: string,
    field: string,
    value: string,
  ) => {
    if (!canEditGrades) return;
    const currentGrades = student.calificaciones || [];
    const updatedGrades = currentGrades.map((g) => {
      if (g.materia === materia) {
        return { ...g, [field]: Number(value) };
      }
      return g;
    });
    updateGrades(student.id, updatedGrades);
  };

  const handlePrintDoc = (doc: DocumentoInstitucional) => {
    printContent(
      doc.titulo,
      `<div style="white-space: pre-wrap;">${doc.contenido}</div>`,
    );
  };

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
      <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[85vh] relative">
        {/* Header Section */}
        <div className="bg-slate-50 border-b border-slate-100 p-8 flex justify-between items-start shrink-0">
          <div className="flex gap-6 items-center">
            <div className="size-20 rounded-3xl bg-white border border-slate-200 p-1 shadow-sm overflow-hidden">
              <img
                src={student.avatar}
                alt=""
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="bg-slate-800 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
                  {student.matricula}
                </span>
                {student.isDistancia && (
                  <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded border border-amber-200 uppercase tracking-widest animate-pulse">
                    MODALIDAD A DISTANCIA
                  </span>
                )}
              </div>
              <h2 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter leading-none">
                {student.name}
              </h2>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">
                Expediente Médico y Académico Integrado
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-all border border-slate-100 shadow-sm"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-8 pt-4 border-b border-slate-100 flex gap-1 shrink-0">
          {[
            { id: "GRADES", label: "Calificaciones", icon: "grade" },
            { id: "DOCS", label: "Documentos e IA", icon: "description" },
            {
              id: "SETTINGS",
              label: "Gestión Operativa",
              icon: "settings_suggest",
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-4 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all relative ${
                activeTab === tab.id
                  ? "text-slate-800"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <span className="material-symbols-outlined text-lg">
                {tab.icon}
              </span>
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-800 rounded-t-full"></div>
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/30">
          {activeTab === "GRADES" && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase">
                        Asignatura
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase text-center">
                        Trim 1
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase text-center">
                        Trim 2
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase text-center">
                        Trim 3
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase text-center">
                        Promedio
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(student.calificaciones || []).map((cal) => (
                      <tr
                        key={cal.materia}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 font-black text-slate-800 uppercase italic text-sm">
                          {cal.materia}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <input
                            type="number"
                            value={cal.trimestre1 || ""}
                            disabled={!canEditGrades}
                            onChange={(e) =>
                              handleUpdateGrades(
                                cal.materia,
                                "trimestre1",
                                e.target.value,
                              )
                            }
                            className={`w-12 p-2 rounded-lg text-center font-bold text-sm ${canEditGrades ? "bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500" : "bg-transparent border-none"}`}
                          />
                        </td>
                        <td className="px-6 py-4 text-center">
                          <input
                            type="number"
                            value={cal.trimestre2 || ""}
                            disabled={!canEditGrades}
                            onChange={(e) =>
                              handleUpdateGrades(
                                cal.materia,
                                "trimestre2",
                                e.target.value,
                              )
                            }
                            className={`w-12 p-2 rounded-lg text-center font-bold text-sm ${canEditGrades ? "bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500" : "bg-transparent border-none"}`}
                          />
                        </td>
                        <td className="px-6 py-4 text-center">
                          <input
                            type="number"
                            value={cal.trimestre3 || ""}
                            disabled={!canEditGrades}
                            onChange={(e) =>
                              handleUpdateGrades(
                                cal.materia,
                                "trimestre3",
                                e.target.value,
                              )
                            }
                            className={`w-12 p-2 rounded-lg text-center font-bold text-sm ${canEditGrades ? "bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500" : "bg-transparent border-none"}`}
                          />
                        </td>
                        <td className="px-6 py-4 text-center font-black text-slate-800">
                          {(
                            ((cal.trimestre1 || 0) +
                              (cal.trimestre2 || 0) +
                              (cal.trimestre3 || 0)) /
                            3
                          ).toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!canEditGrades && (
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-3">
                  <span className="material-symbols-outlined text-blue-600">
                    info
                  </span>
                  <p className="text-xs font-bold text-blue-700 uppercase tracking-widest">
                    Las calificaciones están en modo Lectura. Solo Secretaría
                    puede modificarlas.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "DOCS" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-slate-900 p-6 rounded-[2rem] text-white shadow-xl">
                <div>
                  <h3 className="text-xl font-black uppercase italic italic tracking-tighter">
                    Archivo Digital IA
                  </h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Generación y resguardo de actas institucionales
                  </p>
                </div>
                <button
                  onClick={() => setShowAIGenerator(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    auto_awesome
                  </span>
                  Generar Documento con IA
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(student.documentos || []).length === 0 ? (
                  <div className="col-span-2 p-20 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center text-slate-300">
                    <span className="material-symbols-outlined text-6xl mb-4">
                      folder_open
                    </span>
                    <p className="text-xs font-black uppercase tracking-[0.2em]">
                      Sin documentos almacenados
                    </p>
                  </div>
                ) : (
                  student.documentos?.map((doc) => (
                    <div
                      key={doc.id}
                      className="bg-white border border-slate-200 p-6 rounded-3xl hover:border-slate-800 transition-all group flex flex-col justify-between shadow-sm"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <span className="bg-slate-100 text-slate-600 text-[9px] font-black px-2 py-0.5 rounded uppercase">
                            {doc.tipo}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">
                            {new Date(doc.fecha).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="font-black text-slate-800 uppercase italic mb-2 leading-tight">
                          {doc.titulo}
                        </h4>
                        <p className="text-[11px] font-medium text-slate-500 line-clamp-3 italic">
                          {doc.contenido}
                        </p>
                      </div>
                      <div className="mt-6 flex justify-between items-center pt-4 border-t border-slate-50">
                        <span className="text-[9px] font-black text-slate-400 uppercase">
                          Folio: {doc.folio}
                        </span>
                        <button
                          onClick={() => handlePrintDoc(doc)}
                          className="bg-slate-50 hover:bg-slate-100 p-2 rounded-xl text-slate-400 hover:text-slate-800 transition-all"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            print
                          </span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "SETTINGS" && (
            <div className="space-y-8">
              <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">
                  Controles Institucionales
                </h3>

                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <div className="flex gap-4">
                    <div
                      className={`size-12 rounded-2xl flex items-center justify-center ${student.isDistancia ? "bg-amber-100 text-amber-600" : "bg-white text-slate-400"} border border-slate-200 shadow-sm`}
                    >
                      <span className="material-symbols-outlined">
                        {student.isDistancia ? "distance" : "school"}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800 uppercase tracking-tight">
                        Modalidad "A Distancia"
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        Habilitar trabajo académico desde casa
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      toggleDistanceState(student.id, !student.isDistancia)
                    }
                    className={`px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                      student.isDistancia
                        ? "bg-amber-600 text-white shadow-lg shadow-amber-200"
                        : "bg-white text-slate-800 border-2 border-slate-800"
                    }`}
                  >
                    {student.isDistancia
                      ? "Desactivar Modalidad"
                      : "Activar Modalidad"}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                  <button className="p-6 bg-white border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400 hover:border-slate-800 hover:text-slate-800 transition-all flex flex-col items-center gap-2">
                    <span className="material-symbols-outlined text-3xl">
                      safety_divider
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Protocolo Antibullying
                    </span>
                  </button>
                  <button className="p-6 bg-white border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400 hover:border-slate-800 hover:text-slate-800 transition-all flex flex-col items-center gap-2">
                    <span className="material-symbols-outlined text-3xl">
                      monitor_heart
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Plan de Atención Integral
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {showAIGenerator && (
          <AIDocumentGenerator
            studentId={student.id}
            studentName={student.name}
            onClose={() => setShowAIGenerator(false)}
          />
        )}
      </div>
    </div>
  );
};
