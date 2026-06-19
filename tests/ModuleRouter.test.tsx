import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ModuleRouter } from "../src/components/ModuleRouter";
import { AppModule, UserRole } from "../src/types";

const mockUseApp = {
  currentModule: AppModule.HOME,
  currentUserRole: UserRole.DOCENTE as string,
  setCurrentModule: vi.fn(),
};

const mockCanAccessModule = vi.fn();

vi.mock("../src/store", () => ({
  useApp: () => mockUseApp,
}));

vi.mock("../src/hooks/usePermissions", () => ({
  usePermissions: () => ({
    canAccessModule: mockCanAccessModule,
    permissions: {},
    role: mockUseApp.currentUserRole as UserRole,
  }),
}));

vi.mock("../src/hooks/useEcosystemModules", () => ({
  useEcosystemModules: () => ({
    getModuleByAppModule: vi.fn().mockReturnValue(null),
    isKnownExternalModule: vi.fn().mockReturnValue(false),
    loading: false,
  }),
}));

vi.mock("../src/components/Unauthorized", () => ({
  Unauthorized: () => <div data-testid="unauthorized">Unauthorized Component</div>,
}));

vi.mock("../src/components/BitacoraAuditoria", () => ({
  BitacoraAuditoria: () => <div data-testid="bitacora">Bitacora Component</div>,
}));

vi.mock("../src/components/security/SecurityDashboard", () => ({
  default: () => <div data-testid="security">Security Component</div>,
}));

vi.mock("../src/components/dashboards/DashboardSalud", () => ({
  DashboardSalud: () => <div data-testid="salud">Salud Component</div>,
}));

describe("ModuleRouter RBAC Guard Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("permite el acceso a un rol autorizado y renderiza el componente correcto", async () => {
    mockUseApp.currentModule = AppModule.BITACORA;
    mockUseApp.currentUserRole = UserRole.DIRECTIVO;
    mockCanAccessModule.mockReturnValue(true);

    render(<ModuleRouter />);

    await waitFor(() => {
      expect(screen.getByTestId("bitacora")).toBeInTheDocument();
      expect(screen.queryByTestId("unauthorized")).not.toBeInTheDocument();
    });
  });

  it("bloquea el acceso a un rol no autorizado y renderiza Unauthorized", async () => {
    mockUseApp.currentModule = AppModule.BITACORA;
    mockUseApp.currentUserRole = UserRole.DOCENTE;
    mockCanAccessModule.mockReturnValue(false);

    render(<ModuleRouter />);

    await waitFor(() => {
      expect(screen.getByTestId("unauthorized")).toBeInTheDocument();
      expect(screen.queryByTestId("bitacora")).not.toBeInTheDocument();
    });
  });

  it("permite el acceso de SYSTEM_ADMIN a módulos administrativos restringidos", async () => {
    mockUseApp.currentModule = AppModule.BITACORA;
    mockUseApp.currentUserRole = UserRole.SYSTEM_ADMIN;
    mockCanAccessModule.mockReturnValue(true);

    render(<ModuleRouter />);

    await waitFor(() => {
      expect(screen.getByTestId("bitacora")).toBeInTheDocument();
      expect(screen.queryByTestId("unauthorized")).not.toBeInTheDocument();
    });
  });

  it("restringe estrictamente al rol ALUMNO y no renderiza el componente ni el guard central", async () => {
    mockUseApp.currentModule = AppModule.BITACORA;
    mockUseApp.currentUserRole = UserRole.ALUMNO;
    mockCanAccessModule.mockReturnValue(false); // No importa si el guard diría false

    render(<ModuleRouter />);

    await waitFor(() => {
      // Debe mostrar el error de modulo Feria no encontrado en lugar de Unauthorized o Bitacora
      expect(screen.getByText(/Error: Módulo de Feria no encontrado/i)).toBeInTheDocument();
      expect(screen.queryByTestId("unauthorized")).not.toBeInTheDocument();
      expect(screen.queryByTestId("bitacora")).not.toBeInTheDocument();
    });
  });

  it("bloquea el acceso a modulo SALUD para roles no autorizados", async () => {
    mockUseApp.currentModule = AppModule.SALUD;
    mockUseApp.currentUserRole = UserRole.DOCENTE;
    mockCanAccessModule.mockReturnValue(false);

    render(<ModuleRouter />);

    await waitFor(() => {
      expect(screen.getByTestId("unauthorized")).toBeInTheDocument();
      expect(screen.queryByTestId("salud")).not.toBeInTheDocument();
    });
  });

  it("permite el acceso a modulo SALUD para MEDICO_ESCOLAR", async () => {
    mockUseApp.currentModule = AppModule.SALUD;
    mockUseApp.currentUserRole = UserRole.MEDICO_ESCOLAR;
    mockCanAccessModule.mockReturnValue(true);

    render(<ModuleRouter />);

    await waitFor(() => {
      expect(screen.getByTestId("salud")).toBeInTheDocument();
      expect(screen.queryByTestId("unauthorized")).not.toBeInTheDocument();
    });
  });
});
