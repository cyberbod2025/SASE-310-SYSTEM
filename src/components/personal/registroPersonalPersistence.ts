const CURP_PATTERN = /^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z][0-9]$/;
const INSTITUTIONAL_EMAIL_PATTERN =
  /^[a-z0-9]+(?:\.[a-z0-9]+)+@sase\.mx$/;
const CCT_SASE_310 = "09DES4310M";
const APPROVABLE_ROLES = new Set([
  "directivo",
  "subdireccion",
  "docente",
  "docente_tutor",
  "prefectura",
  "orientacion",
  "trabajo_social",
  "medico_escolar",
  "udeii",
  "promotora_lectura",
  "secretaria",
]);

export interface OfficialStaffVerification {
  match: boolean;
  role: string | null;
}

export interface StaffAccessRequest {
  rolDeclarado: string;
  turno: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  curp: string;
  correoInstitucional: string;
  cct: string;
  aceptaPrivacidad: boolean;
  aceptaEtica: boolean;
  aceptaAuditoria: boolean;
}

const normalizeName = (value: string): string =>
  value
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");

const normalizeRole = (role: unknown): string | null => {
  if (typeof role !== "string") return null;
  const normalized = role.trim().toLowerCase();
  if (!APPROVABLE_ROLES.has(normalized)) return null;
  return normalized;
};

export const verifyOfficialStaff = async (
  fullNameInput: string,
  alternateFullNameInput?: string,
): Promise<OfficialStaffVerification> => {
  const fullName = normalizeName(fullNameInput);
  const alternateFullName = alternateFullNameInput
    ? normalizeName(alternateFullNameInput)
    : undefined;
  if (fullName.length < 4 || fullName.length > 200) {
    throw new Error("El nombre institucional no es válido.");
  }
  if (alternateFullName && alternateFullName.length > 200) {
    throw new Error("El nombre institucional no es válido.");
  }

  const response = await fetch("/api/auth/verify-staff", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fullName, alternateFullName }),
  });

  if (!response.ok) {
    throw new Error("No se pudo validar la nómina oficial.");
  }

  const payload = (await response.json()) as {
    match?: unknown;
    role?: unknown;
  };
  if (payload.match !== true) return { match: false, role: null };

  const role = normalizeRole(payload.role);
  if (!role) {
    throw new Error("La función registrada en nómina no admite alta pública.");
  }

  return { match: true, role };
};

export const submitStaffAccessRequest = async (
  request: StaffAccessRequest,
): Promise<{ folio: string }> => {
  const declaredRole = normalizeRole(request.rolDeclarado);
  const curp = request.curp.trim().toUpperCase();
  const correoInstitucional = request.correoInstitucional.trim().toLowerCase();
  const nombres = request.nombres.trim().toUpperCase();
  const apellidoPaterno = request.apellidoPaterno.trim().toUpperCase();
  const apellidoMaterno = request.apellidoMaterno.trim().toUpperCase();
  const turno = request.turno.trim().toLowerCase();

  if (!declaredRole) {
    throw new Error("La función seleccionada no admite alta pública.");
  }
  if (!nombres || !apellidoPaterno) {
    throw new Error("Nombre y apellido paterno son obligatorios.");
  }
  if (!CURP_PATTERN.test(curp)) {
    throw new Error("El formato de CURP no es válido.");
  }
  if (!INSTITUTIONAL_EMAIL_PATTERN.test(correoInstitucional)) {
    throw new Error(
      "Use un correo institucional con formato nombre.apellido@sase.mx.",
    );
  }
  if (request.cct.trim().toUpperCase() !== CCT_SASE_310) {
    throw new Error("La CCT no corresponde a la Secundaria 310.");
  }
  if (!["matutino", "vespertino", "mixto"].includes(turno)) {
    throw new Error("El turno seleccionado no es válido.");
  }
  if (
    !request.aceptaPrivacidad ||
    !request.aceptaEtica ||
    !request.aceptaAuditoria
  ) {
    throw new Error("Debe aceptar todos los términos y avisos.");
  }

  const response = await fetch("/api/auth/register-staff", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      rolDeclarado: declaredRole,
      turno,
      nombres,
      apellidoPaterno,
      apellidoMaterno,
      curp,
      correoInstitucional,
      cct: CCT_SASE_310,
      aceptaPrivacidad: true,
      aceptaEtica: true,
      aceptaAuditoria: true,
    }),
  });

  const payload = (await response.json().catch(() => null)) as {
    folio?: unknown;
    estado?: unknown;
    error?: unknown;
  } | null;
  if (!response.ok) {
    throw new Error(
      typeof payload?.error === "string"
        ? payload.error
        : "No se pudo guardar la solicitud de acceso.",
    );
  }
  if (
    typeof payload?.folio !== "string" ||
    payload.estado !== "PENDIENTE"
  ) {
    throw new Error("El servidor no confirmó la solicitud de acceso.");
  }

  return { folio: payload.folio };
};
