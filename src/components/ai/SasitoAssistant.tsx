import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, X, MessageSquare, Info, AlertTriangle, Zap } from "lucide-react";
import { useApp } from "../../store";
import { UserRole, AppModule } from "../../types";
import { SaseSplineOrb } from "../SaseSplineOrb";
import toast from "react-hot-toast";
import { trySasitoL3Bridge } from "./sasito/sasitoBridge";

export type SasitoState = 'calm' | 'attention' | 'alert' | 'processing' | 'rebooting';

interface Suggestion {
  text: string;
  state: SasitoState | null;
  actionLabel?: string;
  infoLabel?: string;
  actionType?: string;
}

interface SasitoProps {
  minimal?: boolean; // If true, no chat, no mic, no suggestions (for Login)
  isWidgetMode?: boolean;
  suppressAssistant?: boolean;
  suppressSuggestions?: boolean;
}

const ACTION_MODULES: Record<string, AppModule> = {
  asistencia: AppModule.ASISTENCIA,
  dashboard: AppModule.DASHBOARD,
  documentacion: AppModule.DOCUMENTACION,
  expedientes: AppModule.EXPEDIENTES,
  notifications: AppModule.NOTIFICATIONS,
  reportes: AppModule.REPORTES,
};

/**
 * SasitoAssistant: Copiloto Institucional Único
 * Actúa como Wrapper de Lógica y UI de Chat, delegando el render visual a SaseSplineOrb.
 */
