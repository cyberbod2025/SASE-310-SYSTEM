import React from "react";
import { motion } from "framer-motion";
import { useApp } from "../store";
import { Student, CaseState, CaseLabels } from "../types";
import { getPrivacySafeAttributes } from "../utils/saseUtils";
import { getStatusColors, getStatusIcon } from "../utils/statusUtils";

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
    setQuickRegisterOpen(true);
  };

  const statusStyle = getStatusColors(student.caseState);
  const statusIcon = getStatusIcon(student.caseState);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/10 overflow-hidden group glass-shine transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] hover:border-blue-500/50"
    >
      {/* Dynamic Background Glow */}
      <div className={`absolute -top-20 -right-20 size-40 blur-[80px] opacity-20 transition-colors duration-500 pointer-events-none ${
        student.caseState === CaseState.PATRON_DETECTADO ? "bg-rose-500" : "bg-blue-500"
      }`} />

      <div className="p-6 relative z-10">
        <div className="flex items-start gap-6">
          {/* Avatar Section */}
          <div className="relative shrink-0">
            <div className="relative size-20 rounded-[2rem] p-[3px] bg-gradient-to-br from-white/20 via-white/5 to-transparent group-hover:from-blue-400 group-hover:via-blue-500 group-hover:to-indigo-600 transition-all duration-500">
              <img
                src={
                  student.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random`
                }
                alt={student.name}
                className="size-full rounded-[1.8rem] object-cover bg-slate-900"
              />
            </div>
            <motion.div
              layoutId={`status-${student.id}`}
              className={`absolute -bottom-1 -right-1 size-7 rounded-full border-4 border-slate-950 flex items-center justify-center ${statusStyle} shadow-xl shadow-black/50`}
              title={`Estado: ${CaseLabels[student.caseState]}`}
            >
              <span className="material-icons text-[12px] text-white font-black">
                {statusIcon}
              </span>
            </motion.div>
          </div>

          {/* Info Section */}
          <div className="flex-1 min-w-0 pt-1">
            <div className="flex justify-between items-start gap-2">
              <h3 className="text-white font-bold truncate group-hover:text-blue-300 transition-colors text-xl tracking-tight leading-tight">
                {student.name}
              </h3>
              {isUdeii && privacySettings.showAccommodations && (
                <div className="relative group/tooltip">
                  <span
                    className="material-icons text-purple-400 cursor-help text-xl animate-pulse drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]"
                  >
                    psychology_alt
                  </span>
                  <div className="absolute right-0 top-8 z-50 w-72 p-5 bg-slate-950/95 text-xs text-slate-300 rounded-[2rem] shadow-2xl border border-purple-500/40 backdrop-blur-2xl opacity-0 group-hover/tooltip:opacity-100 transition-all duration-300 scale-95 group-hover/tooltip:scale-100 origin-top-right pointer-events-none">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-purple-500/20">
                      <span className="material-icons text-purple-400 text-sm">info</span>
                      <span className="font-black text-purple-400 uppercase tracking-widest text-[10px]">
                        Protocolo UDEII Activo
                      </span>
                    </div>
                    <ul className="space-y-2">
                      <li className="flex gap-2">
                        <span className="text-purple-500">•</span>
                        <span>Requiere instrucciones segmentadas y claras.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-purple-500">•</span>
                        <span>Ubicación preferencial en el aula para atención.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-purple-500">•</span>
                        <span>Refuerzo positivo constante y monitoreo.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 mt-1.5 mb-3">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-2xl border border-white/5">
                {student.matricula}
              </span>
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                Gpo: {student.group}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {student.incidents.length > 0 && (
                <span className="text-[9px] font-black px-3 py-1.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-2 uppercase tracking-widest shadow-inner">
                  <span className="size-1.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]"></span>
                  {student.incidents.length} Incidentes
                </span>
              )}
              {student.riesgoAsistencia && student.riesgoAsistencia > 15 && (
                <span className="text-[9px] font-black px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-2 uppercase tracking-widest shadow-inner">
                  <span className="material-icons text-[10px]">calendar_today</span>
                  Riesgo Asistencia
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions Footer */}
      <div className="px-6 py-4 bg-white/[0.03] border-t border-white/5 flex justify-between items-center opacity-60 group-hover:opacity-100 transition-all duration-300">
        <button
          onClick={handleReport}
          className="text-[10px] font-black text-slate-400 hover:text-rose-400 flex items-center gap-2 transition-colors uppercase tracking-widest group/btn"
        >
          <span className="material-icons text-sm group-hover/btn:scale-125 transition-transform">add_alert</span>
          Reportar
        </button>

        <button className="text-[10px] font-black text-slate-400 hover:text-white flex items-center gap-2 transition-colors uppercase tracking-widest group/btn">
          <span className="material-icons text-sm group-hover/btn:scale-125 transition-transform">account_circle</span>
          Ver Perfil
        </button>
      </div>
    </motion.div>
  );
};
