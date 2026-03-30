import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { DashboardOrientacion } from "../src/components/dashboards/DashboardOrientacion";
import { CaseState } from "../src/types";

const mocks = vi.hoisted(() => ({
  setCurrentModule: vi.fn(),
  addIncident: vi.fn(),
}));

vi.mock("../src/store", () => ({
  useApp: () => ({
    students: [
      {
        id: "1",
        name: "Pattern Student",
        group: "2º A",
        caseState: CaseState.PATRON_DETECTADO,
        incidents: [{}, {}, {}],
        matricula: "MAT-001",
      },
    ],
    setCurrentModule: mocks.setCurrentModule,
    setQuickRegisterOpen: vi.fn(),
    addIncident: mocks.addIncident,
  }),
}));

vi.mock("../src/components/AuthProvider", () => ({
  useAuth: () => ({
    user: { id: "user-1", email: "test@sase.com" },
  }),
}));

const supabaseMocks = vi.hoisted(() => ({
  from: vi.fn(),
  select: vi.fn(),
  ilike: vi.fn(),
  single: vi.fn(),
  insert: vi.fn(),
}));

vi.mock("../src/supabase/client", () => {
  supabaseMocks.ilike.mockReturnValue({ single: supabaseMocks.single });
  supabaseMocks.single.mockResolvedValue({ data: null, error: null });
  supabaseMocks.select.mockReturnValue({ ilike: supabaseMocks.ilike });
  supabaseMocks.insert.mockResolvedValue({ error: null });
  supabaseMocks.from.mockReturnValue({
    select: supabaseMocks.select,
    insert: supabaseMocks.insert,
  });

  return {
    supabase: {
      from: supabaseMocks.from,
    },
  };
});

// Robust Toast Mock
vi.mock("react-hot-toast", () => {
  const toast: any = vi.fn();
  toast.success = vi.fn();
  toast.error = vi.fn();
  toast.loading = vi.fn();
  return { default: toast };
});

describe("Dashboard Orientacion Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Header correctly", () => {
    render(<DashboardOrientacion />);
    expect(screen.getByText(/NÚCLEO DE/i)).toBeInTheDocument();
    expect(screen.getByText(/ORIENTACIÓN/i)).toBeInTheDocument();
    expect(
      screen.getByText(/CENTRO DE APOYO PSICOEDUCATIVO/i),
    ).toBeInTheDocument();
  });

  it("Displays Pattern Alert for Risk Student", () => {
    render(<DashboardOrientacion />);
    expect(screen.getByText("Pattern Student")).toBeInTheDocument();
    expect(
      screen.getByText(/ESTADO_ALERTA: PATRÓN DETECTADO/i),
    ).toBeInTheDocument();
  });

  it("Print Report opens preview", async () => {
    render(<DashboardOrientacion />);

    const printBtn = screen.getByText(/BITÁCORA_PDF/i);
    fireEvent.click(printBtn);

    expect(
      await screen.findByText(/BITÁCORA DE INTERVENCIÓN PSICOPEDAGÓGICA/i),
    ).toBeInTheDocument();
  });
});
