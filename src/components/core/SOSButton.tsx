import React, { useState, useRef, useEffect } from "react";

interface SOSButtonProps {
  compact?: boolean;
  onActivate?: () => Promise<void> | void;
}

export const SOSButton: React.FC<SOSButtonProps> = ({ compact = false, onActivate }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  
  const timerRef = useRef<any>(null);

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

  const startHold = (e: React.MouseEvent | React.TouchEvent) => {
    if (loading) return;
    // Evitar comportamientos predeterminados en tactil
    if (e.type === "touchstart") {
      if (e.cancelable) e.preventDefault();
    }
    
    setIsHolding(true);
    setHoldProgress(0);
    
    if (timerRef.current) clearInterval(timerRef.current);
    
    // 3000ms / 100 pasos = 30ms por paso
    timerRef.current = setInterval(() => {
      setHoldProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timerRef.current);
          setIsHolding(false);
          setHoldProgress(0);
          void handleActivate();
          return 0;
        }
        return prev + 1;
      });
    }, 30);
  };

  const cancelHold = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsHolding(false);
    setHoldProgress(0);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const getButtonText = () => {
    if (loading) return "Activando";
    if (isHolding) {
      const secondsLeft = Math.ceil((100 - holdProgress) / 33.3);
      return `Sostén ${secondsLeft}s`;
    }
    return "SOS";
  };

  const buttonStyle = isHolding
    ? {
        background: `linear-gradient(90deg, rgb(190,18,60) ${holdProgress}%, rgb(225,29,72) ${holdProgress}%)`,
      }
    : undefined;

  return (
    <>
      <button
        type="button"
        onMouseDown={startHold}
        onMouseUp={cancelHold}
        onMouseLeave={cancelHold}
        onTouchStart={startHold}
        onTouchEnd={cancelHold}
        style={buttonStyle}
        disabled={loading}
        data-sasito-target="pedir-ayuda"
        className={`min-h-[44px] rounded-2xl bg-rose-600 font-black uppercase tracking-widest text-white shadow-lg shadow-rose-600/25 transition select-none disabled:cursor-wait disabled:opacity-70 ${compact ? "px-3 text-[10px]" : "px-5 text-xs"} ${isHolding ? "scale-95 shadow-inner duration-75" : "hover:bg-rose-500 active:scale-95"}`}
      >
        {getButtonText()}
      </button>

      {open && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-slate-950/70 p-4 sm:items-center backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-[2rem] border border-rose-200/20 bg-slate-950 p-6 shadow-2xl shadow-rose-900/30 animate-scale-in">
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
              Ya notifique a Prefectura y Orientacion. Tiempo estimado: 2-5 minutos.
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-6 min-h-[48px] w-full rounded-2xl bg-white px-4 py-3 text-sm font-black uppercase tracking-widest text-slate-950 hover:bg-slate-100 transition active:scale-95"
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
