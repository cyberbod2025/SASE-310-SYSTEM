import React, { useState, useRef, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { useApp } from "../store";
import { UserRole, AppModule, IncidentType, RoleLabels } from "../types";
import { QuickRegisterModal } from "./QuickRegisterModal";
import { AssistantBanner } from "./AssistantBanner";
import { supabase } from "../supabase/client";
import { startProductTour } from "./TourGuide";
import { FeedbackWidget } from "./FeedbackWidget";
import { TutorialController } from "./Tutorials/TutorialController";
import { VERSION, BRANDING } from "../config/sase.config";
import { useAuth } from "./AuthProvider";
import { resetOnboarding } from "../utils/onboardingStore";
import { SaseSplineOrb } from "./SaseSplineOrb";
import { SasitoAssistant } from "./ai/SasitoAssistant";
import { LiquidGlassFilters } from "./ui/LiquidGlassFilters";
import { motion, AnimatePresence } from "framer-motion";
import { EncuestaPulso } from "./onboarding/EncuestaPulso";
import {
  getAllowedModules,
  getOnboardingPhase,
  isModuleAllowed,
  OnboardingPhase,
} from "../utils/onboardingLogic";
import { useEcosystemModules } from "../hooks/useEcosystemModules";
import { canAccessSecurityDashboard } from "../utils/securityDashboardAccess";
import { getEcosystemModuleUiByAppModule } from "../config/ecosystemModuleUi";
import { EmergencyButton } from "./emergency/EmergencyButton";
import { EmergencyResponsePanel } from "./emergency/EmergencyResponsePanel";

const roleColors: Record<UserRole, string> = {
  [UserRole.DIRECTIVO]: "bg-white/70 backdrop-blur-xl border-r border-slate-200",
  [UserRole.SUBDIRECCION]: "bg-white/70 backdrop-blur-xl border-r border-slate-200",
  [UserRole.DOCENTE]: "bg-white/70 backdrop-blur-xl border-r border-slate-200",
  [UserRole.DOCENTE_TUTOR]: "bg-white/70 backdrop-blur-xl border-r border-slate-200",
  [UserRole.PREFECTURA]: "bg-white/70 backdrop-blur-xl border-r border-slate-200",
  [UserRole.ORIENTACION]: "bg-white/70 backdrop-blur-xl border-r border-slate-200",
  [UserRole.TRABAJO_SOCIAL]: "bg-white/70 backdrop-blur-xl border-r border-slate-200",
  [UserRole.MEDICO_ESCOLAR]: "bg-white/70 backdrop-blur-xl border-r border-slate-200",
  [UserRole.SECRETARIA]: "bg-white/70 backdrop-blur-xl border-r border-slate-200",
  [UserRole.UDEII]: "bg-white/70 backdrop-blur-xl border-r border-slate-200",
  [UserRole.PROMOTORA_LECTURA]: "bg-white/70 backdrop-blur-xl border-r border-slate-200",
  [UserRole.ALUMNO]: "bg-white/70 backdrop-blur-xl border-r border-slate-200",
  [UserRole.GUEST]: "bg-white/70 backdrop-blur-xl border-r border-slate-200",
  [UserRole.DEVELOPER]: "bg-white/70 backdrop-blur-xl border-r border-slate-200",
  [UserRole.SYSTEM_ADMIN]: "bg-white/70 backdrop-blur-xl border-r border-slate-200",
};

const roleImages: Record<UserRole, string> = {
  [UserRole.DIRECTIVO]:
    "https://ui-avatars.com/api/?name=Director&background=fecaca&color=7f1d1d",
  [UserRole.SUBDIRECCION]:
    "https://ui-avatars.com/api/?name=Subdirector&background=ffedd5&color=9a3412",
  [UserRole.DOCENTE]:
    "https://ui-avatars.com/api/?name=Docente&background=dbeafe&color=1e3a8a",
  [UserRole.DOCENTE_TUTOR]:
    "https://ui-avatars.com/api/?name=Tutor&background=dbeafe&color=1e3a8a",
  [UserRole.PREFECTURA]:
    "https://ui-avatars.com/api/?name=Prefectura&background=ffedd5&color=7c2d12",
  [UserRole.ORIENTACION]:
    "https://ui-avatars.com/api/?name=Orientacion&background=d1fae5&color=064e3b",
  [UserRole.TRABAJO_SOCIAL]:
    "https://ui-avatars.com/api/?name=Trabajo+Social&background=f3e8ff&color=581c87",
  [UserRole.MEDICO_ESCOLAR]:
    "https://ui-avatars.com/api/?name=Medico&background=fee2e2&color=991b1b",
  [UserRole.SECRETARIA]:
    "https://ui-avatars.com/api/?name=Secretaria&background=cffafe&color=083344",
  [UserRole.UDEII]:
    "https://ui-avatars.com/api/?name=UDEII&background=e0e7ff&color=312e81",
  [UserRole.PROMOTORA_LECTURA]:
    "https://ui-avatars.com/api/?name=Promotora&background=fce7f3&color=701a75",
  [UserRole.ALUMNO]:
    "https://ui-avatars.com/api/?name=Alumno&background=e0e7ff&color=312e81",
  [UserRole.GUEST]:
    "https://ui-avatars.com/api/?name=Invitado&background=f1f5f9&color=0f172a",
  [UserRole.DEVELOPER]:
    "https://ui-avatars.com/api/?name=Admin&background=000&color=fff",
  [UserRole.SYSTEM_ADMIN]:
    "https://ui-avatars.com/api/?name=SysAdmin&background=1e1b4b&color=a5b4fc",
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const {
    currentUserRole,
    switchRole,
    setQuickRegisterOpen,
    openQuickRegister,
    setIsFeedbackOpen,
    isAssistantOpen,
    setIsAssistantOpen,
    assistantStatus,
    aiSystemState,
    systemMessage,
    highlightedModule,
    autoNavigate,
    clearHighlight,
    students,
    currentModule,
    setCurrentModule,
    notifications,
    markNotificationRead,
    setAssistantSuggestion,
    updateOnboarding,
    activeAlerts,
    isTourActive,
    setIsTourActive,
  } = useApp();
  const { user, profile } = useAuth();
  const { ecosystemModules } = useEcosystemModules();

  const userCreatedAt = profile?.creado_en || user?.created_at || null;
  const onboardingPhase: OnboardingPhase = useMemo(
    () => getOnboardingPhase(userCreatedAt),
    [userCreatedAt],
  );
  const allowedModules = useMemo(
    () => getAllowedModules(onboardingPhase, currentUserRole),
    [onboardingPhase, currentUserRole],
  );
  const canAccess = (module: AppModule) => isModuleAllowed(module, allowedModules);
  const isPhase1 = onboardingPhase === "fase1";
  const isDocente = currentUserRole === UserRole.DOCENTE || currentUserRole === UserRole.DOCENTE_TUTOR;

  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProtocolDismissed, setIsProtocolDismissed] = useState(false);
  const [isDemoCleanMode, setIsDemoCleanMode] = useState(false);
  const previousUnreadRef = useRef(0);
  const unreadWatcherReadyRef = useRef(false);
  const demoCleanAppliedForRoleRef = useRef<UserRole | null>(null);
  // Roles con acceso global a todas las notificaciones institucionales
  const ROLES_ACCESO_TOTAL = [UserRole.DIRECTIVO, UserRole.SUBDIRECCION, UserRole.SYSTEM_ADMIN, UserRole.DEVELOPER];
  const visibleNotifications = notifications.filter((n) => {
    if (!n.targetRole) return true; // Sin targetRole = global, todos la ven
    if (ROLES_ACCESO_TOTAL.includes(currentUserRole as UserRole)) return true;
    return n.targetRole === currentUserRole;
  });
  const unreadCount = visibleNotifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (unreadWatcherReadyRef.current && unreadCount > previousUnreadRef.current) {
      import("../utils/sound").then((sound) => sound.playNotificationSound()).catch(() => undefined);
      setAssistantSuggestion({
        text: `Entraron nuevas notificaciones institucionales. Revisa la campana para atenderlas sin perder contexto.`,
        state: "attention",
        actionLabel: "Ver avisos",
        actionType: "module-notifications",
      });
    }
    unreadWatcherReadyRef.current = true;
    previousUnreadRef.current = unreadCount;
  }, [setAssistantSuggestion, unreadCount]);

  const sidebarWidth = isSidebarCollapsed ? "w-20" : "w-72";
  const hasActiveEmergency = activeAlerts.some((alert) => alert.estado === "activa");
  const suppressNonCriticalOverlays = isDemoCleanMode || isTourActive || hasActiveEmergency;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cleanMode = params.get("demo") === "1" || localStorage.getItem("sase_demo_clean_view") === "true";

    if (!cleanMode) return;
    if (demoCleanAppliedForRoleRef.current === currentUserRole) return;

    demoCleanAppliedForRoleRef.current = currentUserRole as UserRole;
    setIsDemoCleanMode(true);
    localStorage.setItem("sase_autotutorial_enabled", "false");
    localStorage.setItem(`sase_tutorial_seen_${currentUserRole}`, "true");
    updateOnboarding({ completed: true, step: 3 });
    setAssistantSuggestion(null);
  }, [currentUserRole, setAssistantSuggestion, updateOnboarding]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  // Monitorizar activación del tour (driver.js no es reactivo por sí solo)
  useEffect(() => {
    const checkTour = () => {
      const active = !!document.querySelector(".driver-popover") || localStorage.getItem("sase_tour_active") === "true";
      setIsTourActive(active);
    };

    const interval = setInterval(checkTour, 500);
    return () => clearInterval(interval);
  }, [setIsTourActive]);

  const profileAvatar = profile?.preferencias_dashboard?.avatar_url || null;
  const displayUserName =
    profile?.nombre_completo || profile?.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Usuario SASE";
  const displayUserRole =
    profile?.cargo_institucional || profile?.rol || currentUserRole;
  const neuralCoreState = aiSystemState;
  const isExternalModule = !!getEcosystemModuleUiByAppModule(currentModule);
  const activeIncidentsCount = students.reduce(
    (total: number, student: any) =>
      total + (student.incidents ? student.incidents.length : 0),
    0,
  );
  const connectedUsers = user ? 1 : 0;
  const lastSystemEvent = notifications.length > 0
    ? notifications[0].title
    : "Sin eventos recientes";

  useEffect(() => {
    if (aiSystemState === "alert" && autoNavigate && highlightedModule) {
      setCurrentModule(highlightedModule);
      clearHighlight();
    }
  }, [aiSystemState, autoNavigate, highlightedModule, setCurrentModule, clearHighlight]);

  return (
    <div 
      data-sasito-state={neuralCoreState}
      className="flex h-screen w-full bg-[var(--sase-bg)] text-[var(--sase-text-main)] overflow-hidden font-sans select-none"
    >
      <TutorialController />
      
      {/* 🔮 Inyectar Filtros SVG Globales para Liquid Glass */}
      <LiquidGlassFilters />

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-10 md:hidden backdrop-blur-md animate-fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Premium Crystal Glass (Light Edition) */}
      <aside
        className={`fixed inset-y-0 left-0 z-20 ${sidebarWidth} glass-card-quantum !bg-[rgba(121,118,124,0.12)] !backdrop-blur-[40px] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] border-r border-[rgba(227,221,236,0.12)] md:relative md:translate-x-0 shadow-[10px_0_60px_-20px_rgba(18,16,23,0.42)] ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full relative overflow-hidden">
          {/* Internal Glow - Subtle Institutional Effect */}
          <div className="absolute top-[-5%] left-[-10%] w-[120%] h-[30%] bg-[rgba(129,106,184,0.08)] blur-[100px] pointer-events-none animate-pulse-slow -z-10"></div>
          <div className="absolute bottom-[20%] right-[-20%] w-[100%] h-[30%] bg-[rgba(125,114,147,0.12)] blur-[120px] pointer-events-none -z-10"></div>
          <div className="absolute top-[40%] left-[-10%] w-[50%] h-[20%] bg-[rgba(175,166,60,0.05)] blur-[80px] pointer-events-none animate-pulse -z-10"></div>

          <div
            id="sidebar-logo"
            className={`p-6 border-b border-white/5 relative z-10 ${isSidebarCollapsed ? "items-center" : ""}`}
          >
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute -inset-1.5 bg-blue-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {profileAvatar ? (
                  <img
                    src={profileAvatar}
                    alt={`Perfil de ${currentUserRole}`}
                    title={`Usuario: ${displayUserName}`}
                    className={`rounded-2xl border border-white shadow-lg relative z-10 object-cover transition-all ${isSidebarCollapsed ? "w-10 h-10" : "w-12 h-12"}`}
                  />
                ) : (
                  <img
                    src={roleImages[currentUserRole]}
                    alt={`Perfil de ${currentUserRole}`}
                    title={`Usuario: ${displayUserName}`}
                    className={`rounded-2xl border border-white shadow-lg relative z-10 object-cover transition-all ${isSidebarCollapsed ? "w-10 h-10" : "w-12 h-12"}`}
                  />
                )}
              </div>
              {!isSidebarCollapsed && (
                <div className="flex-1 min-w-0 animate-fade-in text-[var(--sase-text-head)]">
                  <h3 className="text-[10px] font-black truncate uppercase tracking-widest">
                    {displayUserName}
                  </h3>
                  <div className="flex flex-col gap-0.5 mt-0.5">
                    <div className="flex items-center gap-1.5">
                       <span className="size-1.5 bg-[var(--sase-tertiary)] rounded-full"></span>
                       {(import.meta.env.DEV || currentUserRole === UserRole.DEVELOPER || currentUserRole === UserRole.SYSTEM_ADMIN) ? (
                         <select
                           aria-label="Rol Institucional (Dev)"
                           value={currentUserRole}
                           onChange={(e) => {
                             const newRole = e.target.value as UserRole;
                             switchRole(newRole);
                             toast.success(`Rol cambiado a: ${RoleLabels[newRole] || newRole}`);
                           }}
                           className="bg-black/30 border border-white/10 rounded px-1.5 py-0.5 text-[8.5px] font-black uppercase text-[var(--sase-text-muted)] focus:outline-none focus:border-violet-500/50 hover:bg-black/50 transition-all cursor-pointer tracking-wider"
                         >
                           {Object.values(UserRole).map((r) => (
                             <option key={r} value={r} className="bg-slate-900 text-white">
                               {RoleLabels[r] || r}
                             </option>
                           ))}
                         </select>
                       ) : (
                         <span className="text-[9px] font-semibold text-[var(--sase-text-muted)] uppercase tracking-[0.22em] truncate">
                           {displayUserRole}
                         </span>
                       )}
                    </div>
                  </div>
                </div>
              )}
              {!isSidebarCollapsed && (
                <button
                  data-sasito-target="perfil"
                  onClick={() => {
                    setCurrentModule(AppModule.PERFIL);
                    setIsSidebarOpen(false);
                  }}
                  className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.22em] text-slate-300 hover:bg-white/10 transition-all"
                >
                  Mi perfil
                </button>
              )}
            </div>
          </div>

          {/* Nav Section */}
          <nav
            id="sidebar-nav"
            className="flex-1 px-3 py-6 space-y-2 overflow-y-auto custom-scrollbar relative z-10"
          >
            {!isSidebarCollapsed && (
              <span className="px-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-4">
                Operatividad
              </span>
            )}

            {canAccess(AppModule.DASHBOARD) && (
              <NavItem
                id="nav-dashboard"
                icon="dashboard"
                label="Tablero"
                active={currentModule === AppModule.DASHBOARD}
                onClick={() => {
                  setCurrentModule(AppModule.DASHBOARD);
                  setIsSidebarOpen(false);
                }}
                color={currentUserRole}
                highlighted={highlightedModule === AppModule.DASHBOARD}
                collapsed={isSidebarCollapsed}
              />
            )}

            {/* Fase 1 Docente: Mostrar SOLO herramientas críticas para evitar sobrecarga */}
            {isPhase1 && isDocente && canAccess(AppModule.REPORTES_DOCENTES) && (
              <NavItem
                id="nav-pedagogia"
                icon="psychology"
                label="Detección Pedagógica"
                active={currentModule === AppModule.REPORTES_DOCENTES}
                onClick={() => {
                  setCurrentModule(AppModule.REPORTES_DOCENTES);
                  setIsSidebarOpen(false);
                }}
                color={currentUserRole}
                collapsed={isSidebarCollapsed}
              />
            )}

            {canAccess(AppModule.EXPEDIENTES) && (
              <NavItem
                id="nav-expedientes"
                icon="folder_shared"
                label="Expedientes"
                active={currentModule === AppModule.EXPEDIENTES}
                onClick={() => {
                  setCurrentModule(AppModule.EXPEDIENTES);
                  setIsSidebarOpen(false);
                }}
                color={currentUserRole}
                highlighted={highlightedModule === AppModule.EXPEDIENTES}
                collapsed={isSidebarCollapsed}
              />
            )}

            {/* FASES AVANZADAS: Desbloquear módulos complejos progresivamente (Excepto para administrativos/prefectura que necesitan todo) */}
            {canAccess(AppModule.AGENDA) && (!isPhase1 || (currentUserRole !== UserRole.DOCENTE && currentUserRole !== UserRole.DOCENTE_TUTOR)) && (
              <>
                <NavItem
                  id="nav-agenda"
                  icon="event"
                  label="Agenda"
                  active={currentModule === AppModule.AGENDA}
                  onClick={() => {
                    setCurrentModule(AppModule.AGENDA);
                    setIsSidebarOpen(false);
                  }}
                  color={currentUserRole}
                  highlighted={highlightedModule === AppModule.AGENDA}
                  collapsed={isSidebarCollapsed}
                />

                <NavItem
                  id="nav-incidencias"
                  icon="report_problem"
                  label="Incidencias"
                  active={currentModule === AppModule.BITACORA}
                  onClick={() => {
                    setCurrentModule(AppModule.BITACORA);
                    setIsSidebarOpen(false);
                  }}
                  color={currentUserRole}
                  highlighted={highlightedModule === AppModule.BITACORA}
                  collapsed={isSidebarCollapsed}
                />
              </>
            )}

            {canAccess(AppModule.ASISTENCIA) && (currentUserRole === UserRole.PREFECTURA || 
              currentUserRole === UserRole.DOCENTE || 
              currentUserRole === UserRole.DOCENTE_TUTOR ||
              currentUserRole === UserRole.SYSTEM_ADMIN ||
              currentUserRole === UserRole.DEVELOPER) && (
              <NavItem
                id="nav-asistencia"
                icon="fact_check"
                label="Asistencia"
                active={currentModule === AppModule.ASISTENCIA}
                onClick={() => {
                  setCurrentModule(AppModule.ASISTENCIA);
                  setIsSidebarOpen(false);
                }}
                color={currentUserRole}
                highlighted={highlightedModule === AppModule.ASISTENCIA}
                collapsed={isSidebarCollapsed}
              />
            )}

            {currentUserRole !== UserRole.SECRETARIA && (
              <>
                {canAccess(AppModule.REPORTES) && (
                  <NavItem
                    id="nav-reportes"
                    icon="analytics"
                    label="Reportes"
                    active={currentModule === AppModule.REPORTES}
                    onClick={() => {
                      setCurrentModule(AppModule.REPORTES);
                      setIsSidebarOpen(false);
                    }}
                    color={currentUserRole}
                    highlighted={highlightedModule === AppModule.REPORTES}
                    collapsed={isSidebarCollapsed}
                  />
                )}

                {canAccess(AppModule.PROTOCOLOS) && (
                  <NavItem
                    id="nav-protocolos"
                    icon="policy"
                    label="Protocolos"
                    active={currentModule === AppModule.PROTOCOLOS}
                    onClick={() => {
                      setCurrentModule(AppModule.PROTOCOLOS);
                      setIsSidebarOpen(false);
                    }}
                    color={currentUserRole}
                    highlighted={highlightedModule === AppModule.PROTOCOLOS}
                    collapsed={isSidebarCollapsed}
                  />
                )}
              </>
            )}
            
            {canAccess(AppModule.BITACORA) && 
              [UserRole.DIRECTIVO, UserRole.SYSTEM_ADMIN, UserRole.DEVELOPER].includes(currentUserRole as UserRole) && (
              <NavItem
                id="nav-bitacora"
                icon="history"
                label="Bitácora"
                active={currentModule === AppModule.BITACORA}
                onClick={() => {
                  setCurrentModule(AppModule.BITACORA);
                  setIsSidebarOpen(false);
                }}
                color={currentUserRole}
                highlighted={highlightedModule === AppModule.BITACORA}
                collapsed={isSidebarCollapsed}
              />
            )}

            {canAccessSecurityDashboard(currentUserRole as UserRole) && (
              <NavItem
                id="nav-seguridad"
                icon="security"
                label="Seguridad"
                active={currentModule === AppModule.SEGURIDAD}
                onClick={() => {
                  setCurrentModule(AppModule.SEGURIDAD);
                  setIsSidebarOpen(false);
                }}
                color={currentUserRole}
                highlighted={highlightedModule === AppModule.SEGURIDAD}
                collapsed={isSidebarCollapsed}
              />
            )}

            {ecosystemModules.length > 0 && !isSidebarCollapsed && (
              <span id="sidebar-ecosistema" className="px-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] block mt-6 mb-4">
                Ecosistema
              </span>
            )}

            {currentUserRole === UserRole.ALUMNO ? (
              // Vista súper restringida para Alumnos: Solo Feria
              ecosystemModules.filter(m => m.appModule === AppModule.FERIA).map((module) => (
                <NavItem
                  key={module.key}
                  id={`nav-ecosistema-${module.key}`}
                  icon={module.icon}
                  label={module.name}
                  active={true}
                  onClick={() => {
                    setCurrentModule(module.appModule);
                    setIsSidebarOpen(false);
                  }}
                  color={currentUserRole}
                  collapsed={isSidebarCollapsed}
                />
              ))
            ) : (
              <>
                {ecosystemModules.map((module) => (
                  <NavItem
                    key={module.key}
                    id={`nav-ecosistema-${module.key}`}
                    icon={module.icon}
                    label={module.name}
                    active={currentModule === module.appModule}
                    onClick={() => {
                      setCurrentModule(module.appModule);
                      setIsSidebarOpen(false);
                    }}
                    color={currentUserRole}
                    collapsed={isSidebarCollapsed}
                  />
                ))}
              </>
            )}


            {!isSidebarCollapsed && (
              <span className="px-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] block mt-6 mb-4">
                Soporte y Ayuda
              </span>
            )}

            <NavItem
              icon="menu_book"
              label="Manual de Uso"
              active={currentModule === AppModule.MANUAL_USUARIO}
              onClick={() => {
                setCurrentModule(AppModule.MANUAL_USUARIO);
                setIsSidebarOpen(false);
              }}
              color={currentUserRole}
              collapsed={isSidebarCollapsed}
            />

            <NavItem
              icon="restart_alt"
              label="Reiniciar guía"
              active={false}
              onClick={() => {
                resetOnboarding();
                updateOnboarding({ completed: false, step: 0 });
                toast.success("Guía reiniciada. Sasito te hablará en breve.");
                setIsSidebarOpen(false);
              }}
              color={currentUserRole}
              collapsed={isSidebarCollapsed}
            />
          </nav>

          {/* Footer Sidebar */}
          <div className="p-4 border-t border-white/20 space-y-3 relative z-10">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden md:flex items-center justify-center w-full py-2 bg-white/20 hover:bg-white/40 text-slate-500 rounded-xl transition-all"
            >
              <span className="material-icons text-lg">
                {isSidebarCollapsed
                  ? "side_navigation"
                  : "keyboard_double_arrow_left"}
              </span>
            </button>

            <button
              id="sidebar-feedback"
              data-sasito-target="sugerencias"
              onClick={() => setIsFeedbackOpen(true)}
              className="flex items-center justify-center w-full py-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 rounded-xl transition-all"
            >
              <span className="material-icons text-lg">feedback</span>
              {!isSidebarCollapsed && (
                <span className="ml-3 text-[10px] font-black uppercase tracking-widest">
                  Sugerencias
                </span>
              )}
            </button>

            <button
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.reload();
              }}
              className="flex items-center justify-center w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded-xl transition-all"
            >
              <span className="material-icons text-lg">logout</span>
              {!isSidebarCollapsed && (
                <span className="ml-3 text-[10px] font-black uppercase tracking-widest">
                  Salir
                </span>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Header */}
        <header className="h-16 sm:h-20 bg-[rgba(11,15,25,0.85)] backdrop-blur-[32px] border-b border-white/10 flex items-center justify-between px-3 sm:px-6 shrink-0 z-20 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-3 sm:gap-6">
            <button
              className="md:hidden size-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl text-slate-300 hover:bg-white/10"
              onClick={() => setIsSidebarOpen(true)}
            >
              <span className="material-icons text-xl">menu</span>
            </button>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 shadow-inner">
                  <img src="/assets/branding/favicon.png" alt="SASE Logo" className="w-5 h-5 sm:w-6 sm:h-6 object-contain" />
                </div>
                <h2 className="text-sm sm:text-lg font-black text-white uppercase tracking-[0.15em] sm:tracking-[0.2em] flex items-center">
                  SASE <span className="hidden xs:inline text-blue-400/50 mx-2 text-sm">/</span>{" "}
                  <span className="hidden sm:inline text-blue-300 text-xs tracking-[0.3em] uppercase">SISTEMA DE ACOMPAÑAMIENTO Y SEGUIMIENTO ESCOLAR</span>
                </h2>
              </div>
              <p className="hidden md:block text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 ml-10">
                Estatus: Operativo • v{VERSION.numero} • GESTIÓN INSTITUCIONAL
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="quick-register-btn"
              data-sasito-target="reporte-rapido"
              onClick={() => openQuickRegister(IncidentType.CONDUCTA)}
              className="hidden md:flex h-10 px-5 bg-red-600 text-white rounded-xl text-[10px] font-black tracking-widest hover:bg-red-500 transition-all shadow-lg shadow-red-500/20 items-center gap-2"
            >
              <span className="material-icons text-lg">emergency</span>
              REPORTE RÁPIDO
            </button>

            <div className="relative" ref={notificationRef}>
              <button
                id="notification-bell"
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label={`Notificaciones${unreadCount > 0 ? `, ${unreadCount} sin leer` : ""}`}
                className={`relative size-12 flex items-center justify-center rounded-2xl border transition-all ${
                  unreadCount > 0
                    ? "sase-notification-bell-active text-white"
                    : "bg-[rgba(121,118,124,0.12)] border-[rgba(227,221,236,0.14)] text-[var(--sase-text-muted)] hover:bg-[rgba(121,118,124,0.18)]"
                }`}
              >
                <div className="relative">
                  <span className={`material-icons ${unreadCount > 0 ? "text-3xl" : "text-2xl"}`}>notifications</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-3 min-w-5 h-5 px-1 bg-red-600 text-white rounded-full border-2 border-white text-[10px] font-black leading-4 text-center shadow-lg shadow-red-500/40">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>
              </button>

              {showNotifications && (
                <div className="absolute top-14 right-0 w-80 md:w-96 z-50 animate-fade-in-up overflow-hidden rounded-[2rem] border border-[rgba(227,221,236,0.14)] shadow-[0_35px_100px_rgba(18,16,23,0.35)] glass-dropdown bg-[rgba(121,118,124,0.18)] backdrop-blur-[32px]">
                  <div className="p-4 flex justify-between items-center">
                    <span className="text-[10px] font-semibold text-[var(--sase-text-muted)] uppercase tracking-[0.22em]">
                      Alertas Institucionales
                    </span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 bg-[rgba(175,166,60,0.12)] text-[var(--sase-tertiary)] rounded text-[9px] font-semibold">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
                    {visibleNotifications.length === 0 ? (
                      <div className="py-12 text-center opacity-60">
                        <span className="material-icons text-4xl block mb-2 text-slate-300">
                          notifications_off
                        </span>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Sin pendientes
                        </p>
                      </div>
                    ) : (
                      visibleNotifications.map((notif) => (
                        <div
                          key={notif.id}
                            className={`p-4 rounded-[1.5rem] mb-2 transition-all cursor-pointer border ${notif.read ? "bg-[rgba(121,118,124,0.1)] border-transparent opacity-60" : "bg-[rgba(121,118,124,0.16)] border-[rgba(227,221,236,0.14)] hover:bg-[rgba(121,118,124,0.2)]"}`}
                          onClick={() => {
                            markNotificationRead(notif.id);
                            if (notif.actionModule) setCurrentModule(notif.actionModule);
                            setShowNotifications(false);
                          }}
                        >
                          <div className="flex gap-3">
                            <div className={`size-8 rounded-2xl flex items-center justify-center ${notif.type === "error" ? "bg-red-100 text-red-600" : notif.type === "warning" ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"}`}>
                              <span className="material-icons text-sm">
                                {notif.type === "error" ? "report" : notif.type === "warning" ? "warning" : "info"}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-[11px] font-black text-slate-800 uppercase truncate">
                                {notif.title}
                              </h4>
                              <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                                {notif.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Scroll Area */}
        <main className={`flex-1 relative ${isExternalModule ? "overflow-hidden flex flex-col h-full w-full" : "overflow-y-auto overflow-x-hidden custom-scrollbar"}`}>
          <div 
            data-sasito-target="tablero" 
            className={isExternalModule 
              ? `h-full w-full flex-1 relative z-10 transition-[padding] duration-300 ${hasActiveEmergency ? "lg:pr-[28rem]" : ""}`
              : `min-h-full p-4 md:p-8 animate-fade-in relative z-10 transition-[padding] duration-300 ${hasActiveEmergency ? "lg:pr-[28rem]" : ""}`
            }
          >
            {children}
          </div>
        </main>

        {/* Sasito IA: siempre presente en todas las pantallas */}
        <SasitoAssistant suppressAssistant={isTourActive || hasActiveEmergency} suppressSuggestions={suppressNonCriticalOverlays} />
        {!isDemoCleanMode && <EncuestaPulso />}
      </div>

      <FeedbackWidget />
      <QuickRegisterModal />
      <EmergencyButton />
      <EmergencyResponsePanel />
    </div>
  );
};

