import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { AppProvider, useApp } from "../src/store";
import { DashboardPrefectura } from "../src/components/dashboards/DashboardPrefectura";
import { DashboardDireccion } from "../src/components/dashboards/DashboardDireccion";

// -- HOISTED MOCKS --
// Allows using variables inside vi.mock factory
const mocks = vi.hoisted(() => ({
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  eq: vi.fn(),
  from: vi.fn(),
  gte: vi.fn(),
  order: vi.fn(),
  limit: vi.fn(),
  ilike: vi.fn(),
  single: vi.fn(),
  selectData: [] as any[],
}));

// -- MOCK MODULES --

vi.mock("../src/supabase/client", () => {
  // Chain configuration:
  // .from() -> returns { select, insert, update }
  // .update() -> returns { eq }
  // .eq() -> returns Promise (end of chain in store usage)

  const queryChain = {
    gte: mocks.gte,
    order: mocks.order,
    limit: mocks.limit,
    ilike: mocks.ilike,
    single: mocks.single,
    eq: mocks.eq,
  };

  mocks.gte.mockReturnValue(queryChain);
  mocks.ilike.mockReturnValue(queryChain);
  mocks.order.mockReturnValue({ limit: mocks.limit });
  mocks.limit.mockResolvedValue({ data: [], error: null });
  mocks.single.mockResolvedValue({ data: null, error: null });
  mocks.eq.mockResolvedValue({ data: [], error: null });

  mocks.select.mockImplementation(() => ({
    ...queryChain,
    data: mocks.selectData,
    error: null,
  }));

  mocks.from.mockReturnValue({
    select: mocks.select,
    insert: mocks.insert,
    update: mocks.update,
  });

  mocks.update.mockReturnValue({ eq: mocks.eq });

  return {
    supabase: {
      from: mocks.from,
      channel: vi.fn(() => ({
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnValue({}),
      })),
      removeChannel: vi.fn(),
    },
  };
});

vi.mock("../src/components/AuthProvider", () => ({
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

vi.mock("../src/components/PrintButtons", () => ({
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
    mocks.selectData = [
      {
        id: "std-1",
        nombre_completo: "Juan Test",
        matricula: "TESTM",
        grupo: "3º B",
        incidencias: [
          { id: "inc-1", fecha: new Date().toISOString() },
          { id: "inc-2", fecha: new Date().toISOString() },
        ],
        justificantes: [],
        datos_tutor: { nombre: "Tutor" },
        creado_en: new Date().toISOString(),
      },
    ];

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

    // 2. Check Initial KPI (0 Protocolos Activos)
    const kpiLabel = screen.getByText("PROTOCOLOS ACTIVOS");
    const kpiContainer = kpiLabel.parentElement;
    expect(kpiContainer?.textContent).toContain("0");

    // 3. Add Incident in Prefectura
    const input = screen.getByPlaceholderText(/MATRÍCULA/i);
    const btn = screen.getByText("Retardo");

    fireEvent.change(input, { target: { value: "TESTM" } }); // Matches mock matricula
    fireEvent.click(btn);

    // 4. Verify Update in Direccion KPI (1 Protocol Activo)
    await waitFor(() => {
      expect(kpiContainer?.textContent).toContain("1");
    });

    // 5. Verify Database Insert was triggered
    expect(mocks.insert).toHaveBeenCalled();
  });
});
