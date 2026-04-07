import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppModule } from "../../types";
import type { SystemState } from "../../types/systemState";

const MODULE_KEYWORDS: Array<{ module: AppModule; keywords: string[] }> = [
  { module: AppModule.EXPEDIENTES, keywords: ["expedientes", "expediente"] },
  { module: AppModule.AGENDA, keywords: ["agenda", "citas", "calendario"] },
  { module: AppModule.REPORTES, keywords: ["reportes", "reporte", "alertas medicas"] },
  { module: AppModule.PROTOCOLOS, keywords: ["protocolos", "protocolo"] },
  { module: AppModule.INSCRIPCIONES, keywords: ["inscripciones", "admision"] },
  { module: AppModule.ARCHIVO, keywords: ["archivo"] },
  { module: AppModule.APROBACIONES_PERSONAL, keywords: ["aprobaciones", "personal"] },
  { module: AppModule.SALUD, keywords: ["salud", "medico"] },
];

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

const resolveModuleFromMessage = (message: string): AppModule | null => {
  const normalized = normalizeText(message);
  const match = MODULE_KEYWORDS.find((entry) =>
    entry.keywords.some((keyword) => normalized.includes(keyword)),
  );
  return match ? match.module : null;
};

const resolveModuleKey = (moduleKey: string | AppModule): AppModule | null => {
  if (Object.values(AppModule).includes(moduleKey as AppModule)) {
    return moduleKey as AppModule;
  }

  const normalized = normalizeText(moduleKey.toString());
  const match = MODULE_KEYWORDS.find((entry) =>
    entry.keywords.some((keyword) => keyword === normalized),
  );
  return match ? match.module : null;
};

export const useSystemStateSlice = (defaultState?: SystemState) => {
  const [aiSystemState, setAiSystemState] = useState<SystemState>(
    defaultState || "normal",
  );
  const [systemMessage, setSystemMessage] = useState<string | null>(null);
  const [highlightedModule, setHighlightedModule] = useState<AppModule | null>(
    null,
  );
  const [autoNavigate, setAutoNavigate] = useState(false);
  const [manualOverride, setManualOverride] = useState(false);
  const highlightTimeoutRef = useRef<number | undefined>(undefined);

  const clearHighlight = useCallback(() => {
    setHighlightedModule(null);
    setAutoNavigate(false);
  }, []);

  const highlightModule = useCallback(
    (moduleKey: string | AppModule, autoNavigateOnAlert = false) => {
      const resolved = resolveModuleKey(moduleKey);
      if (!resolved) return;

      setHighlightedModule(resolved);
      setAutoNavigate(autoNavigateOnAlert);

      if (highlightTimeoutRef.current) {
        window.clearTimeout(highlightTimeoutRef.current);
      }

      highlightTimeoutRef.current = window.setTimeout(() => {
        clearHighlight();
      }, 4500);
    },
    [clearHighlight],
  );

  const setSystemState = useCallback(
    (state: SystemState, message?: string) => {
      setManualOverride(true);
      setAiSystemState(state);
      if (message) {
        setSystemMessage(message);
        const inferredModule = resolveModuleFromMessage(message);
        if (inferredModule) {
          highlightModule(inferredModule, state === "alert");
        }
      }
    },
    [highlightModule],
  );

  const resetSystemState = useCallback(() => {
    setManualOverride(false);
    if (defaultState) setAiSystemState(defaultState);
  }, [defaultState]);

  useEffect(() => {
    if (!defaultState || manualOverride) return;
    setAiSystemState(defaultState);
  }, [defaultState, manualOverride]);

  const stateLabel = useMemo(() => {
    switch (aiSystemState) {
      case "warning":
        return "warning";
      case "alert":
        return "alert";
      case "thinking":
        return "thinking";
      default:
        return "normal";
    }
  }, [aiSystemState]);

  return {
    aiSystemState,
    systemMessage,
    setSystemState,
    resetSystemState,
    highlightedModule,
    highlightModule,
    autoNavigate,
    clearHighlight,
    stateLabel,
  };
};
