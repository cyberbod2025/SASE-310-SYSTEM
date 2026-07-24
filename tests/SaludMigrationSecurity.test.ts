import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migrationPath = resolve(
  process.cwd(),
  "supabase/migrations/20260718173633_salud_memoria_clinica.sql",
);
const migration = readFileSync(migrationPath, "utf8").toLowerCase();

describe("Salud migration security invariants", () => {
  it("protects both clinical tables with RLS and explicit grants", () => {
    expect(migration).toContain(
      "alter table public.atenciones_medicas enable row level security",
    );
    expect(migration).toContain(
      "alter table public.salud enable row level security",
    );
    expect(migration).toContain(
      "revoke all on table public.atenciones_medicas",
    );
    expect(migration).toContain("revoke all on table public.salud");
    expect(migration).toContain(
      "grant select on table public.atenciones_medicas",
    );
    expect(migration).toContain(
      "grant insert (\n  alumno_id,\n  nombre_alumno,",
    );
    expect(migration).toContain(
      ") on table public.atenciones_medicas",
    );
    expect(migration).toContain(
      "grant select on table public.salud",
    );
    expect(migration).toContain(
      "grant insert (\n  alumno_id,\n  tipo_alerta,",
    );
    expect(migration).toContain(") on table public.salud");
    expect(migration).not.toMatch(
      /grant\s+delete[^;]*public\.(atenciones_medicas|salud)/,
    );
  });

  it("requires authenticated authorship and a clinical writer role", () => {
    expect(migration).toContain(
      "generado_por = (select auth.uid())",
    );
    expect(migration).toContain(
      "atendido_por = (select auth.uid())",
    );
    expect(migration).toContain(
      "actualizado_por = (select auth.uid())",
    );
    expect(migration).toContain("'medico_escolar'");
    expect(migration).toContain("'system_admin'");
    expect(migration).not.toContain("service_role");
    expect(migration).not.toContain("public.is_staff()");
  });

  it("keeps clinical reads away from teachers and developer mode", () => {
    const clinicalSelectPolicies = migration.match(
      /create policy "(?:atenciones_medicas|salud)_select_clinico"[\s\S]*?\);/g,
    ) ?? [];

    expect(clinicalSelectPolicies).toHaveLength(2);
    for (const policy of clinicalSelectPolicies) {
      expect(policy).toContain("'medico_escolar'");
      expect(policy).toContain("'directivo'");
      expect(policy).toContain("'subdireccion'");
      expect(policy).toContain("'system_admin'");
      expect(policy).not.toContain("'docente'");
      expect(policy).not.toContain("'developer'");
    }
  });

  it("audits alert changes and limits client updates to follow-up fields", () => {
    expect(migration).toContain("create trigger tr_audit_salud_alerta");
    expect(migration).toContain(
      "execute function public.fn_automatic_audit_trigger()",
    );
    expect(migration).toContain(
      "grant update (\n  estado_atencion,\n  fecha_seguimiento,",
    );
    expect(migration).toContain("grant update (\n  activa\n)");
    expect(migration).toContain(
      "new.actualizado_por := (select auth.uid())",
    );
    expect(migration).not.toMatch(
      /grant update \([^)]*(?:alumno_id|generado_por|atendido_por)[^)]*\)\s+on table public\.atenciones_medicas/,
    );
  });
});
