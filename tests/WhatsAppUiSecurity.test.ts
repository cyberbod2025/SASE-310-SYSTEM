import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const panelSource = readFileSync(
  resolve(process.cwd(), "src/components/StudentAdvancedPanel.tsx"),
  "utf8",
).toLowerCase();
const sliceSource = readFileSync(
  resolve(process.cwd(), "src/store/slices/useStudentsSlice.ts"),
  "utf8",
).toLowerCase();

describe("Interfaz honesta de notificaciones a tutores", () => {
  it("solicita la notificación explícita con el identificador mínimo", () => {
    expect(panelSource).toContain(
      "sendwhatsappnotification({\n        incidentid: incident.id,",
    );
    expect(panelSource).toContain("if (res.delivered)");
    expect(panelSource).toContain('res.status === "simulated"');
    expect(panelSource).not.toContain(
      "to: student.guardianinfo.phoneprimary",
    );
    expect(panelSource).not.toContain("message: `sase alerta");
  });

  it("no envía automáticamente ni actualiza la entrega directamente desde React", () => {
    expect(sliceSource).not.toContain("sendwhatsappnotification");
    expect(sliceSource).not.toContain(
      '.update({ notificado_whatsapp: true })',
    );
    expect(sliceSource).toContain(
      "inc.id === incidentid ? { ...inc, notificado_whatsapp: true }",
    );
  });
});
