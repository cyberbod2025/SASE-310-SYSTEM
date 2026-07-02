export const DIAGNOSTICO_PERIODOS = ["T1-2025", "T2-2026", "T3-2026"] as const;

export type DiagnosticoPeriodo = (typeof DIAGNOSTICO_PERIODOS)[number];

export function isDiagnosticoPeriodo(value: string): value is DiagnosticoPeriodo {
  return (DIAGNOSTICO_PERIODOS as readonly string[]).includes(value);
}

export function normalizeDiagnosticoPeriodo(periodo?: string | null): DiagnosticoPeriodo | undefined {
  const normalized = periodo?.trim();
  if (!normalized) return undefined;

  if (!isDiagnosticoPeriodo(normalized)) {
    throw new Error(`Periodo de diagnóstico no soportado: ${normalized}`);
  }

  return normalized;
}
