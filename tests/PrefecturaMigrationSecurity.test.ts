import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migrationPath = resolve(
  process.cwd(),
  "supabase/migrations/20260718175848_prefectura_canalizacion_orientacion.sql",
);
const migration = readFileSync(migrationPath, "utf8").toLowerCase();

describe("Prefectura migration security invariants", () => {
  it("expone solamente un RPC autenticado y fail-closed", () => {
    expect(migration).toContain(
      "create or replace function public.referir_caso_orientacion",
    );
    expect(migration).toContain("security definer");
    expect(migration).toContain("set search_path = ''");
    expect(migration).toContain(
      "private.is_institutional_actor(array[",
    );
    expect(migration).toContain("'prefectura'");
    expect(migration).toContain("'system_admin'");
    expect(migration).toContain(
      "revoke all on function public.referir_caso_orientacion",
    );
    expect(migration).toContain(
      "grant execute on function public.referir_caso_orientacion",
    );
    expect(migration).not.toContain("service_role");
  });

  it("asigna una cuenta activa de Orientación con menor carga", () => {
    expect(migration).toContain(
      "lower(btrim(p.rol)) = 'orientacion'",
    );
    expect(migration).toContain("p.estado_cuenta = 'activo'");
    expect(migration).toContain("p.seguridad_status = 'active'");
    expect(migration).toContain("select count(*)");
    expect(migration).toContain("active_case.estado <> 'cerrado'");
  });

  it("serializa por alumno y reutiliza el caso abierto", () => {
    expect(migration).toContain("for update");
    expect(migration).toContain("c.estado <> 'cerrado'");
    expect(migration).toContain("if v_caso_existente then");
    expect(migration).toContain(
      "insert into public.seguimiento_orientacion",
    );
    expect(migration).toContain("'derivacion'");
  });

  it("audita en la transacción sin fabricar una incidencia", () => {
    expect(migration).toContain("insert into public.auditoria");
    expect(migration).toContain(
      "'prefectura_canaliza_orientacion'",
    );
    expect(migration).toContain("'orientacion_casos'");
    expect(migration).not.toContain(
      "insert into public.incidencias",
    );
  });
});
