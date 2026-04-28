import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../supabase/client";
import { UserRole } from "../../types";
import type { SecurityDashboardSnapshot } from "../../types";
import { canAccessSecurityDashboard } from "../../utils/securityDashboardAccess";

export const useSecurityDashboardSlice = (currentUserRole: UserRole) => {
  const [securityDashboard, setSecurityDashboard] =
    useState<SecurityDashboardSnapshot | null>(null);
  const [securityDashboardLoading, setSecurityDashboardLoading] = useState(false);
  const [securityDashboardError, setSecurityDashboardError] = useState<string | null>(null);
  const canViewSecurityDashboard = canAccessSecurityDashboard(currentUserRole);

  const fetchSecurityDashboard = useCallback(async () => {
    if (!canViewSecurityDashboard) {
      setSecurityDashboard(null);
      setSecurityDashboardError(null);
      return;
    }

    setSecurityDashboardLoading(true);
    setSecurityDashboardError(null);

    const { data, error } = await supabase.rpc(
      "get_security_dashboard_snapshot" as any,
    );

    if (error) {
      console.error("Error loading security dashboard", error);
      setSecurityDashboard(null);
      setSecurityDashboardError("No se pudo cargar el tablero de seguridad.");
      setSecurityDashboardLoading(false);
      return;
    }

    setSecurityDashboard(data as SecurityDashboardSnapshot);
    setSecurityDashboardLoading(false);
  }, [canViewSecurityDashboard]);

  useEffect(() => {
    void fetchSecurityDashboard();
  }, [fetchSecurityDashboard]);

  return {
    securityDashboard,
    securityDashboardLoading,
    securityDashboardError,
    canViewSecurityDashboard,
    fetchSecurityDashboard,
  };
};
