import { useMemo } from "react";
import { useApp } from "../store";
import { UserRole, AppModule, PermisosSASE } from "../types";
import { PERMISOS_POR_ROL } from "../utils/permisos";

export const usePermissions = () => {
  const { currentUserRole, currentUserProfile } = useApp();

  // Obtener permisos base del rol
  const rolePermissions = useMemo(() => {
    const roleKey = (currentUserRole as string)?.toLowerCase();
    return (
      PERMISOS_POR_ROL[roleKey] ||
      PERMISOS_POR_ROL[UserRole.GUEST] ||
      PERMISOS_POR_ROL["guest"]
    );
  }, [currentUserRole]);

  // Combinar con alcances específicos del perfil si existen
  const permissions: PermisosSASE = useMemo(() => {
    if (currentUserProfile?.alcances) {
      return {
        ...rolePermissions,
        ...currentUserProfile.alcances,
      };
    }
    return rolePermissions;
  }, [rolePermissions, currentUserProfile]);

  const canAccessModule = (module: AppModule): boolean => {
    // Reglas de acceso por módulo
    switch (module) {
      case AppModule.BITACORA:
        return permissions.can_view_audit;
      case AppModule.APROBACIONES_PERSONAL:
        return permissions.can_approve_staff;
      case AppModule.SALUD:
        return [
          UserRole.MEDICO_ESCOLAR,
          UserRole.DIRECTIVO,
          UserRole.DEVELOPER,
        ].includes(currentUserRole);
      case AppModule.UDEII_TRACKER:
        return [
          UserRole.UDEII,
          UserRole.DIRECTIVO,
          UserRole.DEVELOPER,
        ].includes(currentUserRole);
      case AppModule.TRABAJO_SOCIAL_TRACKER:
        return [
          UserRole.TRABAJO_SOCIAL,
          UserRole.DIRECTIVO,
          UserRole.DEVELOPER,
        ].includes(currentUserRole);
      case AppModule.LECTURA_TRACKER:
        return [
          UserRole.PROMOTORA_LECTURA,
          UserRole.DIRECTIVO,
          UserRole.DEVELOPER,
        ].includes(currentUserRole);
      case AppModule.INSCRIPCIONES:
      case AppModule.ARCHIVO:
        return [
          UserRole.SECRETARIA,
          UserRole.DIRECTIVO,
          UserRole.SUBDIRECCION,
          UserRole.DEVELOPER,
        ].includes(currentUserRole);
      default:
        return true;
    }
  };

  return {
    permissions,
    canAccessModule,
    role: currentUserRole as UserRole,
  };
};
