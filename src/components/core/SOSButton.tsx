import React, { useState } from "react";

interface SOSButtonProps {
  compact?: boolean;
  onActivate?: () => Promise<void> | void;
  confirmationMessage?: string;
}

export const SOSButton: React.FC<SOSButtonProps> = ({ compact = false, onActivate, confirmationMessage }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleActivate = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await Promise.race([
        Promise.resolve(onActivate?.()),
        new Promise((_, reject) => window.setTimeout(() => reject(new Error("timeout")), 10000)),
      ]);
      setOpen(true);
    } catch (error) {
      console.error("No se pudo activar SOS", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleActivate}
        disabled={loading}
        data-sasito-target="pedir-ayuda"
        className={`min-h-[44px] rounded-2xl bg-rose-600 font-black uppercase tracking-widest text-white shadow-lg shadow-rose-600/25 transition hover:bg-rose-500 disabled:cursor-wait disabled:opacity-70 ${compact ? "px-3 text-[10px]" : "px-5 text-xs"}`}
      >
        {loading ? "Activando" : "SOS"}
      </button>

      {open && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-slate-950/70 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-[2rem] border border-rose-200/20 bg-slate-950 p-6 shadow-2xl shadow-rose-900/30">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-rose-500 text-white">
                <span className="material-icons">emergency</span>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-rose-200">Protocolo SOS</p>
                <h3 className="text-xl font-black text-white">Estoy contigo.</h3>
              </div>
            </div>
            <p className="mt-5 text-sm leading-6 text-slate-200">
              {confirmationMessage || "Alerta crítica registrada en modo local. La notificación automática institucional está en preparación."}
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-6 min-h-[48px] w-full rounded-2xl bg-white px-4 py-3 text-sm font-black uppercase tracking-widest text-slate-950"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SOSButton;
