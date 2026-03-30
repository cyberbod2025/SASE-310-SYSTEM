import React, { useEffect, useState } from "react";
import { supabase } from "../../supabase/client";

const resolveIncidenciasCount = (row: Record<string, any> | null) => {
  if (!row) return 0;
  return (
    row.total_incidencias ??
    row.total ??
    row.incidencias ??
    row.cantidad ??
    0
  );
};

export const DashboardStats: React.FC = () => {
  const [incidenciasCount, setIncidenciasCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      const { data, error } = await supabase
        .from("v_incidentes_resumen" as any)
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error consultando v_incidentes_resumen", error);
        return;
      }

      if (isMounted) {
        setIncidenciasCount(resolveIncidenciasCount(data as any));
      }
    };

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white">
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
        Incidencias
      </p>
      <p className="mt-3 text-4xl font-black text-white">
        {incidenciasCount}
      </p>
      <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.3em] text-blue-400">
        Resumen institucional
      </p>
    </div>
  );
};
