const BLOCKED_ACCOUNT_STATUSES = new Set([
  "blocked",
  "bloqueado",
  "disabled",
  "deshabilitado",
  "inactive",
  "inactivo",
  "pending",
  "pendiente",
  "pending_validation",
  "pendiente_validacion",
  "revoked",
  "revocado",
  "suspended",
  "suspendido",
]);

const RESTRICTED_ACCOUNT_STATUSES = new Set([
  "restricted",
  "restringido",
]);

const normalizeStatus = (value: unknown) =>
  typeof value === "string"
    ? value.trim().toLowerCase().replace(/\s+/g, "_")
    : "";

export const getInstitutionalAccountStatus = (profile: any) => {
  const seguridadStatus = normalizeStatus(profile?.seguridad_status);
  const estatus = normalizeStatus(profile?.estatus);
  const estadoCuenta = normalizeStatus(profile?.estado_cuenta);
  const normalizedStatuses = [seguridadStatus, estatus, estadoCuenta].filter(Boolean);

  const blockedStatus = normalizedStatuses.find((status) =>
    BLOCKED_ACCOUNT_STATUSES.has(status),
  );
  const restrictedStatus = normalizedStatuses.find((status) =>
    RESTRICTED_ACCOUNT_STATUSES.has(status),
  );

  const blockedUntil = profile?.blocked_until ? new Date(profile.blocked_until) : null;
  const temporaryBlockActive =
    blockedUntil instanceof Date &&
    !Number.isNaN(blockedUntil.getTime()) &&
    blockedUntil.getTime() > Date.now();

  return {
    blocked: Boolean(blockedStatus || temporaryBlockActive),
    blockedUntil: temporaryBlockActive ? blockedUntil : null,
    reason: blockedStatus ?? (temporaryBlockActive ? "temporary_block" : null),
    restricted: Boolean(restrictedStatus),
    status: blockedStatus ?? restrictedStatus ?? normalizedStatuses[0] ?? null,
  };
};
