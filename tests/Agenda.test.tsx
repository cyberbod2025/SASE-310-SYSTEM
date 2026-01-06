import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { Agenda } from "../components/Agenda";

// Mock dependencies
vi.mock("../store", () => ({
  useApp: () => ({
    currentUserRole: "DIRECTIVO",
  }),
}));

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const MOCK_DATE = new Date("2025-01-15T12:00:00Z");

describe("Agenda Unit Tests", () => {
  beforeEach(() => {
    vi.setSystemTime(MOCK_DATE);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders Agenda header and correct year", async () => {
    render(<Agenda />);
    expect(screen.getByText(/Agenda Institucional/i)).toBeInTheDocument();
    expect(screen.getByText(/2025/i)).toBeInTheDocument();
  });

  it("Opens New Event Modal", () => {
    render(<Agenda />);
    fireEvent.click(screen.getByText(/Nuevo Evento/i));
    expect(screen.getByText("Título")).toBeInTheDocument();
  });

  it("Adds a new event and views it", async () => {
    render(<Agenda />);

    // 1. Open Modal
    fireEvent.click(screen.getByText(/Nuevo Evento/i));

    // 2. Fill Form
    const titleInput = screen.getByPlaceholderText(/Ej. Junta de Consejo/i);
    fireEvent.change(titleInput, { target: { value: "MyUniqueEvent" } });

    // 3. Save
    const saveBtn = screen.getByText("Guardar Evento");
    fireEvent.click(saveBtn);

    // 4. Click on Day 15 (Today) to see events
    // Find button containing text "15"
    // Note: multiple "15" might exist? Calendar grid.
    // Usually only one "15" in current month view unless overflow?
    // Previous/Next month days are mostly empty.
    // We look for button with specific logic?
    // screen.getByText('15') matches element inside button.
    await waitFor(() => {
      // We wait for modal to close potentially
      const day15 = screen.getByText("15");
      fireEvent.click(day15);
    });

    // 5. Verify Event appears in "Selected Date" panel
    await waitFor(() => {
      expect(screen.getAllByText(/MyUniqueEvent/)[0]).toBeInTheDocument();
    });
  });
});
