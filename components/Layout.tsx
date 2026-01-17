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
  [UserRole.PROMOTORA]: "/assets/branding/DOCENTES.png", // Usando Docentes como placeholder
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
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
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

            <div className="py-3 px-3 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mt-6 mb-2">
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

            <div className="py-3 px-3 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mt-6 mb-2">
              Expediente Digital
            </div>

            {(currentUserRole === UserRole.DIRECTIVO ||
              currentUserRole === UserRole.DEVELOPER) && (
              <NavItem
                icon="policy"
                label="Bitácora SASE"
                active={currentModule === AppModule.BITACORA}
                onClick={() => {
                  setCurrentModule(AppModule.BITACORA);
                  setIsSidebarOpen(false);
                }}
              />
            )}
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
                <p className="text-sm font-black text-slate-800 truncate uppercase tracking-tight italic">
                  {currentUserRole}
                </p>
                <p className="text-[11px] text-slate-500 truncate font-bold">
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
              <span className="material-symbols-outlined text-[20px]">
                logout
              </span>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 bg-[#F9FBFF] relative overflow-hidden">
        {/* Layered Institutional Depth */}
        {/* Layered Institutional Depth */}
        <div className="absolute inset-0 z-0 pointer-events-none bg-slate-50">
          {/* Executive Mesh Pattern */}
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage: `linear-gradient(#1e40af 0.8px, transparent 0.8px), linear-gradient(90deg, #1e40af 0.8px, transparent 0.8px)`,
              backgroundSize: "32px 32px",
            }}
          ></div>
          {/* Soft Depth Spheres - Enhanced */}
          <div className="absolute -top-24 -right-24 w-[500px] h-[500px] bg-blue-600/[0.08] rounded-full blur-[120px]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.7),transparent)]"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-slate-200/[0.4] rounded-full blur-[100px] -ml-24 -mb-24"></div>
        </div>

        <header className="h-20 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-8 shrink-0 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-8">
            <button
              className="md:hidden text-slate-500 p-2.5 hover:bg-slate-100 rounded-2xl transition-all"
              onClick={() => setIsSidebarOpen(true)}
            >
              <span className="material-symbols-outlined">menu_open</span>
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <h2 className="font-black text-slate-800 text-xl uppercase tracking-tighter italic">
                  SASE
                </h2>
                <div className="w-px h-4 bg-slate-300"></div>
                <span className="text-[11px] font-black text-blue-700 uppercase tracking-[0.3em] opacity-80">
                  {currentModule.replace("_", " ")}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                Protocolo de Identidad Oficial :: CCT: 09DES4310M
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex flex-col items-end mr-4">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                Servidor 310
              </span>
              <span className="text-[11px] font-bold text-blue-600">
                v2.4.0 PILOTO
              </span>
            </div>

            <div className="hidden xl:flex items-center bg-slate-100/50 p-1 px-2 rounded-xl border border-slate-200">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-2 ml-1">
                Simulación:
              </span>
              <select
                value={currentUserRole}
                onChange={(e) => switchRole(e.target.value as UserRole)}
                className="bg-transparent text-[10px] font-black text-blue-700 uppercase tracking-tight outline-none cursor-pointer hover:text-blue-900 transition-colors"
              >
                {Object.values(UserRole)
                  .filter(
                    (r) => r !== UserRole.GUEST && r !== UserRole.DEVELOPER
                  )
                  .map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
              </select>
            </div>

            <button
              id="notif-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              className={`size-12 flex items-center justify-center rounded-2xl transition-all relative ${
                showNotifications
                  ? "bg-blue-600 text-white shadow-xl shadow-blue-500/30"
                  : "bg-slate-50 text-slate-500 hover:bg-white hover:shadow-md border border-slate-100"
              }`}
            >
              <span className="material-symbols-outlined text-[24px]">
                notifications
              </span>
              {unreadCount > 0 && (
                <span className="absolute top-3 right-3 size-2.5 bg-red-600 rounded-full border-2 border-white"></span>
              )}
            </button>
          </div>
        </header>

        {/* Improved Institutional Notification Popover */}
        {showNotifications && (
          <div className="absolute top-24 right-8 w-96 bg-white border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[2rem] z-40 animate-fade-in overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">
                Centro de Notificaciones
              </h3>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-black border border-blue-200 uppercase tracking-tighter">
                {unreadCount} Pendientes
              </span>
            </div>
            <div className="max-h-[350px] overflow-y-auto">
              {unreadCount === 0 ? (
                <div className="p-10 text-center text-slate-400">
                  <span className="material-symbols-outlined text-4xl mb-2 opacity-20">
                    notifications_off
                  </span>
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest italic">
                    Sin avisos pendientes
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  <div className="p-4 hover:bg-slate-50 transition-colors cursor-pointer group border-l-4 border-amber-500">
                    <p className="text-xs font-black text-slate-500 uppercase flex items-center gap-1.5 mb-1 tracking-tight">
                      <span className="size-1.5 bg-amber-500 rounded-full"></span>
                      Prefectura Escolar • Hace 5 min
                    </p>
                    <p className="text-sm font-black text-slate-800 group-hover:text-blue-700 uppercase italic transition-colors">
                      Incidencia en Aula Detectada
                    </p>
                    <p className="text-xs font-bold text-slate-500 mt-1 leading-relaxed">
                      Se requiere revisión inmediata en el grupo 3º B por
                      inasistencia colectiva reportada.
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
              <button className="text-xs font-black text-blue-700 uppercase tracking-widest hover:text-blue-900 transition-colors p-1">
                Limpiar Bandeja de Entrada
              </button>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar relative">
          {/* Subtle Institutional Decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-100/50 rounded-full blur-3xl -ml-48 -mb-48 pointer-events-none"></div>

          <div className="relative z-10 max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Floating System Tools */}
      <FeedbackWidget />
      <FloatingAssistant />
      <TutorialController />
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
      className={`text-sm font-black uppercase tracking-wide ${
        active ? "opacity-100" : "opacity-75 group-hover:opacity-100"
      }`}
    >
      {label}
    </span>
    {active && (
      <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></div>
    )}
  </button>
);