const NavItem: React.FC<{
  icon: string;
  label: string;
  active: boolean;
  id?: string;
  onClick: () => void;
  color: string;
  collapsed?: boolean;
  highlighted?: boolean;
}> = ({ icon, label, active, onClick, id, color, collapsed, highlighted }) => {
  const textColors: Record<UserRole, string> = {
    [UserRole.DIRECTIVO]: "text-slate-200",
    [UserRole.SUBDIRECCION]: "text-orange-800",
    [UserRole.DOCENTE]: "text-blue-600",
    [UserRole.DOCENTE_TUTOR]: "text-blue-700",
    [UserRole.PREFECTURA]: "text-orange-600",
    [UserRole.ORIENTACION]: "text-emerald-600",
    [UserRole.TRABAJO_SOCIAL]: "text-purple-600",
    [UserRole.MEDICO_ESCOLAR]: "text-red-600",
    [UserRole.SECRETARIA]: "text-cyan-600",
    [UserRole.UDEII]: "text-indigo-600",
    [UserRole.PROMOTORA_LECTURA]: "text-pink-600",
    [UserRole.ALUMNO]: "text-indigo-600",
    [UserRole.GUEST]: "text-slate-300",
    [UserRole.DEVELOPER]: "text-black",
    [UserRole.SYSTEM_ADMIN]: "text-indigo-900",
  };

  const activeTextClass = textColors[color as UserRole] || "text-slate-300";

  return (
    <button
      id={id}
      onClick={onClick}
      title={collapsed ? label : ""}
      className={`w-full flex items-center gap-3 px-3 py-2.5 min-h-[48px] rounded-xl transition-all group my-1 border ${
        active
                  ? `bg-[rgba(129,106,184,0.14)] backdrop-blur-md text-[#e4daf4] shadow-[0_24px_40px_rgba(18,16,23,0.28)] font-semibold border-[rgba(227,221,236,0.14)] scale-[1.02]`
                  : "text-[var(--sase-text-muted)] hover:bg-[rgba(121,118,124,0.08)] hover:text-white font-semibold border-[rgba(227,221,236,0.08)]"
      } ${highlighted ? "shadow-[0_0_25px_rgba(129,106,184,0.12)] border-[rgba(129,106,184,0.18)] bg-[rgba(129,106,184,0.08)] animate-pulse-soft" : ""} ${collapsed ? "justify-center px-0" : ""}`}
    >
      <span
        className={`material-icons text-[20px] transition-transform ${
          active ? "" : "group-hover:scale-110"
        }`}
      >
        {icon}
      </span>
      {!collapsed && (
        <>
          <span className="text-xs uppercase tracking-wider truncate">
            {label}
          </span>
          {active && (
            <span className="ml-auto material-icons text-[16px]">
              chevron_right
            </span>
          )}
        </>
      )}
    </button>
  );
};
