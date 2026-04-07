import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { Agenda } from "../src/components/Agenda";

// Mock dependencies
vi.mock("../src/store", () => ({
  useApp: () => ({
    currentUserRole: "DIRECTIVO",
    students: [],
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
  order: vi.fn(),
  insert: vi.fn(),
  insertSelect: vi.fn(),
  single: vi.fn(),
}));

vi.mock("../src/supabase/client", () => {
  supabaseMocks.select.mockReturnValue({ order: supabaseMocks.order });
  supabaseMocks.order.mockResolvedValue({ data: [], error: null });
  supabaseMocks.single.mockResolvedValue({
    data: {
      id: "ev-1",
      titulo: "MyUniqueEvent",
      fecha: new Date().toISOString().split("T")[0],
      hora: null,
      tipo: "reunion",
      descripcion: null,
      alumnos: null,
    },
    error: null,
  });
  supabaseMocks.insertSelect.mockReturnValue({ single: supabaseMocks.single });
  supabaseMocks.insert.mockReturnValue({ select: supabaseMocks.insertSelect });
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

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("Agenda Unit Tests", () => {
  it("renders Agenda header and cycle label", async () => {
    render(<Agenda />);
    await waitFor(() => {
      expect(screen.getByText(/Agenda Escolar/i)).toBeInTheDocument();
      expect(screen.getByText(/Planificación Estratégica/i)).toBeInTheDocument();
    });
  });

  it("Opens New Event Modal", async () => {
    render(<Agenda />);
    fireEvent.click(screen.getByText(/Agendar Actividad/i));
    await waitFor(() => {
      expect(
        screen.getByText(/Nueva Actividad Institucional/i),
      ).toBeInTheDocument();
    });
  });

  it("Adds a new event and views it", async () => {
    render(<Agenda />);

    // 1. Open Modal
    fireEvent.click(screen.getByText(/Agendar Actividad/i));

    // 2. Fill Form
    const titleInput = screen.getByPlaceholderText(
      /Ej. Reunión de Consejo Técnico/i,
    );
    fireEvent.change(titleInput, { target: { value: "MyUniqueEvent" } });

    // 3. Save
    const saveBtn = screen.getAllByText("Agendar Actividad")[1];
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(supabaseMocks.insert).toHaveBeenCalled();
    });
  });
});
