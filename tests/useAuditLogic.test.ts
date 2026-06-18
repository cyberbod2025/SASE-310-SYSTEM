import { describe, expect, it, vi, beforeEach } from "vitest";
import { useAuditLogic } from "../src/store/slices/useAuditLogic";
import { UserRole } from "../src/types";

const supabaseMocks = vi.hoisted(() => ({
  insert: vi.fn(),
  from: vi.fn(),
}));

vi.mock("../src/supabase/client", () => ({
  supabase: {
    from: supabaseMocks.from,
  },
}));

describe("useAuditLogic logAudit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabaseMocks.from.mockReturnValue({ insert: supabaseMocks.insert });
  });

  it("returns explicit success when Supabase insert succeeds", async () => {
    supabaseMocks.insert.mockResolvedValue({ error: null });

    const { logAudit } = useAuditLogic(
      { id: "user-1", email: "docente@sase.mx" },
      UserRole.DOCENTE,
    );

    const result = await logAudit(
      "CREACION",
      "Registro auditado",
      "incidencias",
      "row-1",
      "Alumno Protegido",
    );

    expect(result).toEqual({ success: true });
    expect(supabaseMocks.from).toHaveBeenCalledWith("auditoria");
    expect(supabaseMocks.insert).toHaveBeenCalled();
  });

  it("returns explicit error when Supabase insert fails", async () => {
    supabaseMocks.insert.mockResolvedValue({
      error: { message: "permission denied for table auditoria", code: "42501" },
    });

    const { logAudit } = useAuditLogic(
      { id: "user-1", email: "docente@sase.mx" },
      UserRole.DOCENTE,
    );

    const result = await logAudit(
      "CREACION",
      "Registro auditado",
      "incidencias",
      "row-1",
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe("permission denied for table auditoria");
  });
});
