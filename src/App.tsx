import React, { useState } from "react";
import { AppProvider, useApp } from "./store";
import { Toaster } from "react-hot-toast";
import { Layout } from "./components/Layout";
import { SplashScreen } from "./components/SplashScreen";
import { UserRole, AppModule } from "./types";
import { useAuth } from "./components/AuthProvider";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Login } from "./components/Login";
import { SASEIntroAnimation } from "./components/SASEIntroAnimation";
import { FirstLogonSetup } from "./components/FirstLogonSetup";
import { OfficialDocument } from "./components/OfficialDocument";
import { PrintPreviewModal } from "./components/PrintPreviewModal";
import { DashboardHoy } from "./components/DashboardHoy";
import { IASaseAgent } from "./components/IASaseAgent";

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
const DashboardMedico = React.lazy(
  () => import("./components/dashboards/DashboardMedico"),
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
const DashboardSubdireccion = React.lazy(() =>
  import("./components/dashboards/DashboardSubdireccion").then((module) => ({
    default: module.DashboardSubdireccion,
  })),
);
const DashboardUDEII = React.lazy(() =>
  import("./components/dashboards/DashboardUDEII").then((module) => ({
    default: module.DashboardUDEII,
  })),
);
const DashboardLectura = React.lazy(
  () => import("./components/dashboards/DashboardLectura"),
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

const MisGrupos = React.lazy(() =>
  import("./components/MisGrupos").then((module) => ({
    default: module.MisGrupos,
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

const DocumentRenderer = () => {
  const { activePrintJob, students } = useApp();
  if (!activePrintJob) return null;

  const student = activePrintJob.studentId
    ? students.find((s) => s.id === activePrintJob.studentId)
    : undefined;

  return (
    <OfficialDocument
      type={activePrintJob.type}
      student={student}
      data={activePrintJob.data}
    />
  );
};

const GlobalModals = () => {
  const { printModal, setPrintModal } = useApp();

  return (
    <PrintPreviewModal
      isOpen={printModal.isOpen}
      onClose={() => setPrintModal({ ...printModal, isOpen: false })}
      title={printModal.title}
      initialHtml={printModal.html}
    />
  );
};

const MainContent = () => {
  const { currentModule, currentUserRole, setCurrentModule } = useApp();

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
        if (currentModule === AppModule.MIS_GRUPOS) return <MisGrupos />;
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
          case UserRole.SUBDIRECCION:
            return <DashboardSubdireccion />;
          case UserRole.PREFECTURA:
            return <DashboardPrefectura />;
          case UserRole.ORIENTACION:
            return <DashboardOrientacion />;
          case UserRole.TRABAJO_SOCIAL:
            return <DashboardTrabajoSocial />;
          case UserRole.MEDICO_ESCOLAR:
            return <DashboardMedico />;
          case UserRole.UDEII:
            return <DashboardUDEII />;
          case UserRole.PROMOTORA_LECTURA:
            return <DashboardLectura />;
          case UserRole.DEVELOPER:
            return <DashboardDeveloper />;
          default:
            if (currentModule === (AppModule.REGISTRO_PERSONAL as any)) {
              return (
                <RegistroPersonal
                  onBack={() => setCurrentModule(AppModule.HOME)}
                />
              );
            }
            return <OrbNavigation />;
        }
      })()}
    </React.Suspense>
  );
};

// Componente para manejar la lógica de contenido con o sin Layout
const AppShell = () => {
  const { currentModule } = useApp();

  return (
    <ErrorBoundary>
      <IASaseAgent />
      {currentModule === AppModule.WELCOME ? (
        <DashboardHoy />
      ) : (
        <Layout>
          <MainContent />
        </Layout>
      )}
    </ErrorBoundary>
  );
};

const App: React.FC = () => {
  const [initialRole, setInitialRole] = useState<UserRole>(UserRole.GUEST);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [showFirstLogon, setShowFirstLogon] = useState(false);
  const [setupUser, setSetupUser] = useState<{
    fullName: string;
    email: string;
  } | null>(null);
  const { session, loading } = useAuth();

  // Handle direct links (e.g., ?registro=true)
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("registro") === "true") {
      setIsRegistering(true);
      setShowIntro(false); // Skip intro for direct registration links
    }
  }, []);

  // Handle Browser Back Button for Registration
  React.useEffect(() => {
    if (isRegistering) {
      window.history.pushState({ registering: true }, "");
      const handlePop = () => {
        setIsRegistering(false);
      };
      window.addEventListener("popstate", handlePop);
      return () => window.removeEventListener("popstate", handlePop);
    }
  }, [isRegistering]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#05070a]">
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 flex flex-col items-center justify-center">
          <div className="relative mb-8">
            {/* Minimal Spinner */}
            <div className="size-16 relative">
              <div className="absolute inset-0 rounded-full border-4 border-white/5"></div>
              <div className="absolute inset-0 rounded-full border-t-4 border-blue-500 animate-spin"></div>
            </div>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-white font-black text-xs uppercase tracking-[0.5em] animate-pulse">
              Iniciando Protocolos
            </h3>
            <p className="text-blue-500/50 text-[10px] font-bold uppercase tracking-[0.3em]">
              S.A.S.E. • CONECTAMOS CONTIGO
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (showIntro) {
    return <SASEIntroAnimation onComplete={() => setShowIntro(false)} />;
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
        onDemoEnter={() => {
          setIsDemoMode(true);
          setShowFirstLogon(true);
        }}
        onDevEnter={() => {
          setInitialRole(UserRole.DEVELOPER);
          setIsDemoMode(true);
        }}
        onRegisterClick={() => setIsRegistering(true)}
        onFirstLogon={(member) => {
          setInitialRole(member.role);
          setSetupUser({
            fullName: member.full_name,
            email: member.username + "@sase.mx",
          });
          setIsDemoMode(true);
          setShowFirstLogon(true);
        }}
      />
    );
  }

  return (
    <AppProvider initialRole={initialRole}>
      <div className="global-scan-line" />
      <GlobalModals />
      <DocumentRenderer />
      <Toaster position="top-center" reverseOrder={false} />

      {/* DEMO: Mostrar el Onboarding al logear por primera vez */}
      {showFirstLogon && (
        <FirstLogonSetup
          userFullName={setupUser?.fullName || "DOCENTE ASIGNADO"}
          userEmail={setupUser?.email || "docente@sase.mx"}
          onComplete={() => setShowFirstLogon(false)}
        />
      )}

      <AppShell />
    </AppProvider>
  );
};

export default App;
