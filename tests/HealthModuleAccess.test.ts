import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { AppModule, UserRole } from "../src/types";
import { canAccessSensitiveModule } from "../src/utils/sensitiveModuleAccess";

describe("Health module access", () => {
  it("allows only the clinical and accountable leadership roles", () => {
    expect(canAccessSensitiveModule(
      AppModule.SALUD,
      UserRole.MEDICO_ESCOLAR,
    )).toBe(true);
    expect(canAccessSensitiveModule(
      AppModule.SALUD,
      UserRole.DIRECTIVO,
    )).toBe(true);
    expect(canAccessSensitiveModule(
      AppModule.SALUD,
      UserRole.SUBDIRECCION,
    )).toBe(true);
    expect(canAccessSensitiveModule(
      AppModule.SALUD,
      UserRole.SYSTEM_ADMIN,
    )).toBe(true);
    expect(canAccessSensitiveModule(
      AppModule.SALUD,
      UserRole.DOCENTE,
    )).toBe(false);
    expect(canAccessSensitiveModule(
      AppModule.SALUD,
      UserRole.DEVELOPER,
    )).toBe(false);
  });

  it("enforces the shared access decision in the active module router", () => {
    const router = readFileSync(
      resolve(process.cwd(), "src/components/ModuleRouter.tsx"),
      "utf8",
    );

    expect(router).toContain(
      "if (currentModule === AppModule.SALUD)",
    );
    expect(router).toContain(
      "canAccessSensitiveModule(\n                currentModule,",
    );
    expect(router).toContain("return <Unauthorized />");
  });
});
