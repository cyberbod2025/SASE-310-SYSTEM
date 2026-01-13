import React, { useState } from "react";
import { AppProvider, useApp } from "./store";
import { Toaster } from "react-hot-toast";
import { Layout } from "./components/Layout";
import { SplashScreen } from "./components/SplashScreen";
import { UserRole, AppModule } from "./types";
import { useAuth } from "./components/AuthProvider";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Login } from "./components/Login";
import { IntroPlayer } from "./components/IntroPlayer";
// Dashboards (Lazy Loaded)
const DashboardDocente = React.lazy(() =>
  import("./components/dashboards/DashboardDocente").then((module) => ({
    default: module.DashboardDocente,
  }))
);
const DashboardPrefectura = React.lazy(() =>
  import("./components/dashboards/DashboardPrefectura").then((module) => ({
    default: module.DashboardPrefectura,
  }))
);
const DashboardEnfermeria = React.lazy(() =>
  import("./components/dashboards/DashboardEnfermeria").then((module) => ({
    default: module.DashboardEnfermeria,
  }))
);
const DashboardOrientacion = React.lazy(() =>
  import("./components/dashboards/DashboardOrientacion").then((module) => ({
    default: module.DashboardOrientacion,
  }))
);
const DashboardTrabajoSocial = React.lazy(() =>
  import("./components/dashboards/DashboardTrabajoSocial").then((module) => ({
    default: module.DashboardTrabajoSocial,
  }))
);
const DashboardSecretaria = React.lazy(() =>
  import("./components/dashboards/DashboardSecretaria").then((module) => ({
    default: module.DashboardSecretaria,
  }))
);
const DashboardDireccion = React.lazy(() =>
  import("./components/dashboards/DashboardDireccion").then((module) => ({
    default: module.DashboardDireccion,
  }))
);
const DashboardUDEII = React.lazy(() =>
  import("./components/dashboards/DashboardUDEII").then((module) => ({
    default: module.DashboardUDEII,
  }))
);
const DashboardDeveloper = React.lazy(() =>
  import("./components/dashboards/DashboardDeveloper").then((module) => ({
    default: module.DashboardDeveloper,
  }))
);

// Modules (Lazy Loaded)
const Agenda = React.lazy(() =>
  import("./components/Agenda").then((module) => ({ default: module.Agenda }))
);
const Reportes = React.lazy(() =>
  import("./components/Reportes").then((module) => ({
    default: module.Reportes,
  }))
);
const BitacoraAuditoria = React.lazy(() =>
  import("./components/BitacoraAuditoria").then((module) => ({
    default: module.BitacoraAuditoria,
  }))
);
const PanelSolicitudes = React.lazy(() =>
  import("./components/PanelSolicitudes").then((module) => ({
    default: module.PanelSolicitudes,
  }))
);
const SolicitudReportesDocentes = React.lazy(() =>
  import("./components/SolicitudReportesDocentes").then((module) => ({
    default: module.SolicitudReportesDocentes,
  }))
);
const Inscripciones = React.lazy(() =>
  import("./components/Inscripciones").then((module) => ({
    default: module.Inscripciones,
  }))
);
const Archivo = React.lazy(() =>
  import("./components/Archivo").then((module) => ({ default: module.Archivo }))
);
const ProtocolsView = React.lazy(() =>
  import("./components/Protocols/ProtocolsView").then((module) => ({
    default: module.ProtocolsView,
  }))
);
const PlaneacionNEM = React.lazy(() =>
  import("./components/PlaneacionNEM").then((module) => ({
    default: module.PlaneacionNEM,
  }))
);
const NotFound = React.lazy(() =>
  import("./components/NotFound").then((module) => ({
    default: module.NotFound,
  }))
);
const OrbNavigation = React.lazy(() =>
  import("./components/OrbNavigation").then((module) => ({
    default: module.OrbNavigation,
  }))
);

const RegistroPersonal = React.lazy(() =>
  import("./components/RegistroPersonal").then((module) => ({
    default: module.RegistroPersonal,
  }))
);

const AprobacionesPersonal = React.lazy(() =>
  import("./components/AprobacionesPersonal").then((module) => ({
    default: module.AprobacionesPersonal,
  }))
);

// Loading Component
const LoadingSpinner = () => (
  <div className="h-full w-full flex items-center justify-center p-10">
    <div className="flex flex-col items-center gap-3">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      <p className="text-gray-500 font-medium text-sm">Cargando módulo...</p>
    </div>
  </div>
);

// -- MAIN APP SHELL --
const MainContent = () => {
  const { currentModule, currentUserRole } = useApp();

  return (
    <React.Suspense fallback={<LoadingSpinner />}>
      {(() => {
        if (currentModule === AppModule.AGENDA) return <Agenda />;
        if (currentModule === AppModule.REPORTES) return <Reportes />;
        if (currentModule === AppModule.BITACORA) return <BitacoraAuditoria />;
        if (currentModule === AppModule.SOLICITUDES)
          return <PanelSolicitudes />;
        if (currentModule === AppModule.REPORTES_DOCENTES)
          return <SolicitudReportesDocentes />;
        if (currentModule === AppModule.INSCRIPCIONES) return <Inscripciones />;
        if (currentModule === AppModule.ARCHIVO) return <Archivo />;
        if (currentModule === AppModule.PROTOCOLOS) return <ProtocolsView />;
        if (currentModule === AppModule.APROBACIONES_PERSONAL)
          return <AprobacionesPersonal />;
        if (currentModule === AppModule.NOT_FOUND) return <NotFound />;

        // If user is on DASHBOARD module, show the Orb Menu instead of the classic grid
        // EXCEPT for developers who might want the raw dashboard
        if (currentModule === AppModule.HOME) {
          return <OrbNavigation />;
        }

        switch (currentUserRole) {
          case UserRole.DOCENTE:
            return <DashboardDocente />;
          // ... fallback for safety
          default:
            return <OrbNavigation />;
        }
      })()}
    </React.Suspense>
  );
};

const App: React.FC = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [initialRole, setInitialRole] = useState<UserRole>(UserRole.GUEST);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const { session, loading } = useAuth();

  if (showIntro) {
    return <IntroPlayer onComplete={() => setShowIntro(false)} />;
  }

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#020510] text-blue-400 font-bold font-mono tracking-widest uppercase">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          <span>Iniciando SASE-310...</span>
        </div>
      </div>
    );
  }

  if (!session && !isDemoMode) {
    if (isRegistering) {
      return (
        <React.Suspense fallback={<LoadingSpinner />}>
          <RegistroPersonal onBack={() => setIsRegistering(false)} />
        </React.Suspense>
      );
    }
    return (
      <Login
        onDemoEnter={() => setIsDemoMode(true)}
        onDevEnter={() => {
          setInitialRole(UserRole.DEVELOPER);
          setIsDemoMode(true);
        }}
        onRegisterClick={() => setIsRegistering(true)}
      />
    );
  }

  return (
    <AppProvider initialRole={initialRole}>
      <Toaster position="top-center" reverseOrder={false} />
      <ErrorBoundary>
        <Layout>
          <MainContent />
        </Layout>
      </ErrorBoundary>
    </AppProvider>
  );
};

export default App;
