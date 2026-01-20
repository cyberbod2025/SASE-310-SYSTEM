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
  })),
);
const DashboardPrefectura = React.lazy(() =>
  import("./components/dashboards/DashboardPrefectura").then((module) => ({
    default: module.DashboardPrefectura,
  })),
);
const DashboardEnfermeria = React.lazy(() =>
  import("./components/dashboards/DashboardEnfermeria").then((module) => ({
    default: module.DashboardEnfermeria,
  })),
);
const DashboardOrientacion = React.lazy(() =>
  import("./components/dashboards/DashboardOrientacion").then((module) => ({
    default: module.DashboardOrientacion,
  })),
);
const DashboardTrabajoSocial = React.lazy(() =>
  import("./components/dashboards/DashboardTrabajoSocial").then((module) => ({
    default: module.DashboardTrabajoSocial,
  })),
);
const DashboardSecretaria = React.lazy(() =>
  import("./components/dashboards/DashboardSecretaria").then((module) => ({
    default: module.DashboardSecretaria,
  })),
);
const DashboardDireccion = React.lazy(() =>
  import("./components/dashboards/DashboardDireccion").then((module) => ({
    default: module.DashboardDireccion,
  })),
);
const DashboardUDEII = React.lazy(() =>
  import("./components/dashboards/DashboardUDEII").then((module) => ({
    default: module.DashboardUDEII,
  })),
);
const DashboardPromotora = React.lazy(() =>
  import("./components/dashboards/DashboardPromotora").then((module) => ({
    default: module.DashboardPromotora,
  })),
);
const DashboardDeveloper = React.lazy(() =>
  import("./components/dashboards/DashboardDeveloper").then((module) => ({
    default: module.DashboardDeveloper,
  })),
);

// Modules (Lazy Loaded)
const Agenda = React.lazy(() =>
  import("./components/Agenda").then((module) => ({ default: module.Agenda })),
);
const Reportes = React.lazy(() =>
  import("./components/Reportes").then((module) => ({
    default: module.Reportes,
  })),
);
const BitacoraAuditoria = React.lazy(() =>
  import("./components/BitacoraAuditoria").then((module) => ({
    default: module.BitacoraAuditoria,
  })),
);
const PanelSolicitudes = React.lazy(() =>
  import("./components/PanelSolicitudes").then((module) => ({
    default: module.PanelSolicitudes,
  })),
);
const SolicitudReportesDocentes = React.lazy(() =>
  import("./components/SolicitudReportesDocentes").then((module) => ({
    default: module.SolicitudReportesDocentes,
  })),
);
const Inscripciones = React.lazy(() =>
  import("./components/Inscripciones").then((module) => ({
    default: module.Inscripciones,
  })),
);
const Archivo = React.lazy(() =>
  import("./components/Archivo").then((module) => ({
    default: module.Archivo,
  })),
);
const ProtocolsView = React.lazy(() =>
  import("./components/Protocols/ProtocolsView").then((module) => ({
    default: module.ProtocolsView,
  })),
);
const PlaneacionNEM = React.lazy(() =>
  import("./components/PlaneacionNEM").then((module) => ({
    default: module.PlaneacionNEM,
  })),
);
const NotFound = React.lazy(() =>
  import("./components/NotFound").then((module) => ({
    default: module.NotFound,
  })),
);
const OrbNavigation = React.lazy(() =>
  import("./components/OrbNavigation").then((module) => ({
    default: module.OrbNavigation,
  })),
);

const RegistroPersonal = React.lazy(() =>
  import("./components/RegistroPersonal").then((module) => ({
    default: module.RegistroPersonal,
  })),
);

const AprobacionesPersonal = React.lazy(() =>
  import("./components/AprobacionesPersonal").then((module) => ({
    default: module.AprobacionesPersonal,
  })),
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
          case UserRole.DOCENTE_TUTOR:
            return <DashboardDocente />;
          case UserRole.DIRECTIVO:
            return <DashboardDireccion />;
          case UserRole.PREFECTURA:
            return <DashboardPrefectura />;
          case UserRole.ORIENTACION:
            return <DashboardOrientacion />;
          case UserRole.TRABAJO_SOCIAL:
            return <DashboardTrabajoSocial />;
          case UserRole.ENFERMERIA:
            return <DashboardEnfermeria />;
          case UserRole.SECRETARIA:
            return <DashboardSecretaria />;
          case UserRole.UDEII:
            return <DashboardUDEII />;
          case UserRole.PROMOTORA:
            return <DashboardPromotora />;
          case UserRole.DEVELOPER:
            return <DashboardDeveloper />;
          default:
            return <OrbNavigation />;
        }
      })()}
    </React.Suspense>
  );
};

const App: React.FC = () => {
  const [showIntro, setShowIntro] = useState(false); // Moved into Login for seamless match
  const [initialRole, setInitialRole] = useState<UserRole>(UserRole.GUEST);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const { session, loading } = useAuth();

  // Handle direct links (e.g., ?registro=true)
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("registro") === "true") {
      setIsRegistering(true);
    }
  }, []);

  if (showIntro) {
    return <IntroPlayer onComplete={() => setShowIntro(false)} />;
  }

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#020510] text-blue-400 font-bold font-mono tracking-widest uppercase">
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 animate-fade-in">
          <React.Suspense
            fallback={
              <div className="flex flex-col items-center justify-center min-h-[400px] w-full gap-4">
                <div className="size-16 relative">
                  <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-t-blue-700 animate-spin"></div>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">
                  Validando Identidad Institucional...
                </p>
              </div>
            }
          >
            {/* The original content of the loading state was a spinner and text.
              The instruction implies wrapping the MainContent, but the provided
              code snippet is for the loading state.
              Assuming the intent is to replace the existing loading spinner
              with the new one, and since MainContent is not rendered during
              the initial loading state, this Suspense wrapper is for the
              content that would eventually load after authentication.
              However, the original App component's loading state does not
              render MainContent. It renders a simple spinner.
              The instruction "Envuelve el contenido de MainContent en <React.Suspense> con un fallback de carga"
              is already handled within MainContent itself.
              The provided code snippet seems to be for the *initial* loading state of the App,
              replacing the existing spinner. The `renderModule()` call is not defined.
              Given the instruction, and the provided code, I will interpret this as
              replacing the *initial* loading spinner with the new Suspense fallback,
              and removing the `renderModule()` call as it's not present in the original.
              This interpretation aligns with the placement of the snippet within the `if (loading)` block.
              The `MainContent` component already has its own `React.Suspense` wrapper.
          */}
            {/* Original content of the loading state: */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
              <span>Iniciando SASE-310...</span>
            </div>
          </React.Suspense>
        </main>
      </div>
    );
  }

  if (!session && !isDemoMode) {
    if (isRegistering) {
      return (
        <>
          <Toaster position="top-center" reverseOrder={false} />
          <React.Suspense fallback={<LoadingSpinner />}>
            <RegistroPersonal onBack={() => setIsRegistering(false)} />
          </React.Suspense>
        </>
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
