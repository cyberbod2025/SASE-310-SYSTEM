import React, { useEffect } from 'react';
import { Student, CaseState, UserRole } from '../types';
import { PrintButtons } from './PrintButtons';
import { useApp } from '../store';

interface StudentCardProps {
  student: Student;
  // Props can still override, but default checks useApp
  showSensitiveData?: boolean; 
  showBAP?: boolean;
}

export const StudentCard: React.FC<StudentCardProps> = ({ student, showSensitiveData: propShowSensitive, showBAP: propShowBAP }) => {
  const { currentUserRole, isTutorMode, logAccess } = useApp();
  
  // Rule of 3 Logic for Progress Bar
  const incidentCount = student.incidents.length;
  const progressPercent = Math.min((incidentCount / 3) * 100, 100);

  // Determine sensitive data visibility
  const canViewSensitive = propShowSensitive ?? (currentUserRole === UserRole.SECRETARIA || (currentUserRole === UserRole.DOCENTE && isTutorMode));
  const canViewBAP = propShowBAP ?? true; // BAP accommodations usually visible to teachers

  // Audit Logging
  useEffect(() => {
    if (canViewSensitive && student.guardianInfo) {
       // Debounce or check? For demo, we just log once per mount/update if visible
       logAccess("Acceso a Datos del Tutor", student.id);
    }
  }, [canViewSensitive, student.id, student.guardianInfo]); // Removing logAccess from dep array to avoid loops if it were unstable
  
  const getStatusColor = (state: CaseState) => {
    switch(state) {
      case CaseState.CERRADO: return 'bg-gray-100 text-gray-600';
      case CaseState.OBSERVADO: return 'bg-blue-50 text-blue-700';
      case CaseState.PATRON_DETECTADO: return 'bg-alert-red/10 text-alert-red animate-pulse'; // Visual urgency
      case CaseState.INTERVENCION: return 'bg-alert-yellow/10 text-alert-yellow';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-border-color shadow-sm p-5 hover:shadow-md transition-shadow relative">
      <div className="flex justify-between items-start mb-4">
         <div className="flex gap-4">
            <img src={student.avatar} alt={student.name} className="w-12 h-12 rounded-full border border-gray-100" />
            <div>
               <h3 className="font-bold text-text-main">{student.name}</h3>
               <p className="text-xs text-text-secondary">{student.group} • {student.matricula}</p>
            </div>
         </div>
         <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(student.caseState)}`}>
            {student.caseState}
         </span>
      </div>

      {/* Rule of 3 Visualizer */}
      <div className="mb-4">
         <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-text-secondary">Incidencias Recientes (Regla de 3)</span>
            <span className="text-xs font-bold text-text-main">{incidentCount} / 3</span>
         </div>
         <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${incidentCount >= 3 ? 'bg-alert-red' : 'bg-primary'}`} 
              style={{ width: `${progressPercent}%` }}
            ></div>
         </div>
         {incidentCount >= 3 && (
            <p className="text-[10px] text-alert-red font-bold mt-1">⚠ Patrón Detectado: Se requiere intervención.</p>
         )}
      </div>

      {/* Sensitive Data: BAP Info (Accommodations Only) */}
      {canViewBAP && student.bapInfo?.hasBAP && (
          <div className="mb-4 bg-purple-50 border border-purple-100 rounded-lg p-3 text-xs">
              <p className="font-bold text-purple-800 flex items-center gap-1 mb-1">
                  <span className="material-symbols-outlined text-sm">accessibility_new</span>
                  Ajustes Razonables (UDEII)
              </p>
              <ul className="list-disc list-inside text-purple-900/80">
                  {student.bapInfo.accommodations.map((acc, i) => <li key={i} className="truncate">{acc}</li>)}
              </ul>
          </div>
      )}

      {/* Sensitive Data: Guardian Info (Protected) */}
      {canViewSensitive && student.guardianInfo && (
          <div className="mb-4 bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs animate-fade-in">
              <p className="font-bold text-blue-800 mb-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">face</span>
                Contacto Tutor
              </p>
              <p className="text-blue-900">{student.guardianInfo.name} ({student.guardianInfo.relationship})</p>
              <p className="font-mono font-bold text-blue-700">{student.guardianInfo.phonePrimary}</p>
              {student.guardianInfo.address && <p className="text-blue-800/70 truncate mt-1">{student.guardianInfo.address}</p>}
          </div>
      )}

      <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
         <button className="text-sm font-medium text-primary hover:underline">Ver Expediente</button>
         <PrintButtons compact />
      </div>
    </div>
  );
};