import React, { useMemo, useState } from "react";
import { AppProvider } from "./store";
import { Toaster } from "react-hot-toast";
import { UserRole } from "./types";
import { useAuth } from "./components/AuthProvider";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { LoadingSpinner } from "./components/ModuleRouter";
import { GlobalModals } from "./components/GlobalModals";
import { DocumentRenderer } from "./components/DocumentRenderer";
import { AppShell } from "./components/AppShell";
import { useSasitoPilotProbe } from "./hooks/useSasitoPilotProbe";
import LaboratorioUI from "./pages/LaboratorioUI";

const Login = React.lazy(() => import("./components/Login").then(m => ({ default: m.Login })));
const IntroPlayer = React.lazy(() => import("./components/IntroPlayer").then(m => ({ default: m.IntroPlayer })));
const FirstLogonSetup = React.lazy(() => import("./components/FirstLogonSetup").then(m => ({ default: m.FirstLogonSetup })));
const RegistroPersonal = React.lazy(() => import("./components/RegistroPersonal").then(m => ({ default: m.RegistroPersonal })));

const App: React.FC = () => {
  const [initialRole, setInitialRole] = useState<UserRole>(UserRole.GUEST);
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Estado para controlar la animación de introducción
  const [showIntro, setShowIntro] = useState(() => {
    return sessionStorage.getItem("sase_intro_v4_shown") !== "true";
  });

  const handleIntroComplete = () => {
    sessionStorage.setItem("sase_intro_v4_shown", "true");
    setShowIntro(false);
  };

  const [showFirstLogon, setShowFirstLogon] = useState(false);
  const [setupUser, setSetupUser] = useState<{
    fullName: string;
    email: string;
  } | null>(null);

  const { session, loading } = useAuth();
  useSasitoPilotProbe();

  const labParam = useMemo(() => {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    return params.get("lab");
  }, []);

  // Handle direct links (e.g., ?registro=true)
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("registro") === "true") {
      setIsRegistering(true);
      setShowIntro(false); 
    }
  }, []);

  // Handle Browser Back Button for Registration
  React.useEffect(() => {
    if (isRegistering) {
      window.history.pushState({ registering: true }, "");
      const handlePop = () => setIsRegistering(false);
      window.addEventListener("popstate", handlePop);
      return () => window.removeEventListener("popstate", handlePop);
    }
  }, [isRegistering]);

  if (labParam === "ui") {
    return <LaboratorioUI />;
  }

  if (showIntro) {
    return (
      <IntroPlayer
        onComplete={() => {
          setShowIntro(false);
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#05070a]">
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 flex flex-col items-center justify-center">
          <div className="relative mb-8">
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
              SISTEMA SASE-310
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (!session) {
    if (isRegistering) {
      return (
        <ErrorBoundary>
          <Toaster position="top-center" reverseOrder={false} />
          <React.Suspense fallback={<LoadingSpinner />}>
            <RegistroPersonal onBack={() => setIsRegistering(false)} />
          </React.Suspense>
        </ErrorBoundary>
      );
    }
    return (
      <ErrorBoundary>
        <AppProvider initialRole={UserRole.GUEST}>
          <React.Suspense fallback={<LoadingSpinner />}>
            <Login onRegisterClick={() => setIsRegistering(true)} />
          </React.Suspense>
        </AppProvider>
      </ErrorBoundary>
    );
  }

  return (
    <AppProvider initialRole={initialRole}>
      <div className="global-scan-line" />
      <GlobalModals />
      <DocumentRenderer />
      <Toaster position="top-center" reverseOrder={false} />

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
