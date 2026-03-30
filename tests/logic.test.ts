import { describe, it, expect } from "vitest";
import { calculateState, CaseState, Incident, IncidentType } from "../src/types";

describe("Business Logic Tests", () => {
  const mockIncident: Incident = {
    id: "1",
    studentId: "1",
    type: IncidentType.CONDUCTA,
    description: "Test",
    date: new Date().toISOString(),
    reportedBy: "Test",
  };

  it("calculates CERRADO state for 0 incidents", () => {
    expect(calculateState([])).toBe(CaseState.CERRADO);
  });

  it("calculates OBSERVADO state for 1 incident", () => {
    expect(calculateState([mockIncident])).toBe(CaseState.OBSERVADO);
  });

  it("calculates OBSERVADO state for 2 incidents", () => {
    expect(calculateState([mockIncident, { ...mockIncident, id: "2" }])).toBe(
      CaseState.OBSERVADO
    );
  });

  it("calculates PATRON_DETECTADO state for 3 incidents", () => {
    const incidents = [
      mockIncident,
      { ...mockIncident, id: "2" },
      { ...mockIncident, id: "3" },
    ];
    expect(calculateState(incidents)).toBe(CaseState.PATRON_DETECTADO);
  });
});
