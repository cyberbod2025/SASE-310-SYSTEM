import React, { useState } from "react";
import { useApp } from "../store";
import { UserRole, AppModule } from "../types";
import { QuickRegisterModal } from "./QuickRegisterModal";
import { AssistantBanner } from "./AssistantBanner";
import { supabase } from "../supabase/client";
import { FloatingAssistant } from "./FloatingAssistant";
import { startProductTour } from "./TourGuide";
import { FeedbackWidget } from "./FeedbackWidget";
import { TutorialController } from "./Tutorials/TutorialController";
import { VERSION, BRANDING } from "../config/sase.config";
import { useAuth } from "./AuthProvider";

const roleColors: Record<UserRole, string> = {
  [UserRole.DIRECTIVO]: "bg-red-900 border-none",
  [UserRole.SUBDIRECCION]: "bg-orange-800 border-none",
  [UserRole.DOCENTE]: "bg-blue-600 border-none",
  [UserRole.DOCENTE_TUTOR]: "bg-blue-700 border-none",
  [UserRole.PREFECTURA]: "bg-orange-600 border-none",
  [UserRole.ORIENTACION]: "bg-emerald-600 border-none",
  [UserRole.TRABAJO_SOCIAL]: "bg-purple-600 border-none",
  [UserRole.ENFERMERIA]: "bg-red-600 border-none",
  [UserRole.SECRETARIA]: "bg-cyan-600 border-none",
  [UserRole.UDEII]: "bg-indigo-600 border-none",
  [UserRole.PROMOTORA]: "bg-pink-600 border-none",
  [UserRole.GUEST]: "bg-slate-800 border-none",
  [UserRole.DEVELOPER]: "bg-slate-900 border-none border-r border-white/5",
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
  [UserRole.ENFERMERIA]:
    "https://ui-avatars.com/api/?name=Enfermeria&background=fee2e2&color=991b1b",
  [UserRole.SECRETARIA]:
    "https://ui-avatars.com/api/?name=Secretaria&background=cffafe&color=083344",
  [UserRole.UDEII]:
    "https://ui-avatars.com/api/?name=UDEII&background=e0e7ff&color=312e81",
  [UserRole.PROMOTORA]:
    "https://ui-avatars.com/api/?name=Promotora&background=fce7f3&color=701a75",
  [UserRole.GUEST]:
    "https://ui-avatars.com/api/?name=Invitado&background=f1f5f9&color=0f172a",
  [UserRole.DEVELOPER]:
    "https://ui-avatars.com/api/?name=Admin&background=000&color=fff",
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const {
    currentUserRole,
    switchRole,
    setQuickRegisterOpen,
    currentModule,
    setCurrentModule,
    notifications,
    markNotificationRead,
  } = useApp();
  const { user } = useAuth();

  const [showNotifications, setShowNotifications] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Desktop state
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Use dynamic sidebar color
  const sidebarClass = roleColors[currentUserRole] || "bg-slate-800";
  const sidebarWidth = isSidebarCollapsed ? "w-20" : "w-72";

  return (
    <div className="flex h-screen bg-slate-100 text-slate-800 overflow-hidden font-sans">
      <TutorialController />
      <QuickRegisterModal />
      {/* Assistant is now integrated into AssistantBanner */}
      {/* Assistant is now integrated into AssistantBanner but we need the component for the floating behavior */}
      <FloatingAssistant />

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Colored by Role */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 ${sidebarWidth} ${sidebarClass} text-white transition-all duration-300 shadow-[20px_0_50px_rgba(0,0,0,0.2)] md:relative md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full relative overflow-hidden backdrop-blur-md">
          {/* User Profile - PRIMARY FOCUS (Action 2) */}
          <div className="px-4 py-6 border-b border-white/10 flex flex-col items-center text-center transition-all duration-300">
            {/* Collapse Toggle (Desktop) */}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden md:flex absolute top-4 right-4 p-1 hover:bg-white/10 rounded-full transition-colors z-20"
              title={isSidebarCollapsed ? "Expandir Panel" : "Colapsar Panel"}
            >
              <span className="material-symbols-outlined text-white/50 hover:text-white text-sm">
                {isSidebarCollapsed ? "arrow_forward_ios" : "arrow_back_ios"}
              </span>
            </button>

            <div
              className={`relative group transition-all duration-300 ${isSidebarCollapsed ? "scale-75 mb-2 mt-6" : ""}`}
            >
              <div className="absolute -inset-2 bg-gradient-to-tr from-white/20 to-transparent rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <img
                src={roleImages[currentUserRole]}
                alt="Profile"
                className={`rounded-full border-4 border-white/20 shadow-2xl relative z-10 object-cover transition-all duration-300 ${isSidebarCollapsed ? "w-12 h-12" : "w-24 h-24"}`}
              />
            </div>

            {!isSidebarCollapsed && (
              <div className="mt-4 animate-fade-in">
                <h3 className="text-xl font-black text-white leading-tight">
                  {user?.user_metadata?.full_name || "Usuario SASE"}
                </h3>
                <p className="text-xs font-bold text-white/50 uppercase tracking-widest mt-1">
                  {currentUserRole}
                </p>
              </div>
            )}
          </div>

          {/* Institutional Logo - SECONDARY (Action 2) */}
          {!isSidebarCollapsed && (
            <div className="p-4 py-2 flex flex-col items-center opacity-40 hover:opacity-100 transition-opacity animate-fade-in">
              <span className="text-[8px] font-black tracking-[0.4em] text-white/40 uppercase mb-2">
                Plataforma Institucional
              </span>
              <div className="p-2 bg-white/5 rounded-xl backdrop-blur-xl border border-white/10 shadow-sm">
                <img
                  src="/assets/branding/SASE.png"
                  alt="SASE"
                  className="h-6 w-auto brightness-0 invert"
                />
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav
            id="sidebar-nav"
            className="flex-1 p-2 space-y-1 overflow-y-auto custom-scrollbar relative z-10 mt-1"
          >
            <NavItem
              icon="dashboard"
              label="Inicio"
              active={
                currentModule === AppModule.HOME ||
                currentModule === AppModule.DASHBOARD
              }
              onClick={() => {
                setCurrentModule(AppModule.DASHBOARD);
                setIsSidebarOpen(false);
              }}
              color={currentUserRole}
              collapsed={isSidebarCollapsed}
            />

            {!isSidebarCollapsed && (
              <div className="py-3 px-3 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mt-4 mb-1 border-t border-white/5">
                Operativo
              </div>
            )}
            {isSidebarCollapsed && (
              <div className="h-px bg-white/10 my-4 mx-2"></div>
            )}

            {(currentUserRole === UserRole.DOCENTE ||
              currentUserRole === UserRole.DEVELOPER) && (
              <NavItem
                icon="groups"
                label="Mis Grupos"
                active={currentModule === AppModule.MIS_GRUPOS}
                onClick={() => {
                  setCurrentModule(AppModule.MIS_GRUPOS);
                  setIsSidebarOpen(false);
                }}
                color={currentUserRole}
                collapsed={isSidebarCollapsed}
              />
            )}

            {(currentUserRole === UserRole.PREFECTURA ||
              currentUserRole === UserRole.DEVELOPER) && (
              <NavItem
                icon="list_alt"
                label="Lista Asistencia"
                active={false}
                onClick={() => {
                  setCurrentModule(AppModule.DASHBOARD);
                  setIsSidebarOpen(false);
                }}
                color={currentUserRole}
                collapsed={isSidebarCollapsed}
              />
            )}

            {(currentUserRole === UserRole.SECRETARIA ||
              currentUserRole === UserRole.DEVELOPER) && (
              <NavItem
                icon="person_add"
                label="Inscripciones"
                active={currentModule === AppModule.INSCRIPCIONES}
                onClick={() => {
                  setCurrentModule(AppModule.INSCRIPCIONES);
                  setIsSidebarOpen(false);
                }}
                color={currentUserRole}
                collapsed={isSidebarCollapsed}
              />
            )}

            {!isSidebarCollapsed && (
              <div className="py-3 px-3 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mt-4 mb-1 border-t border-white/5">
                Seguimiento
              </div>
            )}
            {isSidebarCollapsed && (
              <div className="h-px bg-white/10 my-4 mx-2"></div>
            )}

            <NavItem
              icon="description"
              label="Reportes"
              active={currentModule === AppModule.REPORTES}
              onClick={() => {
                setCurrentModule(AppModule.REPORTES);
                setIsSidebarOpen(false);
              }}
              color={currentUserRole}
              collapsed={isSidebarCollapsed}
            />

            <NavItem
              icon="rule"
              label="Protocolos"
              active={currentModule === AppModule.PROTOCOLOS}
              onClick={() => {
                setCurrentModule(AppModule.PROTOCOLOS);
                setIsSidebarOpen(false);
              }}
              color={currentUserRole}
              collapsed={isSidebarCollapsed}
            />

            {(currentUserRole === UserRole.DIRECTIVO ||
              currentUserRole === UserRole.SECRETARIA ||
              currentUserRole === UserRole.DEVELOPER) && (
              <NavItem
                icon="verified_user"
                label="Aprobaciones"
                active={currentModule === AppModule.APROBACIONES_PERSONAL}
                onClick={() => {
                  setCurrentModule(AppModule.APROBACIONES_PERSONAL);
                  setIsSidebarOpen(false);
                }}
                color={currentUserRole}
                collapsed={isSidebarCollapsed}
              />
            )}

            {(currentUserRole === UserRole.DIRECTIVO ||
              currentUserRole === UserRole.DEVELOPER) && (
              <NavItem
                icon="policy"
                label="Auditoría"
                active={currentModule === AppModule.BITACORA}
                onClick={() => {
                  setCurrentModule(AppModule.BITACORA);
                  setIsSidebarOpen(false);
                }}
                color={currentUserRole}
                collapsed={isSidebarCollapsed}
              />
            )}
          </nav>

          {/* Logout & Version - Clean Subdued Style */}
          <div className="p-4 border-t border-white/10 relative z-10 text-center">
            <div className="space-y-2">
              {!isSidebarCollapsed && (
                <a
                  href="/docs/SASE_Manual_Integral.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl transition-all group"
                >
                  <span className="material-symbols-outlined text-[18px] text-white/70 group-hover:text-white">
                    menu_book
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/70 group-hover:text-white">
                    Manual
                  </span>
                </a>
              )}

              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.reload();
                }}
                className={`group flex items-center justify-center gap-3 w-full text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all ${isSidebarCollapsed ? "p-2" : "px-4 py-2"}`}
                title="Cerrar Sesión"
              >
                <span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">
                  logout
                </span>
                {!isSidebarCollapsed && (
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Salir
                  </span>
                )}
              </button>
            </div>

            {!isSidebarCollapsed && (
              <div className="mt-6 flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-[8px] font-black text-white/30 uppercase tracking-[0.4em]">
                  SISTEMA SASE <span className="text-white/20">•</span>{" "}
                  {VERSION.numero}
                </div>

                {/* Dev Mode Indicator - Minimalist but clearly visible for developers */}
                {currentUserRole === UserRole.DEVELOPER && (
                  <div className="px-3 py-1 rounded-full bg-black/40 border border-white/10 text-cyan-400 text-[8px] font-black uppercase tracking-[0.2em] shadow-lg animate-pulse">
                    Modo Dev Activo
                  </div>
                )}

                <div className="text-[7px] font-bold text-white/20 uppercase tracking-widest mt-1">
                  ESD 310 • PILOTO INSTITUCIONAL
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 bg-[#F9FBFF] relative transition-all duration-300">
        {/* Layered Institutional Depth */}
        <div className="absolute inset-0 z-0 pointer-events-none bg-slate-50">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-slate-200/50 rounded-full blur-[120px] -mr-48 -mt-48 opacity-50"></div>
        </div>

        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-30 shadow-sm transition-all">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden text-slate-500 p-2 hover:bg-slate-100 rounded-lg"
              onClick={() => setIsSidebarOpen(true)}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>

            {/* Breadcrumbs / Page Title - Humanized & Secondary */}
            <div className="flex flex-col">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none mb-1">
                Espacio de Acompañamiento
              </h2>
              <div className="flex items-center gap-2 text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                ESD 310 <span className="text-slate-200">/</span>{" "}
                {currentUserRole}
              </div>
            </div>

            {/* CRITICAL PROTOCOL BANNER */}
            {notifications.some((n) => !n.read && n.type === "error") && (
              <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-red-50 border border-red-200 rounded-xl animate-pulse ml-6">
                <span className="material-symbols-outlined text-red-600 animate-bounce">
                  emergency
                </span>
                <span className="text-[10px] font-black text-red-700 uppercase tracking-wider">
                  Protocolo de Emergencia Activo
                </span>
                <button
                  onClick={() => setShowNotifications(true)}
                  className="px-2 py-1 bg-red-600 text-white text-[8px] font-bold uppercase rounded-lg hover:bg-red-700 transition-colors"
                >
                  Ver Acción
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Dev Tools (Role Switcher) */}
            <div className="hidden xl:flex items-center bg-slate-100 p-1 px-3 rounded-full border border-slate-200">
              <span className="material-symbols-outlined text-slate-400 text-sm mr-2">
                manage_accounts
              </span>
              <select
                value={currentUserRole}
                onChange={(e) => switchRole(e.target.value as UserRole)}
                className="bg-transparent text-[10px] font-black text-slate-600 uppercase tracking-wide outline-none cursor-pointer hover:text-blue-600 transition-colors"
              >
                {Object.values(UserRole)
                  .filter(
                    (r) => r !== UserRole.GUEST && r !== UserRole.DEVELOPER,
                  )
                  .map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
              </select>
            </div>

            <button
              onClick={() => {
                import("../utils/sound").then((s) => s.playClickSound());
                setShowNotifications(!showNotifications);
              }}
              className={`relative p-2 transition-all hover:scale-110 active:scale-95 ${
                unreadCount > 0
                  ? "text-blue-600 animate-pulse"
                  : "text-slate-400 hover:text-blue-600"
              }`}
            >
              <span className="material-symbols-outlined text-[28px]">
                notifications
              </span>
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm animate-ping"></span>
              )}
            </button>
          </div>
        </header>

        {/* Improved Institutional Notification Popover - Real Data */}
        {showNotifications && (
          <div className="absolute top-20 right-6 w-96 bg-white border border-slate-200 shadow-2xl rounded-2xl z-50 animate-fade-in overflow-hidden max-h-[80vh] flex flex-col">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <span className="font-black text-[10px] uppercase text-slate-500 tracking-[0.2em]">
                Centro de Alertas
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[9px] font-black uppercase tracking-widest animate-pulse">
                  {unreadCount} Pendientes
                </span>
              )}
            </div>

            <div className="overflow-y-auto custom-scrollbar flex-1">
              {notifications.length === 0 ? (
                <div className="p-12 text-center">
                  <span className="material-symbols-outlined text-[48px] text-slate-200 block mb-2">
                    notifications_off
                  </span>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest italic">
                    Sin novedades en el sistema
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-4 transition-all hover:bg-slate-50 cursor-pointer border-l-4 ${
                        notif.read
                          ? "border-transparent opacity-60"
                          : notif.type === "error"
                            ? "border-red-500 bg-red-50/20"
                            : notif.type === "warning"
                              ? "border-orange-500 bg-orange-50/20"
                              : "border-blue-500 bg-blue-50/20"
                      }`}
                      onClick={() => {
                        markNotificationRead(notif.id);
                        if (notif.actionModule)
                          setCurrentModule(notif.actionModule);
                        setShowNotifications(false);
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-1 p-1.5 rounded-lg ${
                            notif.type === "error"
                              ? "text-red-600 bg-red-100"
                              : notif.type === "warning"
                                ? "text-orange-600 bg-orange-100"
                                : "text-blue-600 bg-blue-100"
                          }`}
                        >
                          <span className="material-symbols-outlined text-lg">
                            {notif.type === "error"
                              ? "report"
                              : notif.type === "warning"
                                ? "warning"
                                : "info"}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h4
                            className={`text-xs font-black leading-tight ${notif.read ? "text-slate-600" : "text-slate-800"}`}
                          >
                            {notif.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed line-clamp-2">
                            {notif.message}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                              {notif.time}
                            </span>
                            {!notif.read && (
                              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar relative">
          <div className="relative z-10 max-w-7xl mx-auto">
            <AssistantBanner />
            {children}
          </div>
        </main>
      </div>

      {/* Floating System Tools */}
      <FeedbackWidget />
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
}> = ({ icon, label, active, onClick, id, color, collapsed }) => {
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
    [UserRole.ENFERMERIA]: "text-red-600",
    [UserRole.SECRETARIA]: "text-cyan-600",
    [UserRole.UDEII]: "text-indigo-600",
    [UserRole.PROMOTORA]: "text-pink-600",
    [UserRole.GUEST]: "text-slate-800",
    [UserRole.DEVELOPER]: "text-black",
  };

  const activeTextClass = textColors[color as UserRole] || "text-slate-800";

  return (
    <button
      id={id}
      onClick={onClick}
      title={collapsed ? label : ""}
      className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all group my-1 ${
        active
          ? `bg-white ${activeTextClass} shadow-lg shadow-black/10 font-black`
          : "text-white/70 hover:bg-white/10 hover:text-white font-medium"
      } ${collapsed ? "justify-center px-0" : ""}`}
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
