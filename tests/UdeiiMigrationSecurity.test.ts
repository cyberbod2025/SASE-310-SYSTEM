import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migrationPath = resolve(
  process.cwd(),
  "supabase/migrations/20260718172114_udeii_memoria_bap.sql",
);
const migration = readFileSync(migrationPath, "utf8").toLowerCase();

describe("UDEII migration security invariants", () => {
  it("keeps seguimiento_bap behind explicit grants and RLS", () => {
    expect(migration).toContain(
      "alter table public.seguimiento_bap enable row level security",
    );
    expect(migration).toContain(
      "revoke all on table public.seguimiento_bap",
    );
    expect(migration).toContain(
      "grant select on table public.seguimiento_bap",
    );
    expect(migration).not.toMatch(
      /grant\s+(?:select,\s*)?insert[^;]*public\.seguimiento_bap/,
    );
    expect(migration).not.toMatch(
      /grant\s+(?:select,\s*)?update[^;]*public\.seguimiento_bap/,
    );
  });

  it("authorizes the transactional RPC explicitly and fail-closed", () => {
    expect(migration).toContain(
      "create or replace function public.registrar_evento_bap",
    );
    expect(migration).toContain("security definer");
    expect(migration).toContain("set search_path = ''");
    expect(migration).toContain("v_actor uuid := (select auth.uid())");
    expect(migration).toContain(
      "private.is_institutional_actor(array[",
    );
    expect(migration).toContain(
      "revoke all on function public.registrar_evento_bap",
    );
    expect(migration).toContain(
      "grant execute on function public.registrar_evento_bap",
    );
    expect(migration).not.toContain("service_role");
  });

  it("records history and updates the current snapshot in one function body", () => {
    expect(migration).toContain("update public.alumnos as a");
    expect(migration).toContain(
      "insert into public.seguimiento_bap",
    );
    expect(migration).toContain("creado_por");
    expect(migration).toContain("v_actor");
  });
});

