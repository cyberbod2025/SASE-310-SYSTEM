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

// Lazy Load Dashboards to optimize bundle size
const DashboardDocente = React.lazy(() => import("./components/dashboards/DashboardDocente").then(module => ({ default: module.DashboardDocente })));
const DashboardPrefectura = React.lazy(() => import("./components/dashboards/DashboardPrefectura").then(module => ({ default: module.DashboardPrefectura })));
const DashboardEnfermeria = React.lazy(() => import("./components/dashboards/DashboardEnfermeria").then(module => ({ default: module.DashboardEnfermeria })));
const DashboardOrientacion = React.lazy(() => import("./components/dashboards/DashboardOrientacion").then(module => ({ default: module.DashboardOrientacion })));
const DashboardTrabajoSocial = React.lazy(() => import("./components/dashboards/DashboardTrabajoSocial").then(module => ({ default: module.DashboardTrabajoSocial })));
const DashboardSecretaria = React.lazy(() => import("./components/dashboards/DashboardSecretaria").then(module => ({ default: module.DashboardSecretaria })));
const DashboardDireccion = React.lazy(() => import("./components/dashboards/DashboardDireccion").then(module => ({ default: module.DashboardDireccion })));
// const DashboardUDEII = React.lazy(() => import("./components/dashboards/DashboardUDEII").then(module => ({ default: module.DashboardUDEII })));

// -- MAIN APP SHELL --
const MainContent = () => {
  const { currentModule, currentUserRole } = useApp();

  if (currentModule === AppModule.AGENDA) return <Agenda />;
  if (currentModule === AppModule.REPORTES) return <Reportes />;
  if (currentModule === AppModule.BITACORA) return <BitacoraAuditoria />;
  if (currentModule === AppModule.SOLICITUDES) return <PanelSolicitudes />;
  if (currentModule === AppModule.REPORTES_DOCENTES)
    return <SolicitudReportesDocentes />;

  // Loading spinner for dashboard transitions
  const Loader = () => (
    <div className="flex-1 flex items-center justify-center h-[50vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <React.Suspense fallback={<Loader />}>
      {(() => {
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
      })()}
    </React.Suspense>
  );
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
