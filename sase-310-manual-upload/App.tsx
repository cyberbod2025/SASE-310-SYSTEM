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

  if (!currentUserRole) {
    return (
      <div className="flex h-full w-full items-center justify-center flex-col gap-4 text-center p-8">
        <span className="material-symbols-outlined text-6xl text-gray-300">
          lock
        </span>
        <h2 className="text-xl font-bold text-gray-600">Acceso Restringido</h2>
        <p className="text-gray-500 max-w-md">
          Su usuario no tiene un rol asignado o no se ha podido verificar su
          perfil. Por favor, contacte al administrador del sistema.
        </p>
      </div>
    );
  }

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
      return (
        <div className="flex h-full w-full items-center justify-center">
          <p>Rol desconocido: {currentUserRole}</p>
        </div>
      );
  }
};

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const { session, loading } = useAuth();

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

  return (
    <AppProvider>
      <Layout>
        <MainContent />
      </Layout>
    </AppProvider>
  );
};

export default App;
