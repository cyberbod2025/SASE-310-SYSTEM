import React, { useEffect, useState, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

interface SpotlightStep {
  element: string;
  title: string;
  description: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
}

interface TacticalSpotlightProps {
  steps: SpotlightStep[];
  isActive: boolean;
  onComplete: () => void;
  onClose: () => void;
  userName?: string;
}

export const TacticalSpotlight: React.FC<TacticalSpotlightProps> = ({
  steps,
  isActive,
  onComplete,
  onClose,
  userName = "Usuario"
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const requestRef = useRef<number>(undefined);

  const step = steps[currentStep];
  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, Math.max(min, max)));

  const resolveTarget = () => {
    if (!step?.element) return null;
    return document.querySelector(step.element) as HTMLElement | null;
  };

  const updateRect = () => {
    if (!isActive || !step?.element) return;
    const el = resolveTarget();
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      setTargetRect(null);
    }
    requestRef.current = requestAnimationFrame(updateRect);
  };

  useEffect(() => {
    if (isActive) {
      const el = resolveTarget();

      if (el) {
        el.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' });
        el.classList.add('sasito-spotlight-target');
        window.setTimeout(updateRect, 350);
      } else if (import.meta.env.DEV && step?.element) {
        console.warn(`Sasito spotlight target not found: ${step.element}`);
      }

      updateRect();
      const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', updateRect, true);
      return () => {
        el?.classList.remove('sasito-spotlight-target');
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', updateRect, true);
      };
    }
  }, [isActive, currentStep]);

  const popoverPosition = useMemo(() => {
    const margin = 16;
    const popoverWidth = Math.min(320, windowSize.width - margin * 2);
    const popoverHeight = Math.min(windowSize.width < 640 ? 300 : 260, windowSize.height - margin * 2);

    if (!targetRect) {
      return {
        top: clamp(windowSize.height / 2 - popoverHeight / 2, margin, windowSize.height - popoverHeight - margin),
        left: clamp(windowSize.width / 2 - popoverWidth / 2, margin, windowSize.width - popoverWidth - margin),
        width: popoverWidth,
      };
    }

    const padding = 20;
    const side = step.side || 'bottom';
    const centerX = targetRect.left + targetRect.width / 2;
    const centerY = targetRect.top + targetRect.height / 2;
    const safeLeft = (left: number) => clamp(left, margin, windowSize.width - popoverWidth - margin);
    const safeTop = (top: number) => clamp(top, margin, windowSize.height - popoverHeight - margin);
    
    switch (side) {
      case 'top':
        return { 
          top: safeTop(targetRect.top - popoverHeight - padding),
          left: safeLeft(centerX - popoverWidth / 2),
          width: popoverWidth,
        };
      case 'bottom':
        return { 
          top: safeTop(targetRect.bottom + padding),
          left: safeLeft(centerX - popoverWidth / 2),
          width: popoverWidth,
        };
      case 'left':
        return { 
          top: safeTop(centerY - popoverHeight / 2),
          left: safeLeft(targetRect.left - popoverWidth - padding),
          width: popoverWidth,
        };
      case 'right':
        return { 
          top: safeTop(centerY - popoverHeight / 2),
          left: safeLeft(targetRect.right + padding),
          width: popoverWidth,
        };
    }
  }, [targetRect, step, windowSize]);

  const arrowPath = useMemo(() => {
    if (!targetRect) return "";
    const side = step.side || 'bottom';
    // Flecha táctica desde el popover al centro del objetivo
    switch (side) {
      case 'top': return "M 0 0 L -10 -15 L 10 -15 Z"; // Apuntando abajo
      case 'bottom': return "M 0 0 L -10 15 L 10 15 Z"; // Apuntando arriba
      default: return "";
    }
  }, [targetRect, step]);

  if (!isActive) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 pointer-events-none font-['Inter']">
      {/* Overlay con Máscara SVG */}
      <svg className="absolute inset-0 w-full h-full pointer-events-auto">
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {targetRect && (
              <motion.rect
                initial={false}
                animate={{
                  x: targetRect.left - 8,
                  y: targetRect.top - 8,
                  width: targetRect.width + 16,
                  height: targetRect.height + 16,
                  rx: 16
                }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.75)"
          mask="url(#spotlight-mask)"
          style={{ backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        />
      </svg>

      {targetRect && (
        <motion.div
          aria-hidden="true"
          initial={false}
          animate={{
            x: targetRect.left - 10,
            y: targetRect.top - 10,
            width: targetRect.width + 20,
            height: targetRect.height + 20,
          }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="absolute pointer-events-none rounded-[1.5rem] border-2 border-emerald-300/90 shadow-[0_0_0_1px_rgba(34,211,238,0.35),0_0_35px_rgba(52,211,153,0.55),0_0_80px_rgba(129,106,184,0.28)] ring-2 ring-cyan-300/40 animate-pulse"
        />
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          style={popoverPosition as any}
          className="absolute pointer-events-auto max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] overflow-y-auto bg-[#121018]/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-[0_40px_100px_rgba(0,0,0,0.6),0_0_40px_rgba(129,106,184,0.15)] p-6"
        >
          {/* Sasito Orb Mini */}
          <div className="flex items-center gap-3 mb-4">
            <div className="size-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-[0_0_15px_rgba(52,211,153,0.4)]">
              <div className="flex gap-1.5">
                <span className="w-1 h-3 bg-white rounded-full animate-pulse" />
                <span className="w-1 h-3 bg-white rounded-full animate-pulse" />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Guía Táctica SASE</p>
              <h4 className="text-sm font-black text-white uppercase italic">{step.title}</h4>
            </div>
          </div>

          <p className="text-slate-300 text-xs leading-relaxed font-medium mb-6">
            {step.description}
          </p>

          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-1">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1 rounded-full transition-all ${i === currentStep ? 'w-4 bg-emerald-400' : 'w-1 bg-white/10'}`} 
                />
              ))}
            </div>
            <div className="flex gap-2">
              {currentStep > 0 && (
                <button 
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                >
                  <ChevronLeft className="size-5" />
                </button>
              )}
              <button 
                onClick={() => {
                  if (currentStep < steps.length - 1) {
                    setCurrentStep(prev => prev + 1);
                  } else {
                    onComplete();
                  }
                }}
                className="h-10 px-4 rounded-xl bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95 transition-all"
              >
                {currentStep === steps.length - 1 ? 'Finalizar' : 'Siguiente'}
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

          {/* Botón Cerrar */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
          >
            <X className="size-4" />
          </button>

          {/* Flecha Táctica (SVG Arrow) */}
          {targetRect && (
            <div 
              className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
              style={{
                [step.side === 'top' ? 'bottom' : 'top']: '-12px',
                transform: `translateX(-50%) ${step.side === 'top' ? 'rotate(180deg)' : ''}`
              }}
            >
              <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
                <path d="M12 0L24 12H0L12 0Z" fill="#121018" fillOpacity="0.95" />
                <path d="M12 1L23 12H1L12 1Z" stroke="rgba(255,255,255,0.1)" />
              </svg>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>,
    document.body
  );
};
