import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migrationPath = resolve(
  process.cwd(),
  "supabase/migrations/20260718181002_direccion_panorama_institucional.sql",
);
const migration = readFileSync(migrationPath, "utf8").toLowerCase();
const returnContract =
  migration.match(/returns table \(([\s\S]*?)\)\nlanguage plpgsql/)?.[1] ??
  "";

describe("Dirección migration security invariants", () => {
  it("autoriza únicamente roles directivos activos", () => {
    expect(migration).toContain(
      "create or replace function public.obtener_panorama_direccion",
    );
    expect(migration).toContain("security definer");
    expect(migration).toContain("set search_path = ''");
    expect(migration).toContain(
      "private.is_institutional_actor(array[",
    );
    expect(migration).toContain("'directivo'");
    expect(migration).toContain("'subdireccion'");
    expect(migration).toContain("'system_admin'");
    expect(migration).not.toContain("'developer'");
    expect(migration).not.toContain("service_role");
    expect(migration).toContain(
      "revoke all on function public.obtener_panorama_direccion",
    );
    expect(migration).toContain(
      "grant execute on function public.obtener_panorama_direccion",
    );
  });

  it("agrega todas las fuentes sin devolver contenido sensible", () => {
    expect(migration).toContain("from public.incidencias");
    expect(migration).toContain("from public.orientacion_casos");
    expect(migration).toContain("from public.seguimiento_social");
    expect(migration).toContain("from public.seguimiento_bap");
    expect(migration).toContain("from public.atenciones_medicas");

    expect(returnContract).not.toContain("diagnosis_private");
    expect(returnContract).not.toContain("diagnostico_clinico");
    expect(returnContract).not.toContain("sintomas");
    expect(returnContract).not.toContain("tratamiento");
    expect(returnContract).not.toContain("motivo_social");
    expect(returnContract).not.toContain("seguimiento_social_texto");
  });

  it("usa el semáforo persistido y reglas de prioridad transparentes", () => {
    expect(migration).toContain("a.puntaje_riesgo");
    expect(migration).toContain("a.estado_semaforo");
    expect(migration).toContain("coalesce(a.puntaje_riesgo, 0) >= 70");
    expect(migration).toContain("ori.prioridad in ('alta', 'critica')");
    expect(migration).toContain("ori.estado = 'escalado_direccion'");
    expect(migration).toContain("current_date");
    expect(migration).not.toContain("update public.alumnos");
    expect(migration).not.toContain("insert into public.incidencias");
  });

  it("audita la consulta agregada sin contenido sensible", () => {
    expect(migration).toContain("insert into public.auditoria");
    expect(migration).toContain("'panorama_direccion_consulta'");
    expect(migration).toContain(
      "jsonb_build_object('contenido_sensible', false)",
    );
  });
});
