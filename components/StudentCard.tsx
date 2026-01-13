import React from "react";
import { useApp } from "../store";
import { Student, UserRole, CaseState } from "../types";
import { getPrivacySafeAttributes } from "../utils/saseUtils";

interface StudentCardProps {
  student: Student;
  compact?: boolean;
}

export const StudentCard: React.FC<StudentCardProps> = ({
  student,
  compact = false,
}) => {
  const { currentUserRole, setQuickRegisterOpen } = useApp();
  const privacySettings = getPrivacySafeAttributes(currentUserRole);

  const isUdeii = student.guardianInfo?.details?.is_udeii || false;

  const handleReport = () => {
    // Pre-select student logic would go here if QuickRegister supports it.
    // For now just open the modal.
    setQuickRegisterOpen(true);
    // Ideally we dispatch an action to select this student in the store first.
  };

  const statusColor =
    {
      [CaseState.CERRADO]: "bg-green-500",
      [CaseState.OBSERVADO]: "bg-blue-500",
      [CaseState.PATRON_DETECTADO]: "bg-red-500",
    }[student.caseState] || "bg-gray-400";

  return (
    <div className="relative bg-black/40 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden group animate-fade-in-up transition-all duration-300 hover:shadow-[0_0_30px_rgba(20,184,166,0.3)] hover:border-teal-500/50 hover:-translate-y-1">
      {/* Holographic Overlay on Hover */}
      <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

      <div className="p-4 flex items-start gap-4 relative z-10">
        {/* Avatar Section */}
        <div className="relative">
          <div className="relative size-16 rounded-full p-[2px] bg-gradient-to-b from-white/20 to-transparent group-hover:from-teal-400 group-hover:to-blue-500 transition-colors">
            <img
              src={
                student.avatar ||
                `https://ui-avatars.com/api/?name=${student.name}&background=random`
              }
              alt={student.name}
              className="size-full rounded-full object-cover bg-gray-900"
            />
          </div>
          <div
            className={`absolute -bottom-1 -right-1 size-5 rounded-full border-2 border-black flex items-center justify-center ${statusColor} shadow-lg`}
            title={`Estado: ${student.caseState}`}
          >
            {student.caseState === CaseState.PATRON_DETECTADO && (
              <span className="material-symbols-outlined text-[10px] text-white font-bold animate-pulse">
                warning
              </span>
            )}
            {student.caseState === CaseState.OBSERVADO && (
              <span className="material-symbols-outlined text-[10px] text-white font-bold">
                visibility
              </span>
            )}
            {student.caseState === CaseState.CERRADO && (
              <span className="material-symbols-outlined text-[10px] text-white font-bold">
                check
              </span>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h3 className="text-white font-bold truncate pr-2 group-hover:text-teal-300 transition-colors text-lg tracking-tight">
              {student.name}
            </h3>
            {isUdeii && privacySettings.showAccommodations && (
              <div className="relative group/tooltip">
                <span
                  className="material-symbols-outlined text-purple-400 cursor-help text-lg animate-pulse drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]"
                  title="Alumno UDEII"
                >
                  extension
                </span>
                <div className="absolute right-0 top-6 z-50 w-64 p-4 bg-black/90 text-xs text-gray-300 rounded-lg shadow-2xl border border-purple-500/50 backdrop-blur-xl opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none">
                  <p className="font-bold text-purple-400 mb-2 uppercase tracking-wider border-b border-purple-500/30 pb-1">
                    Protocolo UDEII
                  </p>
                  <ul className="list-disc pl-4 space-y-1.5 marker:text-purple-500">
                    <li>Requiere instrucciones segmentadas.</li>
                    <li>Ubicación preferencial en aula.</li>
                    <li>Refuerzo positivo constante.</li>
                    <li>Verificar diagnósticos específicos con UDEII.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          <p className="text-gray-500 font-mono text-xs mb-2">
            ID: <span className="text-gray-300">{student.matricula}</span>
          </p>

          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 text-gray-300 border border-white/10 group-hover:border-teal-500/30 transition-colors">
              {student.group}
            </span>
            {student.incidents.length > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-red-500 animate-pulse"></span>
                {student.incidents.length} Incidencias
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions Footer */}
      <div className="px-4 py-3 bg-white/5 border-t border-white/5 mt-2 flex justify-between items-center opacity-70 group-hover:opacity-100 transition-all">
        <button
          onClick={handleReport}
          className="text-xs font-bold text-gray-400 hover:text-teal-400 flex items-center gap-1.5 transition-colors uppercase tracking-wide"
        >
          <span className="material-symbols-outlined text-sm">flag</span>
          Reportar
        </button>

        <button className="text-xs font-bold text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors uppercase tracking-wide">
          <span className="material-symbols-outlined text-sm">visibility</span>
          Perfil
        </button>
      </div>
    </div>
  );
};
