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
import AIOrbAssistant from "./ai/AIOrbAssistant";
import { LiquidGlassFilters } from "./ui/LiquidGlassFilters";
import { QuickRegister } from "./ui/QuickRegister";
import { motion, AnimatePresence } from "framer-motion";
import { EncuestaPulso } from "./onboarding/EncuestaPulso";

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

  // 🧭 PLAN ONBOARDING 30-60-90
  const onboardingPhase = useMemo(() => {
    const createdDate = profile?.creado_en ? new Date(profile.creado_en) : new Date();
    const diffDays = Math.ceil(Math.abs(new Date().getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 30) return 'PHASE_1';
    if (diffDays <= 60) return 'PHASE_2';
    if (diffDays <= 90) return 'PHASE_3';
    return 'GRADUATED';
  }, [profile]);

  const isPhase1 = onboardingPhase === 'PHASE_1';
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
      className="flex h-screen w-full bg-slate-50 text-slate-900 overflow-hidden font-sans select-none"
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
        className={`fixed inset-y-0 left-0 z-[70] ${sidebarWidth} glass-card-quantum !bg-white/60 !backdrop-blur-[60px] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] border-r border-slate-200 md:relative md:translate-x-0 shadow-[10px_0_40px_-15px_rgba(0,0,0,0.05)] ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full relative overflow-hidden">
          {/* Internal Glow - Subtle Institutional Effect */}
          <div className="absolute top-[-5%] left-[-10%] w-[120%] h-[30%] bg-blue-500/5 blur-[100px] pointer-events-none animate-pulse-slow"></div>
          <div className="absolute bottom-[20%] right-[-20%] w-[100%] h-[30%] bg-slate-200/20 blur-[120px] pointer-events-none"></div>
          <div className="absolute top-[40%] left-[-10%] w-[50%] h-[20%] bg-blue-400/5 blur-[80px] pointer-events-none animate-pulse"></div>

          <div
            id="sidebar-logo"
            className={`p-6 border-b border-slate-100 relative z-10 ${isSidebarCollapsed ? "items-center" : ""}`}
          >
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute -inset-1.5 bg-blue-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <img
                  src={roleImages[currentUserRole]}
                  alt={`Perfil de ${currentUserRole}`}
                  title={`Usuario: ${displayUserName}`}
                  className={`rounded-2xl border border-slate-200 shadow-xl shadow-black/5 relative z-10 object-cover transition-all ${isSidebarCollapsed ? "w-10 h-10" : "w-12 h-12"}`}
                />
              </div>
              {!isSidebarCollapsed && (
                <div className="flex-1 min-w-0 animate-fade-in">
                  <h3 className="text-[10px] font-black text-slate-900 truncate uppercase tracking-widest title-sase">
                    {displayUserName}
                  </h3>
                  <div className="flex flex-col gap-0.5 mt-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="size-1.5 bg-blue-500 rounded-full"></span>
                      <span className="text-[9px] font-black text-blue-500/70 uppercase tracking-widest truncate">
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
              <span className="px-4 text-[9px] font-black text-slate-700 uppercase tracking-[0.3em] block mb-4">
                Operatividad
              </span>
            )}

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

            {/* Fase 1 Docente: Mostrar SOLO herramientas críticas para evitar sobrecarga */}
            {isPhase1 && isDocente && (
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

            {/* FASES AVANZADAS: Desbloquear módulos complejos progresivamente (Excepto para administrativos/prefectura que necesitan todo) */}
            {(!isPhase1 || (currentUserRole !== UserRole.DOCENTE && currentUserRole !== UserRole.DOCENTE_TUTOR)) && (
              <>
                <NavItem
                  id="nav-agenda"
                  icon="calendar_month"
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
              </>
            )}

            {(currentUserRole === UserRole.PREFECTURA || 
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

                {(currentUserRole === UserRole.DIRECTIVO ||
                  currentUserRole === UserRole.SUBDIRECCION ||
                  currentUserRole === UserRole.SYSTEM_ADMIN ||
                  currentUserRole === UserRole.DEVELOPER) && (
                  <NavItem
                    id="nav-ia-sase"
                    icon="neurology"
                    label="Núcleo IA"
                    active={currentModule === AppModule.IA_SASE}
                    onClick={() => {
                      setCurrentModule(AppModule.IA_SASE);
                      setIsSidebarOpen(false);
                    }}
                    color={currentUserRole}
                    highlighted={highlightedModule === AppModule.IA_SASE}
                    collapsed={isSidebarCollapsed}
                  />
                )}

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
              </>
            )}

            {(currentUserRole === UserRole.SYSTEM_ADMIN || 
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
              <span className="px-4 text-[9px] font-black text-slate-700 uppercase tracking-[0.3em] block mt-6 mb-4">
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

          {/* Fase 2: Sistema Buddy (Mentor asignado) */}
          {onboardingPhase === 'PHASE_2' && !isSidebarCollapsed && (
            <div className="mx-4 mt-6 p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 animate-fade-in-up">
                <p className="text-[9px] text-emerald-600 font-bold mb-2 uppercase tracking-[0.2em]">Buddy Asignado</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                      <span className="material-icons text-emerald-600 text-sm">person</span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium">Prof. Roberto M.</p>
                </div>
            </div>
          )}

          {/* Footer Sidebar */}
          <div className="p-4 border-t border-slate-100 space-y-3 relative z-10">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              title={
                isSidebarCollapsed
                  ? "Expandir barra lateral"
                  : "Colapsar barra lateral"
              }
              aria-label={
                isSidebarCollapsed
                  ? "Expandir barra lateral"
                  : "Colapsar barra lateral"
              }
              className="hidden md:flex items-center justify-center w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-xl transition-all"
            >
              <span className="material-symbols-outlined text-lg">
                {isSidebarCollapsed
                  ? "side_navigation"
                  : "keyboard_double_arrow_left"}
              </span>
            </button>

            <button
              id="sidebar-feedback"
              onClick={() => setIsFeedbackOpen(true)}
               title="Enviar comentarios, sugerencias o reportar errores"
              className="flex items-center justify-center w-full py-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-all group"
            >
              <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">
                feedback
              </span>
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
              title="Cerrar sesión de forma segura"
              aria-label="Cerrar sesión"
              className="flex items-center justify-center w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all group"
            >
              <span className="material-symbols-outlined text-lg group-hover:rotate-180 transition-transform duration-500">
                logout
              </span>
              {!isSidebarCollapsed && (
                <span className="ml-3 text-[10px] font-black uppercase tracking-widest">
                  Cerrar Sesión
                </span>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Header - Glassmorphism Sticky (Light) */}
        <header className="h-20 glass-card-quantum !rounded-none !border-b !border-slate-200 !border-t-0 !border-l-0 !border-r-0 !bg-white/70 flex items-center justify-between px-6 shrink-0 z-40 relative">
          <div className="flex items-center gap-6">
            <button
              className="md:hidden size-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-700 shadow-sm hover:bg-slate-100"
              onClick={() => setIsSidebarOpen(true)}
              title="Abrir menú de navegación"
              aria-label="Abrir menú lateral"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.4em] title-sase">
                  SASE <span className="text-blue-500/40 mx-1">/</span>{" "}
                  <span className="text-blue-600 group-hover:text-blue-500 transition-colors uppercase">SISTEMA_SASE_310</span>
                </h2>
              </div>
              <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-1">
                Estatus: Operativo • v{VERSION.numero}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3 flex-wrap justify-end">
            {/* Quick Report Button */}
            <button
              id="quick-register-btn"
              onClick={() => openQuickRegister(IncidentType.CONDUCTA)}
              title="Generar un reporte de incidencia inmediato"
              aria-label="Generar reporte rápido"
              className="btn-premium-red hidden md:flex h-10 px-5"
            >
              <span className="material-symbols-outlined text-lg">
                emergency
              </span>
              <span className="ml-2">REPORTE RÁPIDO</span>
            </button>

            <div className="h-8 w-px bg-slate-200 mx-2 hidden md:block"></div>

            {/* Notification & Alerts */}
            <div
              className="relative flex items-center gap-2"
              ref={notificationRef}
            >
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                title={
                  unreadCount > 0
                    ? `Tienes ${unreadCount} notificaciones pendientes`
                    : "Ver notificaciones"
                }
                aria-label="Alternar panel de notificaciones"
                className={`size-10 flex items-center justify-center rounded-xl border transition-all ${
                  unreadCount > 0
                    ? "bg-blue-500/10 border-blue-500/30 text-blue-500 animate-pulse-soft"
                    : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 shadow-sm"
                }`}
              >
                <div className="relative">
                  <span className="material-symbols-outlined">
                    notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 size-2 bg-red-500 rounded-full border-2 border-white"></span>
                  )}
                </div>
              </button>

              {/* Notifications Dropdown (moved inside container for better ref handling) */}
              {showNotifications && (
                <div className="absolute top-14 right-0 w-80 md:w-96 z-50 animate-fade-in-up overflow-hidden rounded-2xl border border-slate-200 shadow-[0_16px_40px_-18px_rgba(15,23,42,0.25)] glass-dropdown">
                  <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white">
                    <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
                      Alertas del Sistema
                    </span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[9px] font-black border border-blue-100">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2 bg-white">
                    {visibleNotifications.length === 0 ? (
                      <div className="py-12 text-center opacity-60">
                        <span className="material-symbols-outlined text-4xl block mb-2 text-slate-400">
                          notifications_off
                        </span>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                          Sin notificaciones
                        </p>
                      </div>
                    ) : (
                      visibleNotifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-4 rounded-xl mb-2 transition-all cursor-pointer border ${notif.read ? "bg-slate-50 border-slate-200 opacity-75" : "bg-white border-slate-200 hover:bg-slate-50"}`}
                          onClick={() => {
                            markNotificationRead(notif.id);
                            if (notif.actionModule)
                              setCurrentModule(notif.actionModule);
                            setShowNotifications(false);
                          }}
                        >
                          <div className="flex gap-3">
                            <div
                              className={`size-8 rounded-2xl flex items-center justify-center ${notif.type === "error" ? "bg-red-100 text-red-600" : notif.type === "warning" ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"}`}
                            >
                              <span className="material-symbols-outlined text-sm">
                                {notif.type === "error" ? "report" : notif.type === "warning" ? "warning" : "info"}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-[11px] font-black text-slate-900 uppercase truncate">
                                {notif.title}
                              </h4>
                              <p className="text-[10px] text-slate-600 mt-0.5 line-clamp-2">
                                {notif.message}
                              </p>
                              <span className="text-[8px] text-slate-700 mt-2 block uppercase tracking-widest font-black">
                                {notif.time}
                              </span>
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
          
          {/* 🏛️ Banners de Onboarding 30-60-90 */}
          <AnimatePresence>
            {isPhase1 && (
              <motion.div 
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                className="absolute top-0 left-0 w-full bg-blue-600/20 border-b border-blue-500/30 backdrop-blur-xl z-30 px-6 py-4 flex items-center justify-center gap-6 shadow-2xl"
              >
                <div className="flex items-center gap-3">
                   <span className="material-icons text-blue-400 text-xl">info</span>
                   <p className="text-sm text-blue-100 font-medium text-center">
                     <strong>Regla de Oro:</strong> SASE acompaña procesos, no persigue errores. Lo que no se documenta, se olvida.
                   </p>
                </div>
                <div className="px-3 py-1 bg-blue-500/20 rounded-full text-[10px] text-blue-300 font-black tracking-widest uppercase border border-blue-500/30 whitespace-nowrap">
                  FASE 1: ADAPTACIÓN
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Disclaimer Sasito Zero UI en Fase 1 */}
          {isPhase1 && (
             <div className="fixed bottom-28 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full bg-slate-900/40 border border-white/10 backdrop-blur-2xl z-20 shadow-2xl animate-fade-in">
                <p className="text-xs text-slate-400 text-center flex items-center gap-2">
                  <span className="size-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_#3b82f6]"></span>
                  Sasito es un asistente de detección, <strong className="text-white">nunca sustituye tu criterio humano</strong>.
                </p>
             </div>
          )}

          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-blue-500/5 via-transparent to-transparent opacity-30"></div>
          <div className={`p-4 md:p-8 animate-fade-in relative z-10 ${isPhase1 ? 'pt-24' : ''}`}>
            {children}
          </div>

          {/* Background Ambient Glow */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-blue-600/[0.02] blur-[150px]"></div>
            <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-indigo-600/[0.02] blur-[150px]"></div>
          </div>
        </main>

        {/* Sasito IA: siempre presente en todas las pantallas */}
        <AIOrbAssistant status={assistantStatus} hideFloating={false} />
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
    [UserRole.DIRECTIVO]: "text-slate-900",
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
    [UserRole.GUEST]: "text-slate-800",
    [UserRole.DEVELOPER]: "text-black",
    [UserRole.SYSTEM_ADMIN]: "text-indigo-900",
  };

  const activeTextClass = textColors[color as UserRole] || "text-slate-800";

  return (
    <button
      id={id}
      onClick={onClick}
      title={collapsed ? label : ""}
      className={`w-full flex items-center gap-3 px-3 py-2.5 min-h-[48px] rounded-xl transition-all group my-1 border ${
        active
          ? `bg-[#E6D9FF] backdrop-blur-md text-[#6D28D9] shadow-xl shadow-black/5 font-black border-[#B799FF]/30 scale-[1.02]`
          : "text-slate-700 hover:bg-slate-100 hover:text-slate-950 font-bold border-transparent"
      } ${highlighted ? "shadow-[0_0_25px_rgba(183,153,255,0.25)] border-[#B799FF]/20 bg-[#B799FF]/5 animate-pulse-soft" : ""} ${collapsed ? "justify-center px-0" : ""}`}
    >
      <span
        className={`material-symbols-outlined text-[20px] transition-transform ${
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
            <span className="ml-auto material-symbols-outlined text-[16px]">
              chevron_right
            </span>
          )}
        </>
      )}
    </button>
  );
};
