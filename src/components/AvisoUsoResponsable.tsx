import { VERSION, INSTITUCION } from "../config/sase.config";

interface AvisoUsoResponsableProps {
  onAccept: () => void;
  onReject: () => void;
  studentName: string;
}

/**
 * Modal institucional que advierte al usuario que el acceso
 * a información sensible queda registrado en la bitácora.
 * El usuario DEBE aceptar antes de continuar.
 */
export const AvisoUsoResponsable: React.FC<AvisoUsoResponsableProps> = ({
  onAccept,
  onReject,
  studentName,
}) => {
  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in font-['Inter']">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
        {/* Header con ícono de seguridad y Branding Institucional */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100 px-8 py-6">
          <div className="flex justify-between items-start mb-4">
             <div className="size-14 bg-amber-100 rounded-2xl flex items-center justify-center border border-amber-200 shadow-sm flex-shrink-0">
              <span className="material-icons text-amber-600 text-3xl">
                shield_lock
              </span>
            </div>
            <div className="text-right">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">CCT {INSTITUCION.cct}</span>
              <span className="text-[8px] font-black text-amber-600 uppercase tracking-widest block">v{VERSION.numero}</span>
            </div>
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide">
              Aviso de Uso Responsable
            </h2>
            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mt-0.5">
              Protocolo SASE — Información Sensible
            </p>
          </div>
        </div>

        {/* Cuerpo del aviso */}
        <div className="px-8 py-6 space-y-5">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Está a punto de acceder al expediente integral del alumno{" "}
              <span className="font-black text-slate-800">{studentName}</span>.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
            <span className="material-icons text-amber-500 text-xl flex-shrink-0 mt-0.5">
              visibility
            </span>
            <p className="text-xs text-amber-800 leading-relaxed font-semibold">
              El acceso a información sensible queda registrado en la bitácora
              institucional de forma automática, incluyendo su identidad, rol,
              fecha, hora y tipo de consulta realizada.
            </p>
          </div>

          <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <span className="material-icons text-blue-500 text-xl flex-shrink-0 mt-0.5">
              policy
            </span>
            <p className="text-[11px] text-blue-800 leading-relaxed font-medium">
              Al continuar, usted confirma que el uso de esta información es
              estrictamente institucional y se compromete a resguardar la
              confidencialidad del alumno conforme al reglamento interno y la
              Ley General de Protección de Datos Personales.
            </p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="px-8 pb-6 flex gap-3">
          <button
            onClick={onReject}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
          >
            Cancelar
          </button>
          <button
            onClick={onAccept}
            id="btn-aceptar-acceso-sensible"
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:shadow-xl shadow-black/5 hover:shadow-blue-500/25 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span className="material-icons text-sm">
              verified_user
            </span>
            Acepto y Continúo
          </button>
        </div>
      </div>
    </div>
  );
};
