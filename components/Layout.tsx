import React, { useState } from "react";
import { useApp } from "../store";
import { UserRole, AppModule } from "../types";
import { QuickRegisterModal } from "./QuickRegisterModal";
import { AssistantBanner } from "./AssistantBanner";
import { supabase } from "../supabase/client";
import { FloatingAssistant } from "./FloatingAssistant";
import { startProductTour } from "./TourGuide";

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
    <div className="flex h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900 via-slate-900 to-black text-slate-100 overflow-hidden selection:bg-blue-500/30">
      <QuickRegisterModal />
      <FloatingAssistant />

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Role Based Content */}
      <aside
        className={`fixed md:relative inset-y-0 left-0 z-50 w-64 bg-black/80 md:bg-black/20 backdrop-blur-xl border-r border-white/10 flex flex-col shrink-0 transition-transform duration-300 shadow-[5px_0_30px_0_rgba(0,0,0,0.3)] ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div
          className="p-6 border-b border-white/10 flex justify-between items-start"
          id="sidebar-logo"
        >
          <div className="flex flex-col items-center gap-3 w-full">
            <div className="size-32 flex items-center justify-center">
              <img
                src={
                  roleImages[currentUserRole] ||
                  "/assets/branding/logo_sase_official.png"
                }
                alt="Logo Rol"
                className="w-full h-full object-contain drop-shadow-2xl animate-float"
                style={{
                  clipPath: "circle(48%)", // Recorta el fondo cuadrado
                  filter:
                    "brightness(1.1) contrast(1.2) drop-shadow(0 0 10px rgba(251, 191, 36, 0.3))",
                }}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextElementSibling?.classList.remove(
                    "hidden"
                  );
                }}
              />
              <div className="size-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary hidden">
                <span className="material-symbols-outlined">school</span>
              </div>
            </div>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-gray-400 hover:text-white"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto" id="sidebar-nav">
          <NavItem
            icon="dashboard"
            label="Tablero"
            active={currentModule === AppModule.DASHBOARD}
            id="nav-dashboard"
            onClick={() => {
              setCurrentModule(AppModule.DASHBOARD);
              setIsSidebarOpen(false);
            }}
          />

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
              icon="fact_check"
              label="Asistencias"
              active={false}
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
          {(currentUserRole === UserRole.ENFERMERIA ||
            currentUserRole === UserRole.DEVELOPER) && (
            <NavItem
              icon="medical_services"
              label="Inventario"
              active={false}
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
          {(currentUserRole === UserRole.ORIENTACION ||
            currentUserRole === UserRole.DEVELOPER) && (
            <NavItem
              icon="folder_shared"
              label="Expedientes"
              active={false}
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {(currentUserRole === UserRole.TRABAJO_SOCIAL ||
            currentUserRole === UserRole.DEVELOPER) && (
            <>
              <NavItem
                icon="history_edu"
                label="Justificantes"
                active={false}
                onClick={() => setIsSidebarOpen(false)}
              />
              <NavItem
                icon="family_restroom"
                label="Estudios Socio."
                active={false}
                onClick={() => setIsSidebarOpen(false)}
              />
            </>
          )}

          {(currentUserRole === UserRole.SECRETARIA ||
            currentUserRole === UserRole.DEVELOPER) && (
            <>
              <NavItem
                icon="badge"
                label="Inscripciones"
                id="nav-inscripciones"
                active={currentModule === AppModule.INSCRIPCIONES}
                onClick={() => {
                  setCurrentModule(AppModule.INSCRIPCIONES);
                  setIsSidebarOpen(false);
                }}
              />
              <NavItem
                icon="folder_special"
                label="Archivo"
                active={currentModule === AppModule.ARCHIVO}
                onClick={() => {
                  setCurrentModule(AppModule.ARCHIVO);
                  setIsSidebarOpen(false);
                }}
              />
            </>
          )}

          {currentUserRole === UserRole.ORIENTACION && (
            <>
              <NavItem
                icon="psychology"
                label="Reportes Docentes"
                active={currentModule === AppModule.REPORTES_DOCENTES}
                onClick={() => {
                  setCurrentModule(AppModule.REPORTES_DOCENTES);
                  setIsSidebarOpen(false);
                }}
              />
            </>
          )}

          {(currentUserRole === UserRole.DIRECTIVO ||
            currentUserRole === UserRole.DEVELOPER) && (
            <>
              <NavItem
                icon="assignment"
                label="Solicitudes"
                id="nav-solicitudes"
                active={currentModule === AppModule.SOLICITUDES}
                onClick={() => {
                  setCurrentModule(AppModule.SOLICITUDES);
                  setIsSidebarOpen(false);
                }}
              />
              <NavItem
                icon="analytics"
                label="Indicadores"
                active={false}
                onClick={() => setIsSidebarOpen(false)}
              />
              <NavItem
                icon="policy"
                label="Bitácora"
                active={currentModule === AppModule.BITACORA}
                onClick={() => {
                  setCurrentModule(AppModule.BITACORA);
                  setIsSidebarOpen(false);
                }}
              />
            </>
          )}

          <div className="pt-4 mt-4 border-t border-gray-100">
            <NavItem
              icon="local_library"
              label="Protocolos"
              active={currentModule === AppModule.PROTOCOLOS}
              id="nav-protocolos"
              onClick={() => {
                setCurrentModule(AppModule.PROTOCOLOS);
                setIsSidebarOpen(false);
              }}
            />

            <NavItem
              icon="description"
              label="Reportes"
              id="nav-reportes"
              active={currentModule === AppModule.REPORTES}
              onClick={() => {
                setCurrentModule(AppModule.REPORTES);
                setIsSidebarOpen(false);
              }}
            />
            <NavItem
              icon="calendar_month"
              label="Agenda"
              active={currentModule === AppModule.AGENDA}
              onClick={() => {
                setCurrentModule(AppModule.AGENDA);
                setIsSidebarOpen(false);
              }}
            />
          </div>
        </nav>

        {/* Role Switcher for Demo */}
        <div
          className="p-4 border-t border-border-color bg-gray-50"
          id="role-switcher"
        >
          <p className="text-xs font-bold text-text-secondary uppercase mb-2">
            Simular Rol (Demo)
          </p>
          <select
            className="w-full text-sm border-gray-300 rounded-md p-2 text-gray-900"
            value={currentUserRole}
            onChange={(e) => {
              switchRole(e.target.value as UserRole);
              setIsSidebarOpen(false);
            }}
          >
            {Object.values(UserRole).map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              const name = "Evaluador";
              startProductTour(name, currentUserRole);
              setIsSidebarOpen(false);
            }}
            className="w-full mt-3 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-lg text-xs font-bold shadow-md hover:shadow-lg transition-all animate-pulse-slow"
          >
            <span className="material-symbols-outlined text-[16px]">
              play_circle
            </span>
            Ver Demo Interactiva
          </button>
        </div>

        <div className="p-4 border-t border-border-color space-y-3">
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.reload();
            }}
            className="w-full flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 py-2 rounded-lg text-sm font-bold transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">
              logout
            </span>
            Cerrar Sesión
          </button>

          <div className="flex items-center gap-3">
            <div className="size-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">
              {currentUserRole.substring(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">
                Usuario Activo
              </p>
              <p className="text-[10px] text-gray-400 truncate uppercase tracking-wider">
                CCT 09DES4310M | Vespertino
              </p>
              <p className="text-xs text-blue-400 truncate uppercase tracking-wider">
                {currentUserRole}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white/5 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6 shrink-0 z-20 relative shadow-md">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden text-text-secondary p-2 hover:bg-white/10 rounded-lg transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h2 className="font-bold text-lg text-text-main hidden sm:block">
              {currentUserRole === UserRole.DOCENTE && "Panel Docente"}
              {currentUserRole === UserRole.PREFECTURA &&
                "Control de Prefectura"}
              {currentUserRole === UserRole.ENFERMERIA && "Enfermería Escolar"}
              {currentUserRole === UserRole.ORIENTACION &&
                "Orientación Educativa"}
              {currentUserRole === UserRole.TRABAJO_SOCIAL && "Trabajo Social"}
              {currentUserRole === UserRole.SECRETARIA &&
                "Secretaría Académica"}
              {/* {currentUserRole === UserRole.UDEII && 'Unidad de Inclusión (UDEII)'} */}
              {currentUserRole === UserRole.DIRECTIVO && "Dirección Escolar"}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Universal Quick Register Trigger - Hidden for Secretaria (No incidents) */}
            {currentUserRole !== UserRole.SECRETARIA && (
              <button
                id="quick-register-btn"
                onClick={() => setQuickRegisterOpen(true)}
                className="hidden sm:flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-bold shadow-sm transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-xl">bolt</span>
                Registro Rápido
              </button>
            )}

            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="size-10 flex items-center justify-center rounded-lg hover:bg-background-light text-text-secondary relative"
              >
                <span
                  className="material-symbols-outlined"
                  id="notification-bell"
                >
                  notifications
                </span>
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 size-2.5 bg-alert-red rounded-full border-2 border-white"></span>
                )}
              </button>

              {showNotifications && (
                <div
                  onMouseLeave={() => setShowNotifications(false)}
                  className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-lg border border-border-color overflow-hidden z-50"
                >
                  <div className="p-3 border-b border-gray-100 font-bold text-sm bg-gray-50 flex justify-between">
                    <span>Notificaciones</span>
                    <span className="text-xs text-text-secondary">
                      {unreadCount} nuevas
                    </span>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-gray-500">
                        Sin notificaciones
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markNotificationRead(n.id);
                            if (n.actionModule) {
                              setCurrentModule(n.actionModule);
                              setShowNotifications(false);
                            }
                          }}
                          className={`p-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 flex gap-3 ${
                            !n.read ? "bg-blue-50/50" : ""
                          }`}
                        >
                          <div
                            className={`size-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              n.type === "error"
                                ? "bg-red-100 text-red-600"
                                : n.type === "warning"
                                ? "bg-yellow-100 text-yellow-600"
                                : n.type === "success"
                                ? "bg-green-100 text-green-600"
                                : "bg-blue-100 text-blue-600"
                            }`}
                          >
                            <span className="material-symbols-outlined text-lg">
                              {n.type === "error"
                                ? "error"
                                : n.type === "warning"
                                ? "warning"
                                : n.type === "success"
                                ? "check_circle"
                                : "info"}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-800 truncate">
                              {n.title}
                            </p>
                            <p className="text-xs text-gray-600 line-clamp-2">
                              {n.message}
                            </p>
                            <div className="flex justify-between items-center mt-1">
                              <p className="text-[10px] text-gray-400">
                                {n.time}
                              </p>
                              {n.actionModule && (
                                <span className="text-[10px] text-primary font-bold uppercase">
                                  Ver detalle →
                                </span>
                              )}
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

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-transparent relative custom-scrollbar">
          <AssistantBanner
            onOpenNotifications={() => setShowNotifications(true)}
          />
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
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 active:scale-95 ${
      active
        ? "bg-primary/20 text-primary font-bold shadow-[0_0_15px_rgba(59,130,246,0.2)] border border-primary/20"
        : "text-gray-400 hover:bg-white/10 hover:text-white hover:pl-4"
    }`}
  >
    <span
      className={`material-symbols-outlined transition-colors ${
        active ? "fill" : ""
      }`}
    >
      {icon}
    </span>
    <span className="text-sm">{label}</span>
  </button>
);
