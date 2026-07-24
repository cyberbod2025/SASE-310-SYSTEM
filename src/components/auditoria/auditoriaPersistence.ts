import { supabase } from "../../supabase/client";

export type AuditCategory =
  | "CONSULTA"
  | "CREACION"
  | "ACTUALIZACION"
  | "ELIMINACION"
  | "OTRA";

export interface AuditEntry {
  id: string;
  userId: string | null;
  userEmail: string | null;
  userRole: string | null;
  actionType: string;
  actionCategory: AuditCategory;
  actionDescription: string | null;
  targetTable: string | null;
  targetRecordId: string | null;
  purpose: string | null;
  studentId: string | null;
  studentName: string | null;
  origin: string;
  createdAt: string | null;
}

export interface AuditFilters {
  category?: AuditCategory | "";
  role?: string;
  table?: string;
  search?: string;
  from?: string;
  to?: string;
}

export interface AuditCursor {
  createdAt: string;
  id: string;
}

export interface AuditPage {
  entries: AuditEntry[];
  total: number;
  hasMore: boolean;
  nextCursor: AuditCursor | null;
}

export interface RegisterAuditEventInput {
  actionType: string;
  description: string;
  targetTable: string;
  targetRecordId?: string | null;
  purpose: string;
  studentId?: string | null;
}

const AUDIT_CATEGORIES = new Set<AuditCategory>([
  "CONSULTA",
  "CREACION",
  "ACTUALIZACION",
  "ELIMINACION",
  "OTRA",
]);

const nullableText = (value: unknown): string | null =>
  typeof value === "string" && value.trim() ? value : null;

const requiredText = (value: unknown, field: string): string => {
  const text = nullableText(value);
  if (!text) {
    throw new Error(`Supabase devolvió ${field} inválido en Caja Negra.`);
  }
  return text;
};

const mapAuditRow = (row: any): AuditEntry => {
  const category = requiredText(
    row?.categoria_accion,
    "una categoría",
  ) as AuditCategory;

  if (!AUDIT_CATEGORIES.has(category)) {
    throw new Error("Supabase devolvió una categoría desconocida en Caja Negra.");
  }

  return {
    id: requiredText(row?.id, "un identificador"),
    userId: nullableText(row?.usuario_id),
    userEmail: nullableText(row?.email_usuario),
    userRole: nullableText(row?.rol_usuario),
    actionType: requiredText(row?.tipo_accion, "un tipo de acción"),
    actionCategory: category,
    actionDescription: nullableText(row?.descripcion_accion),
    targetTable: nullableText(row?.tabla_objetivo),
    targetRecordId: nullableText(row?.id_registro_objetivo),
    purpose: nullableText(row?.proposito),
    studentId: nullableText(row?.alumno_id),
    studentName: nullableText(row?.alumno_nombre),
    origin: requiredText(row?.origen, "un origen"),
    createdAt: nullableText(row?.fecha),
  };
};

const requireInstitutionalSession = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.id) {
    throw new Error("La sesión institucional no está disponible.");
  }
};

export const loadAuditPage = async (
  filters: AuditFilters = {},
  cursor: AuditCursor | null = null,
  limit = 100,
): Promise<AuditPage> => {
  await requireInstitutionalSession();

  const { data, error } = await supabase.rpc("consultar_caja_negra", {
    p_limite: limit,
    p_cursor_fecha: cursor?.createdAt,
    p_cursor_id: cursor?.id,
    p_categoria: filters.category || undefined,
    p_rol: filters.role?.trim() || undefined,
    p_tabla: filters.table?.trim() || undefined,
    p_busqueda: filters.search?.trim() || undefined,
    p_desde: filters.from || undefined,
    p_hasta: filters.to || undefined,
  });

  if (error) throw error;
  if (!Array.isArray(data)) {
    throw new Error("Supabase no confirmó la consulta de Caja Negra.");
  }

  const entries = data.map(mapAuditRow);
  const totalRaw = data[0]?.total_filtrado;
  const total = Number.isFinite(Number(totalRaw))
    ? Math.max(0, Number(totalRaw))
    : entries.length;
  const lastEntry = entries.at(-1);
  const hasMore =
    entries.length === limit &&
    total > entries.length &&
    Boolean(lastEntry?.createdAt);

  return {
    entries,
    total,
    hasMore,
    nextCursor:
      hasMore && lastEntry?.createdAt
        ? { createdAt: lastEntry.createdAt, id: lastEntry.id }
        : null,
  };
};

export const registerAuditEvent = async (
  input: RegisterAuditEventInput,
): Promise<string> => {
  await requireInstitutionalSession();

  const { data, error } = await supabase.rpc(
    "registrar_evento_auditoria",
    {
      p_tipo_accion: input.actionType,
      p_descripcion: input.description,
      p_tabla_objetivo: input.targetTable,
      p_id_registro_objetivo: input.targetRecordId ?? "",
      p_proposito: input.purpose,
      p_alumno_id: input.studentId || undefined,
    },
  );

  if (error) throw error;
  if (typeof data !== "string" || !data.trim()) {
    throw new Error("Supabase no confirmó el registro de auditoría.");
  }

  return data;
};

const protectSpreadsheetCell = (value: string) =>
  /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;

const csvCell = (value: string | null) => {
  const safeValue = protectSpreadsheetCell(value ?? "");
  return `"${safeValue.replaceAll('"', '""')}"`;
};

export const buildAuditCsv = (entries: AuditEntry[]): string => {
  const headers = [
    "ID del evento",
    "Fecha",
    "Correo del actor",
    "Rol",
    "Categoría",
    "Acción",
    "Descripción",
    "Tabla",
    "Registro",
    "ID del alumno",
    "Alumno",
    "Propósito",
    "Origen",
  ];

  const rows = entries.map((entry) =>
    [
      entry.id,
      entry.createdAt ?? "NO_DOCUMENTADA",
      entry.userEmail ?? "SISTEMA",
      entry.userRole ?? "SISTEMA",
      entry.actionCategory,
      entry.actionType,
      entry.actionDescription,
      entry.targetTable,
      entry.targetRecordId,
      entry.studentId,
      entry.studentName,
      entry.purpose,
      entry.origin,
    ]
      .map((value) => csvCell(value))
      .join(","),
  );

  return `\uFEFF${headers.map(csvCell).join(",")}\r\n${rows.join("\r\n")}`;
};
