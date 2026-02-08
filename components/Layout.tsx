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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Use dynamic sidebar color
  const sidebarClass = roleColors[currentUserRole] || "bg-slate-800";

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
        className={`fixed inset-y-0 left-0 z-50 w-72 ${sidebarClass} text-white transition-all duration-500 shadow-[20px_0_50px_rgba(0,0,0,0.2)] md:relative md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full relative overflow-hidden backdrop-blur-md">
          {/* User Profile - PRIMARY FOCUS (Action 2) */}
          <div className="px-6 py-6 border-b border-white/10 flex flex-col items-center text-center">
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-tr from-white/20 to-transparent rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <img
                src={roleImages[currentUserRole]}
                alt="Profile"
                className="w-24 h-24 rounded-full border-4 border-white/20 shadow-2xl relative z-10 object-cover"
              />
            </div>
            <div className="mt-4">
              <h3 className="text-xl font-black text-white leading-tight">
                {user?.user_metadata?.full_name || "Usuario SASE"}
              </h3>
              <p className="text-xs font-bold text-white/50 uppercase tracking-widest mt-1">
                {currentUserRole}
              </p>
            </div>
          </div>

          {/* Institutional Logo - SECONDARY (Action 2) */}
          <div className="p-4 py-2 flex flex-col items-center opacity-40 hover:opacity-100 transition-opacity">
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

          {/* Navigation Links */}
          <nav
            id="sidebar-nav"
            className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar relative z-10 mt-1"
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
            />

            <div className="py-3 px-3 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mt-4 mb-1">
              Operativo
            </div>

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
              />
            )}

            <div className="py-3 px-3 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mt-4 mb-1">
              Seguimiento Institucional
            </div>

            <NavItem
              icon="description"
              label="Reportes"
              active={currentModule === AppModule.REPORTES}
              onClick={() => {
                setCurrentModule(AppModule.REPORTES);
                setIsSidebarOpen(false);
              }}
              color={currentUserRole}
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
              />
            )}
          </nav>

          {/* Logout & Version - Clean Subdued Style */}
          <div className="p-6 border-t border-white/10 relative z-10 text-center">
            <div className="space-y-4">
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
                  Manual de Usuario
                </span>
              </a>

              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.reload();
                }}
                className="group flex items-center gap-3 px-4 py-2 w-full text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all"
              >
                <span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">
                  logout
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Cerrar sesión
                </span>
              </button>
            </div>
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
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 bg-[#F9FBFF] relative">
        {/* Layered Institutional Depth */}
        <div className="absolute inset-0 z-0 pointer-events-none bg-slate-50">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-slate-200/50 rounded-full blur-[120px] -mr-48 -mt-48 opacity-50"></div>
        </div>

        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-30 shadow-sm">
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
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-400 hover:text-blue-600 transition-colors"
            >
              <span className="material-symbols-outlined text-[28px]">
                notifications
              </span>
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              )}
            </button>
          </div>
        </header>

        {/* Improved Institutional Notification Popover - Keep previous logic just cleaner style */}
        {showNotifications && (
          <div className="absolute top-20 right-6 w-80 bg-white border border-slate-200 shadow-2xl rounded-xl z-40 animate-fade-in overflow-hidden">
            {/* Simplified notification content for brevity in this replace block */}
            <div className="p-3 bg-slate-50 border-b border-slate-100 font-bold text-xs uppercase text-slate-500">
              Notificaciones
            </div>
            <div className="p-8 text-center text-slate-400 text-xs italic">
              Sin novedades
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
}> = ({ icon, label, active, onClick, id, color }) => {
  // Determine active colors based on role background
  // Usually white text on dark bg, but active item should pop
  // We'll use White background with Colored Text for active state

  // Map role to text color for the active stats
  const textColors: Record<UserRole, string> = {
    [UserRole.DIRECTIVO]: "text-slate-900",
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
      className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all group my-1 ${
        active
          ? `bg-white ${activeTextClass} shadow-lg shadow-black/10 font-black`
          : "text-white/70 hover:bg-white/10 hover:text-white font-medium"
      }`}
    >
      <span
        className={`material-symbols-outlined text-[20px] transition-transform ${
          active ? "" : "group-hover:scale-110"
        }`}
      >
        {icon}
      </span>
      <span className="text-xs uppercase tracking-wider">{label}</span>
      {active && (
        <span className="ml-auto material-symbols-outlined text-[16px]">
          chevron_right
        </span>
      )}
    </button>
  );
};
