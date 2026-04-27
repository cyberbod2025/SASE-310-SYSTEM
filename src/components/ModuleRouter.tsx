import React from "react";
import { useApp } from "../store";
import { AppModule, UserRole } from "../types";
import { motion, AnimatePresence } from "framer-motion";
import { useEcosystemModules } from "../hooks/useEcosystemModules";
import { ExternalModuleLauncher } from "./ExternalModuleLauncher";
const Unauthorized = React.lazy(() => import("./Unauthorized").then(m => ({ default: m.Unauthorized })));

// Loading Component
export const LoadingSpinner = () => (
  <div className="h-full w-full flex items-center justify-center p-10">
    <div className="flex flex-col items-center gap-3">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      <p className="text-gray-500 font-medium text-sm">Cargando módulo...</p>
    </div>
  </div>
);

// Dashboards (Lazy Loaded)
const DashboardHoy = React.lazy(() => import("./DashboardHoy").then(m => ({ default: m.DashboardHoy })));
const DashboardDocente = React.lazy(() => import("./dashboards/DashboardDocente").then(m => ({ default: m.DashboardDocente })));
const DashboardPrefectura = React.lazy(() => import("./dashboards/DashboardPrefectura").then((m) => ({ default: m.DashboardPrefectura })));
const DashboardSalud = React.lazy(() => import("./dashboards/DashboardSalud").then((m) => ({ default: m.DashboardSalud })));
const DashboardUDEII = React.lazy(() => import("./dashboards/DashboardUDEII").then((m) => ({ default: m.DashboardUDEII })));
const DashboardOrientacion = React.lazy(() => import("./dashboards/DashboardOrientacion").then((m) => ({ default: m.DashboardOrientacion })));
const DashboardTrabajoSocial = React.lazy(() => import("./dashboards/DashboardTrabajoSocial").then((m) => ({ default: m.DashboardTrabajoSocial })));
const DashboardSecretaria = React.lazy(() => import("./dashboards/DashboardSecretaria").then((m) => ({ default: m.DashboardSecretaria })));
const DashboardDireccion = React.lazy(() => import("./dashboards/DashboardDireccion").then((m) => ({ default: m.DashboardDireccion })));
const DashboardSubdireccion = React.lazy(() => import("./dashboards/DashboardSubdireccion").then((m) => ({ default: m.DashboardSubdireccion })));
const DashboardLectura = React.lazy(() => import("./dashboards/DashboardLectura"));
const DashboardDeveloper = React.lazy(() => import("./dashboards/DashboardDeveloper").then((m) => ({ default: m.DashboardDeveloper })));

// Modules (Lazy Loaded)
const Agenda = React.lazy(() => import("./Agenda").then((m) => ({ default: m.Agenda })));
const Reportes = React.lazy(() => import("./Reportes").then((m) => ({ default: m.Reportes })));
const Expedientes = React.lazy(() => import("./Expedientes").then((m) => ({ default: m.Expedientes })));
const BitacoraAuditoria = React.lazy(() => import("./BitacoraAuditoria").then((m) => ({ default: m.BitacoraAuditoria })));
const PanelSolicitudes = React.lazy(() => import("./PanelSolicitudes").then((m) => ({ default: m.PanelSolicitudes })));
const SolicitudReportesDocentes = React.lazy(() => import("./SolicitudReportesDocentes").then((m) => ({ default: m.SolicitudReportesDocentes })));
const Inscripciones = React.lazy(() => import("./Inscripciones").then((m) => ({ default: m.Inscripciones })));
const Archivo = React.lazy(() => import("./Archivo").then((m) => ({ default: m.Archivo })));
const ProtocolsView = React.lazy(() => import("./Protocols/ProtocolsView").then((m) => ({ default: m.ProtocolsView })));
const PlaneacionNEM = React.lazy(() => import("./PlaneacionNEM").then((m) => ({ default: m.PlaneacionNEM })));
const NotFound = React.lazy(() => import("./NotFound").then((m) => ({ default: m.NotFound })));
const OrbNavigation = React.lazy(() => import("./OrbNavigation").then((m) => ({ default: m.OrbNavigation })));
const RegistroPersonal = React.lazy(() => import("./RegistroPersonal").then((m) => ({ default: m.RegistroPersonal })));
const AprobacionesPersonal = React.lazy(() => import("./AprobacionesPersonal").then((m) => ({ default: m.AprobacionesPersonal })));
const MisGrupos = React.lazy(() => import("./MisGrupos").then((m) => ({ default: m.MisGrupos })));
const ManualUsuario = React.lazy(() => import("./ManualUsuario").then((m) => ({ default: m.ManualUsuario })));
const PerfilUsuario = React.lazy(() => import("./PerfilUsuario").then((m) => ({ default: m.PerfilUsuario })));
const Notificaciones = React.lazy(() => import("./Notificaciones").then((m) => ({ default: m.Notificaciones })));
const DocumentacionInstitucional = React.lazy(() => import("./DocumentacionInstitucional").then((m) => ({ default: m.DocumentacionInstitucional })));
const MatriculaInteligente = React.lazy(() => import("./MatriculaInteligente").then((m) => ({ default: m.MatriculaInteligente })));
const CierreCiclo = React.lazy(() => import("./CierreCiclo").then((m) => ({ default: m.CierreCiclo })));