export const SasitoAssistant: React.FC<SasitoProps> = ({ minimal = false, isWidgetMode = false, suppressAssistant = false, suppressSuggestions = false }) => {
  const {
    currentUserRole,
    currentModule,
    setCurrentModule,
    setQuickRegisterOpen,
    setIsAssistantOpen,
    aiSystemState,
    students,
    notifications,
    currentUserProfile,
    isTourActive,
    setIsTourActive,
    tourStep,
    setTourStep,
    assistantSuggestion,
    setAssistantSuggestion,
    onboarding,
    updateOnboarding,
  } = useApp();

  const [localState, setLocalState] = useState<SasitoState>('calm');
  const [currentSuggestion, setCurrentSuggestion] = useState<Suggestion | null>(null);
  const [isBubbleExpanded, setIsBubbleExpanded] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showDragHint, setShowDragHint] = useState(true);
  const currentUserName = currentUserProfile?.nombre_completo || currentUserProfile?.full_name || '';
  
  const constraintsRef = useRef(null);
  const proactiveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (minimal || isWidgetMode || suppressSuggestions) return;
    const timer = setTimeout(() => setShowDragHint(false), 7000);
    return () => clearTimeout(timer);
  }, [minimal, isWidgetMode]);

  // -- NEW ONBOARDING SYSTEM (Step 0 - Bienvenida) --
  useEffect(() => {
    if (minimal || isWidgetMode) return;
    
    if (!onboarding.completed && onboarding.step === 0 && !currentSuggestion) {
      const timer = setTimeout(() => {
        setLocalState('attention');
        setCurrentSuggestion({
          text: `¡Hola ${currentUserName.split(' ')[0] || ''}! Soy Sasito. Para que aproveches SASE-310 al máximo, ¿te enseño lo esencial en 3 pasos?`,
          state: 'attention',
          actionLabel: "INICIAR",
          actionType: "onboarding-start"
        });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [onboarding.completed, onboarding.step, minimal, isWidgetMode, suppressSuggestions, currentUserName, currentSuggestion]);

  // Sync visuals with Tour Steps
  useEffect(() => {
    if (!isTourActive) return;
    
    if (tourStep === 4) {
      setLocalState('alert');
    } else if (tourStep === 3 || tourStep === 5) {
      setLocalState('attention');
    } else if (tourStep >= 6) {
      setLocalState('calm');
    } else {
      setLocalState('calm');
    }
  }, [isTourActive, tourStep]);

  // Sync with global suggestions (Proactive Help)
  useEffect(() => {
    if (assistantSuggestion && !suppressSuggestions) {
      setCurrentSuggestion(assistantSuggestion as Suggestion);
      if (assistantSuggestion.state) setLocalState(assistantSuggestion.state as SasitoState);
      const timer = setTimeout(() => {
        setCurrentSuggestion(null);
        setAssistantSuggestion(null);
      }, 12000);
      return () => clearTimeout(timer);
    }
  }, [assistantSuggestion, setAssistantSuggestion, suppressSuggestions]);

  useEffect(() => {
    if (!suppressSuggestions) return;
    setIsChatOpen(false);
    setCurrentSuggestion(null);
  }, [suppressSuggestions]);

  // Sync with global system state
  useEffect(() => {
    if (aiSystemState === 'alert') setLocalState('alert');
    else if (aiSystemState === 'warning') setLocalState('attention');
    else if (localState === 'processing') return;
    else setLocalState('calm');
  }, [aiSystemState]);

  const saseSuggestions = useMemo(() => {
    const suggestions: Suggestion[] = [];

    if (currentUserRole === UserRole.PREFECTURA) {
      suggestions.push({ text: "¿Revisamos los alumnos que no han entrado a clase?", state: 'attention', actionLabel: "Ver Asistencias", actionType: "module-asistencia" });
    }

    const unread = notifications.filter(n => !n.read).length;
    if (unread > 0) {
      suggestions.push({ text: `Tienes ${unread} notificaciones pendientes por leer.`, state: 'attention', actionLabel: "Ver Avisos", actionType: "module-dashboard" });
    }

    const highRisk = students.filter(s => s.caseState === 'INTERVENCION').length;
    if (highRisk > 0) {
      suggestions.push({ text: `Hay ${highRisk} alumnos en estado de INTERVENCIÓN crítica.`, state: 'alert', actionLabel: "Ver Alertas", actionType: "module-reportes" });
    }

    return suggestions;
  }, [currentUserRole, notifications, students]);

  // Sugerencias proactivas — solo cuando hay algo relevante que decir
  // Intervalo largo (90s) y baja probabilidad (15%) para no ser molesto
  useEffect(() => {
    if (minimal || suppressSuggestions) return;
    const interval = setInterval(() => {
      if (saseSuggestions.length > 0 && Math.random() > 0.85 && !isBubbleExpanded && !isChatOpen) {
        const suggestion = saseSuggestions[Math.floor(Math.random() * saseSuggestions.length)];
        setCurrentSuggestion(suggestion);
        if (suggestion.state) setLocalState(suggestion.state);
        if (proactiveTimerRef.current) clearTimeout(proactiveTimerRef.current);
        proactiveTimerRef.current = setTimeout(() => setCurrentSuggestion(null), 6000);
      }
    }, 90000);
    return () => {
      clearInterval(interval);
      if (proactiveTimerRef.current) clearTimeout(proactiveTimerRef.current);
    };
  }, [minimal, suppressSuggestions, isBubbleExpanded, isChatOpen, saseSuggestions]);

  const INTENT_RULES = [
    {
      intent: "Generar Documentos Legales",
      keywords: ["acta de hechos", "hoja de acuerdos", "minuta", "imprimir", "documento", "citatorio"],
      allowedRoles: [UserRole.TRABAJO_SOCIAL, UserRole.DIRECTIVO, UserRole.SUBDIRECCION, UserRole.PREFECTURA, UserRole.ORIENTACION],
      moduleTarget: AppModule.DOCUMENTACION, 
      successText: "Abriendo el Sistema de Documentación Institucional para elaborar el oficio.",
      deniedText: "Protocolo denegado: Solo Trabajo Social, Prefectura, Orientación o Dirección pueden emitir Actas de Hechos y Minutas Oficiales."
    },
    {
      intent: "Solicitar Historial / Expedientes",
      keywords: ["historial academico", "pedir historial", "expediente academico", "archivo", "calificaciones previas"],
      allowedRoles: [UserRole.TRABAJO_SOCIAL, UserRole.DIRECTIVO, UserRole.ORIENTACION, UserRole.SUBDIRECCION],
      moduleTarget: AppModule.EXPEDIENTES,
      successText: "Enrutando al Archivo Central. Desde aquí puedes solicitar el historial a la plantilla docente.",
      deniedText: "Acceso Restringido. Las solicitudes masivas de historial a docentes corresponden al área de Trabajo Social, Subdirección u Orientación."
    },
    {
      intent: "Programar en Agenda y Calendario Escolar",
      keywords: ["agendar evento", "semana de evaluaciones", "calendario", "recordatorio escolar", "programar junta"],
      allowedRoles: [UserRole.DIRECTIVO, UserRole.SUBDIRECCION, UserRole.SECRETARIA],
      moduleTarget: AppModule.AGENDA,
      successText: "Abriendo la Agenda Institucional. Aquí puedes programar el evento escolar y notificar automáticamente a los profesores.",
      deniedText: "Modificación de calendario no autorizada. Agendar eventos globales y evaluaciones requiere validación Directiva o de Secretaría."
    },
    {
      intent: "Consultar Notificaciones",
      keywords: ["notificaciones", "avisos", "campana", "pendientes", "alertas"],
      allowedRoles: Object.values(UserRole),
      moduleTarget: AppModule.NOTIFICATIONS,
      successText: "Abriendo el centro de notificaciones para revisar tus avisos pendientes.",
      deniedText: "Tu perfil no tiene un centro de notificaciones configurado."
    }
  ];

  const processInput = (text: string) => {
    if (!text.trim()) return;
    setLocalState('processing');
    setChatInput('');
    
    const normalized = text.toLowerCase();
    
    setTimeout(() => {
      setLocalState('calm');
      
      if (normalized.includes("onboarding-start")) {
        updateOnboarding({ step: 1 });
        setCurrentSuggestion({ 
          text: "¡Excelente! Paso 1: El tablero central te muestra el pulso de la escuela en tiempo real. Usa el menú lateral para moverte entre áreas.", 
          state: 'calm',
          actionLabel: "ENTENDIDO",
          actionType: "onboarding-step-1"
        });
        return;
      }

      if (normalized.includes("onboarding-step-1")) {
        updateOnboarding({ step: 2 });
        setCurrentSuggestion({ 
          text: "Paso 2: Si necesitas reportar algo urgente, usa el botón rojo de REPORTE RÁPIDO. Es la herramienta operativa más ágil.", 
          state: 'attention',
          actionLabel: "SIGUIENTE",
          actionType: "onboarding-step-2"
        });
        return;
      }

      if (normalized.includes("onboarding-step-2")) {
        updateOnboarding({ completed: true, step: 3 });
        setCurrentSuggestion({ 
          text: "¡Listo! Ya puedes usar el sistema. Sasito y el manual estarán siempre aquí para apoyarte. ¡Mucho éxito!", 
          state: 'calm',
          actionLabel: "EMPEZAR",
          actionType: "onboarding-finish"
        });
        return;
      }
      
      // --- SECURITY & INSTITUTIONAL RULES ---
      if (normalized.includes("cambiar rol") || normalized.includes("hazme director") || 
          normalized.includes("quiero ser admin") || normalized.includes("acceso total") || 
          normalized.includes("subir de puesto")) {
        setLocalState('alert');
        setCurrentSuggestion({ 
          text: "Lo siento, como asistente institucional no tengo permitido modificar jerarquías ni roles de usuario. Por favor, contacta a Soporte Técnico.", 
          state: 'alert' 
        });
        toast.error("Acceso denegado: Intento de cambio de rol no autorizado.");
        return;
      }

      if (normalized.includes("borra") || normalized.includes("eliminar") || normalized.includes("destruir") || normalized.includes("limpiar")) {
        setLocalState('attention');
        setCurrentSuggestion({ 
          text: "Protocolo de integridad y trazabilidad SASE: Se prohíbe estrictamente la eliminación física de registros escolares. Toda actividad queda registrada en la bitácora de auditoría.", 
          state: 'attention' 
        });
        return;
      }

      if (normalized.includes("quitar intervencion") || normalized.includes("eliminar sancion")) {
        setLocalState('attention');
        setCurrentSuggestion({ 
          text: "El estado de INTERVENCIÓN es calculado exclusivamente por el Motor de Riesgo en PostgreSQL. No puedo alterarlo manualmente.", 
          state: 'attention' 
        });
        return;
      }

      // --- INTENTS & HELPFUL NAVIGATION ---
      if (normalized.includes("quien soy") || normalized.includes("mi rol") || 
          normalized.includes("mi cargo") || normalized.includes("mi puesto") || 
          normalized.includes("mi perfil") || normalized.includes("que puedo hacer")) {
        let roleExplanation = "";
        switch (currentUserRole) {
          case UserRole.DIRECTIVO:
            roleExplanation = "Tu rol actual es Dirección (Directivo). Tienes acceso a la supervisión de casos críticos, informes ejecutivos, control de expedientes y resoluciones.";
            break;
          case UserRole.SUBDIRECCION:
            roleExplanation = "Tu rol actual es Subdirección. Tienes acceso a la coordinación académica general, planeaciones NEM y supervisión del protocolo de convivencia.";
            break;
          case UserRole.SECRETARIA:
            roleExplanation = "Tu rol actual es Secretaría. Tienes acceso a la gestión de inscripciones, control del archivo central y trámite de credenciales.";
            break;
          case UserRole.PREFECTURA:
            roleExplanation = "Tu rol actual es Prefectura. Tienes acceso al registro rápido de incidencias, bitácora de asistencia y resguardo de objetos retenidos.";
            break;
          case UserRole.ORIENTACION:
            roleExplanation = "Tu rol actual es Orientación. Tienes acceso al expediente psicopedagógico, atención socioemocional y canalizaciones institucionales.";
            break;
          case UserRole.TRABAJO_SOCIAL:
            roleExplanation = "Tu rol actual es Trabajo Social. Tienes acceso al tracker familiar, visitas domiciliarias y contacto directo con tutores.";
            break;
          case UserRole.MEDICO_ESCOLAR:
            roleExplanation = "Tu rol actual es Servicio Médico. Tienes acceso a la ficha de salud, control de padecimientos y justificación de inasistencias médicas.";
            break;
          case UserRole.UDEII:
            roleExplanation = "Tu rol actual es UDEII. Tienes acceso al expediente de Barreras para el Aprendizaje y la Participación (BAP) y ajustes curriculares.";
            break;
          case UserRole.PROMOTORA_LECTURA:
            roleExplanation = "Tu rol actual es Fomento a la Lectura. Tienes acceso al registro de círculos de lectura y control de préstamos bibliotecarios.";
            break;
          case UserRole.DOCENTE:
          case UserRole.DOCENTE_TUTOR:
            roleExplanation = "Tu rol actual es Docente / Tutor. Tienes acceso al pase de lista en aula, captura de calificaciones y detección pedagógica temprana.";
            break;
          case UserRole.DEVELOPER:
          case UserRole.SYSTEM_ADMIN:
            roleExplanation = "Tu rol actual es Desarrollador / Administrador. Tienes acceso total de nivel 3 (root) a todas las capas del sistema y auditorías.";
            break;
          default:
            roleExplanation = "Tienes un perfil de invitado con accesos restringidos para consulta básica.";
        }

        setLocalState('calm');
        setCurrentSuggestion({
          text: `Identidad verificada. ${roleExplanation}`,
          state: 'calm'
        });
        return;
      }

      if (normalized.includes("ver expediente") || normalized.includes("abrir expediente") || 
          normalized.includes("expedientes") || normalized.includes("historial de alumno")) {
        setCurrentModule(AppModule.EXPEDIENTES);
        setCurrentSuggestion({
          text: "Entendido. Abriendo el archivo general de expedientes institucionales de alumnos.",
          state: 'calm'
        });
        setIsChatOpen(false);
        return;
      }

      if (normalized.includes("objeto retenido") || normalized.includes("objetos retenidos") || 
          normalized.includes("bajo custodia") || normalized.includes("resguardo") || 
          normalized.includes("pertenencias")) {
        const allowedRoles = [UserRole.PREFECTURA, UserRole.DIRECTIVO, UserRole.SUBDIRECCION, UserRole.DEVELOPER, UserRole.SYSTEM_ADMIN];
        if (allowedRoles.includes(currentUserRole as UserRole)) {
          setCurrentModule(AppModule.OBJETOS_RETENIDOS);
          setCurrentSuggestion({
            text: "Entendido. Abriendo el módulo de Control de Objetos Retenidos y Cadena de Custodia.",
            state: 'calm'
          });
          setIsChatOpen(false);
        } else {
          setLocalState('alert');
          setCurrentSuggestion({
            text: "Por políticas de seguridad escolar, el control de objetos bajo resguardo está restringido a Prefectura y Dirección. Acude a la oficina física si requieres asistencia.",
            state: 'alert'
          });
        }
        return;
      }

      if (normalized.includes("enviar whatsapp") || normalized.includes("notificar por whatsapp") || 
          normalized.includes("whatsapp masivo") || normalized.includes("automatizacion") || 
          normalized.includes("reporte masivo") || normalized.includes("calificaciones globales")) {
        setLocalState('attention');
        setCurrentSuggestion({
          text: "Funcionalidad en preparación para esta beta. El servicio de comunicación automática y reportería masiva será habilitado en la próxima actualización del plantel.",
          state: 'attention'
        });
        return;
      }


      const sasitoL3Response = trySasitoL3Bridge({
        text,
        currentUserRole: currentUserRole as UserRole,
        currentUserProfile,
        currentModule,
        students,
        notifications,
        aiSystemState,
      });

      if (sasitoL3Response) {
        setLocalState(sasitoL3Response.state);
        setCurrentSuggestion({
          text: sasitoL3Response.text,
          state: sasitoL3Response.state,
          actionLabel: sasitoL3Response.actionLabel,
        });
        return;
      }

      // --- AUTHORIZED NAVIGATION & ACTIONS ---
      const canUseQuickRegister = ![UserRole.ALUMNO, UserRole.GUEST].includes(currentUserRole as UserRole);

      if (normalized.includes("incidencia") || normalized.includes("reporte rápido")) {
        if (!canUseQuickRegister) {
          setLocalState('alert');
          setCurrentSuggestion({ text: "Tu perfil no tiene configurado el registro rápido de incidencias. Pide apoyo a Prefectura, Orientación o Dirección.", state: 'alert' });
          return;
        }
        setQuickRegisterOpen(true);
        setCurrentSuggestion({ text: "Entendido. Abriendo módulo de registro rápido de incidencias.", state: 'calm' });
        setIsChatOpen(false);
        return;
      } else if (normalized.includes("tour") || normalized.includes("ayuda") || normalized.includes("instrucciones") || normalized.includes("manual")) {
        setCurrentSuggestion({ text: "Entendido. Iniciando protocolo de inducción personalizada. Sígueme...", state: 'calm' });
        setIsChatOpen(false);
        localStorage.setItem('sase_onboarding_completed', 'true');
        import("../TourGuide").then(m => m.startProductTour(
          currentUserName || "Docente", 
          currentUserRole as any,
          setIsTourActive,
          setTourStep
        ));
        return;
      }

      // Contextual semantic response
      if (normalized.includes("como esta la escuela") || normalized.includes("estatus")) {
        const highRisk = students.filter(s => s.caseState === 'INTERVENCION').length;
        const unread = notifications.filter(n => !n.read).length;
        if (highRisk > 0) {
          setCurrentSuggestion({ text: `Situación Escolar: CRITICA. Tenemos ${highRisk} caso(s) en Intervención que requieren actuación inmediata.`, state: 'alert' });
        } else if (unread > 0) {
          setCurrentSuggestion({ text: `Situación Escolar: ESTABLE con pendientes. Tienes ${unread} notificaciones nuevas acumuladas.`, state: 'attention' });
        } else {
          setCurrentSuggestion({ text: `Situación Escolar: VERDE. Todo el ambiente institucional se encuentra bajo control en los parámetros operativos.`, state: 'calm' });
        }
        return;
      }

      // --- RBAC INTENT ENGINE ---
      for (const rule of INTENT_RULES) {
        if (rule.keywords.some(keyword => normalized.includes(keyword))) {
          if (rule.allowedRoles.includes(currentUserRole as UserRole)) {
            setCurrentModule(rule.moduleTarget);
            setCurrentSuggestion({ text: rule.successText, state: 'calm' });
            setIsChatOpen(false);
          } else {
            setLocalState('alert');
            setCurrentSuggestion({ text: rule.deniedText, state: 'alert' });
            toast.error(`Acceso denegado por jerarquía (${currentUserRole}).`);
          }
          return;
        }
      }

      setCurrentSuggestion({ text: "No tengo esa acción configurada para tu perfil. Puedo iniciar el tour, abrir notificaciones, registrar incidencias si tu rol lo permite, o llevarte a módulos autorizados.", state: 'attention' });

    }, 1500);
  };

  return (
    <>
      {!suppressAssistant && (
      <motion.div 
        ref={constraintsRef}
        className="fixed inset-0 pointer-events-none z-30"
      >
        <motion.div 
          id="sasito-assistant-anchor"
          drag

          dragElastic={0.02}
          dragMomentum={false}
          onDragStart={() => setShowDragHint(false)}
          className={`absolute pointer-events-auto flex flex-col items-center gap-4 ${
            isWidgetMode 
              ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' 
              : 'bottom-28 right-4 items-end sm:bottom-12 sm:right-8'
          }`}
        >
        <AnimatePresence>
          {isChatOpen && !minimal && !isTourActive && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9, transformOrigin: 'bottom right' }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="w-[min(380px,calc(100vw-32px))] max-w-[calc(100vw-32px)] bg-black/95 border border-white/20 backdrop-blur-3xl rounded-[2.5rem] p-6 shadow-2xl overflow-hidden ring-1 ring-white/10"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                   <div className="size-2 bg-violet-500 rounded-full animate-pulse" />
                   <span className="text-[10px] font-black tracking-widest text-white/40 uppercase">SASITO AI CORE</span>
                </div>
                <button aria-label="Cerrar chat" title="Cerrar chat" onClick={() => setIsChatOpen(false)} className="size-8 rounded-full bg-white/5 flex items-center justify-center text-white/30 hover:text-white transition-all"><X size={14} /></button>
              </div>
               <div className="mb-6 text-[11px] text-white/70 leading-relaxed font-medium">Hola {currentUserName.split(' ')[0] || ''}, ¿En qué puedo asistirte con el sistema SASE-310 hoy?</div>
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && processInput(chatInput)}
                  placeholder="Escribe tu consulta..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-violet-500/50 transition-all placeholder:text-white/20"
                />
                <button aria-label="Microfono" title="Activar/Desactivar Micrófono" onClick={() => setIsListening(!isListening)} className={`size-10 rounded-2xl flex items-center justify-center transition-all ${isListening ? 'bg-red-500 shadow-lg shadow-red-500/20' : 'bg-white/10 hover:bg-white/20'}`}>
                  {isListening ? <Mic size={18} /> : <MicOff size={18} />}
                </button>
              </div>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => {
                    setIsChatOpen(false);
                    import("../TourGuide").then(m => m.startProductTour(
                       currentUserName || "Docente", 
                       currentUserRole as any,
                      setIsTourActive,
                      setTourStep
                    ));
                  }}
                  className="w-full py-4 bg-violet-600/20 border border-violet-500/30 rounded-2xl text-[10px] font-black text-violet-400 uppercase tracking-widest hover:bg-violet-600 hover:text-white transition-all flex items-center justify-center gap-2 shadow-xl shadow-violet-900/10"
                >
                  <span className="material-icons text-sm">explore</span>
                  REINICIAR TOUR GUIADO
                </button>
                <button 
                  onClick={() => setIsChatOpen(false)}
                  className="w-full py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all"
                >
                  Cerrar Consola
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {currentSuggestion && !isChatOpen && !minimal && !isTourActive && !suppressSuggestions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 20 }}
              className="absolute bottom-full right-0 mb-8 w-[min(360px,calc(100vw-32px))] max-w-[calc(100vw-32px)]"
            >
              <div className="glass-card-quantum p-6 border-violet-500/30 bg-slate-950/90 backdrop-blur-3xl shadow-2xl relative overflow-hidden group rounded-3xl ring-1 ring-white/10">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent opacity-50" />
                
                <div className="flex flex-col gap-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-400">
                      <span className="material-icons text-lg">auto_awesome</span>
                    </div>
                    <span className="text-[10px] font-black text-violet-400 uppercase tracking-[0.2em]">Sugerencia IA</span>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-[13px] text-white font-medium leading-relaxed italic">
                      "{currentSuggestion.text}"
                    </p>
                    <div className="flex gap-2 pt-2">
                        <button 
                          onClick={() => {
                            if (currentSuggestion.actionType === "onboarding-start") {
                               processInput("onboarding-start");
                            } else if (currentSuggestion.actionType === "onboarding-step-1") {
                               processInput("onboarding-step-1");
                            } else if (currentSuggestion.actionType === "onboarding-step-2") {
                               processInput("onboarding-step-2");
                            } else if (currentSuggestion.actionType === "onboarding-finish") {
                               setCurrentSuggestion(null);
                            } else if (currentSuggestion.actionType?.startsWith("module-")) {
                               const moduleKey = currentSuggestion.actionType.replace("module-", "");
                               const moduleTarget = ACTION_MODULES[moduleKey];
                               if (moduleTarget) setCurrentModule(moduleTarget);
                            }
                            setCurrentSuggestion(null);
                          }}
                          className="px-4 py-2 bg-violet-600 rounded-xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-violet-500 transition-all shadow-lg shadow-violet-500/20"
                        >
                          {currentSuggestion.actionLabel || "ENTENDIDO"}
                        </button>
                        <button 
                          onClick={() => {
                            if (currentSuggestion.actionType === "onboarding-start") {
                              updateOnboarding({ completed: true });
                            }
                            setCurrentSuggestion(null);
                          }}
                          className="px-4 py-2 bg-white/5 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-white/10 transition-all"
                        >
                          {currentSuggestion.actionType === "onboarding-start" ? "SALTAR" : "Luego"}
                        </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative flex items-center justify-center">
            <motion.div
              onClick={() => !minimal && !isTourActive && setIsChatOpen(!isChatOpen)}
              className={`cursor-pointer pointer-events-auto ${isTourActive ? 'opacity-90 pointer-events-none' : ''}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
            <SaseSplineOrb 
              state={
                localState === 'processing' ? 'thinking' : 
                localState === 'alert' ? 'alert' : 
                localState === 'attention' ? 'warning' : 'normal'
              } 
              className={minimal ? "w-16 h-16 sm:w-20 sm:h-20" : isTourActive ? "w-16 h-16 sm:w-20 sm:h-20" : "w-20 h-20 sm:w-24 sm:h-24"}
              showAura={true}
              showGlow={true}
            />
          </motion.div>

          {showDragHint && !minimal && !isChatOpen && !currentSuggestion && !isWidgetMode && !suppressSuggestions && (
            <div className="px-3 py-2 rounded-full border border-[var(--sase-border-ghost)] bg-[rgba(121,118,124,0.14)] text-[9px] font-black uppercase tracking-[0.2em] text-[var(--sase-text-muted)]">
              Arrastra para mover
            </div>
          )}
        </div>
      </motion.div>
      </motion.div>
      )}
    </>
  );
};
