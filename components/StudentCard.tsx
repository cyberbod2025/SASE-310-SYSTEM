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
    <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden hover:border-teal-500/50 transition-all hover:shadow-lg hover:shadow-teal-900/20 group animate-fade-in-up">
      <div className="p-4 flex items-start gap-4">
        {/* Avatar Section */}
        <div className="relative">
          <img
            src={
              student.avatar ||
              `https://ui-avatars.com/api/?name=${student.name}&background=random`
            }
            alt={student.name}
            className="size-16 rounded-full object-cover border-2 border-white/20 group-hover:border-teal-400 transition-colors"
          />
          <div
            className={`absolute bottom-0 right-0 size-4 rounded-full border-2 border-gray-900 ${statusColor}`}
            title={`Estado: ${student.caseState}`}
          ></div>
        </div>

        {/* Info Section */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h3 className="text-white font-bold truncate pr-2 group-hover:text-teal-300 transition-colors">
              {student.name}
            </h3>
            {isUdeii && privacySettings.showAccommodations && (
              <div className="relative group/tooltip">
                <span
                  className="material-symbols-outlined text-purple-400 cursor-help text-lg animate-pulse"
                  title="Alumno UDEII"
                >
                  extension
                </span>
                <div className="absolute right-0 top-6 z-50 w-64 p-3 bg-gray-900 text-xs text-gray-300 rounded-lg shadow-xl border border-purple-500/30 opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none">
                  <p className="font-bold text-purple-400 mb-1">
                    Semáforo de Adecuraciones
                  </p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Requiere instrucciones segmentadas.</li>
                    <li>Ubicación preferencial en aula.</li>
                    <li>Refuerzo positivo constante.</li>
                    <li>Verificar diagnósticos específicos con UDEII.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          <p className="text-gray-400 text-xs mb-1">
            Matrícula: {student.matricula}
          </p>

          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-gray-300 border border-white/5">
              {student.group}
            </span>
            {student.incidents.length > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                {student.incidents.length} Incidencias
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions Footer */}
      <div className="px-4 py-3 bg-white/5 border-t border-white/5 mt-2 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
        <button
          onClick={handleReport}
          className="text-xs font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-sm">flag</span>
          Reportar
        </button>

        <button className="text-xs font-bold text-gray-400 hover:text-white flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">visibility</span>
          Ver Perfil
        </button>
      </div>
    </div>
  );
};
