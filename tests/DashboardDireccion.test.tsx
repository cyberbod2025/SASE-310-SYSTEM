import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { AppModule, UserRole } from "../src/types";
import { DashboardDireccion } from "../src/components/dashboards/DashboardDireccion";

const mocks = vi.hoisted(() => ({
  loadDirectionPanorama: vi.fn(),
  setCurrentModule: vi.fn(),
  setIsAssistantOpen: vi.fn(),
  setIsFeedbackOpen: vi.fn(),
  openQuickRegister: vi.fn(),
  sosAlert: vi.fn(),
}));

vi.mock("../src/components/direccion/direccionPersistence", () => ({
  loadDirectionPanorama: mocks.loadDirectionPanorama,
}));

vi.mock("../src/hooks/useInstitutionalActions", () => ({
  useInstitutionalActions: () => ({
    sosAlert: mocks.sosAlert,
  }),
}));

vi.mock("../src/store", () => ({
  useApp: () => ({
    currentUserRole: UserRole.DIRECTIVO,
    currentUserProfile: { alcances: {} },
    notifications: [],
    setCurrentModule: mocks.setCurrentModule,
    setIsAssistantOpen: mocks.setIsAssistantOpen,
    setIsFeedbackOpen: mocks.setIsFeedbackOpen,
    openQuickRegister: mocks.openQuickRegister,
  }),
}));

const panorama = [
  {
    studentId: "student-1",
    enrollment: "S-001",
    studentName: "Alumna Prioritaria",
    group: "1A",
    riskScore: 82,
    semaphoreState: "INTERVENCION",
    openIncidents: 3,
    lastIncidentAt: "2026-07-17T12:00:00.000Z",
    orientationCaseId: "case-1",
    orientationState: "escalado_direccion",
    orientationPriority: "critica",
    orientationUpdatedAt: "2026-07-17T13:00:00.000Z",
    orientationFollowUps: 2,
    teacherDiagnoses: 1,
    activeOrientationPlans: 1,
    nextOrientationReview: "2026-07-17",
    openSocialWorkItems: 1,
    socialWorkUpdatedAt: "2026-07-17T14:00:00.000Z",
    pendingBapItems: 1,
    nextBapReview: "2026-07-20",
    pendingHealthFollowUps: 1,
    nextHealthReview: "2026-07-19",
    totalPendingItems: 7,
    nextActionDate: "2026-07-17",
    recentlyUpdatedAt: "2026-07-17T14:00:00.000Z",
    requiresAttention: true,
    attentionReasons: [
      "Puntaje institucional igual o mayor a 70",
      "Orientación solicitó decisión directiva",
    ],
    activeSources: [
      "Incidencias",
      "Orientación",
      "Trabajo Social",
      "UDEII",
      "Salud",
    ],
  },
  {
    studentId: "student-2",
    enrollment: "S-002",
    studentName: "Alumno Sin Pendientes",
    group: "2B",
    riskScore: 10,
    semaphoreState: "CERRADO",
    openIncidents: 0,
    lastIncidentAt: null,
    orientationCaseId: null,
    orientationState: null,
    orientationPriority: null,
    orientationUpdatedAt: null,
    orientationFollowUps: 0,
    teacherDiagnoses: 0,
    activeOrientationPlans: 0,
    nextOrientationReview: null,
    openSocialWorkItems: 0,
    socialWorkUpdatedAt: null,
    pendingBapItems: 0,
    nextBapReview: null,
    pendingHealthFollowUps: 0,
    nextHealthReview: null,
    totalPendingItems: 0,
    nextActionDate: null,
    recentlyUpdatedAt: null,
    requiresAttention: false,
    attentionReasons: [],
    activeSources: [],
  },
];

describe("Dashboard Dirección", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.loadDirectionPanorama.mockResolvedValue(panorama);
    mocks.sosAlert.mockResolvedValue({ success: true });
  });

  it("carga KPIs y fuentes desde el panorama confirmado", async () => {
    render(<DashboardDireccion />);

    expect(
      screen.getByText(/Consultando memoria institucional confirmada/i),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(mocks.loadDirectionPanorama).toHaveBeenCalledTimes(1);
      expect(
        screen.getByText(/Panorama institucional verificable/i),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText(/Alumnos visibles/i).closest("div"),
    ).toHaveTextContent("2");
    expect(
      screen.getAllByText(/^Revisión prioritaria$/i)[0].closest("div"),
    ).toHaveTextContent("1");
    expect(
      screen.getAllByText(/^Fechas vencidas$/i)[0].closest("div"),
    ).toHaveTextContent("1");
    expect(
      screen.getAllByText(/^Pendientes abiertos$/i)[0].closest("div"),
    ).toHaveTextContent("7");
    expect(screen.getByText("Alumna Prioritaria — 1A")).toBeInTheDocument();
    expect(screen.getByText(/Fuentes: Incidencias, Orientación/i))
      .toBeInTheDocument();
  });

  it("filtra fechas vencidas con la fecha persistida", async () => {
    render(<DashboardDireccion />);
    await screen.findByText("Alumna Prioritaria — 1A");

    fireEvent.click(screen.getByRole("button", { name: /^Vencidos$/i }));

    expect(screen.getByText("Alumna Prioritaria — 1A")).toBeInTheDocument();
    expect(screen.queryByText("Alumno Sin Pendientes — 2B"))
      .not.toBeInTheDocument();
  });

  it("muestra detalle agregado sin timeline ni cierres fabricados", async () => {
    render(<DashboardDireccion />);
    await screen.findByText("Alumna Prioritaria — 1A");

    fireEvent.click(screen.getAllByRole("button", { name: /Ver fuentes/i })[0]);

    expect(
      screen.getByText(/Este resumen no contiene diagnósticos BAP/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Diagnósticos docentes/i)).toBeInTheDocument();
    expect(screen.queryByText(/Timeline institucional/i))
      .not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Cerrar caso/i }))
      .not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Reabrir/i }))
      .not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^Trabajo Social$/i }));
    expect(mocks.setCurrentModule).toHaveBeenCalledWith(
      AppModule.TRABAJO_SOCIAL_TRACKER,
    );
  });

  it("genera el reporte desde el mismo corte visible", async () => {
    render(<DashboardDireccion />);
    await screen.findByText("Alumna Prioritaria — 1A");

    fireEvent.click(
      screen.getByRole("button", {
        name: /Generar reporte del corte/i,
      }),
    );

    expect(
      await screen.findAllByText(/PANORAMA INSTITUCIONAL DE DIRECCIÓN/i),
    ).toHaveLength(2);
  });

  it("falla cerrado si el RPC es rechazado", async () => {
    mocks.loadDirectionPanorama.mockRejectedValueOnce({
      code: "42501",
      message: "RLS denied",
    });

    render(<DashboardDireccion />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Panorama no disponible",
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "No se conservaron datos anteriores",
    );
    expect(screen.queryByText(/Alumnos visibles/i)).not.toBeInTheDocument();
    expect(screen.queryByText("Alumna Prioritaria — 1A"))
      .not.toBeInTheDocument();
  });
});
