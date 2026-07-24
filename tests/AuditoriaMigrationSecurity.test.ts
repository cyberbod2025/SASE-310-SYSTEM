import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migrationPath = resolve(
  process.cwd(),
  "supabase/migrations/20260724065938_auditoria_caja_negra.sql",
);
const migration = readFileSync(migrationPath, "utf8").toLowerCase();
const readContract =
  migration.match(
    /create or replace function public\.consultar_caja_negra[\s\S]*?returns table \(([\s\S]*?)\)\nlanguage plpgsql/,
  )?.[1] ?? "";
const writeSignature =
  migration.match(
    /create or replace function public\.registrar_evento_auditoria\(([\s\S]*?)\)\nreturns uuid/,
  )?.[1] ?? "";

describe("Auditoría migration security invariants", () => {
  it("deriva identidad y rol desde una cuenta institucional activa", () => {
    expect(migration).toContain(
      "create or replace function public.registrar_evento_auditoria",
    );
    expect(migration).toContain("security definer");
    expect(migration).toContain("set search_path = ''");
    expect(migration).toContain("v_actor_id uuid := (select auth.uid())");
    expect(migration).toContain("from public.perfiles_usuario as p");
    expect(migration).toContain("p.estado_cuenta = 'activo'");
    expect(migration).toContain("p.seguridad_status = 'active'");
    expect(migration).not.toContain("auth.jwt()");

    expect(writeSignature).not.toContain("usuario");
    expect(writeSignature).not.toContain("email");
    expect(writeSignature).not.toContain("rol");
    expect(writeSignature).not.toContain("old_values");
    expect(writeSignature).not.toContain("new_values");
  });

  it("restringe lectura a supervisión activa y revoca el acceso directo", () => {
    expect(migration).toContain(
      "create or replace function public.consultar_caja_negra",
    );
    expect(migration).toContain("'directivo'");
    expect(migration).toContain("'subdireccion'");
    expect(migration).toContain("'developer'");
    expect(migration).toContain("'system_admin'");
    expect(migration).toContain(
      "revoke all on table public.auditoria from public, anon, authenticated",
    );
    expect(migration).toContain(
      "grant execute on function public.consultar_caja_negra",
    );
    expect(migration).toContain(
      "grant execute on function public.registrar_evento_auditoria",
    );
    expect(migration).not.toContain(
      "grant select on table public.auditoria to authenticated",
    );
  });

  it("no devuelve payloads sensibles y sí estructura propósito y alumno", () => {
    expect(readContract).toContain("proposito text");
    expect(readContract).toContain("alumno_id uuid");
    expect(readContract).toContain("alumno_nombre text");
    expect(readContract).toContain("origen text");
    expect(readContract).not.toContain("old_values");
    expect(readContract).not.toContain("new_values");
    expect(readContract).not.toContain("ip_address");
    expect(readContract).not.toContain("user_agent");
  });

  it("mantiene el trigger automático sin duplicar valores sensibles", () => {
    expect(migration).toContain(
      "create or replace function public.fn_automatic_audit_trigger",
    );
    expect(migration).toContain("'campos_afectados'");
    expect(migration).toContain("'contenido_sensible_omitido'");
    expect(migration).toContain("old_values,\n    new_values");
    expect(migration).toContain(
      "null,\n    jsonb_build_object(\n      'campos_afectados'",
    );
    expect(migration).toContain("'trigger'");
  });

  it("revoca helpers legados que permiten suplantar identidad", () => {
    expect(migration).toContain(
      "revoke all on function public.registrar_auditoria_sase",
    );
    expect(migration).toContain(
      "revoke all on function public.log_audit",
    );
    expect(migration).toContain(
      "'legacy_no_verificado:' || left(coalesce(aa.rol, 'sin_rol'), 50)",
    );
    expect(migration).toContain(
      "revoke all on table public.auditoria_accesos",
    );
    expect(migration).toContain(
      "from public.auditoria_accesos as aa",
    );
  });

  it("indexa los filtros y la paginación institucional", () => {
    expect(migration).toContain("idx_auditoria_fecha_id_desc");
    expect(migration).toContain("idx_auditoria_rol_fecha");
    expect(migration).toContain("idx_auditoria_tabla_fecha");
    expect(migration).toContain("idx_auditoria_alumno_fecha");
  });
});
