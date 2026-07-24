import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migrationPath = resolve(
  process.cwd(),
  "supabase/migrations/20260724071618_aprobacion_personal_segura.sql",
);
const migration = readFileSync(migrationPath, "utf8").toLowerCase();
const compact = migration.replace(/\s+/g, " ");

describe("Aprobación de personal migration security invariants", () => {
  it("valida al aprobador institucional activo y seguro", () => {
    expect(migration).toContain("from public.perfiles_usuario as p");
    expect(migration).toContain("p.estado_cuenta = 'activo'");
    expect(migration).toContain("p.seguridad_status = 'active'");
    expect(migration).toContain(
      "p.rol in ('directivo', 'subdireccion', 'developer', 'system_admin')",
    );
    expect(migration).not.toContain("auth.jwt()");
    expect(migration).toContain(
      "'^[a-z0-9]+(\\.[a-z0-9]+)+@sase\\.mx$'",
    );
  });

  it("confirma perfil, solicitud y auditoría dentro de una función transaccional", () => {
    expect(migration).toContain(
      "create or replace function public.finalizar_aprobacion_personal",
    );
    expect(migration).toContain("security definer");
    expect(migration).toContain("set search_path = ''");
    expect(migration).toContain("for update");
    expect(migration).toContain("insert into public.perfiles_usuario");
    expect(migration).toContain("update public.solicitudes_alta_personal");
    expect(migration).toContain("insert into public.auditoria");
    expect(migration).toContain(
      "'autorizar y dejar trazabilidad del alta de personal institucional'",
    );
  });

  it("rechaza y audita en otra operación transaccional de servicio", () => {
    expect(migration).toContain(
      "create or replace function public.rechazar_solicitud_personal",
    );
    expect(migration).toContain(
      "'resolver y dejar trazabilidad del rechazo de acceso institucional'",
    );
    expect(migration).toContain("length(v_motivo) < 10");
  });

  it("expone las RPC solo a service_role", () => {
    expect(compact).toContain(
      "revoke all on function public.finalizar_aprobacion_personal(",
    );
    expect(compact).toContain(") from public, anon, authenticated;");
    expect(compact).toContain(
      "grant execute on function public.finalizar_aprobacion_personal(",
    );
    expect(compact).toContain(") to service_role;");
    expect(compact).toContain(
      "revoke all on function public.rechazar_solicitud_personal(",
    );
    expect(compact).not.toContain(
      ") to authenticated; grant execute on function public.finalizar_aprobacion_personal",
    );
  });

  it("cierra actualizaciones directas y conserva registro pendiente", () => {
    expect(compact).toContain(
      "revoke all on table public.solicitudes_alta_personal from anon, authenticated;",
    );
    expect(migration).toContain(
      'create policy "solicitudes nuevas quedan pendientes"',
    );
    expect(migration).toContain(
      'create policy "supervision activa consulta solicitudes"',
    );
    expect(migration).toContain(
      "(select private.puede_gestionar_personal())",
    );
    expect(migration).toContain("grant insert (");
    expect(migration).toContain(
      "grant select on public.solicitudes_alta_personal to authenticated",
    );
    expect(migration).not.toContain(
      "grant update on public.solicitudes_alta_personal",
    );
    expect(migration).not.toContain(
      "grant delete on public.solicitudes_alta_personal",
    );
  });

  it("deriva roles y permisos sin conceder cuentas técnicas", () => {
    expect(migration).toContain(
      "private.normalizar_rol_personal(solicitado.rol)",
    );
    expect(migration).toContain("private.combinar_permisos_personal(v_roles)");
    const normalizer =
      migration.match(
        /create or replace function private\.normalizar_rol_personal[\s\S]*?\$\$;/,
      )?.[0] ?? "";
    expect(normalizer).not.toContain("developer");
    expect(normalizer).not.toContain("system_admin");
  });
});
