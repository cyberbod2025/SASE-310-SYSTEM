import React, { useState } from "react";
import { AppProvider, useApp } from "./store";
import { Layout } from "./components/Layout";
import { SplashScreen } from "./components/SplashScreen";
import { UserRole, AppModule } from "./types";
import { useAuth } from "./components/AuthProvider";
import { Login } from "./components/Login";
import { Agenda } from "./components/Agenda";
import { Reportes } from "./components/Reportes";
import { BitacoraAuditoria } from "./components/BitacoraAuditoria";
import { PanelSolicitudes } from "./components/PanelSolicitudes";
import { SolicitudReportesDocentes } from "./components/SolicitudReportesDocentes";

// Dashboards
import { DashboardDocente } from "./components/dashboards/DashboardDocente";
import { DashboardPrefectura } from "./components/dashboards/DashboardPrefectura";
import { DashboardEnfermeria } from "./components/dashboards/DashboardEnfermeria";
import { DashboardOrientacion } from "./components/dashboards/DashboardOrientacion";
import { DashboardTrabajoSocial } from "./components/dashboards/DashboardTrabajoSocial";
import { DashboardSecretaria } from "./components/dashboards/DashboardSecretaria";
import { DashboardDireccion } from "./components/dashboards/DashboardDireccion";
import { DashboardUDEII } from "./components/dashboards/DashboardUDEII";

// -- MAIN APP SHELL --
const MainContent = () => {
  const { currentModule, currentUserRole } = useApp();

  if (currentModule === AppModule.AGENDA) return <Agenda />;
  if (currentModule === AppModule.REPORTES) return <Reportes />;
  if (currentModule === AppModule.BITACORA) return <BitacoraAuditoria />;
  if (currentModule === AppModule.SOLICITUDES) return <PanelSolicitudes />;
  if (currentModule === AppModule.REPORTES_DOCENTES)
    return <SolicitudReportesDocentes />;

  switch (currentUserRole) {
    case UserRole.DOCENTE:
      return <DashboardDocente />;
    case UserRole.PREFECTURA:
      return <DashboardPrefectura />;
    case UserRole.ENFERMERIA:
      return <DashboardEnfermeria />;
    case UserRole.ORIENTACION:
      return <DashboardOrientacion />;
    case UserRole.TRABAJO_SOCIAL:
      return <DashboardTrabajoSocial />;
    case UserRole.SECRETARIA:
      return <DashboardSecretaria />;
    // case UserRole.UDEII: return <DashboardUDEII />;
    case UserRole.DIRECTIVO:
      return <DashboardDireccion />;
    default:
      return <DashboardDocente />;
  }
};

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const { session, loading, role } = useAuth();

  // Show splash screen primarily
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50 text-text-secondary font-bold">
        Cargando SASE-310...
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  // Security Check: If logged in but no role assigned (or invalid), deny access.
  // This prevents AppProvider from initializing with default privileges.
  if (!role) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-900 text-white p-8 text-center">
        <span className="material-symbols-outlined text-6xl text-red-500 mb-4">
          lock_person
        </span>
        <h1 className="text-2xl font-bold mb-2">Acceso Denegado</h1>
        <p className="text-gray-400 max-w-md">
          Su cuenta no tiene un rol asignado en el sistema. Por favor contacte al
          administrador para verificar su perfil.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-8 px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <AppProvider>
      <Layout>
        <MainContent />
      </Layout>
    </AppProvider>
  );
};

export default App;
