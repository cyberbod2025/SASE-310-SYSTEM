import React, { useState } from "react";
import { AppProvider, useApp } from "./store";
import { Toaster } from "react-hot-toast";
import { Layout } from "./components/Layout";
import { SplashScreen } from "./components/SplashScreen";
import { UserRole, AppModule } from "./types";
import { useAuth } from "./components/AuthProvider";
import { ErrorBoundary } from "./components/ErrorBoundary";
const Login = React.lazy(() => import("./components/Login").then(m => ({ default: m.Login })));
import { ModuleRouter, LoadingSpinner } from "./components/ModuleRouter";
import { GlobalModals } from "./components/GlobalModals";
import { DocumentRenderer } from "./components/DocumentRenderer";

const RadarEscolar = React.lazy(() => import("./components/RadarEscolar").then(m => ({ default: m.RadarEscolar })));
const DashboardHoy = React.lazy(() => import("./components/DashboardHoy").then(m => ({ default: m.DashboardHoy })));
const SASEIntroAnimation = React.lazy(() => import("./components/SASEIntroAnimation").then(m => ({ default: m.SASEIntroAnimation })));
const FirstLogonSetup = React.lazy(() => import("./components/FirstLogonSetup").then(m => ({ default: m.FirstLogonSetup })));
const RegistroPersonal = React.lazy(() => import("./components/RegistroPersonal").then(m => ({ default: m.RegistroPersonal })));

// ... (existing code below)

const MainContent = () => {
  return <ModuleRouter />;
};

// Componente para manejar la lógica de contenido con o sin Layout
const AppShell = () => {
  const { currentModule } = useApp();
  const [showRadar, setShowRadar] = React.useState(true);

  // El Radar solo se muestra en el módulo de bienvenida (post-login inmediato)
  const isWelcome = currentModule === AppModule.WELCOME;

  return (
    <ErrorBoundary>
      <React.Suspense fallback={<LoadingSpinner />}>
        {isWelcome && showRadar ? (
          <RadarEscolar onComplete={() => setShowRadar(false)} />
        ) : isWelcome ? (
          <DashboardHoy />
        ) : (
          <Layout>
            <MainContent />
          </Layout>
        )}
      </React.Suspense>
    </ErrorBoundary>
  );
};

const App: React.FC = () => {
  const [initialRole, setInitialRole] = useState<UserRole>(UserRole.GUEST);
  const [isRegistering, setIsRegistering] = useState(false);
  // Skipear el intro si ya se vio una vez (persistente)
  const [showIntro, setShowIntro] = useState(() => {
    return localStorage.getItem("sase_intro_played") !== "true";
  });
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
    return (
      <SASEIntroAnimation
        onComplete={() => {
          localStorage.setItem("sase_intro_played", "true");
          setShowIntro(false);
        }}
      />
    );
  }

    if (!session) {
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
        <React.Suspense fallback={<LoadingSpinner />}>
          <Login
            onRegisterClick={() => setIsRegistering(true)}
          />
        </React.Suspense>
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
