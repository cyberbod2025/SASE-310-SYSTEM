/// <reference types="@testing-library/jest-dom" />
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
      {
        id: "2",
        name: "Intervention Student",
        group: "3º B",
        caseState: CaseState.INTERVENCION,
        incidents: [{}, {}, {}, {}, {}],
        matricula: "MAT-002",
      }
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

describe("Dashboard Orientacion Hardening Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Header correctly with institutional branding", () => {
    render(<DashboardOrientacion />);
    expect(screen.getByText(/Orientacion Educativa/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Acompañamiento socioemocional/i),
    ).toBeInTheDocument();
  });

  it("Displays Pattern Alert for PATRON_DETECTADO state", () => {
    render(<DashboardOrientacion />);
    expect(screen.getByText("Pattern Student")).toBeInTheDocument();
  });

  it("Identifies Intervention Priority for INTERVENCION state", () => {
    render(<DashboardOrientacion />);
    expect(screen.getByText("Intervention Student")).toBeInTheDocument();
    // Verification of institutional label (CaseLabels mapping)
    expect(screen.getAllByText(/Acompañamiento Intensivo/i)[0]).toBeInTheDocument();
  });

  it("Print Report opens institutional BIP document", async () => {
    render(<DashboardOrientacion />);

    const printBtn = screen.getByText(/Generar bitácora institucional/i);
    fireEvent.click(printBtn);

    expect(
      await screen.findByText(/BITÁCORA DE INTERVENCIÓN PSICOPEDAGÓGICA/i),
    ).toBeInTheDocument();
  });
});
