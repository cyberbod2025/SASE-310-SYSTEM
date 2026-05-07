import React from "react";
import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SasitoAssistant } from "../src/components/ai/SasitoAssistant";

const storeMock = vi.hoisted(() => ({
  appState: {
    currentUserRole: "directivo",
    setCurrentModule: vi.fn(),
    setQuickRegisterOpen: vi.fn(),
    setIsAssistantOpen: vi.fn(),
    aiSystemState: "normal",
    students: [],
    notifications: [],
    currentUserProfile: { nombre_completo: "Hugo Profe" },
    isTourActive: false,
    setIsTourActive: vi.fn(),
    tourStep: 0,
    setTourStep: vi.fn(),
    assistantSuggestion: null as { text: string; state?: string } | null,
    setAssistantSuggestion: vi.fn(),
    onboarding: { completed: true, step: 3 },
    updateOnboarding: vi.fn(),
  },
}));

vi.mock("../src/store", () => ({
  useApp: () => storeMock.appState,
}));

vi.mock("framer-motion", async () => {
  const React = await import("react");
  const MotionDiv = React.forwardRef<HTMLDivElement, any>(({ children, ...props }, ref) => {
    const {
      animate,
      drag,
      dragConstraints,
      dragElastic,
      dragMomentum,
      exit,
      initial,
      transition,
      whileHover,
      whileTap,
      ...rest
    } = props;

    return <div ref={ref} {...rest}>{children}</div>;
  });

  return {
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: new Proxy({}, { get: () => MotionDiv }),
  };
});

vi.mock("../src/components/SaseSplineOrb", () => ({
  SaseSplineOrb: ({ state }: { state: string }) => <div data-testid="sasito-orb" data-state={state} />,
}));

vi.mock("react-hot-toast", () => ({
  default: {
    error: vi.fn(),
  },
}));

describe("SasitoAssistant", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    storeMock.appState.aiSystemState = "normal";
    storeMock.appState.notifications = [];
    storeMock.appState.isTourActive = false;
    storeMock.appState.tourStep = 0;
    storeMock.appState.assistantSuggestion = null;
    storeMock.appState.onboarding = { completed: true, step: 3 };
    storeMock.appState.setAssistantSuggestion.mockClear();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("vuelve a normal cuando expira una sugerencia de attention sin otros disparadores", async () => {
    const view = render(<SasitoAssistant />);

    await act(async () => {
      storeMock.appState.assistantSuggestion = {
        text: "Registro rápido activo",
        state: "attention",
      };
      view.rerender(<SasitoAssistant />);
    });
    expect(screen.getByTestId("sasito-orb")).toHaveAttribute("data-state", "warning");

    act(() => {
      vi.advanceTimersByTime(12000);
    });

    expect(screen.getByTestId("sasito-orb")).toHaveAttribute("data-state", "normal");
    expect(storeMock.appState.setAssistantSuggestion).toHaveBeenCalledWith(null);
  });

  it("mantiene warning si el sistema esta en warning al limpiar la sugerencia", async () => {
    storeMock.appState.aiSystemState = "warning";

    const view = render(<SasitoAssistant />);

    await act(async () => {
      storeMock.appState.assistantSuggestion = {
        text: "Registro rápido activo",
        state: "attention",
      };
      view.rerender(<SasitoAssistant />);
    });
    expect(screen.getByTestId("sasito-orb")).toHaveAttribute("data-state", "warning");

    act(() => {
      vi.advanceTimersByTime(12000);
    });

    expect(screen.getByTestId("sasito-orb")).toHaveAttribute("data-state", "warning");
  });

  it("mantiene warning si hay notificaciones sin leer al limpiar la sugerencia", async () => {
    storeMock.appState.notifications = [{ id: "n-1", read: false }];

    const view = render(<SasitoAssistant />);

    await act(async () => {
      storeMock.appState.assistantSuggestion = {
        text: "Registro rápido activo",
        state: "attention",
      };
      view.rerender(<SasitoAssistant />);
    });
    expect(screen.getByTestId("sasito-orb")).toHaveAttribute("data-state", "warning");

    act(() => {
      vi.advanceTimersByTime(12000);
    });

    expect(screen.getByTestId("sasito-orb")).toHaveAttribute("data-state", "warning");
  });
});
