import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/20260724072959_registro_personal_minimo.sql",
  ),
  "utf8",
).toLowerCase();
const compact = migration.replace(/\s+/g, " ");

describe("Registro de personal mínimo - invariantes SQL", () => {
  it("limpia secretos conocidos y bloquea claves sensibles a cualquier profundidad", () => {
    expect(migration).toContain("metadata = metadata - array[");
    expect(migration).toContain("'preguntas_seguridad'");
    expect(migration).toContain("'fecha_nacimiento'");
    expect(migration).toContain("'rfc_parcial'");
    expect(migration).toContain("'matricula'");
    expect(migration).toContain("solicitudes_metadata_sin_secretos");
    expect(migration).toContain("validate constraint");
    expect(migration).toContain("security_questions?");
  });

  it("revoca insert directo y expone la RPC solo a service_role", () => {
    expect(compact).toContain(
      "revoke insert on public.solicitudes_alta_personal from anon, authenticated;",
    );
    expect(compact).toContain(
      "revoke insert ( rol_solicitado, turno, nombres,",
    );
    expect(compact).toContain(
      ") on public.solicitudes_alta_personal from anon, authenticated;",
    );
    expect(compact).toContain(
      "create or replace function public.registrar_solicitud_personal(",
    );
    expect(migration).toContain("security definer");
    expect(migration).toContain("set search_path = ''");
    expect(compact).toContain(
      ") from public, anon, authenticated; grant execute on function public.registrar_solicitud_personal(",
    );
    expect(compact).toContain(") to service_role;");
    expect(compact).not.toContain(") to anon;");
    expect(compact).not.toContain(") to authenticated;");
    expect(
      compact.match(
        /grant execute on function public\.registrar_solicitud_personal\([\s\S]*?\) to service_role;/,
      ),
    ).not.toBeNull();
  });

  it("deriva el rol desde nómina y rechaza discrepancias", () => {
    expect(migration).toContain("from public.personal_oficial as oficial");
    expect(migration).toContain("oficial.full_name_normalized = any");
    expect(migration).toContain("oficial.is_active");
    expect(migration).toContain(
      "private.normalizar_rol_personal(oficial.role)",
    );
    expect(migration).toContain("v_rol_declarado <> v_rol_oficial");
    expect(migration).toContain(
      "la función seleccionada no coincide con la nómina oficial",
    );
  });

  it("valida correo, genera folio en base y audita la creación pendiente", () => {
    expect(migration).toContain(
      "'^[a-z0-9]+(\\.[a-z0-9]+)+@sase\\.mx$'",
    );
    expect(migration).toContain("pg_catalog.gen_random_uuid()");
    expect(migration).toContain("'folio_solicitud', v_folio");
    expect(migration).toContain("'estado', 'pendiente'");
    expect(migration).toContain("insert into public.auditoria");
    expect(migration).toContain("id_registro_objetivo");
    expect(migration).toContain("new_values");
    expect(migration).toContain("'solicitud_alta_personal_creada'");
    expect(migration).toContain("'servidor'");
  });
});
