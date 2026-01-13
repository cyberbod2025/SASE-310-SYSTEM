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

const roleImages: Record<UserRole, string> = {
  [UserRole.DIRECTIVO]: "/assets/branding/DIRECION.png",
  [UserRole.DOCENTE]: "/assets/branding/DOCENTES.png",
  [UserRole.DOCENTE_TUTOR]: "/assets/branding/DOCENTES.png",
  [UserRole.PREFECTURA]: "/assets/branding/PREFECVTURA.png",
  [UserRole.ORIENTACION]: "/assets/branding/ORIENTACION.png",
  [UserRole.TRABAJO_SOCIAL]: "/assets/branding/T.SOCIAL.png",
  [UserRole.ENFERMERIA]: "/assets/branding/ENFERMERIA.png",
  [UserRole.SECRETARIA]: "/assets/branding/SECRETARIOS.png",
  [UserRole.UDEII]: "/assets/branding/UDEII.png",
  [UserRole.GUEST]: "/assets/branding/logo_sase_official.png",
  [UserRole.DEVELOPER]: "/assets/branding/SASE_LOGO.png",
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

  const [showNotifications, setShowNotifications] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex h-screen bg-slate-100 text-slate-800 overflow-hidden font-sans">
      <TutorialController />
      <QuickRegisterModal />
      <FloatingAssistant />

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Institutional White/Blue */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transition-transform duration-300 transform md:relative md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex flex-col items-center gap-2 w-full">
              <img
                src="/assets/branding/SASE.png"
                alt="SASE-310"
                className="h-10 w-auto object-contain"
              />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Identidad Institucional
              </span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden text-slate-400 hover:text-slate-600"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
            <NavItem
              icon="hub"
              label="Centro de Comando"
              active={currentModule === AppModule.HOME}
              onClick={() => {
                setCurrentModule(AppModule.HOME);
                setIsSidebarOpen(false);
              }}
            />
            <NavItem
              icon="dashboard"
              label="Tablero de Control"
              active={currentModule === AppModule.DASHBOARD}
              onClick={() => {
                setCurrentModule(AppModule.DASHBOARD);
                setIsSidebarOpen(false);
              }}
            />

            <div className="py-2 px-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-6 mb-2">
              Gestión Educativa
            </div>

            {(currentUserRole === UserRole.DOCENTE ||
              currentUserRole === UserRole.DEVELOPER) && (
              <NavItem
                icon="groups"
                label="Mis Grupos"
                active={false}
                onClick={() => {
                  setCurrentModule(AppModule.DASHBOARD);
                  setIsSidebarOpen(false);
                }}
              />
            )}

            {(currentUserRole === UserRole.PREFECTURA ||
              currentUserRole === UserRole.DEVELOPER) && (
              <NavItem
                icon="list_alt"
                label="Control Asistencia"
                active={false}
                onClick={() => {
                  setCurrentModule(AppModule.DASHBOARD);
                  setIsSidebarOpen(false);
                }}
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
              />
            )}

            <div className="py-2 px-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-6 mb-2">
              Expediente Digital
            </div>

            <NavItem
              icon="policy"
              label="Bitácora SASE"
              active={currentModule === AppModule.BITACORA}
              onClick={() => {
                setCurrentModule(AppModule.BITACORA);
                setIsSidebarOpen(false);
              }}
            />
            <NavItem
              icon="description"
              label="Reportes Oficiales"
              active={currentModule === AppModule.REPORTES}
              onClick={() => {
                setCurrentModule(AppModule.REPORTES);
                setIsSidebarOpen(false);
              }}
            />
            <NavItem
              icon="rule_folder"
              label="Protocolos Legales"
              active={currentModule === AppModule.PROTOCOLOS}
              onClick={() => {
                setCurrentModule(AppModule.PROTOCOLOS);
                setIsSidebarOpen(false);
              }}
            />
          </nav>

          {/* User Profile & Logout */}
          <div className="p-5 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-10 rounded-xl bg-blue-700 text-white flex items-center justify-center font-black shadow-lg shadow-blue-900/10">
                {currentUserRole.substring(0, 1).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-black text-slate-800 truncate uppercase tracking-tight italic">
                  {currentUserRole}
                </p>
                <p className="text-[10px] text-slate-500 truncate font-medium">
                  CCT: 09DES4310M
                </p>
              </div>
            </div>

            <button
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.reload();
              }}
              className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-red-700 hover:bg-red-50 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-transparent hover:border-red-100"
            >
              <span className="material-symbols-outlined text-[18px]">
                logout
              </span>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-30">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden text-slate-500 p-2 hover:bg-slate-100 rounded-lg"
              onClick={() => setIsSidebarOpen(true)}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h2 className="font-black text-slate-800 text-sm uppercase tracking-tight flex items-center gap-3">
              <span className="text-blue-700">SASE-310</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-500 font-bold opacity-70">
                {currentModule.replace("_", " ").toUpperCase()}
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="notif-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              className={`size-10 flex items-center justify-center rounded-xl transition-all relative ${
                showNotifications
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "bg-slate-50 text-slate-500 hover:bg-slate-100"
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">
                notifications
              </span>
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 size-2.5 bg-red-600 rounded-full border-2 border-white animate-pulse"></span>
              )}
            </button>
          </div>
        </header>

        {/* Improved Institutional Notification Popover */}
        {showNotifications && (
          <div className="absolute top-16 right-6 w-80 bg-white border border-slate-200 shadow-2xl rounded-2xl z-40 animate-fade-in overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
                Notificaciones
              </h3>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[9px] font-bold">
                {unreadCount} Pendientes
              </span>
            </div>
            <div className="max-h-[350px] overflow-y-auto">
              {unreadCount === 0 ? (
                <div className="p-10 text-center text-slate-400">
                  <span className="material-symbols-outlined text-4xl mb-2 opacity-20">
                    notifications_off
                  </span>
                  <p className="text-[10px] font-bold uppercase">Sin avisos</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  <div className="p-4 hover:bg-slate-50 transition-colors cursor-pointer group border-l-4 border-amber-500">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">
                      Prefectura • Hace 5 min
                    </p>
                    <p className="text-xs font-bold text-slate-700 group-hover:text-blue-700">
                      Incidencia Detectada
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Se requiere revisión en el grupo 3º B por inasistencia
                      colectiva.
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
              <button className="text-[10px] font-black text-blue-700 uppercase tracking-widest hover:underline">
                Limpiar todas
              </button>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
};

const NavItem: React.FC<{
  icon: string;
  label: string;
  active: boolean;
  id?: string;
  onClick: () => void;
}> = ({ icon, label, active, onClick, id }) => (
  <button
    id={id}
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
      active
        ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20"
        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
    }`}
  >
    <span
      className={`material-symbols-outlined text-[20px] transition-transform ${
        active ? "fill scale-110" : "group-hover:scale-110"
      }`}
    >
      {icon}
    </span>
    <span
      className={`text-[12px] font-black uppercase tracking-wide ${
        active ? "opacity-100" : "opacity-70 group-hover:opacity-100"
      }`}
    >
      {label}
    </span>
    {active && (
      <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></div>
    )}
  </button>
);
