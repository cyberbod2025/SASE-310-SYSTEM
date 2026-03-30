import React from "react";
import { useApp } from "../store";
import { AppModule } from "../types";
import { Layout } from "./Layout";
import { ErrorBoundary } from "./ErrorBoundary";
import { ModuleRouter, LoadingSpinner } from "./ModuleRouter";

const RadarEscolar = React.lazy(() => import("./RadarEscolar").then(m => ({ default: m.RadarEscolar })));
const DashboardHoy = React.lazy(() => import("./DashboardHoy").then(m => ({ default: m.DashboardHoy })));

const MainContent = () => {
  return <ModuleRouter />;
};

export const AppShell = () => {
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
