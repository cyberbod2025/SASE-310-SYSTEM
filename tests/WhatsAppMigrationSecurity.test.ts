import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/20260724114430_notificaciones_tutores_confiables.sql",
  ),
  "utf8",
).toLowerCase();
const compact = migration.replace(/\s+/g, " ");
const tableDefinition =
  migration.match(
    /create table public\.notificaciones_whatsapp \(([\s\S]*?)\n\);/,
  )?.[1] || "";

describe("Notificaciones a tutores - invariantes SQL", () => {
  it("persiste estados mínimos sin conservar teléfono ni contenido completo", () => {
    expect(tableDefinition).toContain("destinatario_ultimos4");
    expect(tableDefinition).not.toContain("destinatario text");
    expect(tableDefinition).not.toContain("telefono");
    expect(tableDefinition).not.toContain("mensaje text");
    expect(tableDefinition).toContain(
      "pendiente', 'enviado', 'simulado', 'fallido",
    );
  });

  it("protege la tabla con RLS y reserva las escrituras a funciones de servidor", () => {
    expect(compact).toContain(
      "alter table public.notificaciones_whatsapp enable row level security;",
    );
    expect(compact).toContain(
      "revoke all on public.notificaciones_whatsapp from anon, authenticated;",
    );
    expect(compact).toContain(
      "grant select on public.notificaciones_whatsapp to authenticated;",
    );
    expect(compact).toContain(
      ") from public, anon, authenticated; grant execute on function public.iniciar_notificacion_whatsapp(",
    );
    expect(compact).toContain(
      ") to service_role; revoke all on function public.resolver_notificacion_whatsapp(",
    );
    expect(compact).toContain(
      ") from public, anon, authenticated; grant execute on function public.resolver_notificacion_whatsapp(",
    );
  });

  it("deriva actor, alumno, tutor e incidencia desde fuentes institucionales", () => {
    expect(migration).toContain("from public.perfiles_usuario as perfil");
    expect(migration).toContain("perfil.estado_cuenta = 'activo'");
    expect(migration).toContain("perfil.seguridad_status = 'active'");
    expect(migration).toContain("from public.incidencias as incidencia");
    expect(migration).toContain(
      "join public.alumnos as alumno on alumno.id = incidencia.alumno_id",
    );
    expect(migration).toContain("alumno.datos_tutor ->> 'phoneprimary'");
  });

  it("marca la incidencia únicamente cuando el proveedor confirmó la entrega", () => {
    expect(compact).toMatch(
      /if v_estado = 'enviado' then update public\.incidencias set notificado_whatsapp = true/,
    );
    expect(compact).not.toMatch(
      /if v_estado = 'simulado' then update public\.incidencias/,
    );
    expect(compact).not.toMatch(
      /if v_estado = 'fallido' then update public\.incidencias/,
    );
  });

  it("audita solicitud y resolución con propósito, alumno y origen", () => {
    expect(migration).toContain(
      "'notificacion_whatsapp_solicitada'",
    );
    expect(migration).toContain(
      "'notificacion_whatsapp_' || v_estado",
    );
    expect(migration).toContain("id_registro_objetivo");
    expect(migration).toContain("alumno_id");
    expect(migration).toContain("proposito");
    expect(migration).toContain("'servidor'");
  });
});
