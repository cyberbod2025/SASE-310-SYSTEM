import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { AppProvider, useApp } from "../store";
import { DashboardPrefectura } from "../components/dashboards/DashboardPrefectura";
import { DashboardDireccion } from "../components/dashboards/DashboardDireccion";

// -- HOISTED MOCKS --
// Allows using variables inside vi.mock factory
const mocks = vi.hoisted(() => ({
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  eq: vi.fn(),
  from: vi.fn(),
}));

// -- MOCK MODULES --

vi.mock("../supabase/client", () => {
  // Chain configuration:
  // .from() -> returns { select, insert, update }
  // .update() -> returns { eq }
  // .eq() -> returns Promise (end of chain in store usage)

  mocks.from.mockReturnValue({
    select: mocks.select,
    insert: mocks.insert,
    update: mocks.update,
  });

  mocks.update.mockReturnValue({ eq: mocks.eq });

  return {
    supabase: {
      from: mocks.from,
    },
  };
});

vi.mock("../components/AuthProvider", () => ({
  useAuth: () => ({
    user: { id: "admin-test", email: "test@sase.com" },
    role: "DIRECTIVO",
  }),
}));

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
  },
}));

vi.mock("../components/PrintButtons", () => ({
  printContent: vi.fn(),
}));

// -- ORCHESTRATOR --
const FlowTester = () => {
  const { students } = useApp();
  return (
    <div>
      {/* Helper to confirm data load state */}
      <div data-testid="student-count">{students.length}</div>
      <div data-testid="prefectura-section">
        <DashboardPrefectura />
      </div>
      <div data-testid="direccion-section">
        <DashboardDireccion />
      </div>
    </div>
  );
};

describe("Integration: Docente -> Direccion Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // 1. SELECT returns 1 student with 0 incidents
    mocks.select.mockResolvedValue({
      data: [
        {
          id: "std-1",
          nombre_completo: "Juan Test",
          matricula: "TESTM",
          grupo: "3º B",
          incidencias: [],
          justificantes: [],
          datos_tutor: { nombre: "Tutor" },
          creado_en: new Date().toISOString(),
        },
      ],
      error: null,
    });

    // 2. INSERT returns success
    mocks.insert.mockResolvedValue({ error: null });

    // 3. UPDATE/EQ returns success
    mocks.eq.mockResolvedValue({ error: null });
  });

  it("Updates Dashboard KPIs when Incident is added", async () => {
    render(
      <AppProvider>
        <FlowTester />
      </AppProvider>
    );

    // 1. Wait for Supabase Fetch (Optimistic UI check)
    // Ensure students are loaded before interacting
    await waitFor(() => {
      expect(screen.getByTestId("student-count").textContent).toBe("1");
    });

    // 2. Check Initial KPI (0 Incidents)
    const kpiLabel = screen.getByText("Incidencias del Mes");
    const kpiContainer = kpiLabel.parentElement;
    // Text should be something like "0Total Global"
    expect(kpiContainer?.textContent).toContain("0");

    // 3. Add Incident in Prefectura
    const input = screen.getByPlaceholderText(/Ej. 2023-4492/i);
    const btn = screen.getByText("Registrar");

    fireEvent.change(input, { target: { value: "TESTM" } }); // Matches mock matricula
    fireEvent.click(btn);

    // 4. Verify Update in Direccion KPI (1 Incident)
    // Rationale: 'addIncident' -> 'setStudents' -> Context Update -> Direccion Re-render
    await waitFor(() => {
      expect(kpiContainer?.textContent).toContain("1");
    });

    // 5. Verify Database Insert was triggered
    expect(mocks.insert).toHaveBeenCalled();
  });
});
