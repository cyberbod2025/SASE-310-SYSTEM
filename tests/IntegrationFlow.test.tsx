import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { AppProvider, useApp } from "../src/store";
import { DashboardPrefectura } from "../src/components/dashboards/DashboardPrefectura";
import { DashboardDireccion } from "../src/components/dashboards/DashboardDireccion";

// -- HOISTED MOCKS --
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
  const queryChain: any = {
    gte: mocks.gte,
    order: mocks.order,
    limit: mocks.limit,
    ilike: mocks.ilike,
    single: mocks.single,
    eq: mocks.eq,
  };

  // Promise-like behavior for all chain methods
  const createThenable = (data: any = []) => ({
    ...queryChain,
    then: (resolve: any) => resolve({ data, error: null }),
    catch: (reject: any) => reject(null),
  });

  const defaultResponse = createThenable([]);

  mocks.gte.mockReturnValue(defaultResponse);
  mocks.ilike.mockReturnValue(defaultResponse);
  mocks.order.mockReturnValue(defaultResponse);
  mocks.limit.mockReturnValue(defaultResponse);
  mocks.single.mockReturnValue(createThenable(null));
  
  mocks.eq.mockImplementation(() => createThenable([]));

  mocks.select.mockImplementation(() => {
    // If it's a select without further chaining that expects data immediately
    const res = createThenable(mocks.selectData);
    return res;
  });

  mocks.from.mockReturnValue({
    select: mocks.select,
    insert: mocks.insert,
    update: mocks.update,
  });

  mocks.update.mockReturnValue({ eq: mocks.eq });
  mocks.insert.mockReturnValue({ select: mocks.select });

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

    // No usar mockResolvedValue en eq, ya que rompe la cadena (order, limit, etc)
    // mocks.eq ya tiene una implementación por defecto que devuelve un thenable con queryChain
  });

  it("Updates Dashboard KPIs when Incident is added", async () => {
    render(
      <AppProvider>
        <FlowTester />
      </AppProvider>
    );

    await waitFor(() => {
      const count = screen.getByTestId("student-count").textContent;
      expect(count).toBe("1");
    }, { timeout: 4000 });

    const input = screen.getByPlaceholderText(/MATRÍCULA/i);
    const btn = screen.getByText("Retardo");

    fireEvent.change(input, { target: { value: "TESTM" } });
    fireEvent.click(btn);

    await waitFor(() => {
      expect(mocks.insert).toHaveBeenCalled();
    });

    await waitFor(() => {
      const kpiElement = screen.getByText(/Poblacion total atendida/i).closest("div");
      expect(kpiElement).toHaveTextContent("1");
    });
  }, 15000);
});
