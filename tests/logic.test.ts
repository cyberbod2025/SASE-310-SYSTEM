/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect } from "vitest";
import { CaseState } from "../src/types";
import { getStatusColors, getStatusIcon } from "../src/utils/statusUtils";

describe("Status Utils Visual Hardening Tests", () => {
  it("returns correct color tokens for all risk states", () => {
    expect(getStatusColors(CaseState.CERRADO)).toContain("bg-emerald-500");
    expect(getStatusColors(CaseState.OBSERVADO)).toContain("bg-blue-500");
    expect(getStatusColors(CaseState.EN_ANALISIS)).toContain("bg-amber-500");
    expect(getStatusColors(CaseState.PATRON_DETECTADO)).toContain("bg-rose-500");
    expect(getStatusColors(CaseState.INTERVENCION)).toContain("bg-purple-600");
    expect(getStatusColors(CaseState.SEGUIMIENTO)).toContain("bg-indigo-500");
  });

  it("returns correct Material Icons for risk identification", () => {
    expect(getStatusIcon(CaseState.CERRADO)).toBe("check_circle");
    expect(getStatusIcon(CaseState.OBSERVADO)).toBe("visibility");
    expect(getStatusIcon(CaseState.EN_ANALISIS)).toBe("analytics");
    expect(getStatusIcon(CaseState.PATRON_DETECTADO)).toBe("warning");
    expect(getStatusIcon(CaseState.INTERVENCION)).toBe("priority_high");
    expect(getStatusIcon(CaseState.SEGUIMIENTO)).toBe("sync");
  });

  it("applies glassmorphism glow only to INTERVENCION state", () => {
    const interventionStyles = getStatusColors(CaseState.INTERVENCION);
    expect(interventionStyles).toContain("shadow-[0_0_15px_rgba(147,51,234,0.5)]");
    
    // Low risk states should not have the glow shadow
    expect(getStatusColors(CaseState.CERRADO)).not.toContain("shadow");
    expect(getStatusColors(CaseState.OBSERVADO)).not.toContain("shadow");
  });

  it("handles unknown states gracefully", () => {
    // @ts-ignore - Testing runtime resilience
    expect(getStatusColors("UNKNOWN")).toBe("bg-slate-400 text-white");
    // @ts-ignore
    expect(getStatusIcon("UNKNOWN")).toBe("help_outline");
  });
});