const Asistencia = React.lazy(() => import("./Asistencia").then((m) => ({ default: m.Asistencia })));
const ObjetosRetenidos = React.lazy(() => import("./ObjetosRetenidos").then((m) => ({ default: m.ObjetosRetenidos })));

export const ModuleRouter: React.FC = () => {
  const { currentModule, currentUserRole, setCurrentModule } = useApp();
  const {
    getModuleByAppModule,
    isKnownExternalModule,
    loading: ecosystemModulesLoading,
  } = useEcosystemModules();

  return (
    <React.Suspense fallback={<LoadingSpinner />}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentModule}
          initial={{ opacity: 0, scale: 0.99, filter: "blur(4px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 1.01, filter: "blur(4px)" }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="h-full w-full"
        >
          {(() => {
            const externalModule = getModuleByAppModule(currentModule);

            // Restricción estricta para Alumnos: Solo Feria
            if (currentUserRole === UserRole.ALUMNO) {
              const feriaModule = getModuleByAppModule(AppModule.FERIA);
              if (!feriaModule) {
                return (
                  <div className="p-8 text-center">
                    <p className="text-rose-400 font-medium">Error: Módulo de Feria no encontrado para tu perfil.</p>
                  </div>
                );
              }
              return <ExternalModuleLauncher module={feriaModule} />;
            }

            if (externalModule) {
              return <ExternalModuleLauncher module={externalModule} />;
            }


            if (isKnownExternalModule(currentModule)) {
              return ecosystemModulesLoading ? <LoadingSpinner /> : <NotFound />;
            }

            if (currentModule === AppModule.AGENDA) return <Agenda />;
            if (currentModule === AppModule.REPORTES) return <Reportes />;
            if (currentModule === AppModule.EXPEDIENTES) return <Expedientes />;
            if (currentModule === AppModule.BITACORA) {
              const allowedRoles = [UserRole.DIRECTIVO, UserRole.SYSTEM_ADMIN, UserRole.DEVELOPER];
              if (!allowedRoles.includes(currentUserRole as UserRole)) {
                return <Unauthorized />;
              }
              return <BitacoraAuditoria />;
            }
            if (currentModule === AppModule.SOLICITUDES) return <PanelSolicitudes />;
            if (currentModule === AppModule.REPORTES_DOCENTES) return <SolicitudReportesDocentes />;
            if (currentModule === AppModule.INSCRIPCIONES) return <Inscripciones />;
            if (currentModule === AppModule.ARCHIVO) return <Archivo />;
            if (currentModule === AppModule.PROTOCOLOS) return <ProtocolsView />;
            if (currentModule === AppModule.APROBACIONES_PERSONAL) {
              const allowedRoles = [UserRole.DIRECTIVO, UserRole.SYSTEM_ADMIN, UserRole.DEVELOPER];
              if (!allowedRoles.includes(currentUserRole as UserRole)) {
                return <Unauthorized />;
              }
              return <AprobacionesPersonal />;
            }

            if (currentModule === AppModule.MIS_GRUPOS) return <MisGrupos />;
            if (currentModule === AppModule.PLANEACION_NEM) return <PlaneacionNEM />;
            if (currentModule === AppModule.ASISTENCIA) return <Asistencia />;
            if (currentModule === AppModule.NOTIFICATIONS) return <Notificaciones />;
            if (currentModule === AppModule.OBJETOS_RETENIDOS) return <ObjetosRetenidos />;
            if (currentModule === AppModule.DOCUMENTACION) return <DocumentacionInstitucional />;
            if (currentModule === AppModule.MATRICULA_INTELIGENTE) return <MatriculaInteligente />;
            if (currentModule === AppModule.CIERRE_CICLO) return <CierreCiclo />;
            if (currentModule === AppModule.MANUAL_USUARIO) return <ManualUsuario />;
            if (currentModule === AppModule.PERFIL) return <PerfilUsuario />;
            if (currentModule === AppModule.SALUD) return <DashboardSalud />;
            if (currentModule === AppModule.CALIFICACIONES) return <DashboardDocente />;
            if (currentModule === AppModule.SUBDIRECCION) return <DashboardSubdireccion />;
            if (currentModule === AppModule.IA_SASE) return <ManualUsuario />;
            if (currentModule === AppModule.TRABAJO_SOCIAL_TRACKER) return <DashboardTrabajoSocial />;
            if (currentModule === AppModule.UDEII_TRACKER) return <DashboardUDEII />;
            if (currentModule === AppModule.LECTURA_TRACKER) return <DashboardLectura />;
            if (currentModule === AppModule.NOT_FOUND) return <NotFound />;

            if (currentModule === AppModule.HOME) {
              return <OrbNavigation />;
            }

            if (currentModule === AppModule.WELCOME) {
                return <DashboardHoy />;
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
                return <DashboardSalud />;
              case UserRole.UDEII:
                return <DashboardUDEII />;
              case UserRole.PROMOTORA_LECTURA:
                return <DashboardLectura />;
              case UserRole.SECRETARIA:
                return <DashboardSecretaria />;
              case UserRole.DEVELOPER:
              case UserRole.SYSTEM_ADMIN:
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
        </motion.div>
      </AnimatePresence>
    </React.Suspense>
  );
};
