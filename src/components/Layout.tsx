import React, { useState, useRef, useEffect } from "react";
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
import { SaseOrb } from "./SaseOrb";

const roleColors: Record<UserRole, string> = {
  [UserRole.DIRECTIVO]: "bg-red-900 border-none",
  [UserRole.SUBDIRECCION]: "bg-orange-800 border-none",
  [UserRole.DOCENTE]: "bg-blue-600 border-none",
  [UserRole.DOCENTE_TUTOR]: "bg-blue-700 border-none",
  [UserRole.PREFECTURA]: "bg-orange-600 border-none",
  [UserRole.ORIENTACION]: "bg-emerald-600 border-none",
  [UserRole.TRABAJO_SOCIAL]: "bg-purple-600 border-none",
  [UserRole.MEDICO_ESCOLAR]: "bg-red-600 border-none",
  [UserRole.SECRETARIA]: "bg-cyan-600 border-none",
  [UserRole.UDEII]: "bg-indigo-600 border-none",
  [UserRole.PROMOTORA_LECTURA]: "bg-pink-600 border-none",
  [UserRole.GUEST]: "bg-slate-800 border-none",
  [UserRole.DEVELOPER]: "bg-slate-900 border-none border-r border-white/5",
  [UserRole.SYSTEM_ADMIN]: "bg-indigo-950 border-none",
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

  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProtocolDismissed, setIsProtocolDismissed] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

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
    <div className="flex h-screen text-slate-300 overflow-hidden font-sans select-none bg-transparent">
      <TutorialController />

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-[60] md:hidden backdrop-blur-md animate-fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Premium Crystal Glass */}
      <aside
        className={`fixed inset-y-0 left-0 z-[70] ${sidebarWidth} glass-card-quantum !bg-[#06182a]/40 !backdrop-blur-[60px] transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] border-r border-white/10 md:relative md:translate-x-0 shadow-[20px_0_80px_-15px_rgba(0,0,0,0.6)] ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full relative overflow-hidden">
          {/* Internal Glow - Tactical Crystal Effect */}
          <div className="absolute top-[-5%] left-[-10%] w-[120%] h-[30%] bg-cyan-500/15 blur-[100px] pointer-events-none animate-pulse-slow"></div>
          <div className="absolute bottom-[20%] right-[-20%] w-[100%] h-[30%] bg-violet-600/10 blur-[120px] pointer-events-none"></div>
          <div className="absolute top-[40%] left-[-10%] w-[50%] h-[20%] bg-blue-500/10 blur-[80px] pointer-events-none animate-pulse"></div>

          {/* Profile Section */}
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
                  className={`rounded-2xl border border-white/10 shadow-2xl relative z-10 object-cover transition-all ${isSidebarCollapsed ? "w-10 h-10" : "w-12 h-12"}`}
                />
              </div>
              {!isSidebarCollapsed && (
                <div className="flex-1 min-w-0 animate-fade-in">
                  <h3 className="text-[10px] font-black text-white truncate uppercase tracking-widest title-sase">
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
              <span className="px-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] block mb-4">
                Operatividad
              </span>
            )}

            <NavItem
              id="nav-dashboard"
              icon="dashboard"
              label="Dashboard"
              active={currentModule === AppModule.DASHBOARD}
              onClick={() => {
                setCurrentModule(AppModule.DASHBOARD);
                setIsSidebarOpen(false);
              }}
              color={currentUserRole}
              highlighted={highlightedModule === AppModule.DASHBOARD}
              collapsed={isSidebarCollapsed}
            />

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

            {!isSidebarCollapsed && (
              <span className="px-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] block mt-6 mb-4">
                Soporte & Ayuda
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
          <div className="p-4 border-t border-white/5 space-y-3 relative z-10">
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
              className="hidden md:flex items-center justify-center w-full py-2 bg-white/[0.03] hover:bg-white/[0.08] text-slate-500 hover:text-white rounded-xl transition-all"
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
              className="flex items-center justify-center w-full py-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-xl transition-all group"
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
              className="flex items-center justify-center w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all group"
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
        {/* Header - Glassmorphism Sticky */}
        <header className="h-20 glass-card-quantum !rounded-none !border-b !border-white/5 !border-t-0 !border-l-0 !border-r-0 !bg-[#0b0e14]/50 flex items-center justify-between px-6 shrink-0 z-40 relative">
          <div className="flex items-center gap-6">
            <button
              className="md:hidden size-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl text-slate-400"
              onClick={() => setIsSidebarOpen(true)}
              title="Abrir menú de navegación"
              aria-label="Abrir menú lateral"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="text-[11px] font-black text-slate-100 uppercase tracking-[0.4em] title-sase">
                  SASE <span className="text-blue-500/40 mx-1">/</span>{" "}
                  <span className="text-blue-400 group-hover:text-blue-300 transition-colors uppercase">IA_NUCLEUS</span>
                </h2>
              </div>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                Estatus: Operativo • v{VERSION.numero}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
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

            <div className="h-8 w-px bg-white/10 mx-2 hidden md:block"></div>

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
                    : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                }`}
              >
                <div className="relative">
                  <span className="material-symbols-outlined">
                    notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 size-2 bg-red-500 rounded-full border-2 border-[#0b0e14]"></span>
                  )}
                </div>
              </button>

              {/* Notifications Dropdown (moved inside container for better ref handling) */}
              {showNotifications && (
                <div className="absolute top-14 right-0 w-80 md:w-96 z-50 animate-fade-in-up overflow-hidden rounded-2xl border border-white/[0.08] shadow-2xl shadow-black/80 glass-dropdown">
                  <div className="p-4 border-b border-white/5 flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Alertas del Sistema
                    </span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-500 rounded text-[9px] font-black">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
                    {notifications.length === 0 ? (
                      <div className="py-12 text-center opacity-40">
                        <span className="material-symbols-outlined text-4xl block mb-2">
                          notifications_off
                        </span>
                        <p className="text-[10px] font-black uppercase tracking-widest">
                          Sin notificaciones
                        </p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-4 rounded-xl mb-2 transition-all cursor-pointer ${notif.read ? "bg-white/[0.02] opacity-60" : "bg-white/5 hover:bg-white/[0.08]"}`}
                          onClick={() => {
                            markNotificationRead(notif.id);
                            if (notif.actionModule)
                              setCurrentModule(notif.actionModule);
                            setShowNotifications(false);
                          }}
                        >
                          <div className="flex gap-3">
                            <div
                              className={`size-8 rounded-lg flex items-center justify-center ${notif.type === "error" ? "bg-red-500/20 text-red-500" : "bg-blue-500/20 text-blue-500"}`}
                            >
                              <span className="material-symbols-outlined text-sm">
                                {notif.type === "error" ? "report" : "info"}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-[11px] font-black text-white uppercase truncate">
                                {notif.title}
                              </h4>
                              <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">
                                {notif.message}
                              </p>
                              <span className="text-[8px] text-slate-600 mt-2 block uppercase tracking-widest font-black">
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
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-blue-500/5 via-transparent to-transparent opacity-30"></div>
          <div className="p-4 md:p-8 animate-fade-in relative z-10">
            {children}
          </div>

          {/* Background Ambient Glow */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-blue-600/[0.02] blur-[150px]"></div>
            <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-indigo-600/[0.02] blur-[150px]"></div>
          </div>
        </main>

        <div className="fixed bottom-8 right-8 z-50">
          <SaseOrb
            state={neuralCoreState}
            className="w-[110px] h-[110px]"
            enablePanel
            panelData={{
              incidents: activeIncidentsCount,
              connectedUsers,
              lastEvent: lastSystemEvent,
              message: systemMessage || undefined,
              version: `SASE-310`,
            }}
          />
        </div>
      </div>

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
  // Determine active colors based on role background
  // Usually white text on dark bg, but active item should pop
  // We'll use White background with Colored Text for active state

  // Map role to text color for the active stats
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
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group my-1 border ${
        active
          ? `bg-white/95 backdrop-blur-md ${activeTextClass} shadow-[0_8px_30px_rgba(0,0,0,0.2)] font-black border-white/20 scale-[1.02]`
          : "text-white/60 hover:bg-white/10 hover:text-white font-bold border-transparent"
      } ${highlighted ? "shadow-[0_0_25px_rgba(59,130,246,0.35)] border-blue-500/40 bg-blue-500/10 animate-pulse-soft" : ""} ${collapsed ? "justify-center px-0" : ""}`}
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
