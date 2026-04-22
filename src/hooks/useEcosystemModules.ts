import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../supabase/client";
import { useAuth } from "../components/AuthProvider";
import {
  ECOSYSTEM_MODULE_UI,
  EcosystemModuleKey,
  getEcosystemModuleUiByAppModule,
  isEcosystemModuleKey,
} from "../config/ecosystemModuleUi";
import { AppModule } from "../types";

type VisibleModuleRow = {
  id: string;
  key: string;
  name: string;
  is_active: boolean;
  created_at: string;
};

export type EcosystemModuleDescriptor = VisibleModuleRow & {
  key: EcosystemModuleKey;
  appModule: AppModule;
  icon: string;
  accentClass: string;
  orbitColor: string;
  launchSubtitle: string;
  deniedMessage: string;
  description: string;
};

export const useEcosystemModules = () => {
  const { session } = useAuth();
  const [rows, setRows] = useState<VisibleModuleRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadModules = useCallback(async () => {
    if (!session) {
      setRows([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.rpc(
      "get_modulos_ecosistema_visibles",
    );

    if (error) {
      console.error("Error loading ecosystem modules", error);
      setRows([]);
      setLoading(false);
      return;
    }

    setRows(Array.isArray(data) ? (data as VisibleModuleRow[]) : []);
    setLoading(false);
  }, [session]);

  useEffect(() => {
    loadModules();
  }, [loadModules]);

  const ecosystemModules = useMemo<EcosystemModuleDescriptor[]>(() => {
    return rows.flatMap((row) => {
      if (!isEcosystemModuleKey(row.key)) return [];

      const ui = ECOSYSTEM_MODULE_UI[row.key];
      return [
        {
          ...row,
          key: row.key,
          appModule: ui.appModule,
          icon: ui.icon,
          accentClass: ui.accentClass,
          orbitColor: ui.orbitColor,
          launchSubtitle: ui.launchSubtitle,
          deniedMessage: ui.deniedMessage,
          description: ui.description,
        },
      ];
    });
  }, [rows]);

  const getModuleByKey = useCallback(
    (moduleKey: EcosystemModuleKey) =>
      ecosystemModules.find((module) => module.key === moduleKey) || null,
    [ecosystemModules],
  );

  const getModuleByAppModule = useCallback(
    (appModule: AppModule) =>
      ecosystemModules.find((module) => module.appModule === appModule) || null,
    [ecosystemModules],
  );

  const knownExternalAppModules = useMemo(
    () => Object.values(ECOSYSTEM_MODULE_UI).map((module) => module.appModule),
    [],
  );

  return {
    ecosystemModules,
    loading,
    refreshModules: loadModules,
    getModuleByKey,
    getModuleByAppModule,
    isKnownExternalModule: (appModule: AppModule) =>
      knownExternalAppModules.includes(appModule),
    getUiByAppModule: getEcosystemModuleUiByAppModule,
  };
};
