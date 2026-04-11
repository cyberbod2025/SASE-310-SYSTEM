import React, { useState, useRef, useEffect, useMemo } from "react";
import { useApp } from "../store";
import { UserRole, AppModule, IncidentType } from "../types";
import { QuickRegisterModal } from "./QuickRegisterModal";
import { AssistantBanner } from "./AssistantBanner";
import { supabase } from "../supabase/client";
import { startProductTour } from "./TourGuide";
import { FeedbackWidget } from "./FeedbackWidget";
import { TutorialController } from "./Tutorials/TutorialController";
import { VERSION, BRANDING } from "../config/sase.config";
import { useAuth } from "./AuthProvider";
import { SaseSplineOrb } from "./SaseSplineOrb";
import { SasitoAssistant } from "./ai/SasitoAssistant";
import { LiquidGlassFilters } from "./ui/LiquidGlassFilters";
import { QuickRegister } from "./ui/QuickRegister";
import { motion, AnimatePresence } from "framer-motion";
import { EncuestaPulso } from "./onboarding/EncuestaPulso";
import {
  getAllowedModules,
  getOnboardingPhase,
  isModuleAllowed,
  OnboardingPhase,
} from "../utils/onboardingLogic";

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
  } = useApp();
  const { user, profile } = useAuth();

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
  // Roles con acceso global a todas las notificaciones institucionales
  const ROLES_ACCESO_TOTAL = [UserRole.DIRECTIVO, UserRole.SUBDIRECCION, UserRole.SYSTEM_ADMIN, UserRole.DEVELOPER];
  const visibleNotifications = notifications.filter((n) => {
    if (!n.targetRole) return true; // Sin targetRole = global, todos la ven
    if (ROLES_ACCESO_TOTAL.includes(currentUserRole as UserRole)) return true;
    return n.targetRole === currentUserRole;
  });
  const unreadCount = visibleNotifications.filter((n) => !n.read).length;

  const sidebarWidth = isSidebarCollapsed ? "w-20" : "w-72";

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

  const { setIsTourActive } = useApp();

  // Monitorizar activación del tour (driver.js no es reactivo por sí solo)
  useEffect(() => {
    const checkTour = () => {
      const active = !!document.querySelector(".driver-popover") || localStorage.getItem("sase_tour_active") === "true";
      setIsTourActive(active);
    };

    const interval = setInterval(checkTour, 500);
    return () => clearInterval(interval);
  }, [setIsTourActive]);

  const displayUserName =
    profile?.nombre || user?.user_metadata?.full_name || "Usuario SASE";
  const displayUserRole =
    profile?.cargo_institucional || profile?.rol || currentUserRole;
  const neuralCoreState = aiSystemState;
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
      className="flex h-screen w-full bg-[#0B1120] text-slate-200 overflow-hidden font-sans select-none"
    >
      <TutorialController />
      
      {/* 🔮 Inyectar Filtros SVG Globales para Liquid Glass */}
      <LiquidGlassFilters />

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-[60] md:hidden backdrop-blur-md animate-fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Premium Crystal Glass (Light Edition) */}
      <aside
        className={`fixed inset-y-0 left-0 z-[70] ${sidebarWidth} glass-card-quantum !bg-[#0B1120]/60 !backdrop-blur-[60px] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] border-r border-white/10 md:relative md:translate-x-0 shadow-[10px_0_40px_-15px_rgba(0,0,0,0.4)] ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full relative overflow-hidden">
          {/* Internal Glow - Subtle Institutional Effect */}
          <div className="absolute top-[-5%] left-[-10%] w-[120%] h-[30%] bg-blue-500/5 blur-[100px] pointer-events-none animate-pulse-slow -z-10"></div>
          <div className="absolute bottom-[20%] right-[-20%] w-[100%] h-[30%] bg-slate-200/20 blur-[120px] pointer-events-none -z-10"></div>
          <div className="absolute top-[40%] left-[-10%] w-[50%] h-[20%] bg-blue-400/5 blur-[80px] pointer-events-none animate-pulse -z-10"></div>

          <div
            id="sidebar-logo"
            className={`p-6 border-b border-white/5 relative z-10 ${isSidebarCollapsed ? "items-center" : ""}`}
          >
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute -inset-1.5 bg-blue-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <img
                  src={roleImages[currentUserRole]}
                  alt={`Perfil de ${currentUserRole}`}
                  title={`Usuario: ${displayUserName}`}
                  className={`rounded-2xl border border-white shadow-lg relative z-10 object-cover transition-all ${isSidebarCollapsed ? "w-10 h-10" : "w-12 h-12"}`}
                />
              </div>
              {!isSidebarCollapsed && (
                <div className="flex-1 min-w-0 animate-fade-in text-white">
                  <h3 className="text-[10px] font-black truncate uppercase tracking-widest">
                    {displayUserName}
                  </h3>
                  <div className="flex flex-col gap-0.5 mt-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="size-1.5 bg-blue-400 rounded-full"></span>
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest truncate">
                        {displayUserRole}
                      </span>
                    </div>
                  </div>
                </div>
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

            {canAccess(AppModule.BITACORA) && (currentUserRole === UserRole.SYSTEM_ADMIN || 
              currentUserRole === UserRole.DEVELOPER || 
              currentUserRole === UserRole.PREFECTURA ||
              currentUserRole === UserRole.DIRECTIVO ||
              currentUserRole === UserRole.SUBDIRECCION) && (
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

            {!isSidebarCollapsed && (
              <span className="px-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] block mt-6 mb-4">
                Soporte y Ayuda
              </span>
            )}

            <NavItem
              icon="menu_book"
              label="Manual de Uso"
              active={false}
              onClick={() => {
                window.open("/docs/SASE_Manual_Integral.html", "_blank");
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
        <header className="h-20 bg-white/40 backdrop-blur-[40px] border-b border-white/60 flex items-center justify-between px-6 shrink-0 z-40">
          <div className="flex items-center gap-6">
            <button
              className="md:hidden size-10 flex items-center justify-center bg-white/60 border border-white/60 rounded-xl text-slate-600"
              onClick={() => setIsSidebarOpen(true)}
            >
              <span className="material-icons">menu</span>
            </button>

            <div className="flex flex-col">
              <h2 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.4em]">
                SASE <span className="text-blue-500/20 mx-1">/</span>{" "}
                <span className="text-blue-600 uppercase">GESTIÓN_INSTITUCIONAL</span>
              </h2>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                Estatus: Operativo • v{VERSION.numero}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="quick-register-btn"
              onClick={() => openQuickRegister(IncidentType.CONDUCTA)}
              className="hidden md:flex h-10 px-5 bg-red-600 text-white rounded-xl text-[10px] font-black tracking-widest hover:bg-red-500 transition-all shadow-lg shadow-red-500/20 items-center gap-2"
            >
              <span className="material-icons text-lg">emergency</span>
              REPORTE RÁPIDO
            </button>

            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`size-10 flex items-center justify-center rounded-xl border transition-all ${
                  unreadCount > 0
                    ? "bg-blue-500/10 border-blue-200 text-blue-600 animate-pulse-soft"
                    : "bg-white/40 border-white/60 text-slate-600 hover:bg-white/60 shadow-sm"
                }`}
              >
                <div className="relative">
                  <span className="material-icons">notifications</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 size-2 bg-red-500 rounded-full border-2 border-white"></span>
                  )}
                </div>
              </button>

              {showNotifications && (
                <div className="absolute top-14 right-0 w-80 md:w-96 z-50 animate-fade-in-up overflow-hidden rounded-2xl border border-white/60 shadow-2xl glass-dropdown bg-white/90 backdrop-blur-3xl">
                  <div className="p-4 border-b border-white/20 flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Alertas Institucionales
                    </span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[9px] font-black">
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
                          className={`p-4 rounded-xl mb-2 transition-all cursor-pointer border ${notif.read ? "bg-white/20 border-transparent opacity-60" : "bg-white border-white/60 hover:bg-white/80 shadow-sm"}`}
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
        <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar relative">
          <div className="p-4 md:p-8 animate-fade-in relative z-10">
            {children}
          </div>
        </main>

        {/* Sasito IA: siempre presente en todas las pantallas */}
        <SasitoAssistant />
        <EncuestaPulso />
      </div>

      <QuickRegister />
      <FeedbackWidget />
      <QuickRegisterModal />
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
          ? `bg-violet-500/10 backdrop-blur-md text-violet-400 shadow-xl shadow-black/20 font-black border-violet-500/30 scale-[1.02]`
          : "text-slate-400 hover:bg-white/5 hover:text-white font-bold border-transparent"
      } ${highlighted ? "shadow-[0_0_25px_rgba(139,92,246,0.2)] border-violet-500/20 bg-violet-500/5 animate-pulse-soft" : ""} ${collapsed ? "justify-center px-0" : ""}`}
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
