// =====================================================
// SASE-310: Matriz de Permisos por Rol
// =====================================================

export interface PermisosSASE {
  can_view_names: boolean;
  can_register: boolean;
  can_edit: boolean;
  can_close: boolean;
  can_escalate: boolean;
  can_view_audit: boolean;
  can_approve_staff: boolean;
  can_assign_groups: boolean;
  can_view_sensitive: boolean;
  can_manage_system: boolean;
}

export const PERMISOS_POR_ROL: Record<string, PermisosSASE> = {
  directivo: {
    can_view_names: true,
    can_register: true,
    can_edit: true,
    can_close: true,
    can_escalate: true,
    can_view_audit: true,
    can_approve_staff: true,
    can_assign_groups: true,
    can_view_sensitive: true,
    can_manage_system: true,
  },
  subdireccion: {
    can_view_names: true,
    can_register: true,
    can_edit: true,
    can_close: true,
    can_escalate: true,
    can_view_audit: true,
    can_approve_staff: true,
    can_assign_groups: true,
    can_view_sensitive: true,
    can_manage_system: false,
  },
  docente: {
    can_view_names: false,
    can_register: true,
    can_edit: false,
    can_close: false,
    can_escalate: true,
    can_view_audit: false,
    can_approve_staff: false,
    can_assign_groups: false,
    can_view_sensitive: false,
    can_manage_system: false,
  },
  docente_tutor: {
    can_view_names: false,
    can_register: true,
    can_edit: true,
    can_close: true,
    can_escalate: true,
    can_view_audit: false,
    can_approve_staff: false,
    can_assign_groups: false,
    can_view_sensitive: false,
    can_manage_system: false,
  },
  prefectura: {
    can_view_names: false,
    can_register: true,
    can_edit: true,
    can_close: true,
    can_escalate: true,
    can_view_audit: false,
    can_approve_staff: false,
    can_assign_groups: false,
    can_view_sensitive: false,
    can_manage_system: false,
  },
  orientacion: {
    can_view_names: true,
    can_register: true,
    can_edit: true,
    can_close: false,
    can_escalate: true,
    can_view_audit: false,
    can_approve_staff: false,
    can_assign_groups: false,
    can_view_sensitive: true,
    can_manage_system: false,
  },
  trabajo_social: {
    can_view_names: true,
    can_register: true,
    can_edit: true,
    can_close: true,
    can_escalate: true,
    can_view_audit: false,
    can_approve_staff: false,
    can_assign_groups: false,
    can_view_sensitive: true,
    can_manage_system: false,
  },
  medico_escolar: {
    can_view_names: true,
    can_register: true,
    can_edit: true,
    can_close: false,
    can_escalate: true,
    can_view_audit: false,
    can_approve_staff: false,
    can_assign_groups: false,
    can_view_sensitive: true,
    can_manage_system: false,
  },
  promotora_lectura: {
    can_view_names: false,
    can_register: true,
    can_edit: true,
    can_close: false,
    can_escalate: false,
    can_view_audit: false,
    can_approve_staff: false,
    can_assign_groups: false,
    can_view_sensitive: false,
    can_manage_system: false,
  },
  secretaria: {
    can_view_names: true,
    can_register: true,
    can_edit: true,
    can_close: false,
    can_escalate: false,
    can_view_audit: false,
    can_approve_staff: false,
    can_assign_groups: false,
    can_view_sensitive: false,
    can_manage_system: false,
  },
  udeii: {
    can_view_names: true,
    can_register: true,
    can_edit: true,
    can_close: true,
    can_escalate: true,
    can_view_audit: false,
    can_approve_staff: false,
    can_assign_groups: false,
    can_view_sensitive: true,
    can_manage_system: false,
  },
  contralor: {
    can_view_names: false,
    can_register: false,
    can_edit: true,
    can_close: false,
    can_escalate: false,
    can_view_audit: true,
    can_approve_staff: false,
    can_assign_groups: false,
    can_view_sensitive: false,
    can_manage_system: false,
  },
  developer: {
    can_view_names: true,
    can_register: true,
    can_edit: true,
    can_close: true,
    can_escalate: true,
    can_view_audit: true,
    can_approve_staff: true,
    can_assign_groups: true,
    can_view_sensitive: true,
    can_manage_system: true,
  },
  system_admin: {
    can_view_names: true,
    can_register: true,
    can_edit: true,
    can_close: true,
    can_escalate: true,
    can_view_audit: true,
    can_approve_staff: true,
    can_assign_groups: true,
    can_view_sensitive: true,
    can_manage_system: true,
  },
  guest: {
    can_view_names: false,
    can_register: false,
    can_edit: false,
    can_close: false,
    can_escalate: false,
    can_view_audit: false,
    can_approve_staff: false,
    can_assign_groups: false,
    can_view_sensitive: false,
    can_manage_system: false,
  },
};

export function combinarPermisos(roles: string[]): PermisosSASE {
  const permisosBase: PermisosSASE = {
    can_view_names: false,
    can_register: false,
    can_edit: false,
    can_close: false,
    can_escalate: false,
    can_view_audit: false,
    can_approve_staff: false,
    can_assign_groups: false,
    can_view_sensitive: false,
    can_manage_system: false,
  };

  roles.forEach((rol) => {
    if (!rol) return;
    const permisos = PERMISOS_POR_ROL[rol.toLowerCase()];
    if (permisos) {
      Object.keys(permisosBase).forEach((key) => {
        const k = key as keyof PermisosSASE;
        if (permisos[k]) {
          permisosBase[k] = true;
        }
      });
    }
  });

  return permisosBase;
}

export function tienePermiso(
  alcances: PermisosSASE | null,
  permiso: keyof PermisosSASE,
): boolean {
  if (!alcances) return false;
  return alcances[permiso] === true;
}
